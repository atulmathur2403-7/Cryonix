import { createTheme, ThemeOptions } from '@mui/material/styles';

const commonComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 600,
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        transition: 'all 0.2s ease',
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
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          transition: 'all 0.2s ease',
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(26, 63, 196, 0.12)',
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
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'scale(1.08)',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a3fc4', // Royal Blue
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
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#64748b',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#E53935',
    },
    warning: {
      main: '#E8854A',
    },
    info: {
      main: '#1a3fc4',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a1a2e',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4e6bdb', // Lighter Royal Blue for dark mode
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
      default: '#0f1117',
      paper: '#1a1d2e',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#E53935',
    },
    warning: {
      main: '#E8854A',
    },
    info: {
      main: '#4e6bdb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1d2e',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1d2e',
          borderRight: '1px solid #2d3148',
        },
      },
    },
  },
});
