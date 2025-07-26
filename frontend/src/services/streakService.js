import { apiService } from './apiService.js';

export const streakService = {
  // Get user's login streak
  async getLoginStreak() {
    try {
      console.log('StreakService: Making API call to /streaks/login');
      const response = await apiService.get('/streaks/login');
      console.log('StreakService: API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching login streak:', error);
      throw error;
    }
  },

  // Record a login (called when user logs in)
  async recordLogin() {
    try {
      const response = await apiService.post('/streaks/login');
      return response;
    } catch (error) {
      console.error('Error recording login:', error);
      throw error;
    }
  }
};