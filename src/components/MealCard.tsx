import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { Meal } from '../models';
import { formatDisplayTime } from '../utils/dateUtils';
import { MEAL_TYPES } from '../utils/constants';
import { scaledFontSize } from '../utils/fontUtils';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const { colors, fontScale } = useTheme();
  const mealType = MEAL_TYPES.find((t) => t.value === meal.type);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.icon, { fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{mealType?.icon}</Text>
          <Text style={[styles.title, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{mealType?.label}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{formatDisplayTime(meal.createdAt)}</Text>
      </View>

      {meal.photoUri && (
        <Image source={{ uri: meal.photoUri }} style={styles.photo} />
      )}

      <View style={styles.nutrition}>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{meal.totalCalories}</Text>
          <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{meal.totalSugar.toFixed(1)}</Text>
          <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>sugar</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{meal.totalProtein.toFixed(1)}</Text>
          <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>protein</Text>
        </View>
      </View>

      {meal.notes && (
        <Text style={[styles.notes, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]} numberOfLines={1}>
          {meal.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  title: {
    fontWeight: Typography.fontWeight.semibold,
  },
  time: {},
  photo: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  nutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontWeight: Typography.fontWeight.bold,
  },
  nutritionLabel: {},
  notes: {
    fontStyle: 'italic',
  },
});
