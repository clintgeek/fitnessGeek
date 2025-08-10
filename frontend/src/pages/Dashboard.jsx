import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Grid
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
  Restaurant as ForkKnifeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings.js';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { goalsService } from '../services/goalsService.js';
import { weightService } from '../services/weightService.js';
import { bpService } from '../services/bpService.js';
import { settingsService } from '../services/settingsService.js';
import { streakService } from '../services/streakService.js';
import { MetricCard, DashboardHeader } from '../components/Dashboard';
import NutritionSummary from '../components/FoodLog/NutritionSummary.jsx';
import GarminSummaryCard from '../components/Dashboard/GarminSummaryCard.jsx';
import { dashboardCards } from '../components/Dashboard/cardsRegistry.jsx';
import { useDerivedMacros } from '../hooks/dashboard/useDerivedMacros.js';
import { useGarminDaily } from '../hooks/dashboard/useGarminDaily.js';
import { CircularProgress as Spinner } from '@mui/material';
import logger from '../utils/logger.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard data state
  const [todaySummary, setTodaySummary] = useState(null);
  const [weightStats, setWeightStats] = useState(null);
  const [latestBP, setLatestBP] = useState(null);
  const [weeklyBP, setWeeklyBP] = useState(null);
  const [goals, setGoals] = useState(null);
  const [loginStreak, setLoginStreak] = useState({ current: 0, longest: 0 });
  const [garminDaily, setGarminDaily] = useState(null);
  const [macroTargets, setMacroTargets] = useState(null);
  const { dashboardSettings, loading: settingsLoading } = useSettings();

  // Derived hooks
  const { today: derivedToday } = useDerivedMacros();
  const { daily: garminDailyHook } = useGarminDaily();

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
          streakData,
          garminData,
          macrosData
        ] = await Promise.allSettled([
          fitnessGeekService.getTodaySummary(),
          weightService.getWeightStats(),
          bpService.getBPLogs({ limit: 7 }),
          settingsService.getSettings(),
          streakService.getLoginStreak(),
          fitnessGeekService.getGarminDaily(),
          goalsService.getDerivedMacros()
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

        // Handle goals from settings
        if (goalsData.status === 'fulfilled' && goalsData.value) {
          const resp = goalsData.value;
          const data = resp.data || resp;
          const ng = data?.nutrition_goal;
          if (ng && ng.enabled) {
            const now = new Date();
            const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
            const [y, m, d] = local.toISOString().split('T')[0].split('-').map(Number);
            const today = new Date(y, (m || 1) - 1, d || 1);
            const dayIndex = (today.getDay() + 6) % 7;
            const dayTarget = Array.isArray(ng.weekly_schedule) && ng.weekly_schedule.length === 7
              ? ng.weekly_schedule[dayIndex]
              : ng.daily_calorie_target;
            setGoals({ nutrition: { goals: { calories: Math.round(dayTarget || 0) } } });
          } else {
            setGoals(null);
          }
        }

        // Handle derived macros (protein/fat fixed, carbs-by-day)
        if (macrosData.status === 'fulfilled' && macrosData.value) {
          const resp = macrosData.value;
          const payload = resp.data || resp; // apiService returns response.data
          const today = payload?.today;
          if (today) {
            setMacroTargets({
              protein: Math.round(today.protein_g || 0),
              fat: Math.round(today.fat_g || 0),
              carbs: Math.round(today.carbs_g || 0),
              total: Math.round((today.target_calories ?? today.calories) || 0)
            });
            // Also set calorie goal to target_calories if present
            const newGoals = {
              nutrition: { goals: { calories: Math.round((today.target_calories ?? today.calories) || 0) } }
            };
            setGoals(newGoals);
          } else {
            setMacroTargets(null);
          }
        }

        // Handle login streak
        if (streakData.status === 'fulfilled' && streakData.value && streakData.value.success) {
          setLoginStreak(streakData.value.data);
        }

        // Handle Garmin
        if (garminData.status === 'fulfilled' && garminData.value) {
          setGarminDaily(garminData.value);
        }

      } catch (err) {
        logger.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getBPStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', icon: <CheckIcon /> };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', icon: <WarningIcon /> };
    if (systolic >= 130 || diastolic >= 80) return { status: 'High', icon: <ErrorIcon /> };
    return { status: 'Unknown', icon: <InfoIcon /> };
  };

  const getWeightChangeIcon = (change) => {
    if (change > 0) return <TrendingIcon />;
    if (change < 0) return <TrendingDownIcon />;
    return <TrendingIcon />;
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        p: 2
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      pb: { xs: 8, sm: 2 }
    }}>
      {/* Header */}
      <DashboardHeader onQuickAction={handleQuickAction} />

      {error && (
        <Box sx={{ px: { xs: 3, sm: 4 }, mb: 3 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        <Grid container spacing={0}>
          {/* Calories Section */}
          {dashboardSettings.show_calories_today && todaySummary && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <MetricCard
                value={todaySummary.totals?.calories || 0}
                subtitle="calories today"
                icon={<ForkKnifeIcon />}
                color="success"
                progress={goals?.nutrition?.goals?.calories ?
                  Math.min(((todaySummary.totals?.calories || 0) / goals.nutrition.goals.calories) * 100, 100) : null}
                progressLabel={goals?.nutrition?.goals?.calories ? `Goal: ${goals.nutrition.goals.calories}` : null}
                progressValue={goals?.nutrition?.goals?.calories ?
                  Math.round(((todaySummary.totals?.calories || 0) / goals.nutrition.goals.calories) * 100) : null}
                timeout={300}
                onClick={() => navigate('/food-log')}
              />
            </Grid>
          )}

          {/* Weight Progress */}
          {dashboardSettings.show_current_weight && weightStats && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <MetricCard
                value={weightStats.weeklyChange ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getWeightChangeIcon(weightStats.weeklyChange)}
                    <Typography
                      variant="h4"
                      sx={{
                        ml: 0.5,
                        fontWeight: 600,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }}
                    >
                      {weightStats.weeklyChange > 0 ? '+' : ''}{weightStats.weeklyChange.toFixed(1)} lbs
                    </Typography>
                  </Box>
                ) : (
                  'No change'
                )}
                subtitle="this week"
                icon={<WeightIcon />}
                color="info"
                timeout={400}
                onClick={() => navigate('/weight')}
              >
                {weightStats.totalChange && (
                  <Box sx={{
                    p: 2,
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 2,
                    mt: 2,
                    border: `1px solid ${theme.palette.grey[200]}`
                  }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Overall change
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
                      {weightStats.totalChange > 0 ? '+' : ''}{weightStats.totalChange.toFixed(1)} lbs
                    </Typography>
                  </Box>
                )}
              </MetricCard>
            </Grid>
          )}

          {/* Blood Pressure */}
          {dashboardSettings.show_blood_pressure && latestBP && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <MetricCard
                value={`${latestBP.systolic}/${latestBP.diastolic}`}
                subtitle={getBPStatus(latestBP.systolic, latestBP.diastolic).status}
                icon={<BPIcon />}
                color="error"
                timeout={500}
                onClick={() => navigate('/blood-pressure')}
              >
                {weeklyBP && (
                  <Box sx={{
                    p: 2,
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 2,
                    mt: 2,
                    border: `1px solid ${theme.palette.grey[200]}`
                  }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Weekly average: {weeklyBP.systolic}/{weeklyBP.diastolic}
                    </Typography>
                  </Box>
                )}
              </MetricCard>
            </Grid>
          )}

          {/* Login Streak */}
          {dashboardSettings.show_login_streak && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <MetricCard
                value={`${loginStreak.current} days`}
                subtitle="current streak"
                icon={<StreakIcon />}
                color="warning"
                timeout={600}
                onClick={() => navigate('/food-log')}
              >
                <Box sx={{
                  p: 2,
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2,
                  mt: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Longest streak
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
                    {loginStreak.longest} days
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>
          )}

          {/* Nutrition Summary */}
          {dashboardSettings.show_nutrition_today && todaySummary && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <NutritionSummary
                summary={{
                  calories: todaySummary.totals?.calories || 0,
                  protein: todaySummary.totals?.protein_grams || 0,
                  carbs: todaySummary.totals?.carbs_grams || 0,
                  fat: todaySummary.totals?.fat_grams || 0,
                  calorieGoal: macroTargets?.total || goals?.nutrition?.goals?.calories || 0,
                  proteinGoal: macroTargets?.protein || 0,
                  carbsGoal: macroTargets?.carbs || 0,
                  fatGoal: macroTargets?.fat || 0
                }}
                showGoals
              />
            </Grid>
          )}

          {/* Garmin Highlights in a unified card */}
          {dashboardSettings.show_garmin_summary && (garminDaily || garminDailyHook) && (
            <Grid xs={12} sx={{ width: '100%', mb: 2 }}>
              <GarminSummaryCard
                steps={(garminDaily || garminDailyHook).steps}
                activeCalories={(garminDaily || garminDailyHook).activeCalories}
                sleepMinutes={(garminDaily || garminDailyHook).sleepMinutes}
                restingHR={(garminDaily || garminDailyHook).restingHR}
                fetchedAt={(garminDaily || garminDailyHook).fetchedAt}
                lastSyncAt={(garminDaily || garminDailyHook).lastSyncAt}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;