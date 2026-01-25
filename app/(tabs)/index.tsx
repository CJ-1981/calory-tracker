import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SugarAlert } from '../../src/components/SugarAlert';
import { MealCard } from '../../src/components/MealCard';
import { RootState, AppDispatch } from '../../src/store';
import { selectTodayMeals } from '../../src/store/mealSlice';
import { calculateDailyTotals } from '../../src/utils/calculator';
import { checkGoalProgress, checkSugarWarnings, calculateDailySummary } from '../../src/services/analyticsService';
import { Meal, DailyLog } from '../../src/models';
import { scaledFontSize } from '../../src/utils/fontUtils';

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, fontScale } = useTheme();
  const todayMeals = useSelector((state: RootState) => selectTodayMeals(state)) || [];
  const activeGoal = useSelector((state: RootState) => state.goals.activeGoal);

  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (todayMeals.length > 0) {
        const log = await calculateDailySummary(todayMeals);
        setDailyLog(log);

        if (activeGoal) {
          const sugarWarnings = await checkSugarWarnings(log, activeGoal);
          setWarnings(sugarWarnings);
        }
      }
    };
    loadData();
  }, [todayMeals, activeGoal]);

  const calorieProgress = activeGoal
    ? checkGoalProgress(dailyLog?.totalCalories || 0, activeGoal.calorieTarget)
    : null;

  const sugarProgress = activeGoal
    ? checkGoalProgress(dailyLog?.totalSugar || 0, activeGoal.sugarTarget)
    : null;

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'approaching':
        return '#FFA07A';
      default:
        return colors.success;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.background }]}>Today's Summary</Text>
        <Text style={[styles.headerDate, { color: colors.background }]}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sugar Warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            {warnings.map((warning) => (
              <SugarAlert key={warning.id} warning={warning} />
            ))}
          </View>
        )}

        {/* Calories Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Calories</Text>
          </View>
          {calorieProgress ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={[styles.progressValue, { color: colors.text, fontSize: Typography.fontSize.xxl * fontScale }]}>{dailyLog?.totalCalories || 0}</Text>
                <Text style={[styles.progressTarget, { color: colors.textSecondary }]}> / {activeGoal?.calorieTarget} cal</Text>
              </View>
              <ProgressBar
                progress={calorieProgress.percentage}
                color={getProgressColor(calorieProgress.status)}
                showLabel
              />
            </>
          ) : (
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No goal set</Text>
          )}
        </View>

        {/* Sugar Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={24} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Sugar</Text>
          </View>
          {sugarProgress ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={[styles.progressValue, { color: colors.text, fontSize: Typography.fontSize.xxl * fontScale }]}>{(dailyLog?.totalSugar || 0).toFixed(1)}</Text>
                <Text style={[styles.progressTarget, { color: colors.textSecondary }]}> / {activeGoal?.sugarTarget}g</Text>
              </View>
              <ProgressBar
                progress={sugarProgress.percentage}
                color={getProgressColor(sugarProgress.status)}
                showLabel
              />
            </>
          ) : (
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No goal set</Text>
          )}
        </View>

        {/* Macros */}
        {dailyLog && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Macros</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyLog.totalProtein.toFixed(1)}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyLog.totalCarbs.toFixed(1)}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>{dailyLog.totalFat.toFixed(1)}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Today's Meals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.seeAllText, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>No meals logged today</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Tap the button below to add your first meal</Text>
            </View>
          ) : (
            todayMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(`/meal/${meal.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Meal FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/add-meal')}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontWeight: Typography.fontWeight.bold,
  },
  headerDate: {
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  warningsContainer: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  progressValue: {
    fontWeight: Typography.fontWeight.bold,
  },
  progressTarget: {
  },
  noDataText: {
    textAlign: 'center',
    padding: Spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontWeight: Typography.fontWeight.bold,
  },
  macroLabel: {
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.semibold,
  },
  seeAllText: {
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyStateText: {
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
