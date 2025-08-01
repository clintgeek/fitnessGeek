import React, { useState } from 'react';
import {
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import NutritionSummary from '../components/FoodLog/NutritionSummary.jsx';
import MealSection from '../components/FoodLog/MealSection.jsx';
import SaveMealDialog from '../components/FoodLog/SaveMealDialog.jsx';
import EditLogDialog from '../components/FoodLog/EditLogDialog.jsx';
import {
  DateNavigator,
  AddFoodDialog
} from '../components/FoodLog';
import { useFoodLog } from '../hooks/useFoodLog.js';

const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [updatingLog, setUpdatingLog] = useState(false);
  const [showSaveMealDialog, setShowSaveMealDialog] = useState(false);
  const [saveMealData, setSaveMealData] = useState(null);
  const [savingMeal, setSavingMeal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Use custom hook for food log operations
  const {
    loading,
    successMessage,
    errorMessage,
    nutritionSummary,
    getLogsByMealType,
    addFoodToLog,
    updateFoodLog,
    deleteFoodLog,
    saveMeal,
    clearSuccessMessage,
    clearErrorMessage
  } = useFoodLog(selectedDate);

  const handleAddFood = (mealType) => {
    setSelectedMealType(mealType);
    setShowAddDialog(true);
  };

  const handleFoodSelect = async (food) => {
    const success = await addFoodToLog(food, selectedMealType);
    if (success) {
      setShowAddDialog(false);
    }
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowEditDialog(true);
  };

  const handleUpdateLog = async (logId, updateData) => {
    setUpdatingLog(true);
    const success = await updateFoodLog(logId, updateData);
    if (success) {
      setShowEditDialog(false);
      setEditingLog(null);
    }
    setUpdatingLog(false);
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditingLog(null);
  };

  const handleDeleteLog = async (logId) => {
    await deleteFoodLog(logId);
  };

  const handleSaveMeal = (mealType, logs) => {
    setSaveMealData({ mealType, logs });
    setShowSaveMealDialog(true);
  };

  const handleSaveMealConfirm = async (mealData) => {
    setSavingMeal(true);
    const success = await saveMeal(mealData);
    if (success) {
      setShowSaveMealDialog(false);
      setSaveMealData(null);
    }
    setSavingMeal(false);
  };

  const handleSaveMealCancel = () => {
    setShowSaveMealDialog(false);
    setSaveMealData(null);
  };

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Date Navigation */}
      <DateNavigator
        selectedDate={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        formatDate={formatDate}
      />

      {/* Nutrition Summary */}
      <Box sx={{ mb: 3 }}>
        <NutritionSummary
          summary={nutritionSummary}
          showGoals={true}
        />
      </Box>

      {/* Meal Sections */}
      {(['breakfast', 'lunch', 'dinner', 'snack']).map((mealType) => (
        <Box key={mealType} sx={{ mb: 3 }}>
          <MealSection
            mealType={mealType}
            logs={getLogsByMealType(mealType)}
            onAddFood={handleAddFood}
            onEditLog={handleEditLog}
            onDeleteLog={handleDeleteLog}
            onSaveMeal={handleSaveMeal}
            showActions={true}
          />
        </Box>
      ))}

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onFoodSelect={handleFoodSelect}
        mealType={selectedMealType}
        showBarcodeScanner={showBarcodeScanner}
        onShowBarcodeScanner={setShowBarcodeScanner}
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

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={clearSuccessMessage}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={clearErrorMessage}>
          {errorMessage}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default FoodLog;