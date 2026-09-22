import { useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

/**
 * CardAlerta — Card de resultado de motor estatístico
 *
 * Exibe de forma didática e rigorosamente neutra o resultado de cada
 * motor de análise da Aba 3. Nunca usa linguagem acusatória.
 *
 * Props:
 *   tipo          'zScore' | 'benford' | 'fracionamento' | 'monopolio' | 'concentracao'
 *   dados         objeto retornado pelo motor correspondente
 *   dadosBrutos   Despesa[] — para recalcular o gráfico de Benford se necessário
 */

// ─── Config visual e textual por tipo de motor ───────────────────────────────
const MOTOR_CONFIG = {
  zScore: {
    rotulo: 'Z-Score',
    tituloNormal: 'Distribuição Estatística Normal',
    Icone: ScatterPlotRoundedIcon,
    corIcone: '#0284C7',
    fundoIcone: '#EFF8FF',
    descricaoMetodo:
      'Compara cada empenho com a média do período. Valores com Z > 4 desvios padrões são classificados como atípicos.',
  },
  benford: {
    rotulo: 'Lei de Benford',
    tituloNormal: 'Distribuição Natural dos Dígitos',
    Icone: ShowChartRoundedIcon,
    corIcone: '#7C3AED',
    fundoIcone: '#F5F3FF',
    descricaoMetodo:
      'Em conjuntos de dados financeiros reais, ~30% dos valores começam com dígito 1. Desvios significativos indicam possível padrão não-orgânico.',
  },
  fracionamento: {
    rotulo: 'Fracionamento',
    tituloNormal: 'Sem Repetições Suspeitas',
    Icone: CompressRoundedIcon,
    corIcone: '#B45309',
    fundoIcone: '#FFFBEB',
    descricaoMetodo:
      'Detecta o mesmo valor sendo pago ≥ 5× para o mesmo fornecedor no período. Pode indicar divisão artificial de contratos para evitar licitação.',
  },
  monopolio: {
    rotulo: 'Monopólio por Órgão',
    tituloNormal: 'Contratos Distribuídos',
    Icone: BalanceRoundedIcon,
    corIcone: '#059669',
    fundoIcone: '#F0FDF4',
    descricaoMetodo:
      'Avalia se um único fornecedor recebeu ≥ 50% de todo o orçamento de um departamento que movimentou mais de R$ 50 mil.',
  },
  concentracao: {
    rotulo: 'Concentração CR5',
    tituloNormal: 'Mercado Pulverizado',
    Icone: PieChartOutlineRoundedIcon,
    corIcone: '#C98B22',
    fundoIcone: '#FEFCE8',
    descricaoMetodo:
      'Calcula a fatia dos 5 maiores fornecedores sobre o total do período. Acima de 30% indica dependência elevada de poucos parceiros.',
  },
};

// ─── Formata valor monetário compacto ─────────────────────────────────────────
const fmtMoeda = (v) =>
  'R$ ' +
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCompacto = (v) => {
  if (v >= 1_000_000) return 'R$ ' + (v / 1_000_000).toFixed(1).replace('.', ',') + ' mi';
  if (v >= 1_000) return 'R$ ' + (v / 1_000).toFixed(0) + ' mil';
  return fmtMoeda(v);
};

// ─── Badge de status ──────────────────────────────────────────────────────────
function BadgeStatus({ alerta }) {
  return (
    <Chip
      icon={
        alerta ? (
          <WarningAmberRoundedIcon sx={{ fontSize: '14px !important' }} />
        ) : (
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />
        )
      }
      label={alerta ? 'Ponto para Análise' : 'Comportamento Normal'}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        height: 24,
        color: alerta ? '#B45309' : '#2E7D32',
        bgcolor: alerta ? '#FEF3C7' : '#E8F5E9',
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
}

// ─── Detalhe: Z-Score ─────────────────────────────────────────────────────────
function DetalheZScore({ outliers }) {
  if (!outliers?.length) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Registros com desvio Z &gt; 4 — {outliers.length} identificado{outliers.length !== 1 ? 's' : ''}
      </Typography>
      <Stack spacing={0.75}>
        {outliers.slice(0, 5).map((o, i) => (
          <Stack key={i} direction="row" justifyContent="space-between" alignItems="center"
            sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.fornecedorNome}
              </Typography>
              <Typography variant="caption" color="text.secondary">{o.orgao}</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.8125rem', ml: 2, flexShrink: 0 }}>
              {fmtCompacto(o.valor)}
            </Typography>
          </Stack>
        ))}
        {outliers.length > 5 && (
          <Typography variant="caption" color="text.disabled">+ {outliers.length - 5} registros adicionais</Typography>
        )}
      </Stack>
    </Box>
  );
}

