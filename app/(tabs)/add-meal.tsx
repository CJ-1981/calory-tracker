import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Spacing, BorderRadius, Typography } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { MealType, FoodItem, Meal } from '../../src/models';
import { addMeal, loadPresets, savePreset, deletePreset, loadRecentFoods, addRecentFood, loadFavoriteFoods, toggleFavoriteFood, clearRecentFoods, removeFavoriteFood } from '../../src/store';
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
  getFoodById,
} from '../../src/utils/foodDatabase';
import { searchUSDAFoods, isUSDAApiConfigured } from '../../src/utils/usdaApi';
import { Alert } from '../../src/utils/alert';
import { scaledFontSize } from '../../src/utils/fontUtils';
import { MealPreset } from '../../src/models/Meal';
import { RecentFoodsSection } from '../../src/components/RecentFoodsSection';
import { FavoriteFoodsSection } from '../../src/components/FavoriteFoodsSection';

export default function AddMealScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, fontScale } = useTheme();
  const meals = useSelector((state: RootState) => state.meals.meals) || [];
  const presets = useSelector((state: RootState) => state.presets.presets) || [];
  const recentFoods = useSelector((state: RootState) => state.foodHistory?.recentFoods ?? []);
  const favoriteFoods = useSelector((state: RootState) => state.foodHistory?.favoriteFoods ?? []);

  // Load presets and food history on mount
  useEffect(() => {
    dispatch(loadPresets());
    dispatch(loadRecentFoods());
    dispatch(loadFavoriteFoods());
  }, [dispatch]);

  // Check if USDA API is configured when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkApiConfiguration();
    }, [])
  );

  const checkApiConfiguration = async () => {
    const configured = await isUSDAApiConfigured();
    setIsApiConfigured(configured);
  };

  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
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
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [localSearchResults, setLocalSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [usdaSearchResults, setUsdaSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState<number>(100);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWebDatePicker, setShowWebDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(mealDate);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isManualEntryExpanded, setIsManualEntryExpanded] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  // Preset modal state
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Edit food modal state
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [editServingSize, setEditServingSize] = useState('');
  const [editServingUnit, setEditServingUnit] = useState('');

  // Memoize favorite food IDs to avoid recreating array on every render
  const favoriteFoodIds = useMemo(() => {
    return (favoriteFoods || []).map((f: any) => f.foodId);
  }, [favoriteFoods]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setMealDate(dateStr);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openDatePicker = () => {
    if (Platform.OS === 'web') {
      setTempDate(mealDate);
      setShowWebDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const generateLast30Days = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const selectWebDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setMealDate(dateStr);
    setShowWebDatePicker(false);
  };

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
        quantity: 1, // Store as 1 item/portion, not the weight
        originalQuantity: portionSize, // Store actual weight for reference
      },
    ]);

    console.log('Updated currentFoods:', [...currentFoods, {
        ...calculatedFood,
        foodId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity: portionSize,
      }]);

    // Track recent food
    dispatch(addRecentFood({
      foodId: food.id,
      name: food.name,
      category: food.category,
      quantity: portionSize,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: calculatedFood.calories,
      sugar: calculatedFood.sugar,
      protein: calculatedFood.protein,
      carbs: calculatedFood.carbs,
      fat: calculatedFood.fat,
      commonPortions: food.commonPortions,
      lastUsedAt: Date.now(),
      portionIndex,
    }));

    Alert.alert('Added!', `${food.name} (${food.commonPortions[portionIndex]?.name || portionSize}${food.servingUnit}) added to meal.`);
    setShowFoodSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setLocalSearchResults([]);
    setUsdaSearchResults([]);
    setSelectedFood(null);
  };

  const removeFood = (foodId: string) => {
    setCurrentFoods(currentFoods.filter((f) => f.foodId !== foodId));
  };

  const updateFoodQuantity = (foodId: string, change: number) => {
    setCurrentFoods(currentFoods.map((food) => {
      if (food.foodId === foodId) {
        const currentCount = food.quantity || 1;
        const newCount = Math.max(1, currentCount + change);

        // Nutrition is stored per item, so just multiply by the count
        return {
          ...food,
          quantity: newCount,
          calories: Math.round((food.calories / currentCount) * newCount),
          sugar: Math.round((food.sugar / currentCount) * newCount * 10) / 10,
          protein: Math.round((food.protein / currentCount) * newCount * 10) / 10,
          carbs: Math.round((food.carbs / currentCount) * newCount * 10) / 10,
          fat: Math.round((food.fat / currentCount) * newCount * 10) / 10,
        };
      }
      return food;
    }));
  };

  const setFoodQuantity = (foodId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      return; // Invalid input, don't update
    }

    setCurrentFoods(currentFoods.map((food) => {
      if (food.foodId === foodId) {
        const currentCount = food.quantity || 1;

        // Nutrition is stored per item, so just multiply by the count
        return {
          ...food,
          quantity: quantity,
          calories: Math.round((food.calories / currentCount) * quantity),
          sugar: Math.round((food.sugar / currentCount) * quantity * 10) / 10,
          protein: Math.round((food.protein / currentCount) * quantity * 10) / 10,
          carbs: Math.round((food.carbs / currentCount) * quantity * 10) / 10,
          fat: Math.round((food.fat / currentCount) * quantity * 10) / 10,
        };
      }
      return food;
    }));
  };

  const clearAllFoods = () => {
    Alert.alert(
      'Clear All Foods',
      'Are you sure you want to remove all foods from this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setCurrentFoods([]),
        },
      ]
    );
  };

  const openEditFoodModal = (food: FoodItem) => {
    setEditingFood(food);
    const currentServingSize = food.originalQuantity || food.servingSize || food.quantity;
    setEditServingSize(String(currentServingSize));
    setEditServingUnit(food.servingUnit);
    setShowEditFoodModal(true);
  };

  const saveEditedFood = () => {
    if (!editingFood) return;

    const newServingSize = parseFloat(editServingSize) || editingFood.servingSize;
    const currentServingSize = editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity;
    const ratio = newServingSize / currentServingSize;
    const quantity = editingFood.quantity || 1;

    // Calculate nutrition per single serving
    const caloriesPerServing = editingFood.calories / quantity;
    const sugarPerServing = editingFood.sugar / quantity;
    const proteinPerServing = editingFood.protein / quantity;
    const carbsPerServing = editingFood.carbs / quantity;
    const fatPerServing = editingFood.fat / quantity;

    setCurrentFoods(currentFoods.map((food) => {
      if (food.foodId === editingFood.foodId) {
        return {
          ...food,
          servingSize: newServingSize,
          servingUnit: editServingUnit || food.servingUnit,
          originalQuantity: newServingSize,
          // Adjust nutrition proportionally based on serving size ratio
          calories: Math.round(caloriesPerServing * ratio * quantity),
          sugar: Math.round(sugarPerServing * ratio * quantity * 10) / 10,
          protein: Math.round(proteinPerServing * ratio * quantity * 10) / 10,
          carbs: Math.round(carbsPerServing * ratio * quantity * 10) / 10,
          fat: Math.round(fatPerServing * ratio * quantity * 10) / 10,
        };
      }
      return food;
    }));

    setShowEditFoodModal(false);
    setEditingFood(null);
  };

  const cancelEditFood = () => {
    setShowEditFoodModal(false);
    setEditingFood(null);
  };

  const handleToggleFavorite = (food: FoodDatabaseItem) => {
    dispatch(toggleFavoriteFood({
      foodId: food.id,
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      sugar: food.sugar,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      commonPortions: food.commonPortions,
      defaultPortionIndex: 0,
    }));
  };

  const isFavorite = (foodId: string) => {
    return favoriteFoods.some((f: any) => f.foodId === foodId);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    // Immediately search local database and show results
    if (text.length > 0) {
      setHasSearched(true);
      const localResults = searchFoodDatabase(text);
      setLocalSearchResults(localResults);
      // Reset USDA results when query changes - they'll be repopulated by debounced search
      setUsdaSearchResults([]);
    } else {
      setLocalSearchResults([]);
      setUsdaSearchResults([]);
      setHasSearched(false);
    }
  };

  // Combine local and USDA results
  useEffect(() => {
    setSearchResults([...localSearchResults, ...usdaSearchResults]);
  }, [localSearchResults, usdaSearchResults]);

  // Debounced USDA API search - runs after local results are already shown
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length > 0 && isApiConfigured) {
        setIsSearching(true);

        try {
          const usdaResults = await searchUSDAFoods(searchQuery, 10);
          setUsdaSearchResults(usdaResults);
        } catch (error) {
          console.error('Error searching USDA API:', error);
          setUsdaSearchResults([]);
        }

        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimer);
  }, [searchQuery, isApiConfigured]);

  const getFoodsByCategory = (category: string): FoodDatabaseItem[] => {
    return foodDatabase.filter((food) => food.category === category);
  };

  const saveMeal = async () => {
    console.log('saveMeal called, currentFoods:', currentFoods);

    if (currentFoods.length === 0) {
      Alert.alert('No Foods', 'Please add at least one food item to your meal.');
      return;
    }

    const totals = calculateMealTotals(currentFoods);

    const newMeal = {
      date: mealDate,
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

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this preset.');
      return;
    }

    if (currentFoods.length === 0) {
      Alert.alert('No Foods', 'Please add at least one food item to save as a preset.');
      return;
    }

    try {
      await dispatch(savePreset({
        name: presetName.trim(),
        foods: currentFoods,
        mealType: mealType,
      }));
      Alert.alert('Success', 'Preset saved successfully!');
      setShowSavePresetDialog(false);
      setPresetName('');
    } catch (error) {
      console.error('Error saving preset:', error);
      Alert.alert('Error', 'Failed to save preset. Please try again.');
    }
  };

  const handleLoadPreset = (preset: MealPreset) => {
    // Generate new food IDs for the loaded foods
    const foodsWithNewIds = preset.foods.map(food => ({
      ...food,
      foodId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }));

    setCurrentFoods([...currentFoods, ...foodsWithNewIds]);
    setShowPresetModal(false);
    Alert.alert('Loaded!', `Added ${preset.foods.length} foods from "${preset.name}"`);
  };

  const handleDeletePreset = async (presetId: string) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePreset(presetId));
              Alert.alert('Success', 'Preset deleted successfully!');
            } catch (error) {
              console.error('Error deleting preset:', error);
              Alert.alert('Error', 'Failed to delete preset. Please try again.');
            }
          },
        },
      ]
    );
  };

  const calculatePresetTotals = (foods: FoodItem[]) => {
    return calculateMealTotals(foods);
  };

  const mealTotals = calculateMealTotals(currentFoods);
  const selectedMealType = MEAL_TYPES.find((t) => t.value === mealType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.xxl, fontScale) }]}>Log Meal</Text>
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

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Date</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.surface }]}
            onPress={openDatePicker}
          >
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <View style={styles.dateButtonContent}>
              <Text style={[styles.dateButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                {formatDateDisplay(mealDate)}
              </Text>
              <Text style={[styles.dateButtonSubtext, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                {mealDate}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={new Date(mealDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
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

        {/* Recent Foods Section */}
        {recentFoods.length > 0 && (
          <View style={styles.section}>
            <RecentFoodsSection
              recentFoods={recentFoods}
              onAddFood={(entry) => {
                // Reconstruct food object from recent food entry
                const food = {
                  id: entry.foodId,
                  name: entry.name,
                  category: entry.category,
                  servingSize: entry.servingSize,
                  servingUnit: entry.servingUnit,
                  calories: entry.calories,
                  sugar: entry.sugar,
                  protein: entry.protein,
                  carbs: entry.carbs,
                  fat: entry.fat,
                  commonPortions: entry.commonPortions,
                };
                addFoodFromDatabase(food, entry.portionIndex);
              }}
              onClearAll={() => dispatch(clearRecentFoods())}
              favoriteFoodIds={favoriteFoodIds}
            />
          </View>
        )}

        {/* Favorites Section */}
        {favoriteFoods.length > 0 && (
          <View style={styles.section}>
            <FavoriteFoodsSection
              favoriteFoods={favoriteFoods}
              onAddFood={(food: any, portionIndex: number) => {
                addFoodFromDatabase(food, portionIndex);
              }}
              onRemoveFavorite={(foodId: string) => dispatch(removeFavoriteFood(foodId))}
            />
          </View>
        )}

        {/* Preset Buttons */}
        <View style={styles.section}>
          <View style={styles.presetButtonsRow}>
            <TouchableOpacity
              style={[styles.presetButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowPresetModal(true)}
            >
              <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
              <View style={styles.presetButtonContent}>
                <Text style={[styles.presetButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Load Preset</Text>
                <Text style={[styles.presetButtonSubtext, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  {presets.length} saved
                </Text>
              </View>
            </TouchableOpacity>

            {currentFoods.length > 0 && (
              <TouchableOpacity
                style={[styles.presetButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowSavePresetDialog(true)}
              >
                <Ionicons name="save-outline" size={24} color={colors.primary} />
                <View style={styles.presetButtonContent}>
                  <Text style={[styles.presetButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Save as Preset</Text>
                  <Text style={[styles.presetButtonSubtext, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    Save current meal
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Manual Entry */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.manualEntryHeader}
            onPress={() => setIsManualEntryExpanded(!isManualEntryExpanded)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Or Enter Manually</Text>
            <Ionicons
              name={isManualEntryExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          {isManualEntryExpanded && (
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
          )}
        </View>

        {/* Food List */}
        {currentFoods.length > 0 && (
          <View style={styles.section}>
            <View style={styles.foodListHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Foods in this Meal</Text>
              <TouchableOpacity
                style={[styles.clearAllButton, { borderColor: colors.border }]}
                onPress={clearAllFoods}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} style={{ marginRight: 4 }} />
                <Text style={[styles.clearAllButtonText, { color: colors.danger, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            {currentFoods.map((food) => (
              <View key={food.foodId} style={[styles.foodItem, { backgroundColor: colors.surface }]}>
                <View style={styles.flex1}>
                  <Text style={[styles.foodName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{food.name}</Text>
                  <Text style={[styles.foodDetails, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    {food.originalQuantity || food.quantity}{food.servingUnit} • {food.calories} cal • {food.sugar}g sugar
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.background }]}
                    onPress={() => updateFoodQuantity(food.foodId, -1)}
                  >
                    <Ionicons name="remove-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.quantityInput, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                    value={String(food.quantity)}
                    onChangeText={(text) => setFoodQuantity(food.foodId, text)}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    maxLength={3}
                  />
                  <Text style={[styles.quantityLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    {food.quantity === 1 ? 'item' : 'items'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.background }]}
                    onPress={() => updateFoodQuantity(food.foodId, 1)}
                  >
                    <Ionicons name="add-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => openEditFoodModal(food)} style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFood(food.foodId)} style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
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
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowFoodSearch(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Search Foods</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Search Input */}
          <View style={[styles.searchSection, { borderBottomColor: colors.border }]}>
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
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setLocalSearchResults([]); setUsdaSearchResults([]); setHasSearched(false); }}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {!isApiConfigured && searchQuery.length === 0 && (
              <View style={[styles.apiWarning, { backgroundColor: 'rgba(255, 165, 0, 0.1)' }]}>
                <View style={styles.apiWarningContent}>
                  <Ionicons name="information-circle" size={16} color="orange" style={{ marginRight: 4 }} />
                  <Text style={[styles.apiWarningText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                    USDA API not configured. Limited to local database.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.apiWarningButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowFoodSearch(false);
                    setTimeout(() => {
                      router.push('/(tabs)/settings');
                    }, 100);
                  }}
                >
                  <Text style={[styles.apiWarningButtonText, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                    Configure
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Category Foods Dropdowns - Show when no search query */}
          {searchQuery.length === 0 && (
            <ScrollView style={styles.categoriesDropdowns}>
              {foodCategories.filter(cat => cat !== 'All').map((category) => {
                const categoryFoods = getFoodsByCategory(category);
                const isExpanded = expandedCategory === category;

                return (
                  <View key={category} style={[styles.categoryDropdown, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.categoryDropdownHeader, { backgroundColor: colors.surface }]}
                      onPress={() => setExpandedCategory(isExpanded ? null : category)}
                    >
                      <View style={styles.categoryDropdownHeaderLeft}>
                        <Text style={[styles.categoryDropdownTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                          {category}
                        </Text>
                        <Text style={[styles.categoryDropdownCount, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                          {categoryFoods.length} items
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={[styles.categoryDropdownContent, { backgroundColor: colors.surface }]}>
                        {categoryFoods.map((food) => (
                          <TouchableOpacity
                            key={food.id}
                            style={[styles.categoryFoodItem, { borderBottomColor: colors.border }]}
                            onPress={() => {
                              setSearchQuery(food.name);
                              const results = searchFoodDatabase(food.name);
                              setSearchResults(results);
                              setExpandedCategory(null);
                            }}
                          >
                            <View style={styles.categoryFoodItemLeft}>
                              <Text style={[styles.categoryFoodItemName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                                {food.name}
                              </Text>
                              <Text style={[styles.categoryFoodItemNutrition, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                                {food.calories} cal • {food.sugar}g sugar
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Search Results */}
          {searchQuery.length === 0 ? null : searchResults.length > 0 ? (
            <>
              {/* Show loading indicator at the top if USDA search is still running */}
              {isSearching && (
                <View style={styles.searchingIndicator}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.searchingText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                    Searching online...
                  </Text>
                </View>
              )}
            </>
          ) : isSearching ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                Searching foods...
              </Text>
            </View>
          ) : (
            <View style={styles.emptySearchState}>
              <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptySearchTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>No foods found</Text>
              <Text style={[styles.emptySearchText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Try a different search term</Text>
              <TouchableOpacity
                style={[styles.backToCategoriesButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setLocalSearchResults([]);
                  setUsdaSearchResults([]);
                }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backToCategoriesText, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Back to Categories</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Show results when available */}
          {searchResults.length > 0 && (
            <>
              {/* Back button when showing search results */}
              <TouchableOpacity
                style={[styles.backToCategoriesButtonTop, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setLocalSearchResults([]);
                  setUsdaSearchResults([]);
                }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backToCategoriesText, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Back to Categories</Text>
              </TouchableOpacity>
              <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.foodSearchResult, { backgroundColor: colors.surface }]}>
                  <View style={styles.foodSearchInfo}>
                    <View style={styles.foodSearchHeader}>
                      <Text style={[styles.foodSearchName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{item.name}</Text>
                      <TouchableOpacity onPress={() => handleToggleFavorite(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons
                          name={isFavorite(item.id) ? "heart" : "heart-outline"}
                          size={20}
                          color={isFavorite(item.id) ? colors.danger : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
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
            </>
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

      {/* Web Date Picker Modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showWebDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowWebDatePicker(false)}
        >
          <View style={styles.webDatePickerModal}>
            <View style={[styles.webDatePickerContent, { backgroundColor: colors.surface }]}>
              <View style={styles.webDatePickerHeader}>
                <Text style={[styles.webDatePickerTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowWebDatePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.webDatePickerScroll}>
                {generateLast30Days().map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = dateStr === mealDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.webDateItem,
                        { backgroundColor: isSelected ? colors.primary : colors.background, borderColor: colors.border },
                        isToday && { borderColor: colors.primary },
                      ]}
                      onPress={() => selectWebDate(date)}
                    >
                      <Text style={[
                        styles.webDateText,
                        { color: isSelected ? colors.background : colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) },
                        isToday && { fontWeight: 'bold' },
                      ]}>
                        {formatDateDisplay(dateStr)}
                        {isToday && ' (Today)'}
                      </Text>
                      <Text style={[
                        styles.webDateSubtext,
                        { color: isSelected ? colors.background : colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) },
                      ]}>
                        {dateStr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Save Preset Dialog */}
      <Modal
        visible={showSavePresetDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSavePresetDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Save as Preset</Text>
            <Text style={[styles.dialogSubtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              Give this meal combination a name to save it as a preset for quick access later.
            </Text>

            <TextInput
              style={[styles.dialogInput, { borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
              value={presetName}
              onChangeText={setPresetName}
              placeholder="e.g., My Favorite Breakfast"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />

            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonCancel, { borderColor: colors.border }]}
                onPress={() => {
                  setShowSavePresetDialog(false);
                  setPresetName('');
                }}
              >
                <Text style={[styles.dialogButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonSave, { backgroundColor: colors.primary }]}
                onPress={handleSavePreset}
              >
                <Text style={[styles.dialogButtonText, styles.dialogButtonTextSave, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Load Preset Modal */}
      <Modal
        visible={showPresetModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPresetModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowPresetModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>Saved Presets</Text>
            <View style={{ width: 50 }} />
          </View>

          {presets.length === 0 ? (
            <View style={styles.emptyPresetState}>
              <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyPresetTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>No Saved Presets</Text>
              <Text style={[styles.emptyPresetText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                Save your favorite meal combinations as presets to quickly add them later.
              </Text>
            </View>
          ) : (
            <FlatList
              data={presets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const totals = calculatePresetTotals(item.foods);
                return (
                  <View style={[styles.presetItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <View style={styles.presetItemContent}>
                      <View style={styles.presetItemHeader}>
                        <Text style={[styles.presetName, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>{item.name}</Text>
                        {item.mealType && (
                          <Text style={[styles.presetMealType, { color: colors.primary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                            {MEAL_TYPES.find(t => t.value === item.mealType)?.label}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.presetDetails, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                        {item.foods.length} food{item.foods.length !== 1 ? 's' : ''} • {totals.totalCalories} cal • {totals.totalSugar.toFixed(1)}g sugar
                      </Text>
                    </View>
                    <View style={styles.presetActions}>
                      <TouchableOpacity
                        style={[styles.presetActionButton, styles.presetLoadButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleLoadPreset(item)}
                      >
                        <Ionicons name="add" size={20} color={colors.background} />
                        <Text style={[styles.presetActionText, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>Load</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.presetActionButton, styles.presetDeleteButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => handleDeletePreset(item.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              style={styles.presetsList}
            />
          )}
        </View>
      </Modal>

      {/* Edit Food Modal */}
      <Modal
        visible={showEditFoodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEditFood}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.lg, fontScale) }]}>
              Modify Serving Size
            </Text>
            <Text style={[styles.dialogSubtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              {editingFood?.name}
            </Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Serving Size</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                  value={editServingSize}
                  onChangeText={setEditServingSize}
                  placeholder="100"
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Unit</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}
                  value={editServingUnit}
                  onChangeText={setEditServingUnit}
                  placeholder="g"
                />
              </View>
            </View>

            {/* Nutrition Preview */}
            {editingFood && (
              <View style={[styles.nutritionPreview, { backgroundColor: colors.background }]}>
                <Text style={[styles.nutritionPreviewTitle, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
                  New Nutrition (per serving)
                </Text>
                <View style={styles.nutritionPreviewGrid}>
                  <View style={styles.nutritionPreviewItem}>
                    <Text style={[styles.nutritionPreviewValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                      {Math.round((editingFood.calories / editingFood.quantity) * (parseFloat(editServingSize) || (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)) / (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity))}
                    </Text>
                    <Text style={[styles.nutritionPreviewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>cal</Text>
                  </View>
                  <View style={styles.nutritionPreviewItem}>
                    <Text style={[styles.nutritionPreviewValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                      {((editingFood.sugar / editingFood.quantity) * (parseFloat(editServingSize) || (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)) / (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)).toFixed(1)}
                    </Text>
                    <Text style={[styles.nutritionPreviewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>g sugar</Text>
                  </View>
                  <View style={styles.nutritionPreviewItem}>
                    <Text style={[styles.nutritionPreviewValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                      {((editingFood.protein / editingFood.quantity) * (parseFloat(editServingSize) || (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)) / (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)).toFixed(1)}
                    </Text>
                    <Text style={[styles.nutritionPreviewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>g protein</Text>
                  </View>
                  <View style={styles.nutritionPreviewItem}>
                    <Text style={[styles.nutritionPreviewValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                      {((editingFood.carbs / editingFood.quantity) * (parseFloat(editServingSize) || (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)) / (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)).toFixed(1)}
                    </Text>
                    <Text style={[styles.nutritionPreviewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>g carbs</Text>
                  </View>
                  <View style={styles.nutritionPreviewItem}>
                    <Text style={[styles.nutritionPreviewValue, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>
                      {((editingFood.fat / editingFood.quantity) * (parseFloat(editServingSize) || (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)) / (editingFood.originalQuantity || editingFood.servingSize || editingFood.quantity)).toFixed(1)}
                    </Text>
                    <Text style={[styles.nutritionPreviewLabel, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>g fat</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonCancel, { borderColor: colors.border }]}
                onPress={cancelEditFood}
              >
                <Text style={[styles.dialogButtonText, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonSave, { backgroundColor: colors.primary }]}
                onPress={saveEditedFood}
              >
                <Text style={[styles.dialogButtonText, styles.dialogButtonTextSave, { color: colors.background, fontSize: scaledFontSize(Typography.fontSize.md, fontScale) }]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingVertical: Spacing.sm,
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
  dateInput: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateHint: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  dateButtonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dateButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  dateButtonSubtext: {
    marginTop: 2,
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
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  quantityValue: {
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  quantityInput: {
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 40,
    maxWidth: 60,
    textAlign: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  quantityLabel: {
    fontSize: 11,
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  editButton: {
    padding: 4,
    marginRight: 4,
  },
  removeButton: {
    padding: 4,
  },
  foodListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  clearAllButtonText: {
    fontWeight: '600',
    color: "#FF6B6B",
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontWeight: '600',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  searchSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
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
  apiWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  apiWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apiWarningText: {
    fontSize: 11,
    color: "#666666",
  },
  apiWarningButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  apiWarningButtonText: {
    fontWeight: '600',
    fontSize: 11,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: "#666666",
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchingText: {
    marginLeft: Spacing.sm,
    fontStyle: 'italic',
  },
  // Dropdown styles
  categoriesDropdowns: {
    flex: 1,
  },
  categoryDropdown: {
    borderBottomWidth: 1,
  },
  categoryDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  categoryDropdownHeaderLeft: {
    flex: 1,
  },
  categoryDropdownTitle: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#333333",
  },
  categoryDropdownCount: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  categoryDropdownContent: {
    paddingHorizontal: Spacing.md,
  },
  categoryFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  categoryFoodItemLeft: {
    flex: 1,
  },
  categoryFoodItemName: {
    fontWeight: '500',
    color: "#333333",
  },
  categoryFoodItemNutrition: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  emptySearchState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  backToCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  backToCategoriesButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  backToCategoriesText: {
    fontWeight: '600',
    marginLeft: Spacing.xs,
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
  foodSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodSearchName: {
    fontWeight: '600',
    color: "#333333",
    flex: 1,
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
  webDatePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  webDatePickerContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
  },
  webDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  webDatePickerTitle: {
    fontWeight: Typography.fontWeight.bold,
  },
  webDatePickerScroll: {
    padding: Spacing.md,
  },
  webDateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
  },
  webDateText: {
    flex: 1,
  },
  webDateSubtext: {
    marginLeft: Spacing.sm,
  },
  // Preset buttons
  presetButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  presetButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  presetButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  presetButtonSubtext: {
    marginTop: 2,
  },
  // Preset modal
  presetsList: {
    flex: 1,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  presetItemContent: {
    flex: 1,
  },
  presetItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  presetName: {
    fontWeight: '600',
  },
  presetMealType: {
    fontWeight: '500',
  },
  presetDetails: {
    marginTop: Spacing.xs,
  },
  presetActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  presetLoadButton: {
    backgroundColor: "transparent",
  },
  presetDeleteButton: {
    borderWidth: 1,
  },
  presetActionText: {
    fontWeight: '600',
  },
  emptyPresetState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyPresetTitle: {
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyPresetText: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  // Dialog styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialogContent: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  dialogSubtitle: {
    marginBottom: Spacing.lg,
  },
  dialogInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  dialogButtonCancel: {
    borderWidth: 1,
  },
  dialogButtonSave: {
    backgroundColor: "transparent",
  },
  dialogButtonText: {
    fontWeight: '600',
  },
  nutritionPreview: {
    borderRadius: 8,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  nutritionPreviewTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  nutritionPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionPreviewItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nutritionPreviewValue: {
    fontWeight: '600',
  },
  nutritionPreviewLabel: {
    textAlign: 'center',
    marginTop: 2,
  },
  dialogButtonTextSave: {
    color: "#FFFFFF",
  },
});
