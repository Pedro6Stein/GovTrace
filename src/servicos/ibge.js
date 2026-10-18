import { useEffect, useState } from 'react';

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

/**
 * Hook: carrega a lista de municípios de SP. Extraído para ser reusado por
 * qualquer seletor de cidade (SeletorPeriodo e ComparacaoMunicipios).
 */
export const useMunicipiosSP = () => {
  const [municipios, setMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    buscarMunicipiosSP().then((nomes) => {
      if (ativo) {
        setMunicipios(nomes);
        setCarregando(false);
      }
    });
    return () => { ativo = false; };
  }, []);

  return { municipios, carregando };
};
