import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  Restaurant as FoodIcon,
  MonitorWeight as WeightIcon,
  Flag as GoalsIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth.js';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - will be replaced with real API calls
  const mockData = {
    todayCalories: 1200,
    targetCalories: 2000,
    todayWeight: 180.5,
    weeklyChange: -0.5,
    goals: [
      { name: 'Lose 10 lbs', progress: 60, target: 'Dec 31, 2024', priority: 'high' },
      { name: 'Run 5K', progress: 30, target: 'Jan 15, 2025', priority: 'medium' }
    ]
  };

  const calorieProgress = (mockData.todayCalories / mockData.targetCalories) * 100;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#6098CC';
    }
  };

    return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Welcome back, {user?.username || 'User'}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's your fitness overview for today
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            backgroundColor: '#fafafa', // Light grey like BuJoGeek
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 28, height: 28 }}>
                  <FoodIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Calories Today
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                {mockData.todayCalories}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                of {mockData.targetCalories} target
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calorieProgress}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 28, height: 28 }}>
                  <WeightIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Current Weight
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                {mockData.todayWeight} lbs
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingIcon
                  sx={{
                    color: mockData.weeklyChange < 0 ? 'success.main' : 'error.main',
                    mr: 0.5,
                    fontSize: 14
                  }}
                />
                <Typography
                  variant="caption"
                  color={mockData.weeklyChange < 0 ? 'success.main' : 'error.main'}
                >
                  {mockData.weeklyChange > 0 ? '+' : ''}{mockData.weeklyChange} lbs this week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 28, height: 28 }}>
                  <GoalsIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Active Goals
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {mockData.goals.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                goals in progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1, width: 28, height: 28 }}>
                  <TrendingIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Streak
                </Typography>
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                7 days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                logging streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Quick Actions, Today's Summary, and Goals */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Log Food
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<WeightIcon />}
                  size="small"
                >
                  Log Weight
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GoalsIcon />}
                  size="small"
                >
                  Set Goal
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Today's Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Protein</Typography>
                  <Typography variant="body2" fontWeight={600}>85g / 120g</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Carbs</Typography>
                  <Typography variant="body2" fontWeight={600}>150g / 200g</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Fat</Typography>
                  <Typography variant="body2" fontWeight={600}>45g / 65g</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Goal Progress
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {mockData.goals.map((goal, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      backgroundColor: '#ffffff',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {goal.name}
                      </Typography>
                      <Chip
                        label={`${goal.progress}%`}
                        size="small"
                        color="primary"
                        sx={{ fontSize: '0.625rem' }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{ height: 3, borderRadius: 1.5, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Target: {goal.target}
                    </Typography>
                    {/* Priority indicator bar */}
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: getPriorityColor(goal.priority),
                        borderTopRightRadius: 2,
                        borderBottomRightRadius: 2,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;