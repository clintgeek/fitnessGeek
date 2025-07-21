import { apiService } from './apiService.js';

export const settingsService = {
  // Get user settings
  getSettings: async () => {
    try {
      const response = await apiService.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await apiService.put('/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Update dashboard settings specifically
  updateDashboardSettings: async (dashboardSettings) => {
    try {
      const response = await apiService.put('/settings/dashboard', dashboardSettings);
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      throw error;
    }
  },

  // Get default dashboard settings
  getDefaultDashboardSettings: () => ({
    show_current_weight: true,
    show_blood_pressure: true,
    show_calories_today: true,
    show_login_streak: true,
    show_nutrition_today: true,
    show_quick_actions: true,
    show_weight_goal: true,
    show_nutrition_goal: true,
    card_order: [
      'current_weight',
      'blood_pressure',
      'calories_today',
      'login_streak',
      'nutrition_today',
      'quick_actions',
      'weight_goal',
      'nutrition_goal'
    ]
  })
};