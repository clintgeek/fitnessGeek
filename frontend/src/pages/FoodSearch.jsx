import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { FoodSearch as FoodSearchComponent } from '../components/FoodSearch';
import { fitnessGeekService } from '../services/fitnessGeekService.js';

const FoodSearchPage = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const handleFoodSelect = async (food) => {
    try {
      // Add the food to today's log with the configured servings and nutrition
      const today = fitnessGeekService.formatDate(new Date());

      if (food.type === 'meal') {
        // Add meal to log
        await fitnessGeekService.addMealToLog(food._id, today, 'snack');
        setMessage(`Added "${food.name}" meal to today's log`);
      } else {
        // Add individual food to log with servings, notes, and modified nutrition
        const logData = {
          food_item: {
            name: food.name,
            brand: food.brand,
            calories_per_serving: food.nutrition?.calories_per_serving || 0,
            protein_grams: food.nutrition?.protein_grams || 0,
            carbs_grams: food.nutrition?.carbs_grams || 0,
            fat_grams: food.nutrition?.fat_grams || 0,
            serving_size: food.serving?.size || 100,
            serving_unit: food.serving?.unit || 'g',
            source: food.source || 'custom',
            source_id: food.source_id || `${food.source}-${food._id}`,
            barcode: food.barcode
          },
          log_date: today,
          meal_type: 'snack',
          servings: food.servings || 1,
          notes: food.notes || ''
        };

        await fitnessGeekService.addFoodToLog(logData);
        setMessage(`Added "${food.name}" (${food.servings || 1} serving${(food.servings || 1) !== 1 ? 's' : ''}) to today's log`);
      }

      setMessageType('success');
    } catch (error) {
      console.error('Error adding food to log:', error);
      setMessage('Failed to add food to log. Please try again.');
      setMessageType('error');
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Food Search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search and discover foods. Click to add to today's log.
        </Typography>
      </Box>

      {/* Food Search Component */}
      <FoodSearchComponent
        onFoodSelect={handleFoodSelect}
        placeholder="Search for foods..."
        showRecent={true}
        maxResults={25}
      />

      {/* Success/Error Messages */}
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseMessage}
          severity={messageType}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FoodSearchPage;