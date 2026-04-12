import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, useTheme, useMediaQuery, Tooltip,
  Divider, Menu, MenuItem, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, EventNote, CalendarMonth, Person, VideoLibrary,
  ArrowBack, Logout, BookOnline, DarkMode, LightMode, Notifications,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useThemeContext } from '../theme/ThemeContext';

const TOOLTIP_PROPS = {
  arrow: true, enterDelay: 400, leaveDelay: 100,
  slotProps: {
    tooltip: { sx: { bgcolor: 'rgba(30,30,30,0.95)', color: '#fff', fontSize: '0.75rem', fontWeight: 500, borderRadius: 1.5, px: 1.5, py: 0.6, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } },
    arrow: { sx: { color: 'rgba(30,30,30,0.95)' } },
  },
} as const;

const NAV_HEIGHT = 48;
const drawerWidth = 280;

const mentorNav = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/mentor-panel' },
  { text: 'Bookings', icon: <BookOnline />, path: '/mentor-panel/bookings' },
  { text: 'Sessions', icon: <EventNote />, path: '/mentor-panel/sessions' },
  { text: 'Availability', icon: <CalendarMonth />, path: '/mentor-panel/availability' },
  { text: 'My Shorts', icon: <VideoLibrary />, path: '/mentor-panel/shorts' },
  { text: 'Edit Profile', icon: <Person />, path: '/mentor-panel/profile' },
];

const MentorLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { mode, toggleTheme } = useThemeContext();
  const isDark = mode === 'dark';

  const mobileDrawer = (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => { navigate('/mentor-panel'); setMobileOpen(false); }}>Mentr</Typography>
        <Chip label="MENTOR" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
      </Box>
      <List sx={{ px: 1, flex: 1 }}>
        {mentorNav.map((item) => (
          <ListItemButton key={item.text} onClick={() => { navigate(item.path); setMobileOpen(false); }} selected={location.pathname === item.path}
            sx={{ borderRadius: 2, mb: 0.5, px: 2, py: 1, minHeight: 48,
              '&.Mui-selected': { bgcolor: theme.palette.primary.main + '15', color: theme.palette.primary.main, '& .MuiListItemIcon-root': { color: theme.palette.primary.main }, borderLeft: `3px solid ${theme.palette.primary.main}` },
              '&:hover': { bgcolor: theme.palette.primary.main + '10' }, transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ mx: 1 }} />
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton onClick={() => { navigate('/'); setMobileOpen(false); }} sx={{ borderRadius: 2, px: 2, py: 1, minHeight: 48, '&:hover': { bgcolor: theme.palette.primary.main + '10' } }}>
          <ListItemIcon sx={{ minWidth: 40 }}><ArrowBack /></ListItemIcon>
          <ListItemText primary="Back to Learner" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
          {mobileDrawer}
        </Drawer>
      )}

      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: isDark ? 'rgba(22, 22, 23, 0.82)' : 'rgba(251, 251, 253, 0.82)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, zIndex: theme.zIndex.appBar + 1 }}>
        <Toolbar sx={{ minHeight: { xs: 48, md: NAV_HEIGHT }, maxHeight: NAV_HEIGHT, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          {/* Left: Logo + Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}><MenuIcon /></IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', transition: 'opacity 0.3s ease', '&:hover': { opacity: 0.7 }, mr: 0.5 }} onClick={() => navigate('/mentor-panel')}>Mentr</Typography>
            <Chip label="MENTOR" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700 }} />
          </Box>

          {/* Center: Nav Items (desktop only) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {mentorNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Box key={item.text} sx={{ position: 'relative', px: 1.4, py: 0, display: 'flex', alignItems: 'center', height: NAV_HEIGHT, cursor: 'pointer' }}>
                    <Typography onClick={() => navigate(item.path)}
                      sx={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? theme.palette.primary.main : isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)', cursor: 'pointer', transition: 'color 0.3s ease', whiteSpace: 'nowrap', letterSpacing: '-0.01em', '&:hover': { color: theme.palette.primary.main } }}>
                      {item.text}
                    </Typography>
                    <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive ? '60%' : '0%', bgcolor: theme.palette.primary.main, borderRadius: '1px', transition: 'width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease', opacity: isActive ? 1 : 0 }} />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'} {...TOOLTIP_PROPS}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}>
                {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20, color: '#FFD700' }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications" {...TOOLTIP_PROPS}>
              <IconButton size="small" sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}><Notifications sx={{ fontSize: 20 }} /></IconButton>
            </Tooltip>
            <Tooltip title="Account" {...TOOLTIP_PROPS}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: 12, fontWeight: 700 }}>{user.fullName?.charAt(0)?.toUpperCase()}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 3, bgcolor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` } } }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight={700}>{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/mentor-panel/profile'); }} sx={{ py: 1.2, fontSize: '0.85rem' }}><Person sx={{ mr: 1.5, fontSize: 18 }} /> Edit Profile</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/mentor-panel'); }} sx={{ py: 1.2, fontSize: '0.85rem' }}><Dashboard sx={{ mr: 1.5, fontSize: 18 }} /> Dashboard</MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/'); }} sx={{ py: 1.2, fontSize: '0.85rem' }}><ArrowBack sx={{ mr: 1.5, fontSize: 18 }} /> Back to Learner</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/'); }} sx={{ py: 1.2, fontSize: '0.85rem', color: 'error.main' }}><Logout sx={{ mr: 1.5, fontSize: 18 }} /> Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 5, lg: 6 }, py: { xs: 2, md: 3 }, bgcolor: 'background.default', overflow: 'auto', animation: 'fadeInMain 0.5s ease-out', '@keyframes fadeInMain': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MentorLayout;
