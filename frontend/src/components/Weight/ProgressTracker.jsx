import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ProgressTracker = ({
  startValue,
  currentValue,
  targetValue,
  startDate,
  goalDate,
  unit = 'lbs',
  title = 'Progress'
}) => {
    const calculateProgress = () => {
    if (!startValue || !targetValue || !currentValue) return 0;

    const totalChange = Math.abs(targetValue - startValue);
    const currentChange = Math.abs(currentValue - startValue);

    if (totalChange === 0) return 0;
    return Math.min((currentChange / totalChange) * 100, 100);
  };

  // Don't render if we don't have the required values
  if (!startValue || !targetValue || !currentValue) {
    return null;
  }

  const calculateTimeProgress = () => {
    if (!startDate || !goalDate) return { percentage: 0, status: 'no-deadline' };

    const start = new Date(startDate);
    const goal = new Date(goalDate);
    const current = new Date();

    const totalDays = (goal - start) / (1000 * 60 * 60 * 24);
    const elapsedDays = (current - start) / (1000 * 60 * 60 * 24);
    const percentage = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

    let status = 'on-track';
    if (elapsedDays > totalDays) {
      status = 'behind';
    } else if (percentage < 50 && elapsedDays > totalDays * 0.5) {
      status = 'ahead';
    }

    return { percentage, status };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead': return 'success';
      case 'behind': return 'error';
      case 'on-track': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ahead': return <CheckCircleIcon />;
      case 'behind': return <WarningIcon />;
      case 'on-track': return <ScheduleIcon />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ahead': return 'Ahead of Schedule';
      case 'behind': return 'Behind Schedule';
      case 'on-track': return 'On Track';
      default: return 'No Deadline';
    }
  };

  const progress = calculateProgress();
  const timeProgress = calculateTimeProgress();
  const totalChange = currentValue - startValue;
  const isWeightLoss = targetValue < startValue;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          {/* Progress Values */}
          <Grid xs={6} sm={3}>
            <Box textAlign="center" sx={{ width: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#6098CC' }}>
                {startValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start
              </Typography>
            </Box>
          </Grid>

          <Grid xs={6} sm={3}>
            <Box textAlign="center" sx={{ width: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {currentValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current
              </Typography>
            </Box>
          </Grid>

          <Grid xs={6} sm={3}>
            <Box textAlign="center" sx={{ width: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#6098CC' }}>
                {targetValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Goal
              </Typography>
            </Box>
          </Grid>

          <Grid xs={6} sm={3}>
            <Box textAlign="center" sx={{ width: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {progress.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress to Goal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Total Change */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {totalChange > 0 ? (
            <TrendingUpIcon color="error" sx={{ mr: 1 }} />
          ) : (
            <TrendingDownIcon color="success" sx={{ mr: 1 }} />
          )}
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Total {isWeightLoss ? 'Lost' : 'Gained'}: {Math.abs(totalChange).toFixed(1)} {unit}
          </Typography>
        </Box>

        {/* Timeline Status */}
        {goalDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(timeProgress.status)}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {getStatusText(timeProgress.status)}
              </Typography>
            </Box>
            <Chip
              label={`${timeProgress.percentage.toFixed(1)}% time elapsed`}
              color={getStatusColor(timeProgress.status)}
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;