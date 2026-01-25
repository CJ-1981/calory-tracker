import React, { useState, useEffect, useRef } from 'react';
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

import { Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Goal } from '../../src/models';
import { RootState, AppDispatch } from '../../src/store';
import { updateGoal, setDefaultGoal } from '../../src/store';
import { DEFAULT_GOALS } from '../../src/utils/constants';
import { Alert } from '../../src/utils/alert';
import { scaledFontSize } from '../../src/utils/fontUtils';

export default function GoalsScreen() {
  const { colors, fontScale } = useTheme();
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
    color = colors.primary,
    quickButtons = false,
    step = 10,
  }: any) => {
    const incrementValue = (amount: number) => {
      const currentValue = parseFloat(value) || 0;
      const newValue = Math.max(0, currentValue + amount);
      onValueChange(newValue.toString());
    };

    return (
      <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
        <View style={styles.goalHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={[styles.goalLabel, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{label}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            key={`${label}-input`}
            style={[styles.goalInput, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}
            defaultValue={value}
            onEndEditing={(e) => onValueChange(e.nativeEvent.text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.goalUnit, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{unit}</Text>
        </View>
        {quickButtons && (
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => incrementValue(-step)}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                -{step}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => incrementValue(-step * 2)}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                -{step * 2}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => incrementValue(step)}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                +{step}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => incrementValue(step * 2)}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                +{step * 2}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>My Goals</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.info }]}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
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
          color={colors.primary}
          quickButtons={true}
          step={100}
        />

        {/* Sugar Goal - Primary Focus */}
        <View style={[styles.sugarFocusCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <View style={styles.sugarFocusHeader}>
            <Ionicons name="cube" size={28} color={colors.secondary} />
            <View style={styles.sugarFocusText}>
              <Text style={[styles.sugarFocusTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Daily Sugar Limit</Text>
              <Text style={[styles.sugarFocusSubtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Primary tracking metric</Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              key="sugar-input"
              style={[styles.goalInput, styles.sugarInput, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}
              defaultValue={sugarTarget}
              onEndEditing={(e) => setSugarTarget(e.nativeEvent.text)}
              keyboardType="decimal-pad"
              placeholder="50"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.goalUnit, styles.sugarUnit, { color: colors.secondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>grams</Text>
          </View>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => {
                const currentValue = parseFloat(sugarTarget) || 0;
                const newValue = Math.max(0, currentValue - 5);
                setSugarTarget(newValue.toString());
              }}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>-5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => {
                const currentValue = parseFloat(sugarTarget) || 0;
                const newValue = Math.max(0, currentValue - 10);
                setSugarTarget(newValue.toString());
              }}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>-10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => {
                const currentValue = parseFloat(sugarTarget) || 0;
                setSugarTarget((currentValue + 5).toString());
              }}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>+5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.border }]}
              onPress={() => {
                const currentValue = parseFloat(sugarTarget) || 0;
                setSugarTarget((currentValue + 10).toString());
              }}
            >
              <Text style={[styles.quickButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>+10</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sugarInfo}>
            <Text style={[styles.sugarInfoText, { fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              Recommended: 25-50g/day for most adults
            </Text>
          </View>
        </View>

        {/* Macro Goals */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Macros (Optional)</Text>

        <GoalInput
          label="Protein Target"
          value={proteinTarget}
          onValueChange={setProteinTarget}
          unit="g"
          icon="fitness"
          color={colors.accent}
          quickButtons={true}
          step={10}
        />

        <GoalInput
          label="Carbs Target"
          value={carbTarget}
          onValueChange={setCarbTarget}
          unit="g"
          icon="leaf"
          color={colors.success}
          quickButtons={true}
          step={50}
        />

        <GoalInput
          label="Fat Target"
          value={fatTarget}
          onValueChange={setFatTarget}
          unit="g"
          icon="water"
          color={colors.warning}
          quickButtons={true}
          step={10}
        />

        {/* Warnings Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
          <View style={styles.toggleHeader}>
            <Ionicons name="notifications" size={24} color={colors.text} />
            <View style={styles.toggleText}>
              <Text style={[styles.toggleTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Sugar Alerts</Text>
              <Text style={[styles.toggleSubtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Get notified when approaching sugar limit
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              warningsEnabled ? { backgroundColor: colors.success } : { backgroundColor: colors.border },
            ]}
            onPress={() => {
              setWarningsEnabled(!warningsEnabled);
              setHasChanges(true);
            }}
          >
            <Ionicons
              name={warningsEnabled ? 'checkmark' : 'close'}
              size={20}
              color={warningsEnabled ? colors.background : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface }]} onPress={setDefaults}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: hasChanges ? colors.primary : colors.border }]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Text style={[styles.primaryButtonText, { color: hasChanges ? colors.background : colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Save Goals</Text>
          </TouchableOpacity>
        </View>
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
  infoCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  infoText: {
    color: "#333333",
    flex: 1,
    marginLeft: Spacing.sm,
  },
  goalCard: {
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
    fontWeight: Typography.fontWeight.semibold,
    color: "#333333",
    marginLeft: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  goalUnit: {
    color: "#666666",
    marginLeft: Spacing.sm,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  quickButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  sugarFocusCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "#4ECDC4",
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
    fontWeight: Typography.fontWeight.bold,
    color: "#333333",
  },
  sugarFocusSubtitle: {
    color: "#666666",
  },
  sugarInput: {
    borderColor: "#4ECDC4",
  },
  sugarUnit: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#4ECDC4",
  },
  sugarInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(78, 205, 196, 0.25)",
  },
  sugarInfoText: {
    color: "#666666",
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#333333",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  toggleCard: {
    flexDirection: 'row',
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
    fontWeight: Typography.fontWeight.semibold,
    color: "#333333",
  },
  toggleSubtitle: {
    color: "#666666",
  },
  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  secondaryButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
  },
  primaryButtonText: {
    fontWeight: Typography.fontWeight.bold,
  },
});
