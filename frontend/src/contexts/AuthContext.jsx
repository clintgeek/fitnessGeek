import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { streakService } from '../services/streakService.js';
import { AuthContext } from './AuthContextDef.jsx';

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up periodic token refresh
  useEffect(() => {
    if (user) {
      // Refresh token every 30 minutes to keep session alive
      const refreshInterval = setInterval(async () => {
        try {
          await authService.refreshToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Periodic token refresh failed:', error);
          // If refresh fails, logout user
          logout();
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        try {
          // Try to get current user (this will trigger token refresh if needed)
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          // Record daily login once per local day
          await recordDailyLoginIfNeeded();
        } catch (error) {
          console.error('Error getting current user:', error);
          // If getting user fails, try to refresh token
          try {
            const refreshResult = await authService.refreshToken();
            setUser(refreshResult.user);
            await recordDailyLoginIfNeeded();
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // If refresh fails, logout the user
            authService.logout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // If there's an error, logout the user
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      setUser(response.user);
      await recordDailyLoginIfNeeded();

      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Record streak once per local calendar day
  const recordDailyLoginIfNeeded = async () => {
    try {
      const todayLocal = (() => {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().split('T')[0];
      })();
      const key = 'fitnessgeek_last_login_recorded';
      const last = localStorage.getItem(key);
      if (last !== todayLocal) {
        await streakService.recordLogin();
        localStorage.setItem(key, todayLocal);
      }
    } catch (e) {
      console.error('Failed to record daily login streak:', e);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);
      setUser(response.user);

      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

