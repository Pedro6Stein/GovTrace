import { Box, Typography } from '@mui/material';

import { BadgeStatus, MOTOR_CONFIG, extrairMetrica } from './CardAlerta';
import { formatarPeriodo } from '../../utilitarios/formatadores';

/**
 * CartaoCompartilhavel — a imagem gerada quando alguém clica em "Compartilhar"
 * num CardAlerta.
 *
 * Dimensão FIXA (1080×1080 — formato universal: Instagram, WhatsApp, Twitter/X,
 * LinkedIn), independente do viewport de quem está vendo a tela: este
 * componente nunca é exibido diretamente, é montado fora da tela por
 * DialogoCompartilhar e rasterizado em PNG via html-to-image. Por ser um
 * layout de exportação (não de leitura em tela), reaproveita a MESMA lógica
 * de interpretação de dado do card real (MOTOR_CONFIG/extrairMetrica/
 * BadgeStatus, exportados de CardAlerta.jsx) para nunca divergir do que o
 * usuário já viu na tela.
 *
 * Props:
 *   tipo      'zScore' | 'benford' | 'fracionamento' | 'monopolio' | 'concentracao'
 *   dados     objeto retornado pelo motor correspondente
 *   municipio string
 *   ano, mes  number
 */
export default function CartaoCompartilhavel({ tipo, dados, municipio, ano, mes }) {
  const cfg = MOTOR_CONFIG[tipo];
  if (!dados || !cfg) return null;

  const { alerta, titulo, insightEducativo } = dados;
  const { rotulo, tituloNormal, Icone, corIcone, fundoIcone } = cfg;
  const tituloExibido = alerta ? titulo : tituloNormal;
  const metrica = extrairMetrica(tipo, dados);

  return (
    <Box
      sx={{
        width: 1080,
        height: 1080,
        bgcolor: '#FFFFFF',
        p: '64px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter Variable", Inter, sans-serif',
      }}
    >
      {/* ── Marca ──────────────────────────────────────────────────────── */}
      <Box>
        <Typography sx={{ fontSize: '34px', fontWeight: 800, color: '#a20000', letterSpacing: '-0.01em', lineHeight: 1 }}>
          GovTrace
        </Typography>
        <Typography sx={{ fontSize: '17px', color: 'text.secondary', mt: '6px' }}>
          Transparência Pública · Beta Acadêmico
        </Typography>
      </Box>

      {/* ── Município e período ───────────────────────────────────────── */}
      <Typography sx={{ fontSize: '24px', fontWeight: 600, color: 'text.primary', mt: '40px' }}>
        {municipio} · {formatarPeriodo(mes, ano)}
      </Typography>

      {/* ── Motor + status ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mt: '32px' }}>
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
          <Box sx={{ mt: '6px', '& .MuiChip-root': { fontSize: '15px', height: 32 } }}>
            <BadgeStatus alerta={alerta} />
          </Box>
        </Box>
      </Box>

      {/* ── Título do resultado ───────────────────────────────────────── */}
      <Typography sx={{ fontSize: '30px', fontWeight: 700, color: 'text.primary', lineHeight: 1.25, mt: '28px' }}>
        {tituloExibido}
      </Typography>

      {/* ── Número-herói ──────────────────────────────────────────────── */}
      {metrica && (
        <Box sx={{ mt: '32px' }}>
          <Typography
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 800,
              fontSize: '140px',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: alerta ? '#B45309' : 'text.primary',
            }}
          >
            {metrica.valor}
          </Typography>
          <Typography sx={{ fontSize: '22px', color: 'text.secondary', mt: '12px' }}>
            {metrica.legenda}
          </Typography>
        </Box>
      )}

      {/* ── Explicação cidadã, truncada ───────────────────────────────── */}
      {insightEducativo && (
        <Typography
          sx={{
            fontSize: '20px',
            color: 'text.secondary',
            lineHeight: 1.55,
            mt: '32px',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {insightEducativo}
        </Typography>
      )}

      {/* ── Rodapé ─────────────────────────────────────────────────────── */}
      <Box sx={{ mt: 'auto', pt: '32px', borderTop: '1px solid #E2E8F0' }}>
        <Typography sx={{ fontSize: '17px', color: 'text.disabled' }}>
          Dados oficiais do TCE-SP · processados pelo GovTrace · gov-trace.vercel.app
        </Typography>
      </Box>
    </Box>
  );
}
