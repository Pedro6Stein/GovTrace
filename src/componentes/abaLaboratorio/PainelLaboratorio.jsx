import { useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Divider, Snackbar, Stack, Typography } from '@mui/material';

import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import CartaoCena from './CartaoCena';
import { ORDEM_MOTORES } from './motores';
import {
  criarMapaSetores,
  trilhaConcentracaoSetorial,
  trilhaCR5,
  trilhaRecorrencia,
  trilhaZScore,
  zDosEmpenhos,
} from './rastro';
import { URL_PORTAL_TCE } from '../../dados/configuracoes';
import { formatarPeriodo } from '../../utilitarios/formatadores';

/**
 * PainelLaboratorio — aba "Laboratório Matemático".
 *
 * Cinco cenas animadas explicam o comportamento estatístico dos números do
 * período. Regra da aba: nenhum nome de credor aparece aqui; o destaque é
 * sempre o documento público (número do empenho), com caminho para conferir
 * na Base de Lançamentos ou no portal do TCE-SP.
 *
 * Props:
 *   insights            resultados dos motores (GovTrace API)
 *   despesas            registros normalizados do período
 *   ranking             credores com área CNAE (quando classificados)
 *   totais              { porEtapa: { pago }, ... } — base do CR5
 *   filtros             { municipio, ano, mes }
 *   aoLocalizarEmpenho  (documento) => abre a Base de Lançamentos filtrada
 */
export default function PainelLaboratorio({ insights, despesas, ranking, totais, filtros, aoLocalizarEmpenho }) {
  const [aviso, setAviso] = useState({ aberto: false, tipo: 'info', texto: '' });

  // Toda a pseudonimização acontece aqui, uma vez: daqui para baixo nenhum
  // componente recebe o nome de um credor.
  const trilhas = useMemo(() => {
    if (!insights) return null;
    const setores = criarMapaSetores(ranking);
    const lista = despesas ?? [];
    return {
      zScore: trilhaZScore(insights.zScore, setores),
      fracionamento: trilhaRecorrencia(insights.fracionamento, lista, setores),
      monopolio: trilhaConcentracaoSetorial(insights.monopolio, lista, setores),
      concentracao: trilhaCR5(insights.concentracao, lista, totais?.porEtapa?.pago ?? totais?.valorTotal ?? 0, setores),
      benford: null,
    };
  }, [insights, despesas, ranking, totais]);

  const extras = useMemo(() => ({ zDestaques: zDosEmpenhos(insights?.zScore) }), [insights]);

  if (!insights || !trilhas) return null;

  const totalDestaques = ORDEM_MOTORES.filter((t) => insights[t]?.alerta).length;

  // writeText é chamado antes do window.open, ainda dentro do clique: o
  // Safari só libera a área de transferência durante o gesto do usuário.
  const copiarEAbrir = (documento) => {
    const copia = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(documento)
      : Promise.reject(new Error('Área de transferência indisponível'));
    window.open(URL_PORTAL_TCE, '_blank', 'noopener,noreferrer');
    copia.then(
      () => setAviso({ aberto: true, tipo: 'success', texto: `Empenho nº ${documento} copiado. No portal do TCE-SP, cole o número no campo de busca.` }),
      () => setAviso({ aberto: true, tipo: 'info', texto: `Não foi possível copiar automaticamente. Anote o empenho nº ${documento} para buscar no portal do TCE-SP.` }),
    );
  };

  // Mantém o texto durante a animação de saída do Snackbar
  const fecharAviso = () => setAviso((atual) => ({ ...atual, aberto: false }));

  const acoes = { localizar: aoLocalizarEmpenho, copiarEAbrir };

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
              Por que não exibimos nomes nesta tela?
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: '1rem', color: '#1E293B', lineHeight: 1.65 }}>
              Nossos modelos matemáticos analisam exclusivamente o comportamento dos números, sem fazer
              juízo de valor sobre pessoas ou empresas. Para evitar interpretações fora de contexto,
              destacamos aqui apenas o código oficial do documento público. Você tem total autonomia
              para investigar a origem usando o código do empenho abaixo.
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
          trilha={trilhas[tipo]}
          extras={extras}
          filtros={filtros}
          acoes={acoes}
        />
      ))}

      <Box sx={{ py: 1 }}>
        <Divider />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.6 }}>
          Metodologia completa em "Metodologia", no cabeçalho. Dados oficiais: TCE-SP. GovTrace é uma
          ferramenta acadêmica — FATEC Bragança Paulista, GTI.
        </Typography>
      </Box>

      <Snackbar
        open={aviso.aberto}
        autoHideDuration={8000}
        onClose={fecharAviso}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={fecharAviso} severity={aviso.tipo} variant="filled" sx={{ width: '100%', fontSize: '0.9375rem' }}>
          {aviso.texto}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
