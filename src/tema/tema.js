import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

const baseTheme = createTheme({
  palette: {
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#2C5E43',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C98B22',
      dark: '#8A5A00',
      contrastText: '#334155',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#B45309',
    },
    error: {
      main: '#B91C1C',
    },
    text: {
      primary: '#334155',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },

    valor: {
      fontFamily: '"Roboto Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 500,
    },
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :focus-visible {
          outline: 3px solid #2C5E43 !important;
          outline-offset: 2px !important;
        }
      `,
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: '44px',
          fontWeight: 500,
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: '44px',
          minWidth: '44px',
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          minHeight: '44px',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9',
          backgroundImage: 'none',
          transition:
            'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',

          // Pequeno efeito ao passar o mouse,
          // sem deixar o sistema com aparência de "card flutuante".
          '&:hover': {
            boxShadow: '0px 6px 28px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
}, ptBR);

export const temaGovTrace = responsiveFontSizes(baseTheme);