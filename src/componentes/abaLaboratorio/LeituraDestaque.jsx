import { useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';

import useContagem from '../../utilitarios/useContagem';
import { formatarPercentual } from '../../utilitarios/formatadores';

/**
 * LeituraDestaque — "Como ler este destaque".
 *
 * No lugar da antiga lista de empenhos: o que o destaque representa no
 * conjunto do mês (números que contam até o valor real e barras por área)
 * e por que esse padrão costuma acontecer (cartões com ícones). Nada aqui
 * leva a um documento, pessoa ou empresa.
 *
 * Props:
 *   leitura  { numeros, areas, causas } — ver leitura.js
 *   cor      cor do método (barras e ícones)
 *   fundo    fundo suave do método
 */

// Constantes em maiúscula: o ESLint não reconhece "motion.div" como uso em JSX
const MotionDiv = motion.div;
const MotionLi = motion.li;
const DESACELERAR = [0.05, 0.7, 0.1, 1];

function Numero({ valor, formatar, rotulo, visivel, ordem }) {
  const contado = useContagem(visivel ? valor : 0, 1200 + ordem * 150);
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="p" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontWeight: 800, lineHeight: 1.1, color: 'text.primary', letterSpacing: '-0.02em' }}>
        <span aria-hidden="true">{formatar(contado)}</span>
        <Box component="span" sx={visuallyHidden}>{formatar(valor)}</Box>
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.4 }}>{rotulo}</Typography>
    </Box>
  );
}

function BarraArea({ area, percentual, cor, visivel, ordem, reduzido }) {
  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      <Stack direction="row" justifyContent="space-between" spacing={1.5} sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', minWidth: 0, overflowWrap: 'anywhere' }}>{area}</Typography>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {formatarPercentual(percentual)}
        </Typography>
      </Stack>
      <Box aria-hidden sx={{ height: 8, borderRadius: '4px', bgcolor: '#E2E8F0', overflow: 'hidden' }}>
        <MotionDiv
          initial={{ width: reduzido ? `${percentual}%` : '0%' }}
          animate={{ width: visivel || reduzido ? `${Math.max(percentual, 1)}%` : '0%' }}
          transition={{ duration: reduzido ? 0 : 0.8, delay: reduzido ? 0 : 0.15 + ordem * 0.1, ease: DESACELERAR }}
          style={{ height: '100%', borderRadius: 4, background: cor }}
        />
      </Box>
    </Box>
  );
}

function CartaoCausa({ causa, cor, fundo, visivel, ordem, reduzido }) {
  const { Icone, titulo, texto } = causa;
  return (
    <MotionLi
      initial={reduzido ? false : { opacity: 0, y: 12 }}
      animate={visivel || reduzido ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: reduzido ? 0 : 0.45, delay: reduzido ? 0 : 0.35 + ordem * 0.08, ease: DESACELERAR }}
      style={{ listStyle: 'none', minWidth: 0 }}
    >
      <Box sx={{ height: '100%', p: 1.75, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: fundo, color: cor, display: 'grid', placeItems: 'center' }}>
          <Icone sx={{ fontSize: 20 }} />
        </Box>
        <Typography component="h6" sx={{ mt: 1, fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>{titulo}</Typography>
        <Typography sx={{ mt: 0.25, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.45 }}>{texto}</Typography>
      </Box>
    </MotionLi>
  );
}

export default function LeituraDestaque({ leitura, cor, fundo, idBase }) {
  const ref = useRef(null);
  const visivel = useInView(ref, { once: true, amount: 0.25 });
  const reduzido = Boolean(useReducedMotion());

  if (!leitura) return null;
  const { numeros, areas, causas } = leitura;
  const idTitulo = `${idBase}-leitura`;

  return (
    <Box
      ref={ref}
      component="section"
      aria-labelledby={idTitulo}
      sx={{ mt: 3, p: { xs: 2, sm: 2.5 }, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <InsightsRoundedIcon aria-hidden sx={{ fontSize: 20, color: cor }} />
        <Typography id={idTitulo} component="h4" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
          Como ler este destaque
        </Typography>
      </Stack>
      <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.5 }}>
        Os números abaixo descrevem o conjunto do mês, e não pessoas, empresas ou documentos.
      </Typography>

      {/* ── O destaque no conjunto do mês ─────────────────────────────── */}
      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: `repeat(${numeros.length}, minmax(0, 1fr))` }, gap: { xs: 2, sm: 3 } }}>
        {numeros.map((n, i) => (
          // Com movimento reduzido, o valor final aparece direto (sem esperar o bloco entrar na tela)
          <Numero key={n.rotulo} {...n} visivel={visivel || reduzido} ordem={i} />
        ))}
      </Box>

      {areas?.itens?.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Typography component="h5" sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary', mb: 1.25 }}>
            {areas.titulo}
          </Typography>
          <Stack component="ul" spacing={1.25} sx={{ m: 0, p: 0 }}>
            {areas.itens.map((a, i) => (
              <BarraArea key={a.area} {...a} cor={cor} visivel={visivel} ordem={i} reduzido={reduzido} />
            ))}
          </Stack>
        </Box>
      )}

      {/* ── Por que isso costuma acontecer ────────────────────────────── */}
      <Typography component="h5" sx={{ mt: 2.5, mb: 1.25, fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}>
        Por que isso costuma acontecer
      </Typography>
      <Box
        component="ul"
        sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}
      >
        {causas.map((c, i) => (
          <CartaoCausa key={c.titulo} causa={c} cor={cor} fundo={fundo} visivel={visivel} ordem={i} reduzido={reduzido} />
        ))}
      </Box>

      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
        <TableRowsRoundedIcon aria-hidden sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.5 }}>
          Um destaque estatístico não indica irregularidade. Todos os registros oficiais do período,
          sem nenhum destaque, estão na aba Base de Lançamentos.
        </Typography>
      </Stack>
    </Box>
  );
}
