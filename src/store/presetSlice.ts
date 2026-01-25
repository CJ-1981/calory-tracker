import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealPreset, FoodItem } from '../models/Meal';
import * as Crypto from 'expo-crypto';

const PRESETS_STORAGE_KEY = '@meal_presets';

interface PresetState {
  presets: MealPreset[];
  loading: boolean;
  error: string | null;
}

const initialState: PresetState = {
  presets: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadPresets = createAsyncThunk('presets/loadPresets', async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
    console.log('Loading presets from storage:', jsonValue);
    if (jsonValue == null) {
      return [];
    }
    const presets = JSON.parse(jsonValue);
    // Filter out any null/invalid presets
    const validPresets = presets.filter((preset: any) => preset && preset.id && preset.name);
    console.log('Parsed presets:', presets);
    console.log('Valid presets after filter:', validPresets);

    // If we found invalid data, clean it up
    if (validPresets.length !== presets.length) {
      console.log('Found corrupted data, cleaning up...');
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(validPresets));
    }

    return validPresets;
  } catch (e) {
    console.error('Failed to load presets:', e);
    return [];
  }
});

export const savePreset = createAsyncThunk(
  'presets/savePreset',
  async (presetData: Omit<MealPreset, 'id' | 'createdAt'>, { getState }) => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const id = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    const newPreset: MealPreset = {
      ...presetData,
      id,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving new preset:', newPreset);

    // Get current state and save to AsyncStorage
    const state = getState() as { presets: PresetState };
    const updatedPresets = [...(state.presets.presets || []), newPreset];

    console.log('Saving presets to storage:', updatedPresets);

    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      console.log('Successfully saved preset to AsyncStorage');

      // Verify it was saved
      const saved = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      console.log('Verified saved data:', saved);
    } catch (e) {
      console.error('Failed to save preset:', e);
      throw e;
    }

    return newPreset;
  }
);

export const deletePreset = createAsyncThunk(
  'presets/deletePreset',
  async (presetId: string, { getState }) => {
    console.log('Deleting preset:', presetId);

    // Get current state
    const state = getState() as { presets: PresetState };
    const updatedPresets = state.presets.presets.filter((p) => p.id !== presetId);

    console.log('Updated presets after delete:', updatedPresets);

    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      console.log('Successfully deleted preset from AsyncStorage');
    } catch (e) {
      console.error('Failed to delete preset:', e);
      throw e;
    }

    return presetId;
  }
);

const presetSlice = createSlice({
  name: 'presets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load presets
      .addCase(loadPresets.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPresets.fulfilled, (state, action) => {
        state.presets = action.payload;
        state.loading = false;
      })
      .addCase(loadPresets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load presets';
      })
      // Save preset
      .addCase(savePreset.pending, (state) => {
        state.loading = true;
      })
      .addCase(savePreset.fulfilled, (state, action) => {
        state.presets.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(savePreset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save preset';
      })
      // Delete preset
      .addCase(deletePreset.fulfilled, (state, action) => {
        state.presets = state.presets.filter((p) => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deletePreset.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete preset';
      });
  },
});

export default presetSlice.reducer;
