import { useState, useEffect } from 'react';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { goalsService } from '../services/goalsService.js';

export const useFoodLog = (selectedDate) => {
  const [logs, setLogs] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load goals
  const loadGoals = async () => {
    try {
      const response = await goalsService.getGoals();
      if (response && response.data) {
        setGoals(response.data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  // Load food logs
  const loadFoodLogs = async () => {
    setLoading(true);
    try {
      console.log('Loading logs for date:', selectedDate);
      const response = await fitnessGeekService.getLogsForDate(selectedDate);
      console.log('Logs response:', response);

      // The backend returns { success: true, data: logs }
      if (response && response.success) {
        setLogs(response.data || []);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setLogs(response);
      } else if (response && response.data) {
        // Fallback for other response formats
        setLogs(response.data);
      } else {
        setLogs([]);
      }

      console.log('Logs set to:', logs);
    } catch (error) {
      console.error('Error loading food logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Add food to log
  const addFoodToLog = async (food, mealType) => {
    try {
      const logData = {
        food_item: food,
        meal_type: mealType,
        servings: 1,
        log_date: selectedDate
      };

      console.log('Sending log data:', logData);
      const response = await fitnessGeekService.addFoodToLog(logData);
      console.log('Raw response from addFoodToLog:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      // The backend returns { success: true, data: log, message: '...' }
      // The apiService returns the entire response object
      if (response && response.success) {
        console.log('Success! Setting success message and reloading logs');
        setAutoCloseMessage('Food added successfully!', setSuccessMessage);
        await loadFoodLogs();
        return true;
      } else {
        console.log('Response does not have success=true:', response);
        setAutoCloseMessage('Failed to add food. Please try again.', setErrorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error adding food log:', error);
      setAutoCloseMessage('Error adding food. Please try again.', setErrorMessage);
      return false;
    }
  };

  // Update food log
  const updateFoodLog = async (logId, updateData) => {
    try {
      const response = await fitnessGeekService.updateFoodLog(logId, updateData);
      console.log('Update log response:', response);

      // The backend returns { success: true, data: log, message: '...' }
      if (response && response.success) {
        setAutoCloseMessage('Food log updated successfully!', setSuccessMessage);
        await loadFoodLogs();
        return true;
      } else {
        setAutoCloseMessage('Failed to update food log. Please try again.', setErrorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error updating food log:', error);
      setAutoCloseMessage('Error updating food log. Please try again.', setErrorMessage);
      return false;
    }
  };

  // Delete food log
  const deleteFoodLog = async (logId) => {
    try {
      const response = await fitnessGeekService.deleteFoodLog(logId);
      console.log('Delete log response:', response);

      // The backend returns { success: true, data: log, message: '...' }
      if (response && response.success) {
        setAutoCloseMessage('Food log deleted successfully!', setSuccessMessage);
        await loadFoodLogs();
        return true;
      } else {
        setAutoCloseMessage('Failed to delete food log. Please try again.', setErrorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error deleting food log:', error);
      setAutoCloseMessage('Error deleting food log. Please try again.', setErrorMessage);
      return false;
    }
  };

  // Save meal
  const saveMeal = async (mealData) => {
    try {
      const response = await fitnessGeekService.createMeal(mealData);
      console.log('Save meal response:', response);

      // The backend returns { success: true, data: meal, message: '...' }
      if (response && response.success) {
        setAutoCloseMessage('Meal saved successfully!', setSuccessMessage);
        await loadFoodLogs();
        return true;
      } else {
        setAutoCloseMessage('Failed to save meal. Please try again.', setErrorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      setAutoCloseMessage('Error saving meal. Please try again.', setErrorMessage);
      return false;
    }
  };

  // Calculate nutrition summary
  const calculateNutritionSummary = () => {
    const totals = logs.reduce((acc, log) => {
      // Handle both food_item and food_item_id structures
      const food_item = log.food_item || log.food_item_id;
      const { servings } = log;

      // Safety check for food_item and nutrition
      if (!food_item || !food_item.nutrition) {
        console.warn('Food item or nutrition data missing:', log);
        return acc;
      }

      const nutrition = food_item.nutrition;
      const servingsCount = typeof servings === 'string' ? parseFloat(servings) || 1 : (servings || 1);

      return {
        calories: acc.calories + ((nutrition.calories_per_serving || 0) * servingsCount),
        protein: acc.protein + ((nutrition.protein_grams || 0) * servingsCount),
        carbs: acc.carbs + ((nutrition.carbs_grams || 0) * servingsCount),
        fat: acc.fat + ((nutrition.fat_grams || 0) * servingsCount)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });

    // Add goals from user settings
    const nutritionGoals = goals?.nutrition?.goals || {};
    const trackMacros = goals?.nutrition?.trackMacros || false;

    return {
      ...totals,
      calorieGoal: trackMacros ? (nutritionGoals.calories || 0) : 0,
      proteinGoal: trackMacros ? (nutritionGoals.protein || 0) : 0,
      carbsGoal: trackMacros ? (nutritionGoals.carbs || 0) : 0,
      fatGoal: trackMacros ? (nutritionGoals.fat || 0) : 0
    };
  };

  // Get logs by meal type
  const getLogsByMealType = (mealType) => {
    return logs.filter(log => log.meal_type === mealType);
  };

  // Clear messages
  const clearSuccessMessage = () => setSuccessMessage(null);
  const clearErrorMessage = () => setErrorMessage(null);

  // Auto-close messages after 3 seconds
  const setAutoCloseMessage = (message, setMessage) => {
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Load data on mount and when date changes
  useEffect(() => {
    loadFoodLogs();
    loadGoals();
  }, [selectedDate]);

  return {
    logs,
    goals,
    loading,
    successMessage,
    errorMessage,
    nutritionSummary: calculateNutritionSummary(),
    getLogsByMealType,
    addFoodToLog,
    updateFoodLog,
    deleteFoodLog,
    saveMeal,
    clearSuccessMessage,
    clearErrorMessage
  };
};