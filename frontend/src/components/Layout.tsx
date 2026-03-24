import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Dashboard,
  Chat,
  History,
  Person,
  HelpOutline,
  School,
  Explore,
  Notifications,
  DarkMode,
  LightMode,
  VideoLibrary,
} from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Explore', icon: <Explore />, path: '/explore' },
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Messages', icon: <Chat />, path: '/messages' },
  { text: 'Call History', icon: <History />, path: '/call-history' },
  { text: 'Videos', icon: <VideoLibrary />, path: '/videos' },
  { text: 'My Profile', icon: <Person />, path: '/profile' },
  { text: 'Get Support', icon: <HelpOutline />, path: '/support' },
  { text: 'Become a Mentor', icon: <School />, path: '/become-mentor' },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ pt: 2 }}>
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'scale(1.05)', letterSpacing: '0.5px' },
          }}
          onClick={() => {
            navigate('/');
            setMobileOpen(false);
          }}
        >
          Mentr
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {menuItems.map((item, index) => (
          <Fade in timeout={300 + index * 60} key={item.text}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main + '15',
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                },
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '10',
                  paddingLeft: '20px',
                },
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </Fade>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
              <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
                {mode === 'light' ? <DarkMode /> : <LightMode sx={{ color: '#FFD700' }} />}
              </IconButton>
            </Tooltip>

            <IconButton onClick={() => navigate('/messages')} sx={{ mr: 1 }}>
              <Badge badgeContent={7} color="error">
                <Chat />
              </Badge>
            </IconButton>

            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={10} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={() => navigate('/profile')}>
              <Avatar
                src="https://i.pravatar.cc/150?img=68"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            bgcolor: 'background.default',
            overflow: 'auto',
            animation: 'fadeInMain 0.4s ease-out',
            '@keyframes fadeInMain': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
