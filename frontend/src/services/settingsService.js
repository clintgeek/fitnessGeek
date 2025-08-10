import { apiService } from './apiService.js';

export const settingsService = {
  // Get user settings
  getSettings: async () => {
    try {
      console.log('SettingsService: Getting settings...');
      const response = await apiService.get('/settings');
      console.log('SettingsService: Response:', response);
      return response;
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
      console.log('SettingsService: Updating dashboard settings:', dashboardSettings);
      const response = await apiService.put('/settings/dashboard', dashboardSettings);
      console.log('SettingsService: Update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      throw error;
    }
  },

  // Update AI settings specifically
  updateAISettings: async (aiSettings) => {
    try {
      console.log('SettingsService: Updating AI settings:', aiSettings);
      const response = await apiService.put('/settings/ai', aiSettings);
      console.log('SettingsService: AI update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating AI settings:', error);
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
    show_garmin_summary: true,
    show_quick_actions: true,
    show_weight_goal: true,
    show_nutrition_goal: true,
    card_order: [
      'current_weight',
      'blood_pressure',
      'calories_today',
      'login_streak',
      'nutrition_today',
      'garmin_summary',
      'quick_actions',
      'weight_goal',
      'nutrition_goal'
    ]
  }),

  // Get default AI settings
  getDefaultAISettings: () => ({
    enabled: true,
    features: {
      natural_language_food_logging: true,
      meal_suggestions: true,
      nutrition_analysis: true,
      goal_recommendations: true
    }
  }),

  // Get default Garmin settings
  getDefaultGarminSettings: () => ({
    enabled: false,
    username: '',
    password: ''
  })
};