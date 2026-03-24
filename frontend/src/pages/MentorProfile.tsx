import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Rating,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Verified,
  PersonAdd,
  Mail,
  Call,
  CalendarMonth,
  Link as LinkIcon,
  Share,
  PlayArrow,
  Star,
} from '@mui/icons-material';
import { sampleMentors, sampleReviews, sampleVideos } from '../data/mockData';

const MentorProfile: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const mentor = sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0];
  const reviews = sampleReviews.filter((r) => r.mentorId === mentor.id);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Main Profile Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              mb: 3,
            }}
          >
            {/* Profile Header */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={mentor.avatar} sx={{ width: 100, height: 100 }} />
                {mentor.isOnline && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 6,
                      right: 6,
                      width: 16,
                      height: 16,
                      bgcolor: '#4CAF50',
                      borderRadius: '50%',
                      border: `3px solid ${theme.palette.background.paper}`,
                    }}
                  />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {mentor.name}
                  </Typography>
                  {mentor.isVerified && <Verified sx={{ color: theme.palette.primary.main }} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  @{mentor.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  {mentor.specialty}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="body2">
                    <strong>{formatCount(mentor.followers)}</strong> Followers
                  </Typography>
                  <Typography variant="body2">
                    <strong>{mentor.following}</strong> Following
                  </Typography>
                  <Typography variant="body2">
                    <strong>{formatCount(mentor.likes)}</strong> Likes
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              <Button variant="contained" color="success" startIcon={<PersonAdd />}>
                Follow
              </Button>
              <Button
                variant="contained"
                startIcon={<Mail />}
                sx={{ bgcolor: '#E57373', '&:hover': { bgcolor: '#d32f2f' } }}
              >
                Message (${mentor.messagePrice})
              </Button>
              <Button
                variant="contained"
                startIcon={<Call />}
                sx={{ bgcolor: '#E57373', '&:hover': { bgcolor: '#d32f2f' } }}
                onClick={() => navigate(`/book/${mentor.id}`)}
              >
                Call (${mentor.callPrice}/30 min)
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarMonth />}
                sx={{ bgcolor: '#E57373', '&:hover': { bgcolor: '#d32f2f' } }}
              >
                Subscribe (${mentor.subscriptionPrice}/month)
              </Button>
            </Box>

            {/* About */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              {mentor.about}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {mentor.youtubeLink && (
                <Button size="small" startIcon={<LinkIcon />} color="primary">
                  My Youtube
                </Button>
              )}
              <Button size="small" startIcon={<Share />} color="primary">
                Share Profile
              </Button>
            </Box>
          </Paper>

          {/* Reviews Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Reviews
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/mentor/${mentor.id}/reviews`)}
              >
                See All &gt;
              </Button>
            </Box>
            {reviews.slice(0, 3).map((review) => (
              <Box key={review.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar src={review.learnerAvatar} sx={{ width: 40, height: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontWeight={600}>{review.learnerName}</Typography>
                      <Rating value={review.rating} precision={0.5} size="small" readOnly />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {review.createdAt}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {review.text}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Paper>

          {/* Video Gallery */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Videos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {sampleVideos.filter((v) => !v.isLive).slice(0, 3).map((video) => (
                <Box
                  key={video.id}
                  sx={{
                    minWidth: 200,
                    height: 140,
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundImage: `url(${video.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => navigate(`/video/${video.id}`)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                    }}
                  >
                    <PlayArrow sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Rating Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              RATING
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {mentor.rating}
              </Typography>
              <Rating value={mentor.rating} precision={0.5} readOnly />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatCount(mentor.totalMentees)}+ Mentees
            </Typography>
          </Paper>

          {/* Offer Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.primary.main}40`,
              borderRadius: 3,
              bgcolor: theme.palette.primary.main + '08',
            }}
          >
            <Chip
              label="NEW OFFER 🎯"
              size="small"
              color="primary"
              sx={{ mb: 1, fontWeight: 600 }}
            />
            <Typography variant="h6" fontWeight={600}>
              50% off on Subscription
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorProfile;
