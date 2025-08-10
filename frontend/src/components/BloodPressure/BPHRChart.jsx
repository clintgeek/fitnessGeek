import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BPHRChart = ({ data = [], title = 'Heart Rate (Today)' }) => {
  const points = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    // Accept either {time, bpm} or Garmin style arrays; normalize
    return data
      .filter(p => p && (p.bpm != null || p.heartRate != null))
      .map(p => ({
        time: p.time || p.timestamp || p.ts || '',
        bpm: p.bpm ?? p.heartRate
      }));
  }, [data]);

  return (
    <Card sx={{ width: '100%', backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, border: 'none' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{title}</Typography>
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 20, left: 5, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis width={30} domain={["dataMin-5", "dataMax+5"]} />
              <Tooltip formatter={(v) => [`${v} bpm`, 'HR']} />
              <Line type="monotone" dataKey="bpm" stroke="#9c27b0" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BPHRChart;


