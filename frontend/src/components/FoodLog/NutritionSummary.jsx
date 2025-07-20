import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  LocalFireDepartment as CaloriesIcon,
  FitnessCenter as ProteinIcon,
  Grain as CarbsIcon,
  Opacity as FatIcon
} from '@mui/icons-material';

const NutritionSummary = ({
  summary,
  showGoals = true,
  compact = false
}) => {
  const {
    calories,
    protein,
    carbs,
    fat,
    calorieGoal = 2000,
    proteinGoal = 150,
    carbsGoal = 200,
    fatGoal = 65
  } = summary;

  const calorieProgress = Math.min((calories / calorieGoal) * 100, 100);
  const proteinProgress = Math.min((protein / proteinGoal) * 100, 100);
  const carbsProgress = Math.min((carbs / carbsGoal) * 100, 100);
  const fatProgress = Math.min((fat / fatGoal) * 100, 100);

  const nutritionItems = [
    {
      label: 'Calories',
      value: calories,
      goal: calorieGoal,
      progress: calorieProgress,
      icon: CaloriesIcon,
      color: '#FF5722',
      unit: 'cal'
    },
    {
      label: 'Protein',
      value: protein,
      goal: proteinGoal,
      progress: proteinProgress,
      icon: ProteinIcon,
      color: '#4CAF50',
      unit: 'g'
    },
    {
      label: 'Carbs',
      value: carbs,
      goal: carbsGoal,
      progress: carbsProgress,
      icon: CarbsIcon,
      color: '#FF9800',
      unit: 'g'
    },
    {
      label: 'Fat',
      value: fat,
      goal: fatGoal,
      progress: fatProgress,
      icon: FatIcon,
      color: '#9C27B0',
      unit: 'g'
    }
  ];

  return (
    <Card sx={{
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      mb: 2
    }}>
      <CardContent sx={{ p: compact ? 1 : 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Daily Summary
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: compact ? 1 : 2
        }}>
          {nutritionItems.map((item) => {
            const IconComponent = item.icon;
            const isOverGoal = item.value > item.goal;

            return (
              <Box key={item.label} sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <IconComponent
                    sx={{
                      fontSize: compact ? 16 : 20,
                      color: item.color,
                      mr: 0.5
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>

                <Typography
                  variant={compact ? "body2" : "h6"}
                  fontWeight={600}
                  color={isOverGoal ? 'error.main' : 'text.primary'}
                >
                  {Math.round(item.value)}
                  {showGoals && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      / {item.goal}
                    </Typography>
                  )}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.25 }}
                  >
                    {item.unit}
                  </Typography>
                </Typography>

                {showGoals && (
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: `${item.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color
                      }
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Total Calories Progress Bar */}
        {showGoals && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Daily Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(calorieProgress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calorieProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: calories > calorieGoal ? '#f44336' : '#6098CC',
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionSummary;