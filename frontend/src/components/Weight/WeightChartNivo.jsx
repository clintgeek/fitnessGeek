import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ResponsiveLine } from '@nivo/line';

const WeightChartNivo = ({ data, goalLine, startWeight, targetWeight, startDate, goalDate, unit = 'lbs' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Transform data for Nivo
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data]
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
      .map(item => ({
        date: new Date(item.log_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        value: parseFloat(item.weight_value),
        fullDate: item.log_date
      }));

    const result = [
      {
        id: 'weight',
        color: theme.palette.primary.main,
        data: sortedData.map(item => ({
          x: item.date,
          y: item.value
        }))
      }
    ];

    // Add goal line if available
    if (goalLine && startWeight && targetWeight && startDate && goalDate && sortedData.length > 0) {
      const firstDate = new Date(startDate);
      const goalDateObj = new Date(goalDate);
      const lastWeightDate = new Date(sortedData[sortedData.length - 1].fullDate);
      goalDateObj.setHours(0, 0, 0, 0);
      lastWeightDate.setHours(0, 0, 0, 0);

      // Calculate where you should be at the last weight data point based on your weight loss plan
      const totalWeightLoss = parseFloat(startWeight) - parseFloat(targetWeight);
      const totalDays = (goalDateObj - firstDate) / (1000 * 60 * 60 * 24);
      const dailyWeightLoss = totalDays > 0 ? totalWeightLoss / totalDays : 0;

      // Create goal line data points that span the same date range as the weight data
      const firstWeightDataDate = new Date(sortedData[0].fullDate);
      const lastWeightDataDate = new Date(sortedData[sortedData.length - 1].fullDate);

      const daysFromStartToFirst = (firstWeightDataDate - firstDate) / (1000 * 60 * 60 * 24);
      const daysFromStartToLast = (lastWeightDataDate - firstDate) / (1000 * 60 * 60 * 24);

      const expectedWeightAtFirst = parseFloat(startWeight) - (dailyWeightLoss * daysFromStartToFirst);
      const expectedWeightAtLast = parseFloat(startWeight) - (dailyWeightLoss * daysFromStartToLast);

      const goalData = [
        {
          x: sortedData[0].date,
          y: expectedWeightAtFirst
        },
        {
          x: sortedData[sortedData.length - 1].date,
          y: expectedWeightAtLast
        }
      ];

      result.push({
        id: 'goal',
        color: theme.palette.secondary.main,
        data: goalData
      });
    }

    return result;
  }, [data, goalLine, startWeight, targetWeight, startDate, goalDate, theme.palette]);

  if (chartData.length === 0) {
    return (
      <Card sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        border: 'none'
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
              No weight data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{
      width: '100%',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      border: 'none'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ height: isMobile ? 250 : 300 }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: isMobile ? -45 : 0,
              tickValues: chartData[0]?.data?.filter((_, index) => index % 7 === 0).map(d => d.x) || []
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: `Weight (${unit})`,
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            enableGridX={true}
            enableGridY={true}
            gridXValues={chartData[0]?.data?.map(d => d.x) || []}
            gridYValues={5}
            colors={chartData.map(serie => serie.color)}
            lineWidth={isMobile ? 2 : 3}
            pointSize={isMobile ? 4 : 6}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableArea={false}
            useMesh={true}
            enableSlices={false}
            tooltip={({ point }) => {
              // Find the corresponding weight point for the same date
              const weightPoint = chartData.find(serie => serie.id === 'weight')?.data.find(d => d.x === point.data.x);
              const goalPoint = chartData.find(serie => serie.id === 'goal')?.data.find(d => d.x === point.data.x);

              return (
                <div style={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 6,
                  padding: 12,
                  boxShadow: theme.shadows[4],
                  minWidth: 120,
                  color: theme.palette.text.primary,
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {point?.data?.x || 'Unknown Date'}
                  </div>
                  {weightPoint && (
                    <div style={{ color: theme.palette.primary.main, fontWeight: 500, marginBottom: 2 }}>
                      Weight: {weightPoint.y.toFixed(1)} {unit}
                    </div>
                  )}
                  {goalPoint && (
                    <div style={{ color: theme.palette.secondary.main, fontWeight: 500 }}>
                      Goal: {goalPoint.y.toFixed(1)} {unit}
                    </div>
                  )}
                </div>
              );
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12
                  }
                },
                legend: {
                  text: {
                    fill: theme.palette.text.primary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 600
                  }
                }
              },
              grid: {
                line: {
                  stroke: theme.palette.divider,
                  strokeWidth: 1,
                  opacity: 0.3
                }
              },
              tooltip: {
                container: {
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow: theme.shadows[4]
                }
              }
            }}
            curve="monotoneX"
            enablePointLabel={false}
            pointLabel="y"
            pointLabelFormat=".1f"
            crosshairType="cross"
          />
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 2, backgroundColor: theme.palette.primary.main }} />
            <Typography variant="caption">Weight</Typography>
          </Box>
          {goalLine && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 2, backgroundColor: theme.palette.secondary.main }} />
              <Typography variant="caption">Goal</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeightChartNivo;