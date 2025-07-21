import { apiService } from './apiService.js';

export const goalsService = {
  // Get user goals
  async getGoals() {
    try {
      const response = await apiService.get('/goals');
      return response.data; // Extract data from success wrapper
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Save user goals
  async saveGoals(goals) {
    try {
      const response = await apiService.post('/goals', goals);
      return response.data;
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  }
};