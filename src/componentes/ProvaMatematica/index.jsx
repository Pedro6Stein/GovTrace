import { Suspense, lazy, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';

import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';

import ContornoErro from '../ContornoErro';

// KaTeX (~24kB) e Framer Motion só entram no bundle de quem efetivamente
// clica em "Ver a fórmula passo a passo" — a maioria dos visitantes nunca paga
// esse custo. Ver justificativa no README (seção de performance).
const DialogoProva = lazy(() => import('./DialogoProva'));

// Enquanto o chunk baixa (rede mais lenta, ou o primeiro clique após o
// deploy), um texto explícito evita que o clique pareça "não fez nada" —
// o spinner sozinho é pequeno demais pra ser notado com segurança.
function CarregandoProva() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 2, color: 'text.secondary' }} role="status" aria-live="polite">
      <ScienceRoundedIcon sx={{ fontSize: 20, opacity: 0.5, animation: 'pulsar 1.4s ease-in-out infinite', '@keyframes pulsar': { '0%, 100%': { opacity: 0.3 }, '50%': { opacity: 0.8 } } }} />
      <Typography variant="body2">Carregando a fórmula passo a passo…</Typography>
    </Stack>
  );
}

/**
 * BotaoProvaMatematica — abre a demonstração animada da fórmula oficial
 * (Z-Score ou Lei de Benford) aplicada aos números reais do período.
 *
 * Só aparece quando a API devolve os campos necessários (`estatisticas`
 * para Z-Score, `frequencias` para Benford) — em uma API antiga, some
 * silenciosamente, sem quebrar o card.
 *
 * Props:
 *   tipo   'zScore' | 'benford'
 *   dados  o objeto de insight correspondente (insights.zScore / insights.benford)
 */
export default function BotaoProvaMatematica({ tipo, dados }) {
  const [aberto, setAberto] = useState(false);

  const disponivel =
    tipo === 'zScore' ? Boolean(dados?.estatisticas) :
    tipo === 'benford' ? Boolean(dados?.frequencias?.length) :
    false;

  if (!disponivel) return null;

  return (
    <>
      <Button
        onClick={() => setAberto(true)}
        startIcon={<ScienceRoundedIcon />}
        size="small"
        variant="outlined"
        sx={{ mt: 2, minHeight: 40, fontWeight: 600, borderColor: '#CBD5E1', color: 'text.secondary' }}
      >
        Ver a fórmula passo a passo
      </Button>

      {aberto && (
        <ContornoErro mensagem="Não foi possível abrir a fórmula passo a passo. Verifique sua conexão.">
          <Suspense fallback={<CarregandoProva />}>
            <DialogoProva tipo={tipo} dados={dados} aberto={aberto} aoFechar={() => setAberto(false)} />
          </Suspense>
        </ContornoErro>
      )}
    </>
  );
}
