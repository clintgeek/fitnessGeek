import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import NutritionSummary from '../components/FoodLog/NutritionSummary.jsx';
import MealSection from '../components/FoodLog/MealSection.jsx';
import FoodSearch from '../components/FoodSearch/FoodSearch.jsx';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import SaveMealDialog from '../components/FoodLog/SaveMealDialog.jsx';
import EditLogDialog from '../components/FoodLog/EditLogDialog.jsx';
import BarcodeScanner from '../components/BarcodeScanner/BarcodeScanner.jsx';

const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [updatingLog, setUpdatingLog] = useState(false);
  const [showSaveMealDialog, setShowSaveMealDialog] = useState(false);
  const [saveMealData, setSaveMealData] = useState(null);
  const [savingMeal, setSavingMeal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Mock data for demonstration
  const mockLogs = [
    {
      id: 1,
      food_item: {
        _id: '1',
        name: 'Chicken Breast',
        brand: 'Organic Valley',
        nutrition: {
          calories_per_serving: 165,
          protein_grams: 31,
          carbs_grams: 0,
          fat_grams: 3.6,
          fiber_grams: 0,
          sugar_grams: 0,
          sodium_mg: 74
        },
        serving: {
          size: 100,
          unit: 'g'
        },
        source: 'usda'
      },
      log_date: selectedDate,
      meal_type: 'breakfast',
      servings: 1
    },
    {
      id: 2,
      food_item: {
        _id: '2',
        name: 'Brown Rice',
        brand: 'Uncle Ben\'s',
        nutrition: {
          calories_per_serving: 111,
          protein_grams: 2.6,
          carbs_grams: 23,
          fat_grams: 0.9,
          fiber_grams: 1.8,
          sugar_grams: 0.4,
          sodium_mg: 5
        },
        serving: {
          size: 100,
          unit: 'g'
        },
        source: 'nutritionix'
      },
      log_date: selectedDate,
      meal_type: 'lunch',
      servings: 1.5
    }
  ];

  useEffect(() => {
    loadFoodLogs();
  }, [selectedDate]);

  const loadFoodLogs = async () => {
    setLoading(true);
    try {
      const response = await fitnessGeekService.getLogsForDate(selectedDate);
      setLogs(response || []);
    } catch (error) {
      setErrorMessage('Failed to load food logs');
      console.error('Error loading food logs:', error);
      // Fallback to mock data for now
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionSummary = () => {
    return logs.reduce(
      (summary, log) => {
        // Use the calculatedNutrition virtual property if available, otherwise fall back to manual calculation
        if (log.calculatedNutrition) {
          return {
            calories: summary.calories + (log.calculatedNutrition.calories || 0),
            protein: summary.protein + (log.calculatedNutrition.protein_grams || 0),
            carbs: summary.carbs + (log.calculatedNutrition.carbs_grams || 0),
            fat: summary.fat + (log.calculatedNutrition.fat_grams || 0)
          };
        }

        // Fallback: Handle both food_item and food_item_id structures
        const food_item = log.food_item || log.food_item_id;
        const { servings } = log;

        // Safety check for food_item and nutrition
        if (!food_item || !food_item.nutrition) {
          console.warn('Food item or nutrition data missing:', log);
          return summary;
        }

        const nutrition = food_item.nutrition;
        const servingsCount = typeof servings === 'string' ? parseFloat(servings) || 1 : (servings || 1);

        return {
          calories: summary.calories + ((nutrition.calories_per_serving || 0) * servingsCount),
          protein: summary.protein + ((nutrition.protein_grams || 0) * servingsCount),
          carbs: summary.carbs + ((nutrition.carbs_grams || 0) * servingsCount),
          fat: summary.fat + ((nutrition.fat_grams || 0) * servingsCount)
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getLogsByMealType = (mealType) => {
    return logs.filter(log => log.meal_type === mealType);
  };

  const handleAddFood = (mealType) => {
    setSelectedMealType(mealType);
    setShowAddDialog(true);
  };

  const handleFoodSelect = async (food) => {
    try {
      // Add the food to the selected meal type
      const logData = {
        food_item: food,
        log_date: selectedDate,
        meal_type: selectedMealType,
        servings: food.servings || 1,
        notes: food.notes || '',
        nutrition: food.nutrition || food.original_nutrition || {}
      };

      await fitnessGeekService.addFoodToLog(logData);

      // Reload logs to get the updated data
      await loadFoodLogs();
      setSuccessMessage(`${food.name} added to ${selectedMealType}`);

      // Close the modal
      setShowAddDialog(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to add food to log');
      console.error('Error adding food to log:', error);
    }
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowEditDialog(true);
  };

  const handleUpdateLog = async (logId, updateData) => {
    try {
      setUpdatingLog(true);
      await fitnessGeekService.updateFoodLog(logId, updateData);

      // Reload logs to get the updated data
      await loadFoodLogs();
      setShowEditDialog(false);
      setEditingLog(null);
      setSuccessMessage('Food log updated successfully');

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update food log');
      console.error('Error updating log:', error);
    } finally {
      setUpdatingLog(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditingLog(null);
  };

  const handleDeleteLog = async (logId) => {
    try {
      await fitnessGeekService.deleteFoodLog(logId);

      // Reload logs to get the updated data
      await loadFoodLogs();
      setSuccessMessage('Food removed from log');

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to remove food from log');
      console.error('Error deleting log:', error);
    }
  };

  const handleSaveMeal = (mealType, logs) => {
    setSaveMealData({ mealType, logs });
    setShowSaveMealDialog(true);
  };

  const handleSaveMealConfirm = async (mealData) => {
    try {
      setSavingMeal(true);
      await fitnessGeekService.createMeal(mealData);

      setShowSaveMealDialog(false);
      setSaveMealData(null);
      setSuccessMessage(`Meal "${mealData.name}" saved successfully!`);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to save meal');
      console.error('Error saving meal:', error);
    } finally {
      setSavingMeal(false);
    }
  };

  const handleSaveMealCancel = () => {
    setShowSaveMealDialog(false);
    setSaveMealData(null);
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nutritionSummary = calculateNutritionSummary();

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {/* <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Food Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your daily nutrition
        </Typography>
      </Box> */}

      {/* Date Navigation */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        p: 1.5,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
        borderRadius: 1
      }}>
        <IconButton onClick={goToPreviousDay}>
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" fontWeight={600}>
            {formatDate(selectedDate)}
          </Typography>
          <CalendarIcon sx={{ color: 'primary.main' }} />
        </Box>

        <IconButton onClick={goToNextDay}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Nutrition Summary */}
          <NutritionSummary
            summary={nutritionSummary}
            showGoals={false}
          />

          {/* Meal Sections */}
          {(['breakfast', 'lunch', 'dinner', 'snack']).map((mealType) => (
            <MealSection
              key={mealType}
              mealType={mealType}
              logs={getLogsByMealType(mealType)}
              onAddFood={handleAddFood}
              onEditLog={handleEditLog}
              onDeleteLog={handleDeleteLog}
              onSaveMeal={handleSaveMeal}
              showActions={true}
            />
          ))}
        </>
      )}

      {/* Add Food Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add Food to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <FoodSearch
            onFoodSelect={handleFoodSelect}
            placeholder="Search for foods..."
            showRecent={true}
            maxResults={25}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBarcodeScanner(true)}>
            Scan Barcode
          </Button>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onBarcodeScanned={(food) => {
          handleFoodSelect(food);
          setShowBarcodeScanner(false);
        }}
      />

      {/* Save Meal Dialog */}
      {saveMealData && (
        <SaveMealDialog
          open={showSaveMealDialog}
          onClose={handleSaveMealCancel}
          onSave={handleSaveMealConfirm}
          mealType={saveMealData.mealType}
          logs={saveMealData.logs}
          loading={savingMeal}
        />
      )}

      {/* Edit Log Dialog */}
      {editingLog && (
        <EditLogDialog
          open={showEditDialog}
          onClose={handleEditCancel}
                     onSave={handleUpdateLog}
          log={editingLog}
          loading={updatingLog}
        />
      )}
    </Box>
  );
};

export default FoodLog;