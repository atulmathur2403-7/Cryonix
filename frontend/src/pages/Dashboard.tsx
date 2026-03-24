import React, { useState } from 'react';
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
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import { sampleSessions } from '../data/mockData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mentorToggle, setMentorToggle] = useState(false);

  const upcomingSessions = sampleSessions.filter((s) => s.status === 'upcoming');
  const pastSessions = sampleSessions.filter((s) => s.status === 'completed');

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>
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

      {/* Upcoming Sessions */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
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

      {/* Past Sessions */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
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

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => navigate('/explore')}>
          Book New Sessions
        </Button>
        <Button variant="contained" onClick={() => navigate('/call-history')}>
          View Call / Chat History
        </Button>
        <Button variant="contained" onClick={() => navigate('/profile')}>
          Profile Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
