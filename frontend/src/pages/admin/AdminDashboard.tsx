import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, useTheme, Skeleton, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { People, School, EventNote, TrendingUp, AttachMoney, AssessmentOutlined } from '@mui/icons-material';
import { adminApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getMentorSummary(range)
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const kpiCards = [
    { label: 'Total Users', value: summary?.totalUsers ?? '-', icon: <People />, color: '#1a3fc4' },
    { label: 'Total Mentors', value: summary?.totalMentors ?? '-', icon: <School />, color: '#7C5CFC' },
    { label: 'Total Sessions', value: summary?.totalSessions ?? '-', icon: <EventNote />, color: '#FF9500' },
    { label: 'Total Revenue', value: summary?.totalRevenue != null ? `₹${summary.totalRevenue.toLocaleString()}` : '-', icon: <AttachMoney />, color: '#34C759' },
    { label: 'Active Today', value: summary?.activeToday ?? '-', icon: <TrendingUp />, color: '#FF3B30' },
    { label: 'Total Bookings', value: summary?.totalBookings ?? '-', icon: <AssessmentOutlined />, color: '#007AFF' },
  ];

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Platform overview and key metrics
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

        {/* KPI Cards */}
        <FadeIn delay={100}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {kpiCards.map((kpi, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 2.5, textAlign: 'center', borderRadius: 3 }}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  ) : (
                    <>
                      <Box sx={{
                        width: 48, height: 48, borderRadius: 2,
                        bgcolor: kpi.color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 1.5,
                      }}>
                        {React.cloneElement(kpi.icon, { sx: { color: kpi.color, fontSize: 24 } })}
                      </Box>
                      <Typography variant="h5" fontWeight={800}>{kpi.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </FadeIn>

        {/* Placeholder sections */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FadeIn delay={200}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3, minHeight: 200 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Activity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Platform activity feed will appear here as sessions and bookings are created.
                </Typography>
              </Paper>
            </FadeIn>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FadeIn delay={300}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3, minHeight: 200 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Stats</Typography>
                <Typography variant="body2" color="text.secondary">
                  Charts and growth metrics will appear here as data accrues.
                </Typography>
              </Paper>
            </FadeIn>
          </Grid>
        </Grid>
      </Box>
    </AnimatedPage>
  );
};

export default AdminDashboard;
