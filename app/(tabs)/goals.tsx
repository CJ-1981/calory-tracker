import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { Goal } from '../../src/models';
import { RootState, AppDispatch } from '../../src/store';
import { updateGoal, setDefaultGoal } from '../../src/store';
import { DEFAULT_GOALS } from '../../src/utils/constants';
import { Alert } from '../../src/utils/alert';

export default function GoalsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const activeGoal = useSelector((state: RootState) => state.goals.activeGoal);
  const goals = useSelector((state: RootState) => state.goals.goals);

  const [calorieTarget, setCalorieTarget] = useState(activeGoal?.calorieTarget?.toString() || DEFAULT_GOALS.calories.toString());
  const [sugarTarget, setSugarTarget] = useState(activeGoal?.sugarTarget?.toString() || DEFAULT_GOALS.sugar.toString());
  const [proteinTarget, setProteinTarget] = useState(activeGoal?.proteinTarget?.toString() || DEFAULT_GOALS.protein.toString());
  const [carbTarget, setCarbTarget] = useState(activeGoal?.carbTarget?.toString() || DEFAULT_GOALS.carbs.toString());
  const [fatTarget, setFatTarget] = useState(activeGoal?.fatTarget?.toString() || DEFAULT_GOALS.fat.toString());
  const [warningsEnabled, setWarningsEnabled] = useState(activeGoal?.warningsEnabled ?? true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (activeGoal) {
      setCalorieTarget(activeGoal.calorieTarget.toString());
      setSugarTarget(activeGoal.sugarTarget.toString());
      setProteinTarget(activeGoal.proteinTarget.toString());
      setCarbTarget(activeGoal.carbTarget.toString());
      setFatTarget(activeGoal.fatTarget.toString());
      setWarningsEnabled(activeGoal.warningsEnabled);
    }
  }, [activeGoal]);

  const handleSave = async () => {
    const calorieNum = parseFloat(calorieTarget);
    const sugarNum = parseFloat(sugarTarget);
    const proteinNum = parseFloat(proteinTarget);
    const carbNum = parseFloat(carbTarget);
    const fatNum = parseFloat(fatTarget);

    if (isNaN(calorieNum) || calorieNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid calorie target.');
      return;
    }

    if (isNaN(sugarNum) || sugarNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid sugar target.');
      return;
    }

    const updatedGoal: Goal = activeGoal
      ? {
          ...activeGoal,
          calorieTarget: calorieNum,
          sugarTarget: sugarNum,
          proteinTarget: proteinNum || 0,
          carbTarget: carbNum || 0,
          fatTarget: fatNum || 0,
          warningsEnabled,
        }
      : {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          calorieTarget: calorieNum,
          sugarTarget: sugarNum,
          proteinTarget: proteinNum || 0,
          carbTarget: carbNum || 0,
          fatTarget: fatNum || 0,
          startDate: new Date().toISOString(),
          isActive: true,
          warningsEnabled,
        };

    try {
      await dispatch(updateGoal(updatedGoal));
      Alert.alert('Success', 'Goals updated successfully!');
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  };

  const setDefaults = () => {
    setCalorieTarget(DEFAULT_GOALS.calories.toString());
    setSugarTarget(DEFAULT_GOALS.sugar.toString());
    setProteinTarget(DEFAULT_GOALS.protein.toString());
    setCarbTarget(DEFAULT_GOALS.carbs.toString());
    setFatTarget(DEFAULT_GOALS.fat.toString());
    setWarningsEnabled(true);
    setHasChanges(true);
  };

  useEffect(() => {
    const current = { calorieTarget, sugarTarget, proteinTarget, carbTarget, fatTarget, warningsEnabled };
    const original = activeGoal
      ? {
          calorieTarget: activeGoal.calorieTarget.toString(),
          sugarTarget: activeGoal.sugarTarget.toString(),
          proteinTarget: activeGoal.proteinTarget.toString(),
          carbTarget: activeGoal.carbTarget.toString(),
          fatTarget: activeGoal.fatTarget.toString(),
          warningsEnabled: activeGoal.warningsEnabled,
        }
      : {
          calorieTarget: DEFAULT_GOALS.calories.toString(),
          sugarTarget: DEFAULT_GOALS.sugar.toString(),
          proteinTarget: DEFAULT_GOALS.protein.toString(),
          carbTarget: DEFAULT_GOALS.carbs.toString(),
          fatTarget: DEFAULT_GOALS.fat.toString(),
          warningsEnabled: true,
        };

    setHasChanges(JSON.stringify(current) !== JSON.stringify(original));
  }, [calorieTarget, sugarTarget, proteinTarget, carbTarget, fatTarget, warningsEnabled, activeGoal]);

  const GoalInput = ({
    label,
    value,
    onValueChange,
    unit,
    icon,
    color = Colors.light.primary,
  }: any) => (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.goalLabel}>{label}</Text>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.goalInput}
          value={value}
          onChangeText={onValueChange}
          keyboardType="numeric"
          placeholder="0"
        />
        <Text style={styles.goalUnit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Goals</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.light.info} />
          <Text style={styles.infoText}>
            Set your daily nutritional targets. The app will track your progress and alert you
            when approaching your limits.
          </Text>
        </View>

        {/* Calorie Goal */}
        <GoalInput
          label="Daily Calories"
          value={calorieTarget}
          onValueChange={setCalorieTarget}
          unit="cal"
          icon="flame"
          color={Colors.light.primary}
        />

        {/* Sugar Goal - Primary Focus */}
        <View style={styles.sugarFocusCard}>
          <View style={styles.sugarFocusHeader}>
            <Ionicons name="cube" size={28} color={Colors.light.secondary} />
            <View style={styles.sugarFocusText}>
              <Text style={styles.sugarFocusTitle}>Daily Sugar Limit</Text>
              <Text style={styles.sugarFocusSubtitle}>Primary tracking metric</Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.goalInput, styles.sugarInput]}
              value={sugarTarget}
              onChangeText={setSugarTarget}
              keyboardType="decimal-pad"
              placeholder="50"
            />
            <Text style={[styles.goalUnit, styles.sugarUnit]}>grams</Text>
          </View>
          <View style={styles.sugarInfo}>
            <Text style={styles.sugarInfoText}>
              Recommended: 25-50g/day for most adults
            </Text>
          </View>
        </View>

        {/* Macro Goals */}
        <Text style={styles.sectionTitle}>Macros (Optional)</Text>

        <GoalInput
          label="Protein Target"
          value={proteinTarget}
          onValueChange={setProteinTarget}
          unit="g"
          icon="fitness"
          color={Colors.light.accent}
        />

        <GoalInput
          label="Carbs Target"
          value={carbTarget}
          onValueChange={setCarbTarget}
          unit="g"
          icon="leaf"
          color={Colors.light.success}
        />

        <GoalInput
          label="Fat Target"
          value={fatTarget}
          onValueChange={setFatTarget}
          unit="g"
          icon="water"
          color={Colors.light.warning}
        />

        {/* Warnings Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <Ionicons name="notifications" size={24} color={Colors.light.text} />
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Sugar Alerts</Text>
              <Text style={styles.toggleSubtitle}>
                Get notified when approaching sugar limit
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, warningsEnabled && styles.toggleButtonActive]}
            onPress={() => {
              setWarningsEnabled(!warningsEnabled);
              setHasChanges(true);
            }}
          >
            <Ionicons
              name={warningsEnabled ? 'checkmark' : 'close'}
              size={20}
              color={Colors.light.background}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={setDefaults}>
            <Ionicons name="refresh" size={20} color={Colors.light.primary} />
            <Text style={styles.secondaryButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, !hasChanges && styles.primaryButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Text style={styles.primaryButtonText}>Save Goals</Text>
          </TouchableOpacity>
        </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.light.info}20`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.info,
  },
  infoText: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  goalCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalLabel: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  goalUnit: {
    ...Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  sugarFocusCard: {
    backgroundColor: `${Colors.light.secondary}20`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
  },
  sugarFocusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sugarFocusText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  sugarFocusTitle: {
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  sugarFocusSubtitle: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  sugarInput: {
    borderColor: Colors.light.secondary,
  },
  sugarUnit: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.secondary,
  },
  sugarInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: `${Colors.light.secondary}40`,
  },
  sugarInfoText: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  toggleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  toggleTitle: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  toggleSubtitle: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.success,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  primaryButtonText: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
});
