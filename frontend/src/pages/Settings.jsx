import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  DataUsage as DataIcon,
  Help as HelpIcon,
  Info as AboutIcon,
  Dashboard as DashboardIcon,
  MonitorWeight as WeightIcon,
  MonitorHeart as BPIcon,
  LocalDining as FoodIcon,
  TrendingUp as StreakIcon,
  Restaurant as NutritionIcon,
  FlashOn as QuickActionsIcon,
  Flag as GoalsIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { settingsService } from '../services/settingsService.js';
import DashboardOrderSettings from '../components/DashboardOrderSettings';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [garminUsername, setGarminUsername] = useState('');
  const [garminPassword, setGarminPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const loaded = response.data;
      // Initialize local Garmin creds (masking password from API)
      const g = (loaded.garmin || settingsService.getDefaultGarminSettings());
      setGarminUsername(g.username || '');
      setGarminPassword('');
      setSettings({
        ...loaded,
        garmin: {
          enabled: !!g.enabled,
          username: g.username || ''
          // omit password from state we display, managed via local garminPassword
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
      // Set default settings if loading fails
      const defaultSettings = {
        dashboard: settingsService.getDefaultDashboardSettings(),
        theme: 'light',
        notifications: { enabled: true, daily_reminder: true, goal_reminders: true },
        units: { weight: 'lbs', height: 'ft' },
        garmin: settingsService.getDefaultGarminSettings()
      };
      console.log('Settings - defaultSettings:', defaultSettings);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [setting]: value
      }
    }));
  };

  const handleDashboardOrderChange = (newOrder) => {
    setSettings(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        card_order: newOrder
      }
    }));
  };

  const handleNotificationSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: value
      }
    }));
  };

  const handleUnitSettingChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [type]: value
      }
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ...settings,
        garmin: {
          enabled: settings.garmin?.enabled || false,
          username: garminUsername || '',
          // only send password if provided
          ...(garminPassword ? { password: garminPassword } : {})
        }
      };
      await settingsService.updateSettings(payload);
      setSuccess('Settings saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Failed to load settings</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 800 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5, color: '#6098CC' }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize your FitnessGeek experience
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={saving}
          sx={{ backgroundColor: '#6098CC' }}
        >
          {saving ? <CircularProgress size={20} /> : 'Save Settings'}
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Dashboard Configuration */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <ListItemIcon>
            <DashboardIcon sx={{ color: '#6098CC' }} />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard Configuration"
            secondary="Choose which components to show on your dashboard"
          />
        </AccordionSummary>
        <AccordionDetails>
          <DashboardOrderSettings
            settings={settings.dashboard}
            onSettingsChange={handleDashboardSettingChange}
            onOrderChange={handleDashboardOrderChange}
          />
        </AccordionDetails>
      </Accordion>

      {/* Appearance */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ThemeIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Appearance
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={settings.theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              label="Theme"
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.enabled}
                onChange={(e) => handleNotificationSettingChange('enabled', e.target.checked)}
              />
            }
            label="Enable Notifications"
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.daily_reminder}
                onChange={(e) => handleNotificationSettingChange('daily_reminder', e.target.checked)}
                disabled={!settings.notifications.enabled}
              />
            }
            label="Daily Reminders"
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.goal_reminders}
                onChange={(e) => handleNotificationSettingChange('goal_reminders', e.target.checked)}
                disabled={!settings.notifications.enabled}
              />
            }
            label="Goal Reminders"
          />
        </CardContent>
      </Card>

      {/* Units */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LanguageIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Units
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Weight Units</InputLabel>
              <Select
                value={settings.units.weight}
                onChange={(e) => handleUnitSettingChange('weight', e.target.value)}
                label="Weight Units"
              >
                <MenuItem value="lbs">Pounds (lbs)</MenuItem>
                <MenuItem value="kg">Kilograms (kg)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Height Units</InputLabel>
              <Select
                value={settings.units.height}
                onChange={(e) => handleUnitSettingChange('height', e.target.value)}
                label="Height Units"
              >
                <MenuItem value="ft">Feet/Inches (ft)</MenuItem>
                <MenuItem value="cm">Centimeters (cm)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Garmin Integration */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BPIcon sx={{ mr: 1, color: '#6098CC' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Garmin Integration
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={!!settings.garmin?.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  garmin: {
                    ...(prev.garmin || {}),
                    enabled: e.target.checked
                  }
                }))}
              />
            }
            label="Enable Garmin"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Garmin Username</InputLabel>
              <input
                type="text"
                value={garminUsername}
                onChange={(e) => setGarminUsername(e.target.value)}
                placeholder="your@email.com"
                style={{ padding: '14px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.23)' }}
                disabled={!settings.garmin?.enabled}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel shrink>Garmin Password</InputLabel>
              <input
                type="password"
                value={garminPassword}
                onChange={(e) => setGarminPassword(e.target.value)}
                placeholder={settings.garmin?.enabled ? 'Enter to update (leave blank to keep)' : 'Disabled'}
                style={{ padding: '14px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.23)' }}
                disabled={!settings.garmin?.enabled}
              />
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Password is never shown. Leave blank to keep the current password.
          </Typography>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItemButton>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Privacy & Security"
                secondary="Manage your data and privacy"
              />
            </ListItemButton>
            <Divider />
            <ListItemButton>
              <ListItemIcon>
                <DataIcon />
              </ListItemIcon>
              <ListItemText
                primary="Data & Storage"
                secondary="Manage your data usage"
              />
            </ListItemButton>
          </List>
        </CardContent>
      </Card>

      {/* Support */}
      <Card sx={{ width: '100%', mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItemButton>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText
                primary="Help & Support"
                secondary="Get help and contact support"
              />
            </ListItemButton>
            <Divider />
            <ListItemButton>
              <ListItemIcon>
                <AboutIcon />
              </ListItemIcon>
              <ListItemText
                primary="About FitnessGeek"
                secondary="Version 1.0.0"
              />
            </ListItemButton>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;