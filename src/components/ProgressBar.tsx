import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { scaledFontSize } from '../utils/fontUtils';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  label,
}) => {
  const { colors, fontScale } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{label}</Text>
      )}
      <View style={[styles.track, { backgroundColor: colors.border, height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: colors.primary,
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
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
});