// ─── Detalhe: Benford ─────────────────────────────────────────────────────────
// Recalcula frequências observadas a partir dos dadosBrutos para exibir mini-gráfico textual
function DetalheBenford({ digitoSuspeito }) {
  if (!digitoSuspeito) return null;
  const esperados = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Dígito com comportamento atípico: <strong style={{ color: '#7C3AED' }}>{digitoSuspeito}</strong>
      </Typography>
      <Stack spacing={0.5}>
        {esperados.map((esperado, idx) => {
          const digito = idx + 1;
          const destaque = digito === digitoSuspeito;
          return (
            <Stack key={digito} direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: destaque ? 700 : 400, fontSize: '0.8125rem', color: destaque ? '#7C3AED' : 'text.secondary', width: 14, flexShrink: 0 }}>
                {digito}
              </Typography>
              <Box sx={{ flex: 1, height: 8, bgcolor: '#F1F3F4', borderRadius: '4px', overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%',
                  width: `${(esperado / 30.1) * 100}%`,
                  bgcolor: destaque ? '#7C3AED' : '#CBD5E1',
                  borderRadius: '4px',
                  opacity: destaque ? 1 : 0.6,
                }} />
              </Box>
              <Typography variant="caption" color={destaque ? '#7C3AED' : 'text.disabled'} sx={{ fontFamily: '"Roboto Mono", monospace', width: 38, textAlign: 'right', fontWeight: destaque ? 700 : 400, flexShrink: 0 }}>
                {esperado}%
              </Typography>
            </Stack>
          );
        })}
      </Stack>
      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        Frequências esperadas pela Lei de Benford. O dígito destacado apresentou desvio &gt; 5 p.p. acima do esperado.
      </Typography>
    </Box>
  );
}

// ─── Detalhe: Fracionamento ───────────────────────────────────────────────────
function DetalheFracionamento({ anomalias }) {
  if (!anomalias?.length) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Padrões de repetição detectados — {anomalias.length} ocorrência{anomalias.length !== 1 ? 's' : ''}
      </Typography>
      <Stack spacing={0.75}>
        {anomalias.slice(0, 5).map((a, i) => (
          <Stack key={i} direction="row" justifyContent="space-between" alignItems="center"
            sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtMoeda(a.valor)} × {a.repeticoes} vezes
              </Typography>
            </Box>
            <Chip
              label={`${a.repeticoes}×`}
              size="small"
              sx={{ bgcolor: '#B45309', color: '#fff', fontWeight: 700, fontSize: '0.6875rem', height: 22, ml: 1.5, flexShrink: 0 }}
            />
          </Stack>
        ))}
        {anomalias.length > 5 && (
          <Typography variant="caption" color="text.disabled">+ {anomalias.length - 5} padrões adicionais</Typography>
        )}
      </Stack>
    </Box>
  );
}

