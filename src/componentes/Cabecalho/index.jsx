import { useState } from 'react';

import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';

import ModalMetodologia from '../ModalMetodologia';
import ModalSobre from '../Sobre';


/**
 * Cabecalho — Header estilo OS moderno com identidade FATEC/SP
 *
 * Design:
 * - Fundo branco com borda inferior sutil. Nenhum bloco de cor pesado.
 * - Eleva com sombra suave ao rolar (efeito "floating AppBar").
 * - Ícone institucional em vermelho #a20000 com gradiente sutil.
 * - Badge "Beta Acadêmico" em dourado complementar.
 * - Botão "Metodologia" responsivo: label em desktop, ícone em mobile.
 * - ModalMetodologia preservado integralmente.
 */
export default function Cabecalho() {
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSobreAberto, setModalSobreAberto] = useState(false);

  // Eleva com sombra ao fazer scroll — padrão Material You
  const elevado = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
  });

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: elevado ? 'transparent' : 'divider',
          boxShadow: elevado
            ? '0 2px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)'
            : 'none',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ minHeight: { xs: '60px', sm: '68px' }, py: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: '100%' }}
            >
              {/* ── Identidade da marca ─────────────────────────────────── */}
              <Stack direction="row" alignItems="center" spacing={1.5}>

                {/* Ícone institucional com gradiente vermelho FATEC */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background:
                      'linear-gradient(135deg, #c41230 0%, #a20000 55%, #7a0000 100%)',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(162, 0, 0, 0.28)',
                  }}
                >
                  <AccountBalanceRoundedIcon fontSize="small" />
                </Box>

                {/* Logotipo + subtítulo */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {/* Nome do produto */}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '1.125rem', sm: '1.25rem' },
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.025em',
                        lineHeight: 1,
                      }}
                    >
                      GovTrace
                    </Typography>

                    {/* Badge de contexto acadêmico */}
                    <Chip
                      label="Beta Acadêmico"
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        bgcolor: 'secondary.light',
                        color: 'secondary.dark',
                        display: { xs: 'none', sm: 'flex' },
                        px: 0.5,
                      }}
                    />
                  </Stack>

                  {/* Subtítulo — visível apenas em telas médias+ */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      display: { xs: 'none', md: 'block' },
                      lineHeight: 1.2,
                      mt: 0.25,
                      letterSpacing: '0.01em',
                    }}
                  >
                    Transparência pública · TCE-SP
                  </Typography>
                </Box>
              </Stack>

              {/* ── Ações ───────────────────────────────────────────────── */}
              <Stack direction="row" alignItems="center" spacing={1}>

                {/* Desktop: Botão Sobre */}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<InfoOutlinedIcon />}
                  onClick={() => setModalSobreAberto(true)}
                  aria-label="Abrir informações institucionais do GovTrace"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    background: 'transparent',
                    borderColor: '#E2E8F0',
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minHeight: '38px',
                    px: 2,
                    boxShadow: 'none !important',
                    transform: 'none !important',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: 'rgba(162, 0, 0, 0.04)',
                    },
                  }}
                >
                  Sobre
                </Button>

                {/* Desktop: Botão Metodologia */}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<QueryStatsRoundedIcon />}
                  onClick={() => setModalAberto(true)}
                  aria-label="Abrir metodologia de auditoria"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    // Sobrescreve para estilo contido mas sem gradiente pesado
                    background: 'transparent',
                    borderColor: '#E2E8F0',
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minHeight: '38px',
                    px: 2,
                    boxShadow: 'none !important',
                    transform: 'none !important',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: 'rgba(162, 0, 0, 0.04)',
                    },
                  }}
                >
                  Metodologia
                </Button>

                {/* Mobile: Ícone Sobre */}
                <Tooltip title="Sobre o GovTrace" arrow>
                  <IconButton
                    onClick={() => setModalSobreAberto(true)}
                    aria-label="Sobre o GovTrace"
                    size="small"
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>

                {/* Mobile: Ícone Metodologia */}
                <Tooltip title="Ver metodologia de auditoria" arrow>
                  <IconButton
                    onClick={() => setModalAberto(true)}
                    aria-label="Metodologia de auditoria"
                    size="small"
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    <QueryStatsRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Modal de metodologia — preservado integralmente */}
      <ModalMetodologia
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />

      {/* Modal institucional Sobre */}
      <ModalSobre
        aberto={modalSobreAberto}
        aoFechar={() => setModalSobreAberto(false)}
      />
    </>
  );
}