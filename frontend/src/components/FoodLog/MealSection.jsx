import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider
} from '@mui/material';
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
    color: '#FF9800' // Orange
  },
  lunch: {
    title: 'Lunch',
    icon: LunchIcon,
    color: '#4CAF50' // Green
  },
  dinner: {
    title: 'Dinner',
    icon: DinnerIcon,
    color: '#2196F3' // Blue
  },
  snack: {
    title: 'Snacks',
    icon: SnackIcon,
    color: '#9C27B0' // Purple
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
  const config = MEAL_CONFIG[mealType];
  const IconComponent = config.icon;

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
    <Card sx={{
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      mb: 2
    }}>
      <CardContent sx={{ p: compact ? 1 : 1.5 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: config.color,
                width: compact ? 32 : 40,
                height: compact ? 32 : 40
              }}
            >
              <IconComponent />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {config.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(mealTotals.calories)} cal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Regular action buttons */}
            {logs.length > 0 && onSaveMeal && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSaveMeal}
                sx={{
                  borderColor: config.color,
                  color: config.color,
                  '&:hover': {
                    borderColor: config.color,
                    backgroundColor: `${config.color}10`
                  }
                }}
              >
                Save Meal
              </Button>
            )}

            {onAddFood && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddFood}
                sx={{
                  borderColor: config.color,
                  color: config.color,
                  '&:hover': {
                    borderColor: config.color,
                    backgroundColor: `${config.color}10`
                  }
                }}
              >
                Add
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Food Logs */}
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
            py: 3,
            color: 'text.secondary'
          }}>
            <IconComponent sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              No foods logged for {config.title}
            </Typography>
            {onAddFood && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddFood}
                sx={{
                  borderColor: config.color,
                  color: config.color
                }}
              >
                Add Food
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MealSection;