import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Person as ProfileIcon,
  Restaurant as FoodSearchIcon,
  Restaurant as FoodIcon,
  Flag as GoalsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const AppDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems = [
    {
      text: 'Goals & Targets',
      icon: <GoalsIcon />,
      path: '/goals',
      description: 'Set nutrition and weight goals'
    },
    {
      text: 'Profile & Settings',
      icon: <ProfileIcon />,
      path: '/profile',
      description: 'Manage your account and preferences'
    },
    {
      text: 'Food Search',
      icon: <FoodSearchIcon />,
      path: '/food-search',
      description: 'Search and manage food database'
    }
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <FoodIcon sx={{ mr: 1, color: '#6098CC' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#6098CC', mr: 0.5 }}>
          FitnessGeek
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#6098CC' }}>
          &lt;/&gt;
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#6098CC', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#333333',
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: '#757575',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout Section */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#ffebee',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              secondary="Sign out of your account"
              primaryTypographyProps={{
                fontWeight: 500,
                color: '#d32f2f',
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: '#757575',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default AppDrawer;