import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { SugarWarning } from '../models';
import { scaledFontSize } from '../utils/fontUtils';

interface SugarAlertProps {
  warning: SugarWarning;
  onDismiss?: () => void;
}

export const SugarAlert: React.FC<SugarAlertProps> = ({ warning, onDismiss }) => {
  const { colors, fontScale } = useTheme();

  const getAlertColor = () => {
    switch (warning.severity) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.success;
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
    <View style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: getAlertColor() }]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { fontSize: scaledFontSize(Typography.fontSize.xl, fontScale) }]}>{getIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{warning.message}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={[styles.dismissText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontWeight: Typography.fontWeight.medium,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  dismissText: {},
});
