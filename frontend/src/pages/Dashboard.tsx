import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Switch,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import {
  School,
  Timer,
  EmojiEvents,
  LocalFireDepartment,
} from '@mui/icons-material';
import { sampleSessions } from '../data/mockData';
import { AnimatedPage, FadeIn, RevealOnScroll, glassSx, AnimatedCounter, ProgressRing } from '../components/animations';
import { TableSkeleton } from '../components/Skeletons';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mentorToggle, setMentorToggle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const upcomingSessions = sampleSessions.filter((s) => s.status === 'upcoming');
  const pastSessions = sampleSessions.filter((s) => s.status === 'completed');

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <FadeIn delay={100}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 5 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
          Welcome back, Dear Learner!
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Want to Share your Expertise?
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 0.5, mb: 1 }}
            onClick={() => navigate('/become-mentor')}
          >
            Become a Mentor
          </Button>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={mentorToggle}
                  onChange={(e) => setMentorToggle(e.target.checked)}
                  color="primary"
                />
              }
              label="Toggle for Mentor Acc."
              labelPlacement="start"
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'primary.main' }}>
            (Only Active if learner has turned mentor)
          </Typography>
        </Box>
      </Box>
      </FadeIn>

      {/* Quick Stats Cards */}
      <FadeIn delay={150}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 5 }}>
        {[
          { icon: <School sx={{ fontSize: 28 }} />, value: 24, label: 'Sessions', color: '#007AFF', suffix: '' },
          { icon: <Timer sx={{ fontSize: 28 }} />, value: 36, label: 'Hours Learned', color: '#34C759', suffix: 'h' },
          { icon: <EmojiEvents sx={{ fontSize: 28 }} />, value: 4.8, label: 'Avg Rating', color: '#FF9500', suffix: '', decimals: 1 },
          { icon: <LocalFireDepartment sx={{ fontSize: 28 }} />, value: 7, label: 'Day Streak', color: '#FF3B30', suffix: '' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${stat.color}15` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: stat.color + '15', color: stat.color,
              }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={(stat as any).decimals || 0} />
                </Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
      </FadeIn>

      {/* Learning Progress */}
      <FadeIn delay={175}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        <ProgressRing value={68} size={72} strokeWidth={6} color={theme.palette.primary.main}>
          <Typography variant="body2" fontWeight={700}>68%</Typography>
        </ProgressRing>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="body1" fontWeight={600}>Weekly Learning Goal</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            You've completed 3.5 of 5 hours this week. Keep going!
          </Typography>
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: theme.palette.action.hover, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', borderRadius: 3, width: '68%', background: `linear-gradient(90deg, ${theme.palette.primary.main}, #7C5CFC)`, transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }} />
          </Box>
        </Box>
      </Paper>
      </FadeIn>

      {/* Quick Stats Cards */}
      <FadeIn delay={150}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 5 }}>
        {[
          { icon: <School sx={{ fontSize: 28 }} />, value: 24, label: 'Sessions', color: '#007AFF', suffix: '' },
          { icon: <Timer sx={{ fontSize: 28 }} />, value: 36, label: 'Hours Learned', color: '#34C759', suffix: 'h' },
          { icon: <EmojiEvents sx={{ fontSize: 28 }} />, value: 4.8, label: 'Avg Rating', color: '#FF9500', suffix: '', decimals: 1 },
          { icon: <LocalFireDepartment sx={{ fontSize: 28 }} />, value: 7, label: 'Day Streak', color: '#FF3B30', suffix: '' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${stat.color}15` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: stat.color + '15', color: stat.color,
              }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={(stat as any).decimals || 0} />
                </Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
      </FadeIn>

      {/* Learning Progress */}
      <FadeIn delay={175}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        <ProgressRing value={68} size={72} strokeWidth={6} color={theme.palette.primary.main}>
          <Typography variant="body2" fontWeight={700}>68%</Typography>
        </ProgressRing>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="body1" fontWeight={600}>Weekly Learning Goal</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            You've completed 3.5 of 5 hours this week. Keep going!
          </Typography>
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: theme.palette.action.hover, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', borderRadius: 3, width: '68%', background: `linear-gradient(90deg, ${theme.palette.primary.main}, #7C5CFC)`, transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }} />
          </Box>
        </Box>
      </Paper>
      </FadeIn>

      {/* Upcoming Sessions */}
      <FadeIn delay={200}>
      {loading ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Upcoming Sessions</Typography>
          <TableSkeleton rows={3} columns={5} />
        </Box>
      ) : (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            Upcoming Sessions
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mentor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingSessions.map((session) => (
              <TableRow key={session.id} hover>
                <TableCell>{session.date}</TableCell>
                <TableCell>{session.time}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={session.mentorAvatar} sx={{ width: 32, height: 32 }} />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          bgcolor: '#4CAF50',
                          borderRadius: '50%',
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    </Box>
                    {session.mentorName}
                  </Box>
                </TableCell>
                <TableCell>{session.subject}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                    onClick={() => navigate(`/call/live/${session.id}`)}
                  >
                    Join
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      )}
      </FadeIn>

      {/* Past Sessions */}
      <FadeIn delay={350}>
      {loading ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Past Sessions</Typography>
          <TableSkeleton rows={3} columns={5} />
        </Box>
      ) : (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            Past Sessions
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mentor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rating Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pastSessions.map((session) => (
              <TableRow key={session.id} hover>
                <TableCell>{session.date}</TableCell>
                <TableCell>{session.time}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={session.mentorAvatar} sx={{ width: 32, height: 32 }} />
                    {session.mentorName}
                  </Box>
                </TableCell>
                <TableCell>{session.subject}</TableCell>
                <TableCell>
                  {session.ratingGiven ? (
                    <Typography variant="body2" color="text.secondary">
                      Rated: {session.ratingGiven}
                    </Typography>
                  ) : (
                    <Button
                      variant="text"
                      size="small"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                      onClick={() => navigate(`/review/${session.mentorId}`)}
                    >
                      Rate Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      )}
      </FadeIn>

      {/* Action Buttons */}
      <FadeIn delay={500}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => navigate('/explore')} sx={{ borderRadius: 3, px: 3 }}>
          Book New Sessions
        </Button>
        <Button variant="outlined" onClick={() => navigate('/call-history')} sx={{ borderRadius: 3, px: 3 }}>
          View Call / Chat History
        </Button>
        <Button variant="outlined" onClick={() => navigate('/profile')} sx={{ borderRadius: 3, px: 3 }}>
          Profile Settings
        </Button>
      </Box>
      </FadeIn>
    </Box>
    </AnimatedPage>
  );
};

export default Dashboard;
