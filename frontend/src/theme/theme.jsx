import { createTheme } from '@mui/material/styles';

// GeekSuite Unified Design System Colors
const colors = {
  primary: {
    main: '#6098CC', // Updated blue color
    light: '#7BB3F0',
    dark: '#2E5C8A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#7B61FF', // Accent Purple (MUI/Vite default)
    light: '#9B81FF',
    dark: '#5B41DF',
    contrastText: '#FFFFFF',
  },
  accent: {
    main: '#ff9800', // Orange 500
  },
  background: {
    default: '#f5f5f5', // Light Gray
    paper: '#ffffff', // White
  },
  text: {
    primary: '#212121', // Dark Gray
    secondary: '#757575', // Medium Gray
  },
  success: {
    main: '#28A745', // Green (MUI/Vite default)
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FFC107', // Yellow (MUI/Vite default)
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#DC3545', // Red (MUI/Vite default)
    light: '#E57373',
    dark: '#D32F2F',
  },
  info: {
    main: '#2196f3', // Blue 500
    light: '#64B5F6',
    dark: '#1976D2',
  },
};

// Typography following GeekSuite specifications
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
  },
};

// Component overrides following GeekSuite guidelines
const components = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#6098CC', // Updated blue color
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 0, // No border radius on top bar
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16, // rounded-2xl
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
        backgroundColor: '#ffffff',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 16, // rounded-2xl
        padding: '8px 16px', // Button Padding
        boxShadow: 'none',
        textTransform: 'none',
        minWidth: '44px', // Minimum tap target
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: 'scale(1.02)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        minWidth: '250px', // Minimum width on desktop
        '& .MuiOutlinedInput-root': {
          borderRadius: 16, // rounded-2xl
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16, // rounded-2xl
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16, // rounded-2xl
        fontSize: '0.875rem',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#6098CC', // Updated blue color sidebar
        borderRight: '1px solid rgba(0,0,0,0.1)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 16, // rounded-2xl
        margin: '4px 8px',
        '&.Mui-selected': {
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.15)',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
      },
    },
  },
};

// Create theme following GeekSuite specifications
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  typography,
  components,
  shape: {
    borderRadius: 16, // rounded-2xl
  },
  spacing: 8, // 8px base spacing units
});

export default theme;