import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '../models/Goal';
import * as Crypto from 'expo-crypto';

const GOALS_STORAGE_KEY = '@calory_tracker_goals';

interface GoalState {
  goals: Goal[];
  activeGoal: Goal | null;
  loading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  activeGoal: null,
  loading: false,
  error: null,
};

// Default goals
const createDefaultGoal = async (): Promise<Goal> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const id = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return {
    id,
    calorieTarget: 2000,
    sugarTarget: 50,
    proteinTarget: 150,
    carbTarget: 250,
    fatTarget: 65,
    startDate: new Date().toISOString(),
    isActive: true,
    warningsEnabled: true,
  };
};

// Async thunks
export const loadGoals = createAsyncThunk('goals/loadGoals', async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (jsonValue != null) {
      const goals = JSON.parse(jsonValue);
      const activeGoal = goals.find((g: Goal) => g.isActive) || null;
      return { goals, activeGoal };
    }
    return { goals: [], activeGoal: null };
  } catch (e) {
    console.error('Failed to load goals:', e);
    return { goals: [], activeGoal: null };
  }
});

export const saveGoals = createAsyncThunk(
  'goals/saveGoals',
  async (goals: Goal[]) => {
    try {
      const jsonValue = JSON.stringify(goals);
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, jsonValue);
      return goals;
    } catch (e) {
      console.error('Failed to save goals:', e);
      throw e;
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async (goal: Goal, { getState }) => {
    // Get current state and save to AsyncStorage
    const state = getState() as any;
    const goals = state.goals.goals || [];
    const index = goals.findIndex((g: Goal) => g.id === goal.id);

    let updatedGoals;
    if (index !== -1) {
      updatedGoals = goals.map((g: Goal, i: number) =>
        i === index ? goal : g
      );
    } else {
      updatedGoals = [...goals, goal];
    }

    try {
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
    } catch (e) {
      console.error('Failed to save goal:', e);
    }

    return goal;
  }
);

export const setDefaultGoal = createAsyncThunk('goals/setDefaultGoal', async (_, { getState }) => {
  const defaultGoal = await createDefaultGoal();

  // Save to AsyncStorage
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify([defaultGoal]));
  } catch (e) {
    console.error('Failed to save default goal:', e);
  }

  return defaultGoal;
});

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load goals
      .addCase(loadGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadGoals.fulfilled, (state, action) => {
        state.goals = action.payload.goals;
        state.activeGoal = action.payload.activeGoal;
        state.loading = false;
      })
      .addCase(loadGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load goals';
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (action.payload.isActive) {
          state.activeGoal = action.payload;
        }
      })
      // Set default goal
      .addCase(setDefaultGoal.fulfilled, (state, action) => {
        const newGoal = action.payload;
        state.goals = [newGoal];
        state.activeGoal = newGoal;
      });
  },
});

export default goalSlice.reducer;
