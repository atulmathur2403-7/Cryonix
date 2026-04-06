import React, { useState, useEffect } from 'react';
import { AnimatedPage, glassSx } from '../components/animations';
import { useParams, useNavigate } from 'react-router-dom';
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
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Share,
  BookmarkBorder,
  Bookmark,
  Send,
  ArrowBack,
  PlayArrow,
  AccessTime,
  Visibility,
  WatchLater,
} from '@mui/icons-material';
import { sampleVideos, sampleMentors } from '../data/mockData';
import { VideoPlayerSkeleton } from '../components/Skeletons';
import { useBookmarks } from '../context/BookmarkContext';

const TOOLTIP_PROPS = {
  arrow: true,
  enterDelay: 400,
  leaveDelay: 100,
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: 'rgba(30,30,30,0.95)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      },
    },
    arrow: {
      sx: { color: 'rgba(30,30,30,0.95)' },
    },
  },
} as const;

const formatViews = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return count.toString();
};

const VideoDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const video = sampleVideos.find((v) => v.id === videoId) || sampleVideos[0];
  const mentor = sampleMentors.find((m) => m.id === video.mentorId) || sampleMentors[0];
  const [comment, setComment] = useState('');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(video.id);

  const relatedVideos = sampleVideos.filter((v) => v.id !== video.id).slice(0, 5);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [videoId]);

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Tooltip title="Go back" {...TOOLTIP_PROPS}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 1, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back</Button>
      </Tooltip>
    <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {loading ? (
          <Box>
            <VideoPlayerSkeleton />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" width={80} height={32} />)}
              </Box>
              <Skeleton variant="rounded" width="100%" height={72} sx={{ mb: 3 }} />
              <Skeleton variant="rounded" width="100%" height={60} sx={{ mb: 3 }} />
            </Box>
          </Box>
        ) : (
        <>
        {/* YouTube Player */}
        <Paper
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            bgcolor: '#000',
            borderRadius: 4,
            mb: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </Paper>

        {/* Video Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {video.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
              <Chip label={video.category} size="small" sx={{ fontWeight: 600, bgcolor: video.category === 'Sports' ? '#34c759' : theme.palette.primary.main, color: '#fff' }} />
              <Typography variant="body2" color="text.secondary">
                {formatViews(video.viewCount)} views &bull; {video.duration} &bull; {new Date(video.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, mt: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Like this video" {...TOOLTIP_PROPS}>
            <Button startIcon={<ThumbUp />} variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none' }}>
              {formatViews(video.likes)}
            </Button>
          </Tooltip>
          <Tooltip title="Dislike this video" {...TOOLTIP_PROPS}>
            <Button startIcon={<ThumbDown />} variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none' }}>
              Dislike
            </Button>
          </Tooltip>
          <Tooltip title="Share this video" {...TOOLTIP_PROPS}>
            <Button startIcon={<Share />} variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none' }}>
              Share
            </Button>
          </Tooltip>
          <Tooltip title={saved ? 'Remove from saved' : 'Save for later'} {...TOOLTIP_PROPS}>
            <Button startIcon={saved ? <Bookmark /> : <BookmarkBorder />} variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none' }} onClick={() => toggleBookmark(video)}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </Tooltip>
        </Box>

        {/* Mentor Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 4,
            ...glassSx(theme.palette.mode === 'dark'),
            mb: 3,
          }}
        >
          <Tooltip title={`View ${video.mentorName}'s profile`} {...TOOLTIP_PROPS}>
            <Avatar src={video.mentorAvatar} sx={{ width: 48, height: 48, cursor: 'pointer' }} onClick={() => navigate(`/mentor/${video.mentorId}`)}>{video.mentorName[0]}</Avatar>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>{video.mentorName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {mentor.specialty || video.category}
            </Typography>
          </Box>
          <Tooltip title={saved ? 'Remove from Watch Later' : 'Save video for later'} {...TOOLTIP_PROPS}>
            <Button
              variant={saved ? 'contained' : 'outlined'}
              size="small"
              startIcon={saved ? <Bookmark /> : <WatchLater />}
              sx={{ borderRadius: 3, textTransform: 'none' }}
              onClick={() => toggleBookmark(video)}
            >
              {saved ? 'Saved' : 'Save for Later'}
            </Button>
          </Tooltip>
          <Tooltip title="Book a call with this mentor" {...TOOLTIP_PROPS}>
            <Button variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none' }} onClick={() => navigate(`/book/${video.mentorId}`)}>
              Book a Call
            </Button>
          </Tooltip>
        </Paper>

        {/* Description */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            ...glassSx(theme.palette.mode === 'dark'),
            mb: 3,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {video.description || 'No description available.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip label={video.category} size="small" variant="outlined" />
            <Chip label="Mentorship" size="small" variant="outlined" />
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
                <Tooltip title="Post comment" {...TOOLTIP_PROPS}>
                  <IconButton size="small" color="primary">
                    <Send fontSize="small" />
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
        </Box>
        {/* Sample comments */}
        {[
          { user: 'John D.', text: 'Great explanation! Very helpful.', time: '2 hours ago' },
          { user: 'Sarah M.', text: 'Can you make more videos on this topic?', time: '1 day ago' },
          { user: 'Raj K.', text: 'This changed my perspective completely. Thank you!', time: '3 days ago' },
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
        </>
        )}
      </Box>

      {/* Sidebar - Related Videos */}
      <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Related Videos
        </Typography>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, p: 1, mb: 1 }}>
              <Skeleton variant="rounded" width={168} height={94} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="50%" />
              </Box>
            </Box>
          ))
        ) : (
        relatedVideos.map((v) => (
          <Paper
            key={v.id}
            elevation={0}
            onClick={() => navigate(`/video/${v.id}`)}
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 1,
              mb: 1,
              cursor: 'pointer',
              borderRadius: 3,
              transition: 'all 0.25s ease',
              '&:hover': { bgcolor: theme.palette.action.hover, transform: 'translateX(4px)' },
              '&:hover .related-play': { opacity: 1 },
            }}
          >
            <Box
              sx={{
                width: 168,
                height: 94,
                borderRadius: 2,
                flexShrink: 0,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Play overlay */}
              <Box
                className="related-play"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <PlayArrow sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              {/* Duration */}
              <Box sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(0,0,0,0.8)', color: '#fff', px: 0.75, py: 0.15, borderRadius: 0.75, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <AccessTime sx={{ fontSize: 10 }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{v.duration}</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                  mb: 0.5,
                }}
              >
                {v.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.mentorName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <Visibility sx={{ fontSize: 11, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {formatViews(v.viewCount)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))
        )}
      </Box>
    </Box>
    </Box>
    </AnimatedPage>
  );
};

export default VideoDetail;
