export const normalizarDespesas = (dadosBrutos) => {
    if (!Array.isArray(dadosBrutos)) return [];
  
    return dadosBrutos.map((registro) => {
      // Limpeza do ID do fornecedor: extrai apenas os números (remove "PESSOA FÍSICA - ", etc.)
      const fornecedorIdLimpo = registro.id_fornecedor
        ? registro.id_fornecedor.replace(/\D/g, '')
        : 'SEM_ID';
  
      // Conversão de valor: troca vírgula por ponto e transforma a string em Float para cálculos
      const valorTratado = registro.vl_despesa
        ? parseFloat(registro.vl_despesa.replace('.', '').replace(',', '.'))
        : 0;
  
      // Retorna o nosso modelo de domínio interno em português
      return {
        orgao: registro.orgao || 'Órgão não informado',
        evento: registro.evento || 'Não informado',
        documento: registro.nr_empenho || 'Sem documento',
        fornecedorId: fornecedorIdLimpo,
        fornecedorNome: registro.nm_fornecedor || 'Fornecedor não identificado',
        data: registro.dt_emissao_despesa || '',
        valor: isNaN(valorTratado) ? 0 : valorTratado,
      };
    });
  };