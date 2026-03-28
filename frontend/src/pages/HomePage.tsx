import React, { useState, useEffect, useRef } from 'react';
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
  Grow,
  Skeleton,
  useTheme,
} from '@mui/material';
import { Search, LocalFireDepartment, PlayArrow, Visibility } from '@mui/icons-material';
import { sampleMentors, categories } from '../data/mockData';
import { youtubeApi, YouTubeShort } from '../services/youtube';
import { AnimatedPage, FadeIn, RevealOnScroll, glassSx, AnimatedCounter, FloatingOrbs, Marquee } from '../components/animations';
import GradientText from '../components/GradientText';
import { ParticleCard, GlobalSpotlight, useMobileDetection } from '../components/MagicBento';
import { ChipSkeleton, HomeMentorCardSkeleton } from '../components/Skeletons';
import DarkVeil from '../components/DarkVeil';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [shortsLoading, setShortsLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    youtubeApi.getTrendingShorts(8).then((data) => {
      setShorts(data);
      setShortsLoading(false);
    });
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: { xs: 6, md: 12 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            width: '120%',
            height: '100%',
            zIndex: 0,
            opacity: theme.palette.mode === 'dark' ? 0.5 : 0.18,
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)',
          }}
        >
          <DarkVeil
            speed={0.5}
            hueShift={200}
          />
        </Box>
        <FloatingOrbs />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
          <GradientText
            className="inline"
            colors={['#1a3fc4', '#7C5CFC', '#c084fc', '#FF9FFC']}
            animationSpeed={5}
            pauseOnHover
            style={{ fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' }}
          >
            Seconds.
          </GradientText>
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
                  border: `1px solid ${theme.palette.divider}`,
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
      </Box>

      {/* Trending Mentors Section */}
      <RevealOnScroll>
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <GradientText
            colors={['#1a3fc4', '#7C5CFC', '#c084fc']}
            animationSpeed={9}
            style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Trending Mentors
          </GradientText>
          <LocalFireDepartment sx={{
            color: '#E8854A',
            animation: 'flicker 1.5s ease-in-out infinite',
            '@keyframes flicker': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.12)' },
            },
          }} />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: 200 }}><HomeMentorCardSkeleton /></Box>
            ))}
          </Box>
        ) : (
          <div className="mentor-bento-section">
            <GlobalSpotlight gridRef={gridRef} disableAnimations={isMobile} glowColor="124, 92, 252" />
            <div className="mentor-bento-grid" ref={gridRef}>
              {sampleMentors.slice(0, 6).map((mentor, idx) => (
                <ParticleCard
                  key={mentor.id}
                  className="mentor-bento-card mentor-bento-card--border-glow"
                  style={{
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.85)',
                    border: `1px solid ${theme.palette.divider}`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                  glowColor="124, 92, 252"
                  enableMagnetism
                  clickEffect
                  disableAnimations={isMobile}
                  onClick={() => navigate(`/mentor/${mentor.id}`)}
                >
                  {mentor.isLive && (
                    <div className="mentor-bento-live">LIVE</div>
                  )}
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
                    <Avatar
                      src={mentor.avatar}
                      sx={{
                        width: idx === 2 ? 96 : 72,
                        height: idx === 2 ? 96 : 72,
                        mx: 'auto',
                        border: `3px solid ${theme.palette.primary.main}40`,
                        transition: 'border-color 0.3s ease',
                      }}
                    />
                    {mentor.isOnline && (
                      <div
                        className="mentor-bento-online"
                        style={{ borderColor: theme.palette.background.paper }}
                      />
                    )}
                  </Box>
                  <Typography
                    fontWeight={700}
                    noWrap
                    sx={{ fontSize: idx === 2 ? '1.1rem' : '0.95rem', mb: 0.25 }}
                  >
                    {mentor.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {mentor.specialty}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
                  >
                    {mentor.followers >= 1000
                      ? `${(mentor.followers / 1000).toFixed(0)}k`
                      : mentor.followers}{' '}
                    Followers
                  </Typography>
                </ParticleCard>
              ))}
            </div>
          </div>
        )}
      </Box>
      </RevealOnScroll>

      {/* Trending Shorts Section */}
      <RevealOnScroll delay={25}>
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GradientText
              colors={['#ff0050', '#ff4081', '#ff6090']}
              animationSpeed={6}
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Trending Shorts
            </GradientText>
            <PlayArrow sx={{
              color: '#ff0050',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.15)' },
              },
            }} />
          </Box>
          <Button
            size="small"
            onClick={() => navigate('/shorts')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3, fontSize: '0.85rem' }}
          >
            See All
          </Button>
        </Box>

        {shortsLoading ? (
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" sx={{ minWidth: 160, height: 284, borderRadius: 3, flexShrink: 0 }} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.divider, borderRadius: 2 },
            }}
          >
            {shorts.map((short) => (
              <Box
                key={short.id}
                onClick={() => navigate(`/shorts?v=${short.id}`)}
                sx={{
                  minWidth: 160,
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.04)' },
                  '&:hover .shorts-play-overlay': { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    width: 160,
                    height: 284,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: '#000',
                  }}
                >
                  <img
                    src={short.thumbnail}
                    alt={short.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Play overlay */}
                  <Box
                    className="shorts-play-overlay"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      width: 44,
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.25s ease',
                    }}
                  >
                    <PlayArrow sx={{ color: '#fff', fontSize: 28 }} />
                  </Box>
                  {/* View count */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      color: '#fff',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        mb: 0.25,
                      }}
                    >
                      {short.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility sx={{ fontSize: 12, opacity: 0.8 }} />
                      <Typography sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
                        {parseInt(short.viewCount) >= 1000000
                          ? `${(parseInt(short.viewCount) / 1000000).toFixed(1)}M`
                          : parseInt(short.viewCount) >= 1000
                          ? `${(parseInt(short.viewCount) / 1000).toFixed(0)}K`
                          : short.viewCount}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      </RevealOnScroll>

      {/* Social Proof Stats */}
      <RevealOnScroll delay={50}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 8,
          py: 4,
          px: 3,
          borderRadius: 5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}06)`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {[
          { value: 15000, suffix: '+', label: 'Active Learners' },
          { value: 2500, suffix: '+', label: 'Expert Mentors' },
          { value: 98, suffix: '%', label: 'Satisfaction Rate' },
          { value: 50000, suffix: '+', label: 'Sessions Completed' },
        ].map((stat) => (
          <Box key={stat.label} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.03em' }}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
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
                borderColor: theme.palette.primary.main + '50',
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

      {/* Testimonials Marquee */}
      <RevealOnScroll delay={150}>
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <GradientText
            colors={['#1a3fc4', '#7C5CFC', '#c084fc']}
            animationSpeed={9}
            style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            What Learners Say
          </GradientText>
        </Box>
        <Marquee speed={40}>
          {[
            { text: '"Mentr changed my career trajectory completely!"', author: 'Sarah K.' },
            { text: '"Got my dream job after just 3 sessions."', author: 'Alex M.' },
            { text: '"The mentors here are world-class professionals."', author: 'Priya S.' },
            { text: '"Best investment I made in my personal growth."', author: 'David L.' },
            { text: '"Instant access to experts — simply amazing."', author: 'Emma R.' },
            { text: '"The refund guarantee gave me confidence to try."', author: 'James T.' },
          ].map((t) => (
            <Paper
              key={t.author}
              elevation={0}
              sx={{
                p: 3,
                minWidth: 280,
                borderRadius: 4,
                ...glassSx(theme.palette.mode === 'dark'),
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, lineHeight: 1.6 }}>
                {t.text}
              </Typography>
              <Typography variant="caption" fontWeight={600} color="primary">
                — {t.author}
              </Typography>
            </Paper>
          ))}
        </Marquee>
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
