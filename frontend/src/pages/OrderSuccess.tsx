import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AnimatedPage, glassSx } from '../components/animations';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const state = (location.state as any) || {};
  const subtotal = state.amount || 20;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const sessionId = state.sessionId || 'session-new';

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
          mb: 3,
        }}
      >
        <CheckCircle sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
        <Typography variant="h4" fontWeight={800} sx={{ color: '#4CAF50', mb: 1, letterSpacing: '-0.03em' }}>
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
                <TableCell align="right">${subtotal} USD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tax (10%)</TableCell>
                <TableCell align="right">${tax} USD</TableCell>
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
                    <Typography fontWeight={700}>${total} USD</Typography>
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
          onClick={() => navigate(`/call/${sessionId}`)}
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
