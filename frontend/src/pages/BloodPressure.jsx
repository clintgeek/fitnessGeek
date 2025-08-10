import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import BPChartNivo from '../components/BloodPressure/BPChartNivo.jsx';
import QuickAddBP from '../components/BloodPressure/QuickAddBP.jsx';
import BPLogList from '../components/BloodPressure/BPLogList.jsx';
import BPReport from '../components/BloodPressure/BPReport.jsx';
import BPHRChart from '../components/BloodPressure/BPHRChart.jsx';
import { fitnessGeekService } from '../services/fitnessGeekService.js';
import { bpService } from '../services/bpService.js';
import { getTodayLocal, formatDateLocal } from '../utils/dateUtils.js';

const BloodPressure = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [bpLogs, setBPLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [hrSeries, setHrSeries] = useState([]);

  // Calculate the best default time range based on available data
  const getBestTimeRange = (data) => {
    if (!data || data.length === 0) return 'all';

    const sortedData = [...data].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    const mostRecentDate = new Date(sortedData[0].log_date);

    const ranges = [
      { key: '7', days: 7 },
      { key: '30', days: 30 },
      { key: '365', days: 365 },
      { key: 'all', days: Infinity }
    ];

    for (const range of ranges) {
      const cutoffDate = new Date(mostRecentDate.getTime() - (range.days * 24 * 60 * 60 * 1000));
      const filteredCount = data.filter(item => {
        if (range.key === 'all') return true;
        const logDate = new Date(item.log_date);
        return logDate >= cutoffDate;
      }).length;

      if (filteredCount >= 2) {
        return range.key;
      }
    }

    return 'all';
  };

  const [timeRangeState, setTimeRangeState] = useState(() => getBestTimeRange(bpLogs));

  // Update time range when data loads
  React.useEffect(() => {
    if (bpLogs.length > 0) {
      const bestRange = getBestTimeRange(bpLogs);
      setTimeRangeState(bestRange);
    }
  }, [bpLogs]);

  // Filter data based on selected time range
  const filteredBPLogs = useMemo(() => {
    if (!bpLogs || bpLogs.length === 0) return [];

    const sortedData = [...bpLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    const mostRecentDate = new Date(sortedData[0].log_date);

    const ranges = {
      '7': 7,
      '30': 30,
      '365': 365,
      'all': Infinity
    };

    const daysToSubtract = ranges[timeRangeState];
    const cutoffDate = new Date(mostRecentDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));

    const filtered = bpLogs
      .filter(item => {
        if (timeRangeState === 'all') return true;
        const logDate = new Date(item.log_date);
        return logDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

    return filtered;
  }, [bpLogs, timeRangeState]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRangeState(newRange);
  };

  // Auto-switch to better range if current range has insufficient data
  React.useEffect(() => {
    if (filteredBPLogs.length < 2 && filteredBPLogs.length > 0) {
      const betterRange = getBestTimeRange(bpLogs);
      if (betterRange !== timeRangeState) {
        setTimeRangeState(betterRange);
      }
    }
  }, [bpLogs, timeRangeState, filteredBPLogs.length]);

  // Check if we have enough data points for the selected range
  const hasEnoughData = filteredBPLogs.length >= 2;
  const insufficientDataMessage = !hasEnoughData && filteredBPLogs.length > 0 ?
    `Only ${filteredBPLogs.length} data point${filteredBPLogs.length === 1 ? '' : 's'} in this range. Try a larger time range.` : null;

  // Load BP data on mount
  useEffect(() => {
    loadBPData();
    loadHRSeries();
  }, []);

  const loadBPData = async () => {
    setLoading(true);
    try {
      const response = await bpService.getBPLogs();
      if (response.success) {
        setBPLogs(response.data);
      } else {
        setError('Failed to load blood pressure logs');
      }
    } catch (error) {
      setError('Failed to load blood pressure data');
      console.error('Error loading BP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHRSeries = async (date) => {
    try {
      const today = new Date();
      const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      const ymd = (date || local.toISOString().split('T')[0]);
      const resp = await fitnessGeekService.get(`/fitness/garmin/heart-rate/${ymd}`);
      const data = resp.data || resp?.data?.data || resp;
      if (data && data.series) setHrSeries(data.series);
    } catch (e) {
      console.warn('Failed to load HR series:', e.message);
    }
  };

  const handleAddBP = async (bpData) => {
    try {
      const response = await bpService.createBPLog({
        systolic: bpData.systolic,
        diastolic: bpData.diastolic,
        pulse: bpData.pulse,
        date: bpData.date
      });

      if (response.success) {
        // Reload BP data to get the updated list
        await loadBPData();
        setSuccess('Blood pressure reading logged successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to add blood pressure reading');
      }
    } catch (error) {
      // Handle specific error cases
      if (error.message && error.message.includes('already exists for this date')) {
        const todayBP = getTodayBP();
        if (todayBP) {
          setError(`You already have a blood pressure reading for today (${todayBP.systolic}/${todayBP.diastolic}${todayBP.pulse ? `, pulse: ${todayBP.pulse}` : ''}). You can update the existing entry or delete it first.`);
        } else {
          setError('You already have a blood pressure reading for today. You can update the existing entry or delete it first.');
        }
      } else {
        setError('Failed to add blood pressure reading');
      }
      console.error('Error adding BP reading:', error);
    }
  };

  const handleDeleteBP = async (logId) => {
    try {
      const response = await bpService.deleteBPLog(logId);

      if (response.success) {
        // Reload BP data to get the updated list
        await loadBPData();
        setSuccess('Blood pressure reading deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete blood pressure reading');
      }
    } catch (error) {
      setError('Failed to delete blood pressure reading');
      console.error('Error deleting BP reading:', error);
    }
  };

  const getCurrentBP = () => {
    if (bpLogs.length === 0) {
      return null;
    }
    const sortedLogs = [...bpLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    return sortedLogs[0];
  };

  const getTodayBP = () => {
    const today = getTodayLocal();
    return bpLogs.find(log => {
      // Convert the stored UTC date to local date for comparison
      const logDate = new Date(log.log_date);
      const logDateLocal = formatDateLocal(logDate);
      return logDateLocal === today;
    });
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        p: 2
      }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentBP = getCurrentBP();
  const todayBP = getTodayBP();

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      pb: { xs: 8, sm: 2 }
    }}>
      {/* Success/Error Messages */}
      {success && (
        <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Box>
      )}
      {error && (
        <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Current BP Summary */}
      {currentBP && (
        <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
          <Box sx={{
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            border: 'none',
            p: { xs: 2, sm: 3 },
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              Latest Reading
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {currentBP.systolic}/{currentBP.diastolic}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              mmHg
            </Typography>
            {currentBP.pulse && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  Pulse: {currentBP.pulse} bpm
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {new Date(currentBP.log_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Blood Pressure Chart */}
      {bpLogs.length > 0 && (
        <>
          {/* Time Range Buttons and Export */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <ButtonGroup
                size={isMobile ? 'small' : 'medium'}
                variant="outlined"
                sx={{
                  '& .MuiButton-root': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    px: isMobile ? 1 : 1.5,
                    py: isMobile ? 0.25 : 0.5,
                    minWidth: isMobile ? 'auto' : '60px'
                  }
                }}
              >
                <Button
                  onClick={() => handleTimeRangeChange('7')}
                  variant={timeRangeState === '7' ? 'contained' : 'outlined'}
                  size={isMobile ? 'small' : 'medium'}
                >
                  7d
                </Button>
                <Button
                  onClick={() => handleTimeRangeChange('30')}
                  variant={timeRangeState === '30' ? 'contained' : 'outlined'}
                  size={isMobile ? 'small' : 'medium'}
                >
                  30d
                </Button>
                <Button
                  onClick={() => handleTimeRangeChange('365')}
                  variant={timeRangeState === '365' ? 'contained' : 'outlined'}
                  size={isMobile ? 'small' : 'medium'}
                >
                  1y
                </Button>
                <Button
                  onClick={() => handleTimeRangeChange('all')}
                  variant={timeRangeState === 'all' ? 'contained' : 'outlined'}
                  size={isMobile ? 'small' : 'medium'}
                >
                  All
                </Button>
              </ButtonGroup>

              <Button
                onClick={() => setShowReport(true)}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<PdfIcon />}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.primary.light + '20'
                  }
                }}
              >
                View Report
              </Button>
            </Box>

            {/* Insufficient data message */}
            {insufficientDataMessage && (
              <Typography variant="caption" sx={{
                color: theme.palette.warning.main,
                fontSize: '0.7rem',
                mt: 1,
                textAlign: 'center'
              }}>
                {insufficientDataMessage}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <BPChartNivo
              data={filteredBPLogs}
              title="Blood Pressure Trend"
            />
          </Box>

          {/* Heart Rate series from Garmin */}
          {hrSeries && hrSeries.length > 0 && (
            <Box sx={{ mb: 3, px: { xs: 1, sm: 2 } }}>
              <BPHRChart data={hrSeries} title="Heart Rate (Garmin)" />
            </Box>
          )}
        </>
      )}

      {/* Quick Add BP */}
      <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
        <QuickAddBP onAdd={handleAddBP} unit="mmHg" existingTodayBP={todayBP} />
      </Box>

      {/* BP Log List */}
      <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
        <BPLogList
          logs={bpLogs}
          onDelete={handleDeleteBP}
          unit="mmHg"
        />
      </Box>

      {/* BP Report Dialog */}
      {showReport && (
        <BPReport
          bpLogs={filteredBPLogs}
          onClose={() => setShowReport(false)}
        />
      )}
    </Box>
  );
};

export default BloodPressure;