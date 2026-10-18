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
 * BUG CORRIGIDO: `-webkit-line-clamp` (usado na v1) é um truque de truncagem
 * específico de engine — em alguns navegadores mobile, html-to-image
 * (que serializa o DOM num <foreignObject> de SVG e rasteriza via canvas)
 * simplesmente não o respeita. O texto inteiro acaba renderizando, estoura a
 * altura fixa de 1080px e o canvas corta no meio da frase, sem reticências.
 * A correção tem duas camadas, nenhuma delas dependente de engine:
 *   1. O bloco de texto variável (explicação) vira um item flex com
 *      `flex: 1, minHeight: 0, overflow: 'hidden'` — comportamento de caixa
 *      básico, suportado identicamente por qualquer motor de renderização,
 *      garante que ele nunca empurra o rodapé pra fora do cartão.
 *   2. O texto é truncado em JS (truncarTexto) ANTES de renderizar, com
 *      reticências num ponto de palavra — resultado idêntico em qualquer
 *      aparelho, não depende de como aquele navegador calcula "3 linhas".
 */

// Orçamento de caracteres calibrado para a largura útil do cartão (952px,
// fonte 20px) folgado o bastante pra caber ~3 linhas mesmo com fontes de
// fallback um pouco mais largas — é só um teto de segurança, não o
// mecanismo principal de corte (esse é o container flex abaixo).
const ORCAMENTO_EXPLICACAO = 260;

const truncarTexto = (texto, maxCaracteres) => {
  if (!texto || texto.length <= maxCaracteres) return texto;
  const cortado = texto.slice(0, maxCaracteres);
  const ultimoEspaco = cortado.lastIndexOf(' ');
  return (ultimoEspaco > 40 ? cortado.slice(0, ultimoEspaco) : cortado).trimEnd() + '…';
};

/**
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
  const explicacao = truncarTexto(insightEducativo, ORCAMENTO_EXPLICACAO);

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
          <Box sx={{ mt: '6px', '& .MuiChip-root': { fontSize: '15px', height: 32 } }}>
            <BadgeStatus alerta={alerta} />
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
        {tituloExibido}
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

      {/* ── Explicação cidadã ──────────────────────────────────────────
          flex:1 + minHeight:0 + overflow:hidden = o espaço que sobrar até
          o rodapé, nunca mais — comportamento de caixa padrão, garantido
          em qualquer motor de renderização (ao contrário do line-clamp). */}
      {explicacao && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', mt: '32px' }}>
          <Typography sx={{ fontSize: '20px', color: 'text.secondary', lineHeight: 1.55 }}>
            {explicacao}
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
