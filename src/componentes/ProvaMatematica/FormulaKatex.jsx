import { useMemo } from 'react';
import katex from 'katex';
import { Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

/**
 * FormulaKatex — tipografia matemática real (não uma imagem, não texto
 * aproximado com "^" e "/").
 *
 * Acessibilidade: o HTML do KaTeX não é bem lido por leitores de tela sem
 * suporte a MathML, então a fórmula visual é `aria-hidden` e a leitura em
 * português (`leituraTextual`) fica ao lado, só para quem usa leitor de tela.
 *
 * Props:
 *   tex             string — expressão em LaTeX
 *   leituraTextual  string — a mesma fórmula em português, para leitor de tela
 */
export default function FormulaKatex({ tex, leituraTextual }) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: true, output: 'html' }),
    [tex],
  );

  return (
    <Box sx={{ my: 1 }}>
      <Box
        aria-hidden="true"
        sx={{ overflowX: 'auto', py: 0.5, color: 'text.primary', '& .katex': { fontSize: '1.3rem' } }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {leituraTextual && <Box sx={visuallyHidden}>{leituraTextual}</Box>}
    </Box>
  );
}
