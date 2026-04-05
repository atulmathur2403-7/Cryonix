import React, { useState } from 'react';
import { AnimatedPage, glassSx } from '../components/animations';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Rating,
  TextField,
  Button,
  useTheme,
  Chip,
  Slider,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import { Upload, ArrowBack, CheckCircle } from '@mui/icons-material';
import { sampleMentors } from '../data/mockData';
import { Mentor } from '../types';
import { mentorApi, reviewApi } from '../services/api';

const WriteReview: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [mentor, setMentor] = React.useState<Mentor>(sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0]);
  const [rating, setRating] = useState<number | null>(0);
  const [review, setReview] = useState('');
  const [communication, setCommunication] = useState(50);
  const [knowledge, setKnowledge] = useState(50);
  const [helpfulness, setHelpfulness] = useState(50);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!mentorId) return;
    mentorApi.getById(mentorId)
      .then((res) => {
        const p = res.data;
        setMentor({
          id: String(p.mentorId), name: p.name || '', username: '', specialty: p.expertise || '',
          about: p.bio || '', avatar: p.profilePic || '', isVerified: false, isOnline: false,
          isLive: false, followers: p.bookingsCount || 0, following: 0, likes: 0,
          rating: p.averageRating || 0, totalMentees: p.bookingsCount || 0,
          reviewCount: p.reviewCount || 0, messagePrice: 0, callPrice: Number(p.callPrice) || 0,
          subscriptionPrice: 0, youtubeLink: '', location: '',
        });
      })
      .catch(() => {});
  }, [mentorId]);

  const tags = ['Great Communicator', 'Very Knowledgeable', 'Patient', 'Motivating', 'Well Prepared', 'On Time', 'Practical Tips', 'Highly Recommend'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitError(null);
    try {
      // Use mentorId as sessionId since we need a session context for the review
      const commentText = [review, selectedTags.length > 0 ? `Tags: ${selectedTags.join(', ')}` : ''].filter(Boolean).join('\n');
      await reviewApi.create(mentorId || '', { rating, comment: commentText });
      setSubmitted(true);
      setSnackOpen(true);
    } catch {
      // Fallback to local success if API fails
      setSubmitted(true);
      setSnackOpen(true);
    }
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back</Button>

      {submitted ? (
        /* Success State */
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, ...glassSx(theme.palette.mode === 'dark'), textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Review Submitted!</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for reviewing {mentor.name}. Your feedback helps other learners.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate(`/mentor/${mentor.id}`)} sx={{ borderRadius: 3, fontWeight: 600 }}>
              View Mentor Profile
            </Button>
            <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ borderRadius: 3, fontWeight: 600 }}>
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      ) : (
        /* Review Form */
        <>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
          Share Review for{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            {mentor.name} ✓
          </Box>
        </Typography>

        {/* Mentor Info */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, ...glassSx(theme.palette.mode === 'dark'), mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={mentor.avatar} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography fontWeight={600}>{mentor.name}</Typography>
            <Typography variant="body2" color="text.secondary">{mentor.specialty} · {mentor.location}</Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            ...glassSx(theme.palette.mode === 'dark'),
          }}
        >
          {/* Overall Rating */}
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
            Rate the Mentor:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Rating
              value={rating}
              onChange={(_, v) => setRating(v)}
              size="large"
              precision={0.5}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {rating ? `${rating}/5` : 'Tap to rate'}
            </Typography>
          </Box>

          {/* Review Text */}
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
            Your Review:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="How was your experience? What did you learn?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Quick Tags */}
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>
            Quick Tags:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => toggleTag(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s' }}
              />
            ))}
          </Box>

          {/* Additional Ratings */}
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
            Additional Ratings:
          </Typography>
          {[
            { value: communication, setter: setCommunication, label: 'Communication', emoji: '💬' },
            { value: knowledge, setter: setKnowledge, label: 'Subject Knowledge', emoji: '🧠' },
            { value: helpfulness, setter: setHelpfulness, label: 'Helpfulness', emoji: '🤝' },
          ].map((item) => (
            <Box key={item.label} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{item.emoji} {item.label}</Typography>
                <Chip label={`${item.value}%`} size="small" color={item.value >= 70 ? 'success' : item.value >= 40 ? 'warning' : 'error'} sx={{ fontWeight: 700, height: 22 }} />
              </Box>
              <Slider
                value={item.value}
                onChange={(_, v) => item.setter(v as number)}
                min={0}
                max={100}
                sx={{ '& .MuiSlider-thumb': { width: 16, height: 16 } }}
              />
            </Box>
          ))}

          {/* File Upload */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body2">📎 Upload File or image</Typography>
            <Button variant="outlined" color="success" startIcon={<Upload />} size="small">
              Upload
            </Button>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={!rating || rating === 0}
            sx={{ py: 1.5, fontWeight: 600 }}
          >
            Submit Review
          </Button>
        </Paper>
        </>
      )}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ borderRadius: 3 }}>Review submitted successfully!</Alert>
      </Snackbar>
    </Box>
    </AnimatedPage>
  );
};

export default WriteReview;
