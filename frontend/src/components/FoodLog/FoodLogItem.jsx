import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Avatar
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
  showActions = true
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
        alignItems: 'flex-start',
        gap: { xs: 1, sm: 1.5 },
        p: { xs: 1.5, sm: 2 },
        mb: { xs: 1, sm: 1.5 },
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f1f3f4',
          borderColor: '#dee2e6'
        }
      }}
    >
      {/* Food Icon */}
      <Avatar
        sx={{
          bgcolor: '#4caf50',
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          flexShrink: 0
        }}
      >
        <FoodIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
      </Avatar>

      {/* Food Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Food Name and Brand */}
        <Box sx={{ mb: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: '#1a1a1a',
              lineHeight: 1.3
            }}
          >
            {food_item.name}
          </Typography>
        </Box>

        {/* Brand */}
        {food_item.brand && (
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              display: 'block',
              mb: 0.5
            }}
          >
            {food_item.brand}
          </Typography>
        )}

        {/* Nutrition Info */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: 1
        }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: '#4caf50'
            }}
          >
            {totalCalories} cal
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            P: {totalProtein}g
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            C: {totalCarbs}g
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            F: {totalFat}g
          </Typography>
        </Box>

        {/* Serving Indicator - Moved to bottom */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${servingsCount} serving${servingsCount !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              height: { xs: 20, sm: 24 },
              borderColor: '#4caf50',
              color: '#4caf50',
              backgroundColor: '#f1f8e9'
            }}
          />
        </Box>

        {/* Notes */}
        {notes && (
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              mt: 0.5,
              display: 'block',
              fontStyle: 'italic'
            }}
          >
            "{notes}"
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      {showActions && (
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                color: '#2196f3',
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb'
                }
              }}
            >
              <EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                color: '#f44336',
                backgroundColor: '#ffebee',
                '&:hover': {
                  backgroundColor: '#ffcdd2'
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default FoodLogItem;