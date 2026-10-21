import { motion } from 'framer-motion';

import Palco from './Palco';
import { CORES_PALCO as C, TEXTO_PALCO as T } from './coresPalco';
import { formatarPercentual } from '../../../utilitarios/formatadores';

const MotionPath = motion.path;
const MotionRect = motion.rect;
const MotionCircle = motion.circle;
const MotionText = motion.text;

const ALTURA = 270;
const DIGITOS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const esperado = (d) => Math.log10(1 + 1 / d) * 100;

// Catmull-Rom → Bézier: curva suave passando exatamente pelos 9 pontos.
function caminhoSuave(pontos) {
  let d = `M${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Cena da Lei de Newcomb-Benford: a curva logarítmica esperada se desenha
 * e as barras reais do município sobem com física de mola.
 *
 * Props:
 *   frequencias     [{ digito, percentualObservado, percentualEsperado }] (ausente = amostra pequena)
 *   digitoDestaque  dígito com diferença acima do limite (ou null)
 */
export default function CenaBenford({ frequencias, digitoDestaque }) {
  const descricao = frequencias
    ? `Gráfico de barras dos primeiros dígitos de 1 a 9, comparado com a curva esperada. ${frequencias
        .map((f) => `Dígito ${f.digito}: ${formatarPercentual(f.percentualObservado)} observado, ${formatarPercentual(f.percentualEsperado)} esperado`)
        .join('. ')}.`
    : 'Curva esperada dos primeiros dígitos. Há menos de 100 lançamentos no período, então as barras do município não são exibidas.';

  const legenda = [
    { cor: C.amarelo, rotulo: 'Proporção esperada (fórmula)', forma: 'linha' },
    ...(frequencias ? [{ cor: C.azul, rotulo: 'Proporção no município', forma: 'quadrado' }] : []),
    ...(digitoDestaque ? [{ cor: C.laranja, rotulo: `Dígito ${digitoDestaque}: diferença acima de 5 pontos`, forma: 'quadrado' }] : []),
  ];

  return (
    <Palco altura={ALTURA} descricao={descricao} legenda={legenda}>
      {(ctx) => <Desenho {...ctx} frequencias={frequencias} digitoDestaque={digitoDestaque} />}
    </Palco>
  );
}

function Desenho({ largura: W, altura: H, ativo, reduzido, frequencias, digitoDestaque }) {
  const esq = 42;
  const dir = 14;
  const topo = 18;
  const base = H - 36;
  const escalaMax = 35;
  const y = (pct) => base - (Math.min(pct, escalaMax) / escalaMax) * (base - topo);
  const faixa = (W - esq - dir) / 9;
  const cx = (d) => esq + faixa * (d - 0.5);
  const larguraBarra = Math.min(faixa * 0.56, 36);
  const animar = (alvo, inicio) => (ativo ? alvo : inicio);

  const pontosEsperados = DIGITOS.map((d) => [cx(d), y(esperado(d))]);

  return (
    <g>
      {/* Grade horizontal de referência */}
      {[0, 10, 20, 30].map((v) => (
        <g key={v}>
          <line x1={esq} x2={W - dir} y1={y(v)} y2={y(v)} stroke={v === 0 ? C.eixo : C.neutro} strokeWidth={v === 0 ? 1.5 : 1} />
          <text x={esq - 8} y={y(v) + 4} textAnchor="end" fontSize={T.pequeno} fill={C.textoSuave}>
            {v}%
          </text>
        </g>
      ))}

      {/* Barras do município — física de mola */}
      {frequencias?.map((f, i) => {
        const topoBarra = y(f.percentualObservado);
        const destaque = f.digito === digitoDestaque;
        return (
          <g key={f.digito}>
            <MotionRect
              x={cx(f.digito) - larguraBarra / 2}
              y={topoBarra}
              width={larguraBarra}
              height={Math.max(base - topoBarra, 0)}
              rx={3}
              fill={destaque ? C.laranja : C.azul}
              fillOpacity={destaque ? 1 : 0.85}
              style={{ originX: 0.5, originY: 1, transformBox: 'fill-box' }}
              initial={reduzido ? false : { scaleY: 0 }}
              animate={animar({ scaleY: 1 }, { scaleY: 0 })}
              transition={{ type: 'spring', stiffness: 130, damping: 10, delay: 1.1 + i * 0.08 }}
            />
            {destaque && (
              <MotionText
                x={cx(f.digito)}
                y={topoBarra - 8}
                textAnchor="middle"
                fontSize={T.medio}
                fontWeight={700}
                fill={C.laranja}
                initial={reduzido ? false : { opacity: 0 }}
                animate={animar({ opacity: 1 }, { opacity: 0 })}
                transition={{ delay: 2.2, duration: 0.4 }}
              >
                {formatarPercentual(f.percentualObservado)}
              </MotionText>
            )}
          </g>
        );
      })}

      {/* Curva esperada — desenhada por cima das barras */}
      <MotionPath
        d={caminhoSuave(pontosEsperados)}
        fill="none"
        stroke={C.amarelo}
        strokeWidth={3}
        strokeLinecap="round"
        initial={reduzido ? false : { pathLength: 0 }}
        animate={animar({ pathLength: 1 }, { pathLength: 0 })}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
      />
      {pontosEsperados.map(([px, py], i) => (
        <MotionCircle
          key={i}
          cx={px}
          cy={py}
          r={4.5}
          fill={C.amarelo}
          stroke={C.fundo}
          strokeWidth={1.5}
          initial={reduzido ? false : { opacity: 0 }}
          animate={animar({ opacity: 1 }, { opacity: 0 })}
          transition={{ delay: 0.15 + i * 0.14, duration: 0.25 }}
        />
      ))}

      {/* Dígitos */}
      {DIGITOS.map((d) => (
        <text
          key={d}
          x={cx(d)}
          y={base + 22}
          textAnchor="middle"
          fontSize={T.grande}
          fontWeight={d === digitoDestaque ? 700 : 500}
          fill={d === digitoDestaque ? C.laranja : C.texto}
        >
          {d}
        </text>
      ))}

      {!frequencias && (
        <text x={(esq + W - dir) / 2} y={topo + 20} textAnchor="middle" fontSize={T.medio} fill={C.texto}>
          <tspan x={(esq + W - dir) / 2}>Menos de 100 lançamentos:</tspan>
          <tspan x={(esq + W - dir) / 2} dy={18}>comparação indisponível</tspan>
        </text>
      )}
    </g>
  );
}
