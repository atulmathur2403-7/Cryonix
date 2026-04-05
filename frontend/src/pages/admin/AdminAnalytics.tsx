import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, useTheme, Skeleton, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { TrendingUp, People, EventNote, AttachMoney } from '@mui/icons-material';
import { adminApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const AdminAnalytics: React.FC = () => {
  const theme = useTheme();
  const [range, setRange] = useState('30d');
  const [metric, setMetric] = useState('sessions');
  const [summary, setSummary] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      adminApi.getMentorSummary(range),
      adminApi.getMentorTimeseries(metric, range, 'daily'),
    ]).then(([sumRes, tsRes]) => {
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (tsRes.status === 'fulfilled') setTimeseries(tsRes.value.data || []);
    }).finally(() => setLoading(false));
  }, [range, metric]);

  const metrics = [
    { key: 'sessions', label: 'Sessions', icon: <EventNote />, color: '#FF9500' },
    { key: 'revenue', label: 'Revenue', icon: <AttachMoney />, color: '#34C759' },
    { key: 'users', label: 'Users', icon: <People />, color: '#1a3fc4' },
    { key: 'bookings', label: 'Bookings', icon: <TrendingUp />, color: '#7C5CFC' },
  ];

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Platform-wide analytics and trends
              </Typography>
            </Box>
            <ToggleButtonGroup value={range} exclusive onChange={(_, v) => v && setRange(v)} size="small">
              <ToggleButton value="7d">7d</ToggleButton>
              <ToggleButton value="30d">30d</ToggleButton>
              <ToggleButton value="60d">60d</ToggleButton>
              <ToggleButton value="90d">90d</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </FadeIn>

        {/* Metric Selector Cards */}
        <FadeIn delay={100}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {metrics.map((m) => (
              <Grid size={{ xs: 6, sm: 3 }} key={m.key}>
                <Paper
                  onClick={() => setMetric(m.key)}
                  sx={{
                    ...glassSx(theme.palette.mode === 'dark'), p: 2.5, textAlign: 'center', borderRadius: 3, cursor: 'pointer',
                    border: metric === m.key ? `2px solid ${m.color}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: m.color + '80' },
                  }}
                >
                  {loading ? (
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                  ) : (
                    <>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2, bgcolor: m.color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1,
                      }}>
                        {React.cloneElement(m.icon, { sx: { color: m.color, fontSize: 22 } })}
                      </Box>
                      <Typography variant="body2" fontWeight={700}>{m.label}</Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </FadeIn>

        {/* Timeseries Chart Area */}
        <FadeIn delay={200}>
          <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {metrics.find((m) => m.key === metric)?.label} Over Time
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
            ) : timeseries.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available for the selected period. Data will appear as the platform grows.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 240, px: 2, pb: 3 }}>
                {timeseries.map((point: any, i: number) => {
                  const max = Math.max(...timeseries.map((p: any) => p.value || 0), 1);
                  const height = ((point.value || 0) / max) * 200;
                  const activeMetric = metrics.find((m) => m.key === metric);
                  return (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: 10 }}>{point.value}</Typography>
                      <Box sx={{
                        width: '100%', maxWidth: 32, height, borderRadius: 1,
                        bgcolor: activeMetric?.color || theme.palette.primary.main,
                        opacity: 0.8, transition: 'height 0.3s',
                        '&:hover': { opacity: 1 },
                      }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, transform: 'rotate(-45deg)' }}>
                        {point.label || point.date}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </FadeIn>
      </Box>
    </AnimatedPage>
  );
};

export default AdminAnalytics;
