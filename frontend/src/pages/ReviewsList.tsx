import React, { useState, useEffect } from 'react';
import { AnimatedPage, glassSx, gradientTextSx } from '../components/animations';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  LinearProgress,
  useTheme,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import { ThumbUp, Verified, ArrowBack, RateReview } from '@mui/icons-material';
import { sampleReviews, sampleMentors } from '../data/mockData';
import { ReviewCardSkeleton } from '../components/Skeletons';

const ReviewsList: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const mentor = sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0];
  const reviews = sampleReviews;

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [mentorId]);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.floor(r.rating) === star).length,
    percent: (reviews.filter((r) => Math.floor(r.rating) === star).length / reviews.length) * 100,
  }));

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back</Button>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.03em' }}>
            Reviews for {mentor.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            See what learners have to say about their experience
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RateReview />}
          onClick={() => navigate(`/review/${mentor.id}`)}
          sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
        >
          Write a Review
        </Button>
      </Box>

      {/* Rating Summary */}
      {loading ? (
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: 3 }} />
        </Box>
      ) : (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 4,
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
          <Typography variant="h2" fontWeight={700} sx={{ ...gradientTextSx(theme.palette.primary.main, '#7C5CFC') }}>
            {avgRating.toFixed(1)}
          </Typography>
          <Rating value={avgRating} precision={0.1} readOnly size="large" />
          <Typography variant="body2" color="text.secondary">
            {reviews.length} reviews
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          {ratingBreakdown.map((rb) => (
            <Box key={rb.star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" sx={{ width: 20 }}>
                {rb.star}★
              </Typography>
              <LinearProgress
                variant="determinate"
                value={rb.percent}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.action.hover,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ width: 30 }}>
                {rb.count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      )}

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label="All Reviews" color="primary" />
        <Chip label="5 Stars" variant="outlined" />
        <Chip label="4 Stars" variant="outlined" />
        <Chip label="3 Stars" variant="outlined" />
        <Chip label="Recent" variant="outlined" />
      </Box>

      {/* Reviews List */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <ReviewCardSkeleton key={i} />)
      ) : (
      reviews.map((review) => (
        <Paper
          key={review.id}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            ...glassSx(theme.palette.mode === 'dark'),
            mb: 2,
            transition: 'all 0.3s ease',
            '&:hover': { borderColor: theme.palette.primary.main + '40', transform: 'translateY(-2px)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: theme.palette.primary.main + '20', color: theme.palette.primary.main, fontWeight: 600 }}>{review.learnerName[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography fontWeight={600}>{review.learnerName}</Typography>
                <Verified sx={{ fontSize: 14, color: '#007AFF' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Rating value={review.rating} precision={0.5} readOnly size="small" />
          </Box>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>{review.text}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" startIcon={<ThumbUp sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              Helpful ({Math.floor(Math.random() * 20) + 1})
            </Button>
          </Box>
        </Paper>
      ))
      )}
    </Box>
    </AnimatedPage>
  );
};

export default ReviewsList;
