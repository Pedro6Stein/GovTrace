/**
 * NORMALIZADOR DE DADOS (ETL)
 * Transforma o JSON bruto do TCE em um modelo de domínio confiável,
 * resolvendo o ciclo contábil (Empenhos, Anulações, Pagamentos).
 */
export const normalizarDespesas = (dadosBrutos) => {
  if (!Array.isArray(dadosBrutos)) return [];

  // 1. Filtramos apenas o que nos interessa para a análise de mercado.
  // Para bater com o painel do TCE ("Despesa empenhada"), olhamos os empenhos e reforços.
  // Para análise de pagamento real, olharíamos apenas "Pago". Vamos focar no Empenhado.
  const eventosValidos = ['Empenhado', 'Reforço', 'Anulação'];

  const dadosFiltrados = dadosBrutos.filter(registro => 
    registro.evento && eventosValidos.includes(registro.evento)
  );

  return dadosFiltrados.map((registro) => {
    const fornecedorIdLimpo = registro.id_fornecedor
      ? registro.id_fornecedor.replace(/\D/g, '')
      : 'SEM_ID';

    // Troca vírgula por ponto para o JavaScript calcular
    let valorTratado = registro.vl_despesa
      ? parseFloat(registro.vl_despesa.replace('.', '').replace(',', '.'))
      : 0;

    // Regra Contábil de Segurança: Se for anulação, o valor passa a ser negativo
    if (registro.evento === 'Anulação') {
      valorTratado = -Math.abs(valorTratado);
    }

    return {
      orgao: registro.orgao || 'Não informado',
      evento: registro.evento || 'Não informado',
      documento: registro.nr_empenho || 'Sem documento',
      fornecedorId: fornecedorIdLimpo,
      fornecedorNome: registro.nm_fornecedor || 'Fornecedor não identificado',
      data: registro.dt_emissao_despesa || '',
      valor: isNaN(valorTratado) ? 0 : valorTratado,
    };
  });
};