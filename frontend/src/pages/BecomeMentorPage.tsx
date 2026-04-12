import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import { School, CheckCircle } from '@mui/icons-material';
import { AnimatedPage, glassSx } from '../components/animations';
import { authApi } from '../services/api';

const BecomeMentorPage: React.FC = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    specialty: '',
    experience: '',
    about: '',
    linkedIn: '',
    password: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await authApi.signUp({
        name: formData.fullName,
        email: formData.email,
        username: formData.email.split('@')[0],
        password: formData.password,
        role: 'MENTOR',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AnimatedPage>
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Application Submitted!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          Thank you for your interest in becoming a mentor on Mentr. Our team will review your
          application and get back to you within 48 hours.
        </Typography>
        <Chip label="Under Review" color="warning" sx={{ fontWeight: 600 }} />
      </Box>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <School sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.03em' }}>
          Become a Mentor
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Share your expertise, earn money, and help learners achieve their goals.
          Join our community of verified mentors.
        </Typography>
      </Box>

      {/* Benefits */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Set your own rates', 'Flexible schedule', 'Grow your audience', 'Get paid weekly'].map((b) => (
          <Chip key={b} label={b} variant="outlined" color="primary" />
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Application Form
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
          />
          <TextField
            fullWidth
            label="Area of Expertise"
            placeholder="e.g. UX Design, Data Science, Product Management"
            value={formData.specialty}
            onChange={handleChange('specialty')}
          />
          <TextField
            fullWidth
            label="Years of Experience"
            type="number"
            value={formData.experience}
            onChange={handleChange('experience')}
          />
          <TextField
            fullWidth
            label="LinkedIn Profile URL"
            value={formData.linkedIn}
            onChange={handleChange('linkedIn')}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Tell us about yourself"
            placeholder="Why do you want to become a mentor? What can you offer learners?"
            value={formData.about}
            onChange={handleChange('about')}
          />
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting || !formData.fullName || !formData.email || !formData.password}
            sx={{ py: 1.5, fontWeight: 600, mt: 1 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit Application'}
          </Button>
        </Box>
      </Paper>
    </Box>
    </AnimatedPage>
  );
};

export default BecomeMentorPage;
