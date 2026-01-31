import { formatDistanceToNow } from 'date-fns';
import { RecentFoodEntry, FavoriteFoodEntry } from '../models/FoodHistory';

/**
 * Format a timestamp as a relative time string (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export const formatTimeAgo = (timestamp: number): string => {
  try {
    if (!timestamp || typeof timestamp !== 'number') {
      return 'just now';
    }
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'just now';
  }
};

/**
 * Check if a food is in the user's favorites
 * @param foodId - The food ID to check
 * @param favorites - Array of favorite food entries
 * @returns True if the food is favorited
 */
export const isFoodFavorite = (
  foodId: string,
  favorites: FavoriteFoodEntry[]
): boolean => {
  return favorites.some(f => f.foodId === foodId);
};

/**
 * Get a favorite food entry by food ID
 * @param foodId - The food ID to find
 * @param favorites - Array of favorite food entries
 * @returns The favorite entry or undefined
 */
export const getFavoriteById = (
  foodId: string,
  favorites: FavoriteFoodEntry[]
): FavoriteFoodEntry | undefined => {
  return favorites.find(f => f.foodId === foodId);
};
