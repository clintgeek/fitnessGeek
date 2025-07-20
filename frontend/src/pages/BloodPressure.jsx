import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import BPChart from '../components/BloodPressure/BPChart.jsx';
import QuickAddBP from '../components/BloodPressure/QuickAddBP.jsx';
import BPLogList from '../components/BloodPressure/BPLogList.jsx';
import { bpService } from '../services/bpService.js';

const BloodPressure = () => {
  const [bpLogs, setBPLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load BP data on mount
  useEffect(() => {
    loadBPData();
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
      setError('Failed to add blood pressure reading');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentBP = getCurrentBP();

  return (
    <Box sx={{ p: 2, pb: 8 }}> {/* Consistent padding with other pages, extra bottom padding for FAB */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#6098CC' }}>
        {/* Blood Pressure Tracking */}
      </Typography>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Current BP Summary */}
      {currentBP && (
        <Box sx={{
          backgroundColor: '#fafafa',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          p: 2,
          mb: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Latest Reading
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#6098CC' }}>
            {currentBP.systolic}/{currentBP.diastolic}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            mmHg
          </Typography>
          {currentBP.pulse && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#666' }}>
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
      )}

      {/* BP Chart */}
      {bpLogs.length > 0 && (
        <BPChart
          data={bpLogs}
          title="Blood Pressure Trend"
        />
      )}

      {/* Quick Add BP */}
      <QuickAddBP onAdd={handleAddBP} unit="mmHg" />

      {/* BP Log List */}
      <BPLogList
        logs={bpLogs}
        onDelete={handleDeleteBP}
        unit="mmHg"
      />
    </Box>
  );
};

export default BloodPressure;