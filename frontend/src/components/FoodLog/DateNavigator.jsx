import React from 'react';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const DateNavigator = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  formatDate,
  calorieCard = null,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Box sx={{
      mb: 3,
      ...props.sx
    }}
      {...props}
    >
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gridTemplateRows: 'auto auto',
        rowGap: 1,
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        boxShadow: theme.shadows[1],
        border: 'none'
      }}>
        <IconButton
          onClick={onPreviousDay}
          sx={{
            color: theme.palette.primary.main,
            p: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.light + '20'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: theme.palette.text.primary
            }}
          >
            {formatDate(selectedDate)}
          </Typography>
          <CalendarIcon sx={{ color: theme.palette.primary.main }} />
        </Box>

        <IconButton
          onClick={onNextDay}
          sx={{
            color: theme.palette.primary.main,
            p: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.light + '20'
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* Calorie summary spans full width below date row when provided */}
        {calorieCard && (
          <Box sx={{ gridColumn: '1 / span 3', pt: 0.5 }}>
            {calorieCard}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DateNavigator;