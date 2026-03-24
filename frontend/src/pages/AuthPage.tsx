import React, { useState } from 'react';
import { AnimatedPage } from '../components/animations';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Google, Facebook, Apple } from '@mui/icons-material';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
  });
  const [signInData, setSignInData] = useState({
    username: '',
    password: '',
  });

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <AnimatedPage>
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        minHeight: '70vh',
      }}
    >
      <Grid container spacing={0}>
        {/* Sign Up Panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: { xs: '12px 12px 0 0', md: '12px 0 0 12px' },
              border: `1px solid ${theme.palette.divider}`,
              borderRight: { md: 'none' },
              height: '100%',
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSignUp}>
              <TextField
                fullWidth
                label="Your full name"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signUpData.fullName}
                onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Your username"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signUpData.username}
                onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
              />
              <TextField
                fullWidth
                label="Your Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Your Email"
                type="email"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Your Contact No"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signUpData.phone}
                onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
              />
              <Divider sx={{ my: 2 }}>or</Divider>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: theme.palette.primary.main,
                  py: 1.2,
                }}
              >
                Sign up
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sign In Panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: { xs: '0 0 12px 12px', md: '0 12px 12px 0' },
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fafbfc',
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Sign In
            </Typography>

            {/* Social Login Buttons */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              sx={{ mb: 1.5, justifyContent: 'flex-start', py: 1 }}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Facebook />}
              sx={{ mb: 1.5, justifyContent: 'flex-start', py: 1 }}
            >
              Sign in with Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Apple />}
              sx={{ mb: 2, justifyContent: 'flex-start', py: 1 }}
            >
              Sign in with Apple Id
            </Button>

            <Divider sx={{ my: 2 }}>or</Divider>

            <Box component="form" onSubmit={handleSignIn}>
              <TextField
                fullWidth
                label="Username / Email / Contact No"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signInData.username}
                onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
              />
              <TextField
                fullWidth
                label="Your Password"
                type={showSignInPassword ? 'text' : 'password'}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowSignInPassword(!showSignInPassword)}>
                        {showSignInPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ py: 1.2 }}
              >
                Sign in
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </AnimatedPage>
  );
};

export default AuthPage;
