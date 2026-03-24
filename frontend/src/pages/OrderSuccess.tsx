import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Rating,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { AnimatedPage } from '../components/animations';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CheckCircle sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: '#4CAF50', mb: 1 }}>
          Order placed successfully
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The Best way to learn faster is from an experienced Mentor.
        </Typography>

        {/* Receipt Table */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 3,
            mx: 'auto',
            maxWidth: 400,
          }}
        >
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                <TableCell align="right">$20 USD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tax (10%)</TableCell>
                <TableCell align="right">$2 USD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Fees</TableCell>
                <TableCell align="right">$0 USD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Card</TableCell>
                <TableCell align="right">VISA ****2334</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Chip label="Success" size="small" color="success" />
                    <Typography fontWeight={700}>$22 USD</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* Rating */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          How was your experience?
        </Typography>
        <Rating value={4} size="large" sx={{ mb: 3 }} />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/call/live/session-new')}
          sx={{ py: 1.5, fontWeight: 600, mb: 2 }}
        >
          Continue with Call
        </Button>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Return to Your Dashboard
          </Button>
          <Button variant="outlined" color="error">
            Download Receipt
          </Button>
        </Box>
      </Paper>
    </Box>
    </AnimatedPage>
  );
};

export default OrderSuccess;
