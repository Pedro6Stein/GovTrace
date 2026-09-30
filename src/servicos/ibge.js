export const buscarMunicipiosSP = async () => {
  try {
    const resposta = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios');
    const dados = await resposta.json();
    return dados.map(m => m.nome).sort();
  } catch (erro) {
    console.error('Erro ao buscar municípios do IBGE:', erro);
    return ['Bragança Paulista', 'Campinas', 'São Paulo']; // Fallback
  }
};
