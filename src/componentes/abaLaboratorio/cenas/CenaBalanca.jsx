import { useEffect, useState } from 'react';
import { Chip, Stack } from '@mui/material';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

import Palco from './Palco';
import { CORES_PALCO as C, TEXTO_PALCO as T } from './coresPalco';
import { formatarPercentual } from '../../../utilitarios/formatadores';

const MotionG = motion.g;

const ALTURA = 260;
const INCLINACAO_MAXIMA = 16; // graus — 100% de um lado

/**
 * Cena da Concentração Setorial: uma balança compara, dentro de uma área,
 * o maior credor (prato da esquerda) com todos os demais juntos (prato da
 * direita). O braço se inclina com física de mola até o peso real.
 *
 * Props:
 *   areas  [{ area, percentual }] — já ordenadas, a maior primeiro
 */
export default function CenaBalanca({ areas }) {
  const [indice, setIndice] = useState(0);
  const atual = areas[Math.min(indice, areas.length - 1)];

  const descricao = atual
    ? `Balança da área ${atual.area}. O prato da esquerda, com o maior credor, pesa ${formatarPercentual(atual.percentual)}; o da direita, com os demais credores, pesa ${formatarPercentual(100 - atual.percentual)}. A balança pende para a esquerda.`
    : 'Balança equilibrada: em nenhuma área um único credor ficou com 50% ou mais do valor.';

  const legenda = atual
    ? [
        { cor: C.amarelo, rotulo: 'Maior credor da área', forma: 'ponto' },
        { cor: C.azul, rotulo: 'Demais credores juntos', forma: 'ponto' },
      ]
    : [];

  return (
    <Stack spacing={1.25}>
      <Palco altura={ALTURA} descricao={descricao} legenda={legenda}>
        {(ctx) => <Desenho {...ctx} percentual={atual?.percentual ?? null} />}
      </Palco>

      {areas.length > 1 && (
        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} role="group" aria-label="Escolha a área exibida na balança">
          {areas.map((a, i) => {
            const ativo = a === atual;
            return (
              <Chip
                key={a.area}
                label={`${a.area} · ${formatarPercentual(a.percentual)}`}
                onClick={() => setIndice(i)}
                aria-pressed={ativo}
                variant={ativo ? 'filled' : 'outlined'}
                color={ativo ? 'primary' : 'default'}
                sx={{ fontWeight: 600, height: 'auto', minHeight: 36, '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 } }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function Desenho({ largura: W, altura: H, ativo, reduzido, percentual }) {
  const angulo = useMotionValue(0);
  const braco = Math.min(W * 0.34, 210);
  const cx = W / 2;
  const cy = 74;
  const alvo = percentual == null ? 0 : -Math.max(-1, Math.min(1, (percentual - 50) / 50)) * INCLINACAO_MAXIMA;

  useEffect(() => {
    if (!ativo) return undefined;
    const controle = animate(
      angulo,
      alvo,
      reduzido ? { duration: 0 } : { type: 'spring', stiffness: 55, damping: 6, delay: 0.4 },
    );
    return () => controle.stop();
  }, [ativo, reduzido, alvo, angulo]);

  const rad = (graus) => (graus * Math.PI) / 180;
  const xEsq = useTransform(angulo, (a) => -braco * Math.cos(rad(a)));
  const yEsq = useTransform(angulo, (a) => -braco * Math.sin(rad(a)));
  const xDir = useTransform(angulo, (a) => braco * Math.cos(rad(a)));
  const yDir = useTransform(angulo, (a) => braco * Math.sin(rad(a)));

  const pesoEsq = percentual ?? 50;
  const pesoDir = percentual == null ? 50 : 100 - percentual;
  const baseY = H - 26;

  return (
    <g>
      {/* Suporte */}
      <path d={`M${cx} ${cy} L${cx - 22} ${baseY} L${cx + 22} ${baseY} Z`} fill={C.eixo} opacity={0.75} />
      <line x1={cx - 70} x2={cx + 70} y1={baseY} y2={baseY} stroke={C.eixo} strokeWidth={3} strokeLinecap="round" />

      <g transform={`translate(${cx} ${cy})`}>
        {/* Braço: gira em torno do pivô (bbox simétrico → centro = pivô) */}
        <MotionG style={{ rotate: angulo }}>
          <rect x={-braco} y={-3} width={braco * 2} height={6} rx={3} fill={C.texto} />
        </MotionG>

        <Prato x={xEsq} y={yEsq} peso={pesoEsq} cor={C.amarelo} rotulo="Maior credor" mostrarPeso={percentual != null} />
        <Prato x={xDir} y={yDir} peso={pesoDir} cor={C.azul} rotulo="Demais credores" mostrarPeso={percentual != null} />

        <circle r={7} fill={C.amarelo} stroke={C.fundo} strokeWidth={2} />
      </g>

      {percentual == null && (
        <text x={cx} y={baseY - 14} textAnchor="middle" fontSize={T.medio} fill={C.texto}>
          Nenhuma área acima de 50%
        </text>
      )}
    </g>
  );
}

// Prato pendurado na ponta do braço: o fio fica sempre na vertical.
function Prato({ x, y, peso, cor, rotulo, mostrarPeso }) {
  const raio = 7 + 20 * Math.sqrt(peso / 100);
  return (
    <MotionG style={{ x, y }}>
      <line x1={0} x2={0} y1={0} y2={44} stroke={C.textoSuave} strokeWidth={1.5} />
      {mostrarPeso && <circle cx={0} cy={44 - raio + 1} r={raio} fill={cor} />}
      <path d="M-34 44 A 34 15 0 0 0 34 44 Z" fill="rgba(226,232,240,0.12)" stroke={C.texto} strokeWidth={2} />
      <text x={0} y={80} textAnchor="middle" fontSize={T.pequeno} fill={C.textoSuave}>
        {rotulo}
      </text>
      {mostrarPeso && (
        <text x={0} y={98} textAnchor="middle" fontSize={T.grande} fontWeight={700} fill={cor}>
          {formatarPercentual(peso)}
        </text>
      )}
    </MotionG>
  );
}
