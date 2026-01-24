import { configureStore } from '@reduxjs/toolkit';
import mealSlice from './mealSlice';
import goalSlice from './goalSlice';

export const store = configureStore({
  reducer: {
    meals: mealSlice,
    goals: goalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['meals/addMeal', 'meals/updateMeal'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export actions
export { loadMeals, addMeal, updateMeal, deleteMeal } from './mealSlice';
export { loadGoals, updateGoal, setDefaultGoal } from './goalSlice';
export { saveMeals } from './mealSlice';
export { saveGoals } from './goalSlice';
