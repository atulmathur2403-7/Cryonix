import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  TextField,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Share,
  BookmarkBorder,
  Send,
} from '@mui/icons-material';
import { sampleVideos, sampleMentors } from '../data/mockData';

const VideoDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const theme = useTheme();
  const video = sampleVideos.find((v) => v.id === videoId) || sampleVideos[0];
  const mentor = sampleMentors.find((m) => m.id === video.mentorId) || sampleMentors[0];
  const [comment, setComment] = useState('');

  const relatedVideos = sampleVideos.filter((v) => v.id !== video.id).slice(0, 4);

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Video Player */}
        <Paper
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            bgcolor: '#000',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            overflow: 'hidden',
          }}
        >
          <Typography variant="h4" color="#fff">
            ▶ {video.title}
          </Typography>
        </Paper>

        {/* Video Info */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {video.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {video.viewCount.toLocaleString()} views • {new Date(video.createdAt).toLocaleDateString()}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Button startIcon={<ThumbUp />} variant="outlined" size="small">
            {video.likes}
          </Button>
          <Button startIcon={<ThumbDown />} variant="outlined" size="small">
            Dislike
          </Button>
          <Button startIcon={<Share />} variant="outlined" size="small">
            Share
          </Button>
          <Button startIcon={<BookmarkBorder />} variant="outlined" size="small">
            Save
          </Button>
        </Box>

        {/* Mentor Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Avatar src={mentor.avatar} sx={{ width: 48, height: 48 }} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>{mentor.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {mentor.specialty}
            </Typography>
          </Box>
          <Button variant="contained" size="small">
            Follow
          </Button>
          <Button variant="outlined" size="small">
            Book a Call
          </Button>
        </Paper>

        {/* Description */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {video.description || 'No description available.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip label="Mentorship" size="small" variant="outlined" />
            <Chip label="Career" size="small" variant="outlined" />
          </Box>
        </Paper>

        {/* Comments */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Comments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 36, height: 36 }}>A</Avatar>
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton size="small" color="primary">
                  <Send fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Box>
        {/* Sample comments */}
        {[
          { user: 'John D.', text: 'Great explanation! Very helpful.', time: '2 hours ago' },
          { user: 'Sarah M.', text: 'Can you make more videos on this topic?', time: '1 day ago' },
        ].map((c, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>{c.user[0]}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {c.user}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  {c.time}
                </Typography>
              </Typography>
              <Typography variant="body2">{c.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Sidebar - Related Videos */}
      <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Related Videos
        </Typography>
        {relatedVideos.map((v) => (
          <Paper
            key={v.id}
            elevation={0}
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 1,
              mb: 1,
              cursor: 'pointer',
              borderRadius: 2,
              '&:hover': { bgcolor: theme.palette.action.hover },
            }}
          >
            <Box
              sx={{
                width: 160,
                height: 90,
                bgcolor: '#000',
                borderRadius: 1,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="#fff">
                ▶ Video
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ lineClamp: 2 }}>
                {v.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.viewCount.toLocaleString()} views
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default VideoDetail;
