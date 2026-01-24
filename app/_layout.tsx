import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { useTheme, ThemeProvider as CustomThemeProvider } from '../src/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '../src/store';
import { loadMeals, loadGoals } from '../src/store';

// Initialize data on app load
function DataInitializer() {
  useEffect(() => {
    store.dispatch(loadMeals());
    store.dispatch(loadGoals());
  }, []);

  return null;
}

// Navigation theme sync wrapper
function NavigationWrapper() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <DataInitializer />
        <NavigationWrapper />
      </CustomThemeProvider>
    </Provider>
  );
}
