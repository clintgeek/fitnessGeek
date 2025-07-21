import { apiService } from './apiService.js';

export const goalsService = {
  // Get user goals
  async getGoals() {
    try {
      console.log('GoalsService: Making API call to /goals');
      const response = await apiService.get('/goals');
      console.log('GoalsService: API response:', response);
      return response; // Return the full response, let the caller handle it
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