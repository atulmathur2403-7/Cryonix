import React from 'react';
import { AnimatedPage } from '../components/animations';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  LinearProgress,
  useTheme,
  Chip,
} from '@mui/material';
import { sampleReviews, sampleMentors } from '../data/mockData';

const ReviewsList: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const theme = useTheme();
  const mentor = sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0];
  const reviews = sampleReviews;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.floor(r.rating) === star).length,
    percent: (reviews.filter((r) => Math.floor(r.rating) === star).length / reviews.length) * 100,
  }));

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Reviews for {mentor.name}
      </Typography>

      {/* Rating Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 4,
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
          <Typography variant="h2" fontWeight={700} color="primary">
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

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label="All Reviews" color="primary" />
        <Chip label="5 Stars" variant="outlined" />
        <Chip label="4 Stars" variant="outlined" />
        <Chip label="3 Stars" variant="outlined" />
        <Chip label="Recent" variant="outlined" />
      </Box>

      {/* Reviews List */}
      {reviews.map((review) => (
        <Paper
          key={review.id}
          elevation={0}
          sx={{
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40 }}>{review.learnerName[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>{review.learnerName}</Typography>
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
          <Typography variant="body2">{review.text}</Typography>
        </Paper>
      ))}
    </Box>
    </AnimatedPage>
  );
};

export default ReviewsList;
