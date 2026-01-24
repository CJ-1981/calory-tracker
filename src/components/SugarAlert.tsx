import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { SugarWarning } from '../models';

interface SugarAlertProps {
  warning: SugarWarning;
  onDismiss?: () => void;
}

export const SugarAlert: React.FC<SugarAlertProps> = ({ warning, onDismiss }) => {
  const getAlertColor = () => {
    switch (warning.severity) {
      case 'danger':
        return Colors.light.danger;
      case 'warning':
        return Colors.light.warning;
      case 'info':
        return Colors.light.info;
      default:
        return Colors.light.success;
    }
  };

  const getIcon = () => {
    switch (warning.severity) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getAlertColor() }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{warning.message}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  dismissText: {
    ...Typography.fontSize.lg,
    color: Colors.light.textSecondary,
  },
});
