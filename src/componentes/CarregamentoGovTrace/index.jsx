import { useEffect, useId, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

/**
 * CarregamentoGovTrace — a logo do GovTrace se desenha enquanto os dados
 * oficiais chegam: o quadrado da marca surge, o prédio público é traçado
 * (frontão, colunas, base) e um "rastro" de dados passa a pulsar embaixo.
 *
 * Só CSS (sem Framer Motion): este componente aparece antes de qualquer
 * dado, então não pode pesar o carregamento inicial do site. Toda animação
 * usa `both` no fill-mode — com prefers-reduced-motion, a regra global do
 * tema zera as durações e a logo já aparece pronta, sem movimento.
 *
 * Props:
 *   titulo    frase principal (ex.: "Consultando os dados oficiais de ...")
 *   etapas    frases que se alternam explicando o que acontece agora
 *   compacto  versão menor (ex.: carregamento de uma aba)
 */

const surgir = keyframes`
  0%   { opacity: 0; transform: scale(0.6); }
  70%  { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;
const tracar = keyframes`
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
`;
const erguer = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;
// Um segmento de luz percorre o rastro, sem parar, enquanto carrega
const pulsoRastro = keyframes`
  from { stroke-dashoffset: 1.3; }
  to   { stroke-dashoffset: 0; }
`;
const mostrar = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const respirar = keyframes`
  0%, 100% { filter: drop-shadow(0 6px 14px rgba(162,0,0,0.28)); }
  50%      { filter: drop-shadow(0 10px 26px rgba(162,0,0,0.45)); }
`;
const subir = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const varrer = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(260%); }
`;

const ETAPAS_PADRAO = [
  'Buscando os lançamentos publicados pelo TCE-SP',
  'Organizando empenhos, liquidações e pagamentos',
  'Identificando a área de cada credor pela atividade oficial',
  'Calculando os padrões estatísticos do período',
];

const tracado = (atraso, duracao = 0.6) => ({
  strokeDasharray: 1,
  strokeDashoffset: 1,
  animation: `${tracar} ${duracao}s cubic-bezier(0.65, 0, 0.35, 1) ${atraso}s both`,
});

const COLUNAS = [36, 50, 64, 78];

export default function CarregamentoGovTrace({ titulo, etapas = ETAPAS_PADRAO, compacto = false }) {
  const [indice, setIndice] = useState(0);
  const idGradiente = `govtrace-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tamanho = compacto ? 76 : 116;

  useEffect(() => {
    if (etapas.length < 2) return undefined;
    const intervalo = setInterval(() => setIndice((i) => (i + 1) % etapas.length), 2600);
    return () => clearInterval(intervalo);
  }, [etapas.length]);

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: compacto ? 4 : { xs: 6, sm: 9 },
        px: 2.5,
        borderRadius: '20px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(162,0,0,0.06), transparent 60%)',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 120 120"
        width={tamanho}
        height={tamanho}
        aria-hidden="true"
        sx={{
          overflow: 'visible',
          animation: `${surgir} 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both, ${respirar} 2.8s ease-in-out 2.4s infinite`,
        }}
      >
        <defs>
          <linearGradient id={idGradiente} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c41230" />
            <stop offset="55%" stopColor="#a20000" />
            <stop offset="100%" stopColor="#7a0000" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="112" height="112" rx="30" fill={`url(#${idGradiente})`} />

        <g fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          {/* Frontão */}
          <Box component="path" d="M28 46 L60 25 L92 46 Z" pathLength="1" sx={tracado(0.35, 0.7)} />
          {/* Arquitrave */}
          <Box component="path" d="M30 53 H90" pathLength="1" sx={tracado(0.95, 0.35)} />
          {/* Base */}
          <Box component="path" d="M25 88 H95" pathLength="1" sx={tracado(1.55, 0.35)} />
        </g>

        {/* Colunas: erguem-se uma a uma. <rect> puro (não Box): no Box do
            MUI, width/height viram props de estilo e o retângulo some. */}
        <Box
          component="g"
          sx={{
            '& rect': {
              transformBox: 'fill-box',
              transformOrigin: '50% 100%',
              animation: `${erguer} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
            },
          }}
        >
          {COLUNAS.map((x, i) => (
            <rect key={x} x={x} y="58" width="6" height="25" rx="2" fill="#FFFFFF" style={{ animationDelay: `${1.1 + i * 0.1}s` }} />
          ))}
        </Box>

        {/* Rastro de dados ("Trace"): desenha uma vez e passa a pulsar */}
        <Box
          component="path"
          d="M20 101 H38 L45 94 L53 107 L61 96 L68 101 H100"
          pathLength="1"
          fill="none"
          stroke="rgba(255,209,102,0.35)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          sx={tracado(1.85, 0.6)}
        />
        <Box
          component="path"
          d="M20 101 H38 L45 94 L53 107 L61 96 L68 101 H100"
          pathLength="1"
          fill="none"
          stroke="#FFD166"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          sx={{
            strokeDasharray: '0.3 1',
            strokeDashoffset: 1.3,
            animation: `${mostrar} 0.2s ease-out 2.45s both, ${pulsoRastro} 1.4s linear 2.45s infinite`,
          }}
        />
      </Box>

      {!compacto && (
        <Typography
          sx={{
            mt: 2.5,
            fontSize: '1.375rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            animation: `${subir} 0.5s ease-out 0.5s both`,
          }}
        >
          GovTrace
        </Typography>
      )}

      {titulo && (
        <Typography
          sx={{
            mt: compacto ? 2 : 1,
            fontSize: compacto ? '1rem' : '1.0625rem',
            fontWeight: 600,
            color: 'text.primary',
            maxWidth: 520,
            lineHeight: 1.5,
            animation: `${subir} 0.5s ease-out 0.7s both`,
          }}
        >
          {titulo}
        </Typography>
      )}

      {/* Barra indeterminada: mostra que está trabalhando, sem prometer % */}
      <Box
        aria-hidden
        sx={{
          mt: 2,
          width: compacto ? 160 : 220,
          height: 4,
          borderRadius: '2px',
          bgcolor: '#EEF1F4',
          overflow: 'hidden',
          animation: `${subir} 0.5s ease-out 0.8s both`,
        }}
      >
        <Box
          sx={{
            width: '40%',
            height: '100%',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #a20000, #FB923C, #FFD166)',
            animation: `${varrer} 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
          }}
        />
      </Box>

      {etapas.length > 0 && (
        <Typography
          key={indice}
          sx={{
            mt: 1.75,
            minHeight: '1.5em',
            fontSize: '0.9375rem',
            color: 'text.secondary',
            animation: `${subir} 0.45s ease-out both`,
          }}
        >
          {etapas[indice]}…
        </Typography>
      )}
    </Box>
  );
}
