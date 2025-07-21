import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MonitorWeight as WeightIcon,
  MonitorHeart as BPIcon,
  Restaurant as FoodIcon,
  LocalFireDepartment as StreakIcon,
  RestaurantMenu as NutritionIcon,
  FlashOn as QuickActionsIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';

// Sortable item component
const SortableItem = ({ cardKey, cardConfig, settings, onToggleCard }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 8 : 2}
      sx={{
        mb: 1,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDragging ? '#f5f5f5' : 'white',
        border: isDragging ? '2px dashed #6098CC' : '1px solid #e0e0e0',
        borderRadius: 1,
        transition: 'all 0.2s ease-in-out',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      {...attributes}
      {...listeners}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <IconButton
          size="small"
          sx={{ mr: 1, color: '#666' }}
        >
          <DragIndicatorIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ mr: 1, color: '#6098CC' }}>
            {cardConfig[cardKey].icon}
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {cardConfig[cardKey].label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cardConfig[cardKey].description}
            </Typography>
          </Box>
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings[`show_${cardKey}`]}
            onChange={(e) => onToggleCard(cardKey, e.target.checked)}
            size="small"
          />
        }
        label=""
      />
    </Paper>
  );
};

const DashboardOrderSettings = ({ settings, onSettingsChange, onOrderChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Card configuration with icons and labels
  const cardConfig = {
    current_weight: {
      icon: <WeightIcon />,
      label: 'Current Weight',
      description: 'Show current weight and progress'
    },
    blood_pressure: {
      icon: <BPIcon />,
      label: 'Blood Pressure',
      description: 'Show latest BP reading and status'
    },
    calories_today: {
      icon: <FoodIcon />,
      label: 'Calories Today',
      description: 'Show today\'s calorie intake'
    },
    login_streak: {
      icon: <StreakIcon />,
      label: 'Login Streak',
      description: 'Show consecutive login days'
    },
    nutrition_today: {
      icon: <NutritionIcon />,
      label: 'Nutrition Today',
      description: 'Show macro breakdown'
    },
    quick_actions: {
      icon: <QuickActionsIcon />,
      label: 'Quick Actions',
      description: 'Show quick action buttons'
    },
    weight_goal: {
      icon: <WeightIcon />,
      label: 'Weight Goal',
      description: 'Show weight goal progress'
    },
    nutrition_goal: {
      icon: <FoodIcon />,
      label: 'Nutrition Goal',
      description: 'Show nutrition goal targets'
    }
  };

  // Get visible cards based on settings
  const getVisibleCards = () => {
    const cardOrder = settings.card_order || [
      'current_weight',
      'blood_pressure',
      'calories_today',
      'login_streak',
      'nutrition_today',
      'quick_actions',
      'weight_goal',
      'nutrition_goal'
    ];

    return cardOrder.filter(cardKey => {
      const settingKey = `show_${cardKey}`;
      return settings[settingKey];
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const visibleCards = getVisibleCards();
      const oldIndex = visibleCards.indexOf(active.id);
      const newIndex = visibleCards.indexOf(over.id);

      const reorderedCards = arrayMove(visibleCards, oldIndex, newIndex);

      // Update the full card order while preserving hidden cards
      const cardOrder = settings.card_order || [
        'current_weight',
        'blood_pressure',
        'calories_today',
        'login_streak',
        'nutrition_today',
        'quick_actions',
        'weight_goal',
        'nutrition_goal'
      ];

      const hiddenCards = cardOrder.filter(cardKey => {
        const settingKey = `show_${cardKey}`;
        return !settings[settingKey];
      });

      // Rebuild the order with visible cards in new order + hidden cards at the end
      const finalOrder = [...reorderedCards, ...hiddenCards];

      onOrderChange(finalOrder);
    }
  };

  const handleToggleCard = (cardKey, checked) => {
    const settingKey = `show_${cardKey}`;
    onSettingsChange(settingKey, checked);
  };

    const visibleCards = getVisibleCards();

  // Debug logging
  console.log('DashboardOrderSettings - settings:', settings);
  console.log('DashboardOrderSettings - visibleCards:', visibleCards);
  console.log('DashboardOrderSettings - card_order:', settings.card_order);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Dashboard Card Order
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag and drop cards to reorder them on your dashboard. Toggle switches to show/hide cards.
      </Typography>

      {!settings.card_order && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No card order found. Using default order.
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleCards}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ mb: 3 }}>
            {visibleCards.map((cardKey) => (
              <SortableItem
                key={cardKey}
                cardKey={cardKey}
                cardConfig={cardConfig}
                settings={settings}
                onToggleCard={handleToggleCard}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {/* Hidden Cards Section */}
      {(settings.card_order || []).some(cardKey => {
        const settingKey = `show_${cardKey}`;
        return !settings[settingKey];
      }) && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Hidden Cards
          </Typography>
          {(settings.card_order || [])
            .filter(cardKey => {
              const settingKey = `show_${cardKey}`;
              return !settings[settingKey];
            })
            .map((cardKey) => (
              <Paper
                key={cardKey}
                elevation={1}
                sx={{
                  mb: 1,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  opacity: 0.7
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, color: '#999' }}>
                    {cardConfig[cardKey].icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {cardConfig[cardKey].label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cardConfig[cardKey].description}
                    </Typography>
                  </Box>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings[`show_${cardKey}`]}
                      onChange={(e) => handleToggleCard(cardKey, e.target.checked)}
                      size="small"
                    />
                  }
                  label=""
                />
              </Paper>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default DashboardOrderSettings;