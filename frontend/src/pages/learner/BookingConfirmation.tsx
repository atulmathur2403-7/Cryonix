import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { sampleMentors } from '../../data/mockData';
import { AnimatedPage, glassSx } from '../../components/animations';
import { bookingApi, mentorApi } from '../../services/api';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { sessionId } = useParams<{ sessionId: string }>();
  const fallbackMentor = sampleMentors[0];
  const [mentor, setMentor] = useState<{ name: string; avatar: string; followers: string }>({
    name: fallbackMentor.name,
    avatar: fallbackMentor.avatar,
    followers: '55k Followers',
  });
  const [booking, setBooking] = useState<{ date: string; payment: string; status: string }>({
    date: '27th April 2025',
    payment: '$100 USD',
    status: 'Confirmed',
  });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Try to load booking details from learner bookings
    bookingApi.getLearnerBookings()
      .then((res) => {
        const bookings = res.data.content || res.data;
        const found = (Array.isArray(bookings) ? bookings : []).find(
          (b: any) => String(b.bookingId || b.id) === sessionId
        );
        if (found) {
          setBooking({
            date: found.bookingTime ? new Date(found.bookingTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '27th April 2025',
            payment: found.totalAmount ? `$${Number(found.totalAmount)} USD` : '$100 USD',
            status: found.status || 'Confirmed',
          });
          if (found.mentorId) {
            mentorApi.getById(String(found.mentorId)).then((mRes) => {
              const m = mRes.data;
              setMentor({
                name: m.name || m.fullName || fallbackMentor.name,
                avatar: m.profilePic || m.profileImageUrl || fallbackMentor.avatar,
                followers: m.bookingsCount ? `${m.bookingsCount} Sessions` : '55k Followers',
              });
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [sessionId]);

  const handleCancel = async () => {
    if (!sessionId) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(sessionId, { refundDestination: 'ORIGINAL', reason: 'User cancelled' });
      setBooking((prev) => ({ ...prev, status: 'Cancelled' }));
    } catch {
      // ignore
    } finally {
      setCancelling(false);
    }
  };

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
                <Typography fontWeight={600} color="success.main">{booking.status}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Call Date:</Typography>
                <Typography fontWeight={600} color="success.main">{booking.date}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Mentor Name:</Typography>
                <Typography fontWeight={600} color="success.main">{mentor.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Payment done:</Typography>
                <Typography fontWeight={600} color="success.main">{booking.payment}</Typography>
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
              {mentor.followers}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {mentor.name}
            </Typography>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="contained" fullWidth onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <CircularProgress size={20} /> : 'Cancel Booking'}
            </Button>
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
