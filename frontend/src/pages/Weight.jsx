import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
// TODO: Import fitnessGeekService when weight functionality is implemented

const Weight = () => {
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalData, setGoalData] = useState({
    targetWeight: '',
    startWeight: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: ''
  });

  // Load weight data on mount
  useEffect(() => {
    loadWeightData();
  }, []);

  const loadWeightData = async () => {
    setLoading(true);
    try {
      // TODO: Implement weight functionality in fitnessGeekService
      // For now, use mock data
      const mockLogs = [
        { id: 1, weight_value: 180.5, log_date: '2025-01-15' },
        { id: 2, weight_value: 180.2, log_date: '2025-01-16' },
        { id: 3, weight_value: 179.8, log_date: '2025-01-17' }
      ];
      const mockGoal = {
        id: 1,
        target_weight: 175,
        start_weight: 185,
        start_date: '2025-01-01',
        target_date: '2025-03-01'
      };

      setWeightLogs(mockLogs);
      setWeightGoal(mockGoal);
    } catch (error) {
      setError('Failed to load weight data');
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || !newWeightDate) return;

    try {
      // TODO: Implement weight functionality in fitnessGeekService
      // For now, just update local state
      const newLog = {
        id: Date.now(),
        weight_value: parseFloat(newWeight),
        log_date: newWeightDate
      };

      setWeightLogs(prev => [...prev, newLog]);
      setShowAddDialog(false);
      setNewWeight('');
      setNewWeightDate(new Date().toISOString().split('T')[0]);
      setSuccess('Weight logged successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add weight log');
      console.error('Error adding weight log:', error);
    }
  };

  const handleDeleteWeight = async (logId) => {
    try {
      // TODO: Implement weight functionality in fitnessGeekService
      // For now, just update local state
      setWeightLogs(prev => prev.filter(log => log.id !== logId));
      setSuccess('Weight log deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete weight log');
      console.error('Error deleting weight log:', error);
    }
  };

  const handleSaveGoal = async () => {
    if (!goalData.targetWeight || !goalData.startWeight || !goalData.startDate) return;

    try {
      // TODO: Implement weight functionality in fitnessGeekService
      // For now, just update local state
      const newGoal = {
        id: weightGoal ? weightGoal.id : Date.now(),
        target_weight: parseFloat(goalData.targetWeight),
        start_weight: parseFloat(goalData.startWeight),
        start_date: goalData.startDate,
        target_date: goalData.targetDate
      };

      setWeightGoal(newGoal);
      setShowGoalDialog(false);
      setSuccess('Weight goal saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save weight goal');
      console.error('Error saving weight goal:', error);
    }
  };

  const calculateStats = () => {
    if (weightLogs.length === 0) return null;

    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
    const latest = sortedLogs[sortedLogs.length - 1];
    const earliest = sortedLogs[0];
    const totalChange = latest.weight_value - earliest.weight_value;
    const averageWeight = weightLogs.reduce((sum, log) => sum + log.weight_value, 0) / weightLogs.length;

    return {
      current: latest.weight_value,
      change: totalChange,
      average: averageWeight,
      totalLogs: weightLogs.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Weight Tracking
      </Typography>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Weight Stats */}
        {stats && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Weight
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {stats.current} lbs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stats.change > 0 ? (
                    <TrendingUpIcon color="error" sx={{ mr: 1 }} />
                  ) : (
                    <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body2" color={stats.change > 0 ? 'error' : 'success'}>
                    {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} lbs total change
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average: {stats.average.toFixed(1)} lbs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weight Goal */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weight Goal
              </Typography>
              {weightGoal ? (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {weightGoal.target_weight} lbs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Started: {new Date(weightGoal.start_date).toLocaleDateString()}
                  </Typography>
                  {weightGoal.target_date && (
                    <Typography variant="body2" color="text.secondary">
                      Target: {new Date(weightGoal.target_date).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No goal set
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowGoalDialog(true)}
                sx={{ mt: 1 }}
              >
                {weightGoal ? 'Update Goal' : 'Set Goal'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDialog(true)}
                fullWidth
                sx={{ mb: 1 }}
              >
                Log Weight
              </Button>
              <Button
                variant="outlined"
                startIcon={<TimelineIcon />}
                fullWidth
              >
                View Chart
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Weight Logs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Weight Logs
              </Typography>
              {weightLogs.length > 0 ? (
                <List>
                  {weightLogs.slice(0, 10).map((log) => (
                    <ListItem key={log.id} divider>
                      <ListItemText
                        primary={`${log.weight_value} lbs`}
                        secondary={new Date(log.log_date).toLocaleDateString()}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteWeight(log.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No weight logs yet. Start tracking your weight!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Weight Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Weight</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Weight (lbs)"
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newWeightDate}
            onChange={(e) => setNewWeightDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWeight} variant="contained">Log Weight</Button>
        </DialogActions>
      </Dialog>

      {/* Weight Goal Dialog */}
      <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Weight Goal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Target Weight (lbs)"
            type="number"
            value={goalData.targetWeight}
            onChange={(e) => setGoalData({ ...goalData, targetWeight: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Starting Weight (lbs)"
            type="number"
            value={goalData.startWeight}
            onChange={(e) => setGoalData({ ...goalData, startWeight: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={goalData.startDate}
            onChange={(e) => setGoalData({ ...goalData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Target Date (Optional)"
            type="date"
            value={goalData.targetDate}
            onChange={(e) => setGoalData({ ...goalData, targetDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGoalDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGoal} variant="contained">Save Goal</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Weight;