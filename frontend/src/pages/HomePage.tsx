import React, { useState, useEffect } from 'react';
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
  Fade,
  Grow,
  Skeleton,
  useTheme,
} from '@mui/material';
import { Search, LocalFireDepartment } from '@mui/icons-material';
import { sampleMentors, categories } from '../data/mockData';
import { AnimatedPage, FadeIn, RevealOnScroll, glassSx, gradientTextSx } from '../components/animations';
import { ChipSkeleton, HomeMentorCardSkeleton } from '../components/Skeletons';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: { xs: 6, md: 12 }, position: 'relative' }}>
        <FadeIn delay={100}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: '2.5rem', md: '4rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Talk with Experts in{' '}
          <Box
            component="span"
            sx={{
              ...gradientTextSx(theme.palette.primary.main, theme.palette.secondary.main),
              backgroundSize: '200% 200%',
              animation: 'gradientShift 4s ease infinite',
              '@keyframes gradientShift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }}
          >
            Seconds.
          </Box>
        </Typography>
        </FadeIn>
        <FadeIn delay={200}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' }, maxWidth: 600, mx: 'auto' }}>
          Real Experienced People, Real Guidance, Real Results
        </Typography>
        </FadeIn>

        {/* Category Tags */}
        <FadeIn delay={300}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          {loading ? (
            <ChipSkeleton count={7} />
          ) : (
          categories.map((cat, i) => (
            <Grow in timeout={400 + i * 80} key={cat.label}>
              <Chip
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
                    transform: 'scale(1.06)',
                  },
                  transition: 'all 0.25s ease',
                }}
                variant="outlined"
              />
            </Grow>
          )))}
        </Box>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={400}>
        <Box sx={{ maxWidth: 640, mx: 'auto', mb: 4 }}>
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
                borderRadius: 4,
                bgcolor: 'background.paper',
                fontSize: '1.1rem',
                py: 0.8,
                px: 1,
                boxShadow: `0 4px 24px rgba(0,0,0,0.06)`,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderColor: theme.palette.primary.main + '40' },
                '&.Mui-focused': { boxShadow: `0 8px 32px ${theme.palette.primary.main}15`, borderColor: theme.palette.primary.main },
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              },
            }}
          />
        </Box>
        </FadeIn>

        <FadeIn delay={500}>
        <Typography variant="body2" color="text.secondary">
          Want to share your expertise instead?{' '}
          <Box
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/become-mentor')}
          >
            Become a Mentor
          </Box>
        </Typography>
        </FadeIn>
      </Box>

      {/* Trending Mentors Section */}
      <RevealOnScroll>
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
            Trending Mentors
          </Typography>
          <LocalFireDepartment sx={{
            color: '#E8854A',
            animation: 'flicker 1.5s ease-in-out infinite',
            '@keyframes flicker': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.12)' },
            },
          }} />
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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: 200 }}><HomeMentorCardSkeleton /></Box>
            ))
          ) : (
          sampleMentors.map((mentor, idx) => (
            <Grow in timeout={500 + idx * 120} key={mentor.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                minWidth: 210,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 4,
                ...glassSx(theme.palette.mode === 'dark'),
                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                '&:hover': {
                  borderColor: theme.palette.primary.main + '40',
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 48px ${theme.palette.primary.main}15`,
                },
              }}
              onClick={() => navigate(`/mentor/${mentor.id}`)}
            >
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
                <Avatar
                  src={mentor.avatar}
                  sx={{
                    width: 72,
                    height: 72,
                    mx: 'auto',
                    border: `3px solid transparent`,
                    transition: 'border-color 0.3s ease',
                    '.MuiPaper-root:hover &': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
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
                      animation: 'onlinePulse 2s ease-in-out infinite',
                      '@keyframes onlinePulse': {
                        '0%, 100%': { boxShadow: '0 0 0 0 rgba(76,175,80,0.4)' },
                        '50%': { boxShadow: '0 0 0 6px rgba(76,175,80,0)' },
                      },
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
            </Grow>
          ))
          )}
        </Box>
      </Box>
      </RevealOnScroll>

      {/* Value Propositions */}
      <RevealOnScroll delay={100}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          mb: 6,
        }}
      >
        {[
          { icon: '⚡', title: 'Live or On-Demand Video Calls', desc: 'Connect instantly or schedule at your convenience' },
          { icon: '🤑', title: '100% Refund Guarantee!', desc: 'Not satisfied? Get your money back' },
          { icon: '👽', title: 'Stay Anonymous for Privacy', desc: 'Your identity remains protected' },
        ].map((item, i) => (
          <Grow in timeout={600 + i * 150} key={item.title}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                borderColor: theme.palette.primary.main + '30',
              },
            }}
          >
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              {item.icon}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, letterSpacing: '-0.01em' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {item.desc}
            </Typography>
          </Paper>
          </Grow>
        ))}
      </Box>
      </RevealOnScroll>

      {/* Get Help Link */}
      <RevealOnScroll delay={200}>
      <Box sx={{ textAlign: 'left', mb: 6 }}>
        <Button
          color="error"
          onClick={() => navigate('/support')}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3 }}
        >
          Get Help
        </Button>
      </Box>
      </RevealOnScroll>
    </Box>
    </AnimatedPage>
  );
};

export default HomePage;
