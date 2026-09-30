import { useState } from 'react';

import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import ModalAcessibilidade from '../ModalAcessibilidade';
import ModalMetodologia from '../ModalMetodologia';
import ModalSobre from '../Sobre';

/**
 * Rodape — Rodapé institucional escuro (Slate Charcoal #1E293B)
 *
 * - Ações que abrem modais são <button> (não <a href="#">, que muda a URL
 *   e rola a página para o topo).
 * - Links externos avisam que abrem em nova aba (ícone + texto oculto).
 * - Todos os pares de cor medidos: ≥ 4,5:1 sobre o fundo escuro.
 */

const ESCURO = {
  fundo: '#1E293B',        // Slate 800
  fundoBarra: '#162030',
  borda: '#2D3F55',
  texto: '#E2E8F0',        // 13,5:1
  textoSuave: '#94A3B8',   //  5,7:1
  link: '#CBD5E1',         //  9,9:1
  titulo: '#FCA5A5',       //  7,7:1 — vermelho claro (o #c41230 anterior tinha 2,4:1)
};

// Mesmo visual para <a> e <button>, com área de clique ≥ 32px
const estiloLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  minHeight: 32,
  p: 0,
  color: ESCURO.link,
  fontSize: '0.9375rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': { color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '3px' },
  '&:focus-visible': { outline: '2px solid #FFFFFF !important', outlineOffset: '2px', borderRadius: '4px' },
};

function TituloColuna({ children, id }) {
  return (
    <Typography
      id={id}
      component="h2"
      sx={{ color: ESCURO.titulo, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8125rem', mb: 1.25 }}
    >
      {children}
    </Typography>
  );
}

function LinkExterno({ href, children }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" sx={estiloLink}>
      {children}
      <OpenInNewRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      <Box component="span" sx={visuallyHidden}>(abre em nova aba)</Box>
    </Link>
  );
}

export default function Rodape() {
  const [modal, setModal] = useState(null); // 'sobre' | 'metodologia' | 'acessibilidade' | null
  const fechar = () => setModal(null);
  const anoAtual = new Date().getFullYear();

  const acoes = [
    { id: 'sobre', rotulo: 'Sobre o projeto' },
    { id: 'metodologia', rotulo: 'Metodologia' },
    { id: 'acessibilidade', rotulo: 'Acessibilidade' },
  ];

  return (
    <>
      <Box component="footer" sx={{ bgcolor: ESCURO.fundo, mt: { xs: 4, sm: 6 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'minmax(0, 1.3fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr)',
              },
              gap: { xs: 4, md: 5 },
              py: { xs: 5, md: 6 },
            }}
          >
            {/* ── Marca + missão ─────────────────────────────────────────── */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                <Box
                  aria-hidden
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #c41230 0%, #a20000 55%, #7a0000 100%)',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: ESCURO.texto, letterSpacing: '-0.02em' }}>
                  GovTrace
                </Typography>
              </Stack>
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Transparência pública para todos: auditoria cidadã das despesas municipais de
                São Paulo, com código aberto.
              </Typography>
            </Box>

            {/* ── Autoria acadêmica ──────────────────────────────────────── */}
            <Box component="section" aria-labelledby="rodape-projeto">
              <TituloColuna id="rodape-projeto">Projeto acadêmico</TituloColuna>
              <Typography sx={{ color: ESCURO.texto, fontSize: '0.9375rem', fontWeight: 600 }}>
                FATEC Bragança Paulista
              </Typography>
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.875rem', mb: 1.25 }}>
                Gestão da Tecnologia da Informação
              </Typography>
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.875rem', lineHeight: 1.7 }}>
                Equipe: Pedro Stein, Enzo Corcetti e Lucas Policene
              </Typography>
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.875rem', lineHeight: 1.7 }}>
                Orientador: Prof. Clayton José da Rosa
              </Typography>
            </Box>

            {/* ── Navegação (modais) ─────────────────────────────────────── */}
            <Box component="nav" aria-labelledby="rodape-navegacao">
              <TituloColuna id="rodape-navegacao">Institucional</TituloColuna>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {acoes.map((acao) => (
                  <li key={acao.id}>
                    <Link component="button" type="button" onClick={() => setModal(acao.id)} sx={estiloLink}>
                      {acao.rotulo}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Box>

            {/* ── Fontes e código ────────────────────────────────────────── */}
            <Box component="section" aria-labelledby="rodape-fontes">
              <TituloColuna id="rodape-fontes">Dados e código</TituloColuna>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                <li><LinkExterno href="https://transparencia.tce.sp.gov.br/">Portal do TCE-SP</LinkExterno></li>
                <li><LinkExterno href="https://github.com/Pedro6Stein/GovTrace">Código do site</LinkExterno></li>
                <li><LinkExterno href="https://github.com/Pedro6Stein/Govtrace-Api">Código da API</LinkExterno></li>
              </Stack>
            </Box>
          </Box>
        </Container>

        {/* ── Barra de copyright ────────────────────────────────────────── */}
        <Box sx={{ bgcolor: ESCURO.fundoBarra, borderTop: `1px solid ${ESCURO.borda}` }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={0.5}
              sx={{ py: 2 }}
            >
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.8125rem' }}>
                © {anoAtual} GovTrace · Projeto acadêmico de código aberto (licença MIT)
              </Typography>
              <Typography sx={{ color: ESCURO.textoSuave, fontSize: '0.8125rem' }}>
                Fonte dos dados: Tribunal de Contas do Estado de São Paulo
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>

      <ModalSobre aberto={modal === 'sobre'} aoFechar={fechar} />
      <ModalMetodologia aberto={modal === 'metodologia'} aoFechar={fechar} />
      <ModalAcessibilidade aberto={modal === 'acessibilidade'} aoFechar={fechar} />
    </>
  );
}
