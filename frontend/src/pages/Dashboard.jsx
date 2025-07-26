import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Restaurant as FoodIcon,
  MonitorWeight as WeightIcon,
  MonitorHeart as BPIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  LocalFireDepartment as StreakIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  RestaurantMenu as NutritionIcon,
  Restaurant as ForkKnifeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings.js';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { weightService } from '../services/weightService.js';
import { bpService } from '../services/bpService.js';
import { goalsService } from '../services/goalsService.js';
import { streakService } from '../services/streakService.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard data state
  const [todaySummary, setTodaySummary] = useState(null);
  const [weightStats, setWeightStats] = useState(null);
  const [latestBP, setLatestBP] = useState(null);
  const [weeklyBP, setWeeklyBP] = useState(null);
  const [goals, setGoals] = useState(null);
  const [loginStreak, setLoginStreak] = useState({ current: 0, longest: 0 });
  const { dashboardSettings, loading: settingsLoading } = useSettings();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load data in parallel
        const [
          summaryData,
          weightData,
          bpData,
          goalsData,
          streakData
        ] = await Promise.allSettled([
          fitnessGeekService.getTodaySummary(),
          weightService.getWeightStats(),
          bpService.getBPLogs({ limit: 7 }),
          goalsService.getGoals(),
          streakService.getLoginStreak()
        ]);

        // Handle today's summary
        if (summaryData.status === 'fulfilled') {
          setTodaySummary(summaryData.value);
        }

        // Handle weight stats
        if (weightData.status === 'fulfilled' && weightData.value.success) {
          setWeightStats(weightData.value.data);
        }

        // Handle blood pressure data
        if (bpData.status === 'fulfilled' && bpData.value.success) {
          const logs = bpData.value.data;
          if (logs.length > 0) {
            setLatestBP(logs[0]); // Most recent reading

            // Calculate weekly average
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weeklyLogs = logs.filter(log => new Date(log.log_date) >= weekAgo);
            if (weeklyLogs.length > 0) {
              const avgSystolic = weeklyLogs.reduce((sum, log) => sum + log.systolic, 0) / weeklyLogs.length;
              const avgDiastolic = weeklyLogs.reduce((sum, log) => sum + log.diastolic, 0) / weeklyLogs.length;
              setWeeklyBP({ systolic: Math.round(avgSystolic), diastolic: Math.round(avgDiastolic) });
            }
          }
        }

        // Handle goals
        if (goalsData.status === 'fulfilled' && goalsData.value && goalsData.value.success) {
          setGoals(goalsData.value.data);
        }

        // Handle login streak
        if (streakData.status === 'fulfilled' && streakData.value.success) {
          setLoginStreak({
            current: streakData.value.data.current,
            longest: streakData.value.data.longest
          });
        } else {
          // Fallback to 0 if streak data fails
          setLoginStreak({ current: 0, longest: 0 });
        }

        // Record this login visit (only once per day)
        try {
          await streakService.recordLogin();
        } catch (error) {
          console.error('Failed to record login for streak:', error);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Helper functions
  const renderCardByType = (cardType) => {
    switch (cardType) {
      case 'current_weight':
        return dashboardSettings.show_current_weight && (
          <Card key="weight-progress" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#6098CC', mr: 1.5, width: 32, height: 32 }}>
                  <WeightIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Weight Progress
                </Typography>
              </Box>

              {weightStats ? (
                <>
                  {/* Weekly Change - Main Display */}
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                    {weightStats.weeklyChange ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getWeightChangeIcon(weightStats.weeklyChange)}
                        <Typography
                          variant="h5"
                          color={getWeightChangeColor(weightStats.weeklyChange)}
                          sx={{ ml: 0.5, fontWeight: 600 }}
                        >
                          {weightStats.weeklyChange > 0 ? '+' : ''}{weightStats.weeklyChange.toFixed(1)} lbs
                        </Typography>
                      </Box>
                    ) : (
                      'No change'
                    )}
                  </Typography>

                  {/* Week Label */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    This week
                  </Typography>

                  {/* Overall Progress */}
                  {weightStats.totalChange && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography
                        variant="body2"
                        color={getWeightChangeColor(weightStats.totalChange)}
                        sx={{ fontWeight: 500 }}
                      >
                        {weightStats.totalChange > 0 ? '+' : ''}{weightStats.totalChange.toFixed(1)} lbs overall
                      </Typography>
                    </Box>
                  )}

                  {/* Progress Status */}
                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress Status
                    </Typography>
                    <Chip
                      label={weightStats.weeklyChange > 0 ? 'Gaining' : weightStats.weeklyChange < 0 ? 'Losing' : 'Maintaining'}
                      size="small"
                      color={weightStats.weeklyChange > 0 ? 'error' : weightStats.weeklyChange < 0 ? 'success' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No weight data
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 'blood_pressure':
        return dashboardSettings.show_blood_pressure && (
          <Card key="blood-pressure" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#f44336', mr: 1.5, width: 32, height: 32 }}>
                  <BPIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Blood Pressure
                </Typography>
              </Box>

              {latestBP ? (
                <>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                    {latestBP.systolic}/{latestBP.diastolic}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getBPStatus(latestBP.systolic, latestBP.diastolic).icon}
                    <Typography
                      variant="body2"
                      sx={{ ml: 0.5, fontWeight: 500 }}
                      color={getBPStatus(latestBP.systolic, latestBP.diastolic).color}
                    >
                      {getBPStatus(latestBP.systolic, latestBP.diastolic).status}
                    </Typography>
                  </Box>

                  {weeklyBP && (
                    <Typography variant="caption" color="text.secondary">
                      Weekly avg: {weeklyBP.systolic}/{weeklyBP.diastolic}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No BP readings
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 'calories_today':
        return dashboardSettings.show_calories_today && (
          <Card key="calories" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 1.5, width: 32, height: 32 }}>
                  <FoodIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Calories Today
                </Typography>
              </Box>

              {todaySummary ? (
                <>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                    {todaySummary.totals?.calories || 0}
                  </Typography>

                  {goals?.nutrition?.goals?.calories ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        of {goals.nutrition.goals.calories} target
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((todaySummary.totals?.calories || 0) / goals.nutrition.goals.calories) * 100, 100)}
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                      />

                      {/* Weekly Progress */}
                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Weekly Progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Week: {todaySummary.totals?.calories || 0} of {goals.nutrition.goals.calories * 7} target
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 1 }}>
                      No calorie goal set
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data today
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 'login_streak':
        return dashboardSettings.show_login_streak && (
          <Card key="login-streak" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 1.5, width: 32, height: 32 }}>
                  <StreakIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Login Streak
                </Typography>
              </Box>

              <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                {loginStreak.current} days
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Current</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {loginStreak.current} days
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Longest</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {loginStreak.longest} days
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {loginStreak.current > 0 ? 'Keep it up! 🔥' : 'Start your streak today!'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      case 'nutrition_today':
        return dashboardSettings.show_nutrition_today && (
          <Card key="nutrition" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', mr: 1.5, width: 32, height: 32 }}>
                  <NutritionIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Nutrition Today
                </Typography>
              </Box>

              {todaySummary ? (
                <Grid container spacing={2} sx={{ flex: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {todaySummary.totals?.protein_grams || 0}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Protein
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {goals?.nutrition?.goals?.protein || 'Not set'}g
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={goals?.nutrition?.goals?.protein ? Math.min(((todaySummary.totals?.protein_grams || 0) / goals.nutrition.goals.protein) * 100, 100) : 0}
                        sx={{ height: 4, borderRadius: 2, mt: 1 }}
                        color="success"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196f3' }}>
                        {todaySummary.totals?.carbs_grams || 0}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbs
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {goals?.nutrition?.goals?.carbs || 'Not set'}g
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={goals?.nutrition?.goals?.carbs ? Math.min(((todaySummary.totals?.carbs_grams || 0) / goals.nutrition.goals.carbs) * 100, 100) : 0}
                        sx={{ height: 4, borderRadius: 2, mt: 1 }}
                        color="info"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                        {todaySummary.totals?.fat_grams || 0}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fat
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {goals?.nutrition?.goals?.fat || 'Not set'}g
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={goals?.nutrition?.goals?.fat ? Math.min(((todaySummary.totals?.fat_grams || 0) / goals.nutrition.goals.fat) * 100, 100) : 0}
                        sx={{ height: 4, borderRadius: 2, mt: 1 }}
                        color="warning"
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No nutrition data available
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 'quick_actions':
        return dashboardSettings.show_quick_actions && (
          <Card key="quick-actions" sx={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            height: '200px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => handleQuickAction('food')}
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#388e3c',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ForkKnifeIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={() => handleQuickAction('weight')}
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#6098CC',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#4a7ba8',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <WeightIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={() => handleQuickAction('bp')}
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#f44336',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#d32f2f',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <BPIcon fontSize="large" />
                  </IconButton>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Quick Log
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Food • Weight • BP
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      case 'weight_goal':
        return dashboardSettings.show_weight_goal && goals?.weight && (
          <Card key="weight-goal" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#6098CC', mr: 1.5, width: 32, height: 32 }}>
                  <WeightIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Weight Goal
                </Typography>
              </Box>

              {/* Calculate amount to lose/gain */}
              {(() => {
                const totalChange = goals.weight.targetWeight - goals.weight.startWeight;
                const isLosing = totalChange < 0;
                const changeText = isLosing ? `Lose ${Math.abs(totalChange).toFixed(1)} lbs` : `Gain ${totalChange.toFixed(1)} lbs`;

                return (
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {changeText}
                  </Typography>
                );
              })()}

              {weightStats && weightStats.currentWeight ? (
                <>
                  {/* Current Progress */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getWeightChangeIcon(weightStats.totalChange)}
                    <Typography
                      variant="body2"
                      color={getWeightChangeColor(weightStats.totalChange)}
                      sx={{ ml: 0.5, fontWeight: 500 }}
                    >
                      {weightStats.totalChange ? `${weightStats.totalChange > 0 ? '+' : ''}${weightStats.totalChange.toFixed(1)} lbs` : 'No change'}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(((goals.weight.startWeight - weightStats.currentWeight) / (goals.weight.startWeight - goals.weight.targetWeight)) * 100, 0), 100)}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />

                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Chip
                      label={`${Math.round(((goals.weight.startWeight - weightStats.currentWeight) / (goals.weight.startWeight - goals.weight.targetWeight)) * 100)}% Complete`}
                      size="small"
                      color="primary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 1 }}>
                  No weight data to track progress
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 'nutrition_goal':
        return dashboardSettings.show_nutrition_goal && goals?.nutrition && (
          <Card key="nutrition-goal" sx={{
            height: '200px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 1.5, width: 32, height: 32 }}>
                  <FoodIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Nutrition Goals
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Daily Targets
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Calories</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {goals.nutrition.goals?.calories || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Protein</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {goals.nutrition.goals?.protein || 0}g
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Carbs</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {goals.nutrition.goals?.carbs || 0}g
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Fat</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {goals.nutrition.goals?.fat || 0}g
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Daily nutrition targets set
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getBPStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: '#4caf50', icon: <CheckIcon /> };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: '#ff9800', icon: <WarningIcon /> };
    if (systolic >= 130 || diastolic >= 80) return { status: 'High', color: '#f44336', icon: <ErrorIcon /> };
    return { status: 'Unknown', color: '#666', icon: <InfoIcon /> };
  };

  const getWeightChangeColor = (change) => {
    if (change > 0) return '#f44336';
    if (change < 0) return '#4caf50';
    return '#666';
  };

  const getWeightChangeIcon = (change) => {
    if (change > 0) return <TrendingUpIcon sx={{ color: '#f44336' }} />;
    if (change < 0) return <TrendingDownIcon sx={{ color: '#4caf50' }} />;
    return <TrendingIcon sx={{ color: '#666' }} />;
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'food':
        navigate('/food-log');
        break;
      case 'weight':
        navigate('/weight');
        break;
      case 'bp':
        navigate('/blood-pressure');
        break;
      default:
        break;
    }
  };

  if (loading || settingsLoading || !dashboardSettings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Cards - Ordered Layout */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 2,
        mb: 3
      }}>
        {dashboardSettings.card_order?.map((cardType) => renderCardByType(cardType))}
      </Box>
    </Box>
  );
};

export default Dashboard;