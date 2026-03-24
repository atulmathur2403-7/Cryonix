import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Search, LocalFireDepartment } from '@mui/icons-material';
import { sampleMentors, categories } from '../data/mockData';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Talk with Experts in{' '}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Seconds.
          </Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
          Real Experienced People, Real Guidance, Real Results
        </Typography>

        {/* Category Tags */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          {categories.map((cat) => (
            <Chip
              key={cat.label}
              label={`${cat.icon} ${cat.label}`}
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.label)}`)}
              sx={{
                px: 1,
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: `1px solid ${theme.palette.primary.main}40`,
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '15',
                  borderColor: theme.palette.primary.main,
                },
              }}
              variant="outlined"
            />
          ))}
        </Box>

        {/* Search Bar */}
        <Box sx={{ maxWidth: 640, mx: 'auto', mb: 3 }}>
          <TextField
            fullWidth
            placeholder="What guidance do you need today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: 'background.paper',
                fontSize: '1.1rem',
                py: 0.5,
              },
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Want to share your expertise instead?{' '}
          <Box
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/become-mentor')}
          >
            Become a Mentor
          </Box>
        </Typography>
      </Box>

      {/* Trending Mentors Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Trending Mentors
          </Typography>
          <LocalFireDepartment sx={{ color: '#E8854A' }} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.primary.main + '40',
              borderRadius: 3,
            },
          }}
        >
          {sampleMentors.map((mentor) => (
            <Paper
              key={mentor.id}
              elevation={0}
              sx={{
                p: 3,
                minWidth: 200,
                textAlign: 'center',
                cursor: 'pointer',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
                },
              }}
              onClick={() => navigate(`/mentor/${mentor.id}`)}
            >
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
                <Avatar
                  src={mentor.avatar}
                  sx={{ width: 72, height: 72, mx: 'auto' }}
                />
                {mentor.isOnline && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      bgcolor: '#4CAF50',
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.background.paper}`,
                    }}
                  />
                )}
              </Box>
              <Typography fontWeight={600} noWrap>
                {mentor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {mentor.specialty}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mentor.followers >= 1000 ? `${(mentor.followers / 1000).toFixed(0)}k` : mentor.followers} Followers
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Value Propositions */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {[
          { icon: '⚡', title: 'Live or On-Demand Video Calls', desc: 'Connect instantly or schedule at your convenience' },
          { icon: '🤑', title: '100% Refund Guarantee!', desc: 'Not satisfied? Get your money back' },
          { icon: '👽', title: 'Stay Anonymous for Privacy', desc: 'Your identity remains protected' },
        ].map((item) => (
          <Paper
            key={item.title}
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" sx={{ mb: 1 }}>
              {item.icon}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Get Help Link */}
      <Box sx={{ textAlign: 'left', mb: 4 }}>
        <Button
          color="error"
          onClick={() => navigate('/support')}
          sx={{ textTransform: 'none' }}
        >
          Get Help
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
