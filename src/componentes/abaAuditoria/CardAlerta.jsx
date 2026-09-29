import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';

/**
 * CardAlerta — Card de resultado de motor estatístico
 *
 * Hierarquia "dado primeiro": a métrica principal e os registros que a
 * sustentam ficam sempre visíveis; a explicação cidadã e a metodologia
 * ficam recolhidas em <ExplicacaoCidada>. Nunca usa linguagem acusatória.
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

const plural = (n, singular, pluralTxt) => (n === 1 ? singular : pluralTxt);

// ─── Métrica principal (o "herói" do card) por tipo de motor ─────────────────
// Motores com amostra insuficiente retornam apenas { alerta: false }; nesse
// caso a lista esperada vem undefined e exibimos "—" em vez de um zero enganoso.
function extrairMetrica(tipo, dados) {
  switch (tipo) {
    case 'zScore': {
      const { outliers } = dados;
      if (!outliers) return { valor: '—', legenda: 'Amostra insuficiente para o teste' };
      const soma = outliers.reduce((acc, o) => acc + o.valor, 0);
      return {
        valor: outliers.length,
        legenda: outliers.length
          ? `${plural(outliers.length, 'pagamento atípico', 'pagamentos atípicos')} · ${fmtCompacto(soma)} somados`
          : 'pagamentos acima de 4 desvios padrão',
      };
    }
    case 'benford':
      if (dados.digitoSuspeito == null) {
        return { valor: '—', legenda: 'Nenhum dígito inicial fora da curva de Benford' };
      }
      return { valor: dados.digitoSuspeito, legenda: 'dígito inicial com desvio > 5 p.p. do esperado' };
    case 'fracionamento': {
      const { anomalias } = dados;
      if (!anomalias) return { valor: '—', legenda: 'Amostra insuficiente para o teste' };
      return {
        valor: anomalias.length,
        legenda: `${plural(anomalias.length, 'padrão', 'padrões')} de valor idêntico pago ≥ 5× ao mesmo fornecedor`,
      };
    }
    case 'monopolio': {
      const deps = dados.departamentosDependentes;
      if (!deps) return { valor: '—', legenda: 'Amostra insuficiente para o teste' };
      const pico = deps.length ? Math.max(...deps.map((d) => parseFloat(d.percentual))) : null;
      return {
        valor: deps.length,
        legenda:
          `${plural(deps.length, 'área', 'áreas')} com um único fornecedor ≥ 50% do orçamento` +
          (pico != null ? ` · pico de ${pico.toFixed(1).replace('.', ',')}%` : ''),
      };
    }
    case 'concentracao':
      return {
        valor: `${String(dados.percentual).replace('.', ',')}%`,
        legenda:
          'do valor do período foi para os 5 maiores fornecedores' +
          (dados.somaTop5 ? ` · ${fmtCompacto(dados.somaTop5)}` : ''),
      };
    default:
      return null;
  }
}

// ─── Bloco numérico de destaque ──────────────────────────────────────────────
function MetricaHeroi({ valor, legenda, alerta }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        component="p"
        sx={{
          fontFamily: '"Roboto Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.25rem' },
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: alerta ? '#B45309' : 'text.primary',
        }}
      >
        {valor}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
        {legenda}
      </Typography>
    </Box>
  );
}

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
      <Stack spacing={1}>
        {outliers.slice(0, 5).map((o, i) => (
          <Stack key={i} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 0 }}
            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Box sx={{ minWidth: 0, width: '100%' }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.fornecedorNome}
              </Typography>
              <Typography variant="caption" color="text.secondary">{o.orgao}</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.8125rem', ml: { xs: 0, sm: 2 }, flexShrink: 0 }}>
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
      <Stack spacing={1}>
        {anomalias.slice(0, 5).map((a, i) => (
          <Stack key={i} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 0 }}
            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Box sx={{ minWidth: 0, width: '100%' }}>
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
              sx={{ bgcolor: '#B45309', color: '#fff', fontWeight: 700, fontSize: '0.6875rem', height: 22, ml: { xs: 0, sm: 1.5 }, flexShrink: 0 }}
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
      <Stack spacing={1}>
        {departamentosDependentes.slice(0, 5).map((d, i) => (
          <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#FEF3C7', border: '1px solid', borderColor: '#FDE68A' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} spacing={{ xs: 1, sm: 0 }}>
              <Box sx={{ minWidth: 0, mr: { sm: 1 }, width: '100%' }}>
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
      <Stack spacing={1}>
        {dados.top5.map((f, i) => (
          <Stack key={f.id || i} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 0 }}
            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#FEF9F0', border: '1px solid', borderColor: '#FDE68A' }}>
            <Box sx={{ minWidth: 0, width: '100%' }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: { sm: 1 } }}>
                {f.nome}
              </Typography>
            </Box>
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
  if (!dados) return null;

  const cfg = MOTOR_CONFIG[tipo];
  if (!cfg) return null;

  const { alerta, titulo, insightEducativo } = dados;
  const { rotulo, tituloNormal, Icone, corIcone, fundoIcone, descricaoMetodo } = cfg;
  const tituloExibido = alerta ? titulo : tituloNormal;
  const metrica = extrairMetrica(tipo, dados);

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
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {tituloExibido}
            </Typography>
          </Box>
        </Stack>

        {/* ── Métrica principal: o dado é o herói ───────────────────────── */}
        {metrica && <MetricaHeroi {...metrica} alerta={alerta} />}

        {/* ── Registros que sustentam a métrica (sempre visíveis) ───────── */}
        {alerta && (
          <>
            <Divider sx={{ my: 2 }} />
            <Detalhe tipo={tipo} dados={dados} />
          </>
        )}

        {/* ── Explicação cidadã + metodologia (sob demanda) ─────────────── */}
        <ExplicacaoCidada>
          {insightEducativo && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 1.5 }}>
              {insightEducativo}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.5, display: 'block' }}>
            <strong>Método:</strong> {descricaoMetodo}
          </Typography>
        </ExplicacaoCidada>
      </CardContent>
    </Card>
  );
}
