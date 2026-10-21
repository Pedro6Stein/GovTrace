import { Box, Typography } from '@mui/material';

import ChipStatus from './ChipStatus';
import { MOTOR_CONFIG, extrairMetrica, resumoCompartilhavel } from './motores';
import { formatarPeriodo } from '../../utilitarios/formatadores';

/**
 * CartaoCompartilhavel — a imagem gerada quando alguém clica em "Compartilhar"
 * numa cena do Laboratório Matemático.
 *
 * Dimensão FIXA (1080×1080 — formato universal: Instagram, WhatsApp, Twitter/X,
 * LinkedIn), independente do viewport de quem está vendo a tela: este
 * componente nunca é exibido diretamente, é montado fora da tela por
 * DialogoCompartilhar e rasterizado em PNG via html-to-image. Por ser um
 * layout de exportação (não de leitura em tela), reaproveita a MESMA lógica
 * de interpretação de dado da cena (motores.js e ChipStatus) para nunca
 * divergir do que o usuário já viu na tela. Não exibe nome de credor.
 *
 * O resumo (resumoCompartilhavel) nunca é cortado — o texto
 * completo sempre aparece. Quem controla isso é DialogoCompartilhar: ele
 * mede a altura real do texto renderizado (fora da tela) contra o espaço
 * disponível e, se não couber, reduz `fonteExplicacao` e mede de novo, até
 * caber inteiro. Por isso o tamanho da fonte da explicação vem de fora
 * (prop), não é fixo aqui — e os nós usados na medição têm `data-papel`
 * estável pra DialogoCompartilhar encontrá-los.
 */

/**
 * Props:
 *   tipo              'zScore' | 'benford' | 'fracionamento' | 'monopolio' | 'concentracao'
 *   dados             objeto retornado pelo motor correspondente
 *   municipio         string
 *   ano, mes          number
 *   fonteExplicacao   number (px) — tamanho da fonte da explicação, ajustado
 *                     por fora até o texto inteiro caber (default 20)
 */
export default function CartaoCompartilhavel({ tipo, dados, municipio, ano, mes, fonteExplicacao = 20 }) {
  const cfg = MOTOR_CONFIG[tipo];
  if (!dados || !cfg) return null;

  const { alerta } = dados;
  const { rotulo, titulo, Icone, cor: corIcone, fundo: fundoIcone } = cfg;
  const metrica = extrairMetrica(tipo, dados);
  const resumo = resumoCompartilhavel(tipo, dados);

  return (
    <Box
      sx={{
        width: 1080,
        height: 1080,
        bgcolor: '#FFFFFF',
        p: '64px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // nunca deixa NADA vazar do quadro de 1080×1080
        fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Marca ──────────────────────────────────────────────────────── */}
      <Box sx={{ flexShrink: 0 }}>
        <Typography sx={{ fontSize: '34px', fontWeight: 800, color: '#a20000', letterSpacing: '-0.01em', lineHeight: 1 }}>
          GovTrace
        </Typography>
        <Typography sx={{ fontSize: '17px', color: 'text.secondary', mt: '6px' }}>
          Transparência Pública · Beta Acadêmico
        </Typography>
      </Box>

      {/* ── Município e período (sempre 1 linha, mesmo com nome longo) ──── */}
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'text.primary',
          mt: '40px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {municipio} · {formatarPeriodo(mes, ano)}
      </Typography>

      {/* ── Motor + status ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mt: '32px', flexShrink: 0 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '18px',
            bgcolor: fundoIcone,
            border: '1px solid',
            borderColor: `${corIcone}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icone sx={{ fontSize: 36, color: corIcone }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
            {rotulo}
          </Typography>
          <Box sx={{ mt: '6px' }}>
            <ChipStatus destaque={Boolean(alerta)} sx={{ fontSize: '15px', height: 32 }} />
          </Box>
        </Box>
      </Box>

      {/* ── Título do resultado (até 2 linhas; o container cuida do resto) */}
      <Typography
        sx={{
          fontSize: '30px',
          fontWeight: 700,
          color: 'text.primary',
          lineHeight: 1.25,
          mt: '28px',
          flexShrink: 0,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          maxHeight: '76px', // 2 × 30px × 1.25 — teto real, não depende do clamp funcionar
        }}
      >
        {titulo}
      </Typography>

      {/* ── Número-herói ──────────────────────────────────────────────── */}
      {metrica && (
        <Box sx={{ mt: '32px', flexShrink: 0 }}>
          <Typography
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 800,
              fontSize: '140px',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: alerta ? '#92400E' : 'text.primary',
            }}
          >
            {metrica.valor}
          </Typography>
          <Typography sx={{ fontSize: '22px', color: 'text.secondary', mt: '12px' }}>
            {metrica.legenda}
          </Typography>
        </Box>
      )}

      {/* ── Resumo em linguagem comum (texto completo, fonte ajustada por fora) */}
      {resumo && (
        <Box data-papel="explicacao-container" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', mt: '32px' }}>
          <Typography
            data-papel="explicacao"
            sx={{ fontSize: `${fonteExplicacao}px`, color: 'text.secondary', lineHeight: 1.55 }}
          >
            {resumo}
          </Typography>
        </Box>
      )}

      {/* ── Rodapé ─────────────────────────────────────────────────────── */}
      <Box sx={{ flexShrink: 0, mt: '32px', pt: '32px', borderTop: '1px solid #E2E8F0' }}>
        <Typography sx={{ fontSize: '17px', color: 'text.disabled' }}>
          Dados oficiais do TCE-SP · processados pelo GovTrace · gov-trace.vercel.app
        </Typography>
      </Box>
    </Box>
  );
}
