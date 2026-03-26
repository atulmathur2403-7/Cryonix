import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { sampleMentors } from '../data/mockData';
import { AnimatedPage, glassSx } from '../components/animations';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mentor = sampleMentors[0];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1060, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back to Dashboard</Button>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Booking Confirmed Successfully!
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Booking Details */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Booking status:</Typography>
                <Typography fontWeight={600} color="success.main">Confirmed</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Call Date:</Typography>
                <Typography fontWeight={600} color="success.main">27th April 2025</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Mentor Name:</Typography>
                <Typography fontWeight={600} color="success.main">{mentor.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Payment done:</Typography>
                <Typography fontWeight={600} color="success.main">$100 USD</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Additional Details */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 2,
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Submit More Details about meeting for Mentor (Optional)...."
              sx={{ mb: 2 }}
            />
            <Button variant="contained" size="small">Submit</Button>
          </Paper>

          <Button color="primary" sx={{ textDecoration: 'underline' }}>
            📥 Download Receipt
          </Button>
        </Box>

        {/* Right Side */}
        <Box sx={{ width: { xs: '100%', md: 280 } }}>
          {/* Mentor Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              textAlign: 'center',
              mb: 3,
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
              <Avatar src={mentor.avatar} sx={{ width: 80, height: 80 }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 14,
                  height: 14,
                  bgcolor: '#4CAF50',
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              55k Followers
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {mentor.name}
            </Typography>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="contained" fullWidth>Cancel Booking</Button>
            <Button variant="contained" fullWidth>Change Date</Button>
            <Button variant="contained" fullWidth>View Past Bookings</Button>
            <Button variant="contained" fullWidth onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
    </AnimatedPage>
  );
};

export default BookingConfirmation;
