import { apiService } from './apiService.js';

// baseGeek user profile API endpoints
const BASEGEEK_URL = 'https://basegeek.clintgeek.com';

export const userService = {
  /**
   * Update user profile via baseGeek
   * @param {Object} profileData - User profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      // Get the user's token from localStorage
      const token = localStorage.getItem('geek_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASEGEEK_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: profileData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const result = await response.json();
      return { success: true, data: result.user };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Get user profile from baseGeek
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      // Get the user's token from localStorage
      const token = localStorage.getItem('geek_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASEGEEK_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get profile');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw new Error(error.message || 'Failed to get profile');
    }
  },

  /**
   * Get user's latest weight from fitnessGeek logs
   * @returns {Promise<number|null>} Latest weight or null
   */
  async getLatestWeight() {
    try {
      const response = await apiService.get('/weight', {
        params: {
          limit: 1,
          sort: 'date:desc'
        }
      });

      const logs = response.data.data || response.data;
      if (logs && logs.length > 0) {
        return logs[0].weight_value;
      }
      return null;
    } catch (error) {
      console.error('Failed to get latest weight:', error);
      return null;
    }
  }
};
