import { Box, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { visuallyHidden } from '@mui/utils';

import { ETAPAS_DO_DINHEIRO } from './credor';
import { formatarMoeda } from '../../utilitarios/formatadores';

const surgir = keyframes`
  from { opacity: 0; transform: scale(0.4); }
  to   { opacity: 1; transform: scale(1); }
`;
const crescer = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/**
 * LinhaEtapas — empenho → liquidação → pagamento de UM documento.
 * Bolinha preenchida = a etapa aconteceu no período.
 *
 * Props:
 *   etapas   { Empenhado?: { valor, data }, Liquidado?: ..., Pago?: ... }
 *   animar   desenha a linha do tempo da esquerda para a direita ao montar
 */
export default function LinhaEtapas({ etapas, animar = false }) {
  return (
    <Stack direction="row" alignItems="center" aria-label="Etapas deste empenho no período">
      {ETAPAS_DO_DINHEIRO.map((etapa, i) => {
        const feita = Boolean(etapas[etapa.evento]);
        const proxima = ETAPAS_DO_DINHEIRO[i + 1];
        return (
          <Stack key={etapa.evento} direction="row" alignItems="center" sx={{ flex: proxima ? 1 : 'none', minWidth: 0 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: feita ? etapa.cor : 'transparent',
                  border: '2px solid',
                  borderColor: feita ? etapa.cor : '#CBD5E1',
                  animation: animar ? `${surgir} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.3}s both` : 'none',
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: feita ? 700 : 500, color: feita ? 'text.primary' : 'text.disabled', whiteSpace: 'nowrap' }}>
                {etapa.rotulo}
                <Box component="span" sx={visuallyHidden}>
                  {feita ? `: ${formatarMoeda(etapas[etapa.evento].valor)} em ${etapas[etapa.evento].data}` : ': não registrada no período'}
                </Box>
              </Typography>
            </Stack>
            {proxima && (
              <Box
                aria-hidden
                sx={{
                  flex: 1,
                  height: 2,
                  mx: 0.75,
                  mb: 2.25,
                  borderRadius: 1,
                  bgcolor: feita && etapas[proxima.evento] ? proxima.cor : '#E2E8F0',
                  transformOrigin: 'left center',
                  animation: animar ? `${crescer} 0.4s ease-out ${0.15 + i * 0.3}s both` : 'none',
                }}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
