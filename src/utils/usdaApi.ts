interface USDEFood {
  fdcId: string;
  description: string;
  foodNutrients: Array<{
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  brandOwner?: string;
  dataType: string;
}

interface USDFoodSearchResponse {
  foods: Array<{
    fdcId: string;
    description: string;
    brandOwner?: string;
    dataType: string;
    foodNutrients?: Array<{
      nutrientName: string;
      value: number;
      unitName: string;
    }>;
  }>;
}

interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  sugar: number;
  protein: number;
  carbs: number;
  fat: number;
  commonPortions: Array<{
    name: string;
    size: number;
  }>;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

// USDA API Key - Get your free key at https://api.nal.usda.gov/
const USDA_API_STORAGE_KEY = '@calory_tracker_usda_api_key';
let cachedApiKey: string | null = null;

/**
 * Get the USDA API key from AsyncStorage
 */
const getApiKey = async (): Promise<string> => {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  try {
    const key = await AsyncStorage.getItem(USDA_API_STORAGE_KEY);
    cachedApiKey = key;
    return key || 'DEMO_KEY';
  } catch (error) {
    console.error('Error reading USDA API key from storage:', error);
    return 'DEMO_KEY';
  }
};

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// Nutrient IDs from USDA
const NUTRIENT_IDS = {
  energy: '1008', // Energy (kcal)
  protein: '1003',
  carbs: '1005',
  fat: '1004',
  sugars: '2000',
};

/**
 * Search USDA FoodData Central for foods
 */
export const searchUSDAFoods = async (
  query: string,
  pageSize: number = 20
): Promise<FoodDatabaseItem[]> => {
  const apiKey = await getApiKey();

  if (apiKey === 'DEMO_KEY') {
    console.warn('USDA API key not set. Please get a free API key from https://api.nal.usda.gov/');
    return [];
  }

  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy,Branded&requireAllWords=true`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDFoodSearchResponse = await response.json();

    // The search endpoint only provides basic info, we need to fetch details for each food
    // For performance, fetch details for top results
    const foodsWithDetails = await Promise.all(
      data.foods.slice(0, 10).map(async (food) => {
        try {
          const detailResponse = await fetch(
            `${USDA_API_BASE}/food/${food.fdcId}?api_key=${apiKey}`
          );

          if (!detailResponse.ok) {
            // If detail fetch fails, return basic info without nutrients
            console.warn(`Could not fetch details for ${food.description}`);
            return usdaFoodToFoodItem(food);
          }

          const detailedFood: USDEFood = await detailResponse.json();
          return usdaFoodToFoodItem(detailedFood);
        } catch (error) {
          console.error(`Error fetching details for ${food.description}:`, error);
          return usdaFoodToFoodItem(food);
        }
      })
    );

    return foodsWithDetails;
  } catch (error) {
    console.error('Error searching USDA foods:', error);
    return [];
  }
};

/**
 * Get detailed nutrition info for a specific food by FDC ID
 */
export const getUSDAFoodDetails = async (fdcId: string): Promise<FoodDatabaseItem | null> => {
  const apiKey = await getApiKey();

  if (apiKey === 'DEMO_KEY') {
    console.warn('USDA API key not set.');
    return null;
  }

  try {
    const response = await fetch(
      `${USDA_API_BASE}/food/${fdcId}?api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const food: USDEFood = await response.json();
    return usdaFoodToFoodItem(food);
  } catch (error) {
    console.error('Error fetching USDA food details:', error);
    return null;
  }
};

/**
 * Transform USDA food format to our FoodDatabaseItem format
 */
