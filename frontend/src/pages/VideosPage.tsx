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
import { AnimatedPage, FadeIn, GrowIn, RevealOnScroll, glassSx } from '../components/animations';
import { VideoCardSkeleton, ChipSkeleton } from '../components/Skeletons';

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
