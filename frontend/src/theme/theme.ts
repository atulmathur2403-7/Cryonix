import { createTheme, ThemeOptions } from '@mui/material/styles';

const commonComponents: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent',
      },
      '*::-webkit-scrollbar': { width: 6 },
      '*::-webkit-scrollbar-track': { background: 'transparent' },
      '*::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: 3 },
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 12,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #1a3fc4 0%, #7C5CFC 100%)',
        boxShadow: '0 2px 12px rgba(26,63,196,0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #0f2a8a 0%, #5a3db8 100%)',
          boxShadow: '0 6px 24px rgba(26,63,196,0.4)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        border: '1px solid rgba(0,0,0,0.06)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 24,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        transition: 'all 0.25s ease',
      },
      clickable: {
        '&:hover': {
          transform: 'scale(1.04)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'scale(1.08)',
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.25s ease',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 24,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 14,
          transition: 'all 0.25s ease',
          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(26, 63, 196, 0.1)',
          },
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease',
        '&:hover': {
          opacity: 1,
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'scale(1.08)',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 10,
        backdropFilter: 'blur(20px)',
        fontSize: '0.8rem',
        fontWeight: 500,
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a3fc4',
      light: '#4e6bdb',
      dark: '#0f2a8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C5CFC',
      light: '#9b82fd',
      dark: '#5a3db8',
    },
    background: {
      default: '#f8f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#6e6e73',
    },
    success: {
      main: '#34C759',
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FF9500',
    },
    info: {
      main: '#007AFF',
    },
    divider: 'rgba(0,0,0,0.06)',
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { letterSpacing: '-0.01em', lineHeight: 1.6 },
    body2: { letterSpacing: '-0.01em', lineHeight: 1.5 },
    button: { letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 16 },
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.72)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          color: '#1d1d1f',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4e6bdb',
      light: '#7b93e8',
      dark: '#1a3fc4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C5CFC',
      light: '#9b82fd',
      dark: '#5a3db8',
    },
    background: {
      default: '#000000',
      paper: '#1c1c1e',
    },
    text: {
      primary: '#f5f5f7',
      secondary: '#a1a1a6',
    },
    success: {
      main: '#30D158',
    },
    error: {
      main: '#FF453A',
    },
    warning: {
      main: '#FF9F0A',
    },
    info: {
      main: '#0A84FF',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { letterSpacing: '-0.01em', lineHeight: 1.6 },
    body2: { letterSpacing: '-0.01em', lineHeight: 1.5 },
    button: { letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 16 },
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(28,28,30,0.72)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          color: '#f5f5f7',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(28,28,30,0.8)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});
