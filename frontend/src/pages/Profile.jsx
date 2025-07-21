import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  MonitorWeight as WeightIcon,
  MonitorHeart as BPIcon,
  LocalDining as FoodIcon,
  TrendingUp as StreakIcon,
  Restaurant as NutritionIcon,
  FlashOn as QuickActionsIcon,
  Flag as GoalsIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth.js';
import { settingsService } from '../services/settingsService.js';
import DashboardOrderSettings from '../components/DashboardOrderSettings.jsx';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false
  });
  const [dashboardSettings, setDashboardSettings] = useState({
    show_current_weight: true,
    show_blood_pressure: true,
    show_calories_today: true,
    show_login_streak: true,
    show_nutrition_today: true,
    show_quick_actions: true,
    show_weight_goal: true,
    show_nutrition_goal: true,
    card_order: [
      'current_weight',
      'blood_pressure',
      'calories_today',
      'login_streak',
      'nutrition_today',
      'quick_actions',
      'weight_goal',
      'nutrition_goal'
    ]
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || user?.name || '',
    email: user?.email || ''
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await settingsService.getSettings();
      if (response.data && response.data.dashboard) {
        setDashboardSettings(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleDashboardSettingChange = (setting, value) => {
    setDashboardSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleDashboardOrderChange = (newOrder) => {
    setDashboardSettings(prev => ({
      ...prev,
      card_order: newOrder
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const handleSaveSettings = async () => {
    setLoadingSettings(true);
    try {
      // Save dashboard settings
      await settingsService.updateDashboardSettings(dashboardSettings);
      setSuccess('Dashboard settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
      setError('Failed to save dashboard settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Update profile in backend
      setSuccess('Profile updated successfully!');
      setShowEditDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Profile & Settings
      </Typography>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {(user?.username || user?.name)?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user?.username || user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user?.email || 'user@example.com'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditData({
                    username: user?.username || user?.name || '',
                    email: user?.email || ''
                  });
                  setShowEditDialog(true);
                }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings */}
        <Grid xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications about your nutrition goals"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Updates"
                    secondary="Receive weekly nutrition reports via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.emailUpdates}
                      onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Use dark theme for the application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  sx={{ mr: 1 }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Dashboard Configuration */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose which components to show on your dashboard and drag to reorder them
              </Typography>

              <DashboardOrderSettings
                settings={dashboardSettings}
                onSettingsChange={handleDashboardSettingChange}
                onOrderChange={handleDashboardOrderChange}
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={loadingSettings}
                  sx={{ mr: 1 }}
                >
                  {loadingSettings ? 'Saving...' : 'Save Dashboard Settings'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Account
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Password"
                    secondary="Update your account password"
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Information"
                    secondary="View and manage your account details"
                  />
                </ListItem>

                <Divider />

                <ListItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    secondary="Sign out of your account"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={editData.username}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;