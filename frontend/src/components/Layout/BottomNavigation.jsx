import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  Book as FoodLogIcon,
  MonitorWeight as WeightIcon,
  MonitorHeart as BPIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'home';
    if (path === '/food-log') return 'food-log';
    if (path === '/weight') return 'weight';
    if (path === '/blood-pressure') return 'blood-pressure';
    return 'home';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'food-log':
              navigate('/food-log');
              break;
            case 'weight':
              navigate('/weight');
              break;
            case 'blood-pressure':
              navigate('/blood-pressure');
              break;
            default:
              navigate('/dashboard');
          }
        }}
        sx={{
          backgroundColor: '#f5f5f5',
          '& .MuiBottomNavigationAction-root': {
            color: '#757575',
            '&.Mui-selected': {
              color: '#6098CC',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Log"
          value="food-log"
          icon={<FoodLogIcon />}
        />
        <BottomNavigationAction
          label="Weight"
          value="weight"
          icon={<WeightIcon />}
        />
        <BottomNavigationAction
          label="BP"
          value="blood-pressure"
          icon={<BPIcon />}
        />
      </BottomNavigation>
    </Box>
  );
};

export default BottomNav;