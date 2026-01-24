import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Spacing, BorderRadius, Typography, useTheme } from '../../src/theme';
import { Alert } from '../../src/utils/alert';

const MEALS_STORAGE_KEY = '@calory_tracker_meals';
const GOALS_STORAGE_KEY = '@calory_tracker_goals';

export default function SettingsScreen() {
  const { colors, theme, setTheme, isDark } = useTheme();

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

  const ThemeOption = ({ label, value, icon }: { label: string; value: 'light' | 'dark' | 'auto'; icon: string }) => {
    const isSelected = theme === value;

    return (
      <TouchableOpacity
        style={[styles.themeOption, { borderColor: isSelected ? colors.primary : colors.border }]}
        onPress={() => setTheme(value)}
      >
        <Ionicons name={icon as any} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
        <Text style={[styles.themeOptionLabel, { color: colors.text }]}>{label}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      padding: Spacing.lg,
      borderBottomLeftRadius: BorderRadius.xl,
      borderBottomRightRadius: BorderRadius.xl,
    },
    headerTitle: {
      ...Typography.fontSize.xxl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.background,
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
      ...Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: Spacing.sm,
      marginLeft: Spacing.xs,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
    },
    appName: {
      ...Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    version: {
      ...Typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    themeOption: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      alignItems: 'center',
      borderWidth: 2,
    },
    themeOptionLabel: {
      ...Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
      marginTop: Spacing.xs,
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    buttonContent: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    dangerButtonText: {
      ...Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.danger,
    },
    dangerButtonSubtext: {
      ...Typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    featureContent: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    featureTitle: {
      ...Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
    },
    featureDescription: {
      ...Typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    footer: {
      padding: Spacing.xl,
      alignItems: 'center',
    },
    footerText: {
      ...Typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={dynamicStyles.content}>
        {/* App Info */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>About</Text>
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.appName}>Calorie & Sugar Tracker</Text>
            <Text style={dynamicStyles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Theme Selection */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
          <View style={dynamicStyles.themeOptions}>
            <ThemeOption label="Light" value="light" icon="sunny-outline" />
            <ThemeOption label="Dark" value="dark" icon="moon-outline" />
            <ThemeOption label="Auto" value="auto" icon="phone-portrait-outline" />
          </View>
        </View>

        {/* Data Management */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={dynamicStyles.dangerButton} onPress={clearAllData}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
            <View style={dynamicStyles.buttonContent}>
              <Text style={dynamicStyles.dangerButtonText}>Clear All Data</Text>
              <Text style={dynamicStyles.dangerButtonSubtext}>
                Delete all meals and goals (cannot be undone)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Features Info */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Features</Text>
          <View style={dynamicStyles.featureItem}>
            <Ionicons name="search" size={24} color={colors.primary} />
            <View style={dynamicStyles.featureContent}>
              <Text style={dynamicStyles.featureTitle}>Food Database</Text>
              <Text style={dynamicStyles.featureDescription}>
                140+ common foods with nutritional info
              </Text>
            </View>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Ionicons name="cube" size={24} color={colors.secondary} />
            <View style={dynamicStyles.featureContent}>
              <Text style={dynamicStyles.featureTitle}>Sugar Tracking</Text>
              <Text style={dynamicStyles.featureDescription}>
                Monitor sugar intake with alerts
              </Text>
            </View>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Ionicons name="stats-chart" size={24} color={colors.accent} />
            <View style={dynamicStyles.featureContent}>
              <Text style={dynamicStyles.featureTitle}>Progress Charts</Text>
              <Text style={dynamicStyles.featureDescription}>
                Track your nutrition over time
              </Text>
            </View>
          </View>
        </View>

        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>Made with ❤️ for healthy living</Text>
        </View>
      </ScrollView>
    </View>
  );
}
