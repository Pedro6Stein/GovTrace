import { useEffect, useState } from 'react';
import { buscarAnalise } from '../../servicos/apiGovtrace';

/**
 * Busca a análise de UM município/período, com os mesmos estados que o
 * Painel principal usa (vazio/carregando/pronto/erro) — mas isolado por
 * instância, para que a Cidade A e a Cidade B carreguem em paralelo sem que
 * o cancelamento de uma afete a outra.
 *
 * `pular: true` mantém o hook ocioso: usado quando o chamador já tem os
 * dados prontos de outra fonte (ex.: a cidade já carregada na aba "A Cidade",
 * reaproveitada aqui para não repetir a mesma requisição).
 */
export function useAnaliseMunicipio(municipio, ano, mes, { pular = false } = {}) {
  const [estado, setEstado] = useState({ status: 'vazio', dados: null, erro: null });

  useEffect(() => {
    if (!municipio || pular) {
      setEstado({ status: 'vazio', dados: null, erro: null });
      return;
    }

    const controlador = new AbortController();
    setEstado({ status: 'carregando', dados: null, erro: null });

    buscarAnalise(municipio, ano, mes, { signal: controlador.signal })
      .then((analise) => setEstado({ status: 'pronto', dados: analise, erro: null }))
      .catch((erro) => {
        if (erro.name === 'AbortError') return;
        setEstado({ status: 'erro', dados: null, erro: erro.message || 'Não foi possível consultar os dados.' });
      });

    return () => controlador.abort();
  }, [municipio, ano, mes, pular]);

  return estado;
}
