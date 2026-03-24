import React, { useState } from 'react';
import { AnimatedPage, glassSx } from '../components/animations';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Rating,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import {
  Download,
  Upload,
  MonetizationOn,
  Replay,
  Report,
  ArrowBack,
} from '@mui/icons-material';

const SessionComplete: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [rating, setRating] = useState<number | null>(0);
  const [review, setReview] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    issueType: 'Session Didn\'t happen',
    description: '',
    requestRefund: false,
  });

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em' }}>
        "Session Completed Successfully"
      </Typography>

      <Grid container spacing={3}>
        {/* Session Details */}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mentor name:</Typography>
                <Typography fontWeight={600}>Ajay Shah</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Date & Time:</Typography>
                <Typography fontWeight={600}>21/02/2025</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Session Type:</Typography>
                <Typography fontWeight={600}>Live Video Call</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Call Duration:</Typography>
                <Typography fontWeight={600}>Total Duration: 29 mins.</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Rating */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              ⭐ Rate This Session:
            </Typography>
            <Rating
              value={rating}
              onChange={(_, v) => setRating(v)}
              size="large"
              sx={{ mb: 2 }}
            />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              ✏️ Leave a Review:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </Paper>
        </Grid>

        {/* Right Side */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Notes */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              Notes Taken during Session:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              abc .......
            </Typography>
            <Button variant="outlined" startIcon={<Download />} size="small">
              Download Notes
            </Button>
          </Paper>

          {/* File Management */}
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
              <Typography variant="body2">Upload Files if any</Typography>
              <Button variant="outlined" size="small" startIcon={<Upload />}>
                Upload Files
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Download Files if any</Typography>
              <Button variant="outlined" size="small" startIcon={<Download />}>
                Download
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        <Button variant="contained" startIcon={<MonetizationOn />}>
          💰 Tip
        </Button>
        <Button variant="contained" startIcon={<Replay />}>
          Rebook Session
        </Button>
        <Button
          variant="contained"
          startIcon={<Report />}
          onClick={() => setShowReportModal(true)}
        >
          😡 Report an Issue
        </Button>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Report Modal */}
      <Dialog
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={600}>Report an Issue</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Issues: Learner/Mentor was rude, Technical issue, Incorrect charge, Others
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Issue Type</InputLabel>
            <Select
              value={reportData.issueType}
              label="Issue Type"
              onChange={(e) => setReportData({ ...reportData, issueType: e.target.value })}
            >
              <MenuItem value="Session Didn't happen">Session Didn't happen</MenuItem>
              <MenuItem value="Technical issue">Technical issue</MenuItem>
              <MenuItem value="Incorrect charge">Incorrect charge</MenuItem>
              <MenuItem value="Mentor was rude">Mentor was rude</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Describe the Issue"
            placeholder="Describe the Issue (Min 20 Characters)"
            sx={{ mb: 2 }}
            value={reportData.description}
            onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
          />

          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Session Details (Autofilled)</Typography>
            <Typography variant="body2">Mentor: Ajay Shah</Typography>
            <Typography variant="body2">Date: 21/02/2025</Typography>
            <Typography variant="body2">Type: Live Video Call</Typography>
            <Typography variant="body2">Duration: 29 mins</Typography>
          </Paper>

          <Button variant="outlined" startIcon={<Upload />} size="small" sx={{ mb: 2 }}>
            Upload Screenshots
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={reportData.requestRefund}
                onChange={(e) => setReportData({ ...reportData, requestRefund: e.target.checked })}
              />
            }
            label="Request Refund"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowReportModal(false)}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AnimatedPage>
  );
};

export default SessionComplete;
