import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ScaledText } from './ScaledText';
import { Spacing, BorderRadius } from '../theme';
import { RecentFoodEntry } from '../models/FoodHistory';
import { formatTimeAgo } from '../utils/foodHistoryUtils';

interface RecentFoodCardProps {
  entry: RecentFoodEntry;
  onPress: () => void;
  isFavorite: boolean;
}

export const RecentFoodCard: React.FC<RecentFoodCardProps> = ({
  entry,
  onPress,
  isFavorite,
}) => {
  const { colors } = useTheme();

  // Safely format values
  const foodName = String(entry?.name || '');
  const quantityValue = Number(entry?.quantity || 0);
  const servingUnit = String(entry?.servingUnit || 'g');
  const caloriesValue = Math.round(Number(entry?.calories || 0));
  const timestampValue = Number(entry?.lastUsedAt || Date.now());

  // Format display strings
  const portionDisplay = `${quantityValue} ${servingUnit}`;
  const caloriesDisplay = `${caloriesValue} cal`;
  const timeDisplay = formatTimeAgo(timestampValue);

  // Check if this is a valid recent food entry (has required fields)
  const isValidEntry = entry?.commonPortions && Array.isArray(entry.commonPortions);

  if (!foodName || !isValidEntry) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <ScaledText
          style={StyleSheet.flatten([styles.name, { color: colors.text }])}
          fontSize={14}
          numberOfLines={1}
        >
          {foodName}
        </ScaledText>

        <View style={styles.details}>
          <ScaledText
            style={StyleSheet.flatten([styles.portion, { color: colors.textSecondary }])}
            fontSize={12}
          >
            {portionDisplay}
          </ScaledText>
          <ScaledText
            style={StyleSheet.flatten([styles.calories, { color: colors.textSecondary }])}
            fontSize={12}
          >
            {caloriesDisplay}
          </ScaledText>
        </View>

        <ScaledText
          style={StyleSheet.flatten([styles.timeAgo, { color: colors.textSecondary }])}
          fontSize={11}
        >
          {timeDisplay}
        </ScaledText>

        {isFavorite && (
          <View style={[styles.favoriteBadge, { backgroundColor: colors.danger + '20' }]}>
            <Ionicons name="heart" size={12} color={colors.danger} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    position: 'relative',
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  portion: {
    flex: 1,
  },
  calories: {
    flex: 0,
  },
  timeAgo: {
    fontStyle: 'italic',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 12,
    padding: 4,
  },
});
