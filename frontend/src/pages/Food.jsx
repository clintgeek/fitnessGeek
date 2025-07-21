import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { FoodSearch } from '../components/FoodSearch';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { getTodayLocal } from '../utils/dateUtils.js';

const Food = () => {
  const [selectedFood, setSelectedFood] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [servings, setServings] = useState('1');
  const [mealType, setMealType] = useState('snack');
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setShowAddDialog(true);
  };

  const handleFoodAdd = (food) => {
    // Quick add functionality - add with default settings
    addFoodToLog(food, 1, 'snack');
  };

  const addFoodToLog = async (food, servingsCount, meal) => {
    try {
      await fitnessGeekService.addFoodToLog({
        food_item: food,
        servings: servingsCount,
        meal_type: meal,
        log_date: getTodayLocal(),
        nutrition: food.nutrition || food.original_nutrition || {}
      });

      setSuccessMessage(`${food.name} added to your log!`);
      setShowAddDialog(false);
      setSelectedFood(null);
      setServings('1');
      setMealType('snack');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error adding food to log:', error);
      setSuccessMessage('Error adding food to log. Please try again.');
    }
  };

  const handleAddToLog = () => {
    if (selectedFood) {
      addFoodToLog(selectedFood, parseFloat(servings) || 1, mealType);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Food Search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search and add foods to your daily log
        </Typography>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert
          severity={successMessage.includes('Error') ? 'error' : 'success'}
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Food Search Component */}
      <FoodSearch
        onFoodSelect={handleFoodSelect}
        onFoodAdd={handleFoodAdd}
        placeholder="Search for foods..."
        showRecent={true}
        maxResults={25}
      />

      {/* Add to Log Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add {selectedFood?.name} to Your Log
        </DialogTitle>
        <DialogContent>
          {selectedFood && (
            <Box sx={{ mt: 1 }}>
              {/* Food Info */}
              <Card sx={{ backgroundColor: '#fafafa', border: '1px solid #e0e0e0', mb: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {selectedFood.name}
                  </Typography>
                  {selectedFood.brand && (
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {selectedFood.brand}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" fontWeight={600}>
                      {Math.round(selectedFood.nutrition.calories_per_serving)} cal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P: {selectedFood.nutrition.protein_grams}g
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      C: {selectedFood.nutrition.carbs_grams}g
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      F: {selectedFood.nutrition.fat_grams}g
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Servings Input */}
              <TextField
                fullWidth
                label="Servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                inputProps={{ min: 0.1, step: 0.1 }}
                sx={{ mb: 2 }}
              />

              {/* Meal Type Select */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={mealType}
                  label="Meal Type"
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <MenuItem value="breakfast">Breakfast</MenuItem>
                  <MenuItem value="lunch">Lunch</MenuItem>
                  <MenuItem value="dinner">Dinner</MenuItem>
                  <MenuItem value="snack">Snack</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToLog}
            variant="contained"
            disabled={!selectedFood || !servings}
          >
            Add to Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Food;