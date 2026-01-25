import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { MealType, FoodItem, Meal } from '../../src/models';
import { addMeal } from '../../src/store';
import { calculateMealTotals, calculateNutrition } from '../../src/utils/calculator';
import { MEAL_TYPES } from '../../src/utils/constants';
import { AppDispatch } from '../../src/store';
import { RootState } from '../../src/store';
import { useSelector } from 'react-redux';
import {
  foodDatabase,
  foodCategories,
  FoodDatabaseItem,
  searchFoodDatabase,
} from '../../src/utils/foodDatabase';
import { Alert } from '../../src/utils/alert';
import { scaledFontSize } from '../../src/utils/fontUtils';

export default function AddMealScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, fontScale } = useTheme();
  const meals = useSelector((state: RootState) => state.meals.meals) || [];

  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [sugar, setSugar] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [notes, setNotes] = useState('');

  const [currentFoods, setCurrentFoods] = useState<FoodItem[]>([]);

  // Food search modal state
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<number>(100);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const addFoodItem = () => {
    if (!foodName || !calories || !sugar) {
      Alert.alert('Missing Info', 'Please enter at least the food name, calories, and sugar.');
      return;
    }

    const baseFood = {
      name: foodName,
      quantity: parseFloat(servingSize) || 100,
      servingSize: parseFloat(servingSize) || 100,
      servingUnit,
      calories: parseFloat(calories) || 0,
      sugar: parseFloat(sugar) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    };

    const calculatedFood = calculateNutrition(baseFood, baseFood.quantity);

    setCurrentFoods([
      ...currentFoods,
      {
        ...calculatedFood,
        foodId: Date.now().toString(),
        quantity: baseFood.quantity,
      },
    ]);

    // Reset form
    setFoodName('');
    setServingSize('100');
    setCalories('');
    setSugar('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const addFoodFromDatabase = (food: FoodDatabaseItem, portionIndex: number = 0) => {
    console.log('addFoodFromDatabase called with:', food.name, 'portion:', portionIndex);

    const portionSize = food.commonPortions[portionIndex]?.size || food.servingSize;

    const baseFood = {
      name: food.name,
      quantity: portionSize,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      sugar: food.sugar,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };

    const calculatedFood = calculateNutrition(baseFood, portionSize);

    console.log('Calculated food:', calculatedFood);

    setCurrentFoods([
      ...currentFoods,
      {
        ...calculatedFood,
        foodId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity: portionSize,
      },
    ]);

    console.log('Updated currentFoods:', [...currentFoods, {
        ...calculatedFood,
        foodId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity: portionSize,
      }]);

    Alert.alert('Added!', `${food.name} (${food.commonPortions[portionIndex]?.name || portionSize}${food.servingUnit}) added to meal.`);
    setShowFoodSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
  };

  const removeFood = (foodId: string) => {
    setCurrentFoods(currentFoods.filter((f) => f.foodId !== foodId));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const results = searchFoodDatabase(text);
      const filtered = selectedCategory === 'All'
        ? results
        : results.filter((f) => f.category === selectedCategory);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const saveMeal = async () => {
    console.log('saveMeal called, currentFoods:', currentFoods);

    if (currentFoods.length === 0) {
      Alert.alert('No Foods', 'Please add at least one food item to your meal.');
      return;
    }

    const totals = calculateMealTotals(currentFoods);

    const newMeal = {
      date: new Date().toISOString().split('T')[0],
      type: mealType,
      foods: currentFoods,
      totalCalories: totals.totalCalories,
      totalSugar: totals.totalSugar,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFat: totals.totalFat,
      photoUri,
      notes,
    };

    console.log('Dispatching addMeal with:', newMeal);

    try {
      const result = await dispatch(addMeal(newMeal));
      console.log('addMeal result:', result);
      Alert.alert('Success', 'Meal logged successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    }
  };

  const mealTotals = calculateMealTotals(currentFoods);
  const selectedMealType = MEAL_TYPES.find((t) => t.value === mealType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.background }]}>Log Meal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Meal Type</Text>
          <View style={styles.mealTypes}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.mealTypeButton,
                  { backgroundColor: colors.surface },
                  mealType === type.value && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type.value as MealType)}
              >
                <Text style={[styles.mealTypeIcon, { fontSize: scaledFontSize(Typography.fontSize.xl, fontScale) }]}>{type.icon}</Text>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) },
                    mealType === type.value && { color: colors.primary },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Photo (Optional)</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surface }]} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.photoButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surface }]} onPress={pickImage}>
              <Ionicons name="image" size={24} color={colors.primary} />
              <Text style={[styles.photoButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
          {photoUri && (
            <View style={styles.photoPreview}>
              <TouchableOpacity onPress={() => setFullscreenPhoto(photoUri)} activeOpacity={0.9}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setPhotoUri(undefined)}
              >
                <Ionicons name="close-circle" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add Food - Quick Search */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.searchFoodButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowFoodSearch(true)}
          >
            <Ionicons name="search" size={24} color={colors.background} />
            <View style={styles.searchFoodContent}>
              <Text style={[styles.searchFoodTitle, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Search Food Database</Text>
              <Text style={[styles.searchFoodSubtitle, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Quickly add common foods</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Manual Entry */}
        <View style={styles.section}>
          <View style={styles.manualEntryHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Or Enter Manually</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Food Name *</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="e.g., Grilled Chicken"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Serving Size</Text>
                <TextInput
                  style={styles.input}
                  value={servingSize}
                  onChangeText={setServingSize}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={servingUnit}
                  onChangeText={setServingUnit}
                  placeholder="g"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Sugar (g) *</Text>
                <TextInput
                  style={styles.input}
                  value={sugar}
                  onChangeText={setSugar}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addFoodItem}>
              <Ionicons name="add" size={20} color={colors.background} />
              <Text style={[styles.addButtonText, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Add to Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Food List */}
        {currentFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Foods in this Meal</Text>
            {currentFoods.map((food) => (
              <View key={food.foodId} style={[styles.foodItem, { backgroundColor: colors.surface }]}>
                <View style={styles.flex1}>
                  <Text style={[styles.foodName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{food.name}</Text>
                  <Text style={[styles.foodDetails, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    {food.quantity}{food.servingUnit} • {food.calories} cal • {food.sugar}g sugar
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeFood(food.foodId)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.totalsCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.totalsTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Meal Totals</Text>
              <View style={styles.totalsRow}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Calories:</Text>
                <Text style={[styles.totalValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{mealTotals.totalCalories} cal</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Sugar:</Text>
                <Text style={[styles.totalValue, { color: colors.secondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  {mealTotals.totalSugar.toFixed(1)}g
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Protein:</Text>
                <Text style={[styles.totalValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{mealTotals.totalProtein.toFixed(1)}g</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this meal..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: currentFoods.length > 0 ? colors.primary : colors.border }]}
          onPress={saveMeal}
          disabled={currentFoods.length === 0}
        >
          <Text style={[styles.saveButtonText, { color: currentFoods.length > 0 ? colors.background : colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Save Meal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Food Search Modal */}
      <Modal
        visible={showFoodSearch}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFoodSearch(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Search Foods</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchSection}>
            <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                placeholder="Search foods..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {foodCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.surface },
                  selectedCategory === category && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  if (searchQuery.length > 0) {
                    const results = searchFoodDatabase(searchQuery);
                    const filtered = category === 'All'
                      ? results
                      : results.filter((f) => f.category === category);
                    setSearchResults(filtered);
                  }
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) },
                    selectedCategory === category && { color: colors.background },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Results */}
          {searchQuery.length === 0 ? (
            <View style={styles.emptySearchState}>
              <Ionicons name="search" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptySearchTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Search for foods</Text>
              <Text style={[styles.emptySearchText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Try searching for "apple", "chicken", "rice", etc.
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptySearchState}>
              <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptySearchTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>No foods found</Text>
              <Text style={[styles.emptySearchText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Try a different search term</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.foodSearchResult, { backgroundColor: colors.surface }]}>
                  <View style={styles.foodSearchInfo}>
                    <Text style={[styles.foodSearchName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{item.name}</Text>
                    <Text style={[styles.foodSearchCategory, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{item.category}</Text>
                    <Text style={[styles.foodSearchNutrition, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                      {item.calories} cal • {item.sugar}g sugar
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.portionsScroll}
                  >
                    {item.commonPortions.map((portion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.portionButton}
                        onPress={() => addFoodFromDatabase(item, index)}
                      >
                        <Text style={[styles.portionButtonName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{portion.name}</Text>
                        <Text style={[styles.portionButtonSize, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>{portion.size}{item.servingUnit}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              style={styles.searchResults}
            />
          )}
        </View>
      </Modal>

      {/* Fullscreen Photo Modal */}
      <Modal
        visible={fullscreenPhoto !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFullscreenPhoto(null)}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setFullscreenPhoto(null)}
          >
            <Ionicons name="close-circle" size={40} color={colors.background} />
          </TouchableOpacity>
          {fullscreenPhoto && (
            <Image source={{ uri: fullscreenPhoto }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#333333",
    marginBottom: Spacing.sm,
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonActive: {
    borderColor: "#FF6B6B",
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  mealTypeIcon: {
    marginBottom: Spacing.xs,
  },
  mealTypeLabel: {
    color: "#333333",
  },
  mealTypeLabelActive: {
    color: "#FF6B6B",
    fontWeight: Typography.fontWeight.semibold,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  photoButtonText: {
    color: "#333333",
    marginTop: Spacing.xs,
  },
  photoPreview: {
    marginTop: Spacing.md,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removePhoto: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  searchFoodButton: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchFoodContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  searchFoodTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  searchFoodSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  manualEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontWeight: '500',
    color: "#333333",
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    fontWeight: '600',
    color: "#FFFFFF",
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontWeight: '500',
    color: "#333333",
  },
  foodDetails: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  totalsCard: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalsTitle: {
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  totalLabel: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  totalValue: {
    fontWeight: 'bold',
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: "#FFFFFF",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalCancel: {
    color: "#FF6B6B",
  },
  modalTitle: {
    fontWeight: 'bold',
    color: "#333333",
  },
  searchSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    padding: Spacing.md,
    color: "#333333",
  },
  categoriesScroll: {
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: "transparent",
  },
  categoryChipText: {
    color: "#333333",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: '600',
  },
  emptySearchState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptySearchTitle: {
    fontWeight: '600',
    color: "#333333",
    marginTop: Spacing.md,
  },
  emptySearchText: {
    color: "#666666",
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
  },
  foodSearchResult: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  foodSearchInfo: {
    marginBottom: Spacing.sm,
  },
  foodSearchName: {
    fontWeight: '600',
    color: "#333333",
  },
  foodSearchCategory: {
    color: "#FF6B6B",
    marginTop: Spacing.xs,
  },
  foodSearchNutrition: {
    color: "#666666",
  },
  portionsScroll: {
    marginTop: Spacing.sm,
  },
  portionButton: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  portionButtonName: {
    fontWeight: '600',
    color: "#FFFFFF",
  },
  portionButtonSize: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
});
