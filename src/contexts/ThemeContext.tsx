import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, SettingsState } from '../store';
import { setDarkMode, setFontSize, DarkModePreference, FontSizeScale, FONT_SCALE_MULTIPLIERS } from '../store/settingsSlice';
import { Colors } from '../theme';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof Colors.light;
  fontScale: number;
  fontSize: FontSizeScale;
  setDarkMode: (mode: DarkModePreference) => void;
  setFontSize: (size: FontSizeScale) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const dispatch = useDispatch();

  const settings = useSelector((state: RootState) => state.settings) as SettingsState;
  const darkModePreference = settings?.darkMode ?? 'system';
  const fontSizePreference = settings?.fontSize ?? 'medium';

  const [isDark, setIsDark] = useState(false);

  // Determine actual dark mode based on preference
  useEffect(() => {
    if (darkModePreference === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(darkModePreference === 'dark');
    }
  }, [darkModePreference, systemColorScheme]);

  const handleSetDarkMode = useCallback((mode: DarkModePreference) => {
    dispatch(setDarkMode(mode));
  }, [dispatch]);

  const handleSetFontSize = useCallback((size: FontSizeScale) => {
    dispatch(setFontSize(size));
  }, [dispatch]);

  const contextValue: ThemeContextType = useMemo(() => ({
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    fontScale: FONT_SCALE_MULTIPLIERS[fontSizePreference],
    fontSize: fontSizePreference,
    setDarkMode: handleSetDarkMode,
    setFontSize: handleSetFontSize,
  }), [isDark, fontSizePreference, handleSetDarkMode, handleSetFontSize]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
