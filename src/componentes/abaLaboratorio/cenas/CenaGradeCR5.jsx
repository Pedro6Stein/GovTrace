import { motion } from 'framer-motion';

import Palco from './Palco';
import { CORES_PALCO as C } from '../../../tema/coresPalco';

const MotionRect = motion.rect;
const MotionPath = motion.path;

const ALTURA = 260;

/**
 * Cena do Índice CR5: 100 quadradinhos = R$ 100 pagos no mês. Os que
 * acendem, um a um, são a parte que foi para os 5 maiores credores. A linha
 * tracejada marca a referência de destaque (30 de 100).
 *
 * Props:
 *   percentual  participação dos 5 maiores (0–100)
 *   destaque    passou da referência?
 *   limite      referência (30)
 */
export default function CenaGradeCR5({ percentual, destaque, limite }) {
  const acesos = Math.max(0, Math.min(100, Math.round(Number(percentual) || 0)));
  const cor = destaque ? C.amarelo : C.azul;

  const descricao = `Grade de 100 quadradinhos, cada um representando R$ 1 de cada R$ 100 pagos no mês. ${acesos} estão coloridos: é a parte que foi para os 5 maiores credores. A linha tracejada marca a referência de ${limite}.`;
  const legenda = [
    { cor, rotulo: `5 maiores credores: cerca de ${acesos} de cada 100`, forma: 'quadrado' },
    { cor: '#475569', rotulo: 'Demais credores', forma: 'quadrado' },
    { cor: C.violeta, rotulo: `Referência: ${limite} de cada 100`, forma: 'tracejado' },
  ];

  return (
    <Palco altura={ALTURA} descricao={descricao} legenda={legenda}>
      {(ctx) => <Desenho {...ctx} acesos={acesos} cor={cor} limite={limite} />}
    </Palco>
  );
}

function Desenho({ largura: W, altura: H, ativo, reduzido, acesos, cor, limite }) {
  const lado = Math.min((W - 40) / 10, (H - 28) / 10);
  const vao = Math.max(2, lado * 0.14);
  const tamanhoGrade = lado * 10 - vao;
  const x0 = (W - tamanhoGrade) / 2;
  const y0 = (H - tamanhoGrade) / 2;

  // Contorno do limite em ordem de leitura (linha a linha): uma "escada"
  // separando as primeiras `limite` células das demais.
  const linha = Math.floor(limite / 10);
  const coluna = limite % 10;
  const yFaixa = (r) => y0 + r * lado - vao / 2;
  const xFim = x0 + tamanhoGrade + 6;
  const dLimite =
    coluna === 0
      ? `M${x0 - 6} ${yFaixa(linha)} L${xFim} ${yFaixa(linha)}`
      : `M${x0 - 6} ${yFaixa(linha + 1)} L${x0 + coluna * lado - vao / 2} ${yFaixa(linha + 1)} L${x0 + coluna * lado - vao / 2} ${yFaixa(linha)} L${xFim} ${yFaixa(linha)}`;

  return (
    <g>
      {Array.from({ length: 100 }, (_, i) => {
        const x = x0 + (i % 10) * lado;
        const y = y0 + Math.floor(i / 10) * lado;
        const aceso = i < acesos;
        if (!aceso) {
          return <rect key={i} x={x} y={y} width={lado - vao} height={lado - vao} rx={3} fill="#334155" />;
        }
        return (
          <MotionRect
            key={i}
            x={x}
            y={y}
            width={lado - vao}
            height={lado - vao}
            rx={3}
            fill={cor}
            style={{ originX: 0.5, originY: 0.5, transformBox: 'fill-box' }}
            initial={reduzido ? false : { opacity: 0, scale: 0.3 }}
            animate={ativo ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 + i * 0.035 }}
          />
        );
      })}

      <MotionPath
        d={dLimite}
        fill="none"
        stroke={C.violeta}
        strokeWidth={3}
        strokeDasharray="7 5"
        strokeLinecap="round"
        initial={reduzido ? false : { opacity: 0 }}
        animate={ativo ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 + acesos * 0.035 + 0.3, duration: 0.5 }}
      />
    </g>
  );
}
