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
  Tab,
  InputAdornment,
  Grid,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as FoodIcon,
  SmartToy as AIIcon,
  QrCodeScanner as BarcodeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import FoodSearch from '../FoodSearch/FoodSearch.jsx';
import { fitnessGeekService } from '../../services/fitnessGeekService.js';
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

  // Custom food state
  const [customFood, setCustomFood] = useState({
    name: '',
    brand: '',
    barcode: '',
    serving: { size: 100, unit: 'g' },
    nutrition: {
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0,
      fiber_grams: 0,
      sugar_grams: 0,
      sodium_mg: 0
    }
  });
  const [customServings, setCustomServings] = useState(1);

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

  const setNutritionField = (field, value) => {
    const num = parseFloat(value);
    setNutrition((prev) => ({
      ...prev,
      [field]: Number.isFinite(num) ? num : 0
    }));
  };

  const setCustomField = (field, value) => {
    setCustomFood((prev) => ({ ...prev, [field]: value }));
  };

  const setCustomNutritionField = (field, value) => {
    const num = parseFloat(value);
    setCustomFood((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: Number.isFinite(num) ? num : 0
      }
    }));
  };

  const setCustomServingField = (field, value) => {
    const numMaybe = parseFloat(value);
    setCustomFood((prev) => ({
      ...prev,
      serving: {
        ...prev.serving,
        [field]: field === 'size' ? (Number.isFinite(numMaybe) ? numMaybe : 0) : value
      }
    }));
  };

  const handleCreateCustomAndAdd = async () => {
    try {
      if (!customFood.name || (customFood.nutrition.calories_per_serving || 0) <= 0) return;
      const payload = {
        name: customFood.name.trim(),
        brand: customFood.brand.trim() || undefined,
        barcode: customFood.barcode.trim() || undefined,
        nutrition: customFood.nutrition,
        serving: customFood.serving,
        source: 'custom'
      };
      const resp = await fitnessGeekService.createCustomFood(payload);
      const created = resp?.data || resp;
      if (created) {
        onFoodSelect({
          ...(created.data || created),
          nutrition: customFood.nutrition,
          servings: customServings
        });
      }
    } catch (e) {
      console.error('Failed to create custom food', e);
    }
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

  // Note: Do not auto-open scanner on dialog open; launch only on explicit user click

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
                onClick={(e) => {
                  // Only launch scanner when the tab itself is clicked
                  handleBarcodeTabClick();
                }}
              />
              <Tab
                label="Search"
                icon={<FoodIcon />}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                label="Custom"
                icon={<EditIcon />}
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
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Calories"
                        type="number"
                        size="small"
                        value={nutrition.calories_per_serving}
                        onChange={(e) => setNutritionField('calories_per_serving', e.target.value)}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Protein (g)"
                        type="number"
                        size="small"
                        value={nutrition.protein_grams}
                        onChange={(e) => setNutritionField('protein_grams', e.target.value)}
                        sx={{ width: 140 }}
                      />
                      <TextField
                        label="Carbs (g)"
                        type="number"
                        size="small"
                        value={nutrition.carbs_grams}
                        onChange={(e) => setNutritionField('carbs_grams', e.target.value)}
                        sx={{ width: 130 }}
                      />
                      <TextField
                        label="Fat (g)"
                        type="number"
                        size="small"
                        value={nutrition.fat_grams}
                        onChange={(e) => setNutritionField('fat_grams', e.target.value)}
                        sx={{ width: 120 }}
                      />
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

          {activeTab === 3 && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Food Name"
                    value={customFood.name}
                    onChange={(e) => setCustomField('name', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Brand (optional)"
                    value={customFood.brand}
                    onChange={(e) => setCustomField('brand', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Barcode (optional)"
                    value={customFood.barcode}
                    onChange={(e) => setCustomField('barcode', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Serving Size"
                    type="number"
                    value={customFood.serving.size}
                    onChange={(e) => setCustomServingField('size', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Unit"
                    select
                    value={customFood.serving.unit}
                    onChange={(e) => setCustomServingField('unit', e.target.value)}
                    fullWidth
                  >
                    {['g','ml','oz','cup','tbsp','tsp','piece'].map((u) => (
                      <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Nutrition Grid */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Calories"
                    type="number"
                    value={customFood.nutrition.calories_per_serving}
                    onChange={(e) => setCustomNutritionField('calories_per_serving', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">kcal</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Protein"
                    type="number"
                    value={customFood.nutrition.protein_grams}
                    onChange={(e) => setCustomNutritionField('protein_grams', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Carbs"
                    type="number"
                    value={customFood.nutrition.carbs_grams}
                    onChange={(e) => setCustomNutritionField('carbs_grams', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Fat"
                    type="number"
                    value={customFood.nutrition.fat_grams}
                    onChange={(e) => setCustomNutritionField('fat_grams', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Fiber"
                    type="number"
                    value={customFood.nutrition.fiber_grams}
                    onChange={(e) => setCustomNutritionField('fiber_grams', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Sugar"
                    type="number"
                    value={customFood.nutrition.sugar_grams}
                    onChange={(e) => setCustomNutritionField('sugar_grams', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Sodium"
                    type="number"
                    value={customFood.nutrition.sodium_mg}
                    onChange={(e) => setCustomNutritionField('sodium_mg', e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">mg</InputAdornment> }}
                  />
                </Grid>

                {/* Servings picker and preview */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Servings: {customServings}
                    </Typography>
                    <Slider
                      value={customServings}
                      onChange={(e, v) => setCustomServings(v)}
                      min={0.25}
                      max={10}
                      step={0.25}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCustomAndAdd}
                  disabled={!customFood.name || (customFood.nutrition.calories_per_serving || 0) <= 0}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                >
                  Add Food
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 0 && (
            <NaturalLanguageInput
              onFoodsParsed={handleAIFoodsParsed}
              onError={(error) => console.error('AI Error:', error)}
            />
          )}

          {activeTab === 1 && (
            <>
              {!selectedFood ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    onClick={() => onShowBarcodeScanner(true)}
                    sx={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
                    aria-label="Open barcode scanner"
                    role="button"
                  >
                    <BarcodeIcon sx={{ fontSize: 64, color: '#6098CC', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }} onClick={() => onShowBarcodeScanner(true)}>
                      Barcode Scanner
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                    Click the icon or title to open the scanner. You can use the floating keyboard icon in the scanner to enter a barcode manually.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {/* Selected Food Display (same as Search) */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedFood.name}
                    </Typography>
                    {selectedFood.brand && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        {selectedFood.brand}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Calories"
                        type="number"
                        size="small"
                        value={nutrition.calories_per_serving}
                        onChange={(e) => setNutritionField('calories_per_serving', e.target.value)}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Protein (g)"
                        type="number"
                        size="small"
                        value={nutrition.protein_grams}
                        onChange={(e) => setNutritionField('protein_grams', e.target.value)}
                        sx={{ width: 140 }}
                      />
                      <TextField
                        label="Carbs (g)"
                        type="number"
                        size="small"
                        value={nutrition.carbs_grams}
                        onChange={(e) => setNutritionField('carbs_grams', e.target.value)}
                        sx={{ width: 130 }}
                      />
                      <TextField
                        label="Fat (g)"
                        type="number"
                        size="small"
                        value={nutrition.fat_grams}
                        onChange={(e) => setNutritionField('fat_grams', e.target.value)}
                        sx={{ width: 120 }}
                      />
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
                      marks={[{ value: 0.25, label: '0.25' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 5, label: '5' }, { value: 10, label: '10' }]}
                      sx={{ '& .MuiSlider-markLabel': { fontSize: '0.75rem' } }}
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
        </DialogContent>

        <DialogActions sx={{
          px: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch'
        }}>
          {(activeTab === 1 || activeTab === 2) && selectedFood && (
            <Button
              onClick={() => setSelectedFood(null)}
              variant="text"
              size="large"
              sx={{ color: '#666' }}
            >
              Clear Selection
            </Button>
          )}
          {(activeTab === 1 || activeTab === 2) && selectedFood && (
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