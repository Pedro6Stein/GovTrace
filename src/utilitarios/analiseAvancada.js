/**
 * GOVTRACE - MOTOR DE AUDITORIA FORENSE E CIÊNCIA DE DADOS
 * Este módulo abriga os algoritmos de detecção de anomalias.
 * O retorno de cada função sempre contém a prova matemática e a explicação cidadã.
 */

const ENTIDADES_IGNORADAS = [
    'PREFEITURA', 'MINISTERIO DA FAZENDA', 'CAIXA ECONOMICA', 
    'BANCO DO BRASIL', 'INSS', 'INSTITUTO NACIONAL DO SEGURO SOCIAL'
  ];
  
  /**
   * 1. Z-SCORE (O Ponto Fora da Curva)
   * Identifica pagamentos que desviam violentamente do padrão financeiro normal da cidade.
   */
  export const detectarOutliersZScore = (despesas) => {
    const valoresValidos = despesas
      .filter(d => !ENTIDADES_IGNORADAS.some(i => d.fornecedorNome.toUpperCase().includes(i)))
      .map(d => d.valor)
      .filter(v => v > 0);
  
    if (valoresValidos.length < 10) return { alerta: false };
  
    // Calcula Média e Desvio Padrão O(n)
    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    const media = soma / valoresValidos.length;
    const variancia = valoresValidos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valoresValidos.length;
    const desvioPadrao = Math.sqrt(variancia);
  
    // Consideramos "Anomalia" o que estiver 4 desvios padrões acima da média (Z > 4)
    const outliers = despesas.filter(d => {
      if (d.valor <= 0 || ENTIDADES_IGNORADAS.some(i => d.fornecedorNome.toUpperCase().includes(i))) return false;
      const zScore = (d.valor - media) / desvioPadrao;
      return zScore > 4;
    }).sort((a, b) => b.valor - a.valor);
  
    const alerta = outliers.length > 0;
  
    return {
      alerta,
      outliers,
      titulo: "Gastos Fora do Padrão (Efeito Gigante)",
      insightEducativo: alerta 
        ? `Imagine que todos os pagamentos da cidade fossem pessoas normais caminhando na rua. O sistema identificou ${outliers.length} pagamento(s) que seriam equivalentes a gigantes de 5 metros de altura. Estatisticamente, esses valores fogem completamente do comportamento financeiro normal da prefeitura para este mês e merecem ser lidos com atenção.` 
        : "Todos os pagamentos seguiram o tamanho padrão esperado para a cidade."
    };
  };
  
  /**
   * 2. LEI DE BENFORD (A Regra da Natureza para o Dinheiro)
   * Na economia real, cerca de 30% dos valores começam com o dígito 1, 17% com 2, e assim por diante.
   * Se houver um pico no dígito 7, 8 ou 9, é indício estatístico de manipulação humana (valores inventados).
   */
  export const analisarLeiBenford = (despesas) => {
    const frequenciaIdeal = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
    const contagem = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    let totalAnalisado = 0;
  
    despesas.forEach(d => {
      if (d.valor >= 10 && !ENTIDADES_IGNORADAS.some(i => d.fornecedorNome.toUpperCase().includes(i))) {
        // Pega o primeiro dígito do valor
        const primeiroDigito = String(d.valor).charAt(0);
        if (primeiroDigito >= '1' && primeiroDigito <= '9') {
          contagem[primeiroDigito]++;
          totalAnalisado++;
        }
      }
    });
  
    if (totalAnalisado < 100) return { alerta: false };
  
    let maiorDesvio = 0;
    let digitoSuspeito = null;
  
    for (let i = 1; i <= 9; i++) {
      const percentualReal = (contagem[i] / totalAnalisado) * 100;
      const diferenca = percentualReal - frequenciaIdeal[i];
      
      // Se um dígito apareceu pelo menos 5% a mais do que a lei natural manda
      if (diferenca > 5 && diferenca > maiorDesvio) {
        maiorDesvio = diferenca;
        digitoSuspeito = i;
      }
    }
  
    const alerta = digitoSuspeito !== null;
  
    return {
      alerta,
      digitoSuspeito,
      titulo: "Teste de Manipulação de Dados (Lei de Benford)",
      insightEducativo: alerta
        ? `A ciência mostra que registros financeiros reais seguem uma escadinha natural (valores começados em 1 são os mais comuns, depois o 2, etc.). Neste mês, identificamos uma falha nessa matriz: o número ${digitoSuspeito} liderou pagamentos de forma artificial. Isso é um forte indício estatístico, usado por auditores, de que valores podem ter sido fracionados ou tabelados de forma não natural.`
        : `O comportamento dos números passou no teste científico de integridade. A distribuição dos valores parece orgânica e natural.`
    };
  };
  
  /**
   * 3. FRACIONAMENTO TEMPORAL (A Chuva de Notas Iguais)
   * Identifica se a mesma empresa recebeu vários pagamentos de valor EXATAMENTE igual.
   */
  export const detectarFracionamento = (despesas) => {
    const pagamentosPorFornecedor = new Map();
    const anomalias = [];
  
    for (const d of despesas) {
      if (d.valor < 500 || ENTIDADES_IGNORADAS.some(i => d.fornecedorNome.toUpperCase().includes(i))) continue;
  
      if (!pagamentosPorFornecedor.has(d.fornecedorId)) {
        pagamentosPorFornecedor.set(d.fornecedorId, { nome: d.fornecedorNome, valores: new Map() });
      }
      
      const empresa = pagamentosPorFornecedor.get(d.fornecedorId);
      const qtdVezes = (empresa.valores.get(d.valor) || 0) + 1;
      empresa.valores.set(d.valor, qtdVezes);
    }
  
    // Verifica quem recebeu o MESMO valor mais de 5 vezes no mesmo mês
    pagamentosPorFornecedor.forEach((dadosEmpresa, id) => {
      dadosEmpresa.valores.forEach((qtd, valorRepetido) => {
        if (qtd >= 5) {
          anomalias.push({ nome: dadosEmpresa.nome, valor: valorRepetido, repeticoes: qtd });
        }
      });
    });
  
    const alerta = anomalias.length > 0;
  
    return {
      alerta,
      anomalias,
      titulo: "Chuva de Valores Repetidos (Fracionamento)",
      insightEducativo: alerta
        ? `Geralmente, grandes serviços geram grandes notas fiscais únicas. Mas encontramos empresas que receberam exatamente o mesmo valor ${anomalias[0]?.repeticoes} vezes no mesmo mês. Quando o dinheiro é "picotado" em vários pedaços iguais, pode ser uma tática para escapar dos limites de valor que obrigam a prefeitura a fazer uma licitação pública.`
        : `Não detectamos fatiamento suspeito de pagamentos para a mesma empresa.`
    };
  };
  
  /**
   * 4. RISCO DE MONOPÓLIO POR ÓRGÃO (O Dono do Departamento)
   * Identifica se uma secretaria ou departamento está entregando mais de 50% de seu dinheiro para uma só empresa.
   */
  export const detectarMonopolioPorOrgao = (despesas) => {
    const orgaos = new Map();
  
    for (const d of despesas) {
      if (ENTIDADES_IGNORADAS.some(i => d.fornecedorNome.toUpperCase().includes(i))) continue;
  
      if (!orgaos.has(d.orgao)) {
        orgaos.set(d.orgao, { total: 0, fornecedores: new Map() });
      }
      
      const infoOrgao = orgaos.get(d.orgao);
      infoOrgao.total += d.valor;
      infoOrgao.fornecedores.set(d.fornecedorId, (infoOrgao.fornecedores.get(d.fornecedorId) || 0) + d.valor);
      // Salva o nome para exibir depois
      infoOrgao[`nome_${d.fornecedorId}`] = d.fornecedorNome;
    }
  
    const departamentosDependentes = [];
  
    orgaos.forEach((info, nomeOrgao) => {
      if (info.total > 50000) { // Só avalia secretarias que movimentaram mais de 50 mil
        info.fornecedores.forEach((valorEmpresa, idEmpresa) => {
          const monopolio = (valorEmpresa / info.total) * 100;
          if (monopolio >= 50) {
            departamentosDependentes.push({
              orgao: nomeOrgao,
              empresa: info[`nome_${idEmpresa}`],
              percentual: monopolio.toFixed(1)
            });
          }
        });
      }
    });
  
    const alerta = departamentosDependentes.length > 0;
  
    return {
      alerta,
      departamentosDependentes,
      titulo: "Dependência e Monopólio em Departamentos",
      insightEducativo: alerta
        ? `A prefeitura possui secretarias que estão "reféns" de uma única empresa. Por exemplo, identificamos que ${departamentosDependentes[0]?.percentual}% de todo o dinheiro movimentado pelo setor de '${departamentosDependentes[0]?.orgao}' foi entregue para apenas uma empresa. A falta de opções pode encarecer serviços públicos e afastar concorrentes locais.`
        : `Os departamentos públicos dividiram seus contratos de forma saudável, sem dependência extrema de apenas um parceiro comercial.`
    };
  };