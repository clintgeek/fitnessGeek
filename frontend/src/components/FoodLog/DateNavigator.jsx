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
        display: 'flex',
        justifyContent: 'space-between',
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      </Box>
    </Box>
  );
};

export default DateNavigator;