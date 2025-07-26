import React, { createContext, useState, useEffect, useContext } from 'react';
import { settingsService } from '../services/settingsService.js';
import { AuthContext } from './AuthContextDef.jsx';

const SettingsContext = createContext();

export { SettingsContext };

export const SettingsProvider = ({ children }) => {
  const { user, loading: authLoading, isAuthenticated } = useContext(AuthContext);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('SettingsProvider: Component created/recreated');
  console.log('SettingsProvider: Auth state:', { user, authLoading, isAuthenticated });

  // Load settings when authentication is ready
  useEffect(() => {
    console.log('SettingsContext: useEffect triggered, auth state:', { authLoading, isAuthenticated });

    // Only load settings if authentication is ready and user is authenticated
    if (!authLoading && isAuthenticated) {
      console.log('SettingsContext: Auth ready, loading settings...');
      loadSettings();
    } else if (!authLoading && !isAuthenticated) {
      console.log('SettingsContext: Not authenticated, clearing settings');
      setDashboardSettings(null);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('Loading settings...');

      // Debug: Check what token is being used
      const geekToken = localStorage.getItem('geek_token');
      console.log('Current geek_token:', geekToken ? geekToken.substring(0, 20) + '...' : 'none');

      // Decode the token to see the user ID
      if (geekToken) {
        try {
          const payload = JSON.parse(atob(geekToken.split('.')[1]));
          console.log('Token payload:', payload);
          console.log('User ID from token:', payload.id);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      const response = await settingsService.getSettings();
      console.log('Settings response:', response);
      if (response.data && response.data.dashboard) {
        console.log('Setting dashboard settings:', response.data.dashboard);
        setDashboardSettings(response.data.dashboard);
        console.log('SettingsProvider: Settings set from backend');
      } else {
        console.log('No dashboard settings found, using defaults');
        setDashboardSettings(settingsService.getDefaultDashboardSettings());
        console.log('SettingsProvider: Settings set from defaults (no backend data)');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
      console.log('Using default settings due to error');
      setDashboardSettings(settingsService.getDefaultDashboardSettings());
      console.log('SettingsProvider: Settings set from defaults (error)');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardSettings = async (newSettings) => {
    try {
      setLoading(true);
      await settingsService.updateDashboardSettings(newSettings);
      setDashboardSettings(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardSetting = async (setting, value) => {
    const updatedSettings = {
      ...dashboardSettings,
      [setting]: value
    };
    console.log('Updating dashboard setting:', setting, value, updatedSettings);
    const result = await updateDashboardSettings(updatedSettings);
    console.log('Update result:', result);
    return result;
  };

  const refreshSettings = () => {
    loadSettings();
  };

  const value = {
    dashboardSettings,
    loading,
    updateDashboardSettings,
    updateDashboardSetting,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};