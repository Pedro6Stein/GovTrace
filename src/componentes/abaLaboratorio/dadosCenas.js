/**
 * Dados que as cenas animadas do Laboratório Matemático precisam.
 *
 * Só números agregados: dias, valores, percentuais e Z. Nenhum objeto
 * devolvido daqui carrega nome de credor ou número de documento — o
 * Laboratório descreve o comportamento do conjunto, não aponta casos.
 */

/** Dia do mês (1–31) de um registro, para posicionar na linha do tempo. */
const diaDoMes = (data) => {
  const dia = Number(String(data ?? '').split('/')[0]);
  return dia >= 1 && dia <= 31 ? dia : 15;
};

/** "dd/mm/aaaa" → número ordenável (aaaammdd); inválido vai para o fim. */
const chaveData = (data) => {
  const [d, m, a] = String(data ?? '').split('/');
  const n = Number(`${a}${m}${d}`);
  return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
};

/**
 * Recorrência: um bloco por empenho, no dia em que ele apareceu primeiro.
 * A API devolve { nome, valor, repeticoes }; o nome só serve para achar os
 * registros do grupo e não sai desta função.
 */
export function cenaRecorrencia(dados, despesas = []) {
  return (dados?.anomalias ?? [])
    .map((grupo) => {
      const primeiraData = new Map();
      for (const d of despesas) {
        if (d.fornecedorNome !== grupo.nome || d.valor !== grupo.valor) continue;
        const atual = primeiraData.get(d.documento);
        if (!atual || chaveData(d.data) < chaveData(atual)) primeiraData.set(d.documento, d.data);
      }
      return { valor: grupo.valor, repeticoes: grupo.repeticoes, dias: [...primeiraData.values()].map(diaDoMes) };
    })
    .sort((a, b) => b.repeticoes - a.repeticoes);
}

/** Concentração por área: { area, percentual }, a maior primeiro. */
export function cenaConcentracaoArea(dados) {
  return (dados?.departamentosDependentes ?? [])
    .map((item) => ({ area: item.orgao, percentual: Number(item.percentual) }))
    .sort((a, b) => b.percentual - a.percentual);
}

/** Z de cada empenho destacado — posiciona os pontos na curva. */
export function zDosEmpenhos(dados) {
  const est = dados?.estatisticas;
  if (!est?.desvioPadrao) return [];
  const maiorPorDocumento = new Map();
  for (const o of dados.outliers ?? []) {
    const chave = o.documento ?? `${o.valor}`;
    maiorPorDocumento.set(chave, Math.max(maiorPorDocumento.get(chave) ?? 0, Math.abs(Number(o.valor) || 0)));
  }
  return [...maiorPorDocumento.values()].map((v) => (v - est.media) / est.desvioPadrao).filter(Number.isFinite);
}
