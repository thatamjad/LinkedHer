import { createTheme } from '@mui/material/styles';

// Modern Design Tokens
const designTokens = {
  colors: {
    // Primary Brand Colors - Enhanced with more variations
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    // Purple Accent
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5fbf',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    // Professional Navy
    navy: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Warm Grays
    gray: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      serif: ['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
  },
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    timingFunction: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.purple[500],
      light: designTokens.colors.purple[400],
      dark: designTokens.colors.purple[600],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: designTokens.colors.primary[100],
      light: designTokens.colors.primary[50],
      dark: designTokens.colors.primary[200],
      contrastText: '#333333',
    },
    professional: {
      main: designTokens.colors.navy[700],
      light: designTokens.colors.navy[600],
      dark: designTokens.colors.navy[800],
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#D68910',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3498DB', // safe blue
      light: '#5DADE2',
      dark: '#2874A6',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E74C3C',
      light: '#F1948A',
      dark: '#B03A2E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9F9F9',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 16px 24px rgba(0, 0, 0, 0.12)',
    '0px 24px 32px rgba(0, 0, 0, 0.12)',
    '0px 32px 40px rgba(0, 0, 0, 0.16)',
    '0px 40px 48px rgba(0, 0, 0, 0.16)',
    '0px 48px 56px rgba(0, 0, 0, 0.16)',
    '0px 56px 64px rgba(0, 0, 0, 0.2)',
    '0px 64px 72px rgba(0, 0, 0, 0.2)',
    '0px 72px 80px rgba(0, 0, 0, 0.2)',
    '0px 80px 88px rgba(0, 0, 0, 0.2)',
    '0px 88px 96px rgba(0, 0, 0, 0.2)',
    '0px 96px 104px rgba(0, 0, 0, 0.2)',
    '0px 104px 112px rgba(0, 0, 0, 0.2)',
    '0px 112px 120px rgba(0, 0, 0, 0.2)',
    '0px 120px 128px rgba(0, 0, 0, 0.2)',
    '0px 128px 136px rgba(0, 0, 0, 0.2)',
    '0px 136px 144px rgba(0, 0, 0, 0.2)',
    '0px 144px 152px rgba(0, 0, 0, 0.2)',
    '0px 152px 160px rgba(0, 0, 0, 0.2)',
    '0px 160px 168px rgba(0, 0, 0, 0.2)',
    '0px 168px 176px rgba(0, 0, 0, 0.2)',
    '0px 176px 184px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

// Anonymous dark theme
export const anonymousTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9C27B0', // deep purple
      light: '#BB86FC',
      dark: '#6A0DAD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#424242', // dark gray
      light: '#616161',
      dark: '#212121',
      contrastText: '#FFFFFF',
    },
    anonymous: {
      main: '#311B92', // deep indigo
      light: '#512DA8',
      dark: '#1A0377',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#00BFA5', // teal
      light: '#1DE9B6',
      dark: '#00897B',
      contrastText: '#000000',
    },
    warning: {
      main: '#FF6D00', // deep orange
      light: '#FF9E40',
      dark: '#D05600',
      contrastText: '#000000',
    },
    info: {
      main: '#2196F3', // bright blue
      light: '#64B5F6',
      dark: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F44336',
      light: '#FF7961',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // slightly more rounded for anonymous mode
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 16px 24px rgba(0, 0, 0, 0.2)',
    '0px 24px 32px rgba(0, 0, 0, 0.2)',
    '0px 32px 40px rgba(0, 0, 0, 0.2)',
    '0px 40px 48px rgba(0, 0, 0, 0.2)',
    '0px 48px 56px rgba(0, 0, 0, 0.2)',
    '0px 56px 64px rgba(0, 0, 0, 0.2)',
    '0px 64px 72px rgba(0, 0, 0, 0.2)',
    '0px 72px 80px rgba(0, 0, 0, 0.2)',
    '0px 80px 88px rgba(0, 0, 0, 0.2)',
    '0px 88px 96px rgba(0, 0, 0, 0.2)',
    '0px 96px 104px rgba(0, 0, 0, 0.2)',
    '0px 104px 112px rgba(0, 0, 0, 0.2)',
    '0px 112px 120px rgba(0, 0, 0, 0.2)',
    '0px 120px 128px rgba(0, 0, 0, 0.2)',
    '0px 128px 136px rgba(0, 0, 0, 0.2)',
    '0px 136px 144px rgba(0, 0, 0, 0.2)',
    '0px 144px 152px rgba(0, 0, 0, 0.2)',
    '0px 152px 160px rgba(0, 0, 0, 0.2)',
    '0px 160px 168px rgba(0, 0, 0, 0.2)',
    '0px 168px 176px rgba(0, 0, 0, 0.2)',
    '0px 176px 184px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          borderRadius: 16,
          background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme; 