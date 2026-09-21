import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

/**
 * GOVTRACE — TEMA INSTITUCIONAL
 *
 * Identidade visual: Vermelho FATEC/SP (#a20000) + Ouro/Âmbar (#C98B22)
 *
 * Diretrizes MD3 / Material You:
 * - Superfícies tonais: fundo neutro #F1F3F4 (Google Surface) para descanso visual.
 *   Branco #FFFFFF reservado às superfícies de Card/Paper, criando profundidade por contraste.
 * - Vermelho como acento e ação pontual — nunca como bloco de cor pesado.
 * - Sombras multicamada sutis, cantos generosos (16px base).
 * - Mobile: -webkit-tap-highlight-color transparente em todos os interativos.
 */

const baseTheme = createTheme(
  {
    // ─── PALETA ──────────────────────────────────────────────────────────────
    palette: {
      background: {
        // Superfície tonal neutra (Google #F1F3F4) — elimina a fadiga do branco puro.
        // Contraste tonal: page=#F1F3F4, card=#FFFFFF → profundidade sem sombras pesadas.
        default: '#F1F3F4',
        paper: '#FFFFFF',
      },

      // Identidade institucional — Vermelho FATEC / Estado de SP
      primary: {
        main: '#a20000',        // Vermelho institucional
        light: '#c41230',       // Vermelho vivo (hover, estados ativos)
        dark: '#7a0000',        // Vermelho escuro (estados pressionados)
        contrastText: '#FFFFFF',
      },

      // Complementar — Ouro/Âmbar para destaques e alertas financeiros
      secondary: {
        main: '#C98B22',
        light: '#F5D08A',       // Fundo suave dourado
        dark: '#8A5A00',        // Texto dourado sobre fundo claro
        contrastText: '#1E293B',
      },

      // ── Cores semânticas do Funil de Execução Orçamentária ───────────────
      empenhado: {
        main: '#0284C7',        // Azul vivo — intenção de gasto
        light: '#E0F2FE',
        dark: '#0369A1',
        contrastText: '#FFFFFF',
      },
      liquidado: {
        main: '#7C3AED',        // Roxo — comprovação de entrega
        light: '#EDE9FE',
        dark: '#5B21B6',
        contrastText: '#FFFFFF',
      },
      pago: {
        main: '#059669',        // Verde esmeralda — desembolso final
        light: '#D1FAE5',
        dark: '#047857',
        contrastText: '#FFFFFF',
      },

      // ── Status semânticos ────────────────────────────────────────────────
      success: {
        main: '#2E7D32',
        light: '#E8F5E9',
      },
      warning: {
        main: '#B45309',
        light: '#FEF3C7',
      },
      error: {
        main: '#B91C1C',
        light: '#FEE2E2',
      },
      info: {
        main: '#0369A1',
        light: '#E0F2FE',
      },

      // ── Texto ────────────────────────────────────────────────────────────
      text: {
        primary: '#1E293B',     // Slate 800
        secondary: '#64748B',   // Slate 500
        disabled: '#94A3B8',    // Slate 400
      },

      // Divisor mineral — suave sobre o fundo tonal #F1F3F4
      divider: '#E8EAED',
    },

    // ─── TIPOGRAFIA ──────────────────────────────────────────────────────────
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.015em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },

      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },

      // Variante custom para valores monetários
      valor: {
        fontFamily: '"Roboto Mono", "Courier New", monospace',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
    },

    // ─── FORMA ───────────────────────────────────────────────────────────────
    shape: {
      borderRadius: 16,
    },

    // ─── OVERRIDES ───────────────────────────────────────────────────────────
    components: {
      // Baseline global: fontes, mobile tap-highlight e focus ring
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: #F1F3F4;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* ── CORREÇÃO MOBILE ──────────────────────────────────────────────
             Remove o highlight cinzento padrão do iOS/Android ao tocar em
             qualquer elemento interativo. O feedback visual passa a ser feito
             exclusivamente via estados MUI (ripple, hover, active). */
          * {
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }

          :focus-visible {
            outline: 3px solid #a20000 !important;
            outline-offset: 2px !important;
          }

          /* Scrollbar sutil nos navegadores que suportam */
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        `,
      },

      // Botões: transições suaves, sem boxShadow agressivo
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minHeight: '44px',
            fontWeight: 600,
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            // Remove o estado cinzento persistente no mobile
            WebkitTapHighlightColor: 'transparent',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #c41230 0%, #a20000 60%, #7a0000 100%)',
            boxShadow: '0 2px 8px rgba(162, 0, 0, 0.28)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d41535 0%, #b20000 60%, #8a0000 100%)',
              boxShadow: '0 4px 16px rgba(162, 0, 0, 0.35)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 1px 4px rgba(162, 0, 0, 0.25)',
            },
          },
          outlinedPrimary: {
            borderColor: '#E2E8F0',
            color: '#64748B',
            boxShadow: 'none',
            '&:hover': {
              borderColor: '#a20000',
              color: '#a20000',
              backgroundColor: 'rgba(162, 0, 0, 0.04)',
              boxShadow: 'none',
            },
          },
        },
      },

      // Ripple: levemente suavizado para não parecer "explosão" no mobile
      MuiTouchRipple: {
        styleOverrides: {
          ripple: {
            animationDuration: '400ms',
          },
          child: {
            // Ripple ligeiramente opaco em vez de cinza pesado
            backgroundColor: 'currentColor',
            opacity: 0.1,
          },
        },
      },

      // IconButton: área de toque acessível, sem highlight mobile
      MuiIconButton: {
        styleOverrides: {
          root: {
            minHeight: '44px',
            minWidth: '44px',
            WebkitTapHighlightColor: 'transparent',
            transition: 'color 0.2s ease, background-color 0.2s ease',
          },
        },
      },

      // Inputs: altura mínima acessível, cantos suaves
      MuiInputBase: {
        styleOverrides: {
          root: { minHeight: '44px' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a20000',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              color: '#a20000',
            },
          },
        },
      },

      // Cards: sombra suave + micro-elevação no hover
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #E8EAED',
            backgroundImage: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 30px rgba(0,0,0,0.07)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },

      // Paper: superfícies flat
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          elevation0: { boxShadow: 'none' },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
          },
          elevation2: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 30px rgba(0,0,0,0.07)',
          },
        },
      },

      // Chips: pílulas elegantes
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: '8px',
            fontSize: '0.75rem',
            WebkitTapHighlightColor: 'transparent',
          },
        },
      },

      // Tabs: indicador vermelho institucional, transições suaves
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
            minHeight: '52px',
            letterSpacing: '0',
            transition: 'color 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
            // No mobile, evita o fundo cinzento persistente ao tocar
            '&:active': {
              backgroundColor: 'rgba(162, 0, 0, 0.06)',
            },
            '&.Mui-selected': {
              fontWeight: 700,
              color: '#a20000',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#a20000',
            height: '3px',
            borderRadius: '3px 3px 0 0',
          },
        },
      },

      // Tooltips: fundo escuro limpo
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
            padding: '8px 12px',
            borderRadius: '8px',
            maxWidth: '280px',
          },
          arrow: { color: '#1E293B' },
        },
      },

      // Dialog / Modal: cantos generosos e sombra rica
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
            boxShadow:
              '0 8px 32px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)',
          },
        },
      },

      // Drawer: cantos arredondados no lado de abertura
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRadius: '20px 0 0 20px' },
        },
      },

      // LinearProgress: cantos arredondados
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            backgroundColor: '#E2E8F0',
          },
          bar: { borderRadius: '4px' },
        },
      },

      // ListItem: sem highlight mobile no hover de listas
      MuiListItemButton: {
        styleOverrides: {
          root: {
            WebkitTapHighlightColor: 'transparent',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease',
          },
        },
      },
    },
  },
  ptBR,
);

export const temaGovTrace = responsiveFontSizes(baseTheme);