import { apiService } from './apiService.js';

export const goalsService = {
  // Get user goals
  async getGoals() {
    try {
      console.log('GoalsService: Making API call to /goals');
      const response = await apiService.get('/goals');
      console.log('GoalsService: API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Save user goals
  async saveGoals(goals) {
    try {
      console.log('GoalsService: Saving goals:', goals);
      const response = await apiService.post('/goals', goals);
      console.log('GoalsService: Save response:', response);
      return response;
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  },

  // Derived macros for today and week
  async getDerivedMacros() {
    return apiService.get('/goals/nutrition/macros');
  }
};