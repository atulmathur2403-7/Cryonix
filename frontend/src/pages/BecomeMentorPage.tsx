import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import { School, CheckCircle } from '@mui/icons-material';
import { AnimatedPage, glassSx } from '../components/animations';

const BecomeMentorPage: React.FC = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    specialty: '',
    experience: '',
    about: '',
    linkedIn: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
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
            multiline
            rows={4}
            label="Tell us about yourself"
            placeholder="Why do you want to become a mentor? What can you offer learners?"
            value={formData.about}
            onChange={handleChange('about')}
          />
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            sx={{ py: 1.5, fontWeight: 600, mt: 1 }}
          >
            Submit Application
          </Button>
        </Box>
      </Paper>
    </Box>
    </AnimatedPage>
  );
};

export default BecomeMentorPage;
