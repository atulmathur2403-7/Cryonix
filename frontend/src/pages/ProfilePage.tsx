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
} from '@mui/material';
import {
  Edit,
  Dashboard,
  Star,
  Bookmark,
  CalendarMonth,
  CheckCircle,
} from '@mui/icons-material';
import { currentUser } from '../data/mockData';
import { AnimatedPage, FadeIn } from '../components/animations';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions = [
    { icon: <Edit />, label: 'Edit Profile', path: '/profile' },
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Star />, label: 'See my Reviews', path: '/call-history' },
    { icon: <Bookmark />, label: 'Saved Videos', path: '/videos' },
  ];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
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
                }}
              >
                {currentUser.fullName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {currentUser.fullName}
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
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
                    <IconButton
                      sx={{
                        bgcolor: theme.palette.primary.main + '15',
                        color: theme.palette.primary.main,
                        mb: 1,
                      }}
                    >
                      {action.icon}
                    </IconButton>
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
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