// ─── Detalhe: Monopólio ───────────────────────────────────────────────────────
function DetalheMonopolio({ departamentosDependentes }) {
  if (!departamentosDependentes?.length) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Departamentos com dependência crítica — {departamentosDependentes.length} identificado{departamentosDependentes.length !== 1 ? 's' : ''}
      </Typography>
      <Stack spacing={0.75}>
        {departamentosDependentes.slice(0, 5).map((d, i) => (
          <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ minWidth: 0, mr: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.orgao}
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.empresa}
                </Typography>
              </Box>
              <Chip
                label={`${d.percentual}%`}
                size="small"
                sx={{ bgcolor: parseFloat(d.percentual) >= 80 ? '#a20000' : '#B45309', color: '#fff', fontWeight: 700, fontSize: '0.6875rem', height: 22, flexShrink: 0 }}
              />
            </Stack>
            {/* Mini-barra de monopolização */}
            <Box sx={{ mt: 1, height: 5, bgcolor: '#F1F3F4', borderRadius: '3px', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${Math.min(parseFloat(d.percentual), 100)}%`, bgcolor: parseFloat(d.percentual) >= 80 ? '#a20000' : '#B45309', borderRadius: '3px' }} />
            </Box>
          </Box>
        ))}
        {departamentosDependentes.length > 5 && (
          <Typography variant="caption" color="text.disabled">+ {departamentosDependentes.length - 5} departamentos adicionais</Typography>
        )}
      </Stack>
    </Box>
  );
}

// ─── Detalhe: Concentração CR5 ────────────────────────────────────────────────
function DetalheConcentracao({ dados }) {
  if (!dados?.top5?.length) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Top 5 — {dados.percentual}% do total do período
      </Typography>
      <Stack spacing={0.75}>
        {dados.top5.map((f, i) => (
          <Stack key={f.id || i} direction="row" justifyContent="space-between" alignItems="center"
            sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#FEF9F0', border: '1px solid', borderColor: '#FDE68A' }}>
            <Typography variant="caption" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>
              {f.nome}
            </Typography>
            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>
              {fmtCompacto(f.valorTotal)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Renderiza o detalhe correto por tipo ────────────────────────────────────
function Detalhe({ tipo, dados }) {
  if (!dados?.alerta) return null;
  switch (tipo) {
    case 'zScore':       return <DetalheZScore outliers={dados.outliers} />;
    case 'benford':      return <DetalheBenford digitoSuspeito={dados.digitoSuspeito} />;
    case 'fracionamento':return <DetalheFracionamento anomalias={dados.anomalias} />;
    case 'monopolio':    return <DetalheMonopolio departamentosDependentes={dados.departamentosDependentes} />;
    case 'concentracao': return <DetalheConcentracao dados={dados} />;
    default:             return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CardAlerta({ tipo, dados }) {
  const [expandido, setExpandido] = useState(false);

  if (!dados) return null;

  const cfg = MOTOR_CONFIG[tipo];
  if (!cfg) return null;

  const { alerta, titulo, insightEducativo } = dados;
  const { rotulo, tituloNormal, Icone, corIcone, fundoIcone, descricaoMetodo } = cfg;
  const tituloExibido = alerta ? titulo : tituloNormal;
  const temDetalhe = alerta;

  return (
    <Card
      elevation={alerta ? 0 : 1}
      sx={{
        border: '1px solid',
        borderColor: alerta ? '#FDE68A' : 'divider',
        borderLeft: '4px solid',
        borderLeftColor: alerta ? 'warning.main' : 'success.main',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease',
        // Remove o micro-elevação no hover para cards informativos
        '&:hover': { transform: 'none', boxShadow: alerta ? '0 2px 8px rgba(180,83,9,0.10)' : 'none' },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* ── Cabeçalho do card ─────────────────────────────────────────── */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Ícone do motor */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: fundoIcone,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid',
              borderColor: `${corIcone}22`,
            }}
          >
            <Icone sx={{ fontSize: 22, color: corIcone }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Rótulo técnico + badge */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
                {rotulo}
              </Typography>
              <BadgeStatus alerta={alerta} />
            </Stack>

            {/* Título do resultado */}
            <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.75 }}>
              {tituloExibido}
            </Typography>

            {/* Insight educativo */}
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {insightEducativo}
            </Typography>
          </Box>

          {/* Botão de expansão — apenas quando há alerta com dados */}
          {temDetalhe && (
            <Tooltip title={expandido ? 'Recolher dados' : 'Ver dados brutos'} arrow>
              <IconButton
                size="small"
                onClick={() => setExpandido((v) => !v)}
                aria-label={expandido ? 'Recolher detalhes' : 'Expandir detalhes'}
                sx={{
                  flexShrink: 0,
                  color: 'text.secondary',
                  transition: 'transform 0.25s ease',
                  transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <ExpandMoreRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* ── Painel de dados expandido ─────────────────────────────────── */}
        {temDetalhe && (
          <Collapse in={expandido} timeout={280} unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Detalhe tipo={tipo} dados={dados} />
          </Collapse>
        )}

        {/* ── Metodologia (sempre visível, discreta) ────────────────────── */}
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.5 }}>
            <strong>Método:</strong> {descricaoMetodo}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
