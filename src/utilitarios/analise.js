/**
 * GOVTRACE - MOTOR DE ANÁLISE TÉCNICA E ESTATÍSTICA
 * Equipe: Enzo Corcetti, Lucas Policene, Pedro Stein
 * Orientador: Nunca sei quem é o corno toda hora muda
 * 
 * Propósito: Transformar dados públicos brutos em informação e conhecimento cidadão.
 * Princípio: O algoritmo não julga a legalidade do gasto. Ele aplica cálculos 
 * matemáticos lineares (O(n)) para identificar padrões de concentração e volume,
 * devolvendo insights explicativos e cientificamente neutros.
 */

// 1. FILTRO DE ENTIDADES ESTATAIS E BANCÁRIAS (A "Máquina Pública")
// Para analisar a competitividade (para quem a prefeitura compra), precisamos 
// separar os gastos da própria máquina (impostos, repasses, folha de pagamento).
// Sem isso, a Receita Federal ou a própria Prefeitura apareceriam como "maiores fornecedores".
const ENTIDADES_IGNORADAS = [
    'PREFEITURA', 'MINISTERIO DA FAZENDA', 'CAIXA ECONOMICA', 
    'BANCO DO BRASIL', 'INSS', 'INSTITUTO NACIONAL DO SEGURO SOCIAL',
    'SANTANDER', 'BRADESCO', 'TRIBUNAL DE JUSTICA'
  ];
  
  /**
   * Função: calcularTotaisGerais
   * Complexidade: O(n) - Varre os dados apenas uma vez.
   * Objetivo: Calcular o volume financeiro do período e o maior registro unitário.
   */
  export const calcularTotaisGerais = (despesas) => {
    let valorTotal = 0;
    let maiorPagamento = { valor: 0 };
  
    for (const despesa of despesas) {
      valorTotal += despesa.valor;
      
      if (despesa.valor > maiorPagamento.valor) {
        maiorPagamento = despesa;
      }
    }
  
    return { valorTotal, maiorPagamento, totalRegistros: despesas.length };
  };
  
  /**
   * Função: gerarRankingFornecedores
   * Complexidade: O(n) via Tabela Hash (Map).
   * Objetivo: Agrupar pagamentos por recebedor, isolando o mercado privado da máquina pública.
   */
  export const gerarRankingFornecedores = (despesas) => {
    const mapaFornecedores = new Map();
  
    for (const despesa of despesas) {
      const nomeMaiusculo = despesa.fornecedorNome.toUpperCase();
      
      // Ignora entidades governamentais/bancárias para focar em fornecedores de mercado
      const ehGovernoOuBanco = ENTIDADES_IGNORADAS.some(ignorado => nomeMaiusculo.includes(ignorado));
      if (ehGovernoOuBanco) continue;
  
      // Agrupamento instantâneo
      if (mapaFornecedores.has(despesa.fornecedorId)) {
        const acumulado = mapaFornecedores.get(despesa.fornecedorId);
        acumulado.valorTotal += despesa.valor;
        acumulado.quantidade += 1;
      } else {
        mapaFornecedores.set(despesa.fornecedorId, {
          id: despesa.fornecedorId,
          nome: despesa.fornecedorNome,
          valorTotal: despesa.valor,
          quantidade: 1
        });
      }
    }
  
    // Ordena do fornecedor que mais recebeu para o que menos recebeu
    return Array.from(mapaFornecedores.values())
      .sort((a, b) => b.valorTotal - a.valorTotal);
  };
  
  /**
   * Função: gerarInsightConcentracao (Regra de Negócio Central)
   * Objetivo: Explicar o dado matemático de forma didática. Retorna mensagens claras
   * que traduzem o impacto da concentração de recursos, sem acusações.
   */
  export const gerarInsightConcentracao = (ranking, valorTotalGeral) => {
    if (!ranking || ranking.length === 0 || valorTotalGeral === 0) return null;
  
    const top5 = ranking.slice(0, 5);
    const somaTop5 = top5.reduce((acc, fornecedor) => acc + fornecedor.valorTotal, 0);
    const percentual = (somaTop5 / valorTotalGeral) * 100;
    
    // Formatação didática para crianças/leigos: "De cada 100 reais, X foram para os top 5"
    const reaisApenasTop5 = Math.round(percentual);
  
    // Regra de Alerta: > 30% é considerado alta concentração pelo motor do GovTrace
    const alerta = percentual > 30;
  
    return {
      alerta,
      percentual: percentual.toFixed(1),
      somaTop5,
      mensagemPrincipal: alerta 
        ? `Alta concentração: os 5 maiores fornecedores representam ${percentual.toFixed(1)}% de todo o valor financeiro do período.` 
        : `Distribuição equilibrada: o gasto está pulverizado entre vários fornecedores.`,
      
      // O grande diferencial do TCC: A explicação didática e neutra.
      insightEducativo: alerta
        ? `O que isso significa? De cada R$ 100 registrados neste mês, R$ ${reaisApenasTop5} foram direcionados para apenas 5 empresas. Matematicamente, isso indica que o município está altamente dependente de poucos parceiros comerciais. Isso não é uma acusação de fraude, mas um alerta estatístico para a competitividade.`
        : `O que isso significa? O dinheiro público girou de forma mais equilibrada, chegando a um número maior de empresas na economia local ou regional.`,
      
      top5
    };
  };

  /**
 * Função: calcularDistribuicaoPorCategoria
 * Objetivo: Pegar os milhões gastos e fatiar pelas áreas sociais para
 * renderização no painel amigável do cidadão.
 */
export const calcularDistribuicaoPorCategoria = (despesas) => {
  const categorias = new Map();
  let totalMapeado = 0;

  for (const despesa of despesas) {
    const categoria = categorizarDespesa(despesa.orgao);
    categorias.set(categoria, (categorias.get(categoria) || 0) + despesa.valor);
    totalMapeado += despesa.valor;
  }

  // Converte para array, calcula o % de cada área e ordena da maior para a menor
  return Array.from(categorias.entries())
    .map(([nome, valor]) => ({
      nome,
      valor,
      percentual: totalMapeado > 0 ? ((valor / totalMapeado) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.valor - a.valor);
};