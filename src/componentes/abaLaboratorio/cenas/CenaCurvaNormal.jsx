import { motion } from 'framer-motion';

import Palco from './Palco';
import { CORES_PALCO as C, TEXTO_PALCO as T } from '../../../tema/coresPalco';

const MotionPath = motion.path;
const MotionCircle = motion.circle;
const MotionG = motion.g;

const ALTURA = 270;
const MAX_PONTOS_DESTAQUE = 30;

// Inversa da normal padrão (Abramowitz & Stegun 26.2.23) — posiciona os
// pontos ilustrativos nos quantis da curva, sem sorteio.
function probit(p) {
  const q = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(q));
  const z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t ** 3);
  return p < 0.5 ? -z : z;
}

// Gerador determinístico: a cena é sempre a mesma em todo replay.
function sequencia(semente) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Cena do Z-Score: a curva de Gauss se desenha, os lançamentos "típicos"
 * se acomodam sob o sino e os empenhos de alta amplitude se afastam
 * devagar para a direita, até o Z real de cada um.
 *
 * Props:
 *   limite      Z de corte da API (hoje 4)
 *   zDestaques  Z real de cada empenho destacado (um por documento)
 */
export default function CenaCurvaNormal({ limite = 4, zDestaques = [] }) {
  const destaques = [...zDestaques].sort((a, b) => a - b).slice(-MAX_PONTOS_DESTAQUE);
  const zMax = destaques.length ? destaques[destaques.length - 1] : null;

  const descricao = destaques.length
    ? `Curva em forma de sino. A maioria dos lançamentos fica perto da média, no centro. ${zDestaques.length} empenhos aparecem à direita da linha Z = ${limite}, com Z entre ${destaques[0].toFixed(1).replace('.', ',')} e ${zMax.toFixed(1).replace('.', ',')}.`
    : `Curva em forma de sino. Todos os lançamentos ficam à esquerda da linha Z = ${limite}.`;

  const legenda = [
    { cor: C.azul, rotulo: 'Modelo da curva normal (pontos ilustrativos)', forma: 'ponto' },
    ...(destaques.length ? [{ cor: C.amarelo, rotulo: 'Empenho de alta amplitude, no seu Z real', forma: 'ponto' }] : []),
    { cor: C.amarelo, rotulo: `Limite Z = ${limite}`, forma: 'tracejado' },
  ];

  return (
    <Palco altura={ALTURA} descricao={descricao} legenda={legenda}>
      {({ largura, altura, ativo, reduzido }) => (
        <Desenho
          largura={largura}
          altura={altura}
          ativo={ativo}
          reduzido={reduzido}
          limite={limite}
          destaques={destaques}
          zMax={zMax}
        />
      )}
    </Palco>
  );
}

