import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useInView, useReducedMotion } from 'framer-motion';

import { CORES_PALCO } from '../../../tema/coresPalco';

/**
 * Palco — o "quadro-negro" das cenas matemáticas (estética Manim / 3Blue1Brown).
 *
 * Mede a largura real do container e usa um viewBox 1:1 com ela: 1 unidade
 * do SVG = 1 pixel. Sem isso, um viewBox fixo encolheria o texto das cenas
 * para ~6px num celular de 320px.
 *
 * A cena só começa quando entra na tela (useInView) e, com
 * prefers-reduced-motion, já nasce no estado final (ativo + reduzido).
 *
 * Props:
 *   altura     px do palco
 *   descricao  texto completo da cena para leitor de tela (role="img")
 *   legenda    [{ cor, rotulo, forma: 'ponto' | 'linha' | 'tracejado' | 'quadrado' }]
 *   children   ({ largura, altura, ativo, reduzido }) => elementos SVG
 */
export default function Palco({ altura, descricao, legenda, children }) {
  const refPalco = useRef(null);
  const [largura, setLargura] = useState(0);
  const visivel = useInView(refPalco, { once: true, amount: 0.3 });
  const reduzido = Boolean(useReducedMotion());
  const idGrade = `grade-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useLayoutEffect(() => {
    const no = refPalco.current;
    if (!no) return undefined;
    const medir = () => setLargura(Math.floor(no.getBoundingClientRect().width));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(no);
    return () => observador.disconnect();
  }, []);

  return (
    <Box>
      <Box
        ref={refPalco}
        sx={{
          bgcolor: CORES_PALCO.fundo,
          borderRadius: '14px',
          overflow: 'hidden',
          height: altura,
          boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.14)',
        }}
      >
        {largura > 0 && (
          <svg
            role="img"
            aria-label={descricao}
            width={largura}
            height={altura}
            viewBox={`0 0 ${largura} ${altura}`}
            style={{ display: 'block', fontFamily: 'inherit' }}
          >
            <defs>
              <pattern id={idGrade} width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke={CORES_PALCO.grade} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={largura} height={altura} fill={`url(#${idGrade})`} />
            {children({ largura, altura, ativo: visivel || reduzido, reduzido })}
          </svg>
        )}
      </Box>

      {legenda?.length > 0 && (
        <Stack
          component="ul"
          direction="row"
          useFlexGap
          flexWrap="wrap"
          columnGap={2}
          rowGap={0.75}
          sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25 }}
        >
          {legenda.map((item) => (
            <Stack component="li" key={item.rotulo} direction="row" spacing={0.75} alignItems="center">
              <MarcaLegenda {...item} />
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                {item.rotulo}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

// A marca da legenda fica sobre um pedacinho do fundo do palco: as cores
// das cenas foram escolhidas para o fundo escuro (amarelo sobre branco
// ficaria quase invisível).
function MarcaLegenda({ cor, forma = 'ponto' }) {
  const marca =
    forma === 'linha' || forma === 'tracejado' ? (
      <Box sx={{ width: 16, height: 0, borderTop: `3px ${forma === 'linha' ? 'solid' : 'dashed'} ${cor}` }} />
    ) : (
      <Box sx={{ width: 10, height: 10, bgcolor: cor, borderRadius: forma === 'quadrado' ? '2px' : '50%' }} />
    );

  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 26,
        height: 18,
        borderRadius: '5px',
        bgcolor: CORES_PALCO.fundo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {marca}
    </Box>
  );
}
