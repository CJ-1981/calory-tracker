import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { Meal } from '../models';
import { formatDisplayTime } from '../utils/dateUtils';
import { MEAL_TYPES } from '../utils/constants';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const mealType = MEAL_TYPES.find((t) => t.value === meal.type);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{mealType?.icon}</Text>
          <Text style={styles.title}>{mealType?.label}</Text>
        </View>
        <Text style={styles.time}>{formatDisplayTime(meal.createdAt)}</Text>
      </View>

      {meal.photoUri && (
        <Image source={{ uri: meal.photoUri }} style={styles.photo} />
      )}

      <View style={styles.nutrition}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalCalories}</Text>
          <Text style={styles.nutritionLabel}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalSugar.toFixed(1)}</Text>
          <Text style={styles.nutritionLabel}>sugar</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalProtein.toFixed(1)}</Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
      </View>

      {meal.notes && (
        <Text style={styles.notes} numberOfLines={1}>
          {meal.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.text,
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
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.xs,
  },
  title: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  time: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
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
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
  nutritionLabel: {
    ...Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  notes: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
});