function Desenho({ largura: W, altura: H, ativo, reduzido, limite, destaques, zMax }) {
  const esq = 18;
  const dir = 22;
  const topo = 36;
  const base = H - 44;
  const pico = base - topo - 6;
  const zMin = -3.5;
  const temCauda = destaques.length > 0;

  // Região linear até o limite; depois dele, escala logarítmica comprimida
  // (o maior Z real pode passar de 16 — sem compressão, o sino viraria um traço).
  const xLimite = esq + (W - esq - dir) * (temCauda ? 0.64 : 0.86);
  const inicioCauda = xLimite + 12;
  const x = (z) => {
    if (z <= limite) return esq + ((z - zMin) / (limite - zMin)) * (xLimite - esq);
    const fracao = zMax > limite ? Math.log1p(z - limite) / Math.log1p(zMax - limite) : 0;
    return inicioCauda + (W - dir - inicioCauda) * fracao;
  };
  const yCurva = (z) => base - pico * Math.exp((-z * z) / 2);

  const pontosCurva = [];
  for (let z = zMin; z <= Math.min(limite, 3.8) + 1e-9; z += 0.05) pontosCurva.push([x(z), yCurva(z)]);
  const dCurva = `M${pontosCurva.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L')}`;
  const ultimo = pontosCurva[pontosCurva.length - 1];
  const dArea = `${dCurva} L${ultimo[0].toFixed(1)} ${base} L${pontosCurva[0][0].toFixed(1)} ${base} Z`;

  // Pontos ilustrativos da "maioria": quantis da normal, altura sorteada sob o sino
  const qtdTipicos = W < 480 ? 34 : 56;
  const sorteio = sequencia(42);
  const tipicos = Array.from({ length: qtdTipicos }, (_, i) => {
    const z = probit((i + 0.5) / qtdTipicos);
    return { x: x(z) + (sorteio() - 0.5) * 4, y: base - (0.06 + 0.82 * sorteio()) * pico * Math.exp((-z * z) / 2) - 3 };
  });

  const xCentro = x(0);
  const animar = (alvo, inicio) => (ativo ? alvo : inicio);

  return (
    <g>
      {/* Eixo */}
      <line x1={esq} x2={W - dir} y1={base} y2={base} stroke={C.eixo} strokeWidth={1.5} />

      {/* Área e contorno do sino */}
      <MotionPath
        d={dArea}
        fill={C.azul}
        initial={reduzido ? false : { opacity: 0 }}
        animate={animar({ opacity: 0.14 }, { opacity: 0 })}
        transition={{ delay: 0.9, duration: 0.8 }}
      />
      <MotionPath
        d={dCurva}
        fill="none"
        stroke={C.azul}
        strokeWidth={3}
        strokeLinecap="round"
        initial={reduzido ? false : { pathLength: 0 }}
        animate={animar({ pathLength: 1 }, { pathLength: 0 })}
        transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Média */}
      <line x1={xCentro} x2={xCentro} y1={base} y2={base + 6} stroke={C.textoSuave} strokeWidth={1.5} />
      <text x={xCentro} y={base + 22} textAnchor="middle" fontSize={T.medio} fill={C.textoSuave}>
        média (μ)
      </text>

      {/* "Maioria": nascem no centro e se acomodam sob o sino */}
      {tipicos.map((p, i) => (
        <MotionCircle
          key={`t${i}`}
          r={3.6}
          fill={C.azul}
          initial={reduzido ? false : { x: xCentro, y: base, opacity: 0 }}
          animate={animar({ x: p.x, y: p.y, opacity: 0.85 }, { x: xCentro, y: base, opacity: 0 })}
          transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.55 + i * 0.012 }}
        />
      ))}

      {/* Limite de corte */}
      <MotionG
        initial={reduzido ? false : { opacity: 0 }}
        animate={animar({ opacity: 1 }, { opacity: 0 })}
        transition={{ delay: 1.45, duration: 0.5 }}
      >
        <line x1={xLimite} x2={xLimite} y1={base} y2={topo - 8} stroke={C.amarelo} strokeWidth={2} strokeDasharray="6 5" />
        <text x={xLimite} y={topo - 16} textAnchor="middle" fontSize={T.grande} fontWeight={700} fill={C.amarelo}>
          Z = {limite}
        </text>
        {temCauda && (
          <>
            {/* Marca de quebra: a escala muda depois do limite */}
            <path
              d={`M${inicioCauda - 9} ${base + 5} l5 -10 M${inicioCauda - 4} ${base + 5} l5 -10`}
              stroke={C.textoSuave}
              strokeWidth={1.5}
            />
            {/* Ancorado no fim: no celular a cauda é estreita e o texto
                avança para a esquerda, abaixo do eixo, sem colidir */}
            <text x={W - dir} y={base + 22} textAnchor="end" fontSize={T.pequeno} fill={C.textoSuave}>
              escala comprimida →
            </text>
          </>
        )}
      </MotionG>

      {/* Empenhos de alta amplitude: se afastam devagar até o Z real */}
      {destaques.map((z, i) => (
        <MotionCircle
          key={`d${i}`}
          r={6}
          fill={C.amarelo}
          stroke={C.fundo}
          strokeWidth={1.5}
          initial={reduzido ? false : { x: xCentro, y: base - pico * 0.45, opacity: 0 }}
          animate={animar(
            { x: x(z), y: base - 12 - (i % 4) * 13, opacity: 1 },
            { x: xCentro, y: base - pico * 0.45, opacity: 0 },
          )}
          transition={{ type: 'spring', stiffness: 26, damping: 9, delay: 1.9 + i * 0.07 }}
        />
      ))}
    </g>
  );
}
