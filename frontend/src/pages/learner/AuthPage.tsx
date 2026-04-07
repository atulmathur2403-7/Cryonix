import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  Fade,
  Grow,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, Google, Facebook, Apple, ArrowForward, ArrowBack, School, AdminPanelSettings, Person } from '@mui/icons-material';
import { useUser } from '../../context/UserContext';

type AuthRole = 'learner' | 'mentor' | 'admin';

const roleConfig: Record<AuthRole, { label: string; icon: React.ReactNode; color: string; redirect: string; subtitle: string }> = {
  learner: { label: 'Learner', icon: <Person sx={{ fontSize: 18 }} />, color: '#1a3fc4', redirect: '/dashboard', subtitle: 'Find mentors and grow your skills' },
  mentor: { label: 'Mentor', icon: <School sx={{ fontSize: 18 }} />, color: '#10AC84', redirect: '/mentor-panel', subtitle: 'Manage sessions and connect with learners' },
  admin: { label: 'Admin', icon: <AdminPanelSettings sx={{ fontSize: 18 }} />, color: '#E94560', redirect: '/admin', subtitle: 'Monitor platform analytics and users' },
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signUpData, setSignUpData] = useState({ fullName: '', username: '', password: '', email: '', phone: '' });
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const { login, signup } = useUser();

  // Determine role from route
  const getInitialRole = (): AuthRole => {
    if (location.pathname.startsWith('/mentor-panel')) return 'mentor';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'learner';
  };
  const [selectedRole, setSelectedRole] = useState<AuthRole>(getInitialRole);

  useEffect(() => { setMounted(true); }, []);

  const cfg = roleConfig[selectedRole];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signup({ fullName: signUpData.fullName, username: signUpData.username, email: signUpData.email, password: signUpData.password });
      navigate(cfg.redirect);
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await login(signInData.email, signInData.password);
      navigate(cfg.redirect);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse at 20% 50%, rgba(78,107,219,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(124,92,252,0.1) 0%, transparent 50%), #000'
          : 'radial-gradient(ellipse at 20% 50%, rgba(26,63,196,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(124,92,252,0.04) 0%, transparent 50%), #f8f9fb',
      }}
    >
      {/* Floating orbs background */}
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.palette.primary.main}15, transparent 70%)`,
        top: '-15%', left: '-10%', filter: 'blur(60px)',
        animation: 'floatOrb1 8s ease-in-out infinite',
        '@keyframes floatOrb1': { '0%,100%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(30px, 20px)' } },
      }} />
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.palette.secondary.main}12, transparent 70%)`,
        bottom: '-10%', right: '-5%', filter: 'blur(60px)',
        animation: 'floatOrb2 10s ease-in-out infinite',
        '@keyframes floatOrb2': { '0%,100%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(-20px, -30px)' } },
      }} />

      <Fade in={mounted} timeout={800}>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, mx: 'auto', px: 3 }}>
          {/* Back to Home */}
          <Fade in={mounted} timeout={400}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                mb: 3,
                color: 'text.secondary',
                fontWeight: 600,
                borderRadius: 3,
                px: 2,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Back to Home
            </Button>
          </Fade>
          {/* Logo */}
          <Grow in={mounted} timeout={600}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background: `linear-gradient(135deg, ${cfg.color}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Mentr
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                {isSignUp ? 'Create your account to get started' : cfg.subtitle}
              </Typography>
            </Box>
          </Grow>

          {/* Role Selector */}
          <Grow in={mounted} timeout={700}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {(Object.keys(roleConfig) as AuthRole[]).map((role) => {
                const rc = roleConfig[role];
                const isActive = selectedRole === role;
                return (
                  <Chip
                    key={role}
                    icon={rc.icon as React.ReactElement}
                    label={rc.label}
                    clickable
                    onClick={() => setSelectedRole(role)}
                    sx={{
                      px: 1, py: 2.5, fontSize: '0.85rem', fontWeight: isActive ? 700 : 500,
                      bgcolor: isActive ? rc.color + '18' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      color: isActive ? rc.color : 'text.secondary',
                      border: `1.5px solid ${isActive ? rc.color : 'transparent'}`,
                      transition: 'all 0.3s ease',
                      '&:hover': { bgcolor: rc.color + '12' },
                      '& .MuiChip-icon': { color: isActive ? rc.color : 'text.secondary' },
                    }}
                  />
                );
              })}
            </Box>
          </Grow>

          {/* Glass card */}
          <Grow in={mounted} timeout={800}>
            <Box
              sx={{
                p: { xs: 3, sm: 4.5 },
                borderRadius: 4,
                background: isDark ? 'rgba(28,28,30,0.6)' : 'rgba(255,255,255,0.72)',
                backdropFilter: 'saturate(180%) blur(24px)',
                WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: isDark
                  ? '0 24px 80px rgba(0,0,0,0.5)'
                  : '0 24px 80px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.1)',
              }}
            >
              {!isSignUp ? (
                /* Sign In */
                <Box component="form" onSubmit={handleSignIn}>
                  {/* Social buttons */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                    {[
                      { icon: <Google />, label: 'Google', bg: isDark ? '#fff' : '#1d1d1f', color: isDark ? '#1d1d1f' : '#fff' },
                      { icon: <Facebook />, label: 'Facebook', bg: '#1877F2', color: '#fff' },
                      { icon: <Apple />, label: 'Apple', bg: isDark ? '#fff' : '#1d1d1f', color: isDark ? '#1d1d1f' : '#fff' },
                    ].map((s) => (
                      <Button
                        key={s.label}
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.3,
                          bgcolor: s.bg,
                          color: s.color,
                          borderRadius: 3,
                          boxShadow: 'none',
                          minWidth: 0,
                          background: s.bg,
                          '&:hover': { background: s.bg, opacity: 0.9, boxShadow: `0 4px 16px ${s.bg}30`, transform: 'translateY(-2px)' },
                        }}
                      >
                        {s.icon}
                      </Button>
                    ))}
                  </Box>

                  <Divider sx={{ my: 3, '&::before, &::after': { borderColor: theme.palette.divider } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontSize: '0.8rem' }}>
                      or continue with email
                    </Typography>
                  </Divider>

                  {authError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{authError}</Alert>}

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    sx={{ mb: 2 }}
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    sx={{ mb: 1 }}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ textAlign: 'right', mb: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={authLoading}
                    endIcon={authLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      mb: 3,
                      bgcolor: cfg.color,
                      '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                    }}
                  >
                    {authLoading ? 'Signing In...' : `Sign In as ${cfg.label}`}
                  </Button>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <Box
                      component="span"
                      sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => setIsSignUp(true)}
                    >
                      Sign Up
                    </Box>
                  </Typography>
                </Box>
              ) : (
                /* Sign Up */
                <Box component="form" onSubmit={handleSignUp}>
                  {authError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{authError}</Alert>}
                  <TextField
                    fullWidth label="Full Name" variant="outlined" sx={{ mb: 2 }}
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Username" variant="outlined" sx={{ mb: 2 }}
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Email" type="email" variant="outlined" sx={{ mb: 2 }}
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Phone Number" variant="outlined" sx={{ mb: 2 }}
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Password" variant="outlined" sx={{ mb: 3 }}
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={authLoading}
                    endIcon={authLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      mb: 3,
                      bgcolor: cfg.color,
                      '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                    }}
                  >
                    {authLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <Divider sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                      or sign up with
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                    {[
                      { icon: <Google />, bg: isDark ? '#fff' : '#1d1d1f', color: isDark ? '#1d1d1f' : '#fff' },
                      { icon: <Facebook />, bg: '#1877F2', color: '#fff' },
                      { icon: <Apple />, bg: isDark ? '#fff' : '#1d1d1f', color: isDark ? '#1d1d1f' : '#fff' },
                    ].map((s, i) => (
                      <Button
                        key={i}
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.3, bgcolor: s.bg, color: s.color, borderRadius: 3,
                          boxShadow: 'none', minWidth: 0, background: s.bg,
                          '&:hover': { background: s.bg, opacity: 0.9, boxShadow: `0 4px 16px ${s.bg}30`, transform: 'translateY(-2px)' },
                        }}
                      >
                        {s.icon}
                      </Button>
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Box
                      component="span"
                      sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => setIsSignUp(false)}
                    >
                      Sign In
                    </Box>
                  </Typography>
                </Box>
              )}
            </Box>
          </Grow>

          {/* Footer */}
          <Fade in={mounted} timeout={1200}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4, opacity: 0.6 }}>
              By continuing, you agree to Mentr's Terms of Service and Privacy Policy.
            </Typography>
          </Fade>
        </Box>
      </Fade>
    </Box>
  );
};

export default AuthPage;
