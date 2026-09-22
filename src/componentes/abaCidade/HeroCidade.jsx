import { Box, Card, CardContent, Stack, Tooltip, Typography } from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

/**
 * HeroCidade — Visão macro da Aba "A Cidade"
 *
 * Exibe o volume de recursos do período em linguagem cidadã,
 * com tooltips didáticos obrigatórios em todos os termos técnicos.
 *
 * Props:
 *   totais        { valorTotal: number, totalRegistros: number }
 *   concentracao  objeto de insight retornado por gerarInsightConcentracao()
 */

// ─── Tooltip de terminologia técnica ────────────────────────────────────────
function Dica({ texto }) {
  return (
    <Tooltip title={texto} arrow placement="top" enterTouchDelay={0}>
      <InfoOutlinedIcon
        fontSize="small"
        sx={{
          fontSize: '1rem',
          color: 'text.disabled',
          cursor: 'help',
          verticalAlign: 'middle',
          ml: 0.5,
          transition: 'color 0.2s',
          '&:hover': { color: 'primary.main' },
        }}
      />
    </Tooltip>
  );
}

// ─── Card de métrica individual ──────────────────────────────────────────────
function CardMetrica({ rotulo, dica, valor, legenda, icone: Icone, corIcone }) {
  return (
    <Card elevation={1}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          {/* Rótulo + dica */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rotulo}
            {dica && <Dica texto={dica} />}
          </Typography>

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

        {/* Valor principal — responsivo e seguro contra overflow */}
        <Typography
          sx={{
            mt: 2,
            fontFamily: '"Roboto Mono", monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
            color: 'text.primary',
            lineHeight: 1.2,
            wordBreak: 'break-word',   // Impede números longos de estourar o card
            overflowWrap: 'anywhere',
          }}
        >
          {valor}
        </Typography>

        {/* Legenda contextual */}
        {legenda && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 1, display: 'block', lineHeight: 1.4 }}
          >
            {legenda}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function HeroCidade({ totais, concentracao }) {
  if (!totais) return null;

  const fmtMoeda = (v) =>
    'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtNumero = (n) => n.toLocaleString('pt-BR');

  const alertaConcentracao = concentracao?.alerta;
  const IconeConcentracao = alertaConcentracao
    ? WarningAmberRoundedIcon
    : CheckCircleOutlineRoundedIcon;

  return (
    <Stack spacing={3}>
      {/* ── Linha de métricas — CSS Grid moderno, sem margens negativas ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {/* Card 1 — Total Empenhado */}
        <CardMetrica
          rotulo="Total Empenhado"
          dica="Valor comprometido como intenção de gasto: a prefeitura reservou este montante no orçamento para pagamentos futuros. Não significa que o dinheiro já saiu do caixa municipal."
          valor={fmtMoeda(totais.valorTotal)}
          legenda="Empenhos, reforços e anulações do período"
          icone={AccountBalanceWalletRoundedIcon}
          corIcone="#a20000"
        />

        {/* Card 2 — Registros Analisados */}
        <CardMetrica
          rotulo="Registros Analisados"
          dica="Quantidade total de notas de empenho, reforços e anulações processadas pelo GovTrace para o período selecionado. Cada registro é um documento oficial publicado pelo TCE-SP."
          valor={fmtNumero(totais.totalRegistros)}
          legenda="Documentos oficiais do TCE-SP"
          icone={ReceiptLongRoundedIcon}
          corIcone="#0284C7"
        />
      </Box>

      {/* ── Card de concentração CR5 ──────────────────────────────────── */}
      {concentracao && (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: alertaConcentracao ? 'warning.light' : 'divider',
            borderLeft: '4px solid',
            borderLeftColor: alertaConcentracao ? 'warning.main' : 'success.main',
            bgcolor: alertaConcentracao ? '#FFFBEB' : '#F0FDF4',
            transition: 'all 0.2s ease',
            // Sobrescreve o hover do Card global para este não elevar
            '&:hover': { transform: 'none', boxShadow: 'none' },
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* Ícone semântico */}
              <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                <IconeConcentracao
                  sx={{
                    fontSize: 24,
                    color: alertaConcentracao ? 'warning.main' : 'success.main',
                  }}
                />
              </Box>

              <Box>
                {/* Título neutro */}
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {alertaConcentracao
                      ? 'Ponto para Análise — Concentração de Mercado'
                      : 'Distribuição de Mercado'}
                  </Typography>
                  <Dica texto="Mede quanto dos recursos públicos foi concentrado nos 5 maiores fornecedores do período. Acima de 30% indica dependência elevada de poucos parceiros comerciais." />
                </Stack>

                {/* Mensagem principal */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {concentracao.mensagemPrincipal}
                </Typography>

                {/* Insight educativo */}
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {concentracao.insightEducativo}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
