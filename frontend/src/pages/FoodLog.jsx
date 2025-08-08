import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Collapse
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
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { settingsService } from '../services/settingsService.js';

const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(() => fitnessGeekService.formatDate(new Date()));
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
    refreshGoals,
    refreshLogs,
    getLogsByMealType,
    addFoodToLog,
    updateFoodLog,
    deleteFoodLog,
    saveMeal,
    clearSuccessMessage,
    clearErrorMessage
  } = useFoodLog(selectedDate);

  // Calorie goal adjustment state
  const todayCalorieGoal = useMemo(() => Math.round(nutritionSummary?.calorieGoal || 0), [nutritionSummary]);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalSavedMsg, setGoalSavedMsg] = useState('');
  const [showCaloriePanel, setShowCaloriePanel] = useState(false);

  useEffect(() => {
    if (todayCalorieGoal > 0) setGoalInput(String(todayCalorieGoal));
  }, [todayCalorieGoal]);

  const getMondayFirstDayIndex = (dateStr) => {
    const d = new Date(dateStr);
    // JS getDay(): Sun=0..Sat=6 → Mon=0..Sun=6
    return (d.getDay() + 6) % 7;
  };

  const handleSaveTodayGoal = async () => {
    try {
      if (!goalInput) return;
      setSavingGoal(true);
      const resp = await settingsService.getSettings();
      const data = resp?.data || resp?.data?.data || resp;
      const ng = data?.nutrition_goal || {};
      const minSafe = ng?.min_safe_calories || 1200;
      const idx = getMondayFirstDayIndex(selectedDate);
      const base = Array.isArray(ng?.weekly_schedule) && ng.weekly_schedule.length === 7
        ? [...ng.weekly_schedule]
        : new Array(7).fill(ng?.daily_calorie_target || todayCalorieGoal || 0);
      const newVal = Math.max(minSafe, Math.round(parseFloat(goalInput)) || 0);
      base[idx] = newVal;

      await settingsService.updateSettings({
        nutrition_goal: {
          ...ng,
          enabled: true,
          weekly_schedule: base
        }
      });

      setGoalSavedMsg('Today\'s calorie target updated.');
      setTimeout(() => setGoalSavedMsg(''), 3000);
      await refreshGoals();
    } catch (e) {
      console.error('Failed to update today\'s calorie goal', e);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleAddFood = (mealType) => {
    setSelectedMealType(mealType);
    setShowAddDialog(true);
  };

  const handleFoodSelect = async (food) => {
    try {
      if (food && food.type === 'meal' && food._id) {
        // Saved meal: add entire meal to the selected meal type on the selected date
        await fitnessGeekService.addMealToLog(food._id, selectedDate, selectedMealType || 'snack');
        setShowAddDialog(false);
        await refreshGoals();
        await refreshLogs();
        return;
      }

      const success = await addFoodToLog(food, selectedMealType);
      if (success) {
        setShowAddDialog(false);
        await refreshLogs();
      }
    } catch (e) {
      console.error('Failed to add selection to log', e);
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
    const [y, m, d] = selectedDate.split('-').map(Number);
    const currentDate = new Date(y, (m || 1) - 1, d || 1);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(fitnessGeekService.formatDate(currentDate));
  };

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const currentDate = new Date(y, (m || 1) - 1, d || 1);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(fitnessGeekService.formatDate(currentDate));
  };

  const formatDate = (dateString) => {
    // Parse YYYY-MM-DD as a local date to avoid UTC shifting the displayed day
    const [y, m, d] = (dateString || '').split('-').map(Number);
    const date = new Date(y || 0, (m || 1) - 1, d || 1);
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

      {/* Calorie Goal Panel (toggle) */}
      <Collapse in={showCaloriePanel} unmountOnExit>
        <Card id="calorie-goal-panel" sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Calorie Goal Today</Typography>
                <Typography variant="h6">{todayCalorieGoal || '—'} kcal</Typography>
              </Box>
              <TextField
                label="Adjust today"
                type="number"
                size="small"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                sx={{ width: 180 }}
              />
              <Button
                variant="contained"
                onClick={handleSaveTodayGoal}
                disabled={savingGoal || !goalInput}
              >
                Save
              </Button>
            </Stack>
            {goalSavedMsg && (
              <Alert severity="success" sx={{ mt: 2 }}>{goalSavedMsg}</Alert>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Nutrition Summary */}
      <Box sx={{ mb: 3 }}>
        <NutritionSummary
          summary={nutritionSummary}
          showGoals={true}
          onCalorieSettingsClick={() => {
            setShowCaloriePanel(prev => {
              const next = !prev;
              if (!prev && typeof window !== 'undefined') {
                setTimeout(() => {
                  const panel = document.getElementById('calorie-goal-panel');
                  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 0);
              }
              return next;
            });
          }}
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