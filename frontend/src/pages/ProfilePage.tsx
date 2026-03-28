import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Dashboard,
  Star,
  Bookmark,
  CalendarMonth,
  CheckCircle,
  Verified,
  EmojiEvents,
} from '@mui/icons-material';
import { currentUser as defaultUser } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { AnimatedPage, FadeIn, glassSx, ProgressRing } from '../components/animations';

const TOOLTIP_PROPS = {
  arrow: true,
  enterDelay: 400,
  leaveDelay: 100,
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: 'rgba(30,30,30,0.95)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      },
    },
    arrow: {
      sx: { color: 'rgba(30,30,30,0.95)' },
    },
  },
} as const;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useUser();
  const currentUser = { ...defaultUser, ...user };

  const quickActions = [
    { icon: <Edit />, label: 'Edit Profile', path: '/profile' },
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Star />, label: 'See my Reviews', path: '/call-history' },
    { icon: <Bookmark />, label: 'Saved Videos', path: '/videos' },
  ];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1060, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        My Profile
      </Typography>

      {/* Profile Completion Banner */}
      <FadeIn delay={100}>
      <Paper
        elevation={0}
        sx={{
          p: 3, borderRadius: 4, mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main || '#7C5CFC'}08)`,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap',
        }}
      >
        <ProgressRing value={75} size={64} strokeWidth={5} color={theme.palette.primary.main}>
          <Typography variant="body2" fontWeight={700}>75%</Typography>
        </ProgressRing>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="body1" fontWeight={600}>Profile 75% Complete</Typography>
          <Typography variant="body2" color="text.secondary">Add a profile photo and verify your email to complete your profile</Typography>
        </Box>
        <Chip icon={<EmojiEvents />} label="Member since 2024" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      </Paper>
      </FadeIn>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                  fontSize: 32,
                  border: `3px solid ${theme.palette.primary.main}30`,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'scale(1.08)', borderColor: theme.palette.primary.main },
                }}
              >
                {currentUser.fullName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {currentUser.fullName} <Verified sx={{ fontSize: 16, color: 'primary.main', verticalAlign: 'middle', ml: 0.5 }} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {currentUser.interests.map((interest) => (
                    <Chip
                      key={interest}
                      label={interest}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: theme.palette.primary.main + '50' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Bio */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              My Bio:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser.bio}
            </Typography>
          </Paper>

          {/* Quick Actions */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid size={{ xs: 6, sm: 3 }} key={action.label}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.primary.main + '10',
                      },
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <Tooltip title={action.label} {...TOOLTIP_PROPS}>
                      <IconButton
                        sx={{
                          bgcolor: theme.palette.primary.main + '15',
                          color: theme.palette.primary.main,
                          mb: 1,
                        }}
                      >
                        {action.icon}
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption" display="block">
                      {action.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Stats */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
              Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarMonth color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sessions Booked
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {currentUser.sessionsBooked}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sessions Completed
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {currentUser.sessionsCompleted}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Star sx={{ color: '#FFD700' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Rating Given
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {currentUser.avgRatingGiven}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default ProfilePage;
