import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <Cancel sx={{ fontSize: 72, color: '#E53935', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} color="text.secondary" sx={{ mb: 3 }}>
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
                    <Chip label="Failed" size="small" color="error" />
                    <Typography fontWeight={700}>$22 USD</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/payment/new')}
          sx={{ py: 1.5, fontWeight: 600, px: 6 }}
        >
          Try again
        </Button>
      </Paper>
    </Box>
  );
};

export default PaymentFailed;
