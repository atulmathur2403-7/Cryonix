import React, { useState, useEffect } from 'react';
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
import { PlayArrow, ThumbUp, Visibility } from '@mui/icons-material';
import { sampleVideos } from '../data/mockData';
import { AnimatedPage, FadeIn, GrowIn, RevealOnScroll, glassSx, glowBorderSx } from '../components/animations';
import { VideoCardSkeleton, ChipSkeleton } from '../components/Skeletons';
import { FiberManualRecord } from '@mui/icons-material';

const VideosPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatedPage>
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        Videos
      </Typography>

      {/* Featured Hero Video */}
      {!loading && sampleVideos.length > 0 && (
        <FadeIn delay={100}>
        <Paper
          elevation={0}
          onClick={() => navigate(`/video/${sampleVideos[0].id}`)}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            mb: 4,
            cursor: 'pointer',
            height: { xs: 200, md: 320 },
            backgroundImage: `url(${sampleVideos[0].thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...glowBorderSx(theme.palette.primary.main),
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': { transform: 'scale(1.01)', boxShadow: `0 20px 60px ${theme.palette.primary.main}20` },
            '&:hover .play-btn': { transform: 'scale(1.15)' },
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))', display: 'flex', alignItems: 'flex-end', p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ flex: 1 }}>
              {sampleVideos[0].isLive && (
                <Chip
                  icon={<FiberManualRecord sx={{ fontSize: '10px !important' }} />}
                  label="LIVE NOW"
                  size="small"
                  color="error"
                  sx={{ mb: 1.5, fontWeight: 700, animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } } }}
                />
              )}
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
                {sampleVideos[0].title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {sampleVideos[0].mentorName} • {sampleVideos[0].viewCount.toLocaleString()} views
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

      {/* Continue Watching */}
      {!loading && (
        <RevealOnScroll>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, letterSpacing: '-0.01em' }}>Continue Watching</Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {sampleVideos.slice(0, 4).map((v, i) => (
              <Paper
                key={'cw-' + v.id}
                elevation={0}
                onClick={() => navigate(`/video/${v.id}`)}
                sx={{
                  minWidth: 240, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                  ...glassSx(theme.palette.mode === 'dark'),
                  transition: 'all 0.3s ease',
                  '&:hover': { borderColor: theme.palette.primary.main + '60' },
                }}
              >
                <Box sx={{ height: 100, bgcolor: '#111', position: 'relative', backgroundImage: `url(${v.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, bgcolor: theme.palette.action.hover }}>
                    <Box sx={{ height: '100%', width: `${30 + i * 20}%`, bgcolor: theme.palette.primary.main, borderRadius: 2 }} />
                  </Box>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} noWrap>{v.title}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>{v.mentorName}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
        </RevealOnScroll>
      )}

      {/* Categories */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {loading ? <ChipSkeleton count={6} /> : ['All', 'UX Design', 'Product Management', 'Data Science', 'React', 'Startups'].map((cat, i) => (
          <Chip
            key={cat}
            label={cat}
            color={i === 0 ? 'primary' : 'default'}
            variant={i === 0 ? 'filled' : 'outlined'}
            clickable
          />
        ))}
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
        {sampleVideos.map((video) => (
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
                boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
              },
            }}
            onClick={() => navigate(`/video/${video.id}`)}
          >
            {/* Thumbnail */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                bgcolor: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <IconButton
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <PlayArrow color="primary" />
              </IconButton>
              {video.isLive && (
                <Chip
                  label={`LIVE • ${video.liveViewerCount} watching`}
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            {/* Info */}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Avatar sx={{ width: 36, height: 36 }}>{video.mentorName[0]}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
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
                    {video.viewCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThumbUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {video.likes.toLocaleString()}
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
