import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { MealCard } from '../../src/components/MealCard';
import { RootState, AppDispatch } from '../../src/store';
import { Meal } from '../../src/models';
import { formatDate, getLast7Days, getDayName, formatDisplayDate } from '../../src/utils/dateUtils';
import { calculateDailyTotals } from '../../src/utils/calculator';
import { deleteMeal } from '../../src/store/mealSlice';
import { Alert as AppAlert } from '../../src/utils/alert';
import { scaledFontSize } from '../../src/utils/fontUtils';

export default function HistoryScreen() {
  const { colors, fontScale } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const meals = useSelector((state: RootState) => state.meals.meals) || [];
  const activeGoal = useSelector((state: RootState) => state.goals.activeGoal);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  const handleDeleteMeal = (meal: Meal) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete this ${meal.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMeal(meal.id));
              AppAlert.alert('Success', 'Meal deleted successfully!');
            } catch (error) {
              AppAlert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const last7Days = getLast7Days();

  const selectedDateMeals = meals.filter((meal: Meal) => meal && meal.date === selectedDate);
  const dailyTotals = calculateDailyTotals(selectedDateMeals);

  const weeklyData = useMemo(() => {
    return last7Days.map((date) => {
      const dateStr = formatDate(date);
      const dayMeals = meals.filter((meal: Meal) => meal && meal.date === dateStr);
      const totals = calculateDailyTotals(dayMeals);
      return {
        date: dateStr,
        dayName: getDayName(date),
        displayDate: formatDisplayDate(date),
        calories: totals.totalCalories,
        sugar: totals.totalSugar,
      };
    });
  }, [meals]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.background }]}>History</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Last 7 Days</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
            {weeklyData.map((day) => {
              const isSelected = day.date === selectedDate;
              const caloriePercent = activeGoal
                ? Math.min(100, (day.calories / activeGoal.calorieTarget) * 100)
                : 0;

              return (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.dayCard,
                    { backgroundColor: isSelected ? colors.primary : colors.surface },
                    isSelected && { borderColor: colors.primary },
                  ]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dayName, { color: isSelected ? colors.background : colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    {day.dayName}
                  </Text>
                  <View
                    style={[
                      styles.calorieBar,
                      { backgroundColor: isSelected ? colors.background : colors.textSecondary },
                      { height: Math.max(4, caloriePercent * 0.8) },
                    ]}
                  />
                  <Text style={[styles.calorieText, { color: isSelected ? colors.background : colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    {day.calories}
                  </Text>
                  <Text style={[styles.sugarText, { color: isSelected ? colors.background : colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                    {day.sugar.toFixed(1)}g sugar
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Date Summary */}
        <View style={styles.section}>
          <View style={[styles.dateHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.dateTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xl, fontScale) }]}>
              {weeklyData.find((d) => d.date === selectedDate)?.displayDate}
            </Text>
            {selectedDate === formatDate(new Date()) && (
              <View style={[styles.todayBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.todayText, { fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>Today</Text>
              </View>
            )}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryItem}>
              <Ionicons name="flame" size={20} color={colors.primary} />
              <Text style={[styles.summaryValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyTotals.totalCalories}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>calories</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="cube" size={20} color={colors.secondary} />
              <Text style={[styles.summaryValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyTotals.totalSugar.toFixed(1)}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>sugar (g)</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={20} color={colors.accent} />
              <Text style={[styles.summaryValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyTotals.totalProtein.toFixed(1)}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>protein (g)</Text>
            </View>
          </View>
        </View>

        {/* Meals for Selected Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Meals</Text>
          {selectedDateMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>No meals logged for this day</Text>
            </View>
          ) : (
            selectedDateMeals.map((meal: Meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => {}}
                onDelete={() => handleDeleteMeal(meal)}
              />
            ))
          )}
        </View>

        {/* Daily Statistics */}
        {selectedDateMeals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Daily Breakdown</Text>
            <View style={[styles.breakdownCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Total Calories</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{dailyTotals.totalCalories} cal</Text>
              </View>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Total Sugar</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{dailyTotals.totalSugar.toFixed(1)}g</Text>
              </View>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Protein</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{dailyTotals.totalProtein.toFixed(1)}g</Text>
              </View>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Carbs</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{dailyTotals.totalCarbs.toFixed(1)}g</Text>
              </View>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Fat</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{dailyTotals.totalFat.toFixed(1)}g</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Meals Logged</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{selectedDateMeals.length}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    backgroundColor: "transparent",
    padding: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
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
    color: "#333333",
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  dayCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  dayCardActive: {
    backgroundColor: "transparent",
  },
  dayName: {
    color: "#333333",
    marginBottom: Spacing.sm,
  },
  dayNameActive: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  calorieBar: {
    width: 12,
    backgroundColor: "transparent",
    borderRadius: 6,
    marginBottom: Spacing.xs,
  },
  calorieBarActive: {
    backgroundColor: "transparent",
  },
  calorieText: {
    fontWeight: Typography.fontWeight.bold,
    color: "#333333",
  },
  calorieTextActive: {
    color: "#FFFFFF",
  },
  sugarText: {
    color: "#666666",
  },
  sugarTextActive: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: "#333333",
  },
  todayBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  todayText: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#FFFFFF",
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: "#F5F5F5",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: Typography.fontWeight.bold,
    color: "#333333",
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    color: "#666666",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyStateText: {
    color: "#666666",
    marginTop: Spacing.md,
  },
  breakdownCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  breakdownLabel: {},
  breakdownValue: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
