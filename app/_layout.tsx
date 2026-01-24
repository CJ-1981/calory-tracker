import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { useEffect } from 'react';

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

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider value={DefaultTheme}>
        <DataInitializer />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
