import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@calory_tracker_settings';

export type DarkModePreference = 'light' | 'dark' | 'system';
export type FontSizeScale = 'small' | 'medium' | 'large' | 'extraLarge';

export interface SettingsState {
  darkMode: DarkModePreference;
  fontSize: FontSizeScale;
  isLoaded: boolean;
  userName: string;
  dashboardPreferences: {
    trendsExpanded: boolean;
    macrosExpanded: boolean;
    summaryView: boolean;
  };
}

const FONT_SCALE_MULTIPLIERS: Record<FontSizeScale, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
  extraLarge: 1.3,
};

const initialState: SettingsState = {
  darkMode: 'system',
  fontSize: 'medium',
  isLoaded: false,
  userName: '',
  dashboardPreferences: {
    trendsExpanded: true,
    macrosExpanded: true,
    summaryView: false,
  },
};

// Async thunk to load settings from AsyncStorage
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        return {
          darkMode: settings.darkMode || 'system',
          fontSize: settings.fontSize || 'medium',
          userName: settings.userName || '',
          dashboardPreferences: settings.dashboardPreferences || {
            trendsExpanded: true,
            macrosExpanded: true,
            summaryView: false,
          },
        };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return {
      darkMode: 'system' as DarkModePreference,
      fontSize: 'medium' as FontSizeScale,
      userName: '',
      dashboardPreferences: {
        trendsExpanded: true,
        macrosExpanded: true,
        summaryView: false,
      },
    };
  }
);

// Async thunk to save settings to AsyncStorage
const saveSettingsToStorage = async (settings: Partial<SettingsState>) => {
  try {
    const currentSettingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    const currentSettings = currentSettingsJson ? JSON.parse(currentSettingsJson) : {};
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<DarkModePreference>) => {
      state.darkMode = action.payload;
      saveSettingsToStorage({ darkMode: action.payload });
    },
    setFontSize: (state, action: PayloadAction<FontSizeScale>) => {
      state.fontSize = action.payload;
      saveSettingsToStorage({ fontSize: action.payload });
    },
    setDashboardPreferences: (state, action: PayloadAction<Partial<SettingsState['dashboardPreferences']>>) => {
      state.dashboardPreferences = { ...state.dashboardPreferences, ...action.payload };
      saveSettingsToStorage({ dashboardPreferences: state.dashboardPreferences });
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
      saveSettingsToStorage({ userName: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.darkMode = action.payload.darkMode;
      state.fontSize = action.payload.fontSize;
      state.userName = action.payload.userName;
      state.dashboardPreferences = action.payload.dashboardPreferences;
      state.isLoaded = true;
    });
  },
});

export const { setDarkMode, setFontSize, setDashboardPreferences, setUserName } = settingsSlice.actions;
export { FONT_SCALE_MULTIPLIERS };
export default settingsSlice;
