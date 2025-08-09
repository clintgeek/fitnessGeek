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
  Slider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as FoodIcon,
  SmartToy as AIIcon,
  QrCodeScanner as BarcodeIcon
} from '@mui/icons-material';
import FoodSearch from '../FoodSearch/FoodSearch.jsx';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner.jsx';
import NaturalLanguageInput from './NaturalLanguageInput.jsx';

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
  // Default to Auto
  const [activeTab, setActiveTab] = useState(1);

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

  const handleAIFoodsParsed = (foods) => {
    // Add each parsed food to the log
    foods.forEach(food => {
      const foodWithServings = {
        ...food,
        servings: food.servings,
        nutrition: food.nutrition
      };
      onFoodSelect(foodWithServings);
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
    setActiveTab(0);
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedFood(null);
    setServings(1);
    setNutrition({
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0
    });
  };

  const handleBarcodeTabClick = () => {
    onShowBarcodeScanner(true);
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
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 48 }}>
              <Tab
                label="Auto"
                icon={<AIIcon />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                label="Barcode"
                icon={<BarcodeIcon />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
                onClick={handleBarcodeTabClick}
              />
              <Tab
                label="Search"
                icon={<FoodIcon />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 2 && (
            <>
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
            </>
          )}

          {activeTab === 0 && (
            <NaturalLanguageInput
              onFoodsParsed={handleAIFoodsParsed}
              onError={(error) => console.error('AI Error:', error)}
            />
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <BarcodeIcon sx={{ fontSize: 64, color: '#6098CC', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Barcode Scanner
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                Click the Barcode tab to open the scanner and scan food items.
              </Typography>
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
          {activeTab === 0 && selectedFood && (
            <Button
              onClick={() => setSelectedFood(null)}
              variant="text"
              size="large"
              sx={{ color: '#666' }}
            >
              Back to Search
            </Button>
          )}
          {activeTab === 0 && selectedFood && (
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