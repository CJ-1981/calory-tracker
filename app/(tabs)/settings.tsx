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

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { Alert } from '../../src/utils/alert';

const MEALS_STORAGE_KEY = '@calory_tracker_meals';
const GOALS_STORAGE_KEY = '@calory_tracker_goals';

export default function SettingsScreen() {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Calorie & Sugar Tracker</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Ionicons name="trash-outline" size={24} color={Colors.light.danger} />
            <View style={styles.buttonContent}>
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
              <Text style={styles.dangerButtonSubtext}>
                Delete all meals and goals (cannot be undone)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.danger} />
          </TouchableOpacity>
        </View>

        {/* Features Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color={Colors.light.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Food Database</Text>
              <Text style={styles.featureDescription}>
                60+ common foods with nutritional info
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cube" size={24} color={Colors.light.secondary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Sugar Tracking</Text>
              <Text style={styles.featureDescription}>
                Monitor sugar intake with alerts
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart" size={24} color={Colors.light.accent} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Progress Charts</Text>
              <Text style={styles.featureDescription}>
                Track your nutrition over time
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for healthy living</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    ...Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
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
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  appName: {
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  version: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  buttonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dangerButtonText: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.danger,
  },
  dangerButtonSubtext: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
  },
  featureDescription: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
