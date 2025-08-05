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
    if (goalLine && startWeight && targetWeight && startDate && goalDate) {
      const firstDate = new Date(startDate);
      const goalDateObj = new Date(goalDate);
      goalDateObj.setHours(0, 0, 0, 0);

      // Create goal line data points that span the entire goal period
      const goalStartDate = new Date(firstDate);
      const goalEndDate = new Date(goalDateObj);

      // Format dates for the chart
      const startDateFormatted = goalStartDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const endDateFormatted = goalEndDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      const goalData = [
        {
          x: startDateFormatted,
          y: parseFloat(startWeight)
        },
        {
          x: endDateFormatted,
          y: parseFloat(targetWeight)
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

  // Generate appropriate date labels for the goal period
  const getGoalDateLabels = () => {
    if (!goalLine || !startDate || !goalDate) return [];

    console.log('Goal dates:', { startDate, goalDate }); // Debug

    // Parse dates - they're already in ISO format
    const start = new Date(startDate);
    const end = new Date(goalDate);

    if (!start || !end) return [];

    console.log('Parsed dates:', {
      start: start.toISOString(),
      end: end.toISOString(),
      startFormatted: start.toLocaleDateString('en-US'),
      endFormatted: end.toLocaleDateString('en-US')
    }); // Debug

    // Instead of generating labels for the entire goal period,
    // let's use the actual data range to determine the chart axis
    const dataDates = data.map(item => new Date(item.log_date)).sort((a, b) => a - b);
    const dataStart = dataDates[0];
    const dataEnd = dataDates[dataDates.length - 1];

    console.log('Data date range:', {
      dataStart: dataStart?.toISOString(),
      dataEnd: dataEnd?.toISOString()
    }); // Debug

    // Use the actual data range for the chart axis
    const chartStart = dataStart || start;
    const chartEnd = dataEnd || end;

    const totalDays = Math.ceil((chartEnd - chartStart) / (1000 * 60 * 60 * 24));

    console.log('Chart date range:', {
      chartStart: chartStart.toISOString(),
      chartEnd: chartEnd.toISOString(),
      totalDays
    }); // Debug

    // Determine appropriate number of labels based on chart duration
    let labelCount;
    if (totalDays <= 7) {
      labelCount = totalDays; // Show every day for short periods
    } else if (totalDays <= 30) {
      labelCount = Math.min(10, totalDays); // Up to 10 labels for month-long periods
    } else if (totalDays <= 90) {
      labelCount = Math.min(15, totalDays); // Up to 15 labels for quarter-long periods
    } else {
      labelCount = Math.min(20, totalDays); // Up to 20 labels for longer periods
    }

    const labels = [];
    const step = Math.max(1, Math.floor(totalDays / labelCount));

    console.log('Label generation:', { totalDays, labelCount, step }); // Debug

    for (let i = 0; i <= totalDays; i += step) {
      const date = new Date(chartStart);
      date.setDate(chartStart.getDate() + i);
      const label = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      labels.push(label);
      console.log(`Generated label ${i}:`, { date: date.toISOString(), label }); // Debug
    }

    // Always include the end date
    const endFormatted = chartEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    if (!labels.includes(endFormatted)) {
      labels.push(endFormatted);
      console.log('Added end date label:', endFormatted); // Debug
    }

    console.log('All generated labels:', labels); // Debug
    return labels;
  };

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
            margin={{ top: 20, right: 30, left: 70, bottom: 50 }}
            xScale={{
              type: 'point',
              ...(goalLine && startDate && goalDate ? {
                domain: getGoalDateLabels()
              } : {})
            }}
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
              tickValues: getGoalDateLabels()
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
            gridXValues={goalLine ? getGoalDateLabels() : (chartData[0]?.data?.map(d => d.x) || [])}
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