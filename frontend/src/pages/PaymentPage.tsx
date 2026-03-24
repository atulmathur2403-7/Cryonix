import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import { Videocam } from '@mui/icons-material';
import { AnimatedPage, FadeIn, glassSx } from '../components/animations';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [paymentTab, setPaymentTab] = useState(0);
  const [saveCard, setSaveCard] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expDate: '',
    cvv: '',
  });

  const paymentMethods = ['Credit card', 'Google Pay', 'Paypal', 'Debit card', 'Internet Banking'];

  const handleConfirmPay = () => {
    // Randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    navigate(success ? '/order/success' : '/payment/failed');
  };

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.03em' }}>
        You are just one step away from your live call with{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          Andrew Smith
        </Box>
      </Typography>

      {/* Dialing Animation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Dialing....
        </Typography>
        <Videocam color="primary" />
        <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Andrew Smith
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Payment Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Currency & Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Change Currency</InputLabel>
              <Select defaultValue="USD" label="Change Currency">
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="INR">INR (₹)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" fontWeight={700}>
              Total Bill: $20 USD
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              overflow: 'hidden',
            }}
          >
            {/* Payment Method Tabs */}
            <Tabs
              value={paymentTab}
              onChange={(_, v) => setPaymentTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
              }}
            >
              {paymentMethods.map((method) => (
                <Tab key={method} label={method} />
              ))}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {paymentTab === 0 && (
                <>
                  <TextField
                    fullWidth
                    label="Card number"
                    placeholder="1234 5678 9012 3456"
                    sx={{ mb: 2 }}
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Card holder"
                    placeholder="John Doe"
                    sx={{ mb: 2 }}
                    value={cardData.holder}
                    onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Expiration date"
                        placeholder="MM/YY"
                        value={cardData.expDate}
                        onChange={(e) => setCardData({ ...cardData, expDate: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="CVV"
                        placeholder="123"
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {paymentTab !== 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    You will be redirected to {paymentMethods[paymentTab]} to complete payment.
                  </Typography>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    color="primary"
                  />
                }
                label="Save my card for future reservation"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
                By selecting the button below, I agree to the Property Rules, Terms and
                Conditions, Privacy Policy and COVID-19 Safety Requirements.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleConfirmPay}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                Confirm and Pay
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Sidebar - Billing */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              ...glassSx(theme.palette.mode === 'dark'),
              mb: 3,
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Discount Code:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                size="small"
                placeholder="Enter coupon code"
                fullWidth
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outlined" size="small">
                Apply
              </Button>
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Billing Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mentor's charges
              </Typography>
              <Typography variant="body2">$20 USD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tax 1:
              </Typography>
              <Typography variant="body2">$1 USD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tax 2:
              </Typography>
              <Typography variant="body2">$1 USD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Service Charges
              </Typography>
              <Typography variant="body2">$0 USD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Fees:
              </Typography>
              <Typography variant="body2">$0 USD</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Total Bill:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                $22 USD
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default PaymentPage;
