import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ScaledText } from './ScaledText';
import { Spacing, BorderRadius } from '../theme';
import { FavoriteFoodEntry } from '../models/FoodHistory';

interface FavoriteFoodCardProps {
  favorite: FavoriteFoodEntry;
  onAddFood: (portionIndex: number) => void;
  onRemoveFavorite: () => void;
}

export const FavoriteFoodCard: React.FC<FavoriteFoodCardProps> = ({
  favorite,
  onAddFood,
  onRemoveFavorite,
}) => {
  const { colors } = useTheme();
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(favorite.defaultPortionIndex || 0);

  const selectedPortion = favorite.commonPortions[selectedPortionIndex] || {
    name: `${favorite.servingSize}${favorite.servingUnit}`,
    size: favorite.servingSize,
  };

  // Calculate nutrition for selected portion
  const multiplier = selectedPortion.size / favorite.servingSize;
  const calories = Math.round(favorite.calories * multiplier);

  const handlePortionSelect = (index: number) => {
    setSelectedPortionIndex(index);
  };

  const handleAddPress = () => {
    onAddFood(selectedPortionIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ScaledText
            style={StyleSheet.flatten([styles.name, { color: colors.text }])}
            fontSize={16}
            numberOfLines={1}
          >
            {favorite.name}
          </ScaledText>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <ScaledText
              style={StyleSheet.flatten([styles.categoryText, { color: colors.primary }])}
              fontSize={11}
            >
              {favorite.category}
            </ScaledText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={onRemoveFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.iconButton}
          >
            <Ionicons name="heart" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nutrition Preview */}
      <View style={styles.nutritionRow}>
        <ScaledText
          style={StyleSheet.flatten([styles.nutritionText, { color: colors.textSecondary }])}
          fontSize={13}
        >
          {selectedPortion.name} · {calories} cal
        </ScaledText>
      </View>

      {/* Portion Chips - Horizontal Scroll */}
      <View style={styles.portionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.portionsScroll}
        >
          {favorite.commonPortions.map((portion, index) => {
            const isSelected = index === selectedPortionIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePortionSelect(index)}
                style={StyleSheet.flatten([
                  styles.portionChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ])}
              >
                <ScaledText
                  style={StyleSheet.flatten([
                    styles.portionChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ])}
                  fontSize={12}
                >
                  {portion.name}
                </ScaledText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddPress}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <ScaledText style={styles.addButtonText} fontSize={14}>
          Add to Meal
        </ScaledText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  nutritionRow: {
    marginBottom: Spacing.sm,
  },
  nutritionText: {
    fontWeight: '500',
  },
  portionsContainer: {
    marginBottom: Spacing.sm,
  },
  portionsScroll: {
    paddingRight: Spacing.sm,
  },
  portionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  portionChipText: {
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});
