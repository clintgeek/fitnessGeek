import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsService } from '../services/goalsService.js';
import { useAuth } from '../hooks/useAuth.js';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Flag as GoalsIcon,
  Restaurant as NutritionIcon,
  MonitorWeight as WeightIcon
} from '@mui/icons-material';

const Goals = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [nutritionGoals, setNutritionGoals] = useState({
    trackMacros: true,
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });

  const [weightGoal, setWeightGoal] = useState({
    enabled: false,
    startWeight: 0,
    targetWeight: 0,
    startDate: new Date().toISOString().split('T')[0],
    goalDate: ''
  });

  const [saved, setSaved] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Load goals from backend on component mount
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const loadGoals = async () => {
      try {
        setLoadingGoals(true);
        const response = await goalsService.getGoals();
        console.log('Loaded goals from backend:', response);

        // Extract the data from the response
        const goals = response.data;
        console.log('Weight goals check:', goals?.weight);
        console.log('Weight startWeight:', goals?.weight?.startWeight);
        console.log('Weight targetWeight:', goals?.weight?.targetWeight);

        if (goals && goals.nutrition) {
          setNutritionGoals({
            trackMacros: goals.nutrition.trackMacros || false,
            calories: goals.nutrition.goals?.calories || 2000,
            protein: goals.nutrition.goals?.protein || 150,
            carbs: goals.nutrition.goals?.carbs || 200,
            fat: goals.nutrition.goals?.fat || 65
          });
        }

        // Handle weight goals - only update if we actually have weight data
        if (goals && goals.weight && goals.weight.startWeight && goals.weight.targetWeight && goals.weight.is_active) {
          setWeightGoal({
            enabled: true,
            startWeight: goals.weight.startWeight,
            targetWeight: goals.weight.targetWeight,
            startDate: goals.weight.startDate ? new Date(goals.weight.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            goalDate: goals.weight.goalDate ? new Date(goals.weight.goalDate).toISOString().split('T')[0] : ''
          });
        } else if (goals && goals.weight === null) {
          // If backend explicitly returns null for weight, reset to disabled state
          setWeightGoal({
            enabled: false,
            startWeight: 0,
            targetWeight: 0,
            startDate: new Date().toISOString().split('T')[0],
            goalDate: ''
          });
        } else {
          // If no weight goals from backend, keep current state (don't reset to disabled)
          console.log('No weight goals found in backend, keeping current state');
        }
      } catch (error) {
        console.error('Failed to load goals:', error);

        // If authentication error, redirect to login
        if (error.message && error.message.includes('Unauthorized')) {
          navigate('/login');
          return;
        }
      } finally {
        setLoadingGoals(false);
      }
    };

    loadGoals();
  }, [isAuthenticated, loading, navigate]);

  // Helper functions for progress tracking
  const calculateWeightProgress = (currentWeight) => {
    if (!weightGoal.enabled || weightGoal.startWeight === weightGoal.targetWeight) {
      return { percentage: 0, status: 'no-goal' };
    }

    const totalChange = weightGoal.startWeight - weightGoal.targetWeight;
    const currentChange = weightGoal.startWeight - currentWeight;
    const percentage = Math.min(Math.max((currentChange / totalChange) * 100, 0), 100);

    return { percentage, status: 'tracking' };
  };

  const calculateTimeProgress = () => {
    if (!weightGoal.goalDate) {
      return { percentage: 0, status: 'no-deadline' };
    }

    const startDate = new Date(weightGoal.startDate);
    const goalDate = new Date(weightGoal.goalDate);
    const currentDate = new Date();

    const totalDays = (goalDate - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = (currentDate - startDate) / (1000 * 60 * 60 * 24);
    const percentage = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

    let status = 'on-track';
    if (elapsedDays > totalDays) {
      status = 'behind';
    } else if (percentage < 50 && elapsedDays > totalDays * 0.5) {
      status = 'ahead';
    }

    return { percentage, status };
  };

  const handleNutritionChange = (field, value) => {
    setNutritionGoals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeightChange = (field, value) => {
    setWeightGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const handleSave = async () => {
    // Build goals object with only specified values
    const goalsToSave = {
      nutrition: {
        trackMacros: nutritionGoals.trackMacros,
        goals: {}
      },
      weight: weightGoal.enabled ? {
        startWeight: weightGoal.startWeight,
        targetWeight: weightGoal.targetWeight,
        startDate: weightGoal.startDate,
        goalDate: weightGoal.goalDate || null,
        totalWeightToLose: weightGoal.startWeight - weightGoal.targetWeight
      } : null
    };

    // Add nutrition goals for any values the user has specified
    if (nutritionGoals.calories > 0) {
      goalsToSave.nutrition.goals.calories = nutritionGoals.calories;
    }
    if (nutritionGoals.protein > 0) {
      goalsToSave.nutrition.goals.protein = nutritionGoals.protein;
    }
    if (nutritionGoals.carbs > 0) {
      goalsToSave.nutrition.goals.carbs = nutritionGoals.carbs;
    }
    if (nutritionGoals.fat > 0) {
      goalsToSave.nutrition.goals.fat = nutritionGoals.fat;
    }

    try {
      console.log('Saving goals to backend:', goalsToSave);
      // Save to backend
      await goalsService.saveGoals(goalsToSave);

      // Also save to localStorage as backup
      localStorage.setItem('fitnessGeek_nutritionGoals', JSON.stringify(nutritionGoals));
      localStorage.setItem('fitnessGeek_weightGoal', JSON.stringify(weightGoal));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save goals:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('fitnessGeek_nutritionGoals', JSON.stringify(nutritionGoals));
      localStorage.setItem('fitnessGeek_weightGoal', JSON.stringify(weightGoal));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', py: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#6098CC' }}>
        <GoalsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Goals & Targets
      </Typography>

      {loading || loadingGoals ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Goals saved successfully!
            </Alert>
          )}

      {/* Nutrition Goals */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NutritionIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Nutrition Goals
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={nutritionGoals.trackMacros}
                onChange={(e) => handleNutritionChange('trackMacros', e.target.checked)}
                color="primary"
              />
            }
            label="Track Macros"
            sx={{ mb: 2 }}
          />

          {nutritionGoals.trackMacros ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Daily Calories (Optional)"
                  type="number"
                  value={nutritionGoals.calories}
                  onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: 'cal' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Protein (Optional)"
                  type="number"
                  value={nutritionGoals.protein}
                  onChange={(e) => handleNutritionChange('protein', parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: 'g' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Carbohydrates (Required)"
                  type="number"
                  required
                  value={nutritionGoals.carbs}
                  onChange={(e) => handleNutritionChange('carbs', parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: 'g' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fat (Optional)"
                  type="number"
                  value={nutritionGoals.fat}
                  onChange={(e) => handleNutritionChange('fat', parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: 'g' }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Calories (Required)"
                  type="number"
                  required
                  value={nutritionGoals.calories}
                  onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: 'cal' }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Weight Goals */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WeightIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Weight Goals
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={weightGoal.enabled}
                onChange={(e) => handleWeightChange('enabled', e.target.checked)}
                color="primary"
              />
            }
            label="Enable weight tracking"
            sx={{ mb: 2 }}
          />

          {weightGoal.enabled && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Starting Weight"
                  type="number"
                  value={weightGoal.startWeight}
                  onChange={(e) => handleWeightChange('startWeight', parseFloat(e.target.value) || 0)}
                  inputProps={{
                    step: "0.1",
                    min: "0",
                    max: "1000"
                  }}
                  InputProps={{ endAdornment: 'lbs' }}
                  helperText="Enter to one decimal place"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Target Weight"
                  type="number"
                  value={weightGoal.targetWeight}
                  onChange={(e) => handleWeightChange('targetWeight', parseFloat(e.target.value) || 0)}
                  inputProps={{
                    step: "0.1",
                    min: "0",
                    max: "1000"
                  }}
                  InputProps={{ endAdornment: 'lbs' }}
                  helperText="Enter to one decimal place"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={weightGoal.startDate}
                  onChange={(e) => handleWeightChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Goal Date (Optional)"
                  type="date"
                  value={weightGoal.goalDate}
                  onChange={(e) => handleWeightChange('goalDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Progress Preview (if weight goal is enabled) */}
      {weightGoal.enabled && (weightGoal.startWeight > 0 || weightGoal.targetWeight > 0) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Progress Tracking Preview
            </Typography>

            {weightGoal.startWeight > 0 && weightGoal.targetWeight > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Weight Progress: {calculateWeightProgress(weightGoal.startWeight).percentage.toFixed(1)}% complete
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {weightGoal.startWeight} lbs → {weightGoal.targetWeight} lbs
                  ({weightGoal.startWeight - weightGoal.targetWeight > 0 ? 'Lose' : 'Gain'} {Math.abs(weightGoal.startWeight - weightGoal.targetWeight)} lbs)
                </Typography>
              </Box>
            )}

            {weightGoal.goalDate && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Time Progress: {calculateTimeProgress().percentage.toFixed(1)}% elapsed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {calculateTimeProgress().status === 'on-track' ? 'On Track' :
                          calculateTimeProgress().status === 'ahead' ? 'Ahead of Schedule' :
                          calculateTimeProgress().status === 'behind' ? 'Behind Schedule' : 'No Deadline'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{
            backgroundColor: '#6098CC',
            '&:hover': {
              backgroundColor: '#4a7ba8'
            },
            px: 4,
            py: 1.5
          }}
        >
          Save Goals
        </Button>
      </Box>
        </>
      )}
    </Box>
  );
};

export default Goals;