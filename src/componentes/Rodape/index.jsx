import { useState } from 'react';

import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';

import ModalMetodologia from '../ModalMetodologia';
import ModalSobre from '../Sobre';

/**
 * Rodape — Rodapé institucional escuro ancorado (Slate Charcoal #1E293B)
 *
 * Filosofia visual (MD3):
 * - Fundo escuro ancora a página e descansa os olhos ao fim da rolagem.
 * - Sem blocos brancos — só texto claro em escala de cinza sobre charcoal.
 * - Layout compacto em grid 3 colunas + barra de copyright fina.
 * - Acento vermelho institucional pontual (ícone da marca).
 */

// ─── Constantes de cor local (não disponíveis no tema claro) ─────────────────
const DARK = {
  bg: '#1E293B',           // Slate Charcoal — fundo principal do rodapé
  bgBar: '#162030',        // Slate mais escuro — barra de copyright
  border: '#2D3F55',       // Separador discreto sobre o fundo escuro
  textPrimary: '#E2E8F0',  // Slate 200 — texto principal (marca, nomes)
  textSecondary: '#94A3B8',// Slate 400 — subtextos, legendas
  link: '#CBD5E1',         // Slate 300 — links em repouso
  linkHover: '#FFFFFF',    // Branco — hover nos links
  accent: '#c41230',       // Vermelho institucional — pontual
};

export default function Rodape() {
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSobreAberto, setModalSobreAberto] = useState(false);

  const anoAtual = new Date().getFullYear();

  const linkSx = {
    color: DARK.link,
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
    '&:hover': { color: DARK.linkHover },
  };

  return (
    <>
      <Box
        component="footer"
        sx={{ bgcolor: DARK.bg, mt: 'auto' }}
      >
        {/* ── Corpo principal ────────────────────────────────────────────── */}
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 0 }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
            sx={{ py: { xs: 4, md: 4.5 } }}
          >
            {/* ── Coluna 1: Marca + missão ──────────────────────────────── */}
            <Stack spacing={1.5} sx={{ maxWidth: { md: 260 } }}>
              {/* Logo inline */}
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    background:
                      'linear-gradient(135deg, #c41230 0%, #a20000 55%, #7a0000 100%)',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(162,0,0,0.35)',
                  }}
                >
                  <AccountBalanceRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: DARK.textPrimary,
                    letterSpacing: '-0.02em',
                  }}
                >
                  GovTrace
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                sx={{ color: DARK.textSecondary, lineHeight: 1.6 }}
              >
                Monitoramento Preventivo para Licitações Públicas
              </Typography>
            </Stack>

            {/* ── Coluna 2: Autoria acadêmica ────────────────────────────── */}
            <Stack spacing={0.75} sx={{ maxWidth: { md: 260 } }}>
              <Typography
                variant="caption"
                sx={{
                  color: DARK.accent,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontSize: '0.65rem',
                  mb: 0.5,
                }}
              >
                Projeto Acadêmico
              </Typography>
              <Typography sx={{ color: DARK.textPrimary, fontSize: '0.8125rem', fontWeight: 600 }}>
                FATEC Bragança Paulista
              </Typography>
              <Typography sx={{ color: DARK.textSecondary, fontSize: '0.75rem' }}>
                Gestão da Tecnologia da Informação
              </Typography>
              <Typography sx={{ color: DARK.textSecondary, fontSize: '0.75rem', mt: 0.5 }}>
                Enzo Corcetti · Lucas Policene · Pedro Stein
              </Typography>
              <Typography sx={{ color: DARK.textSecondary, fontSize: '0.75rem' }}>
                Orientador: Prof. Clyton José da Rosa

              </Typography>
            </Stack>

            {/* ── Coluna 3: Links + fonte ────────────────────────────────── */}
            <Stack spacing={2} sx={{ maxWidth: { md: 200 } }}>
              {/* Links de navegação */}
              <Stack spacing={0.75}>
                <Typography
                  variant="caption"
                  sx={{
                    color: DARK.accent,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    fontSize: '0.65rem',
                    mb: 0.25,
                  }}
                >
                  Links
                </Typography>
                {[
                  { rotulo: 'Sobre', acao: () => setModalSobreAberto(true) },
                  { rotulo: 'Metodologia', acao: () => setModalAberto(true) },
                  {
                    rotulo: 'Fontes (TCE-SP)',
                    href: 'https://transparencia.tce.sp.gov.br/',
                    externo: true,
                  },
                  { rotulo: 'Acessibilidade', href: '#' },
                ].map((item) => (
                  <Link
                    key={item.rotulo}
                    href={item.href ?? '#'}
                    target={item.externo ? '_blank' : undefined}
                    rel={item.externo ? 'noopener noreferrer' : undefined}
                    onClick={item.acao}
                    underline="none"
                    sx={linkSx}
                  >
                    {item.rotulo}
                  </Link>
                ))}
              </Stack>

              {/* Fonte de dados */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: DARK.accent,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    fontSize: '0.65rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Dados Públicos
                </Typography>
                <Typography sx={{ color: DARK.textSecondary, fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Tribunal de Contas do Estado de São Paulo — TCE-SP
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>

        {/* ── Barra de copyright ────────────────────────────────────────── */}
        <Box sx={{ bgcolor: DARK.bgBar }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ py: 1.75 }}
              spacing={0.5}
            >
              <Typography
                variant="caption"
                sx={{ color: DARK.textSecondary, fontSize: '0.7rem' }}
              >
                © {anoAtual} GovTrace · Projeto acadêmico — FATEC Bragança Paulista
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#4A5E75', fontSize: '0.7rem' }}
              >
                Dados públicos: TCE-SP
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Modal de metodologia disparado pelo link do rodapé */}
      <ModalMetodologia
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />

      {/* Modal institucional Sobre disparado pelo link do rodapé */}
      <ModalSobre
        aberto={modalSobreAberto}
        aoFechar={() => setModalSobreAberto(false)}
      />
    </>
  );
}