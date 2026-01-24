import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { MealCard } from '../../src/components/MealCard';
import { RootState } from '../../src/store';
import { Meal } from '../../src/models';
import { formatDate, getLast7Days, getDayName, formatDisplayDate } from '../../src/utils/dateUtils';
import { calculateDailyTotals } from '../../src/utils/calculator';

export default function HistoryScreen() {
  const meals = useSelector((state: RootState) => state.meals.meals) || [];
  const activeGoal = useSelector((state: RootState) => state.goals.activeGoal);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  console.log('History Screen - meals from Redux:', meals);
  console.log('History Screen - selected date:', selectedDate);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
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
                    isSelected && styles.dayCardActive,
                  ]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                    {day.dayName}
                  </Text>
                  <View
                    style={[
                      styles.calorieBar,
                      isSelected && styles.calorieBarActive,
                      { height: Math.max(4, caloriePercent * 0.8) },
                    ]}
                  />
                  <Text style={[styles.calorieText, isSelected && styles.calorieTextActive]}>
                    {day.calories}
                  </Text>
                  <Text style={[styles.sugarText, isSelected && styles.sugarTextActive]}>
                    {day.sugar.toFixed(1)}g sugar
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Date Summary */}
        <View style={styles.section}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateTitle}>
              {weeklyData.find((d) => d.date === selectedDate)?.displayDate}
            </Text>
            {selectedDate === formatDate(new Date()) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="flame" size={20} color={Colors.light.primary} />
              <Text style={styles.summaryValue}>{dailyTotals.totalCalories}</Text>
              <Text style={styles.summaryLabel}>calories</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="cube" size={20} color={Colors.light.secondary} />
              <Text style={styles.summaryValue}>{dailyTotals.totalSugar.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>sugar (g)</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={20} color={Colors.light.accent} />
              <Text style={styles.summaryValue}>{dailyTotals.totalProtein.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>protein (g)</Text>
            </View>
          </View>
        </View>

        {/* Meals for Selected Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meals</Text>
          {selectedDateMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptyStateText}>No meals logged for this day</Text>
            </View>
          ) : (
            selectedDateMeals.map((meal: Meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => {}}
              />
            ))
          )}
        </View>

        {/* Daily Statistics */}
        {selectedDateMeals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Breakdown</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Calories</Text>
                <Text style={styles.breakdownValue}>{dailyTotals.totalCalories} cal</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Sugar</Text>
                <Text style={styles.breakdownValue}>{dailyTotals.totalSugar.toFixed(1)}g</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Protein</Text>
                <Text style={styles.breakdownValue}>{dailyTotals.totalProtein.toFixed(1)}g</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Carbs</Text>
                <Text style={styles.breakdownValue}>{dailyTotals.totalCarbs.toFixed(1)}g</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Fat</Text>
                <Text style={styles.breakdownValue}>{dailyTotals.totalFat.toFixed(1)}g</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Meals Logged</Text>
                <Text style={styles.breakdownValue}>{selectedDateMeals.length}</Text>
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
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  dayCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  dayCardActive: {
    backgroundColor: Colors.light.primary,
  },
  dayName: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  dayNameActive: {
    color: Colors.light.background,
    fontWeight: Typography.fontWeight.semibold,
  },
  calorieBar: {
    width: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    marginBottom: Spacing.xs,
  },
  calorieBarActive: {
    backgroundColor: Colors.light.background,
  },
  calorieText: {
    ...Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  calorieTextActive: {
    color: Colors.light.background,
  },
  sugarText: {
    ...Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  sugarTextActive: {
    color: Colors.light.background,
    opacity: 0.9,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateTitle: {
    ...Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  todayBadge: {
    backgroundColor: Colors.light.success,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  todayText: {
    ...Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    ...Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyStateText: {
    ...Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  breakdownCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  breakdownLabel: {
    ...Typography.fontSize.md,
    color: Colors.light.text,
  },
  breakdownValue: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
  },
});