const usdaFoodToFoodItem = (food: USDEFood | USDFoodSearchResponse['foods'][0]): FoodDatabaseItem => {
  // Use search results nutrients if available, otherwise they might be undefined
  const nutrients = food.foodNutrients || [];

  // Debug: log the food item structure
  console.log(`Processing food: ${food.description}, nutrients count: ${nutrients.length}`);
  if (nutrients.length > 0) {
    console.log('First nutrient:', nutrients[0]);
    console.log('Nutrient structure:', JSON.stringify(nutrients[0]));
  }

  // Helper function to find nutrient by ID or name
  // USDA API structure: { nutrient: { id, name, number }, amount, type: "FoodNutrient" }
  const findNutrient = (nutrientId: string, name: string): number => {
    const nutrient = nutrients.find((n: any) => {
      // Check nested nutrient object for ID
      if (n.nutrient && n.nutrient.id && n.nutrient.id === nutrientId) return true;
      if (n.nutrient && n.nutrient.number && n.nutrient.number === nutrientId) return true;
      // Check nested nutrient object for name
      if (n.nutrient && n.nutrient.name && n.nutrient.name.toLowerCase().includes(name.toLowerCase())) return true;
      return false;
    });
    // USDA API uses 'amount' not 'value'
    const value = nutrient?.amount || nutrient?.value || 0;
    if (value > 0) {
      console.log(`Found ${name}: ${value} (from nutrient: ${nutrient?.nutrient?.name})`);
    }
    return value;
  };

  // Extract nutrients with multiple fallback names
  let calories = findNutrient(NUTRIENT_IDS.energy, 'Energy');
  if (calories === 0) {
    calories = nutrients.find((n: any) =>
      n.nutrient && n.nutrient.name && (
        n.nutrient.name.toLowerCase().includes('energy') ||
        n.nutrient.name.toLowerCase().includes('calories') ||
        n.nutrient.name.toLowerCase().includes('kilocalories')
      )
    )?.amount || 0;
  }

  const protein = findNutrient(NUTRIENT_IDS.protein, 'Protein') ||
    nutrients.find((n: any) =>
      n.nutrient && n.nutrient.name && n.nutrient.name.toLowerCase().includes('protein')
    )?.amount || 0;

  const carbs = findNutrient(NUTRIENT_IDS.carbs, 'Carbohydrate') ||
    nutrients.find((n: any) =>
      n.nutrient && n.nutrient.name && n.nutrient.name.toLowerCase().includes('carbohydrate')
    )?.amount || 0;

  const fat = findNutrient(NUTRIENT_IDS.fat, 'Total lipid (fat)') ||
    nutrients.find((n: any) =>
      n.nutrient && n.nutrient.name && (
        n.nutrient.name.toLowerCase().includes('lipid') ||
        n.nutrient.name.toLowerCase().includes('fat')
      )
    )?.amount || 0;

  const sugars = findNutrient(NUTRIENT_IDS.sugars, 'Sugars') ||
    nutrients.find((n: any) =>
      n.nutrient && n.nutrient.name && n.nutrient.name.toLowerCase().includes('sugars')
    )?.amount || 0;

  console.log(`Final nutrients for ${food.description}: calories=${calories}, protein=${protein}, carbs=${carbs}, fat=${fat}`);

  // Determine category based on description
  const category = categorizeFood(food.description);

  return {
    id: `usda-${food.fdcId}`,
    name: food.description,
    category,
    servingSize: 100,
    servingUnit: 'g',
    calories: Math.round(calories),
    sugar: Math.round(sugars * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    commonPortions: [
      { name: '1 serving', size: 100 },
      { name: '1 cup', size: 250 },
      { name: '1/2 cup', size: 125 },
    ],
  };
};

/**
 * Simple categorization based on food description
 */
const categorizeFood = (description: string): string => {
  const desc = description.toLowerCase();

  // Check for keywords
  if (desc.includes('fruit') || desc.includes('apple') || desc.includes('banana') || desc.includes('orange')) {
    return 'Fruits';
  }
  if (desc.includes('vegetable') || desc.includes('broccoli') || desc.includes('carrot') || desc.includes('salad')) {
    return 'Vegetables';
  }
  if (desc.includes('chicken') || desc.includes('beef') || desc.includes('pork') || desc.includes('fish') || desc.includes('salmon')) {
    return 'Proteins';
  }
  if (desc.includes('bread') || desc.includes('rice') || desc.includes('pasta') || desc.includes('cereal')) {
    return 'Grains & Starches';
  }
  if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt')) {
    return 'Dairy';
  }
  if (desc.includes('juice') || desc.includes('soda') || desc.includes('coffee') || desc.includes('water') || desc.includes('tea')) {
    return 'Beverages';
  }
  if (desc.includes('chip') || desc.includes('cookie') || desc.includes('candy') || desc.includes('chocolate')) {
    return 'Snacks & Sweets';
  }
  if (desc.includes('ice cream') || desc.includes('frozen') || desc.includes('yogurt')) {
    return 'Ice Cream & Frozen';
  }

  return 'Other';
};

/**
 * Check if USDA API is configured
 */
export const isUSDAApiConfigured = async (): Promise<boolean> => {
  const apiKey = await getApiKey();
  return apiKey !== 'DEMO_KEY';
};
