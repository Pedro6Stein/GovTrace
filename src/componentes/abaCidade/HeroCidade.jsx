import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';

/**
 * HeroCidade — Visão macro da Aba "A Cidade"
 *
 * Hierarquia "dado primeiro": cada card abre com o número em destaque;
 * a explicação em linguagem cidadã fica recolhida em <ExplicacaoCidada>
 * (substitui os antigos tooltips, inacessíveis por teclado e toque).
 *
 * Props:
 *   totais        { valorTotal: number, totalRegistros: number }
 *   concentracao  objeto de insight retornado por gerarInsightConcentracao()
 */

const fmtMoeda = (v) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtNumero = (n) => n.toLocaleString('pt-BR');

// Estilo tipográfico compartilhado pelos números-herói
const estiloNumeroHeroi = {
  fontFamily: '"Roboto Mono", monospace',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  wordBreak: 'break-word',   // Impede números longos de estourar o card
  overflowWrap: 'anywhere',
};

// ─── Rótulo técnico em caixa-alta ────────────────────────────────────────────
function Rotulo({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}
    >
      {children}
    </Typography>
  );
}

// ─── Card de métrica individual ──────────────────────────────────────────────
function CardMetrica({ rotulo, explicacao, valor, legenda, icone: Icone, corIcone }) {
  return (
    <Card elevation={1}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Rotulo>{rotulo}</Rotulo>

          {/* Ícone decorativo */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: `${corIcone}14`, // 8% de opacidade
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icone sx={{ fontSize: 20, color: corIcone }} />
          </Box>
        </Stack>

        {/* Valor principal — o herói do card */}
        <Typography component="p" sx={{ ...estiloNumeroHeroi, mt: 1.5, color: 'text.primary' }}>
          {valor}
        </Typography>

        {/* Legenda factual curta (contexto do número, não explicação) */}
        {legenda && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', lineHeight: 1.4 }}>
            {legenda}
          </Typography>
        )}

        {explicacao && (
          <ExplicacaoCidada>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {explicacao}
            </Typography>
          </ExplicacaoCidada>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card de concentração CR5 ────────────────────────────────────────────────
function CardConcentracao({ concentracao }) {
  const { alerta, percentual, somaTop5, insightEducativo } = concentracao;
  const IconeStatus = alerta ? WarningAmberRoundedIcon : CheckCircleOutlineRoundedIcon;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: alerta ? 'warning.light' : 'divider',
        borderLeft: '4px solid',
        borderLeftColor: alerta ? 'warning.main' : 'success.main',
        bgcolor: alerta ? '#FFFBEB' : '#F0FDF4',
        transition: 'all 0.2s ease',
        // Sobrescreve o hover do Card global para este não elevar
        '&:hover': { transform: 'none', boxShadow: 'none' },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconeStatus sx={{ fontSize: 20, color: alerta ? 'warning.main' : 'success.main' }} />
          <Rotulo>
            {alerta ? 'Ponto para Análise — Concentração CR5' : 'Concentração CR5 — Distribuída'}
          </Rotulo>
        </Stack>

        {/* Percentual — o herói do card */}
        <Typography
          component="p"
          sx={{ ...estiloNumeroHeroi, mt: 1.5, color: alerta ? '#B45309' : 'text.primary' }}
        >
          {String(percentual).replace('.', ',')}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', lineHeight: 1.4 }}>
          do valor do período foi para os 5 maiores fornecedores
          {somaTop5 ? ` · ${fmtMoeda(somaTop5)}` : ''}
        </Typography>

        <ExplicacaoCidada>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 1.5 }}>
            {insightEducativo}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.5, display: 'block' }}>
            <strong>Método:</strong> mede quanto dos recursos públicos foi concentrado nos 5 maiores
            fornecedores do período. Acima de 30% indica dependência elevada de poucos parceiros comerciais.
          </Typography>
        </ExplicacaoCidada>
      </CardContent>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function HeroCidade({ totais, concentracao }) {
  if (!totais) return null;

  return (
    <Stack spacing={3}>
      {/* ── Linha de métricas — CSS Grid moderno, sem margens negativas ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 },
          alignItems: 'start', // Expandir um card não estica o vizinho
        }}
      >
        {/* Card 1 — Total Empenhado */}
        <CardMetrica
          rotulo="Total Empenhado"
          explicacao="Valor comprometido como intenção de gasto: a prefeitura reservou este montante no orçamento para pagamentos futuros. Não significa que o dinheiro já saiu do caixa municipal."
          valor={fmtMoeda(totais.valorTotal)}
          legenda="Empenhos, reforços e anulações do período"
          icone={AccountBalanceWalletRoundedIcon}
          corIcone="#a20000"
        />

        {/* Card 2 — Registros Analisados */}
        <CardMetrica
          rotulo="Registros Analisados"
          explicacao="Quantidade total de notas de empenho, reforços e anulações processadas pelo GovTrace para o período selecionado. Cada registro é um documento oficial publicado pelo TCE-SP."
          valor={fmtNumero(totais.totalRegistros)}
          legenda="Documentos oficiais do TCE-SP"
          icone={ReceiptLongRoundedIcon}
          corIcone="#0284C7"
        />
      </Box>

      {/* ── Card de concentração CR5 ──────────────────────────────────── */}
      {concentracao && <CardConcentracao concentracao={concentracao} />}
    </Stack>
  );
}
