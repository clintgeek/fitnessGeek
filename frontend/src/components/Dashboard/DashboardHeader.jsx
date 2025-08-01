import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Today as TodayIcon } from '@mui/icons-material';

const DashboardHeader = ({
  showDate = true,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Box sx={{
      p: { xs: 3, sm: 4 },
      pb: { xs: 2, sm: 4 },
      mb: 3,
      ...props.sx
    }}
      {...props}
    >
      {showDate && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          gap: 1
        }}>
          <TodayIcon sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: theme.palette.text.secondary
          }} />
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: theme.palette.text.secondary
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DashboardHeader;