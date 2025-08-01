import { apiService } from './apiService.js';

// FitnessGeek service for food logging and nutrition tracking
export const fitnessGeekService = {
  // ===== FOOD ITEMS =====

  // Search for foods
  searchFoods: async (query, limit = 25) => {
    try {
      const response = await apiService.get('/foods', {
        params: { search: query, limit }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  },

  // Get food by barcode
  getFoodByBarcode: async (barcode) => {
    try {
      const response = await apiService.get('/foods', {
        params: { barcode }
      });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error getting food by barcode:', error);
      throw error;
    }
  },

  // Create custom food
  createCustomFood: async (foodData) => {
    try {
      const response = await apiService.post('/foods', foodData);
      return response.data;
    } catch (error) {
      console.error('Error creating custom food:', error);
      throw error;
    }
  },

  // Update food item
  updateFood: async (foodId, updateData) => {
    try {
      const response = await apiService.put(`/foods/${foodId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  },

  // Delete food item (soft delete)
  deleteFood: async (foodId) => {
    try {
      const response = await apiService.delete(`/foods/${foodId}`);
      return response;
    } catch (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  },

  // Get all foods (global + custom)
  getAllFoods: async (limit = 50) => {
    try {
      const response = await apiService.get('/foods', {
        params: { limit }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting all foods:', error);
      throw error;
    }
  },

  // ===== FOOD LOGS =====

  // Get food logs for a date
  getLogsForDate: async (date) => {
    try {
      const response = await apiService.get('/logs', {
        params: { date }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting logs for date:', error);
      throw error;
    }
  },

  // Get recent logs
  getRecentLogs: async () => {
    try {
      const response = await apiService.get('/logs');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting recent logs:', error);
      throw error;
    }
  },

  // Add food to log
  addFoodToLog: async (logData) => {
    try {
      const response = await apiService.post('/logs', logData);
      return response; // Return full response, not response.data
    } catch (error) {
      console.error('Error adding food to log:', error);
      throw error;
    }
  },

  // Update food log
  updateFoodLog: async (logId, updateData) => {
    try {
      const response = await apiService.put(`/logs/${logId}`, updateData);
      return response; // Return full response, not response.data
    } catch (error) {
      console.error('Error updating food log:', error);
      throw error;
    }
  },

  // Delete food log
  deleteFoodLog: async (logId) => {
    try {
      const response = await apiService.delete(`/logs/${logId}`);
      return response; // Return full response, not response.data
    } catch (error) {
      console.error('Error deleting food log:', error);
      throw error;
    }
  },

  // ===== DAILY SUMMARIES =====

  // Get daily summary
  getDailySummary: async (date) => {
    try {
      const response = await apiService.get(`/summary/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error getting daily summary:', error);
      throw error;
    }
  },

  // Get today's summary
  getTodaySummary: async () => {
    try {
      const response = await apiService.get('/summary/today');
      return response.data;
    } catch (error) {
      console.error('Error getting today\'s summary:', error);
      throw error;
    }
  },

  // Get weekly summary
  getWeeklySummary: async (startDate) => {
    try {
      const response = await apiService.get(`/summary/week/${startDate}`);
      return response.data;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      throw error;
    }
  },

  // Refresh daily summary
  refreshDailySummary: async (date) => {
    try {
      const response = await apiService.post(`/summary/${date}/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing daily summary:', error);
      throw error;
    }
  },

  // ===== MEALS =====

  // Get all meals
  getMeals: async (mealType = null, search = null) => {
    try {
      const params = {};
      if (mealType) params.meal_type = mealType;
      if (search) params.search = search;

      const response = await apiService.get('/meals', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting meals:', error);
      throw error;
    }
  },

  // Get single meal
  getMeal: async (mealId) => {
    try {
      const response = await apiService.get(`/meals/${mealId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting meal:', error);
      throw error;
    }
  },

  // Create meal
  createMeal: async (mealData) => {
    try {
      const response = await apiService.post('/meals', mealData);
      return response; // Return full response, not response.data
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  },

  // Update meal
  updateMeal: async (mealId, updateData) => {
    try {
      const response = await apiService.put(`/meals/${mealId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  },

  // Delete meal
  deleteMeal: async (mealId) => {
    try {
      const response = await apiService.delete(`/meals/${mealId}`);
      return response;
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  },

  // Add meal to log
  addMealToLog: async (mealId, logDate, mealType) => {
    try {
      const response = await apiService.post(`/meals/${mealId}/add-to-log`, {
        log_date: logDate,
        meal_type: mealType
      });
      return response.data;
    } catch (error) {
      console.error('Error adding meal to log:', error);
      throw error;
    }
  },

  // ===== UTILITY FUNCTIONS =====

  // Calculate nutrition for a food item with servings
  calculateNutrition: (food, servings) => {
    const multiplier = parseFloat(servings) || 1;
    return {
      calories: Math.round(food.nutrition.calories_per_serving * multiplier),
      protein_grams: Math.round(food.nutrition.protein_grams * multiplier * 10) / 10,
      carbs_grams: Math.round(food.nutrition.carbs_grams * multiplier * 10) / 10,
      fat_grams: Math.round(food.nutrition.fat_grams * multiplier * 10) / 10,
      fiber_grams: Math.round(food.nutrition.fiber_grams * multiplier * 10) / 10,
      sugar_grams: Math.round(food.nutrition.sugar_grams * multiplier * 10) / 10,
      sodium_mg: Math.round(food.nutrition.sodium_mg * multiplier)
    };
  },

  // Format date for API
  formatDate: (date) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  // Get meal type display name
  getMealTypeName: (mealType) => {
    const names = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack'
    };
    return names[mealType] || mealType;
  },

  // Get meal type icon
  getMealTypeIcon: (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType] || '🍽️';
  }
};