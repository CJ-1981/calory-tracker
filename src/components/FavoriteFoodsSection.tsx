import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ScaledText } from './ScaledText';
import { Spacing, BorderRadius } from '../theme';
import { FavoriteFoodEntry } from '../models/FoodHistory';
import { FavoriteFoodCard } from './FavoriteFoodCard';
import { getFoodById } from '../utils/foodDatabase';

interface FavoriteFoodsSectionProps {
  favoriteFoods: FavoriteFoodEntry[];
  onAddFood: (food: any, portionIndex: number) => void;
  onRemoveFavorite: (foodId: string) => void;
}

export const FavoriteFoodsSection: React.FC<FavoriteFoodsSectionProps> = ({
  favoriteFoods,
  onAddFood,
  onRemoveFavorite,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddFood = (favorite: FavoriteFoodEntry, portionIndex: number) => {
    // Get the full food object from the database
    const food = getFoodById(favorite.foodId);
    if (food) {
      onAddFood(food, portionIndex);
    }
  };

  const handleRemoveFavorite = (foodId: string) => {
    onRemoveFavorite(foodId);
  };

  if (favoriteFoods.length === 0) {
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
          <Ionicons name="heart" size={20} color={colors.danger} />
          <ScaledText
            style={StyleSheet.flatten([styles.title, { color: colors.text }])}
            fontSize={16}
          >
            Favorites ({favoriteFoods.length})
          </ScaledText>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Content - Vertical List */}
      {isExpanded && (
        <View style={styles.content}>
          <FlatList
            scrollEnabled={false}
            data={favoriteFoods}
            keyExtractor={(item) => item.foodId}
            renderItem={({ item }) => (
              <FavoriteFoodCard
                favorite={item}
                onAddFood={(portionIndex) => handleAddFood(item, portionIndex)}
                onRemoveFavorite={() => handleRemoveFavorite(item.foodId)}
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
  content: {
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xs,
  },
});
