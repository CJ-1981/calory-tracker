import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.light.primary,
  height = 8,
  showLabel = false,
  label,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.md,
  },
  label: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
});
