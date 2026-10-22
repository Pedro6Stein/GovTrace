import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';

import { formatarInteiro, formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

/**
 * Vocabulário do Laboratório Matemático.
 *
 * Os títulos e explicações vêm daqui, e não de `dados.titulo` /
 * `dados.insightEducativo` da GovTrace API: o texto da API usa termos de
 * auditoria ("fora do padrão", "fracionamento", "monopólio") que a banca
 * pediu para não exibir. A regra matemática continua sendo a da API — só a
 * forma de contar o resultado mudou.
 */

// Espelha PARAMETROS_ANALISE.CONCENTRACAO_CR5_ALERTA da GovTrace API
export const LIMITE_CR5 = 30;

export const ORDEM_MOTORES = ['zScore', 'fracionamento', 'monopolio', 'concentracao', 'benford'];

export const MOTOR_CONFIG = {
  zScore: {
    rotulo: 'Curva Z-Score',
    // U+2011 (hífen inseparável): no celular o título não quebra em "Z-" / "Score"
    titulo: 'Pontos de Alta Amplitude (Curva Z‑Score)',
    Icone: ScatterPlotRoundedIcon,
    cor: '#0284C7',
    fundo: '#EFF8FF',
    pergunta: 'Algum empenho ficou muito longe do valor típico do mês?',
    descricaoMetodo:
      'Calcula a média e o desvio padrão de todos os empenhos válidos do período. Cada empenho conta uma vez, mesmo passando por várias etapas (empenho, liquidação e pagamento). Cada valor recebe um Z, que diz quantos desvios padrão ele está acima da média. Acima do limite (Z > 4), o empenho é destacado como ponto de alta amplitude.',
  },
  fracionamento: {
    rotulo: 'Recorrência de Lançamentos',
    titulo: 'Agrupamento de Lançamentos Próximos',
    Icone: ViewModuleRoundedIcon,
    cor: '#B45309',
    fundo: '#FFFBEB',
    pergunta: 'O mesmo valor apareceu em muitos empenhos do mesmo credor?',
    descricaoMetodo:
      'Agrupa os empenhos acima de R$ 500 por credor e por valor exato. Quando o mesmo valor aparece em 5 empenhos ou mais no período, o grupo é destacado. Cada empenho conta uma vez, mesmo passando por várias etapas.',
  },
  monopolio: {
    rotulo: 'Concentração Setorial',
    titulo: 'Concentração Setorial',
    Icone: BalanceRoundedIcon,
    cor: '#059669',
    fundo: '#F0FDF4',
    pergunta: 'Dentro de uma área, um único credor ficou com a maior parte do valor?',
    descricaoMetodo:
      'Para cada área com mais de R$ 50 mil em empenhos no período, calcula a fatia de cada credor (cada empenho conta uma vez). Quando um único credor fica com 50% ou mais do valor da área, a área é destacada.',
  },
  concentracao: {
    rotulo: 'Índice CR5',
    titulo: 'Participação dos 5 Maiores Credores',
    Icone: GridViewRoundedIcon,
    cor: '#C98B22',
    fundo: '#FEFCE8',
    pergunta: 'Quanto do dinheiro pago no mês foi para os 5 maiores credores?',
    descricaoMetodo: `Soma o que os 5 maiores credores receberam em pagamentos e divide pelo total pago no período. Acima de ${LIMITE_CR5}%, a participação é destacada como elevada.`,
  },
  benford: {
    rotulo: 'Lei de Newcomb-Benford',
    titulo: 'Distribuição dos Primeiros Dígitos',
    Icone: BarChartRoundedIcon,
    cor: '#7C3AED',
    fundo: '#F5F3FF',
    pergunta: 'Os primeiros dígitos dos valores seguem a proporção natural?',
    descricaoMetodo:
      'Conta com qual dígito (1 a 9) começa cada valor e compara com a proporção prevista pela fórmula de Newcomb-Benford. Diferenças acima de 5 pontos percentuais em um dígito são destacadas.',
  },
};

const plural = (n, um, varios) => (n === 1 ? um : varios);

const empenhosDistintos = (registros = []) =>
  new Set(registros.map((r) => r.documento)).size;

/**
 * Número-herói + legenda de cada cena. Motores com amostra insuficiente
 * chegam só com { alerta: false }: mostramos "—", nunca um zero enganoso.
 */
export function extrairMetrica(tipo, dados) {
  switch (tipo) {
    case 'zScore': {
      const { outliers } = dados;
      if (!outliers) return { valor: '—', legenda: 'Poucos lançamentos para desenhar a curva' };
      const docs = empenhosDistintos(outliers);
      return {
        valor: formatarInteiro(docs),
        legenda: docs
          ? `${plural(docs, 'empenho', 'empenhos')} de alta amplitude (Z > 4)`
          : 'empenhos acima de Z = 4',
      };
    }
    case 'fracionamento': {
      const { anomalias } = dados;
      if (!anomalias) return { valor: '—', legenda: 'Poucos lançamentos para comparar' };
      return {
        valor: formatarInteiro(anomalias.length),
        legenda: `${plural(anomalias.length, 'grupo', 'grupos')} de mesmo valor e mesmo credor em 5 empenhos ou mais`,
      };
    }
    case 'monopolio': {
      const areas = dados.departamentosDependentes;
      if (!areas) return { valor: '—', legenda: 'Poucos lançamentos para comparar' };
      const maior = areas.length ? Math.max(...areas.map((a) => Number(a.percentual))) : null;
      return {
        valor: formatarInteiro(areas.length),
        legenda:
          `${plural(areas.length, 'área', 'áreas')} em que um credor concentra 50% ou mais do valor` +
          (maior != null ? ` · maior: ${formatarPercentual(maior)}` : ''),
      };
    }
    case 'concentracao':
      if (dados.percentual == null) return { valor: '—', legenda: 'Poucos lançamentos para calcular' };
      return {
        valor: formatarPercentual(dados.percentual),
        legenda:
          'do valor do período foi para os 5 maiores credores' +
          (dados.somaTop5 ? ` (${formatarMoedaExtenso(dados.somaTop5)})` : ''),
      };
    case 'benford':
      if (!dados.frequencias) return { valor: '—', legenda: 'Menos de 100 lançamentos: amostra pequena para o teste' };
      if (dados.digitoSuspeito == null) return { valor: '—', legenda: 'Nenhum dígito com diferença acima de 5 pontos' };
      return { valor: String(dados.digitoSuspeito), legenda: 'dígito com diferença acima de 5 pontos da proporção esperada' };
    default:
      return null;
  }
}

/**
 * "Como ler esta cena" — explicação em linguagem comum, montada com os
 * números reais. Cada item vira um parágrafo.
 */
export function explicarCena(tipo, dados) {
  switch (tipo) {
    case 'zScore': {
      const { outliers, estatisticas } = dados;
      if (!estatisticas) {
        return ['Há menos de 10 lançamentos válidos no período, poucos para desenhar a curva com segurança.'];
      }
      const docs = empenhosDistintos(outliers);
      const base = `Pense nos lançamentos do mês lado a lado. A maioria fica perto do valor típico, de cerca de ${formatarMoedaExtenso(estatisticas.media)}: é o pico da curva.`;
      return outliers?.length
        ? [
            base,
            `${docs} ${plural(docs, 'empenho ficou', 'empenhos ficaram')} a mais de ${estatisticas.limite} desvios padrão desse centro. ${plural(docs, 'Ele aparece', 'Eles aparecem')} como ${plural(docs, 'ponto amarelo', 'pontos amarelos')} na ponta direita.`,
            'Valores grandes costumam vir de obras, repasses ou contratos anuais. O destaque mostra só que o número é grande perto dos outros do mês.',
          ]
        : [base, `Nenhum lançamento passou de ${estatisticas.limite} desvios padrão: todos ficaram dentro da curva.`];
    }
    case 'fracionamento': {
      const { anomalias } = dados;
      const base = 'Cada bloquinho é um empenho. Os blocos começam espalhados pelos dias do mês e se juntam quando têm o mesmo valor e o mesmo credor.';
      if (!anomalias) return ['Há poucos lançamentos no período para procurar repetições.'];
      return anomalias.length
        ? [
            base,
            `Foram ${anomalias.length} ${plural(anomalias.length, 'grupo', 'grupos')} com o mesmo valor em 5 empenhos ou mais.`,
            'Repetir valores é comum em serviços mensais, aluguéis e parcelas. Cada empenho conta uma vez, mesmo passando por empenho, liquidação e pagamento.',
          ]
        : [base, 'Nenhum valor se repetiu em 5 empenhos ou mais do mesmo credor neste período.'];
    }
    case 'monopolio': {
      const areas = dados.departamentosDependentes;
      const base = 'A balança compara, dentro de uma área, o maior credor (prato da esquerda) com todos os outros juntos (prato da direita). Quanto mais ela pende, maior a fatia de um único credor.';
      if (!areas) return ['Há poucos lançamentos no período para comparar as áreas.'];
      if (!areas.length) return [base, 'Em todas as áreas analisadas, nenhum credor ficou com 50% ou mais do valor.'];
      const maior = areas.reduce((a, b) => (Number(b.percentual) > Number(a.percentual) ? b : a));
      return [
        base,
        `Em ${areas.length} ${plural(areas.length, 'área', 'áreas')}, um único credor ficou com 50% ou mais do valor. O maior caso foi em ${maior.orgao}: ${formatarPercentual(maior.percentual)}.`,
        'Isso pode acontecer quando poucos prestadores atendem um serviço específico. Use os seletores abaixo da balança para ver cada área.',
      ];
    }
    case 'concentracao': {
      if (dados.percentual == null) return ['Há poucos lançamentos no período para calcular a participação.'];
      const p = Math.round(Number(dados.percentual));
      return [
        `Cada quadradinho representa R$ 1 de cada R$ 100 pagos no mês. Os quadradinhos coloridos mostram quanto foi para os 5 maiores credores: cerca de ${p} de cada 100.`,
        dados.alerta
          ? `Passou da linha de referência de ${LIMITE_CR5} de 100: uma parte grande do dinheiro ficou com poucos credores.`
          : `Ficou abaixo da linha de referência de ${LIMITE_CR5} de 100: o dinheiro do mês foi dividido entre muitos credores.`,
      ];
    }
    case 'benford': {
      const base = 'Em listas grandes de valores reais, cerca de 3 em cada 10 começam com o dígito 1, e só cerca de 1 em cada 20 começa com 9. A linha amarela mostra essa proporção esperada; as barras mostram o que aconteceu no município.';
      if (!dados.frequencias) return [base, 'Neste período há menos de 100 lançamentos, poucos para comparar com segurança.'];
      if (dados.digitoSuspeito == null) {
        return [base, 'Nenhum dígito passou de 5 pontos de diferença: a distribuição acompanhou a curva esperada.'];
      }
      const f = dados.frequencias.find((x) => x.digito === dados.digitoSuspeito);
      return [
        base,
        `O dígito ${dados.digitoSuspeito} apareceu em ${formatarPercentual(f.percentualObservado)} dos valores, contra ${formatarPercentual(f.percentualEsperado)} esperados.`,
        'Diferenças assim podem acontecer, por exemplo, com contratos de valor tabelado. Servem só como ponto de partida para consulta.',
      ];
    }
    default:
      return [];
  }
}

/**
 * Resumo para o cartão compartilhável (imagem). Não cita elementos da
 * animação ("pontos amarelos", "balança"), porque a imagem não tem a cena.
 */
export function resumoCompartilhavel(tipo, dados) {
  switch (tipo) {
    case 'zScore': {
      const { outliers, estatisticas } = dados;
      if (!estatisticas) return 'Poucos lançamentos no período para desenhar a curva.';
      if (!outliers?.length) return `Nenhum lançamento passou de ${estatisticas.limite} desvios padrão do valor típico do mês.`;
      const docs = empenhosDistintos(outliers);
      return `${docs} ${plural(docs, 'empenho ficou', 'empenhos ficaram')} a mais de ${estatisticas.limite} desvios padrão do valor típico do mês (cerca de ${formatarMoedaExtenso(estatisticas.media)}). Valores grandes costumam vir de obras, repasses ou contratos anuais.`;
    }
    case 'fracionamento': {
      const { anomalias } = dados;
      if (!anomalias?.length) return 'Nenhum valor se repetiu em 5 empenhos ou mais do mesmo credor neste período.';
      return `${anomalias.length} ${plural(anomalias.length, 'grupo', 'grupos')} com o mesmo valor em 5 empenhos ou mais do mesmo credor. Repetir valores é comum em serviços mensais, aluguéis e parcelas.`;
    }
    case 'monopolio': {
      const areas = dados.departamentosDependentes;
      if (!areas?.length) return 'Em nenhuma área um único credor ficou com 50% ou mais do valor.';
      const maior = areas.reduce((a, b) => (Number(b.percentual) > Number(a.percentual) ? b : a));
      return `Em ${areas.length} ${plural(areas.length, 'área', 'áreas')}, um único credor ficou com 50% ou mais do valor. Maior caso: ${maior.orgao}, com ${formatarPercentual(maior.percentual)}.`;
    }
    case 'concentracao':
      if (dados.percentual == null) return 'Poucos lançamentos no período para calcular a participação.';
      return `De cada R$ 100 pagos no mês, cerca de R$ ${Math.round(Number(dados.percentual))} foram para os 5 maiores credores (referência: ${LIMITE_CR5}).`;
    case 'benford':
      return explicarCena('benford', dados).slice(1).join(' ');
    default:
      return '';
  }
}
