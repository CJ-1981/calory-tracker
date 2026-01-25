# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native calorie tracking mobile application built with Expo v54. The app allows users to log meals, track daily nutritional intake (calories, sugar, protein, carbs, fat), set nutritional goals, and monitor progress over time. The app includes accessibility features such as dark mode support and font size scaling.

## Common Development Commands

### Starting the Development Server
```bash
npx expo start
# Platform-specific:
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Linting
```bash
npm run lint
# or
npx expo lint
```

### Building for Web
```bash
npm run build
# This runs: npx expo export --platform web
```

### Installing Dependencies
```bash
npm install
```

## Architecture

### State Management (Redux Toolkit)
The app uses Redux Toolkit with three main slices:
- **meals** (`src/store/mealSlice.ts`): Manages meal logging with AsyncStorage persistence. Uses async thunks for loading/saving meals. Meal IDs are generated using `expo-crypto`.
- **goals** (`src/store/goalSlice.ts`): Manages nutritional goals and targets.
- **settings** (`src/store/settingsSlice.ts`): Manages user preferences (dark mode, font size).

All slices use `@react-native-async-storage/async-storage` for persistence. Storage keys are prefixed with `@calory_tracker_`.

### Routing (Expo Router)
- File-based routing using Expo Router v6
- Main layout: `app/_layout.tsx` - Sets up Redux Provider, ThemeProvider, and navigation
- Tab navigation: `app/(tabs)/_layout.tsx` - Defines bottom tabs (Dashboard, Add Meal, History, Goals, Settings)
- Routes are under `app/(tabs)/`: index.tsx (Dashboard), add-meal.tsx, history.tsx, goals.tsx, settings.tsx

### Theme System
- Context-based theme provider in `src/contexts/ThemeContext.tsx`
- Supports dark mode with three options: 'light', 'dark', 'system' (respects device preference)
- Font size scaling: 'small', 'medium', 'large', 'extraLarge' - scales fonts using multipliers
- Theme colors defined in `src/theme/colors.ts` with `Colors.light` and `Colors.dark` objects
- Navigation theme is synced with dark mode state in root layout

### Data Models
- **Meal** (`src/models/Meal.ts`): Meal type (breakfast/lunch/dinner/snack), foods array with nutritional data, date, photo URI
- **Goal** (`src/models/Goal.ts`): Nutritional targets (calories, sugar, protein, carbs, fat), warning thresholds
- **FoodItem** contains: foodId, name, quantity, serving size/unit, macronutrients

### Food Database
- Static food database in `src/utils/foodDatabase.ts` with 150+ foods
- Categories include: Fruits, Vegetables, Proteins, Grains & Starches, Dairy, Snacks & Sweets, Ice Cream & Frozen, Cakes & Pies, Beverages, Fast Food
- Each item has nutritional info per 100g serving size + `commonPortions` array for quick selection
- Search functions: `searchFoodDatabase()` and `getFoodById()`

### Components
- **ScaledText** (`src/components/ScaledText.tsx`): Text component that respects font scale settings
- **MealCard** (`src/components/MealCard.tsx`): Displays individual meal information
- **ProgressBar** (`src/components/ProgressBar.tsx`): Visual progress indicator for goal tracking
- **SugarAlert** (`src/components/SugarAlert.tsx`): Warning component for sugar intake alerts

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Uses `expo/tsconfig.base` as base config

## Key Patterns

### Redux State Access
```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

const meals = useSelector((state: RootState) => state.meals.meals);
```

### Theme Usage
```typescript
import { useTheme } from '@/src/contexts/ThemeContext';

const { colors, isDark, fontScale } = useTheme();
// Use colors.primary, colors.background, etc.
```

### Adding Meals
Use the `addMeal` async thunk from store. It generates a unique ID using crypto and persists to AsyncStorage automatically.

### Date Handling
Dates are stored as ISO strings (YYYY-MM-DD format) for easy comparison and filtering. Use `date-fns` for date manipulation.

### Accessibility
- Always use `ScaledText` instead of `Text` for user-facing text
- Theme colors (`colors.text`, `colors.background`, etc.) instead of hardcoded colors
- All components should respect both dark mode and font scale settings

## File Structure Notes
- `src/` contains all source code (models, components, utils, store, theme, contexts)
- `app/` contains Expo Router pages and layouts
- Assets in `assets/images/`
- Config files: `app.json` (Expo config), `tsconfig.json`, `eslint.config.js`
