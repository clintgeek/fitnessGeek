import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AIGoalPlanner from '../components/FitnessGoals/AIGoalPlanner.jsx';

const AITest = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AIGoalPlanner />
    </Box>
  );
};

export default AITest;
