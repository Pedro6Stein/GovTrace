import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';

import CardAlerta from './CardAlerta';

/**
 * PainelAuditoria — Aba 3 "Auditoria Algorítmica"
 *
 * Orquestra os 5 CardAlerta na ordem pedagógica correta e adiciona
 * o contexto institucional da seção.
 *
 * Ordem dos motores:
 *   1. Z-Score         — magnitude anômala (empenhos gigantes)
 *   2. Fracionamento   — atomização suspeita (notas repetidas)
 *   3. Monopólio       — dependência departamental
 *   4. Concentração    — concentração CR5 global
 *   5. Benford         — integridade dos dígitos (mais abstrato, por último)
 *
 * Props:
 *   insights   { zScore, benford, fracionamento, monopolio, concentracao }
 */

// Contagem de alertas ativos
function contarAlertas(insights) {
  if (!insights) return 0;
  return Object.values(insights).filter((m) => m?.alerta).length;
}

export default function PainelAuditoria({ insights }) {
  if (!insights) return null;

  const totalAlertas = contarAlertas(insights);
  const totalMotores = 5;

  return (
    <Stack spacing={3}>
      {/* ── Cabeçalho institucional da seção ─────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': { transform: 'none', boxShadow: 'none' },
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            {/* Ícone + texto */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'rgba(162,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <QueryStatsRoundedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Auditoria Algorítmica
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                  Cinco motores estatísticos analisam os dados automaticamente. Os resultados são anomalias matemáticas — não julgamentos de valor.
                </Typography>
              </Box>
            </Stack>

            {/* Placar de alertas */}
            <Chip
              label={
                totalAlertas === 0
                  ? `${totalMotores}/${totalMotores} motores normais`
                  : `${totalAlertas} de ${totalMotores} com ponto para análise`
              }
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: totalAlertas === 0 ? '#E8F5E9' : '#FEF3C7',
                color: totalAlertas === 0 ? '#2E7D32' : '#B45309',
                flexShrink: 0,
              }}
            />
          </Stack>

          {/* Aviso institucional */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', mt: 0.15, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Os algoritmos do GovTrace aplicam métodos matemáticos padronizados (Z-Score, Lei de Benford, etc.) sobre dados públicos oficiais do TCE-SP.
              Um <strong>"Ponto para Análise"</strong> indica um padrão estatístico incomum — não uma conclusão jurídica ou acusação.
              A interpretação final é sempre responsabilidade do auditor humano.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Cards de motores ─────────────────────────────────────────── */}
      <Stack spacing={2}>
        <CardAlerta tipo="zScore"          dados={insights.zScore} />
        <CardAlerta tipo="fracionamento"   dados={insights.fracionamento} />
        <CardAlerta tipo="monopolio"       dados={insights.monopolio} />
        <CardAlerta tipo="concentracao"    dados={insights.concentracao} />
        <CardAlerta tipo="benford"         dados={insights.benford} />
      </Stack>

      {/* ── Nota de rodapé ────────────────────────────────────────────── */}
      <Box sx={{ py: 1 }}>
        <Divider />
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5, lineHeight: 1.6 }}>
          Metodologia completa disponível em "Metodologia" no cabeçalho. Dados processados: TCE-SP.
          GovTrace é uma ferramenta acadêmica — FATEC Bragança Paulista, GTI.
        </Typography>
      </Box>
    </Stack>
  );
}
