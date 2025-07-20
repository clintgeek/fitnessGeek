import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
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

    const initializeAuth = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Validate token first
        const isValid = await authService.validateToken();
        if (isValid) {
          // Try to get current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          // Token is invalid, logout the user
          authService.logout();
          setUser(null);
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

      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
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

