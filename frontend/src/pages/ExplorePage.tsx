import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Rating,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  LocalFireDepartment,
  FiberManualRecord,
  ArrowBack,
  ArrowForward,
  Call,
  PlayArrow,
  LibraryBooks,
  AutoAwesome,
  School,
  Code,
  Palette,
  TrendingUp,
  Psychology,
  Biotech,
  Campaign,
} from '@mui/icons-material';
import { sampleMentors, sampleVideos, trendingTopics } from '../data/mockData';
import { AnimatedPage, FadeIn, GrowIn, RevealOnScroll, glassSx, glowBorderSx, Marquee } from '../components/animations';
import { MentorCardSkeleton, VideoCardSkeleton, ChipSkeleton } from '../components/Skeletons';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);
  const [audioOnly, setAudioOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <FadeIn delay={100}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.03em' }}>
        Find your next mentor session.
      </Typography>
      </FadeIn>
      <FadeIn delay={200}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontSize: '1.1rem' }}>
        Explore by topic, rating, or availability.
      </Typography>
      </FadeIn>

      {/* Category Icon Grid */}
      <FadeIn delay={300}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)' }, gap: 2, mb: 5 }}>
        {[
          { icon: <School />, label: 'Education', color: '#007AFF' },
          { icon: <Code />, label: 'Tech', color: '#34C759' },
          { icon: <Palette />, label: 'Design', color: '#FF9500' },
          { icon: <TrendingUp />, label: 'Business', color: '#FF3B30' },
          { icon: <Psychology />, label: 'Wellness', color: '#AF52DE' },
          { icon: <Biotech />, label: 'Science', color: '#30B0C7' },
          { icon: <Campaign />, label: 'Marketing', color: '#FF2D55' },
          { icon: <AutoAwesome />, label: 'AI / ML', color: '#5856D6' },
        ].map((cat) => (
          <Box
            key={cat.label}
            onClick={() => navigate(`/search?q=${encodeURIComponent(cat.label)}`)}
            sx={{
              textAlign: 'center', cursor: 'pointer', p: 1.5, borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': { transform: 'translateY(-4px)', bgcolor: cat.color + '10' },
            }}
          >
            <Box sx={{
              width: 48, height: 48, borderRadius: '50%', mx: 'auto', mb: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: cat.color + '15', color: cat.color,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.1)', boxShadow: `0 4px 20px ${cat.color}30` },
            }}>
              {cat.icon}
            </Box>
            <Typography variant="caption" fontWeight={600} noWrap>{cat.label}</Typography>
          </Box>
        ))}
      </Box>
      </FadeIn>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Trending Mentors */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Trending Mentors
                </Typography>
                <LocalFireDepartment sx={{ color: '#E8854A' }} />
              </Box>
              <Box>
                <IconButton size="small"><ArrowBack fontSize="small" /></IconButton>
                <IconButton size="small"><ArrowForward fontSize="small" /></IconButton>
              </Box>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => <MentorCardSkeleton key={i} />)}
              </Box>
            ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleMentors.map((m) => (
                <Card
                  key={m.id}
                  elevation={0}
                  sx={{
                    minWidth: 220,
                    borderRadius: 4,
                    ...glassSx(theme.palette.mode === 'dark'),
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { borderColor: theme.palette.primary.main + '60', transform: 'translateY(-6px) scale(1.02)', boxShadow: `0 16px 40px ${theme.palette.primary.main}12` },
                  }}
                  onClick={() => navigate(`/mentor/${m.id}`)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar src={m.avatar} sx={{ width: 56, height: 56, mx: 'auto', mb: 1, transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.08)' } }} />
                    <Typography variant="caption" color="text.secondary">
                      {(m.followers / 1000).toFixed(0)}k Followers
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{m.specialty}</Typography>
                    <Rating value={m.rating} precision={0.5} size="small" readOnly sx={{ my: 0.5 }} />
                    <Typography variant="body2" fontWeight={600}>${m.callPrice}/30 min</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Call />}
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/book/${m.id}`); }}
                    >
                      Call
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
            )}
          </Box>

          {/* Online Now */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Online Now
                </Typography>
                <FiberManualRecord sx={{ color: '#4CAF50', fontSize: 14 }} />
              </Box>
              <Box>
                <IconButton size="small"><ArrowBack fontSize="small" /></IconButton>
                <IconButton size="small"><ArrowForward fontSize="small" /></IconButton>
              </Box>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {Array.from({ length: 4 }).map((_, i) => <MentorCardSkeleton key={i} />)}
              </Box>
            ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleMentors.filter((m) => m.isOnline).map((m) => (
                <Card
                  key={m.id}
                  elevation={0}
                  sx={{
                    minWidth: 220,
                    borderRadius: 4,
                    ...glassSx(theme.palette.mode === 'dark'),
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { borderColor: theme.palette.primary.main + '60', transform: 'translateY(-6px)', boxShadow: `0 12px 32px ${theme.palette.primary.main}12` },
                  }}
                  onClick={() => navigate(`/mentor/${m.id}`)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar src={m.avatar} sx={{ width: 56, height: 56, mb: 1 }} />
                      <Box
                        sx={{
                          position: 'absolute', bottom: 8, right: 0,
                          width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%',
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{m.specialty}</Typography>
                    <Typography variant="body2" fontWeight={600}>${m.callPrice}/30 min</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Call />}
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/book/${m.id}`); }}
                    >
                      Call
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
            )}
          </Box>

          {/* Recommended for You */}
          <RevealOnScroll>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesome sx={{ color: '#AF52DE', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={600}>
                Recommended for You
              </Typography>
              <Box sx={{
                ml: 1, px: 1.5, py: 0.25, borderRadius: 2,
                background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
                display: 'inline-flex',
              }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}>AI</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleMentors.slice(0, 4).map((m) => (
                <Card
                  key={'rec-' + m.id}
                  elevation={0}
                  sx={{
                    minWidth: 260, borderRadius: 4,
                    ...glassSx(theme.palette.mode === 'dark'),
                    ...glowBorderSx('#AF52DE'),
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { transform: 'translateY(-6px) scale(1.02)', boxShadow: '0 16px 40px rgba(175,82,222,0.12)' },
                  }}
                  onClick={() => navigate(`/mentor/${m.id}`)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                      <Avatar src={m.avatar} sx={{ width: 48, height: 48, border: `2px solid ${theme.palette.secondary.main}30` }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{m.specialty}</Typography>
                      </Box>
                      <Rating value={m.rating} precision={0.5} size="small" readOnly />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {m.about}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>${m.callPrice}/30 min</Typography>
                      <Chip label="98% Match" size="small" sx={{ bgcolor: '#AF52DE15', color: '#AF52DE', fontWeight: 600 }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
          </RevealOnScroll>

          {/* What Mentors are Saying */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                What Mentors are Saying 😎
              </Typography>
              <Button size="small">View More &gt;</Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)}
              </Box>
            ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleVideos.filter((v) => !v.isLive).map((v) => (
                <Box
                  key={v.id}
                  sx={{
                    minWidth: 200,
                    height: 140,
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundImage: `url(${v.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => navigate(`/video/${v.id}`)}
                >
                  <Box
                    sx={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <PlayArrow sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, p: 1,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white' }}>{v.mentorName}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            )}
          </Box>
        </Grid>

        {/* Filters Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              position: 'sticky',
              top: 80,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, letterSpacing: '-0.01em' }}>
              Filters
            </Typography>

            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Sort by:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {['Alphabet', 'Pricing', 'Featured', 'Best Selling'].map((s) => (
                <Chip key={s} label={s} size="small" clickable variant="outlined" />
              ))}
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="career">Career Advice</MenuItem>
                <MenuItem value="exam">Exam Prep</MenuItem>
                <MenuItem value="job">Job Switch</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Country</InputLabel>
              <Select label="Country">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="us">USA</MenuItem>
                <MenuItem value="in">India</MenuItem>
                <MenuItem value="uk">UK</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={audioOnly} onChange={(e) => setAudioOnly(e.target.checked)} />}
              label="Audio Calls only"
              sx={{ mb: 1, display: 'flex' }}
            />

            <FormControlLabel
              control={<Switch checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />}
              label="Verified only"
              sx={{ mb: 2, display: 'flex' }}
            />

            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Pricing:</Typography>
            <Slider
              value={priceRange}
              onChange={(_, v) => setPriceRange(v as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={200}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              placeholder="Enter Tags"
              label="Filter by Tags"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={<Switch />}
              label="Personal Meeting"
              sx={{ mb: 2, display: 'flex' }}
            />

            <Button variant="contained" fullWidth>Apply</Button>
          </Paper>

          {/* Trending Topics */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
              Trending Topics
            </Typography>
            {loading ? <ChipSkeleton count={6} /> : trendingTopics.map((topic) => (
              <Box
                key={topic}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 1,
                  px: 1,
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.main', backgroundColor: theme.palette.primary.main + '08', pl: 1.5 },
                }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
              >
                <LibraryBooks fontSize="small" color="action" />
                <Typography variant="body2">{topic}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default ExplorePage;
