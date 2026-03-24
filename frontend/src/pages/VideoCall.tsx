import React, { useState, useEffect } from 'react';
import { AnimatedPage } from '../components/animations';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Videocam,
  Mic,
  CallEnd,
  ScreenShare,
  AttachFile,
  Image,
  Add,
  Send,
} from '@mui/icons-material';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(29 * 60 + 35);
  const [chatMessage, setChatMessage] = useState('');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} min ${s.toString().padStart(2, '0')} secs.`;
  };

  const handleEndCall = () => {
    navigate('/session/complete/session-1');
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Call Info Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">
          Call Connected with:{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Andrew Smith
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Time Remaining: {formatTime(timeRemaining)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        {/* Video Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              bgcolor: '#1a1a2e',
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Main video */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              }}
            >
              <Typography variant="h4" sx={{ color: 'white', opacity: 0.3 }}>
                Video Feed
              </Typography>

              {/* PIP */}
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 160,
                  height: 120,
                  bgcolor: '#2d3436',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', opacity: 0.5 }}>
                  You
                </Typography>
              </Paper>
            </Box>

            {/* Video Controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                py: 2,
                bgcolor: 'rgba(0,0,0,0.5)',
              }}
            >
              <IconButton
                onClick={() => setCameraOn(!cameraOn)}
                sx={{
                  bgcolor: cameraOn ? 'rgba(255,255,255,0.2)' : 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: cameraOn ? 'rgba(255,255,255,0.3)' : 'error.dark' },
                }}
              >
                <Videocam />
              </IconButton>
              <IconButton
                onClick={() => setMicOn(!micOn)}
                sx={{
                  bgcolor: micOn ? 'rgba(255,255,255,0.2)' : 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: micOn ? 'rgba(255,255,255,0.3)' : 'error.dark' },
                }}
              >
                <Mic />
              </IconButton>
              <IconButton
                onClick={handleEndCall}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 3,
                  borderRadius: 5,
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <CallEnd />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <ScreenShare />
              </IconButton>
            </Box>
          </Paper>
        </Box>

        {/* Chat Panel */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: 0, md: 300 },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography fontWeight={600}>Chat History:</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              Chat messages will appear here
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <IconButton size="small"><AttachFile fontSize="small" /></IconButton>
            <IconButton size="small"><Image fontSize="small" /></IconButton>
            <IconButton size="small"><Add fontSize="small" /></IconButton>
            <TextField
              size="small"
              placeholder="Send a Message..."
              fullWidth
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton size="small" color="primary"><Send fontSize="small" /></IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
    </AnimatedPage>
  );
};

export default VideoCall;
