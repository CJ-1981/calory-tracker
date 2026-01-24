import { FoodItem, Meal } from '../models/Meal';

export const calculateNutrition = (
  foodItem: Omit<FoodItem, 'foodId'>,
  quantity: number
): Omit<FoodItem, 'foodId'> => {
  const multiplier = quantity / foodItem.servingSize;
  return {
    name: foodItem.name,
    quantity,
    servingSize: foodItem.servingSize,
    servingUnit: foodItem.servingUnit,
    calories: Math.round(foodItem.calories * multiplier),
    sugar: Math.round(foodItem.sugar * multiplier * 10) / 10,
    protein: Math.round(foodItem.protein * multiplier * 10) / 10,
    carbs: Math.round(foodItem.carbs * multiplier * 10) / 10,
    fat: Math.round(foodItem.fat * multiplier * 10) / 10,
    notes: foodItem.notes,
  };
};

export const calculateMealTotals = (foods: FoodItem[]): {
  totalCalories: number;
  totalSugar: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
} => {
  return foods.reduce(
    (totals, food) => ({
      totalCalories: totals.totalCalories + food.calories,
      totalSugar: Math.round((totals.totalSugar + food.sugar) * 10) / 10,
      totalProtein: Math.round((totals.totalProtein + food.protein) * 10) / 10,
      totalCarbs: Math.round((totals.totalCarbs + food.carbs) * 10) / 10,
      totalFat: Math.round((totals.totalFat + food.fat) * 10) / 10,
    }),
    {
      totalCalories: 0,
      totalSugar: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    }
  );
};

export const calculateDailyTotals = (meals: Meal[]): {
  totalCalories: number;
  totalSugar: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
} => {
  return meals.reduce(
    (totals, meal) => ({
      totalCalories: totals.totalCalories + meal.totalCalories,
      totalSugar: Math.round((totals.totalSugar + meal.totalSugar) * 10) / 10,
      totalProtein: Math.round((totals.totalProtein + meal.totalProtein) * 10) / 10,
      totalCarbs: Math.round((totals.totalCarbs + meal.totalCarbs) * 10) / 10,
      totalFat: Math.round((totals.totalFat + meal.totalFat) * 10) / 10,
    }),
    {
      totalCalories: 0,
      totalSugar: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    }
  );
};
