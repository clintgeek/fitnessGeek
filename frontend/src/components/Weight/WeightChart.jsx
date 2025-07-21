import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const WeightChart = ({ data, title, yAxisLabel, goalLine, startWeight, targetWeight }) => {
  const theme = useTheme();



  // Format data for chart and sort by date (oldest to newest)
  const chartData = data
    .map(item => ({
      date: new Date(item.log_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      value: parseFloat(item.weight_value),
      fullDate: item.log_date
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)); // Sort oldest to newest



      // Create goal line data that spans the actual date range
  let combinedData = [...chartData];

  if (goalLine && startWeight && targetWeight && chartData.length > 0) {
    // Get the first and last dates from the actual weight data
    const firstDate = new Date(chartData[0].fullDate);
    const lastDate = new Date(chartData[chartData.length - 1].fullDate);

    // Calculate the total weight loss needed and time period based on actual data range
    const totalWeightLoss = parseFloat(startWeight) - parseFloat(targetWeight);
    const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const dailyWeightLoss = totalWeightLoss / totalDays;

    // Create goal line data points for each actual weight data point
    chartData.forEach((dataPoint, index) => {
      const currentDate = new Date(dataPoint.fullDate);
      const daysFromStart = (currentDate - firstDate) / (1000 * 60 * 60 * 24);
      const expectedWeight = parseFloat(startWeight) - (dailyWeightLoss * daysFromStart);

      // Add goal value to the existing data point (this shows where you should be today)
      combinedData[index].goalValue = expectedWeight;
    });

    // Add target line data (horizontal line at target weight)
    combinedData.forEach((dataPoint, index) => {
      combinedData[index].targetLine = parseFloat(targetWeight);
    });
  }



  return (
    <Card sx={{
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      mb: 2
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="date"
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                fontSize={12}
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius
                }}
                formatter={(value, name) => {
                  if (name === 'value') return [`${value} lbs`, 'Weight'];
                  if (name === 'goalValue') return [`${value} lbs`, 'Goal'];
                  if (name === 'targetLine') return [`${value} lbs`, 'Target'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              {/* Goal line if provided - render first so it's behind the actual weight line */}
              {goalLine && startWeight && targetWeight && (
                <Line
                  type="monotone"
                  dataKey="goalValue"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2 }}
                />
              )}

              {/* Target weight line - horizontal line across the chart */}
              {goalLine && targetWeight && (
                <Line
                  type="monotone"
                  dataKey="targetLine"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}

              {/* Actual weight line - render last so it's on top */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeightChart;