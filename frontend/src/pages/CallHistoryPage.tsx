import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Avatar,
  Button,
  useTheme,
} from '@mui/material';
import { Download, PhoneInTalk, Payments, AccessTime } from '@mui/icons-material';
import { sampleCallHistory } from '../data/mockData';
import { AnimatedPage, glassSx, FadeIn, AnimatedCounter } from '../components/animations';
import { TableSkeleton } from '../components/Skeletons';

const CallHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Call History
      </Typography>

      {/* Summary Stats */}
      <FadeIn delay={100}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {[
          { icon: <PhoneInTalk sx={{ fontSize: 24 }} />, value: sampleCallHistory.length, label: 'Total Calls', color: '#007AFF' },
          { icon: <Payments sx={{ fontSize: 24 }} />, value: sampleCallHistory.reduce((s, r) => s + r.payment, 0), label: 'Total Spent', color: '#34C759', prefix: '$' },
          { icon: <AccessTime sx={{ fontSize: 24 }} />, value: sampleCallHistory.length * 30, label: 'Minutes', color: '#FF9500', suffix: ' min' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: 2.5, borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              display: 'flex', alignItems: 'center', gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${stat.color}12` },
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: stat.color + '15', color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
                <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
              </Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
      </FadeIn>

      {loading ? (
        <Box sx={{ mb: 3 }}><TableSkeleton rows={5} columns={8} /></Box>
      ) : (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mentor Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Service Taken</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subjects/Topics</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rate Mentor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleCallHistory.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={record.mentorAvatar} sx={{ width: 32, height: 32 }} />
                    {record.mentorName}
                  </Box>
                </TableCell>
                <TableCell>{record.service}</TableCell>
                <TableCell>{record.subject}</TableCell>
                <TableCell>${record.payment}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>
                  {record.rated ? (
                    <Typography variant="body2" sx={{ color: 'primary.main' }}>
                      Rated
                    </Typography>
                  ) : (
                    <Button variant="text" color="error" size="small" sx={{ fontWeight: 600 }}>
                      Rate now
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<Download fontSize="small" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Download Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      )}

      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Return to Your Dashboard
      </Button>
    </Box>
    </AnimatedPage>
  );
};

export default CallHistoryPage;
