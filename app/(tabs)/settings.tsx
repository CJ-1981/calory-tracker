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
  const dispatch = useDispatch();
  const { isDark, colors, fontScale, fontSize } = useTheme();
  const settings = useSelector((state: RootState) => state.settings) as SettingsState;
  const darkMode = settings?.darkMode ?? 'system';

  const [usdaApiKey, setUsdaApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Load USDA API key on mount
  useEffect(() => {
    loadUsdaApiKey();
  }, []);

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
    } catch (error) {
      console.error('Error saving USDA API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

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

        {/* USDA API Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Food Database</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => setShowApiKeyModal(true)}>
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
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Version 1.2.0</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
              Added USDA Food Database integration, dropdown menus, API key configuration
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
              <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              Get your free API key from{' '}
              <Text style={[styles.modalLink, { color: colors.primary }]}>https://api.nal.usda.gov/</Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                API Key
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                value={usdaApiKey}
                onChangeText={setUsdaApiKey}
                placeholder="Enter your USDA API key"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.hintText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                The API key is stored locally on your device and never shared.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={saveUsdaApiKey}>
              <Text style={[styles.saveButtonText, { color: '#fff', fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Save API Key
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShowApiKeyModal(false)}>
              <Text style={[styles.cancelButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Cancel
              </Text>
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
  },
  cancelButtonText: {
    fontWeight: Typography.fontWeight.medium,
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
    flex: 1,
    flexWrap: 'wrap',
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
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    marginTop: Spacing.sm,
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
});
