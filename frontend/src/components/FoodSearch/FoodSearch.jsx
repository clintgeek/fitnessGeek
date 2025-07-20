import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  LocalDining as CustomFoodIcon,
  Public as UsdaIcon,
  Store as NutritionixIcon,
  Category as OpenFoodFactsIcon,
  SetMeal as MealIcon
} from '@mui/icons-material';
import { fitnessGeekService } from '../../services/fitnessGeekService.js';

// Source utilities
const getSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case 'usda':
      return <UsdaIcon />;
    case 'nutritionix':
      return <NutritionixIcon />;
    case 'openfoodfacts':
      return <OpenFoodFactsIcon />;
    case 'custom':
      return <CustomFoodIcon />;
    case 'meal':
      return <MealIcon />;
    default:
      return <FoodIcon />;
  }
};

const getSourceColor = (source) => {
  switch (source?.toLowerCase()) {
    case 'usda':
      return '#4CAF50'; // Green
    case 'nutritionix':
      return '#2196F3'; // Blue
    case 'openfoodfacts':
      return '#FF9800'; // Orange
    case 'custom':
      return '#9C27B0'; // Purple
    case 'meal':
      return '#E91E63'; // Pink
    default:
      return '#757575'; // Grey
  }
};

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
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [error, setError] = useState(null);

  // Edit/Delete state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Food selection and serving configuration state
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingConfig, setServingConfig] = useState({
    servings: 1,
    notes: '',
    nutrition: {
      calories_per_serving: 0,
      protein_grams: 0,
      carbs_grams: 0,
      fat_grams: 0
    }
  });
  const [servingConfigLoading, setServingConfigLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!autoSearch || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchFoods();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, autoSearch]);

  // Load recent foods on mount
  useEffect(() => {
    if (showRecent) {
      loadRecentFoods();
    }
  }, [showRecent]);

  const searchFoods = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for both foods and meals
      const [foodsResponse, mealsResponse] = await Promise.all([
        fitnessGeekService.searchFoods(searchQuery, maxResults),
        fitnessGeekService.getMeals(null, searchQuery)
      ]);

      const foods = foodsResponse || [];
      const meals = mealsResponse || [];

      // Combine and format results
      const combinedResults = [
        ...foods.map(food => ({ ...food, type: 'food' })),
        ...meals.map(meal => {
          // Calculate nutrition from meal items
          const nutrition = meal.food_items?.reduce((totals, item) => {
            const food = item.food_item_id;
            const servings = item.servings || 1;

            if (food && food.nutrition) {
              totals.calories_per_serving += food.nutrition.calories_per_serving * servings;
              totals.protein_grams += food.nutrition.protein_grams * servings;
              totals.carbs_grams += food.nutrition.carbs_grams * servings;
              totals.fat_grams += food.nutrition.fat_grams * servings;
            }
            return totals;
          }, {
            calories_per_serving: 0,
            protein_grams: 0,
            carbs_grams: 0,
            fat_grams: 0
          }) || {
            calories_per_serving: 0,
            protein_grams: 0,
            carbs_grams: 0,
            fat_grams: 0
          };

          return {
            ...meal,
            type: 'meal',
            name: meal.name,
            nutrition,
            source: 'meal'
          };
        })
      ];

      // Sort results: saved meals and custom foods first, then by name
      const sortedResults = combinedResults.sort((a, b) => {
        // Priority 1: Saved meals first
        if (a.type === 'meal' && b.type !== 'meal') return -1;
        if (a.type !== 'meal' && b.type === 'meal') return 1;

        // Priority 2: Custom foods second
        if (a.source === 'custom' && b.source !== 'custom') return -1;
        if (a.source !== 'custom' && b.source === 'custom') return 1;

        // Priority 3: Alphabetical by name
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults);
    } catch (err) {
      setError('Failed to search for foods. Please try again.');
      console.error('Food search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentFoods = async () => {
    try {
      // Load both recent foods and saved meals
      const [foodsResponse, mealsResponse] = await Promise.all([
        fitnessGeekService.getAllFoods(10),
        fitnessGeekService.getMeals()
      ]);

      const foods = foodsResponse || [];
      const meals = mealsResponse || [];

      // Combine and format results
      const combinedRecent = [
        ...foods.map(food => ({ ...food, type: 'food' })),
        ...meals.map(meal => {
          // Calculate nutrition from meal items
          const nutrition = meal.food_items?.reduce((totals, item) => {
            const food = item.food_item_id;
            const servings = item.servings || 1;

            if (food && food.nutrition) {
              totals.calories_per_serving += food.nutrition.calories_per_serving * servings;
              totals.protein_grams += food.nutrition.protein_grams * servings;
              totals.carbs_grams += food.nutrition.carbs_grams * servings;
              totals.fat_grams += food.nutrition.fat_grams * servings;
            }
            return totals;
          }, {
            calories_per_serving: 0,
            protein_grams: 0,
            carbs_grams: 0,
            fat_grams: 0
          }) || {
            calories_per_serving: 0,
            protein_grams: 0,
            carbs_grams: 0,
            fat_grams: 0
          };

          return {
            ...meal,
            type: 'meal',
            name: meal.name,
            nutrition,
            source: 'meal'
          };
        })
      ];

      // Sort: saved meals first, then custom foods, then alphabetically
      const sortedRecent = combinedRecent.sort((a, b) => {
        // Priority 1: Saved meals first
        if (a.type === 'meal' && b.type !== 'meal') return -1;
        if (a.type !== 'meal' && b.type === 'meal') return 1;

        // Priority 2: Custom foods second
        if (a.source === 'custom' && b.source !== 'custom') return -1;
        if (a.source !== 'custom' && b.source === 'custom') return 1;

        // Priority 3: Alphabetical by name
        return a.name.localeCompare(b.name);
      });

      setRecentFoods(sortedRecent);
    } catch (err) {
      console.error('Error loading recent foods:', err);
      // Keep empty array if API fails
      setRecentFoods([]);
    }
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setServingConfig({
      servings: 1,
      notes: '',
      nutrition: {
        calories_per_serving: food.nutrition?.calories_per_serving || 0,
        protein_grams: food.nutrition?.protein_grams || 0,
        carbs_grams: food.nutrition?.carbs_grams || 0,
        fat_grams: food.nutrition?.fat_grams || 0
      }
    });
  };

  const handleEditItem = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditForm({
      name: item.name,
      brand: item.brand || '',
      calories_per_serving: item.nutrition.calories_per_serving,
      protein_grams: item.nutrition.protein_grams,
      carbs_grams: item.nutrition.carbs_grams,
      fat_grams: item.nutrition.fat_grams,
      serving_size: item.serving?.size || 100,
      serving_unit: item.serving?.unit || 'g'
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item, e) => {
    e.stopPropagation();
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingItem) return;

    setEditLoading(true);
    try {
      if (editingItem.type === 'meal') {
        // Update meal
        await fitnessGeekService.updateMeal(editingItem._id, {
          name: editForm.name
        });
      } else {
        // Update food item
        await fitnessGeekService.updateFood(editingItem._id, {
          name: editForm.name,
          brand: editForm.brand,
          nutrition: {
            calories_per_serving: editForm.calories_per_serving,
            protein_grams: editForm.protein_grams,
            carbs_grams: editForm.carbs_grams,
            fat_grams: editForm.fat_grams
          },
          serving: {
            size: editForm.serving_size,
            unit: editForm.serving_unit
          }
        });
      }

      // Refresh the data
      if (searchQuery) {
        await searchFoods();
      } else {
        await loadRecentFoods();
      }

      setEditDialogOpen(false);
      setEditingItem(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setDeleteLoading(true);
    try {
      if (deletingItem.type === 'meal') {
        // Soft delete meal
        await fitnessGeekService.deleteMeal(deletingItem._id);
      } else {
        // Soft delete food item
        await fitnessGeekService.deleteFood(deletingItem._id);
      }

      // Refresh the data
      if (searchQuery) {
        await searchFoods();
      } else {
        await loadRecentFoods();
      }

      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleServingConfigSubmit = async () => {
    if (!selectedFood) return;

    setServingConfigLoading(true);
    try {
      if (onFoodSelect) {
        // Pass the food with serving configuration and original nutrition for comparison
        await onFoodSelect({
          ...selectedFood,
          servings: servingConfig.servings,
          notes: servingConfig.notes,
          nutrition: servingConfig.nutrition,
          original_nutrition: selectedFood.nutrition
        });
      }

      // Reset and close
      setSelectedFood(null);
      setServingConfig({ servings: 1, notes: '', nutrition: { calories_per_serving: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 } });
    } catch (error) {
      console.error('Error adding food to log:', error);
      setError('Failed to add food to log. Please try again.');
    } finally {
      setServingConfigLoading(false);
    }
  };

  const handleServingConfigCancel = () => {
    setSelectedFood(null);
    setServingConfig({ servings: 1, notes: '', nutrition: { calories_per_serving: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchFoods();
  };

  const renderFoodItem = (food) => {
    const sourceColor = getSourceColor(food.source);
    const sourceIcon = getSourceIcon(food.source);
    const isMeal = food.type === 'meal';
    const isCustom = food.source === 'custom' || food.source === 'meal';
    const canEdit = isCustom; // Only custom foods and meals can be edited

    return (
      <ListItem
        key={food.id || food._id || `${food.name}-${food.brand}-${food.source}`}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          mb: 1,
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }
        }}
        onClick={() => handleFoodClick(food)}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: `${sourceColor}20`, color: sourceColor }}>
            {sourceIcon}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap>
                {food.name}
              </Typography>
              {!isMeal && food.brand && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {food.brand}
                </Typography>
              )}
              {isMeal && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {food.food_items?.length || 0} items • {food.meal_type}
                </Typography>
              )}
            </Box>
          }
          secondaryTypographyProps={{
            component: 'div'
          }}
          secondary={
            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600}>
                  {Math.round(food.nutrition.calories_per_serving)} cal
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  P: {food.nutrition.protein_grams}g
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  C: {food.nutrition.carbs_grams}g
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  F: {food.nutrition.fat_grams}g
                </Typography>
              </Box>
              <Chip
                label={getSourceName(food.source)}
                size="small"
                sx={{
                  backgroundColor: `${sourceColor}15`,
                  color: sourceColor,
                  fontSize: '0.625rem',
                  height: 20
                }}
              />
            </Box>
          }
        />

        <ListItemSecondaryAction>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && (
              <IconButton
                edge="end"
                onClick={(e) => handleEditItem(food, e)}
                sx={{ color: 'primary.main' }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {canEdit && (
              <IconButton
                edge="end"
                onClick={(e) => handleDeleteItem(food, e)}
                sx={{ color: 'error.main' }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </ListItemSecondaryAction>
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: loading && <CircularProgress size={20} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }
          }}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchQuery && (
        <Card sx={{ backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Search Results
            </Typography>
            {searchResults.length > 0 ? (
              <List sx={{ p: 0 }}>
                {searchResults.map((food) => renderFoodItem(food))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <FoodIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No foods found. Try a different search term.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Foods */}
      {!searchQuery && showRecent && recentFoods.length > 0 && (
        <Card sx={{ backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Recent Foods
            </Typography>
            <List sx={{ p: 0 }}>
              {recentFoods.map((food) => renderFoodItem(food))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!searchQuery && (!showRecent || recentFoods.length === 0) && (
        <Card sx={{ backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 1.5, textAlign: 'center', py: 3 }}>
            <FoodIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Search for foods to get started.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {editingItem?.type === 'meal' ? 'Meal' : 'Food Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            {editingItem?.type !== 'meal' && (
              <>
                <TextField
                  fullWidth
                  label="Brand"
                  value={editForm.brand || ''}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Calories"
                    type="number"
                    value={editForm.calories_per_serving || ''}
                    onChange={(e) => setEditForm({ ...editForm, calories_per_serving: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cal</InputAdornment>
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Protein"
                    type="number"
                    value={editForm.protein_grams || ''}
                    onChange={(e) => setEditForm({ ...editForm, protein_grams: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Carbs"
                    type="number"
                    value={editForm.carbs_grams || ''}
                    onChange={(e) => setEditForm({ ...editForm, carbs_grams: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Fat"
                    type="number"
                    value={editForm.fat_grams || ''}
                    onChange={(e) => setEditForm({ ...editForm, fat_grams: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Serving Size"
                    type="number"
                    value={editForm.serving_size || ''}
                    onChange={(e) => setEditForm({ ...editForm, serving_size: parseFloat(e.target.value) || 100 })}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={editForm.serving_unit || 'g'}
                      onChange={(e) => setEditForm({ ...editForm, serving_unit: e.target.value })}
                      label="Unit"
                    >
                      <MenuItem value="g">grams (g)</MenuItem>
                      <MenuItem value="ml">milliliters (ml)</MenuItem>
                      <MenuItem value="oz">ounces (oz)</MenuItem>
                      <MenuItem value="cup">cups</MenuItem>
                      <MenuItem value="tbsp">tablespoons</MenuItem>
                      <MenuItem value="tsp">teaspoons</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete {deletingItem?.type === 'meal' ? 'Meal' : 'Food Item'}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingItem?.name}"?
            This will remove it from search results but preserve any historical logs.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Serving Configuration Dialog */}
      <Dialog open={!!selectedFood} onClose={handleServingConfigCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {selectedFood?.name} to Log
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Food Info */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                {selectedFood?.name}
              </Typography>
              {selectedFood?.brand && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedFood.brand}
                </Typography>
              )}

              {/* Editable Nutrition Fields */}
              <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Calories"
                  type="number"
                  size="small"
                  value={servingConfig.nutrition.calories_per_serving}
                  onChange={(e) => setServingConfig({
                    ...servingConfig,
                    nutrition: {
                      ...servingConfig.nutrition,
                      calories_per_serving: parseFloat(e.target.value) || 0
                    }
                  })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cal</InputAdornment>
                  }}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  label="Protein"
                  type="number"
                  size="small"
                  value={servingConfig.nutrition.protein_grams}
                  onChange={(e) => setServingConfig({
                    ...servingConfig,
                    nutrition: {
                      ...servingConfig.nutrition,
                      protein_grams: parseFloat(e.target.value) || 0
                    }
                  })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>
                  }}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  label="Carbs"
                  type="number"
                  size="small"
                  value={servingConfig.nutrition.carbs_grams}
                  onChange={(e) => setServingConfig({
                    ...servingConfig,
                    nutrition: {
                      ...servingConfig.nutrition,
                      carbs_grams: parseFloat(e.target.value) || 0
                    }
                  })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>
                  }}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  label="Fat"
                  type="number"
                  size="small"
                  value={servingConfig.nutrition.fat_grams}
                  onChange={(e) => setServingConfig({
                    ...servingConfig,
                    nutrition: {
                      ...servingConfig.nutrition,
                      fat_grams: parseFloat(e.target.value) || 0
                    }
                  })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>
                  }}
                  sx={{ minWidth: 100 }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Per {selectedFood?.serving?.size || 100}{selectedFood?.serving?.unit || 'g'} serving
              </Typography>
            </Box>

            {/* Servings Input */}
            <TextField
              fullWidth
              label="Number of Servings"
              type="number"
              value={servingConfig.servings}
              onChange={(e) => setServingConfig({
                ...servingConfig,
                servings: parseFloat(e.target.value) || 1
              })}
              inputProps={{ min: 0.1, step: 0.1 }}
              sx={{ mb: 2 }}
            />

            {/* Notes Input */}
            <TextField
              fullWidth
              label="Notes (optional)"
              value={servingConfig.notes}
              onChange={(e) => setServingConfig({
                ...servingConfig,
                notes: e.target.value
              })}
              multiline
              rows={2}
              placeholder="e.g., with milk, extra cheese, etc."
            />

            {/* Nutrition Preview */}
            {selectedFood && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Total Nutrition ({servingConfig.servings} serving{servingConfig.servings !== 1 ? 's' : ''}):
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(servingConfig.nutrition.calories_per_serving * servingConfig.servings)} cal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    P: {Math.round(servingConfig.nutrition.protein_grams * servingConfig.servings * 10) / 10}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    C: {Math.round(servingConfig.nutrition.carbs_grams * servingConfig.servings * 10) / 10}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    F: {Math.round(servingConfig.nutrition.fat_grams * servingConfig.servings * 10) / 10}g
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleServingConfigCancel}>Cancel</Button>
          <Button
            onClick={handleServingConfigSubmit}
            variant="contained"
            disabled={servingConfigLoading}
          >
            {servingConfigLoading ? <CircularProgress size={20} /> : 'Add to Log'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoodSearch;