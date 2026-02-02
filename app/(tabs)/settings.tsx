import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import type { AppDispatch } from '../../src/store';

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { RootState, DarkModePreference, FontSizeScale, SettingsState } from '../../src/store';
import { setDarkMode as setDarkModeAction, setFontSize as setFontSizeAction } from '../../src/store/settingsSlice';
import { testUSDAApiConnection } from '../../src/utils/usdaApi';
import { resetOnboarding } from '../onboarding';
import { scaledFontSize } from '../../src/utils/fontUtils';
import { exportBackupAsFile, importBackup, getLastBackupTime, getAutoBackupsInfo } from '../../src/utils/backupUtils';
import { selectDeletedMeals } from '../../src/store/mealSlice';
import { restoreMeal, permanentDeleteMeal } from '../../src/store';
import { Meal } from '../../src/models';

const MEALS_STORAGE_KEY = '@calory_tracker_meals';
const GOALS_STORAGE_KEY = '@calory_tracker_goals';
const USDA_API_KEY = '@calory_tracker_usda_api_key';

const DARK_MODE_OPTIONS: { value: DarkModePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sunny' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'tablet-landscape' },
];

const FONT_SIZE_OPTIONS: { value: FontSizeScale; label: string; size: number }[] = [
  { value: 'small', label: 'Small', size: 14 },
  { value: 'medium', label: 'Medium', size: 16 },
  { value: 'large', label: 'Large', size: 18 },
  { value: 'extraLarge', label: 'Extra Large', size: 20 },
];

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isDark, colors, fontScale, fontSize } = useTheme();
  const settings = useSelector((state: RootState) => state.settings) as SettingsState;
  const darkMode = settings?.darkMode ?? 'system';
  const deletedMeals = useSelector((state: RootState) => selectDeletedMeals(state));

  const [usdaApiKey, setUsdaApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showRecentlyDeleted, setShowRecentlyDeleted] = useState(false);

  // Load USDA API key on mount
  useEffect(() => {
    loadUsdaApiKey();
    loadLastBackupTime();
  }, []);

  const loadLastBackupTime = async () => {
    const lastBackup = await getLastBackupTime();
    setLastBackupTime(lastBackup);
  };

  const loadUsdaApiKey = async () => {
    try {
      const key = await AsyncStorage.getItem(USDA_API_KEY);
      if (key) {
        setUsdaApiKey(key);
      }
    } catch (error) {
      console.error('Error loading USDA API key:', error);
    }
  };

  const saveUsdaApiKey = async () => {
    try {
      await AsyncStorage.setItem(USDA_API_KEY, usdaApiKey);
      setShowApiKeyModal(false);
      Alert.alert('Success', 'USDA API key saved. You may need to restart the app for changes to take effect.');
      setApiTestResult(null);
    } catch (error) {
      console.error('Error saving USDA API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

  const testUsdaApiKey = async () => {
    if (!usdaApiKey || usdaApiKey.trim() === '') {
      Alert.alert('No API Key', 'Please enter your USDA API key first.');
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    const result = await testUSDAApiConnection();
    setApiTestResult(result);
    setIsTestingApi(false);

    Alert.alert(
      result.success ? 'Success' : 'Connection Failed',
      result.message,
      [{ text: 'OK' }]
    );
  };

  const openUsdaApiWebsite = () => {
    if (typeof window !== 'undefined') {
      window.open('https://fdc.nal.usda.gov/api-key-signup', '_blank');
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      await exportBackupAsFile();
      Alert.alert('Success', 'Backup exported successfully!');
      await loadLastBackupTime();
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export backup file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = () => {
    setShowImportDialog(true);
  };

  const processImport = async (fileContent: string) => {
    const result = await importBackup(fileContent);

    if (result.success) {
      Alert.alert(
        'Import Successful',
        result.message,
        [
          { text: 'OK', onPress: () => {
            // Reload the app to apply changes
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }},
        ]
      );
    } else {
      Alert.alert('Import Failed', result.message);
    }

    setShowImportDialog(false);
  };

  const handleRestoreMeal = async (meal: Meal) => {
    Alert.alert(
      'Restore Meal',
      `Restore "${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}" meal from ${meal.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await dispatch(restoreMeal(meal.id));
              Alert.alert('Success', 'Meal restored successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = async (meal: Meal) => {
    Alert.alert(
      'Permanently Delete',
      `This will permanently delete this meal. You cannot undo this action. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(permanentDeleteMeal(meal.id));
              Alert.alert('Deleted', 'Meal permanently deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    console.log('clearAllData called');

    if (Platform.OS === 'web') {
      // Use window.confirm for web
      if (window.confirm('This will delete all your meals and goals. This cannot be undone. Are you sure?')) {
        try {
          await AsyncStorage.removeItem(MEALS_STORAGE_KEY);
          await AsyncStorage.removeItem(GOALS_STORAGE_KEY);
          window.alert('All data cleared. Please reload the app.');
        } catch (e) {
          console.error('Error clearing data:', e);
          window.alert('Failed to clear data');
        }
      }
    } else {
      // Use Alert.alert for native platforms
      Alert.alert(
        'Clear All Data',
        'This will delete all your meals and goals. This cannot be undone. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.removeItem(MEALS_STORAGE_KEY);
                await AsyncStorage.removeItem(GOALS_STORAGE_KEY);
                Alert.alert('Success', 'All data cleared. Please reload the app.', [
                  { text: 'OK', onPress: () => {} },
                ]);
              } catch (e) {
                console.error('Error clearing data:', e);
                Alert.alert('Error', 'Failed to clear data');
              }
            },
          },
        ]
      );
    }
  };

  const showTutorial = async () => {
    console.log('showTutorial called');

    const confirmAndReset = async () => {
      try {
        // Reset the onboarding flag
        console.log('Resetting onboarding...');
        await resetOnboarding();
        console.log('Onboarding reset complete');

        // Add a small delay to ensure AsyncStorage is updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Navigate to onboarding - use dismissAll to exit tabs context first
        console.log('Navigating to onboarding...');
        router.dismissAll();
        router.replace('/onboarding');
        console.log('Navigation called');
      } catch (error) {
        console.error('Error showing tutorial:', error);
        if (Platform.OS === 'web') {
          window.alert('Failed to show tutorial. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to show tutorial. Please try again.');
        }
      }
    };

    if (Platform.OS === 'web') {
      // Use window.confirm for web
      if (window.confirm('This will reset the onboarding and show you the tutorial again. Continue?')) {
        await confirmAndReset();
      }
    } else {
      // Use Alert.alert for native platforms
      Alert.alert(
        'Show Tutorial',
        'This will reset the onboarding and show you the tutorial again. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Show Tutorial',
            onPress: confirmAndReset,
          },
        ]
      );
    }
  };

  const handleDarkModeChange = (mode: DarkModePreference) => {
    dispatch(setDarkModeAction(mode));
  };

  const handleFontSizeChange = (size: FontSizeScale) => {
    dispatch(setFontSizeAction(size));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Accessibility Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Accessibility</Text>

          {/* Dark Mode */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="moon" size={24} color={colors.text} />
              <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Dark Mode</Text>
            </View>
            <View style={styles.optionRow}>
              {DARK_MODE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    darkMode === option.value && styles.optionButtonActive,
                    darkMode === option.value && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => handleDarkModeChange(option.value)}
                  accessibilityLabel={`${option.label} dark mode`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: darkMode === option.value }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={18}
                    color={darkMode === option.value ? '#fff' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: darkMode === option.value ? '#fff' : colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) },
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Font Size */}
          <View style={[styles.card, { backgroundColor: colors.surface, marginTop: Spacing.sm }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="text" size={24} color={colors.text} />
              <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Font Size</Text>
            </View>
            <View style={styles.optionRow}>
              {FONT_SIZE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    fontSize === option.value && styles.optionButtonActive,
                    fontSize === option.value && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => handleFontSizeChange(option.value)}
                  accessibilityLabel={`${option.label} font size`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: fontSize === option.value }}
                >
                  <Text
                    style={[
                      styles.fontPreview,
                      { color: fontSize === option.value ? '#fff' : colors.text, fontSize: option.size * fontScale },
                    ]}>
                    A
                  </Text>
                  <Text
                    style={[
                      styles.optionText,
                      { color: fontSize === option.value ? '#fff' : colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) },
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.previewContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Preview:</Text>
              <View style={styles.previewTextWrapper}>
                <Text style={[styles.previewText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                  This is how text will appear with the selected font size.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* USDA API Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Food Database</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => setShowApiKeyModal(true)}
            accessibilityLabel="Configure USDA API key"
            accessibilityRole="button"
            accessibilityHint={usdaApiKey ? "API key is configured, tap to change" : "USDA API not configured, tap to set up"}
          >
            <View style={styles.settingHeader}>
              <Ionicons name="key" size={24} color={colors.primary} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>USDA API Key</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  {usdaApiKey ? 'API key configured' : 'Not configured - using local database only'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {usdaApiKey && (
            <View style={[styles.infoCard, { backgroundColor: 'rgba(76, 175, 80, 0.1)', marginTop: Spacing.sm }]}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={[styles.apiKeyStatusText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                USDA API is configured. Search 400,000+ foods!
              </Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>About</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.appName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Calorie & Sugar Tracker</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Version 1.3.1</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
              UI improvements: larger tab bar, fixed label visibility, fixed font preview overlap
            </Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Data Management</Text>

          {/* Backup & Restore */}
          <View style={[styles.card, { backgroundColor: colors.surface, marginBottom: Spacing.sm }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="cloud-download" size={24} color={colors.primary} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Backup & Restore</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  {lastBackupTime
                    ? `Last backup: ${lastBackupTime.toLocaleDateString()}`
                    : 'No backup yet'}
                </Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { borderColor: colors.border }]}
                onPress={handleImportBackup}
                accessibilityLabel="Import backup"
                accessibilityRole="button"
                disabled={isExporting}
              >
                <Ionicons name="cloud-upload" size={20} color={colors.primary} />
                <Text style={[styles.secondaryActionText, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryActionButton, { backgroundColor: colors.primary }]}
                onPress={handleExportBackup}
                accessibilityLabel="Export backup"
                accessibilityRole="button"
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={[styles.primaryActionText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Export</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Show Tutorial */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, marginBottom: Spacing.sm }]}
            onPress={() => {
              console.log('Show Tutorial button pressed');
              showTutorial();
            }}
            onPressIn={() => console.log('Show Tutorial onPressIn triggered')}
            activeOpacity={0.7}
            accessibilityLabel="Show tutorial"
            accessibilityRole="button"
            accessibilityHint="View the app tutorial again"
          >
            <View style={styles.settingHeader}>
              <Ionicons name="school" size={24} color={colors.info} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Show Tutorial</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  Review the app tutorial and features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Recently Deleted */}
          {deletedMeals.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface, marginBottom: Spacing.sm }]}>
              <TouchableOpacity
                onPress={() => setShowRecentlyDeleted(!showRecentlyDeleted)}
                accessibilityLabel="Toggle recently deleted meals"
                accessibilityRole="button"
                accessibilityState={{ expanded: showRecentlyDeleted }}
              >
                <View style={styles.settingHeader}>
                  <Ionicons name="trash-outline" size={24} color={colors.warning} />
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Recently Deleted</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                      {deletedMeals.length} meal{deletedMeals.length !== 1 ? 's' : ''} available for restore
                    </Text>
                  </View>
                  <Ionicons
                    name={showRecentlyDeleted ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {showRecentlyDeleted && (
                <View style={[styles.deletedMealsContainer, { borderTopColor: colors.border }]}>
                  {deletedMeals.map((meal) => (
                    <View key={meal.id} style={[styles.deletedMealItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <View style={styles.deletedMealInfo}>
                        <Text style={[styles.deletedMealType, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                          {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                        </Text>
                        <Text style={[styles.deletedMealDate, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                          {meal.date}
                        </Text>
                        <Text style={[styles.deletedMealCalories, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                          {meal.totalCalories} cal
                        </Text>
                      </View>
                      <View style={styles.deletedMealActions}>
                        <TouchableOpacity
                          style={[styles.restoreButton, { backgroundColor: colors.success }]}
                          onPress={() => handleRestoreMeal(meal)}
                          accessibilityLabel={`Restore ${meal.type} meal from ${meal.date}`}
                          accessibilityRole="button"
                        >
                          <Ionicons name="refresh" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                          onPress={() => handlePermanentDelete(meal)}
                          accessibilityLabel={`Permanently delete ${meal.type} meal from ${meal.date}`}
                          accessibilityRole="button"
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.surface, borderColor: colors.danger }]}
            onPress={() => {
              console.log('Clear All Data button pressed');
              clearAllData();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Clear all data"
            accessibilityRole="button"
            accessibilityHint="Deletes all meals and goals, this action cannot be undone"
          >
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
            <View style={styles.buttonContent}>
              <Text style={[styles.dangerButtonText, { color: colors.danger, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Clear All Data</Text>
              <Text style={[styles.dangerButtonSubtext, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Delete all meals and goals (cannot be undone)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Feedback & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Feedback & Support</Text>
          <TouchableOpacity
            style={[styles.feedbackCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open('https://github.com/CJ-1981/calory-tracker/issues', '_blank');
              }
            }}
            accessibilityLabel="Report issues and request features"
            accessibilityRole="button"
            accessibilityHint="Opens GitHub issues page in a new browser tab"
          >
            <Ionicons name="logo-github" size={32} color={colors.primary} />
            <View style={styles.feedbackContent}>
              <Text style={[styles.feedbackTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Report Issues & Request Features
              </Text>
              <Text style={[styles.feedbackDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Found a bug or have a suggestion? Let us know on GitHub!
              </Text>
            </View>
            <Ionicons name="open" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
            Made with ❤️ for healthy living
          </Text>
        </View>
      </ScrollView>

      {/* USDA API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApiKeyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
                USDA API Key
              </Text>
              <TouchableOpacity
                onPress={() => setShowApiKeyModal(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              Get your free API key from{' '}
              <Text style={[styles.modalLink, { color: colors.primary }]}>https://fdc.nal.usda.gov/api-key-signup</Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                API Key
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                value={usdaApiKey}
                onChangeText={(text) => {
                  setUsdaApiKey(text);
                  setApiTestResult(null);
                }}
                placeholder="Enter your USDA API key"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="USDA API key input"
              />
              <Text style={[styles.hintText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                The API key is stored locally on your device and never shared.
              </Text>
            </View>

            {/* Get API Key Button */}
            <TouchableOpacity
              style={[styles.getApiKeyButton, { backgroundColor: colors.info, borderColor: colors.border }]}
              onPress={openUsdaApiWebsite}
              accessibilityLabel="Get free USDA API key"
              accessibilityRole="button"
              accessibilityHint="Opens USDA API website in a new browser tab"
            >
              <Ionicons name="open" size={20} color="#fff" />
              <Text style={[styles.getApiKeyButtonText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Get Free API Key
              </Text>
            </TouchableOpacity>

            {/* Test Connection Button */}
            <TouchableOpacity
              style={[styles.testApiButton, { backgroundColor: apiTestResult?.success ? colors.success : apiTestResult?.success === false ? colors.danger : colors.warning }]}
              onPress={testUsdaApiKey}
              disabled={isTestingApi}
              accessibilityLabel="Test USDA API connection"
              accessibilityRole="button"
              accessibilityState={{ disabled: isTestingApi }}
            >
              {isTestingApi ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={apiTestResult?.success ? "checkmark-circle" : apiTestResult?.success === false ? "close-circle" : "refresh"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={[styles.testApiButtonText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                    {apiTestResult ? 'Test Again' : 'Test Connection'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {apiTestResult && (
              <View style={[styles.testResultContainer, { backgroundColor: apiTestResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
                <Ionicons
                  name={apiTestResult.success ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={apiTestResult.success ? "#4CAF50" : "#F44336"}
                />
                <Text style={[styles.testResultText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                  {apiTestResult.message}
                </Text>
              </View>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
                onPress={() => setShowApiKeyModal(false)}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={[styles.modalButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={saveUsdaApiKey}
                accessibilityLabel="Save API key"
                accessibilityRole="button"
              >
                <Text style={[styles.modalButtonText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Backup Dialog */}
      <Modal
        visible={showImportDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImportDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: colors.surface }]}>
            <View style={styles.dialogHeader}>
              <Ionicons name="cloud-upload" size={28} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
                Import Backup
              </Text>
            </View>

            <Text style={[styles.dialogDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
              Select a backup file to restore your data. This will merge the backup with your existing data.
            </Text>

            <TouchableOpacity
              style={[styles.importButton, { backgroundColor: colors.info }]}
              onPress={() => {
                // For now, show instructions for manual import
                setShowImportDialog(false);
                Alert.alert(
                  'How to Import',
                  'To import a backup file:\n\n1. Go to the Export/Import section in Settings\n2. Tap "Import" to select your backup file\n3. Review the import preview\n4. Confirm to restore your data',
                  [{ text: 'Got it' }]
                );
              }}
              accessibilityLabel="Learn how to import backup"
              accessibilityRole="button"
            >
              <Ionicons name="information-circle" size={24} color="#fff" />
              <View style={styles.importButtonContent}>
                <Text style={[styles.importButtonTitle, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                  How to Import
                </Text>
                <Text style={[styles.importButtonSubtitle, { color: 'rgba(255,255,255,0.8)', fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  View instructions
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogButtonSecondary, { borderColor: colors.border }]}
              onPress={() => setShowImportDialog(false)}
              accessibilityLabel="Cancel import"
              accessibilityRole="button"
            >
              <Text style={[styles.dialogButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  settingTitle: {
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  settingDescription: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  apiKeyStatusText: {
    marginLeft: Spacing.sm,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontWeight: Typography.fontWeight.bold,
    fontSize: 18,
  },
  modalDescription: {
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  modalLink: {
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: Typography.fontWeight.medium,
  },
  getApiKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  getApiKeyButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  testApiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  testApiButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  testResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  testResultText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonPrimary: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    minHeight: 44,
  },
  secondaryActionText: {
    fontWeight: Typography.fontWeight.semibold,
    fontSize: 12,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    minHeight: 44,
  },
  primaryActionText: {
    fontWeight: Typography.fontWeight.semibold,
    fontSize: 12,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  importButtonContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  importButtonTitle: {
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  importButtonSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    minHeight: 48,
  },
  optionButtonActive: {
    borderWidth: 0,
  },
  optionText: {
    fontWeight: Typography.fontWeight.medium,
  },
  optionTextActive: {
    color: '#fff',
  },
  fontPreview: {
    fontWeight: Typography.fontWeight.bold,
  },
  previewContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  previewLabel: {
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  previewTextWrapper: {
    width: '100%',
  },
  previewText: {
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  appName: {
    fontWeight: Typography.fontWeight.bold,
  },
  version: {
    marginTop: Spacing.xs,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    minHeight: 56,
  },
  buttonContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  dangerButtonSubtext: {
    marginTop: Spacing.xs,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    marginTop: Spacing.sm,
    minHeight: 68,
  },
  feedbackContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  feedbackTitle: {
    fontWeight: Typography.fontWeight.semibold,
  },
  feedbackDescription: {
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  deletedMealsContainer: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  deletedMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  deletedMealInfo: {
    flex: 1,
  },
  deletedMealType: {
    fontWeight: Typography.fontWeight.semibold,
  },
  deletedMealDate: {
    marginTop: 2,
    fontSize: 12,
  },
  deletedMealCalories: {
    marginTop: 2,
    fontSize: 11,
  },
  deletedMealActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  restoreButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogContent: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  dialogHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dialogTitle: {
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.sm,
  },
  dialogDescription: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  dialogButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  dialogButtonSecondary: {
    borderWidth: 1,
    width: '100%',
  },
  dialogButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
