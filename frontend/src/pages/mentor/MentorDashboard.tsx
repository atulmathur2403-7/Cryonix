import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, useTheme, Skeleton, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp, People, AccessTime, Star, EventNote, AttachMoney,
  FiberManualRecord,
} from '@mui/icons-material';
import { dashboardApi, mentorApi, bookingApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const MentorDashboard: React.FC = () => {
  const theme = useTheme();
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [presence, setPresence] = useState<string>('OFFLINE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardApi.getMentorSummary(range),
      dashboardApi.getMentorBookings(0, 5),
      dashboardApi.getMentorSessions(0, 5),
      mentorApi.getPresence(),
    ]).then(([sumRes, bookRes, sessRes, presRes]) => {
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (bookRes.status === 'fulfilled') setRecentBookings(bookRes.value.data?.content || []);
      if (sessRes.status === 'fulfilled') setRecentSessions(sessRes.value.data?.content || []);
      if (presRes.status === 'fulfilled') setPresence(presRes.value.data?.status || 'OFFLINE');
    }).finally(() => setLoading(false));
  }, [range]);

  const togglePresence = async () => {
    try {
      if (presence === 'LIVE') {
        await mentorApi.setPresenceOffline();
        setPresence('OFFLINE');
      } else {
        await mentorApi.setPresenceLive();
        setPresence('LIVE');
      }
    } catch {}
  };

  const kpiCards = [
    { label: 'Total Sessions', value: summary?.totalSessions ?? '-', icon: <EventNote />, color: theme.palette.primary.main },
    { label: 'Total Earnings', value: summary?.totalEarnings != null ? `₹${summary.totalEarnings.toLocaleString()}` : '-', icon: <AttachMoney />, color: '#34C759' },
    { label: 'Avg Rating', value: summary?.avgRating != null ? summary.avgRating.toFixed(1) : '-', icon: <Star />, color: '#FF9500' },
    { label: 'Total Learners', value: summary?.totalLearners ?? '-', icon: <People />, color: '#7C5CFC' },
    { label: 'Total Minutes', value: summary?.totalMinutes ?? '-', icon: <AccessTime />, color: '#FF3B30' },
    { label: 'Total Reviews', value: summary?.totalReviews ?? '-', icon: <TrendingUp />, color: '#007AFF' },
  ];

  return (
    <AnimatedPage>
      <Box>
        {/* Header */}
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 4, gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Mentor Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Track your performance and manage sessions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<FiberManualRecord sx={{ fontSize: 12, color: presence === 'LIVE' ? '#4caf50' : '#bbb' }} />}
                label={presence === 'LIVE' ? 'You are LIVE' : 'You are Offline'}
                onClick={togglePresence}
                variant="outlined"
                sx={{ fontWeight: 600, cursor: 'pointer', borderColor: presence === 'LIVE' ? '#4caf50' : 'divider' }}
              />
              <ToggleButtonGroup value={range} exclusive onChange={(_, v) => v && setRange(v)} size="small">
                <ToggleButton value="7d">7d</ToggleButton>
                <ToggleButton value="30d">30d</ToggleButton>
                <ToggleButton value="60d">60d</ToggleButton>
                <ToggleButton value="90d">90d</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </FadeIn>

        {/* KPI Cards */}
        <FadeIn delay={100}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {kpiCards.map((kpi, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 2.5, textAlign: 'center', borderRadius: 3 }}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                  ) : (
                    <>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                        {React.cloneElement(kpi.icon, { sx: { color: kpi.color, fontSize: 22 } })}
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

        {/* Recent Bookings & Sessions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FadeIn delay={200}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Bookings</Typography>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
                ) : recentBookings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No bookings yet</Typography>
                ) : (
                  recentBookings.map((b: any, i: number) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: i < recentBookings.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{b.learnerName || `Learner #${b.learnerId}`}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {b.bookingType} &middot; {b.durationMinutes}min
                        </Typography>
                      </Box>
                      <Chip size="small" label={b.status}
                        color={b.status === 'CONFIRMED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'default'}
                      />
                    </Box>
                  ))
                )}
              </Paper>
            </FadeIn>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FadeIn delay={300}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Sessions</Typography>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
                ) : recentSessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No sessions yet</Typography>
                ) : (
                  recentSessions.map((s: any, i: number) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: i < recentSessions.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{s.learnerName || `Session #${s.sessionId}`}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.startTime ? new Date(s.startTime).toLocaleDateString() : 'Pending'}
                        </Typography>
                      </Box>
                      <Chip size="small" label={s.status}
                        color={s.status === 'COMPLETED' ? 'success' : s.status === 'IN_PROGRESS' ? 'info' : 'default'}
                      />
                    </Box>
                  ))
                )}
              </Paper>
            </FadeIn>
          </Grid>
        </Grid>
      </Box>
    </AnimatedPage>
  );
};

export default MentorDashboard;
