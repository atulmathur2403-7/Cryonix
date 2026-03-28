import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Divider,
  Menu,
  MenuItem,
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
  Login,
  Logout,
  TrendingUp,
  FiberManualRecord,
  Category,
  BarChart,
  EventNote,
  PlayCircleOutline,
  NewReleases,
  QuestionAnswer,
  ContactSupport,
  Flag,
  EmojiEvents,
  CheckCircle,
  ArrowForward,
  BookmarkBorder,
  Bookmark,
  Close,
  PlayArrow,
  Visibility,
  Delete,
} from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { useBookmarks } from '../context/BookmarkContext';
import StaggeredDrawer from './StaggeredDrawer';

const TOOLTIP_PROPS = {
  arrow: true,
  enterDelay: 400,
  leaveDelay: 100,
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: 'rgba(30,30,30,0.95)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      },
    },
    arrow: {
      sx: { color: 'rgba(30,30,30,0.95)' },
    },
  },
} as const;

const drawerWidth = 280;
const NAV_HEIGHT = 48;

interface DropdownItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  { text: 'Home', icon: <Home />, path: '/' },
  {
    text: 'Explore',
    icon: <Explore />,
    path: '/explore',
    dropdown: [
      { label: 'Browse Mentors', description: 'Find your perfect mentor', icon: <Explore sx={{ fontSize: 20 }} />, path: '/explore' },
      { label: 'Trending', description: 'Most popular this week', icon: <TrendingUp sx={{ fontSize: 20 }} />, path: '/explore' },
      { label: 'Online Now', description: 'Available for instant sessions', icon: <FiberManualRecord sx={{ fontSize: 20, color: '#4caf50' }} />, path: '/explore' },
      { label: 'By Category', description: 'Tech, Design, Business & more', icon: <Category sx={{ fontSize: 20 }} />, path: '/explore' },
    ],
  },
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    dropdown: [
      { label: 'Overview', description: 'Your learning at a glance', icon: <Dashboard sx={{ fontSize: 20 }} />, path: '/dashboard' },
      { label: 'My Sessions', description: 'Upcoming and past sessions', icon: <EventNote sx={{ fontSize: 20 }} />, path: '/call-history' },
      { label: 'Analytics', description: 'Track your progress', icon: <BarChart sx={{ fontSize: 20 }} />, path: '/dashboard' },
    ],
  },
  { text: 'Messages', icon: <Chat />, path: '/messages' },
  {
    text: 'Shorts',
    icon: <PlayCircleOutline />,
    path: '/shorts',
  },
  {
    text: 'Videos',
    icon: <VideoLibrary />,
    path: '/videos',
    dropdown: [
      { label: 'Browse Videos', description: 'Explore all video content', icon: <PlayCircleOutline sx={{ fontSize: 20 }} />, path: '/videos' },
      { label: 'Trending', description: 'Most watched videos', icon: <TrendingUp sx={{ fontSize: 20 }} />, path: '/videos' },
      { label: 'New Releases', description: 'Recently published content', icon: <NewReleases sx={{ fontSize: 20 }} />, path: '/videos' },
    ],
  },
  {
    text: 'Support',
    icon: <HelpOutline />,
    path: '/support',
    dropdown: [
      { label: 'FAQs', description: 'Frequently asked questions', icon: <QuestionAnswer sx={{ fontSize: 20 }} />, path: '/support' },
      { label: 'Contact Us', description: 'Get in touch with our team', icon: <ContactSupport sx={{ fontSize: 20 }} />, path: '/support' },
      { label: 'Report an Issue', description: 'Let us know about problems', icon: <Flag sx={{ fontSize: 20 }} />, path: '/support' },
    ],
  },
  {
    text: 'Become a Mentor',
    icon: <School />,
    path: '/become-mentor',
    dropdown: [
      { label: 'Apply Now', description: 'Start your mentor journey', icon: <School sx={{ fontSize: 20 }} />, path: '/become-mentor' },
      { label: 'Benefits', description: 'Why mentor on Mentr', icon: <EmojiEvents sx={{ fontSize: 20 }} />, path: '/become-mentor' },
      { label: 'Requirements', description: 'What you need to get started', icon: <CheckCircle sx={{ fontSize: 20 }} />, path: '/become-mentor' },
    ],
  },
];

const mobileMenuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Explore', icon: <Explore />, path: '/explore' },
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Messages', icon: <Chat />, path: '/messages' },
  { text: 'Call History', icon: <History />, path: '/call-history' },
  { text: 'Videos', icon: <VideoLibrary />, path: '/videos' },
  { text: 'Shorts', icon: <PlayCircleOutline />, path: '/shorts' },
  { text: 'My Profile', icon: <Person />, path: '/profile' },
  { text: 'Get Support', icon: <HelpOutline />, path: '/support' },
  { text: 'Become a Mentor', icon: <School />, path: '/become-mentor' },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { mode, toggleTheme } = useThemeContext();
  const { user, isLoggedIn, logout } = useUser();
  const { bookmarks, removeBookmark } = useBookmarks();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isDark = mode === 'dark';

  const cancelAllTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

  const openDropdown = useCallback((key: string) => {
    cancelAllTimers();
    setActiveDropdown(key);
    setDropdownVisible(true);
  }, [cancelAllTimers]);

  const closeDropdown = useCallback(() => {
    setDropdownVisible(false);
    cleanupTimerRef.current = setTimeout(() => setActiveDropdown(null), 450);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      closeDropdown();
    }, 200);
  }, [closeDropdown]);

  const cancelClose = useCallback(() => {
    cancelAllTimers();
  }, [cancelAllTimers]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setDropdownVisible(false);
  }, [location.pathname]);

  const handleNavClick = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
    setDropdownVisible(false);
  };

  const activeItem = navItems.find((item) => item.text === activeDropdown);

  const drawerContent = (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, pb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => { navigate('/'); setMobileOpen(false); }}
        >
          Mentr
        </Typography>
      </Box>
      <List sx={{ px: 1, flex: 1 }}>
        {mobileMenuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              px: 2,
              py: 1,
              minHeight: 48,
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.main + '15',
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                borderLeft: `3px solid ${theme.palette.primary.main}`,
              },
              '&:hover': { bgcolor: theme.palette.primary.main + '10' },
              transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ mx: 1 }} />
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={() => { navigate('/auth'); setMobileOpen(false); }}
          sx={{
            borderRadius: 2,
            px: 2, py: 1, minHeight: 48,
            '&:hover': { bgcolor: theme.palette.primary.main + '10' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><Login /></ListItemIcon>
          <ListItemText primary="Login / Signup" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        ref={navRef}
        sx={{
          bgcolor: isDark ? 'rgba(22, 22, 23, 0.82)' : 'rgba(251, 251, 253, 0.82)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 48, md: NAV_HEIGHT },
            maxHeight: NAV_HEIGHT,
            px: { xs: 2, md: 3 },
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Mobile Menu + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease',
                '&:hover': { opacity: 0.7 },
                mr: 1,
              }}
              onClick={() => navigate('/')}
            >
              Mentr
            </Typography>
          </Box>

          {/* Center: Nav Items (desktop only) */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = activeDropdown === item.text && dropdownVisible;
                const showUnderline = isActive || isHovered;
                return (
                  <Box
                    key={item.text}
                    onMouseEnter={() => {
                      cancelClose();
                      if (item.dropdown) {
                        openDropdown(item.text);
                      } else if (activeDropdown) {
                        closeDropdown();
                      }
                    }}
                    onMouseLeave={scheduleClose}
                    sx={{
                      position: 'relative',
                      px: 1.4,
                      py: 0,
                      display: 'flex',
                      alignItems: 'center',
                      height: NAV_HEIGHT,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography
                      onClick={() => handleNavClick(item.path)}
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 400,
                        color: showUnderline
                          ? theme.palette.primary.main
                          : isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {item.text}
                    </Typography>
                    {/* Underline indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        height: '2px',
                        width: showUnderline ? '60%' : '0%',
                        bgcolor: theme.palette.primary.main,
                        borderRadius: '1px',
                        transition: 'width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                        opacity: showUnderline ? 1 : 0,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'} {...TOOLTIP_PROPS}>
              <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
              >
                {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20, color: '#FFD700' }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Saved videos" {...TOOLTIP_PROPS}>
              <IconButton
                onClick={() => setBookmarkDrawerOpen(true)}
                size="small"
                sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
              >
                <Badge badgeContent={bookmarks.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                  {bookmarks.length > 0 ? <Bookmark sx={{ fontSize: 20 }} /> : <BookmarkBorder sx={{ fontSize: 20 }} />}
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Messages" {...TOOLTIP_PROPS}>
              <IconButton
                onClick={() => navigate('/messages')}
                size="small"
                sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
              >
                <Badge badgeContent={7} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                  <Chat sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications" {...TOOLTIP_PROPS}>
              <IconButton size="small" sx={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}>
                <Badge badgeContent={10} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                  <Notifications sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account" {...TOOLTIP_PROPS}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: theme.palette.primary.main,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight={700}>{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <MenuItem
                onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                sx={{ py: 1.2, fontSize: '0.85rem' }}
              >
                <Person sx={{ mr: 1.5, fontSize: 18 }} /> My Profile
              </MenuItem>
              <MenuItem
                onClick={() => { setAnchorEl(null); navigate('/dashboard'); }}
                sx={{ py: 1.2, fontSize: '0.85rem' }}
              >
                <Dashboard sx={{ mr: 1.5, fontSize: 18 }} /> Dashboard
              </MenuItem>
              <Divider />
              {isLoggedIn ? (
                <MenuItem
                  onClick={() => { setAnchorEl(null); logout(); navigate('/'); }}
                  sx={{ py: 1.2, fontSize: '0.85rem', color: 'error.main' }}
                >
                  <Logout sx={{ mr: 1.5, fontSize: 18 }} /> Sign Out
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => { setAnchorEl(null); navigate('/auth'); }}
                  sx={{ py: 1.2, fontSize: '0.85rem', color: 'primary.main' }}
                >
                  <Login sx={{ mr: 1.5, fontSize: 18 }} /> Sign In
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Apple-style Mega Dropdown */}
      {!isMobile && activeItem?.dropdown && (
        <>
          {/* Backdrop overlay with blur */}
          <Box
            onClick={closeDropdown}
            sx={{
              position: 'fixed',
              top: NAV_HEIGHT,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)',
              backdropFilter: dropdownVisible ? 'blur(12px)' : 'blur(0px)',
              WebkitBackdropFilter: dropdownVisible ? 'blur(12px)' : 'blur(0px)',
              zIndex: theme.zIndex.appBar - 1,
              opacity: dropdownVisible ? 1 : 0,
              transition: 'opacity 0.45s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.5s cubic-bezier(0.32, 0.72, 0, 1), -webkit-backdrop-filter 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: dropdownVisible ? 'auto' : 'none',
            }}
          />

          {/* Dropdown panel */}
          <Box
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            sx={{
              position: 'fixed',
              top: NAV_HEIGHT,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
              bgcolor: isDark ? 'rgba(22, 22, 23, 0.96)' : 'rgba(251, 251, 253, 0.96)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              overflow: 'hidden',
              maxHeight: dropdownVisible ? '400px' : '0px',
              opacity: dropdownVisible ? 1 : 0,
              transform: dropdownVisible ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'max-height 0.48s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1), transform 0.48s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.4s ease',
              boxShadow: dropdownVisible ? '0 16px 48px rgba(0,0,0,0.14)' : 'none',
            }}
          >
            <Box
              sx={{
                maxWidth: 980,
                mx: 'auto',
                px: 4,
                py: 4,
                display: 'flex',
                gap: 1,
              }}
            >
              {/* Left: Section Label */}
              <Box sx={{ minWidth: 160, pr: 4, borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                    mb: 2,
                  }}
                >
                  {activeItem.text}
                </Typography>
                <Typography
                  onClick={() => handleNavClick(activeItem.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                    transition: 'gap 0.2s ease',
                    '&:hover': { gap: 1 },
                  }}
                >
                  View All <ArrowForward sx={{ fontSize: 14 }} />
                </Typography>
              </Box>

              {/* Right: Dropdown items */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, pl: 3 }}>
                {activeItem.dropdown.map((dropItem, index) => (
                  <Box
                    key={dropItem.label}
                    onClick={() => handleNavClick(dropItem.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.25s ease',
                      opacity: dropdownVisible ? 1 : 0,
                      transform: dropdownVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                      transitionDelay: dropdownVisible ? `${index * 60 + 100}ms` : '0ms',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        '& .dropdown-icon': {
                          color: theme.palette.primary.main,
                          transform: 'scale(1.15)',
                        },
                        '& .dropdown-label': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <Box
                      className="dropdown-icon"
                      sx={{
                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        transition: 'all 0.25s ease',
                        mt: 0.2,
                      }}
                    >
                      {dropItem.icon}
                    </Box>
                    <Box>
                      <Typography
                        className="dropdown-label"
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: isDark ? '#f5f5f7' : '#1d1d1f',
                          transition: 'color 0.2s ease',
                          lineHeight: 1.3,
                        }}
                      >
                        {dropItem.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
                          lineHeight: 1.4,
                          mt: 0.3,
                        }}
                      >
                        {dropItem.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Bookmarks Drawer */}
      <StaggeredDrawer
        open={bookmarkDrawerOpen}
        onClose={() => setBookmarkDrawerOpen(false)}
        colors={isDark ? ['rgba(60,40,120,0.9)', theme.palette.primary.main] : ['rgba(180,170,220,0.7)', theme.palette.primary.main]}
        panelBg={isDark ? 'rgba(22,22,23,0.98)' : 'rgba(251,251,253,0.98)'}
        header={
          <Box
            className="sd-panel-header"
            sx={{
              bgcolor: isDark ? 'rgba(22,22,23,0.98)' : 'rgba(251,251,253,0.98)',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bookmark sx={{ color: '#fff', fontSize: 22 }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', color: isDark ? '#fff' : '#1d1d1f' }}>
                Saved Videos
              </Typography>
              {bookmarks.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    px: 1,
                    py: 0.15,
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                >
                  {bookmarks.length}
                </Typography>
              )}
            </Box>
            <Tooltip title="Close" {...TOOLTIP_PROPS}>
              <IconButton onClick={() => setBookmarkDrawerOpen(false)} size="small" sx={{ color: isDark ? '#fff' : '#1d1d1f' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        {bookmarks.length === 0 ? (
          <Box className="sd-empty" sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <BookmarkBorder sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
              No saved videos yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Videos you save will appear here so you can watch them later.
            </Typography>
          </Box>
        ) : (
          bookmarks.map((video) => (
            <Box
              key={video.id}
              className="sd-item"
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 1,
                mb: 0.5,
                borderRadius: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  '& .bookmark-play': { opacity: 1 },
                },
              }}
              onClick={() => {
                setBookmarkDrawerOpen(false);
                navigate(`/video/${video.id}`);
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 78,
                  borderRadius: 2,
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: '#000',
                }}
              >
                <Box
                  component="img"
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <Box
                  className="bookmark-play"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <PlayArrow sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Box sx={{ position: 'absolute', bottom: 3, right: 3, bgcolor: 'rgba(0,0,0,0.8)', color: '#fff', px: 0.6, py: 0.1, borderRadius: 0.75 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{video.duration}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    fontSize: '0.82rem',
                    mb: 0.3,
                  }}
                >
                  {video.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  {video.mentorName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                  <Visibility sx={{ fontSize: 11, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {video.viewCount >= 1_000_000 ? `${(video.viewCount / 1_000_000).toFixed(1)}M` : video.viewCount >= 1_000 ? `${Math.round(video.viewCount / 1_000)}K` : video.viewCount}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Remove from saved" {...TOOLTIP_PROPS}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(video.id);
                  }}
                  sx={{
                    alignSelf: 'center',
                    opacity: 0.5,
                    '&:hover': { opacity: 1, color: 'error.main' },
                  }}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </StaggeredDrawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3, md: 5, lg: 6 },
          py: { xs: 2, md: 3 },
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
  );
};

export default Layout;
