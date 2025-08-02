import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  TextField,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as FoodIcon
} from '@mui/icons-material';
import FoodSearch from '../FoodSearch/FoodSearch.jsx';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner.jsx';

const AddFoodDialog = ({
  open,
  onClose,
  onFoodSelect,
  mealType,
  showBarcodeScanner,
  onShowBarcodeScanner
}) => {
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [nutrition, setNutrition] = useState({
    calories_per_serving: 0,
    protein_grams: 0,
    carbs_grams: 0,
    fat_grams: 0
  });

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setServings(1);
    setNutrition(food.nutrition || {
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0
    });
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const foodWithServings = {
      ...selectedFood,
      servings: servings,
      nutrition: nutrition
    };
    onFoodSelect(foodWithServings);
    setSelectedFood(null);
    setServings(1);
    setNutrition({
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0
    });
  };

  const handleClose = () => {
    setSelectedFood(null);
    setServings(1);
    setNutrition({
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0
    });
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
            width: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          px: { xs: 3, sm: 4 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
              <FoodIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Food to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 3, sm: 4 } }}>
          {!selectedFood ? (
            <FoodSearch
              onFoodSelect={handleFoodSelect}
              placeholder="Search for foods..."
              showRecent={true}
              maxResults={25}
              disableDialog={true}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Selected Food Display */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedFood.name}
                </Typography>
                {selectedFood.brand && (
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    {selectedFood.brand}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {Math.round(nutrition.calories_per_serving)} cal
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    P: {nutrition.protein_grams}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    C: {nutrition.carbs_grams}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    F: {nutrition.fat_grams}g
                  </Typography>
                </Box>
              </Box>

              {/* Servings Slider */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  Servings: {servings}
                </Typography>
                <Slider
                  value={servings}
                  onChange={(e, newValue) => setServings(newValue)}
                  min={0.25}
                  max={10}
                  step={0.25}
                  marks={[
                    { value: 0.25, label: '0.25' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' }
                  ]}
                  sx={{
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Box>

              {/* Total Preview */}
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Total ({servings} serving{servings !== 1 ? 's' : ''}):
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    {Math.round(nutrition.calories_per_serving * servings)} cal
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    P: {Math.round(nutrition.protein_grams * servings * 10) / 10}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    C: {Math.round(nutrition.carbs_grams * servings * 10) / 10}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    F: {Math.round(nutrition.fat_grams * servings * 10) / 10}g
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch'
        }}>
          {!selectedFood && (
            <Button
              onClick={() => onShowBarcodeScanner(true)}
              variant="outlined"
              startIcon={<AddIcon />}
              size="large"
              sx={{
                borderColor: '#6098CC',
                color: '#6098CC',
                '&:hover': {
                  borderColor: '#4a7ba8',
                  backgroundColor: '#f0f8ff'
                },
                minHeight: { xs: '48px', sm: 'auto' }
              }}
            >
              Scan Barcode
            </Button>
          )}
          {selectedFood && (
            <Button
              onClick={() => setSelectedFood(null)}
              variant="text"
              size="large"
              sx={{ color: '#666' }}
            >
              Back to Search
            </Button>
          )}
          {selectedFood && (
            <Button
              onClick={handleAddFood}
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              sx={{
                bgcolor: '#4caf50',
                '&:hover': {
                  bgcolor: '#45a049'
                }
              }}
            >
              Add Food
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant="text"
            size="large"
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => onShowBarcodeScanner(false)}
        onBarcodeScanned={(food) => {
          handleFoodSelect(food);
          onShowBarcodeScanner(false);
        }}
      />
    </>
  );
};

export default AddFoodDialog;