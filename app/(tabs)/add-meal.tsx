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

import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
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

export default function AddMealScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Meal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypes}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.mealTypeButton,
                  mealType === type.value && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type.value as MealType)}
              >
                <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    mealType === type.value && styles.mealTypeLabelActive,
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
          <Text style={styles.sectionTitle}>Photo (Optional)</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color={Colors.light.primary} />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color={Colors.light.primary} />
              <Text style={styles.photoButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
          {photoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setPhotoUri(undefined)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.light.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add Food - Quick Search */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.searchFoodButton}
            onPress={() => setShowFoodSearch(true)}
          >
            <Ionicons name="search" size={24} color={Colors.light.background} />
            <View style={styles.searchFoodContent}>
              <Text style={styles.searchFoodTitle}>Search Food Database</Text>
              <Text style={styles.searchFoodSubtitle}>Quickly add common foods</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.light.background} />
          </TouchableOpacity>
        </View>

        {/* Manual Entry */}
        <View style={styles.section}>
          <View style={styles.manualEntryHeader}>
            <Text style={styles.sectionTitle}>Or Enter Manually</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Name *</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="e.g., Grilled Chicken"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Serving Size</Text>
                <TextInput
                  style={styles.input}
                  value={servingSize}
                  onChangeText={setServingSize}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Unit</Text>
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
                <Text style={styles.label}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Sugar (g) *</Text>
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
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Carbs (g)</Text>
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
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addFoodItem}>
              <Ionicons name="add" size={20} color={Colors.light.background} />
              <Text style={styles.addButtonText}>Add to Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Food List */}
        {currentFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foods in this Meal</Text>
            {currentFoods.map((food) => (
              <View key={food.foodId} style={styles.foodItem}>
                <View style={styles.flex1}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodDetails}>
                    {food.quantity}{food.servingUnit} • {food.calories} cal • {food.sugar}g sugar
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeFood(food.foodId)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Meal Totals</Text>
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Calories:</Text>
                <Text style={styles.totalValue}>{mealTotals.totalCalories} cal</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Sugar:</Text>
                <Text style={[styles.totalValue, { color: Colors.light.secondary }]}>
                  {mealTotals.totalSugar.toFixed(1)}g
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Protein:</Text>
                <Text style={styles.totalValue}>{mealTotals.totalProtein.toFixed(1)}g</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this meal..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, currentFoods.length === 0 && styles.saveButtonDisabled]}
          onPress={saveMeal}
          disabled={currentFoods.length === 0}
        >
          <Text style={styles.saveButtonText}>Save Meal</Text>
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
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Foods</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
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
                  selectedCategory === category && styles.categoryChipActive,
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
                    selectedCategory === category && styles.categoryChipTextActive,
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
              <Ionicons name="search" size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptySearchTitle}>Search for foods</Text>
              <Text style={styles.emptySearchText}>
                Try searching for "apple", "chicken", "rice", etc.
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptySearchState}>
              <Ionicons name="sad-outline" size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptySearchTitle}>No foods found</Text>
              <Text style={styles.emptySearchText}>Try a different search term</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.foodSearchResult}>
                  <View style={styles.foodSearchInfo}>
                    <Text style={styles.foodSearchName}>{item.name}</Text>
                    <Text style={styles.foodSearchCategory}>{item.category}</Text>
                    <Text style={styles.foodSearchNutrition}>
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
                        <Text style={styles.portionButtonName}>{portion.name}</Text>
                        <Text style={styles.portionButtonSize}>{portion.size}{item.servingUnit}</Text>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}20`,
  },
  mealTypeIcon: {
    ...Typography.fontSize.xl,
    marginBottom: Spacing.xs,
  },
  mealTypeLabel: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
  },
  mealTypeLabelActive: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  photoButtonText: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  searchFoodButton: {
    backgroundColor: Colors.light.primary,
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
    ...Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
  searchFoodSubtitle: {
    ...Typography.fontSize.sm,
    color: Colors.light.background,
    opacity: 0.9,
  },
  manualEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.fontSize.md,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    ...Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.light.background,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  foodName: {
    ...Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.light.text,
  },
  foodDetails: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  totalsCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalsTitle: {
    ...Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.light.background,
    marginBottom: Spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  totalLabel: {
    ...Typography.fontSize.sm,
    color: Colors.light.background,
    opacity: 0.9,
  },
  totalValue: {
    ...Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  saveButton: {
    backgroundColor: Colors.light.success,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  saveButtonText: {
    ...Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalCancel: {
    ...Typography.fontSize.md,
    color: Colors.light.primary,
  },
  modalTitle: {
    ...Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    padding: Spacing.md,
    ...Typography.fontSize.md,
    color: Colors.light.text,
  },
  categoriesScroll: {
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryChipText: {
    ...Typography.fontSize.sm,
    color: Colors.light.text,
  },
  categoryChipTextActive: {
    color: Colors.light.background,
    fontWeight: '600',
  },
  emptySearchState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptySearchTitle: {
    ...Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.md,
  },
  emptySearchText: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
  },
  foodSearchResult: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  foodSearchInfo: {
    marginBottom: Spacing.sm,
  },
  foodSearchName: {
    ...Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
  },
  foodSearchCategory: {
    ...Typography.fontSize.sm,
    color: Colors.light.primary,
    marginTop: Spacing.xs,
  },
  foodSearchNutrition: {
    ...Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  portionsScroll: {
    marginTop: Spacing.sm,
  },
  portionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  portionButtonName: {
    ...Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.light.background,
  },
  portionButtonSize: {
    ...Typography.fontSize.xs,
    color: Colors.light.background,
    opacity: 0.9,
  },
});
