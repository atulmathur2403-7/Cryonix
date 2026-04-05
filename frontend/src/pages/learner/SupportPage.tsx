import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  WhatsApp,
  Email,
  Upload,
  HelpOutline,
} from '@mui/icons-material';
import { sampleFaqs } from '../../data/mockData';
import { AnimatedPage, glassSx } from '../../components/animations';

const SupportPage: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [reportCategory, setReportCategory] = useState('');

  const faqCategories = ['General', 'Booking', 'Payouts', 'Video & Chat', 'Refunds'];
  const commonQuestions = [
    'Forgot password',
    'Email/Phone not working',
    'Login not working',
    'Contact Support',
    'Technical issue',
    'Payment issue',
    'Refund Policy Info',
  ];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2, letterSpacing: '-0.03em' }}>
        Get Support
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search for common issues... (booking, payout, tech)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          sx: { borderRadius: 3 },
        }}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3}>
        {/* Left Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* FAQ Section */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={600}>
                📚 FAQ Section
              </Typography>
            </Box>
            {faqCategories.map((category) => (
              <Accordion key={category} elevation={0} disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={500}>{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {sampleFaqs
                    .filter((f) => f.category === category)
                    .map((faq) => (
                      <Accordion key={faq.id} elevation={0} disableGutters sx={{ '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="body2">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Report an Issue */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Report an Issue
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={reportCategory}
                label="Category"
                onChange={(e) => setReportCategory(e.target.value)}
              >
                <MenuItem value="booking">Booking Issues</MenuItem>
                <MenuItem value="payment">Payment Problems</MenuItem>
                <MenuItem value="chat">Chat/Video Issues</MenuItem>
                <MenuItem value="refund">Refund Request</MenuItem>
                <MenuItem value="misconduct">Mentor Misconduct</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your issue"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<Upload />}>
                Attach File
              </Button>
              <Button variant="contained" size="small">
                Submit
              </Button>
            </Box>
          </Paper>

          {/* Immediate Help */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              💬 Need Immediate Help?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
              >
                WhatsApp Chat
              </Button>
              <Button variant="outlined" startIcon={<Email />}>
                Email us
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Most Asked Questions
            </Typography>
            <List dense>
              {commonQuestions.map((q) => (
                <ListItemButton key={q} sx={{ borderRadius: 1 }}>
                  <HelpOutline fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText primary={q} />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Common Learner Issues
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { category: 'Booking Issues', desc: "I can't book a session" },
                { category: 'Session Issues', desc: "Mentor didn't join" },
                { category: 'Payment Problems', desc: "I paid but didn't get confirmation" },
                { category: 'Charge Issues', desc: 'My session failed but I was charged' },
                { category: 'Chat/Video Issues', desc: 'Messages not sending' },
                { category: 'Video Issues', desc: "Video call didn't start properly" },
                { category: 'Refund Request', desc: 'Trigger refund process' },
              ].map((item) => (
                <Paper
                  key={item.category}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {item.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    "{item.desc}"
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default SupportPage;
