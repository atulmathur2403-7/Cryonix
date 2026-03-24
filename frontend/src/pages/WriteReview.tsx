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
} from '@mui/material';
import { Upload } from '@mui/icons-material';
import { sampleMentors } from '../data/mockData';

const WriteReview: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const mentor = sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0];
  const [rating, setRating] = useState<number | null>(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    navigate('/dashboard');
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Share Review for{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          {mentor.name} ✓
        </Box>
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
        }}
      >
        <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
          Rate the Mentor:
        </Typography>
        <Rating
          value={rating}
          onChange={(_, v) => setRating(v)}
          size="large"
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="How was your Experience?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          sx={{ mb: 3 }}
        />

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
          sx={{ py: 1.5, fontWeight: 600 }}
        >
          Submit
        </Button>
      </Paper>
    </Box>
    </AnimatedPage>
  );
};

export default WriteReview;
