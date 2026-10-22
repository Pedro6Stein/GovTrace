import { useEffect, useState } from 'react';

const movimentoReduzido = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Desacelera no fim (easeOutExpo): o número "pousa" no valor real.
const desacelerar = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Conta de 0 até `alvo` em `duracao` ms (requestAnimationFrame).
 * Com prefers-reduced-motion, devolve o valor final direto.
 */
export default function useContagem(alvo, duracao = 1400) {
  const final = Number(alvo) || 0;
  const [valor, setValor] = useState(() => (movimentoReduzido() ? final : 0));

  useEffect(() => {
    if (movimentoReduzido()) {
      setValor(final);
      return undefined;
    }
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      setValor(final * desacelerar(t));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [final, duracao]);

  return valor;
}
