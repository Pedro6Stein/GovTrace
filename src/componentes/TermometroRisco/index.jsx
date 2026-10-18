import { Box } from '@mui/material';

import { formatarPercentual } from '../../utilitarios/formatadores';

/**
 * TermometroRisco — gráfico de bala (bullet chart): um percentual contra
 * o limite oficial de atenção, numa trilha de 0% a 100%.
 *
 * É um dispositivo puramente VISUAL para tornar a distância até o limite
 * perceptível de relance — não cria um novo veredito. O limite em si (quem
 * decide "alerta" ou não) continua sendo só o `alerta` que a GovTrace API
 * já devolve; este componente apenas desenha onde o número está nessa régua.
 *
 * Extraído de HeroCidade (era "BarraLimite", só do CR5) para ser reusado
 * também no card de Auditoria — mesma régua visual nos dois lugares.
 *
 * Props:
 *   percentual   number — valor atual (0–100, pode passar de 100)
 *   limite       number — onde fica a marca de atenção (ex.: 30 para CR5)
 *   cor          string — cor do preenchimento (normalmente a cor de status)
 *   rotuloUnidade string — texto do valor no limite, ex. "Limite 30%"
 *   descricao    string — texto completo para leitor de tela (role="img")
 */
export default function TermometroRisco({ percentual, limite, cor, rotuloUnidade, descricao }) {
  const preenchimento = Math.min(Math.max(percentual, 0), 100);
  const posicaoLimite = Math.min(Math.max(limite, 0), 100);

  return (
    <Box role="img" aria-label={descricao} sx={{ mt: 2.5 }}>
      <Box sx={{ position: 'relative', height: 14, borderRadius: '7px', bgcolor: '#E2E8F0' }}>
        <Box
          sx={{
            height: '100%',
            width: `${preenchimento}%`,
            minWidth: preenchimento > 0 ? 6 : 0,
            borderRadius: '7px',
            bgcolor: cor,
            // Token oficial MD3 "emphasized decelerate" (m3.material.io/styles/motion/easing-and-duration/tokens-specs)
            transition: 'width 0.5s cubic-bezier(0.05, 0.7, 0.1, 1.0)',
          }}
        />
        {/* Marcador do limite */}
        <Box
          sx={{
            position: 'absolute',
            top: -5,
            bottom: -5,
            left: `${posicaoLimite}%`,
            width: 3,
            ml: '-1.5px',
            borderRadius: '2px',
            bgcolor: '#1E293B',
          }}
        />
      </Box>

      <Box sx={{ position: 'relative', height: 20, mt: 0.75, fontSize: '0.8125rem', color: 'text.secondary' }}>
        <Box component="span" sx={{ position: 'absolute', left: 0 }}>0%</Box>
        <Box
          component="span"
          sx={{ position: 'absolute', left: `${posicaoLimite}%`, transform: 'translateX(-50%)', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}
        >
          {rotuloUnidade}
        </Box>
        <Box component="span" sx={{ position: 'absolute', right: 0 }}>100%</Box>
      </Box>
    </Box>
  );
}

/** Helper compartilhado: a descrição acessível padrão de um termômetro de %. */
export const descricaoTermometro = (percentual, limite, contexto) =>
  `${formatarPercentual(percentual)} ${contexto}. Limite de atenção: ${formatarPercentual(limite)}.`;
