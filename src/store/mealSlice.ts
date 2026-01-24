import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, FoodItem } from '../models/Meal';
import * as Crypto from 'expo-crypto';
import type { RootState } from './index';

const MEALS_STORAGE_KEY = '@calory_tracker_meals';

interface MealState {
  meals: Meal[];
  loading: boolean;
  error: string | null;
}

const initialState: MealState = {
  meals: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadMeals = createAsyncThunk('meals/loadMeals', async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    console.log('Loading meals from storage:', jsonValue);
    if (jsonValue == null) {
      return [];
    }
    const meals = JSON.parse(jsonValue);
    // Filter out any null/invalid meals
    const validMeals = meals.filter((meal: any) => meal && meal.id && meal.date);
    console.log('Parsed meals:', meals);
    console.log('Valid meals after filter:', validMeals);

    // If we found invalid data, clean it up
    if (validMeals.length !== meals.length) {
      console.log('Found corrupted data, cleaning up...');
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(validMeals));
    }

    return validMeals;
  } catch (e) {
    console.error('Failed to load meals:', e);
    return [];
  }
});

export const saveMeals = createAsyncThunk('meals/saveMeals', async (meals: Meal[]) => {
  try {
    const jsonValue = JSON.stringify(meals);
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, jsonValue);
    return meals;
  } catch (e) {
    console.error('Failed to save meals:', e);
    throw e;
  }
});

export const addMeal = createAsyncThunk(
  'meals/addMeal',
  async (mealData: Omit<Meal, 'id' | 'createdAt'>, { getState }) => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const id = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    const newMeal: Meal = {
      ...mealData,
      id,
      createdAt: Date.now(),
    };

    console.log('Adding new meal:', newMeal);

    // Get current state and save to AsyncStorage
    const state = getState() as RootState;
    const updatedMeals = [...(state.meals.meals || []), newMeal];

    console.log('Saving meals to storage:', updatedMeals);

    try {
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
      console.log('Successfully saved to AsyncStorage');

      // Verify it was saved
      const saved = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
      console.log('Verified saved data:', saved);
    } catch (e) {
      console.error('Failed to save meal:', e);
    }

    return newMeal;
  }
);

export const updateMeal = createAsyncThunk(
  'meals/updateMeal',
  async (meal: Meal) => {
    return meal;
  }
);

export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (mealId: string) => {
    return mealId;
  }
);

const mealSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load meals
      .addCase(loadMeals.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMeals.fulfilled, (state, action) => {
        state.meals = action.payload;
        state.loading = false;
      })
      .addCase(loadMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load meals';
      })
      // Add meal
      .addCase(addMeal.fulfilled, (state, action) => {
        state.meals.push(action.payload);
      })
      // Update meal
      .addCase(updateMeal.fulfilled, (state, action) => {
        const index = state.meals.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.meals[index] = action.payload;
        }
      })
      // Delete meal
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.meals = state.meals.filter((m) => m.id !== action.payload);
      });
  },
});

export const selectMealsByDate = (state: RootState, date: string) => {
  if (!state.meals || !state.meals.meals) return [];
  return state.meals.meals.filter((meal) => meal && meal.date === date);
};

export const selectTodayMeals = (state: RootState) => {
  const today = new Date().toISOString().split('T')[0];
  return selectMealsByDate(state, today);
};

export default mealSlice.reducer;
