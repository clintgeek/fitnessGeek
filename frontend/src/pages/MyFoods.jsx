import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  LocalDining as CustomFoodIcon,
  Public as UsdaIcon,
  Store as NutritionixIcon,
  Category as OpenFoodFactsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fitnessGeekService } from '../services/fitnessGeekService.js';

// Source utilities (copied from FoodSearch)
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
    default:
      return source || 'Unknown';
  }
};

const MyFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const response = await fitnessGeekService.getAllFoods(1000); // Get all foods
      setFoods(response || []);
    } catch (error) {
      console.error('Error loading foods:', error);
      setError('Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setEditForm({
      name: food.name,
      brand: food.brand || '',
      calories_per_serving: food.nutrition.calories_per_serving,
      protein_grams: food.nutrition.protein_grams,
      carbs_grams: food.nutrition.carbs_grams,
      fat_grams: food.nutrition.fat_grams,
      fiber_grams: food.nutrition.fiber_grams || 0,
      sugar_grams: food.nutrition.sugar_grams || 0,
      sodium_mg: food.nutrition.sodium_mg || 0,
      serving_size: food.serving?.size || 100,
      serving_unit: food.serving?.unit || 'g'
    });
    setEditDialogOpen(true);
  };

  const handleDeleteFood = (food) => {
    setDeletingFood(food);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingFood) return;

    setEditLoading(true);
    try {
      await fitnessGeekService.updateFood(editingFood._id, {
        name: editForm.name,
        brand: editForm.brand,
        nutrition: {
          calories_per_serving: editForm.calories_per_serving,
          protein_grams: editForm.protein_grams,
          carbs_grams: editForm.carbs_grams,
          fat_grams: editForm.fat_grams,
          fiber_grams: editForm.fiber_grams,
          sugar_grams: editForm.sugar_grams,
          sodium_mg: editForm.sodium_mg
        },
        serving: {
          size: editForm.serving_size,
          unit: editForm.serving_unit
        }
      });

      // Refresh the foods list
      await loadFoods();
      setEditDialogOpen(false);
      setEditingFood(null);
      setEditForm({});
      setSuccessMessage('Food updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating food:', error);
      setError('Failed to update food');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFood) return;

    setDeleteLoading(true);
    try {
      await fitnessGeekService.deleteFood(deletingFood._id);

      // Refresh the foods list
      await loadFoods();
      setDeleteDialogOpen(false);
      setDeletingFood(null);
      setSuccessMessage('Food deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting food:', error);
      setError('Failed to delete food');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      food.name.toLowerCase().includes(query) ||
      (food.brand && food.brand.toLowerCase().includes(query)) ||
      food.source.toLowerCase().includes(query)
    );
  });

  const renderFoodItem = (food) => {
    const sourceColor = getSourceColor(food.source);
    const sourceIcon = getSourceIcon(food.source);

    return (
      <ListItem
        key={food._id}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          mb: 1,
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
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
              {food.brand && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {food.brand}
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
            <IconButton
              edge="end"
              onClick={() => handleEditFood(food)}
              sx={{ color: 'primary.main' }}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => handleDeleteFood(food)}
              sx={{ color: 'error.main' }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5, color: '#6098CC' }}>
          My Foods
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your saved foods and custom entries
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search your foods..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }
        }}
      />

      {/* Foods List */}
      <Card sx={{ width: '100%', backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Saved Foods ({filteredFoods.length})
          </Typography>

          {filteredFoods.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredFoods.map((food) => renderFoodItem(food))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <FoodIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'No foods match your search.' : 'No saved foods yet. Start by searching and adding foods!'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {editingFood?.name}
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

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Fiber"
                type="number"
                value={editForm.fiber_grams || ''}
                onChange={(e) => setEditForm({ ...editForm, fiber_grams: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Sugar"
                type="number"
                value={editForm.sugar_grams || ''}
                onChange={(e) => setEditForm({ ...editForm, sugar_grams: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Sodium"
                type="number"
                value={editForm.sodium_mg || ''}
                onChange={(e) => setEditForm({ ...editForm, sodium_mg: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">mg</InputAdornment>
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
        <DialogTitle>Delete Food?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingFood?.name}"?
            This will remove it from your saved foods but preserve any historical logs.
            You can always search for it again to re-add it.
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
    </Box>
  );
};

export default MyFoods;