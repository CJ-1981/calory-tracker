import { configureStore } from '@reduxjs/toolkit';
import mealSlice from './mealSlice';
import goalSlice from './goalSlice';
import settingsSlice from './settingsSlice';
import presetSlice from './presetSlice';
import foodHistorySlice from './foodHistorySlice';
import type { DarkModePreference, FontSizeScale, SettingsState } from './settingsSlice';

// createSlice returns an object with a reducer property, while other slices might not
const settingsReducer = settingsSlice?.reducer || settingsSlice;

export const store = configureStore({
  reducer: {
    meals: mealSlice,
    goals: goalSlice,
    settings: settingsReducer,
    presets: presetSlice,
    foodHistory: foodHistorySlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'meals/addMeal',
          'meals/updateMeal',
          'presets/savePreset',
          'foodHistory/addRecentFood/fulfilled',
          'foodHistory/toggleFavoriteFood/fulfilled',
          'foodHistory/removeFavoriteFood/fulfilled',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export actions and types
export { loadMeals, addMeal, updateMeal, deleteMeal } from './mealSlice';
export { loadGoals, updateGoal, setDefaultGoal } from './goalSlice';
export { loadSettings, setDarkMode, setFontSize, FONT_SCALE_MULTIPLIERS } from './settingsSlice';
export { loadPresets, savePreset, deletePreset } from './presetSlice';
export {
  loadRecentFoods,
  addRecentFood,
  clearRecentFoods,
  loadFavoriteFoods,
  toggleFavoriteFood,
  removeFavoriteFood,
} from './foodHistorySlice';
export { saveMeals } from './mealSlice';
export { saveGoals } from './goalSlice';
export type { DarkModePreference, FontSizeScale, SettingsState };
