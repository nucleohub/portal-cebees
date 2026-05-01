import { createTheme } from '@mui/material';

const GREEN = '#0E5107';
const GREEN_LIGHT = '#e8f5e3';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: GREEN,
      light: '#1a7a0f',
      dark: '#093905',
      contrastText: '#fff',
    },
    secondary: {
      main: '#374151',
      light: '#6b7280',
      dark: '#111827',
      contrastText: '#fff',
    },
    success: { main: '#16a34a', light: '#dcfce7', dark: '#166534' },
    warning: { main: '#d97706', light: '#fef3c7', dark: '#92400e' },
    error: { main: '#dc2626', light: '#fee2e2', dark: '#991b1b' },
    info: { main: '#3b82f6', light: '#eff6ff', dark: '#1d4ed8' },
    background: {
      default: '#f4f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#606060',
      disabled: '#9ca3af',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    button: { fontWeight: 600, textTransform: 'none' },
    caption: { fontSize: '0.6875rem', fontWeight: 500 },
    overline: { fontWeight: 700, letterSpacing: '0.05em' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.10)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 12px 32px rgba(0,0,0,0.14)',
    '0 16px 40px rgba(0,0,0,0.16)',
    '0 20px 48px rgba(0,0,0,0.18)',
    '0 24px 56px rgba(0,0,0,0.20)',
    '0 28px 64px rgba(0,0,0,0.22)',
    '0 32px 72px rgba(0,0,0,0.24)',
    '0 36px 80px rgba(0,0,0,0.26)',
    '0 40px 88px rgba(0,0,0,0.28)',
    '0 44px 96px rgba(0,0,0,0.30)',
    '0 48px 104px rgba(0,0,0,0.32)',
    '0 52px 112px rgba(0,0,0,0.34)',
    '0 56px 120px rgba(0,0,0,0.36)',
    '0 60px 128px rgba(0,0,0,0.38)',
    '0 64px 136px rgba(0,0,0,0.40)',
    '0 68px 144px rgba(0,0,0,0.42)',
    '0 72px 152px rgba(0,0,0,0.44)',
    '0 76px 160px rgba(0,0,0,0.46)',
    '0 80px 168px rgba(0,0,0,0.48)',
    '0 84px 176px rgba(0,0,0,0.50)',
    '0 88px 184px rgba(0,0,0,0.52)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
          backgroundColor: '#f4f5f7',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.6875rem',
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: GREEN,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: GREEN },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.6875rem',
            color: '#606060',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #f3f4f6',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#f9fafb' },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid #f9fafb',
            fontSize: '0.8125rem',
            padding: '11px 12px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, backgroundColor: '#f3f4f6', height: 5 },
        bar: { borderRadius: 99 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          padding: 4,
          minHeight: 38,
        },
        indicator: { display: 'none' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: 8,
          minHeight: 30,
          padding: '6px 16px',
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
          color: '#606060',
          '&.Mui-selected': {
            backgroundColor: GREEN,
            color: 'white',
          },
        },
      },
    },
  },
});

// Export design tokens for use in custom components
export { GREEN, GREEN_LIGHT };
void GREEN_LIGHT; // used in export
export const GRAY = '#606060';
