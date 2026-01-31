import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecentFoodEntry, FavoriteFoodEntry } from '../models/FoodHistory';

const RECENT_FOODS_STORAGE_KEY = '@calory_tracker_recent_foods';
const FAVORITE_FOODS_STORAGE_KEY = '@calory_tracker_favorite_foods';
const MAX_RECENT_FOODS = 20;

interface FoodHistoryState {
  recentFoods: RecentFoodEntry[];
  favoriteFoods: FavoriteFoodEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: FoodHistoryState = {
  recentFoods: [],
  favoriteFoods: [],
  loading: false,
  error: null,
};

// Async thunks for Recent Foods
export const loadRecentFoods = createAsyncThunk(
  'foodHistory/loadRecentFoods',
  async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(RECENT_FOODS_STORAGE_KEY);
      if (jsonValue == null) {
        return [];
      }
      const recentFoods = JSON.parse(jsonValue);
      // Sort by lastUsedAt descending (most recent first)
      return recentFoods.sort((a: RecentFoodEntry, b: RecentFoodEntry) => b.lastUsedAt - a.lastUsedAt);
    } catch (e) {
      console.error('Failed to load recent foods:', e);
      return [];
    }
  }
);

export const addRecentFood = createAsyncThunk(
  'foodHistory/addRecentFood',
  async (entry: RecentFoodEntry, { getState }) => {
    const state = getState() as { foodHistory: FoodHistoryState };
    const currentRecent = state.foodHistory.recentFoods || [];

    // Remove existing entry with same foodId (deduplicate)
    const filtered = currentRecent.filter(item => item.foodId !== entry.foodId);

    // Add new entry at beginning (most recent)
    const updated = [entry, ...filtered];

    // Limit to MAX_RECENT_FOODS
    const limited = updated.slice(0, MAX_RECENT_FOODS);

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(RECENT_FOODS_STORAGE_KEY, JSON.stringify(limited));
    } catch (e) {
      console.error('Failed to save recent foods:', e);
    }

    return limited;
  }
);

export const clearRecentFoods = createAsyncThunk(
  'foodHistory/clearRecentFoods',
  async () => {
    try {
      await AsyncStorage.removeItem(RECENT_FOODS_STORAGE_KEY);
      return [];
    } catch (e) {
      console.error('Failed to clear recent foods:', e);
      throw e;
    }
  }
);

// Async thunks for Favorite Foods
export const loadFavoriteFoods = createAsyncThunk(
  'foodHistory/loadFavoriteFoods',
  async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(FAVORITE_FOODS_STORAGE_KEY);
      if (jsonValue == null) {
        return [];
      }
      const favoriteFoods = JSON.parse(jsonValue);
      // Sort by createdAt descending (newest first)
      return favoriteFoods.sort((a: FavoriteFoodEntry, b: FavoriteFoodEntry) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error('Failed to load favorite foods:', e);
      return [];
    }
  }
);

export const toggleFavoriteFood = createAsyncThunk(
  'foodHistory/toggleFavoriteFood',
  async (foodData: Omit<FavoriteFoodEntry, 'createdAt'>, { getState }) => {
    const state = getState() as { foodHistory: FoodHistoryState };
    const currentFavorites = state.foodHistory.favoriteFoods || [];

    // Check if already exists
    const existingIndex = currentFavorites.findIndex(f => f.foodId === foodData.foodId);

    let updated: FavoriteFoodEntry[];

    if (existingIndex !== -1) {
      // Remove favorite
      updated = currentFavorites.filter(f => f.foodId !== foodData.foodId);
    } else {
      // Add new favorite with createdAt timestamp
      const newFavorite: FavoriteFoodEntry = {
        ...foodData,
        createdAt: Date.now(),
      };
      updated = [newFavorite, ...currentFavorites];
    }

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(FAVORITE_FOODS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save favorite foods:', e);
    }

    return updated;
  }
);

export const removeFavoriteFood = createAsyncThunk(
  'foodHistory/removeFavoriteFood',
  async (foodId: string, { getState }) => {
    const state = getState() as { foodHistory: FoodHistoryState };
    const currentFavorites = state.foodHistory.favoriteFoods || [];

    const updated = currentFavorites.filter(f => f.foodId !== foodId);

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(FAVORITE_FOODS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save favorite foods:', e);
    }

    return updated;
  }
);

const foodHistorySlice = createSlice({
  name: 'foodHistory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load recent foods
      .addCase(loadRecentFoods.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadRecentFoods.fulfilled, (state, action) => {
        state.recentFoods = action.payload;
        state.loading = false;
      })
      .addCase(loadRecentFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load recent foods';
      })
      // Add recent food
      .addCase(addRecentFood.fulfilled, (state, action) => {
        state.recentFoods = action.payload;
      })
      // Clear recent foods
      .addCase(clearRecentFoods.fulfilled, (state, action) => {
        state.recentFoods = action.payload;
      })
      // Load favorite foods
      .addCase(loadFavoriteFoods.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFavoriteFoods.fulfilled, (state, action) => {
        state.favoriteFoods = action.payload;
        state.loading = false;
      })
      .addCase(loadFavoriteFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load favorite foods';
      })
      // Toggle favorite food
      .addCase(toggleFavoriteFood.fulfilled, (state, action) => {
        state.favoriteFoods = action.payload;
      })
      // Remove favorite food
      .addCase(removeFavoriteFood.fulfilled, (state, action) => {
        state.favoriteFoods = action.payload;
      });
  },
});

export default foodHistorySlice.reducer;
