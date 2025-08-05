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

const BPChartNivo = ({ data, unit = 'mmHg' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Smart algorithm to determine optimal tick frequency
  const getOptimalTickValues = (dataPoints) => {
    if (!dataPoints || dataPoints.length === 0) return [];

    const totalPoints = dataPoints.length;
    const firstDate = new Date(dataPoints[0].fullDate);
    const lastDate = new Date(dataPoints[dataPoints.length - 1].fullDate);
    const daysSpan = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));

    // Determine optimal number of labels based on time span and data density
    let optimalLabels;

    if (daysSpan <= 7) {
      // Week or less: show all points (up to 7)
      optimalLabels = Math.min(totalPoints, 7);
    } else if (daysSpan <= 30) {
      // Month: show every 3-5 days
      optimalLabels = Math.min(Math.ceil(totalPoints / 3), 10);
    } else if (daysSpan <= 90) {
      // Quarter: show every 7-10 days
      optimalLabels = Math.min(Math.ceil(totalPoints / 5), 12);
    } else if (daysSpan <= 365) {
      // Year: show every 2-4 weeks
      optimalLabels = Math.min(Math.ceil(totalPoints / 10), 15);
    } else {
      // More than a year: show monthly or quarterly
      optimalLabels = Math.min(Math.ceil(totalPoints / 20), 20);
    }

    // Ensure we have at least 2 labels and at most totalPoints
    optimalLabels = Math.max(2, Math.min(optimalLabels, totalPoints));

    // Calculate step size to distribute labels evenly
    const step = Math.max(1, Math.floor(totalPoints / optimalLabels));

    // Generate tick values
    const tickValues = [];
    for (let i = 0; i < totalPoints; i += step) {
      tickValues.push(dataPoints[i].date);
    }

    // Always include the last point if it's not already included
    if (tickValues.length > 0 && tickValues[tickValues.length - 1] !== dataPoints[dataPoints.length - 1].date) {
      tickValues.push(dataPoints[dataPoints.length - 1].date);
    }

    return tickValues;
  };

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
        systolic: parseFloat(item.systolic),
        diastolic: parseFloat(item.diastolic),
        fullDate: item.log_date
      }));

    const result = [
      {
        id: 'systolic',
        color: theme.palette.error.main,
        data: sortedData.map(item => ({
          x: item.date,
          y: item.systolic
        }))
      },
      {
        id: 'diastolic',
        color: theme.palette.info.main, // Changed from warning (yellow) to info (blue)
        data: sortedData.map(item => ({
          x: item.date,
          y: item.diastolic
        }))
      },
      // Add normal range reference lines
      {
        id: 'normal-systolic',
        color: theme.palette.success.main,
        data: sortedData.map(item => ({
          x: item.date,
          y: 120 // Normal systolic upper bound
        }))
      },
      {
        id: 'normal-diastolic',
        color: theme.palette.success.main,
        data: sortedData.map(item => ({
          x: item.date,
          y: 80 // Normal diastolic upper bound
        }))
      }
    ];

    return result;
  }, [data, theme.palette]);

  // Get optimal tick values
  const optimalTickValues = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data]
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
      .map(item => ({
        date: new Date(item.log_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        fullDate: item.log_date
      }));

    return getOptimalTickValues(sortedData);
  }, [data]);

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
              No blood pressure data available
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
        <Box sx={{ height: isMobile ? 200 : 220 }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 60,
              max: 180,
              stacked: false
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: isMobile ? -30 : 0,
              tickValues: optimalTickValues
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: `Blood Pressure (${unit})`,
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            enableGridX={true}
            enableGridY={true}
            gridXValues={chartData[0]?.data?.map(d => d.x) || []}
            gridYValues={[60, 80, 90, 120, 130, 140, 160, 180]}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableArea={false}
            useMesh={true}
            enableSlices={false}
            // Make normal range lines less prominent
            colors={(serie) => {
              if (serie.id === 'normal-systolic' || serie.id === 'normal-diastolic') {
                return theme.palette.success.main + '40'; // Add transparency
              }
              return serie.color;
            }}
            lineWidth={(serie) => {
              if (serie.id === 'normal-systolic' || serie.id === 'normal-diastolic') {
                return 1;
              }
              return 10; // Much thicker for reading lines
            }}
            pointSize={(serie) => {
              if (serie.id === 'normal-systolic' || serie.id === 'normal-diastolic') {
                return 0; // Hide points for normal range lines
              }
              return isMobile ? 4 : 6;
            }}
            tooltip={({ point }) => {
              // Find all values for the same date
              const systolicPoint = chartData.find(serie => serie.id === 'systolic')?.data.find(d => d.x === point.data.x);
              const diastolicPoint = chartData.find(serie => serie.id === 'diastolic')?.data.find(d => d.x === point.data.x);

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
                  {systolicPoint && (
                    <div style={{ color: theme.palette.error.main, fontWeight: 500, marginBottom: 2 }}>
                      Systolic: {systolicPoint.y} {unit}
                    </div>
                  )}
                  {diastolicPoint && (
                    <div style={{ color: theme.palette.info.main, fontWeight: 500 }}>
                      Diastolic: {diastolicPoint.y} {unit}
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
            pointLabelFormat=".0f"
            crosshairType="cross"
            layers={[
              'grid',
              'axes',
              'areas',
              'lines',
              'points',
              'mesh',
              'legends',
              'annotations'
            ]}
            // Add shaded areas for normal ranges
            areaBaselineValue={0}
            areaOpacity={0.1}
            areaBlendMode="normal"
            // areaGenerator={() => {
            //   // Create shaded areas for normal BP ranges
            //   const normalSystolicArea = {
            //     id: 'normal-systolic',
            //     color: theme.palette.success.main,
            //     data: chartData[0]?.data?.map(point => ({
            //       x: point.x,
            //       y: 120 // Normal systolic upper bound
            //     })) || []
            //   };

            //   const normalDiastolicArea = {
            //     id: 'normal-diastolic',
            //     color: theme.palette.success.main,
            //     data: chartData[0]?.data?.map(point => ({
            //       x: point.x,
            //       y: 80 // Normal diastolic upper bound
            //     })) || []
            //   };

            //   return [normalSystolicArea, normalDiastolicArea];
            // }}
          />
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 2, backgroundColor: theme.palette.error.main }} />
            <Typography variant="caption">Systolic</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 2, backgroundColor: theme.palette.info.main }} />
            <Typography variant="caption">Diastolic</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 2, backgroundColor: theme.palette.success.main, borderTop: '2px dashed' }} />
            <Typography variant="caption">Normal Range</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BPChartNivo;