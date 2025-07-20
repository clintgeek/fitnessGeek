import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Restaurant as FoodIcon
} from '@mui/icons-material';

const EditLogDialog = ({
  open,
  onClose,
  onSave,
  log,
  loading = false
}) => {
  const [servings, setServings] = useState('1');
  const [mealType, setMealType] = useState('dinner');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (log) {
      setServings(log.servings?.toString() || '1');
      setMealType(log.meal_type || 'dinner');
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSave = () => {
    if (log) {
      const updateData = {
        servings: parseFloat(servings) || 1,
        meal_type: mealType,
        notes: notes.trim()
      };
      onSave(log._id || log.id, updateData);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const food_item = log?.food_item || log?.food_item_id;
  const nutrition = food_item?.nutrition;

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Edit Food Log Entry
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Food Item Info */}
          {food_item && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1
            }}>
              <FoodIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {food_item.name}
                </Typography>
                {nutrition && (
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(nutrition.calories_per_serving)} cal • P: {nutrition.protein_grams}g • C: {nutrition.carbs_grams}g • F: {nutrition.fat_grams}g
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Servings */}
          <TextField
            fullWidth
            label="Servings"
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            inputProps={{ min: 0.1, step: 0.1 }}
            sx={{ mb: 2 }}
          />

          {/* Meal Type */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Meal Type</InputLabel>
            <Select
              value={mealType}
              label="Meal Type"
              onChange={(e) => setMealType(e.target.value)}
            >
              {mealTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            placeholder="Add any notes about this food..."
          />

          {/* Nutrition Preview */}
          {nutrition && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Nutrition for {servings} serving{parseFloat(servings) !== 1 ? 's' : ''}:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${Math.round(nutrition.calories_per_serving * parseFloat(servings))} cal`}
                  size="small"
                />
                <Chip
                  label={`${Math.round(nutrition.protein_grams * parseFloat(servings) * 10) / 10}g protein`}
                  size="small"
                />
                <Chip
                  label={`${Math.round(nutrition.carbs_grams * parseFloat(servings) * 10) / 10}g carbs`}
                  size="small"
                />
                <Chip
                  label={`${Math.round(nutrition.fat_grams * parseFloat(servings) * 10) / 10}g fat`}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !servings || parseFloat(servings) <= 0}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLogDialog;