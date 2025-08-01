import { useState, useEffect } from 'react';
import { weightService } from '../services/weightService';
import { goalsService } from '../services/goalsService';

export const useWeight = () => {
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load weight data
  const loadWeightData = async () => {
    setLoading(true);
    try {
      // Load weight logs from database
      const response = await weightService.getWeightLogs();
      if (response.success) {
        setWeightLogs(response.data);
      } else {
        setAutoCloseMessage('Failed to load weight logs', setError);
      }

      // Load goals from backend
      try {
        const goalsResponse = await goalsService.getGoals();
        if (goalsResponse && goalsResponse.data && goalsResponse.data.weight) {
          // Convert backend format to frontend format
          const backendWeightGoal = goalsResponse.data.weight;
          setWeightGoal({
            ...backendWeightGoal,
            enabled: backendWeightGoal.is_active // Convert is_active to enabled
          });
        }
      } catch (goalsError) {
        console.error('Error loading goals:', goalsError);
        // Don't set error for goals failure, just log it
      }
    } catch (error) {
      setAutoCloseMessage('Failed to load weight data', setError);
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add weight log
  const addWeightLog = async (weightData) => {
    try {
      const response = await weightService.createWeightLog({
        weight_value: weightData.value,
        log_date: weightData.date
      });

      if (response.success) {
        // Reload weight data to get the updated list
        await loadWeightData();
        setAutoCloseMessage('Weight logged successfully!', setSuccess);
        return true;
      } else {
        setAutoCloseMessage(response.message || 'Failed to add weight log', setError);
        return false;
      }
    } catch (error) {
      setAutoCloseMessage('Failed to add weight log', setError);
      console.error('Error adding weight log:', error);
      return false;
    }
  };

  // Delete weight log
  const deleteWeightLog = async (logId) => {
    try {
      const response = await weightService.deleteWeightLog(logId);

      if (response.success) {
        // Reload weight data to get the updated list
        await loadWeightData();
        setAutoCloseMessage('Weight log deleted successfully!', setSuccess);
        return true;
      } else {
        setAutoCloseMessage(response.message || 'Failed to delete weight log', setError);
        return false;
      }
    } catch (error) {
      setAutoCloseMessage('Failed to delete weight log', setError);
      console.error('Error deleting weight log:', error);
      return false;
    }
  };

  // Get current weight
  const getCurrentWeight = () => {
    if (weightLogs.length === 0) {
      // If no logs exist, use start weight from goals
      return weightGoal && weightGoal.enabled ? weightGoal.startWeight : null;
    }
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    return sortedLogs[0].weight_value;
  };

  // Clear messages
  const clearSuccessMessage = () => setSuccess('');
  const clearErrorMessage = () => setError('');

  // Auto-close messages after 3 seconds
  const setAutoCloseMessage = (message, setMessage) => {
    setMessage(message);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // Load data on mount
  useEffect(() => {
    loadWeightData();
  }, []);

  return {
    // State
    weightLogs,
    weightGoal,
    loading,
    error,
    success,
    currentWeight: getCurrentWeight(),

    // Actions
    addWeightLog,
    deleteWeightLog,
    loadWeightData,
    clearSuccessMessage,
    clearErrorMessage,
    setAutoCloseMessage
  };
};