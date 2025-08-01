import React from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Coffee as BreakfastIcon,
  Restaurant as LunchIcon,
  DinnerDining as DinnerIcon,
  Cookie as SnackIcon
} from '@mui/icons-material';
import FoodLogItem from './FoodLogItem.jsx';

// Meal type configuration
const MEAL_CONFIG = {
  breakfast: {
    title: 'Breakfast',
    icon: BreakfastIcon,
    color: 'warning'
  },
  lunch: {
    title: 'Lunch',
    icon: LunchIcon,
    color: 'success'
  },
  dinner: {
    title: 'Dinner',
    icon: DinnerIcon,
    color: 'info'
  },
  snack: {
    title: 'Snacks',
    icon: SnackIcon,
    color: 'secondary'
  }
};

const MealSection = ({
  mealType,
  logs,
  onAddFood,
  onEditLog,
  onDeleteLog,
  onSaveMeal,
  showActions = true,
  compact = false
}) => {
  const theme = useTheme();
  const config = MEAL_CONFIG[mealType];
  const IconComponent = config.icon;
  const color = theme.palette[config.color];

  // Calculate meal totals
  const mealTotals = logs.reduce(
    (totals, log) => {
      // Handle both food_item and food_item_id structures
      const food_item = log.food_item || log.food_item_id;
      const { servings } = log;

      // Safety check for food_item and nutrition
      if (!food_item || !food_item.nutrition) {
        console.warn('Food item or nutrition data missing in meal section:', log);
        return totals;
      }

      const nutrition = food_item.nutrition;
      const servingsCount = typeof servings === 'string' ? parseFloat(servings) || 1 : (servings || 1);

      return {
        calories: totals.calories + ((nutrition.calories_per_serving || 0) * servingsCount),
        protein: totals.protein + ((nutrition.protein_grams || 0) * servingsCount),
        carbs: totals.carbs + ((nutrition.carbs_grams || 0) * servingsCount),
        fat: totals.fat + ((nutrition.fat_grams || 0) * servingsCount)
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAddFood = () => {
    if (onAddFood) {
      onAddFood(mealType);
    }
  };

  const handleSaveMeal = () => {
    if (onSaveMeal && (logs.length > 0)) {
      onSaveMeal(mealType, logs);
    }
  };

  return (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      boxShadow: theme.shadows[1],
      overflow: 'hidden',
      border: 'none'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 2.5 },
        backgroundColor: color.light + '20'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: color.light,
              color: color.main,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 }
            }}
          >
            <IconComponent />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: theme.palette.text.primary
              }}
            >
              {config.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {Math.round(mealTotals.calories)} calories
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Save Meal Button */}
          {logs.length > 0 && onSaveMeal && (
            <IconButton
              onClick={handleSaveMeal}
              sx={{
                color: color.main,
                backgroundColor: color.light + '30',
                '&:hover': {
                  backgroundColor: color.light + '50'
                }
              }}
              size="small"
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          )}

          {/* Add Food Button */}
          {onAddFood && (
            <IconButton
              onClick={handleAddFood}
              sx={{
                color: 'white',
                backgroundColor: color.main,
                '&:hover': {
                  backgroundColor: color.dark,
                  opacity: 0.9
                }
              }}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {logs.length > 0 ? (
          <Box>
            {logs.map((log) => (
              <FoodLogItem
                key={log.id || log._id || `${log.food_item?.name || log.food_item_id?.name}-${log.meal_type}`}
                log={log}
                onEdit={onEditLog}
                onDelete={onDeleteLog}
                showActions={showActions}
                compact={compact}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{
            textAlign: 'center',
            py: { xs: 3, sm: 4 },
            color: theme.palette.text.secondary
          }}>
            <Typography variant="body2">
              No foods logged yet
            </Typography>
            {onAddFood && (
              <Button
                onClick={handleAddFood}
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{
                  mt: 1,
                  borderColor: color.main,
                  color: color.main,
                  '&:hover': {
                    borderColor: color.dark,
                    backgroundColor: color.light + '20'
                  }
                }}
              >
                Add Food
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MealSection;