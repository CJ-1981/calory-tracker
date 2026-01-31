import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ScaledText } from './ScaledText';
import { Spacing, BorderRadius } from '../theme';
import { RecentFoodEntry } from '../models/FoodHistory';
import { RecentFoodCard } from './RecentFoodCard';

interface RecentFoodsSectionProps {
  recentFoods: RecentFoodEntry[];
  onAddFood: (entry: RecentFoodEntry) => void;
  onClearAll: () => void;
  favoriteFoodIds: string[];
}

export const RecentFoodsSection: React.FC<RecentFoodsSectionProps> = ({
  recentFoods,
  onAddFood,
  onClearAll,
  favoriteFoodIds,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter out invalid entries (old format without commonPortions)
  const validRecentFoods = recentFoods.filter(
    (entry) => entry?.commonPortions && Array.isArray(entry.commonPortions)
  );

  if (validRecentFoods.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <ScaledText
            style={StyleSheet.flatten([styles.title, { color: colors.text }])}
            fontSize={16}
          >
            Recent Foods ({validRecentFoods.length})
          </ScaledText>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearButton}
          >
            <ScaledText
              style={StyleSheet.flatten([styles.clearText, { color: colors.danger }])}
              fontSize={13}
            >
              Clear All
            </ScaledText>
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={validRecentFoods}
            keyExtractor={(item) => item.foodId}
            renderItem={({ item }) => (
              <RecentFoodCard
                entry={item}
                onPress={() => onAddFood(item)}
                isFavorite={favoriteFoodIds.includes(item.foodId)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: Spacing.sm,
  },
  clearText: {
    fontWeight: '500',
  },
  content: {
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingRight: Spacing.md,
  },
});
