import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MonitorHeart as BPIcon
} from '@mui/icons-material';

const BPLogList = ({ logs, onDelete, unit = "mmHg" }) => {
  const getBPStatus = (systolic, diastolic) => {
    // BP Categories based on American Heart Association guidelines
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: '#4caf50' };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: '#ff9800' };
    if (systolic < 140 && diastolic < 90) return { status: 'High Normal', color: '#ff9800' };
    if (systolic < 160 && diastolic < 100) return { status: 'Stage 1', color: '#f44336' };
    if (systolic < 180 && diastolic < 110) return { status: 'Stage 2', color: '#d32f2f' };
    return { status: 'Crisis', color: '#b71c1c' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (logs.length === 0) {
    return (
      <Card sx={{
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
        mb: 2
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Blood Pressure History
          </Typography>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
              No blood pressure readings recorded yet
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

  return (
    <Card sx={{
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      mb: 2
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Blood Pressure History
        </Typography>

        <List sx={{ p: 0 }}>
          {sortedLogs.map((log) => {
            const bpStatus = getBPStatus(log.systolic, log.diastolic);
            const isToday = new Date(log.log_date).toDateString() === new Date().toDateString();

            return (
              <ListItem
                key={log.id || log._id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'white',
                  '&:last-child': { mb: 0 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <BPIcon sx={{ color: bpStatus.color, mr: 1 }} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  {/* Primary content */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {log.systolic}/{log.diastolic} {unit}
                    </Typography>
                    {log.pulse && (
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#666' }}>
                        Pulse: {log.pulse} bpm
                      </Typography>
                    )}
                    <Chip
                      label={bpStatus.status}
                      size="small"
                      sx={{
                        backgroundColor: `${bpStatus.color}20`,
                        color: bpStatus.color,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  {/* Secondary content */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(log.log_date)}
                    </Typography>
                    {isToday && (
                      <Typography variant="body2" color="text.secondary">
                        • {formatTime(log.log_date)}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(log.id || log._id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default BPLogList;