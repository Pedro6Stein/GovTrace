import { normalizarDespesas } from '../utilitarios/normalizacao';

const BASE_URL = 'https://transparencia.tce.sp.gov.br/api/json/despesas';

export const buscarDespesas = async (municipio, ano, mes) => {
  try {
    const municipioFormatado = municipio
      .toLowerCase()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-'); // Troca espaços por traços

    const url = `${BASE_URL}/${municipioFormatado}/${ano}/${mes}`;
    
    // 1. CRIAÇÃO DA CHAVE DE CACHE (Ex: govtrace_braganca-paulista_2026_1)
    const chaveCache = `govtrace_${municipioFormatado}_${ano}_${mes}`;

    // 2. VERIFICAÇÃO DE CACHE (Leitura instantânea)
    const dadosEmCache = sessionStorage.getItem(chaveCache);
    if (dadosEmCache) {
      console.log(`⚡ Carregado do cache: ${chaveCache}`);
      return JSON.parse(dadosEmCache); // Devolve os dados sem fazer requisição à API
    }

    // 3. SE NÃO HOUVER CACHE, FAZ O FETCH NO TCE-SP
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    const dadosBrutos = await resposta.json();
    const dadosLimpos = normalizarDespesas(dadosBrutos);

    // 4. GUARDA O RESULTADO NA MEMÓRIA PARA A PRÓXIMA VEZ
    sessionStorage.setItem(chaveCache, JSON.stringify(dadosLimpos));

    return dadosLimpos;
  } catch (erro) {
    console.error('Erro ao buscar dados do TCE-SP:', erro);
    throw erro;
  }
};