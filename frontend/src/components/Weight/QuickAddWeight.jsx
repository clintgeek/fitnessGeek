import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  MonitorWeight as WeightIcon
} from '@mui/icons-material';

const QuickAddWeight = ({ onAdd, unit = 'lbs' }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!value || !date) return;

    setLoading(true);
    try {
      await onAdd({
        value: parseFloat(value),
        date: date
      });

      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setOpen(false);
    } catch (error) {
      console.error('Error adding weight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add weight"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80, // Above bottom navigation
          right: 16,
          zIndex: 1000,
          backgroundColor: '#6098CC',
          '&:hover': {
            backgroundColor: '#4a7ba8'
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Quick Add Card for desktop */}
      <Card sx={{
        display: { xs: 'none', md: 'block' },
        mb: 3,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WeightIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quick Add Weight
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label={`Weight (${unit})`}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                endAdornment: unit
              }}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!value || loading}
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.background.default
                }
              }}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WeightIcon sx={{ mr: 1 }} />
            Log Weight
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={`Weight (${unit})`}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              endAdornment: unit
            }}
            autoFocus
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!value || loading}
          >
            Log Weight
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickAddWeight;