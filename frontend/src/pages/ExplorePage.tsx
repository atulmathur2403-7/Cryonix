import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { sampleMentors, sampleVideos, trendingTopics } from '../data/mockData';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [audioOnly, setAudioOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Find your next mentor session.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore by topic, rating, or availability.
      </Typography>

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
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleMentors.map((m) => (
                <Card
                  key={m.id}
                  elevation={0}
                  sx={{
                    minWidth: 220,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => navigate(`/mentor/${m.id}`)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar src={m.avatar} sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }} />
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
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {sampleMentors.filter((m) => m.isOnline).map((m) => (
                <Card
                  key={m.id}
                  elevation={0}
                  sx={{
                    minWidth: 220,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': { borderColor: theme.palette.primary.main },
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
          </Box>

          {/* What Mentors are Saying */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                What Mentors are Saying 😎
              </Typography>
              <Button size="small">View More &gt;</Button>
            </Box>
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
          </Box>
        </Grid>

        {/* Filters Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              position: 'sticky',
              top: 80,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
              Trending Topics
            </Typography>
            {trendingTopics.map((topic) => (
              <Box
                key={topic}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
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
  );
};

export default ExplorePage;
