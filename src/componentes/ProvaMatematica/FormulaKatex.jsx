import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';
import { Box, Skeleton } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

/**
 * FormulaKatex — tipografia matemática real (não uma imagem, não texto
 * aproximado com "^" e "/").
 *
 * BUG CORRIGIDO: as fontes do KaTeX usam `font-display: block` (padrão do
 * pacote). Pela especificação CSS, isso deixa o texto TOTALMENTE INVISÍVEL
 * por até ~3s em conexões lentas, antes de qualquer fallback aparecer —
 * sem nenhum aviso visual, parecendo que "a fórmula não carrega". A
 * correção: a fórmula é sempre renderizada no DOM (isso dispara o download
 * da fonte), mas fica oculta atrás de um esqueleto até `document.fonts`
 * confirmar que o carregamento terminou (ou um teto de 1,2s, para nunca
 * travar a tela caso uma fonte específica falhe).
 *
 * Acessibilidade: o HTML do KaTeX não é bem lido por leitores de tela sem
 * suporte a MathML, então a fórmula visual é `aria-hidden` e a leitura em
 * português (`leituraTextual`) fica ao lado, só para quem usa leitor de tela.
 *
 * Props:
 *   tex             string — expressão em LaTeX
 *   leituraTextual  string — a mesma fórmula em português, para leitor de tela
 */

// Teto de segurança: nunca deixa a fórmula "presa" no esqueleto para sempre,
// mesmo se o navegador nunca disparar o evento de fonte pronta.
const TETO_ESPERA_FONTE_MS = 1200;

export default function FormulaKatex({ tex, leituraTextual }) {
  const [fontePronta, setFontePronta] = useState(false);

  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: true, output: 'html' }),
    [tex],
  );

  useEffect(() => {
    let ativo = true;
    const seguranca = setTimeout(() => ativo && setFontePronta(true), TETO_ESPERA_FONTE_MS);

    // document.fonts.ready só resolve depois que o navegador TERMINA de
    // baixar as fontes que algum elemento no DOM está usando — por isso a
    // fórmula (abaixo) já precisa estar renderizada, mesmo que visualmente
    // oculta, para o download ser disparado antes desta Promise.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (ativo) { setFontePronta(true); clearTimeout(seguranca); }
      });
    } else {
      setFontePronta(true); // Navegador sem CSS Font Loading API: mostra direto
    }

    return () => { ativo = false; clearTimeout(seguranca); };
  }, []);

  return (
    <Box sx={{ my: 1, position: 'relative', minHeight: 56 }}>
      {!fontePronta && (
        <Skeleton
          variant="rounded"
          height={40}
          width="60%"
          sx={{ mx: 'auto', position: 'absolute', inset: 0, borderRadius: '8px' }}
          aria-hidden
        />
      )}
      <Box
        aria-hidden="true"
        sx={{
          overflowX: 'auto',
          py: 0.5,
          color: 'text.primary',
          visibility: fontePronta ? 'visible' : 'hidden',
          '& .katex': { fontSize: '1.3rem' },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {leituraTextual && <Box sx={visuallyHidden}>{leituraTextual}</Box>}
    </Box>
  );
}
