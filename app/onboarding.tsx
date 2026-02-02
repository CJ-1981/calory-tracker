import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { Spacing, BorderRadius, Typography } from '../src/theme';
import { useTheme } from '../src/contexts/ThemeContext';
import { scaledFontSize } from '../src/utils/fontUtils';
import { updateGoal, setUserName } from '../src/store';
import { Goal } from '../src/models';
import { GoalRecommendations } from '../src/components/GoalRecommendations';

const ONBOARDING_STORAGE_KEY = '@calory_tracker_onboarding_complete';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors, fontScale } = useTheme();
  const params = useLocalSearchParams();
  const showAgain = params?.showAgain === 'true';

  const [currentScreen, setCurrentScreen] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [userName, setUserNameInput] = useState('');

  const onboardingScreens = [
    {
      id: 1,
      icon: 'person',
      title: 'Let\'s Get to Know You',
      subtitle: 'What should we call you?',
      description: 'Enter your name to personalize your experience. You can always change this later in Settings.',
      isNameScreen: true,
      backgroundColor: colors.primary,
    },
    {
      id: 2,
      icon: 'nutrition',
      title: 'Welcome to Calorie Tracker',
      subtitle: 'Your Personal Nutrition Companion',
      description: 'Track your daily food intake, monitor sugar consumption, and achieve your health goals with our easy-to-use tracker.',
      backgroundColor: colors.secondary,
    },
    {
      id: 3,
      icon: 'flame',
      title: 'Track Your Meals',
      subtitle: 'Log What You Eat',
      description: 'Search from 400,000+ foods in our USDA database or add custom foods. Track calories, sugar, protein, carbs, and fat.',
      backgroundColor: colors.warning,
    },
    {
      id: 4,
      icon: 'trophy',
      title: 'Set Your Goals',
      subtitle: 'Personalized Recommendations',
      description: 'We\'ll help you set personalized nutritional goals based on health guidelines. You can customize these anytime.',
      isGoalScreen: true,
      backgroundColor: colors.info,
    },
    {
      id: 5,
      icon: 'key',
      title: 'USDA API Key',
      subtitle: 'Unlock Full Food Database',
      description: 'Get your free USDA API key to access 400,000+ foods. You can also add this later in Settings.',
      isApiKeyScreen: true,
      backgroundColor: colors.success,
    },
  ];

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }

    if (onComplete) {
      onComplete();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSelectGoals = async (goals: {
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      calorieTarget: goals.calories,
      sugarTarget: goals.sugar,
      proteinTarget: goals.protein,
      carbTarget: goals.carbs,
      fatTarget: goals.fat,
      startDate: new Date().toISOString(),
      isActive: true,
      warningsEnabled: true,
    };

    try {
      await dispatch(updateGoal(newGoal));
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleSaveName = async () => {
    const nameToSave = userName.trim();
    try {
      if (nameToSave) {
        dispatch(setUserName(nameToSave));
      }
    } catch (error) {
      console.error('Error saving name:', error);
    }
    // Move to next screen
    setCurrentScreen(currentScreen + 1);
  };

  const handleSaveApiKey = async () => {
    if (apiKey && apiKey.trim()) {
      try {
        await AsyncStorage.setItem('@calory_tracker_usda_api_key', apiKey.trim());
      } catch (error) {
        console.error('Error saving API key:', error);
      }
    }
    completeOnboarding();
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }

    if (onComplete) {
      onComplete();
    } else {
      router.replace('/(tabs)');
    }
  };

  const nextScreen = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const isLastScreen = currentScreen === onboardingScreens.length - 1;
  const isFirstScreen = currentScreen === 0;
  const currentScreenData = onboardingScreens[currentScreen];

  // If this is the name screen, show name input
  if (currentScreenData.isNameScreen) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            // Just move to next screen without saving a name
            setCurrentScreen(currentScreen + 1);
          }}
          accessibilityLabel="Skip name setup"
          accessibilityRole="button"
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Skip</Text>
        </TouchableOpacity>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Screen Indicator */}
          <View style={styles.indicatorContainer}>
            {onboardingScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentScreen ? colors.primary : colors.border,
                    width: index === currentScreen ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: currentScreenData.backgroundColor + '20' }]}>
            <Ionicons
              name={currentScreenData.icon as any}
              size={80}
              color={currentScreenData.backgroundColor}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: currentScreenData.backgroundColor, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>
            {currentScreenData.title}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
            {currentScreenData.subtitle}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
            {currentScreenData.description}
          </Text>

          {/* Name Input Section */}
          <View style={[styles.nameInputSection, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}
              value={userName}
              onChangeText={setUserNameInput}
              placeholder="Enter your name..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              maxLength={30}
            />
            <Text style={[styles.nameHint, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              💡 This will be used to personalize your experience
            </Text>
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              { backgroundColor: currentScreenData.backgroundColor },
            ]}
            onPress={handleSaveName}
            accessibilityLabel="Continue"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonTextPrimary, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If this is the goals screen, show goal recommendations
  if (currentScreenData.isGoalScreen) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipOnboarding}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Skip</Text>
        </TouchableOpacity>

        <GoalRecommendations
          onSelectRecommendations={(goals) => {
            handleSelectGoals(goals);
            // Move to next screen instead of completing
            setCurrentScreen(currentScreen + 1);
          }}
        />
      </View>
    );
  }

  // If this is the API key screen, show API key input
  if (currentScreenData.isApiKeyScreen) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={completeOnboarding}
          accessibilityLabel="Skip API key setup"
          accessibilityRole="button"
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Skip</Text>
        </TouchableOpacity>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Screen Indicator */}
          <View style={styles.indicatorContainer}>
            {onboardingScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentScreen ? colors.info : colors.border,
                    width: index === currentScreen ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: currentScreenData.backgroundColor + '20' }]}>
            <Ionicons
              name={currentScreenData.icon as any}
              size={80}
              color={currentScreenData.backgroundColor}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: currentScreenData.backgroundColor, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>
            {currentScreenData.title}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
            {currentScreenData.subtitle}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
            {currentScreenData.description}
          </Text>

          {/* API Key Input Section */}
          <View style={[styles.apiKeySection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.apiKeyLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
              Your USDA API Key (Optional)
            </Text>
            <TextInput
              style={[styles.apiKeyInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your API key..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />

            <TouchableOpacity
              style={[styles.getApiKeyButton, { backgroundColor: colors.info }]}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.open('https://fdc.nal.usda.gov/api-key-signup', '_blank');
                }
              }}
              accessibilityLabel="Get USDA API key"
              accessibilityRole="button"
            >
              <Ionicons name="open" size={20} color="#fff" />
              <Text style={[styles.getApiKeyButtonText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Get Your Free API Key
              </Text>
            </TouchableOpacity>

            <Text style={[styles.apiKeyNote, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              💡 The API key is free and allows you to search the full USDA food database with 400,000+ foods. Without it, you can still use the app with a built-in food database.
            </Text>
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              { backgroundColor: currentScreenData.backgroundColor },
            ]}
            onPress={handleSaveApiKey}
            accessibilityLabel="Get Started"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonTextPrimary, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
              {apiKey && apiKey.trim() ? 'Save & Continue' : 'Skip for Now'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      {!isLastScreen && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipOnboarding}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Screen Indicator */}
        <View style={styles.indicatorContainer}>
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentScreen ? colors.primary : colors.border,
                  width: index === currentScreen ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: currentScreenData.backgroundColor + '20' }]}>
          <Ionicons
            name={currentScreenData.icon as any}
            size={80}
            color={currentScreenData.backgroundColor}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: currentScreenData.backgroundColor, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>
          {currentScreenData.title}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
          {currentScreenData.subtitle}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
          {currentScreenData.description}
        </Text>

        {/* Feature Highlights for First Screen */}
        {currentScreen === 0 && (
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Easy food logging</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="checkmark" size={20} color={colors.secondary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Sugar tracking focus</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
              </View>
              <Text style={[styles.featureText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Progress analytics</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {!isFirstScreen && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSecondary, { borderColor: colors.border }]}
            onPress={prevScreen}
            accessibilityLabel="Previous"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            { backgroundColor: currentScreenData.backgroundColor },
            !isFirstScreen && styles.navButtonWide,
          ]}
          onPress={nextScreen}
          accessibilityLabel={isLastScreen ? "Get Started" : "Next"}
          accessibilityRole="button"
        >
          <Text style={[styles.navButtonTextPrimary, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
            {isLastScreen ? 'Get Started' : 'Next'}
          </Text>
          {!isLastScreen && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1,
    padding: Spacing.sm,
  },
  skipButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },
  features: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.lg,
  },
  navButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  navButtonSecondary: {
    borderWidth: 1,
    flex: 1,
  },
  navButtonPrimary: {
    flex: 2,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  navButtonWide: {
    flex: 1,
  },
  navButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  navButtonTextPrimary: {
    fontWeight: Typography.fontWeight.bold,
  },
  apiKeySection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  apiKeyLabel: {
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  apiKeyInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
  },
  getApiKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  getApiKeyButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  apiKeyNote: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  nameInputSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  nameInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
  },
  nameHint: {
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const hasCompleted = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return hasCompleted === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};
