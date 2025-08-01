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
import { weightService } from '../services/weightService.js';
import { bpService } from '../services/bpService.js';
import { goalsService } from '../services/goalsService.js';
import { streakService } from '../services/streakService.js';
import {
  MetricCard,
  QuickActionCard,
  DashboardHeader,
  NutritionSummaryCard
} from '../components/Dashboard';

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
        if (streakData.status === 'fulfilled' && streakData.value && streakData.value.success) {
          setLoginStreak(streakData.value.data);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
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
      <DashboardHeader />

      {error && (
        <Box sx={{ px: { xs: 3, sm: 4 }, mb: 3 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ px: { xs: 3, sm: 4 }, mb: 4 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid xs={4}>
            <QuickActionCard
              title="Log Food"
              icon={<FoodIcon />}
              color="success"
              onClick={() => handleQuickAction('food')}
            />
          </Grid>
          <Grid xs={4}>
            <QuickActionCard
              title="Log Weight"
              icon={<WeightIcon />}
              color="info"
              onClick={() => handleQuickAction('weight')}
            />
          </Grid>
          <Grid xs={4}>
            <QuickActionCard
              title="Log BP"
              icon={<BPIcon />}
              color="error"
              onClick={() => handleQuickAction('bp')}
            />
          </Grid>
        </Grid>
      </Box>

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
              <NutritionSummaryCard
                protein={todaySummary.totals?.protein_grams || 0}
                carbs={todaySummary.totals?.carbs_grams || 0}
                fat={todaySummary.totals?.fat_grams || 0}
                timeout={700}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;