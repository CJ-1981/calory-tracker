export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  sugar: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface Meal {
  id: string;
  date: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
  totalSugar: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  photoUri?: string;
  notes?: string;
  createdAt: number;
}

export interface DailyLog {
  id: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalSugar: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPreset {
  id: string;
  name: string;
  foods: FoodItem[];
  createdAt: string;
  mealType?: MealType;
}
