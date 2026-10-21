import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import Palco from './Palco';
import { CORES_PALCO as C, TEXTO_PALCO as T } from './coresPalco';
import { formatarMoedaExtenso } from '../../../utilitarios/formatadores';

const MotionRect = motion.rect;
const MotionG = motion.g;

const ALTURA = 280;
const CORES_GRUPOS = [C.azul, C.amarelo, C.violeta, C.verde];

/**
 * Cena da Recorrência de Lançamentos: cada bloco é um registro contábil.
 * Os blocos nascem na data real em que foram lançados (linha do tempo do
 * mês) e depois se reúnem em pilhas — uma por grupo de mesmo valor e mesmo
 * credor.
 *
 * Props:
 *   grupos  [{ valor, repeticoes, dias: number[] }] — já ordenados
 */
export default function CenaAgrupamento({ grupos }) {
  const descricao = grupos.length
    ? `Linha do tempo do mês com blocos coloridos. Os blocos de mesmo valor e mesmo credor se juntam em pilhas. Maiores grupos: ${grupos
        .slice(0, 4)
        .map((g) => `${formatarMoedaExtenso(g.valor)} registrado ${g.repeticoes} vezes`)
        .join('; ')}.`
    : 'Linha do tempo do mês. Nenhum valor se repetiu 5 vezes ou mais para o mesmo credor.';

  const legenda = grupos.length
    ? [{ cor: C.azul, rotulo: 'Cada bloco é um registro contábil (cor = grupo)', forma: 'quadrado' }]
    : [];

  return (
    <Palco altura={ALTURA} descricao={descricao} legenda={legenda}>
      {(ctx) => <Desenho {...ctx} grupos={grupos} />}
    </Palco>
  );
}

function Desenho({ largura: W, altura: H, ativo, reduzido, grupos }) {
  const [reunido, setReunido] = useState(reduzido);

  // Fase 1: os blocos aparecem nas suas datas. Fase 2: se reúnem nas pilhas.
  useEffect(() => {
    if (!ativo || reduzido) return undefined;
    const temporizador = setTimeout(() => setReunido(true), 1700);
    return () => clearTimeout(temporizador);
  }, [ativo, reduzido]);

  const mostrados = grupos.slice(0, W < 480 ? 3 : 4);
  const esq = 20;
  const dir = 20;
  const yLinha = 50;
  const base = H - 56;
  const xDia = (dia) => esq + ((dia - 1) / 30) * (W - esq - dir);
  const larguraColuna = (W - esq - dir) / Math.max(mostrados.length, 1);
  const centroColuna = (g) => esq + larguraColuna * (g + 0.5);
  const lado = 11;
  const passo = lado + 3;
  const maxLinhas = Math.max(4, Math.floor((base - yLinha - 28) / passo));

  return (
    <g>
      {/* Linha do tempo do mês */}
      <MotionG
        initial={false}
        animate={{ opacity: reunido ? 0.35 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <line x1={esq} x2={W - dir} y1={yLinha} y2={yLinha} stroke={C.eixo} strokeWidth={1.5} />
        {[1, 15, 31].map((dia) => (
          <g key={dia}>
            <line x1={xDia(dia)} x2={xDia(dia)} y1={yLinha} y2={yLinha + 5} stroke={C.eixo} />
            <text
              x={xDia(dia)}
              y={yLinha + 20}
              textAnchor={dia === 1 ? 'start' : dia === 31 ? 'end' : 'middle'}
              fontSize={T.pequeno}
              fill={C.textoSuave}
            >
              dia {dia}
            </text>
          </g>
        ))}
      </MotionG>

      {mostrados.map((grupo, g) => {
        const cor = CORES_GRUPOS[g % CORES_GRUPOS.length];
        const colunasPilha = Math.ceil(grupo.dias.length / maxLinhas);
        const larguraPilha = colunasPilha * passo - 3;

        return (
          <g key={g}>
            {grupo.dias.map((dia, k) => {
              const inicio = { x: xDia(dia) - lado / 2, y: yLinha - lado - 6 - g * 4 - (k % 2) * 3 };
              const fim = {
                x: centroColuna(g) - larguraPilha / 2 + Math.floor(k / maxLinhas) * passo,
                y: base - ((k % maxLinhas) + 1) * passo + 3,
              };
              const alvo = !ativo
                ? { ...inicio, opacity: 0 }
                : reunido
                  ? { ...fim, opacity: 1 }
                  : { ...inicio, opacity: 1 };

              return (
                <MotionRect
                  key={k}
                  width={lado}
                  height={lado}
                  rx={2}
                  fill={cor}
                  initial={reduzido ? false : { ...inicio, opacity: 0 }}
                  animate={alvo}
                  transition={
                    reunido
                      ? { type: 'spring', stiffness: 85, damping: 13, delay: g * 0.18 + k * 0.03 }
                      : { duration: 0.3, delay: 0.2 + (dia / 31) * 0.9 }
                  }
                />
              );
            })}

            {/* Rótulo da pilha: valor repetido e quantidade de registros */}
            <MotionG
              initial={reduzido ? false : { opacity: 0 }}
              animate={{ opacity: reunido ? 1 : 0 }}
              transition={{ delay: reunido && !reduzido ? 0.6 + g * 0.18 : 0, duration: 0.4 }}
            >
              <text x={centroColuna(g)} y={base + 20} textAnchor="middle" fontSize={T.medio} fontWeight={700} fill={cor}>
                {formatarMoedaExtenso(grupo.valor)}
              </text>
              <text x={centroColuna(g)} y={base + 37} textAnchor="middle" fontSize={T.pequeno} fill={C.textoSuave}>
                {grupo.repeticoes} registros
              </text>
            </MotionG>
          </g>
        );
      })}

      {!mostrados.length && (
        <text x={W / 2} y={(yLinha + base) / 2 + 20} textAnchor="middle" fontSize={T.medio} fill={C.texto}>
          <tspan x={W / 2}>Nenhum valor se repetiu</tspan>
          <tspan x={W / 2} dy={18}>5 vezes ou mais para o mesmo credor</tspan>
        </text>
      )}
    </g>
  );
}
