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
import { useTheme } from '../../src/theme';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SugarAlert } from '../../src/components/SugarAlert';
import { MealCard } from '../../src/components/MealCard';
import { RootState, AppDispatch } from '../../src/store';
import { selectTodayMeals } from '../../src/store/mealSlice';
import { calculateDailyTotals } from '../../src/utils/calculator';
import { checkGoalProgress, checkSugarWarnings, calculateDailySummary } from '../../src/services/analyticsService';
import { Meal, DailyLog } from '../../src/models';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const todayMeals = useSelector((state: RootState) => selectTodayMeals(state)) || [];
  const activeGoal = useSelector((state: RootState) => state.goals.activeGoal);

  console.log('Dashboard - todayMeals:', todayMeals);
  console.log('Dashboard - activeGoal:', activeGoal);

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

  const styles = useDashboardStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Summary</Text>
        <Text style={styles.headerDate}>
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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Calories</Text>
          </View>
          {calorieProgress ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={styles.progressValue}>{dailyLog?.totalCalories || 0}</Text>
                <Text style={styles.progressTarget}> / {activeGoal?.calorieTarget} cal</Text>
              </View>
              <ProgressBar
                progress={calorieProgress.percentage}
                color={getProgressColor(calorieProgress.status)}
                showLabel
              />
            </>
          ) : (
            <Text style={styles.noDataText}>No goal set</Text>
          )}
        </View>

        {/* Sugar Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>Sugar</Text>
          </View>
          {sugarProgress ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={styles.progressValue}>{(dailyLog?.totalSugar || 0).toFixed(1)}</Text>
                <Text style={styles.progressTarget}> / {activeGoal?.sugarTarget}g</Text>
              </View>
              <ProgressBar
                progress={sugarProgress.percentage}
                color={getProgressColor(sugarProgress.status)}
                showLabel
              />
            </>
          ) : (
            <Text style={styles.noDataText}>No goal set</Text>
          )}
        </View>

        {/* Macros */}
        {dailyLog && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Macros</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{dailyLog.totalProtein.toFixed(1)}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{dailyLog.totalCarbs.toFixed(1)}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{dailyLog.totalFat.toFixed(1)}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No meals logged today</Text>
              <Text style={styles.emptyStateSubtext}>Tap the button below to add your first meal</Text>
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
        style={styles.fab}
        onPress={() => router.push('/(tabs)/add-meal')}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const useDashboardStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    ...Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.background,
  },
  headerDate: {
    ...Typography.fontSize.md,
    color: colors.background,
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
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: colors.text,
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
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  progressValue: {
    ...Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.text,
  },
  progressTarget: {
    ...Typography.fontSize.md,
    color: colors.textSecondary,
  },
  noDataText: {
    ...Typography.fontSize.md,
    color: colors.textSecondary,
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
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
  },
  macroLabel: {
    ...Typography.fontSize.sm,
    color: colors.textSecondary,
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
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: colors.text,
  },
  seeAllText: {
    ...Typography.fontSize.sm,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyStateText: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: colors.text,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    ...Typography.fontSize.sm,
    color: colors.textSecondary,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
