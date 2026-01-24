type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

const lightColors: ColorScheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
};

const darkColors: ColorScheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export const sugarAlertColors = {
  onTrack: '#4CAF50',
  approaching: '#FF9800',
  warning: '#FF5722',
  exceeded: '#F44336',
};

export const chartColors = {
  calories: '#FF6B6B',
  sugar: '#4ECDC4',
  protein: '#45B7D1',
  carbs: '#FFA07A',
  fat: '#FFD93D',
};

export const mealTypeColors = {
  breakfast: '#FFD93D',
  lunch: '#6BCF7F',
  dinner: '#4D96FF',
  snack: '#FF6B6B',
};
