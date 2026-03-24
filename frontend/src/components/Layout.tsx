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
  Divider,
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
  ChevronLeft,
  ChevronRight,
  Login,
  Logout,
} from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContext';

const drawerWidth = 260;
const collapsedWidth = 88;

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
  const [collapsed, setCollapsed] = useState(true);
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const isCollapsed = collapsed && !isMobile;
  const currentWidth = isCollapsed ? collapsedWidth : drawerWidth;

  const tooltipStyles = {
    tooltip: {
      sx: {
        bgcolor: theme.palette.primary.main,
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: 600,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.75,
        boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
      },
    },
    arrow: {
      sx: { color: theme.palette.primary.main },
    },
  };

  const drawerContent = (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: isCollapsed ? 1.5 : 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed && (
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
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              bgcolor: theme.palette.action.hover,
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: theme.palette.primary.main + '20', transform: 'scale(1.1)' },
            }}
          >
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>
      <List sx={{ px: isCollapsed ? 1 : 1, flex: 1 }}>
        {menuItems.map((item, index) => (
          <Fade in timeout={300 + index * 60} key={item.text}>
            <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow componentsProps={tooltipStyles}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 1.5 : 2,
                  py: isCollapsed ? 1.2 : 1,
                  minHeight: 48,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    borderLeft: isCollapsed ? 'none' : `3px solid ${theme.palette.primary.main}`,
                  },
                  '&:hover': {
                    bgcolor: theme.palette.primary.main + '10',
                    paddingLeft: isCollapsed ? undefined : '20px',
                  },
                  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center', '& .MuiSvgIcon-root': { fontSize: isCollapsed ? 26 : 22 } }}>{item.icon}</ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </Fade>
        ))}
      </List>

      {/* Login/Logout at bottom */}
      <Divider sx={{ mx: isCollapsed ? 1 : 1 }} />
      <List sx={{ px: isCollapsed ? 1 : 1, pb: 1 }}>
        <Tooltip title={isCollapsed ? 'Login / Signup' : ''} placement="right" arrow componentsProps={tooltipStyles}>
          <ListItemButton
            onClick={() => navigate('/auth')}
            sx={{
              borderRadius: 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1.5 : 2,
              py: isCollapsed ? 1.2 : 1,
              minHeight: 48,
              '&:hover': {
                bgcolor: theme.palette.primary.main + '10',
              },
              transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center', '& .MuiSvgIcon-root': { fontSize: isCollapsed ? 26 : 22 } }}>
              <Login />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Login / Signup" />}
          </ListItemButton>
        </Tooltip>
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
            width: currentWidth,
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            '& .MuiDrawer-paper': {
              width: currentWidth,
              transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* App Name in Header */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => navigate('/')}
            >
              Mentr
            </Typography>

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
            p: { xs: 2, md: 4 },
            bgcolor: 'background.default',
            overflow: 'auto',
            animation: 'fadeInMain 0.5s ease-out',
            '@keyframes fadeInMain': {
              from: { opacity: 0, transform: 'translateY(8px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
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
