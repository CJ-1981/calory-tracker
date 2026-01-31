/**
 * Food History Models
 *
 * Types for tracking recently used foods and favorite foods
 * to improve food entry usability.
 */

/**
 * Recent food entry - tracks foods recently added by user
 * Maintains last-used timestamp and portion information
 */
export interface RecentFoodEntry {
  foodId: string;
  name: string;
  category: string;
  quantity: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  sugar: number;
  protein: number;
  carbs: number;
  fat: number;
  commonPortions: { name: string; size: number }[];
  lastUsedAt: number;  // Timestamp
  portionIndex: number;
}

/**
 * Favorite food entry - stores user's favorite foods
 * Maintains default portion and common portions for quick access
 */
export interface FavoriteFoodEntry {
  foodId: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  sugar: number;
  protein: number;
  carbs: number;
  fat: number;
  commonPortions: { name: string; size: number }[];
  createdAt: number;
  defaultPortionIndex: number;
}
