import { DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { useEffect, useMemo } from 'react';

import { store } from '../src/store';
import { loadMeals, loadGoals, loadSettings } from '../src/store';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { Colors } from '../src/theme';

// Initialize data on app load
function DataInitializer() {
  useEffect(() => {
    store.dispatch(loadMeals());
    store.dispatch(loadGoals());
    store.dispatch(loadSettings());
  }, []);

  return null;
}

// Wrapper component to use theme context inside Redux provider
function RootNavigator() {
  const { isDark } = useTheme();

  const navigationTheme = useMemo(() => ({
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: isDark ? Colors.dark.background : Colors.light.background,
      card: isDark ? Colors.dark.surface : Colors.light.surface,
      text: isDark ? Colors.dark.text : Colors.light.text,
      border: isDark ? Colors.dark.border : Colors.light.border,
      notification: Colors.light.primary,
    },
  }), [isDark]);

  return (
    <NavThemeProvider value={navigationTheme}>
      <DataInitializer />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
