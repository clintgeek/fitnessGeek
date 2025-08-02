import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCodeScanner as BarcodeIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { fitnessGeekService } from '../../services/fitnessGeekService';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner.jsx';

const getSourceName = (source) => {
  switch (source?.toLowerCase()) {
    case 'usda':
      return 'USDA';
    case 'nutritionix':
      return 'Nutritionix';
    case 'openfoodfacts':
      return 'Open Food Facts';
    case 'custom':
      return 'My Foods';
    case 'meal':
      return 'Saved Meal';
    default:
      return source || 'Unknown';
  }
};

const FoodSearch = ({
  onFoodSelect,
  placeholder = "Search for foods...",
  showRecent = true,
  maxResults = 25,
  autoSearch = true,
  disableDialog = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [nutrition, setNutrition] = useState({
    calories_per_serving: 0,
    protein_grams: 0,
    carbs_grams: 0,
    fat_grams: 0
  });

  // Debounced search effect
  useEffect(() => {
    if (!autoSearch || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchFoods();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, autoSearch]);

  // Load recent foods on mount
  useEffect(() => {
    if (showRecent) {
      loadRecentFoods();
    }
  }, [showRecent]);

  const searchFoods = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await fitnessGeekService.searchFoods(searchQuery, maxResults);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Error searching foods:', err);
      setError('Failed to search foods. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentFoods = async () => {
    try {
      const recent = await fitnessGeekService.getRecentLogs();
      if (recent && recent.length > 0) {
        // Get unique foods from recent logs
        const uniqueFoods = recent.reduce((acc, log) => {
          const food = log.food_item || log.food_item_id;
          if (food && !acc.find(f => f.id === food.id)) {
            acc.push(food);
          }
          return acc;
        }, []);
        setRecentFoods(uniqueFoods.slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading recent foods:', err);
    }
  };

  const handleFoodClick = (food) => {
    if (disableDialog) {
      // Auto-add food when clicked (for use in dialogs)
      const foodWithServings = {
        ...food,
        servings: 1,
        nutrition: food.nutrition || {
          calories_per_serving: 0,
          protein_grams: 0,
          carbs_grams: 0,
          fat_grams: 0
        }
      };
      onFoodSelect(foodWithServings);
    } else {
      // Open dialog to edit servings
      setSelectedFood(food);
      setServings(1);
      setNutrition(food.nutrition || {
        calories_per_serving: 0,
        protein_grams: 0,
        carbs_grams: 0,
        fat_grams: 0
      });
    }
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchFoods();
  };

  const renderFoodItem = (food) => {
    const sourceName = getSourceName(food.source);

    return (
      <ListItem
        key={food.id || food._id || `${food.name}-${food.brand}-${food.source}`}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #f0f0f0',
          '&:last-child': {
            borderBottom: 'none'
          },
          '&:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}
        onClick={() => handleFoodClick(food)}
      >
        <ListItemText
          primary={
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                mb: 0.5
              }}
            >
              {food.name}
            </Typography>
          }
          secondaryTypographyProps={{
            component: 'div'
          }}
          secondary={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {food.brand && (
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {food.brand}
                  </Typography>
                )}
                {food.brand && (
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    •
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {Math.round(food.nutrition.calories_per_serving)} cal
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {sourceName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  P: {food.nutrition.protein_grams}g
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  C: {food.nutrition.carbs_grams}g
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  F: {food.nutrition.fat_grams}g
                </Typography>
              </Box>
            </Box>
          }
        />
      </ListItem>
    );
  };

  return (
    <Box className={className}>
      {/* Search Input */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />,
            endAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                {loading && <CircularProgress size={20} />}
                <IconButton
                  onClick={() => setShowBarcodeScanner(true)}
                  size="small"
                  sx={{ p: 0.5 }}
                >
                  <BarcodeIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#fff'
            }
          }}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
            Search Results
          </Typography>
          <List sx={{ p: 0, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            {searchResults.length > 0 ? (
              searchResults.map(renderFoodItem)
            ) : (
              <ListItem sx={{ py: 3, textAlign: 'center' }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      No foods found
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {/* Recent Foods */}
      {showRecent && recentFoods.length > 0 && searchQuery.length < 2 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
            Recent Foods
          </Typography>
          <List sx={{ p: 0, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            {recentFoods.map(renderFoodItem)}
          </List>
        </Box>
      )}

      {/* Simple Add Food Dialog */}
      {!disableDialog && (
        <Dialog
          open={!!selectedFood}
          onClose={() => setSelectedFood(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              margin: { xs: 0, sm: 2 },
              maxHeight: { xs: '100vh', sm: '90vh' },
              width: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          <DialogTitle sx={{ pb: 2, px: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Add Food
              </Typography>
              <IconButton onClick={() => setSelectedFood(null)} size="large">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 3, sm: 4 } }}>
            {/* Food Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedFood?.name}
              </Typography>
              {selectedFood?.brand && (
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  {selectedFood.brand}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: '#666' }}>
                Per {selectedFood?.serving?.size || 100}{selectedFood?.serving?.unit || 'g'} serving
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Servings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Servings
              </Typography>
              <TextField
                type="number"
                value={servings}
                onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                inputProps={{ min: 0.1, step: 0.1 }}
                sx={{ width: '120px' }}
              />
            </Box>

            {/* Nutrition Fields */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Nutrition (per serving)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Calories"
                  type="number"
                  size="small"
                  value={nutrition.calories_per_serving}
                  onChange={(e) => setNutrition({
                    ...nutrition,
                    calories_per_serving: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    endAdornment: <Typography variant="caption">cal</Typography>
                  }}
                />
                <TextField
                  label="Protein"
                  type="number"
                  size="small"
                  value={nutrition.protein_grams}
                  onChange={(e) => setNutrition({
                    ...nutrition,
                    protein_grams: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    endAdornment: <Typography variant="caption">g</Typography>
                  }}
                />
                <TextField
                  label="Carbs"
                  type="number"
                  size="small"
                  value={nutrition.carbs_grams}
                  onChange={(e) => setNutrition({
                    ...nutrition,
                    carbs_grams: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    endAdornment: <Typography variant="caption">g</Typography>
                  }}
                />
                <TextField
                  label="Fat"
                  type="number"
                  size="small"
                  value={nutrition.fat_grams}
                  onChange={(e) => setNutrition({
                    ...nutrition,
                    fat_grams: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    endAdornment: <Typography variant="caption">g</Typography>
                  }}
                />
              </Box>
            </Box>

            {/* Total Preview */}
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Total ({servings} serving{servings !== 1 ? 's' : ''}):
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
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
          </DialogContent>
          <DialogActions sx={{ p: { xs: 3, sm: 4 }, pt: 2, gap: 2 }}>
            <Button onClick={() => setSelectedFood(null)} size="large">
              Cancel
            </Button>
            <Button
              onClick={handleAddFood}
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
            >
              Add Food
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onBarcodeScanned={(food) => {
          handleFoodClick(food);
          setShowBarcodeScanner(false);
        }}
      />
    </Box>
  );
};

export default FoodSearch;