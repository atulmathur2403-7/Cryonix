import React from 'react';
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
import { AnimatedPage, FadeIn, GrowIn } from '../components/animations';

const VideosPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AnimatedPage>
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Videos
      </Typography>

      {/* Categories */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['All', 'UX Design', 'Product Management', 'Data Science', 'React', 'Startups'].map((cat, i) => (
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
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
    </Box>
    </AnimatedPage>
  );
};

export default VideosPage;
