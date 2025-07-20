import axios from 'axios';

// baseGeek API configuration
const BASEGEEK_URL = 'https://basegeek.clintgeek.com';
const APP_NAME = 'fitnessgeek'; // FitnessGeek app name

// Auth service using baseGeek
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await axios.post(`${BASEGEEK_URL}/api/auth/register`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        app: APP_NAME
      });

      const { token, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('geek_token', token);
      localStorage.setItem('geek_refresh_token', refreshToken);

      // Set up axios interceptor for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Login credentials:', credentials); // Debug log
      const requestData = {
        identifier: credentials.identifier,
        password: credentials.password,
        app: APP_NAME
      };
      console.log('Request data:', requestData); // Debug log
      const response = await axios.post(`${BASEGEEK_URL}/api/auth/login`, requestData);

      const { token, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('geek_token', token);
      localStorage.setItem('geek_refresh_token', refreshToken);

      // Set up axios interceptor for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Error logging in:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('geek_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${BASEGEEK_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    // Clear tokens
    localStorage.removeItem('geek_token');
    localStorage.removeItem('geek_refresh_token');
    delete axios.defaults.headers.common['Authorization'];
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('geek_token');
    return !!token;
  },

  // Initialize auth from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('geek_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  },

  // Validate token
  validateToken: async () => {
    const token = localStorage.getItem('geek_token');
    if (!token) {
      return false;
    }

    try {
      const response = await axios.post(`${BASEGEEK_URL}/api/auth/validate`, {
        token,
        app: APP_NAME
      });

      return response.data.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('geek_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await axios.post(`${BASEGEEK_URL}/api/auth/refresh`, {
        refreshToken,
        app: APP_NAME
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;

      // Update stored tokens
      localStorage.setItem('geek_token', token);
      localStorage.setItem('geek_refresh_token', newRefreshToken);

      // Update axios interceptor
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { user, token, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, logout the user
      authService.logout();
      throw error;
    }
  }
};