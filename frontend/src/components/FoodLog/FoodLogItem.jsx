import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon
} from '@mui/icons-material';

const FoodLogItem = ({
  log,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const food_item = log.food_item || log.food_item_id;
  const { servings, notes } = log;

  if (!food_item) {
    return null;
  }

  const nutrition = food_item.nutrition;
  const servingsCount = typeof servings === 'string' ? parseFloat(servings) || 1 : (servings || 1);

  const totalCalories = Math.round(nutrition.calories_per_serving * servingsCount);
  const totalProtein = Math.round(nutrition.protein_grams * servingsCount * 10) / 10;
  const totalCarbs = Math.round(nutrition.carbs_grams * servingsCount * 10) / 10;
  const totalFat = Math.round(nutrition.fat_grams * servingsCount * 10) / 10;

  const handleDelete = () => {
    if (onDelete && (log.id || log._id)) {
      onDelete(log.id || log._id);
    }
  };

  const handleEdit = () => {
    if (onEdit && log) {
      onEdit(log);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: compact ? 1 : 1.5,
        mb: 1,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      <FoodIcon sx={{ fontSize: compact ? 20 : 24, color: 'primary.main' }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant={compact ? "body2" : "body1"}
            fontWeight={600}
            sx={{ flex: 1, minWidth: 0 }}
            noWrap
          >
            {food_item.name}
          </Typography>
          <Chip
            label={`${servingsCount} serving${servingsCount !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" fontWeight={600}>
            {totalCalories} cal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            P: {totalProtein}g
          </Typography>
          <Typography variant="caption" color="text.secondary">
            C: {totalCarbs}g
          </Typography>
          <Typography variant="caption" color="text.secondary">
            F: {totalFat}g
          </Typography>
        </Box>

        {notes && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {notes}
          </Typography>
        )}
      </Box>

      {showActions && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default FoodLogItem;