import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import { PlayArrow, ThumbUp, Visibility, AccessTime } from '@mui/icons-material';
import { sampleVideos } from '../data/mockData';
import { AnimatedPage, FadeIn, RevealOnScroll, glassSx, glowBorderSx } from '../components/animations';
import { VideoCardSkeleton, ChipSkeleton } from '../components/Skeletons';

const formatViews = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return count.toString();
};

const VideosPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(sampleVideos.map((v) => v.category)))],
    [],
  );

  const filteredVideos = useMemo(
    () =>
      activeCategory === 'All'
        ? sampleVideos
        : sampleVideos.filter((v) => v.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const featured = filteredVideos[0];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Videos
      </Typography>

      {/* Featured Hero Video */}
      {!loading && featured && (
        <FadeIn delay={100}>
        <Paper
          elevation={0}
          onClick={() => navigate(`/video/${featured.id}`)}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            mb: 4,
            cursor: 'pointer',
            height: { xs: 220, md: 360 },
            ...glowBorderSx(theme.palette.primary.main),
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': { transform: 'scale(1.005)', boxShadow: `0 20px 60px ${theme.palette.primary.main}20` },
            '&:hover .play-btn': { transform: 'scale(1.15)' },
          }}
        >
          <Box
            component="img"
            src={`https://img.youtube.com/vi/${featured.youtubeId}/maxresdefault.jpg`}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = `https://img.youtube.com/vi/${featured.youtubeId}/hqdefault.jpg`;
            }}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.88))', display: 'flex', alignItems: 'flex-end', p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ flex: 1 }}>
              <Chip
                label={featured.category}
                size="small"
                sx={{
                  mb: 1.5,
                  fontWeight: 700,
                  bgcolor: featured.category === 'Sports' ? '#34c759' : theme.palette.primary.main,
                  color: '#fff',
                }}
              />
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
                {featured.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {featured.mentorName} &bull; {formatViews(featured.viewCount)} views &bull; {featured.duration}
              </Typography>
            </Box>
            <IconButton
              className="play-btn"
              sx={{
                width: 64, height: 64,
                bgcolor: 'rgba(255,255,255,0.95)',
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <PlayArrow color="primary" sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </Paper>
        </FadeIn>
      )}

      {/* Categories */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {loading ? (
          <ChipSkeleton count={6} />
        ) : (
          categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              clickable
              onClick={() => setActiveCategory(cat)}
              sx={{
                fontWeight: 600,
                transition: 'all 0.25s ease',
                ...(activeCategory === cat && {
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                }),
              }}
            />
          ))
        )}
      </Box>

      {/* Video Grid */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </Box>
      ) : (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {filteredVideos.map((video) => (
          <Paper
            key={video.id}
            elevation={0}
            sx={{
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              },
              '&:hover .thumb-overlay': { opacity: 1 },
            }}
            onClick={() => navigate(`/video/${video.id}`)}
          >
            {/* Thumbnail */}
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: '#111', overflow: 'hidden' }}>
              <Box
                component="img"
                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                }}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Hover play overlay */}
              <Box
                className="thumb-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.95)', '&:hover': { bgcolor: '#fff' } }}>
                  <PlayArrow color="primary" sx={{ fontSize: 32 }} />
                </IconButton>
              </Box>
              {/* Duration badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <AccessTime sx={{ fontSize: 12 }} />
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  {video.duration}
                </Typography>
              </Box>
              {/* Category badge */}
              <Chip
                label={video.category}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: video.category === 'Sports' ? '#34c759' : theme.palette.primary.main,
                  color: '#fff',
                }}
              />
            </Box>

            {/* Info */}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Avatar src={video.mentorAvatar} sx={{ width: 36, height: 36 }}>{video.mentorName[0]}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.3,
                      minHeight: '2.6em',
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.mentorName}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatViews(video.viewCount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThumbUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatViews(video.likes)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
      )}
    </Box>
    </AnimatedPage>
  );
};

export default VideosPage;
