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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Chip,
  Slider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Download, PhoneInTalk, Payments, AccessTime, Close, Star } from '@mui/icons-material';
import { sampleCallHistory } from '../data/mockData';
import { CallHistory } from '../types';
import { AnimatedPage, glassSx, FadeIn, AnimatedCounter } from '../components/animations';
import { TableSkeleton } from '../components/Skeletons';

const CallHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [callHistory, setCallHistory] = useState<CallHistory[]>(sampleCallHistory);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; record: CallHistory | null }>({ open: false, record: null });
  const [reviewData, setReviewData] = useState({ rating: 0, review: '', communication: 50, knowledge: 50, helpfulness: 50 });
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleOpenReview = (record: CallHistory) => {
    setReviewData({ rating: 0, review: '', communication: 50, knowledge: 50, helpfulness: 50 });
    setReviewDialog({ open: true, record });
  };

  const handleSubmitReview = () => {
    if (!reviewDialog.record) return;
    setCallHistory((prev) =>
      prev.map((r) =>
        r.id === reviewDialog.record!.id ? { ...r, rated: true, rating: reviewData.rating } : r
      )
    );
    setReviewDialog({ open: false, record: null });
    setSnackOpen(true);
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Call History
      </Typography>

      {/* Summary Stats */}
      <FadeIn delay={100}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {[
          { icon: <PhoneInTalk sx={{ fontSize: 24 }} />, value: callHistory.length, label: 'Total Calls', color: '#007AFF' },
          { icon: <Payments sx={{ fontSize: 24 }} />, value: callHistory.reduce((s, r) => s + r.payment, 0), label: 'Total Spent', color: '#34C759', prefix: '$' },
          { icon: <AccessTime sx={{ fontSize: 24 }} />, value: callHistory.length * 30, label: 'Minutes', color: '#FF9500', suffix: ' min' },
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
            {callHistory.map((record) => (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {record.rating}
                      </Typography>
                    </Box>
                  ) : (
                    <Button variant="text" color="error" size="small" sx={{ fontWeight: 600 }} onClick={() => handleOpenReview(record)}>
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

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, record: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          Rate {reviewDialog.record?.mentorName}
          <IconButton size="small" onClick={() => setReviewDialog({ open: false, record: null })}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {reviewDialog.record && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 1 }}>
              <Avatar src={reviewDialog.record.mentorAvatar} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography fontWeight={600}>{reviewDialog.record.mentorName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {reviewDialog.record.service} · {reviewDialog.record.date}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Overall Rating</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Rating
              value={reviewData.rating}
              onChange={(_, v) => setReviewData({ ...reviewData, rating: v || 0 })}
              size="large"
              precision={0.5}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {reviewData.rating > 0 ? reviewData.rating + '/5' : 'Tap to rate'}
            </Typography>
          </Box>

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Your Review</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="How was your experience with this mentor?"
            value={reviewData.review}
            onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>Additional Ratings</Typography>
          {[
            { key: 'communication' as const, label: 'Communication', emoji: '💬' },
            { key: 'knowledge' as const, label: 'Subject Knowledge', emoji: '🧠' },
            { key: 'helpfulness' as const, label: 'Helpfulness', emoji: '🤝' },
          ].map((item) => (
            <Box key={item.key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{item.emoji} {item.label}</Typography>
                <Chip label={`${reviewData[item.key]}%`} size="small" color={reviewData[item.key] >= 70 ? 'success' : reviewData[item.key] >= 40 ? 'warning' : 'error'} sx={{ fontWeight: 700, height: 22 }} />
              </Box>
              <Slider
                value={reviewData[item.key]}
                onChange={(_, v) => setReviewData({ ...reviewData, [item.key]: v as number })}
                min={0}
                max={100}
                sx={{ '& .MuiSlider-thumb': { width: 16, height: 16 } }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReviewDialog({ open: false, record: null })} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={reviewData.rating === 0}
            sx={{ borderRadius: 3, px: 4, fontWeight: 700 }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ borderRadius: 3 }}>Review submitted successfully!</Alert>
      </Snackbar>
    </Box>
    </AnimatedPage>
  );
};

export default CallHistoryPage;
