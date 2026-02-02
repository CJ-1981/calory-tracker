import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Spacing, BorderRadius, Typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { scaledFontSize } from '../utils/fontUtils';

interface Recommendation {
  id: string;
  nutrient: string;
  icon: string;
  recommendation: string;
  value: number;
  unit: string;
  explanation: string;
  color: string;
}

const GOAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'calories',
    nutrient: 'Daily Calories',
    icon: 'flame',
    recommendation: '2000',
    value: 2000,
    unit: 'cal',
    explanation: 'Based on average adult needs. Adjust based on your activity level, age, and goals.',
    color: '#FF6B6B',
  },
  {
    id: 'sugar',
    nutrient: 'Sugar Limit',
    icon: 'cube',
    recommendation: '37.5g',
    value: 37.5,
    unit: 'g',
    explanation: 'American Heart Association recommends no more than 25g (women) or 36g (men) of added sugar per day.',
    color: '#4ECDC4',
  },
  {
    id: 'protein',
    nutrient: 'Protein Target',
    icon: 'fitness',
    recommendation: '50g',
    value: 50,
    unit: 'g',
    explanation: 'Aim for 0.8-1g of protein per kg of body weight for maintaining muscle mass.',
    color: '#95E1D3',
  },
  {
    id: 'carbs',
    nutrient: 'Carbs Target',
    icon: 'leaf',
    recommendation: '250g',
    value: 250,
    unit: 'g',
    explanation: 'Complex carbs provide sustained energy. Focus on whole grains, fruits, and vegetables.',
    color: '#4CAF50',
  },
  {
    id: 'fat',
    nutrient: 'Fat Target',
    icon: 'water',
    recommendation: '65g',
    value: 65,
    unit: 'g',
    explanation: 'Healthy fats from avocados, nuts, and olive oil. Limit saturated and trans fats.',
    color: '#FFD93D',
  },
];

interface GoalRecommendationsProps {
  onSelectRecommendations: (goals: {
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
  selectedGender?: 'male' | 'female' | null;
}

export const GoalRecommendations: React.FC<GoalRecommendationsProps> = ({
  onSelectRecommendations,
  selectedGender = null,
}) => {
  const { colors, fontScale } = useTheme();

  // Adjust sugar recommendation based on gender
  const initialRecommendations = GOAL_RECOMMENDATIONS.map(rec => {
    if (rec.id === 'sugar' && selectedGender === 'female') {
      return { ...rec, value: 25, recommendation: '25g' };
    }
    if (rec.id === 'sugar' && selectedGender === 'male') {
      return { ...rec, value: 36, recommendation: '36g' };
    }
    return rec;
  });

  // State for editable goal values
  const [goalValues, setGoalValues] = useState({
    calories: initialRecommendations[0].value,
    sugar: initialRecommendations[1].value,
    protein: initialRecommendations[2].value,
    carbs: initialRecommendations[3].value,
    fat: initialRecommendations[4].value,
  });

  const updateGoalValue = (id: string, newValue: number) => {
    const idToKeyMap: Record<string, keyof typeof goalValues> = {
      'calories': 'calories',
      'sugar': 'sugar',
      'protein': 'protein',
      'carbs': 'carbs',
      'fat': 'fat',
    };
    const key = idToKeyMap[id];
    if (key) {
      setGoalValues(prev => ({ ...prev, [key]: newValue }));
    }
  };

  const handleAcceptAll = () => {
    onSelectRecommendations(goalValues);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>
          Recommended Goals
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
          Based on nutritional guidelines for average adults
        </Text>
      </View>

      {initialRecommendations.map((rec) => {
        const currentValue = goalValues[rec.id as keyof typeof goalValues];
        return (
          <View key={rec.id} style={[styles.recommendationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.recommendationHeader}>
              <View style={[styles.iconContainer, { backgroundColor: rec.color + '20' }]}>
                <Ionicons name={rec.icon as any} size={28} color={rec.color} />
              </View>
              <View style={styles.recommendationInfo}>
                <Text style={[styles.nutrientName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
                  {rec.nutrient}
                </Text>
                <View style={styles.editContainer}>
                  <TouchableOpacity
                    style={[styles.adjustButton, { borderColor: colors.border }]}
                    onPress={() => updateGoalValue(rec.id, Math.max(0, currentValue - (rec.id === 'calories' ? 50 : 5)))}
                    accessibilityLabel={`Decrease ${rec.nutrient}`}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.valueContainer}>
                    <Text style={[styles.recommendationValue, { color: rec.color, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>
                      {currentValue}
                    </Text>
                    <Text style={[styles.recommendationUnit, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                      {rec.unit}/day
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.adjustButton, { borderColor: colors.border }]}
                    onPress={() => updateGoalValue(rec.id, currentValue + (rec.id === 'calories' ? 50 : 5))}
                    accessibilityLabel={`Increase ${rec.nutrient}`}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.explanationContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
              <Text style={[styles.explanation, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                {rec.explanation}
              </Text>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.acceptButton, { backgroundColor: colors.primary }]}
        onPress={handleAcceptAll}
        accessibilityLabel="Use recommended goals"
        accessibilityRole="button"
        accessibilityHint="Set all goals to recommended values"
      >
        <Ionicons name="checkmark-circle" size={24} color={colors.background} />
        <Text style={[styles.acceptButtonText, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
          Use These Recommendations
        </Text>
      </TouchableOpacity>

      <View style={styles.customizeNote}>
        <Text style={[styles.customizeNoteText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
          💡 You can customize these goals anytime in the Settings
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  recommendationCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  nutrientName: {
    fontWeight: Typography.fontWeight.semibold,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
    justifyContent: 'center',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  explanation: {
    flex: 1,
    lineHeight: 20,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    minHeight: 56,
  },
  acceptButtonText: {
    fontWeight: Typography.fontWeight.bold,
  },
  customizeNote: {
    padding: Spacing.lg,
  },
  customizeNoteText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
