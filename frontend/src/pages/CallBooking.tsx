import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import { Sensors, CalendarMonth } from '@mui/icons-material';
import { sampleMentors } from '../data/mockData';
import { AnimatedPage, FadeIn } from '../components/animations';

const CallBooking: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const mentor = sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0];

  const [selectedDate, setSelectedDate] = useState('2025-04-27');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  const handleTalkNow = () => {
    navigate(`/call/live/session-new`);
  };

  const handleBookCall = () => {
    setShowAuthModal(true);
  };

  const handleAuthSubmit = () => {
    setShowAuthModal(false);
    navigate('/payment/new');
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        <Box component="span" sx={{ color: 'primary.main' }}>
          Call
        </Box>{' '}
        {mentor.name}
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Live Status Section */}
      {mentor.isLive && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                Live Status:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sensors sx={{ color: '#4CAF50', animation: 'pulse 1.5s infinite' }} />
                <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  The Mentor is Live
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleTalkNow}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#388E3C' },
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              Talk Now!
            </Button>
          </Paper>
          <Divider sx={{ mb: 3 }} />
        </>
      )}

      {/* Book A Call Date Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
          Book A Call Date:
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Set Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Set Time
            </Typography>
            <TextField
              type="time"
              fullWidth
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleBookCall}
          sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
        >
          Book Call
        </Button>
      </Paper>

      {/* Auth Modal */}
      <Dialog
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          We just need a quick account to book your session and send your call link.
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            placeholder="Enter your name"
            sx={{ mb: 2, mt: 1 }}
            value={authData.name}
            onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email / Phone"
            placeholder="Enter your E-mail / Contact No."
            helperText="🔒 Secure, never shared"
            sx={{ mb: 2 }}
            value={authData.email}
            onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="OTP / Password"
            type="password"
            placeholder="Password"
            sx={{ mb: 2 }}
            value={authData.password}
            onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
          />
          <Divider sx={{ my: 2 }}>OR</Divider>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Login with:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" sx={{ borderRadius: 5 }}>
              Google
            </Button>
            <Button variant="outlined" size="small" sx={{ borderRadius: 5 }}>
              Facebook
            </Button>
            <Button variant="outlined" size="small" sx={{ borderRadius: 5 }}>
              Apple
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Note: "Your info is private & secure"
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAuthModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAuthSubmit}>
            Continue with Your Call
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
    </AnimatedPage>
  );
};

export default CallBooking;
