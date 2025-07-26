import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import WeightChart from '../components/Weight/WeightChart.jsx';
import ProgressTracker from '../components/Weight/ProgressTracker.jsx';
import QuickAddWeight from '../components/Weight/QuickAddWeight.jsx';
import WeightLogList from '../components/Weight/WeightLogList.jsx';
import { weightService } from '../services/weightService';
import { goalsService } from '../services/goalsService';

const Weight = () => {
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load weight data on mount
  useEffect(() => {
    loadWeightData();
  }, []);

  const loadWeightData = async () => {
    setLoading(true);
    try {
      // Load weight logs from database
      const response = await weightService.getWeightLogs();
      if (response.success) {
        setWeightLogs(response.data);
      } else {
        setError('Failed to load weight logs');
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
      setError('Failed to load weight data');
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (weightData) => {
    try {
      const response = await weightService.createWeightLog({
        weight_value: weightData.value,
        log_date: weightData.date
      });

      if (response.success) {
        // Reload weight data to get the updated list
        await loadWeightData();
        setSuccess('Weight logged successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to add weight log');
      }
    } catch (error) {
      setError('Failed to add weight log');
      console.error('Error adding weight log:', error);
    }
  };

  const handleDeleteWeight = async (logId) => {
    try {
      const response = await weightService.deleteWeightLog(logId);

      if (response.success) {
        // Reload weight data to get the updated list
        await loadWeightData();
        setSuccess('Weight log deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete weight log');
      }
    } catch (error) {
      setError('Failed to delete weight log');
      console.error('Error deleting weight log:', error);
    }
  };

  const getCurrentWeight = () => {
    if (weightLogs.length === 0) {
      // If no logs exist, use start weight from goals
      return weightGoal && weightGoal.enabled ? weightGoal.startWeight : null;
    }
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    return sortedLogs[0].weight_value;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentWeight = getCurrentWeight();



  return (
    <Box sx={{ p: 2, pb: 8 }}> {/* Consistent padding with FoodLog, extra bottom padding for FAB */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#6098CC' }}>
        {/* Weight Tracking */}
      </Typography>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Progress Tracker - only show if weight goal is set */}
      {weightGoal && weightGoal.enabled && currentWeight && weightGoal.startWeight && weightGoal.targetWeight && (
        <ProgressTracker
          startValue={weightGoal.startWeight}
          currentValue={currentWeight}
          targetValue={weightGoal.targetWeight}
          startDate={weightGoal.startDate}
          goalDate={weightGoal.goalDate}
          unit="lbs"
          title="Weight Progress"
        />
      )}

      {/* Weight Chart */}
      {weightLogs.length > 0 && (
        <WeightChart
          data={weightLogs}
          title="Weight Trend"
          yAxisLabel="Weight (lbs)"
          goalLine={Boolean(weightGoal && weightGoal.enabled)}
          startWeight={weightGoal?.startWeight}
          targetWeight={weightGoal?.targetWeight}
        />
      )}

      {/* Quick Add Weight */}
      <QuickAddWeight onAdd={handleAddWeight} unit="lbs" />

      {/* Weight Log List */}
      <WeightLogList
        logs={weightLogs}
        onDelete={handleDeleteWeight}
        unit="lbs"
      />
    </Box>
  );
};

export default Weight;