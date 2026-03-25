import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import { Call, PlayArrow, People, FilterList, Verified, ArrowBack } from '@mui/icons-material';
import { sampleMentors, sampleVideos, searchSuggestions } from '../data/mockData';
import { AnimatedPage, FadeIn, glassSx, RevealOnScroll, glowBorderSx } from '../components/animations';
import { MentorCardGridSkeleton, VideoCardGridSkeleton, ChipSkeleton } from '../components/Skeletons';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'CSAT Coaching';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [query]);

  const tabLabels = ['Experts', 'Videos', 'Live'];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>Back</Button>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
        Here are the experts on{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          "{query}"
        </Box>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Chip
          label={`${sampleMentors.length} experts found`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          icon={<FilterList sx={{ fontSize: '16px !important' }} />}
          label="Filters"
          size="small"
          variant="outlined"
          clickable
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
        }}
      >
        {tabLabels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {/* Experts Tab */}
      {activeTab === 0 && (
        <>
          {loading ? (
            <Box sx={{ mb: 4 }}><MentorCardGridSkeleton count={6} /></Box>
          ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {sampleMentors.map((mentor) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={mentor.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    ...glassSx(theme.palette.mode === 'dark'),
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main + '60',
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 40px ${theme.palette.primary.main}15`,
                    },
                  }}
                  onClick={() => navigate(`/mentor/${mentor.id}`)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                      <Avatar src={mentor.avatar} sx={{ width: 80, height: 80 }} />
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
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {mentor.followers >= 1000
                        ? `${(mentor.followers / 1000).toFixed(0)}k`
                        : mentor.followers}{' '}
                      Followers
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {mentor.name} {mentor.isVerified && <Verified sx={{ fontSize: 16, color: 'primary.main', verticalAlign: 'middle', ml: 0.5 }} />}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {mentor.specialty}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                      <Typography variant="body2">Ratings:</Typography>
                      <Rating value={mentor.rating} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary">
                        {mentor.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {mentor.reviewCount} Reviews
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                      ${mentor.callPrice} / 30 mins
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Call />}
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.warning.main,
                        '&:hover': { bgcolor: '#d47540' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${mentor.id}`);
                      }}
                    >
                      Call
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          )}

          {/* People also searching */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              People are also Searching for
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {loading ? <ChipSkeleton count={8} /> : searchSuggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  variant="outlined"
                  clickable
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                  sx={{
                    borderColor: theme.palette.success.main + '60',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: theme.palette.success.main + '15',
                      borderColor: theme.palette.success.main,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Videos Tab */}
      {activeTab === 1 && (
        loading ? <VideoCardGridSkeleton count={6} /> :
        <Grid container spacing={3}>
          {sampleVideos
            .filter((v) => !v.isLive)
            .map((video) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => navigate(`/video/${video.id}`)}
                >
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundImage: `url(${video.thumbnailUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={video.mentorAvatar} sx={{ width: 32, height: 32 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {video.mentorName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Live Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {sampleVideos
            .filter((v) => v.isLive)
            .map((video) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                >
                  <Box
                    sx={{
                      height: 300,
                      position: 'relative',
                      backgroundImage: `url(${video.thumbnailUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <Chip
                      label="Live"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      icon={<People sx={{ color: 'white !important', fontSize: 16 }} />}
                      label={video.liveViewerCount.toLocaleString()}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1.5,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Avatar src={video.mentorAvatar} sx={{ width: 28, height: 28 }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {video.mentorName}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
    </AnimatedPage>
  );
};

export default SearchResults;
