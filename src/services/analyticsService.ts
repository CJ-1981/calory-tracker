import { Meal, DailyLog, SugarWarning, ProgressStatus } from '../models';
import { Goal } from '../models/Goal';
import { calculateDailyTotals } from '../utils/calculator';
import * as Crypto from 'expo-crypto';

export const calculateDailySummary = async (meals: Meal[]): Promise<DailyLog> => {
  const totals = calculateDailyTotals(meals);
  const date = meals.length > 0 ? meals[0].date : new Date().toISOString().split('T')[0];

  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const id = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return {
    id,
    date,
    meals,
    ...totals,
  };
};

export const checkGoalProgress = (
  current: number,
  target: number
): ProgressStatus => {
  const percentage = Math.round((current / target) * 100);

  let status: 'on_track' | 'approaching' | 'warning' | 'exceeded';

  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  } else if (percentage >= 50) {
    status = 'approaching';
  } else {
    status = 'on_track';
  }

  return { percentage, status };
};

export const checkSugarWarnings = async (
  dailyLog: DailyLog,
  goals: Goal | null
): Promise<SugarWarning[]> => {
  if (!goals || !goals.warningsEnabled) return [];

  const warnings: SugarWarning[] = [];
  const { totalSugar, meals } = dailyLog;
  const { sugarTarget } = goals;
  const date = dailyLog.date;

  // Helper to generate ID
  const generateId = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  // Daily limit check
  if (totalSugar >= sugarTarget) {
    warnings.push({
      id: await generateId(),
      date,
      type: 'daily_limit',
      severity: 'danger',
      message: `You've exceeded your daily sugar limit! (${totalSugar.toFixed(1)}g / ${sugarTarget}g)`,
      currentSugar: totalSugar,
      limit: sugarTarget,
      dismissed: false,
    });
  } else if (totalSugar >= sugarTarget * 0.8) {
    warnings.push({
      id: await generateId(),
      date,
      type: 'approaching',
      severity: 'warning',
      message: `You're approaching your daily sugar limit (${totalSugar.toFixed(1)}g / ${sugarTarget}g)`,
      currentSugar: totalSugar,
      limit: sugarTarget,
      dismissed: false,
    });
  }

  // Check for sugar spikes in individual meals
  const mealSugarLimit = sugarTarget * 0.4; // No meal should be > 40% of daily
  for (const meal of meals) {
    if (meal.totalSugar > mealSugarLimit) {
      warnings.push({
        id: await generateId(),
        date,
        type: 'meal_spike',
        severity: 'warning',
        message: `High sugar in ${meal.type}: ${meal.totalSugar.toFixed(1)}g`,
        mealId: meal.id,
        currentSugar: meal.totalSugar,
        limit: mealSugarLimit,
        dismissed: false,
      });
    }
  }

  return warnings;
};

export const getMealTypeCounts = (meals: Meal[]): Record<string, number> => {
  return meals.reduce(
    (counts, meal) => {
      counts[meal.type] = (counts[meal.type] || 0) + 1;
      return counts;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  );
};

export const getWeeklyTrend = (
  meals: Meal[],
  dates: Date[]
): Array<{ date: string; calories: number; sugar: number }> => {
  return dates.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = meals.filter((meal) => meal.date === dateStr);
    const totals = calculateDailyTotals(dayMeals);
    return {
      date: dateStr,
      calories: totals.totalCalories,
      sugar: totals.totalSugar,
    };
  });
};
