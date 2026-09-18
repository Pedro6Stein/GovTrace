import { normalizarDespesas } from '../utilitarios/normalizacao';

const BASE_URL = 'https://transparencia.tce.sp.gov.br/api/json/despesas';

export const buscarDespesas = async (municipio, ano, mes) => {
  try {
    // Formata o município para a URL (ex: "Bragança Paulista" vira "braganca-paulista")
    const municipioFormatado = municipio
      .toLowerCase()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-'); // Troca espaços por traços

    const url = `${BASE_URL}/${municipioFormatado}/${ano}/${mes}`;
    
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dadosBrutos = await resposta.json();
    
    // Retorna os dados já limpos e formatados para o nosso motor de análise
    return normalizarDespesas(dadosBrutos);
  } catch (erro) {
    console.error('Erro ao buscar dados do TCE-SP:', erro);
    throw erro;
  }
};