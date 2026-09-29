/**
 * Cliente da GovTrace API (back-end Node.js).
 *
 * O front não fala mais com o TCE-SP nem calcula nada: pede à API a análise
 * pronta de um município/período e apenas apresenta o resultado.
 *
 * Em desenvolvimento local, crie `.env.local` com:
 *   VITE_API_URL=http://localhost:3333/api/analise
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://govtrace-api.onrender.com/api/analise';

// Leitura/escrita tolerantes a falha: o payload tem ~1 MB e o sessionStorage
// tem limite de ~5 MB. Cache cheio não pode derrubar a consulta.
const lerCache = (chave) => {
  try {
    const salvo = sessionStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
};

const gravarCache = (chave, valor) => {
  try {
    sessionStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // QuotaExceededError: segue sem cache para este período
  }
};

/**
 * Busca a análise consolidada: { parametros, totais, distribuicao, ranking, insights, despesas }
 */
export const buscarAnalise = async (municipio, ano, mes, { signal } = {}) => {
  const chaveCache = `govtrace_analise_${municipio}_${ano}_${mes}`;

  const emCache = lerCache(chaveCache);
  if (emCache) return emCache;

  const parametros = new URLSearchParams({ municipio, ano, mes });
  const resposta = await fetch(`${BASE_URL}?${parametros}`, { signal });
  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(corpo?.erro || `Erro HTTP ${resposta.status} ao consultar a GovTrace API`);
  }

  gravarCache(chaveCache, corpo);
  return corpo;
};
