import React from 'react';
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
  FormControlLabel
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  DataUsage as DataIcon,
  Help as HelpIcon,
  Info as AboutIcon
} from '@mui/icons-material';

const Settings = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 600 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your FitnessGeek experience
        </Typography>
      </Box>

      {/* Notifications */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Notifications"
                secondary="Get reminders and updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <ThemeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Switch to dark theme"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItemButton>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary="Language"
                secondary="English"
              />
            </ListItemButton>
            <Divider />
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
      <Card sx={{ mb: 2 }}>
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