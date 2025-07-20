import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  MonitorHeart as BPIcon
} from '@mui/icons-material';

const QuickAddBP = ({ onAdd, unit = "mmHg" }) => {
  const theme = useTheme();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!systolic || !diastolic) {
      setError('Please enter both systolic and diastolic values');
      return;
    }

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    const pulseNum = pulse ? parseInt(pulse) : null;

    if (isNaN(systolicNum) || isNaN(diastolicNum)) {
      setError('Please enter valid numbers');
      return;
    }

    if (systolicNum < 70 || systolicNum > 200) {
      setError('Systolic should be between 70-200 mmHg');
      return;
    }

    if (diastolicNum < 40 || diastolicNum > 130) {
      setError('Diastolic should be between 40-130 mmHg');
      return;
    }

    if (systolicNum <= diastolicNum) {
      setError('Systolic should be higher than diastolic');
      return;
    }

    if (pulse && (pulseNum < 40 || pulseNum > 200)) {
      setError('Pulse should be between 40-200 bpm');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        systolic: systolicNum,
        diastolic: diastolicNum,
        pulse: pulseNum,
        date: date
      });

      // Reset form
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch {
      setError('Failed to add blood pressure reading');
    } finally {
      setLoading(false);
    }
  };

  const getBPStatus = () => {
    if (!systolic || !diastolic) return null;

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (isNaN(sys) || isNaN(dia)) return null;

    // BP Categories based on American Heart Association guidelines
    if (sys < 120 && dia < 80) return { status: 'Normal', color: '#4caf50' };
    if (sys < 130 && dia < 80) return { status: 'Elevated', color: '#ff9800' };
    if (sys < 140 && dia < 90) return { status: 'High Normal', color: '#ff9800' };
    if (sys < 160 && dia < 100) return { status: 'Stage 1', color: '#f44336' };
    if (sys < 180 && dia < 110) return { status: 'Stage 2', color: '#d32f2f' };
    return { status: 'Crisis', color: '#b71c1c' };
  };

  const bpStatus = getBPStatus();

  return (
    <>
      {/* Mobile version - Floating Action Button style */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            borderRadius: '50%',
            width: 56,
            height: 56,
            minWidth: 'unset',
            boxShadow: 3
          }}
        />
      </Box>

      {/* Desktop version */}
      <Card sx={{
        display: { xs: 'none', md: 'block' },
        mb: 2,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        border: '1px solid #e0e0e0'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BPIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quick Add Blood Pressure
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Systolic"
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography variant="caption">{unit}</Typography>
                  }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Diastolic"
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography variant="caption">{unit}</Typography>
                  }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Pulse"
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography variant="caption">bpm</Typography>
                  }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  {loading ? 'Adding...' : 'Add'}
                </Button>
              </Grid>
            </Grid>

            {/* BP Status indicator */}
            {bpStatus && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  Status:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: bpStatus.color,
                    backgroundColor: `${bpStatus.color}20`,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {bpStatus.status}
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuickAddBP;