import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { AnimatedPage, glassSx } from '../../components/animations';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const state = (location.state as any) || {};
  const sessionId = state.sessionId || 'new';
  const subtotal = state.amount || 20;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          ...glassSx(theme.palette.mode === 'dark'),
        }}
      >
        <Cancel sx={{ fontSize: 72, color: '#E53935', mb: 2 }} />
        <Typography variant="h4" fontWeight={800} color="text.secondary" sx={{ mb: 3, letterSpacing: '-0.03em' }}>
          Payment Failed
        </Typography>

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
                    <Chip label="Failed" size="small" color="error" />
                    <Typography fontWeight={700}>${total} USD</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/payment/${sessionId}`)}
          sx={{ py: 1.5, fontWeight: 600, px: 6 }}
        >
          Try again
        </Button>
      </Paper>
    </Box>
    </AnimatedPage>
  );
};

export default PaymentFailed;
