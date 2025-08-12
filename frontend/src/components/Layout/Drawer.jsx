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
  LocalDining as MyFoodsIcon,
  RestaurantMenu as MyMealsIcon,
  MedicalServices as MedicationIcon,
  Flag as GoalsIcon,
  Calculate as CalorieIcon,
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
      text: 'Medications',
      icon: <MedicationIcon />,
      path: '/medications',
      description: 'Track meds & supplements'
    },
    {
      text: 'Calorie Goal Wizard',
      icon: <CalorieIcon />,
      path: '/calorie-wizard',
      description: 'Set calorie goals and create nutrition plans'
    },
    {
      text: 'My Foods',
      icon: <MyFoodsIcon />,
      path: '/my-foods',
      description: 'Manage your saved foods'
    },
    {
      text: 'My Meals',
      icon: <MyMealsIcon />,
      path: '/my-meals',
      description: 'Manage your saved meals'
    },
    {
      text: 'Food Search',
      icon: <FoodSearchIcon />,
      path: '/food-search',
      description: 'Search and manage food database'
    },
    {
      text: 'Profile & Settings',
      icon: <ProfileIcon />,
      path: '/profile',
      description: 'Manage your account and preferences'
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
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: '#666',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#f44336',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default AppDrawer;