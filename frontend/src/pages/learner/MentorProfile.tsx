import React, { useState, useEffect } from 'react';
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
  Speed,
  EmojiEvents,
  TrendingUp,
  AccessTime,
  ArrowBack,
} from '@mui/icons-material';
import { sampleMentors, sampleReviews, sampleVideos } from '../../data/mockData';
import { Mentor, Review } from '../../types';
import { mentorApi } from '../../services/api';
import { AnimatedPage, glassSx } from '../../components/animations';
import { ProfileHeaderSkeleton, ReviewCardSkeleton, VideoCardSkeleton } from '../../components/Skeletons';

const MentorProfile: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<Mentor>(sampleMentors.find((m) => m.id === mentorId) || sampleMentors[0]);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews.filter((r) => r.mentorId === (mentorId || '')));

  useEffect(() => {
    setLoading(true);
    if (!mentorId) { setLoading(false); return; }

    Promise.all([
      mentorApi.getById(mentorId).catch(() => null),
      mentorApi.getReviews(mentorId).catch(() => null),
    ]).then(([profileRes, reviewsRes]) => {
      if (profileRes?.data) {
        const p = profileRes.data;
        setMentor({
          id: String(p.mentorId),
          name: p.name || '',
          username: '',
          specialty: p.expertise || '',
          about: p.bio || '',
          avatar: p.profilePic || '',
          isVerified: false,
          isOnline: false,
          isLive: false,
          followers: p.bookingsCount || 0,
          following: 0,
          likes: 0,
          rating: p.averageRating || 0,
          totalMentees: p.bookingsCount || 0,
          reviewCount: p.reviewCount || 0,
          messagePrice: Number(p.meetingPrice) || 0,
          callPrice: Number(p.callPrice) || 0,
          subscriptionPrice: Number(p.subscriptionPrice) || 0,
          youtubeLink: p.socialLinks || '',
          location: '',
        });
      }
      if (reviewsRes?.data) {
        const apiReviews = (reviewsRes.data.content || reviewsRes.data || []).map((r: any) => ({
          id: String(r.id),
          learnerId: '',
          learnerName: r.learnerName || 'Anonymous',
          learnerAvatar: '',
          mentorId: mentorId,
          sessionId: '',
          rating: r.rating || 0,
          text: r.comment || '',
          attachments: [],
          createdAt: r.createdAt || '',
        }));
        if (apiReviews.length > 0) setReviews(apiReviews);
      }
    }).finally(() => setLoading(false));
  }, [mentorId]);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back</Button>
      <Grid container spacing={3}>
        {/* Main Profile Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Box sx={{ mb: 3 }}><ProfileHeaderSkeleton /></Box>
          ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            {/* Profile Header */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={mentor.avatar} sx={{
                    width: 100,
                    height: 100,
                    border: `3px solid ${theme.palette.primary.main}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'scale(1.08)', borderColor: theme.palette.primary.main },
                  }} />
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
              <Button variant="contained" color="success" startIcon={<PersonAdd />} sx={{ borderRadius: 3 }}>
                Follow
              </Button>
              <Button
                variant="contained"
                startIcon={<Mail />}
                sx={{ borderRadius: 3 }}
              >
                Message (${mentor.messagePrice})
              </Button>
              <Button
                variant="contained"
                startIcon={<Call />}
                sx={{ borderRadius: 3 }}
                onClick={() => navigate(`/book/${mentor.id}`)}
              >
                Call (${mentor.callPrice}/30 min)
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                sx={{ borderRadius: 3 }}
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

            {/* Skill Proficiency Bars */}
            <Divider sx={{ my: 2.5 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>Skills</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { skill: 'Career Coaching', level: 95 },
                { skill: 'Resume Review', level: 88 },
                { skill: 'Interview Prep', level: 92 },
                { skill: 'System Design', level: 80 },
              ].map((s) => (
                <Box key={s.skill}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={600}>{s.skill}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.level}%</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: theme.palette.action.hover, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 3, width: `${s.level}%`,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main || '#7C5CFC'})`,
                      transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
          )}

          {/* Reviews Section */}
          {loading ? (
            <Box sx={{ mb: 3 }}>
              {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
            </Box>
          ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
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
          )}

          {/* Video Gallery */}
          {loading ? (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {Array.from({ length: 3 }).map((_, i) => <VideoCardSkeleton key={i} />)}
            </Box>
          ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, letterSpacing: '-0.01em' }}>
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
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Rating Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1, letterSpacing: '0.05em', fontSize: '0.75rem' }}>
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}06)`,
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
          {/* Response Time & Badges */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mt: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Speed sx={{ color: theme.palette.success.main }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>Avg. Response Time</Typography>
                <Typography variant="caption" color="text.secondary">Under 5 minutes</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ letterSpacing: '0.05em', mb: 1.5, display: 'block' }}>ACHIEVEMENTS</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { icon: <EmojiEvents sx={{ fontSize: 16 }} />, label: 'Top Mentor', color: '#FFD700' },
                { icon: <TrendingUp sx={{ fontSize: 16 }} />, label: 'Rising Star', color: '#34C759' },
                { icon: <AccessTime sx={{ fontSize: 16 }} />, label: '1000+ Hours', color: '#007AFF' },
              ].map((badge) => (
                <Chip
                  key={badge.label}
                  icon={badge.icon}
                  label={badge.label}
                  size="small"
                  sx={{
                    bgcolor: badge.color + '15',
                    color: badge.color,
                    fontWeight: 600,
                    border: `1px solid ${badge.color}40`,
                    '& .MuiChip-icon': { color: badge.color },
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Availability Slots */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mt: 3,
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>Next Available Slots</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { day: 'Today', time: '4:00 PM - 5:00 PM' },
                { day: 'Tomorrow', time: '10:00 AM - 11:00 AM' },
                { day: 'Wed, Jan 15', time: '2:00 PM - 3:00 PM' },
              ].map((slot) => (
                <Box
                  key={slot.day + slot.time}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main + '60',
                      bgcolor: theme.palette.primary.main + '06',
                    },
                  }}
                  onClick={() => navigate(`/book/${mentor.id}`)}
                >
                  <Box>
                    <Typography variant="caption" fontWeight={600}>{slot.day}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{slot.time}</Typography>
                  </Box>
                  <Chip label="Book" size="small" color="primary" clickable sx={{ fontWeight: 600 }} />
                </Box>
              ))}
            </Box>
          </Paper>        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default MentorProfile;
