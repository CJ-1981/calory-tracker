import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { RootState, DarkModePreference, FontSizeScale, SettingsState } from '../../src/store';
import { setDarkMode as setDarkModeAction, setFontSize as setFontSizeAction } from '../../src/store/settingsSlice';
import { scaledFontSize } from '../../src/utils/fontUtils';

const MEALS_STORAGE_KEY = '@calory_tracker_meals';
const GOALS_STORAGE_KEY = '@calory_tracker_goals';

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
  const dispatch = useDispatch();
  const { isDark, colors, fontScale, fontSize } = useTheme();
  const settings = useSelector((state: RootState) => state.settings) as SettingsState;
  const darkMode = settings?.darkMode ?? 'system';

  const clearAllData = async () => {
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
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
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
                  onPress={() => handleDarkModeChange(option.value)}>
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
                  onPress={() => handleFontSizeChange(option.value)}>
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
              <Text style={[styles.previewText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                This is how text will appear with the selected font size.
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>About</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.appName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Calorie & Sugar Tracker</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Version 1.1.0</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
              Added meal presets feature
            </Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Data Management</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.surface, borderColor: colors.danger }]}
            onPress={clearAllData}>
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

        {/* Features Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Features</Text>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={24} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Food Database</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                60+ common foods with nutritional info
              </Text>
            </View>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="cube" size={24} color={colors.secondary} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Sugar Tracking</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Monitor sugar intake with alerts
              </Text>
            </View>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="stats-chart" size={24} color={colors.accent} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Progress Charts</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Track your nutrition over time
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
            Made with ❤️ for healthy living
          </Text>
        </View>
      </ScrollView>
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
  previewText: {
    lineHeight: Typography.lineHeight.normal,
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
  },
  buttonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dangerButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  dangerButtonSubtext: {
    marginTop: Spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontWeight: Typography.fontWeight.semibold,
  },
  featureDescription: {
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
