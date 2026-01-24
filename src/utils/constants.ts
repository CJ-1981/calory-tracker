export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
] as const;

export const SERVING_UNITS = [
  { value: 'g', label: 'Grams' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'cup', label: 'Cups' },
  { value: 'oz', label: 'Ounces' },
  { value: 'piece', label: 'Pieces' },
  { value: 'tbsp', label: 'Tablespoons' },
  { value: 'tsp', label: 'Teaspoons' },
] as const;

export const DEFAULT_GOALS = {
  calories: 2000,
  sugar: 50,
  protein: 150,
  carbs: 250,
  fat: 65,
};

export const WARNING_THRESHOLDS = {
  warning: 0.8, // 80%
  danger: 1.0, // 100%
  mealSpike: 0.4, // 40% of daily in one meal
};
