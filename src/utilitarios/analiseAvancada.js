/**
 * GOVTRACE - MOTOR DE AUDITORIA FORENSE E CIÊNCIA DE DADOS
 * Este módulo abriga os algoritmos de detecção de anomalias.
 * O retorno de cada função sempre contém a prova matemática e a explicação cidadã.
 */

import { ENTIDADES_IGNORADAS, PARAMETROS_ANALISE, LEI_BENFORD_IDEAL, IDS_BANCOS_GOVERNO, NOMES_IGNORADOS_PESSOAL } from '../dados/configuracoes';
import { categorizarDespesa } from './regrasCategorias';

// Função auxiliar comum
const deveIgnorar = (d) => {
    const nomeMaiusculo = d.fornecedorNome.toUpperCase();
    return ENTIDADES_IGNORADAS.some(i => nomeMaiusculo.includes(i)) ||
           NOMES_IGNORADOS_PESSOAL.some(i => nomeMaiusculo.includes(i)) ||
           IDS_BANCOS_GOVERNO.some(id => d.fornecedorId.startsWith(id));
};

/**
 * 1. Z-SCORE (O Ponto Fora da Curva)
 */
export const detectarOutliersZScore = (despesas) => {
    const valoresValidos = despesas
      .filter(d => !deveIgnorar(d))
      .map(d => d.valor)
      .filter(v => v > 0);
  
    if (valoresValidos.length < 10) return { alerta: false };
  
    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    const media = soma / valoresValidos.length;
    const variancia = valoresValidos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valoresValidos.length;
    const desvioPadrao = Math.sqrt(variancia);
  
    const outliers = despesas.filter(d => {
      if (d.valor <= 0 || deveIgnorar(d)) return false;
      const zScore = (d.valor - media) / desvioPadrao;
      return zScore > PARAMETROS_ANALISE.Z_SCORE_LIMITE;
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
 */
export const analisarLeiBenford = (despesas) => {
    const frequenciaIdeal = LEI_BENFORD_IDEAL;
    const contagem = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    let totalAnalisado = 0;
  
    despesas.forEach(d => {
      if (d.valor >= 10 && !deveIgnorar(d)) {
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
      
      if (diferenca > PARAMETROS_ANALISE.BENFORD_DESVIO_ALERTA && diferenca > maiorDesvio) {
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
 */
export const detectarFracionamento = (despesas) => {
    const pagamentosPorFornecedor = new Map();
    const anomalias = [];
  
    for (const d of despesas) {
      if (d.valor < PARAMETROS_ANALISE.FRACIONAMENTO_VALOR_MINIMO || deveIgnorar(d)) continue;
  
      if (!pagamentosPorFornecedor.has(d.fornecedorId)) {
        pagamentosPorFornecedor.set(d.fornecedorId, { nome: d.fornecedorNome, valores: new Map() });
      }
      
      const empresa = pagamentosPorFornecedor.get(d.fornecedorId);
      const qtdVezes = (empresa.valores.get(d.valor) || 0) + 1;
      empresa.valores.set(d.valor, qtdVezes);
    }
  
    pagamentosPorFornecedor.forEach((dadosEmpresa, id) => {
      dadosEmpresa.valores.forEach((qtd, valorRepetido) => {
        if (qtd >= PARAMETROS_ANALISE.FRACIONAMENTO_MIN_REPETICOES) {
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
 * 4. RISCO DE MONOPÓLIO POR ÓRGÃO/CATEGORIA (O Dono do Departamento)
 */
export const detectarMonopolioPorOrgao = (despesas) => {
    const orgaos = new Map();
  
    for (const d of despesas) {
      if (deveIgnorar(d)) continue;
  
      // Usar a categoria inteligente que avalia órgão E fornecedor
      const categoriaReal = categorizarDespesa(d.orgao, d.fornecedorNome);

      if (!orgaos.has(categoriaReal)) {
        orgaos.set(categoriaReal, { total: 0, fornecedores: new Map() });
      }
      
      const infoOrgao = orgaos.get(categoriaReal);
      infoOrgao.total += d.valor;
      infoOrgao.fornecedores.set(d.fornecedorId, (infoOrgao.fornecedores.get(d.fornecedorId) || 0) + d.valor);
      infoOrgao[`nome_${d.fornecedorId}`] = d.fornecedorNome;
    }
  
    const departamentosDependentes = [];
  
    orgaos.forEach((info, nomeOrgao) => {
      if (info.total > PARAMETROS_ANALISE.MONOPOLIO_VALOR_CORTE) { 
        info.fornecedores.forEach((valorEmpresa, idEmpresa) => {
          const monopolio = (valorEmpresa / info.total) * 100;
          if (monopolio >= PARAMETROS_ANALISE.MONOPOLIO_PERCENTUAL) {
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
      titulo: "Dependência e Monopólio por Área",
      insightEducativo: alerta
        ? `A prefeitura possui áreas que estão "reféns" de uma única empresa. Por exemplo, identificamos que ${departamentosDependentes[0]?.percentual}% de todo o dinheiro movimentado na área de '${departamentosDependentes[0]?.orgao}' foi entregue para apenas uma empresa. A falta de opções pode encarecer serviços públicos e afastar concorrentes locais.`
        : `As áreas públicas dividiram seus contratos de forma saudável, sem dependência extrema de apenas um parceiro comercial.`
    };
};