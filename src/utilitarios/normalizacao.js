/**
 * NORMALIZADOR DE DADOS (ETL)
 * Transforma o JSON bruto do TCE em um modelo de domínio confiável,
 * resolvendo o ciclo contábil (Empenhos, Anulações, Pagamentos).
 */
export const normalizarDespesas = (dadosBrutos) => {
  if (!Array.isArray(dadosBrutos)) return [];

  // 1. Filtramos apenas o que nos interessa para a análise de mercado.
  const eventosValidos = ['Empenhado', 'Reforço', 'Anulação', 'Valor Liquidado', 'Valor Pago', 'Liquidado', 'Pago'];

  const dadosFiltrados = dadosBrutos.filter(registro => 
    registro.evento && eventosValidos.some(ev => registro.evento.includes(ev))
  );

  return dadosFiltrados.map((registro) => {
    const fornecedorIdLimpo = registro.id_fornecedor
      ? registro.id_fornecedor.replace(/\D/g, '')
      : 'SEM_ID';

    // Flag para identificar se é CNPJ (empresa privada/pública) vs Pessoa Física ou Folha
    const ehPessoaJuridica = registro.id_fornecedor 
      ? registro.id_fornecedor.toUpperCase().includes('CNPJ - PESSOA JURÍDICA')
      : false;

    // Troca TODOS os pontos de milhar por nada, e a vírgula por ponto para o JavaScript calcular
    let valorTratado = registro.vl_despesa
      ? parseFloat(registro.vl_despesa.replace(/\./g, '').replace(',', '.'))
      : 0;

    // Regra Contábil de Segurança: Se for anulação, o valor passa a ser negativo
    if (registro.evento.includes('Anulação')) {
      valorTratado = -Math.abs(valorTratado);
    }

    // Normaliza os eventos legados
    let eventoNormalizado = registro.evento || 'Não informado';
    if (eventoNormalizado.includes('Liquidado')) eventoNormalizado = 'Liquidado';
    if (eventoNormalizado.includes('Pago')) eventoNormalizado = 'Pago';

    return {
      orgao: registro.orgao || 'Não informado',
      evento: eventoNormalizado,
      documento: registro.nr_empenho || 'Sem documento',
      fornecedorId: fornecedorIdLimpo,
      fornecedorNome: registro.nm_fornecedor || 'Fornecedor não identificado',
      ehPessoaJuridica,
      data: registro.dt_emissao_despesa || '',
      valor: isNaN(valorTratado) ? 0 : valorTratado,
    };
  });
};