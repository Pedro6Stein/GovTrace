import { Suspense, lazy, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';

// KaTeX (~24kB) e Framer Motion só entram no bundle de quem efetivamente
// clica em "Ver a prova matemática" — a maioria dos visitantes nunca paga
// esse custo. Ver justificativa no README (seção de performance).
const DialogoProva = lazy(() => import('./DialogoProva'));

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
        Ver a prova matemática
      </Button>

      {aberto && (
        <Suspense fallback={<CircularProgress size={20} sx={{ mt: 2 }} aria-label="Carregando a prova matemática" />}>
          <DialogoProva tipo={tipo} dados={dados} aberto={aberto} aoFechar={() => setAberto(false)} />
        </Suspense>
      )}
    </>
  );
}
