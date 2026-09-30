/**
 * Formatadores de APRESENTAÇÃO (pt-BR).
 *
 * Nenhum cálculo de negócio aqui — só transformam números prontos da
 * GovTrace API em texto legível. Centralizar evita que cada componente
 * formate de um jeito ("4.68%" num card, "4,7%" no outro).
 */

const moedaExata = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR');
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 292226206.17 → "R$ 292.226.206,17" */
export const formatarMoeda = (valor) => moedaExata.format(valor ?? 0);

/** 4534 → "4.534" */
export const formatarInteiro = (n) => inteiro.format(n ?? 0);

/**
 * Valor por extenso abreviado, legível para leigos e idosos:
 *   292226206.17 → "R$ 292,2 milhões"
 *   1450000000   → "R$ 1,4 bilhão"
 *   47848.26     → "R$ 47,8 mil"
 *   980          → "R$ 980,00"
 */
export const formatarMoedaExtenso = (valor = 0) => {
  const abs = Math.abs(valor);
  const sinal = valor < 0 ? '-' : '';
  const escalas = [
    [1e9, 'bilhão', 'bilhões'],
    [1e6, 'milhão', 'milhões'],
    [1e3, 'mil', 'mil'],
  ];
  for (const [base, singular, plural] of escalas) {
    if (abs >= base) {
      const n = abs / base;
      const texto = umaCasa.format(n).replace(/,0$/, '');
      return `${sinal}R$ ${texto} ${n < 2 ? singular : plural}`;
    }
  }
  return moedaExata.format(valor);
};

/**
 * Percentual em pt-BR sempre com 1 casa (colunas alinham), sem "0%"
 * enganoso para fatias reais:
 *   47.53  → "47,5%"
 *   23     → "23,0%"
 *   0.0021 → "< 0,1%"
 *   0      → "0,0%"
 */
export const formatarPercentual = (p) => {
  const n = Number(p) || 0;
  if (n > 0 && n < 0.05) return '< 0,1%';
  return `${umaCasa.format(n)}%`;
};

/** Filtros → "junho de 2026" */
export const formatarPeriodo = (mes, ano) => {
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
