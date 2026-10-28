import { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';

import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import CartaoCena from './CartaoCena';
import { ORDEM_MOTORES } from './motores';
import { cenaConcentracaoArea, cenaRecorrencia, zDosEmpenhos } from './dadosCenas';
import { criarMapaSetores, lerDestaque } from './leitura';
import { formatarPeriodo } from '../../utilitarios/formatadores';

/**
 * PainelLaboratorio — aba "Laboratório Matemático".
 *
 * Cinco cenas animadas explicam o comportamento estatístico dos números do
 * período. Regra da aba: ela descreve o conjunto do mês e não aponta nenhum
 * documento, pessoa ou empresa. Cada destaque vem com o seu peso no mês e
 * as causas mais comuns do padrão ("Como ler este destaque").
 *
 * Props:
 *   insights      resultados dos motores (GovTrace API)
 *   despesas      registros normalizados do período
 *   ranking       credores com área CNAE (quando classificados)
 *   totais        { totalEmpenhos, porEtapa, ... }
 *   distribuicao  divisão dos pagamentos por área (peso de cada área no mês)
 *   filtros       { municipio, ano, mes }
 */
export default function PainelLaboratorio({ insights, despesas, ranking, totais, distribuicao, filtros }) {
  const cenas = useMemo(() => {
    if (!insights) return null;
    return {
      fracionamento: cenaRecorrencia(insights.fracionamento, despesas ?? []),
      monopolio: cenaConcentracaoArea(insights.monopolio),
    };
  }, [insights, despesas]);

  const leituras = useMemo(() => {
    if (!insights) return null;
    const contexto = {
      despesas: despesas ?? [],
      setores: criarMapaSetores(ranking),
      totais,
      distribuicao: distribuicao ?? [],
      totalFornecedores: ranking?.length ?? 0,
    };
    return Object.fromEntries(ORDEM_MOTORES.map((tipo) => [tipo, lerDestaque(tipo, insights[tipo], contexto)]));
  }, [insights, despesas, ranking, totais, distribuicao]);

  const extras = useMemo(() => ({ zDestaques: zDosEmpenhos(insights?.zScore) }), [insights]);

  if (!insights || !cenas || !leituras) return null;

  const totalDestaques = ORDEM_MOTORES.filter((t) => insights[t]?.alerta).length;

  return (
    <Stack spacing={3}>
      {/* ── Apresentação ─────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
        <CardContent sx={{ p: { xs: 2.25, sm: 3 }, '&:last-child': { pb: { xs: 2.25, sm: 3 } } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
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
                <ScienceRoundedIcon aria-hidden sx={{ fontSize: 22, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography component="h2" sx={{ fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
                  Laboratório Matemático
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '1rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  Cinco cenas animadas mostram como os números de <strong>{filtros?.municipio}</strong> se
                  comportaram em {formatarPeriodo(filtros?.mes, filtros?.ano)}. Cada cena responde a uma
                  pergunta simples sobre os padrões estatísticos do período.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={
                totalDestaques === 0
                  ? 'Nenhuma cena com destaque estatístico'
                  : `${totalDestaques} de ${ORDEM_MOTORES.length} cenas com destaque estatístico`
              }
              sx={{ fontWeight: 700, flexShrink: 0, bgcolor: totalDestaques ? '#FEF3C7' : '#DCFCE7', color: totalDestaques ? '#92400E' : '#166534' }}
            />
          </Stack>

          <Typography sx={{ mt: 2, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Um destaque estatístico mostra onde os números se comportam diferente da maioria. Ele não
            é uma conclusão sobre pessoas, empresas ou sobre a gestão: a interpretação final cabe aos
            órgãos de controle.
          </Typography>
        </CardContent>
      </Card>

      {/* ── Por que não há nomes ─────────────────────────────────────── */}
      <Box
        component="aside"
        aria-labelledby="titulo-privacidade"
        sx={{ p: { xs: 2.25, sm: 2.75 }, borderRadius: '16px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <VisibilityOffRoundedIcon aria-hidden sx={{ color: '#1D4ED8', mt: 0.25, flexShrink: 0 }} />
          <Box>
            <Typography id="titulo-privacidade" component="h3" sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#1E3A8A' }}>
              Por que esta tela não mostra nomes nem documentos?
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: '1rem', color: '#1E293B', lineHeight: 1.65 }}>
              O Laboratório mostra como os números do mês se comportam em conjunto: quanto um padrão
              representa, em que áreas aparece e por que costuma acontecer. Ele não aponta pessoas,
              empresas ou documentos, porque um destaque estatístico não é uma conclusão: a análise de
              cada caso cabe aos órgãos de controle.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Cenas ────────────────────────────────────────────────────── */}
      {ORDEM_MOTORES.map((tipo) => (
        <CartaoCena
          key={tipo}
          tipo={tipo}
          dados={insights[tipo]}
          dadosCena={cenas[tipo]}
          leitura={leituras[tipo]}
          extras={extras}
          filtros={filtros}
        />
      ))}

      <Box sx={{ py: 1 }}>
        <Divider />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.6 }}>
          Metodologia completa em "Metodologia", no cabeçalho. Dados oficiais: TCE-SP. GovTrace é uma
          ferramenta acadêmica — FATEC Bragança Paulista, GTI.
        </Typography>
      </Box>
    </Stack>
  );
}
