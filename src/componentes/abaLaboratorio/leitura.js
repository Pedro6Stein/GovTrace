import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import PriceCheckRoundedIcon from '@mui/icons-material/PriceCheckRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TollRoundedIcon from '@mui/icons-material/TollRounded';

import { formatarInteiro, formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

/**
 * "Como ler este destaque" — o que o destaque representa no conjunto do mês
 * e por que esse padrão costuma acontecer.
 *
 * Substitui a antiga lista de empenhos ("Seguir o rastro"): o Laboratório
 * descreve o comportamento dos números e não leva a nenhum documento,
 * pessoa ou empresa. Tudo aqui é agregado — totais, proporções e áreas.
 *
 * Formato devolvido:
 *   numeros  [{ valor, formatar, rotulo }]      — contam até o valor real
 *   areas    { titulo, itens: [{ area, percentual }] } | null
 *   causas   [{ Icone, titulo, texto }]
 */

const OUTRAS = 'Outras áreas';
const SEM_AREA = 'Sem classificação oficial';
const MAX_AREAS = 4;

/** fornecedorId → área (CNAE oficial), a partir do ranking da API. */
export function criarMapaSetores(ranking = []) {
  const mapa = new Map();
  for (const credor of ranking) {
    if (credor?.id && credor.atividade?.area) mapa.set(credor.id, credor.atividade.area);
  }
  return mapa;
}

/** Soma valores por área e devolve a fatia de cada uma (até 4 + "Outras"). */
function fatiasPorArea(itens) {
  const somas = new Map();
  let total = 0;
  for (const { area, valor } of itens) {
    const v = Math.abs(Number(valor) || 0);
    somas.set(area, (somas.get(area) ?? 0) + v);
    total += v;
  }
  if (!total) return [];
  const ordenadas = [...somas.entries()].sort((a, b) => b[1] - a[1]);
  const principais = ordenadas.slice(0, MAX_AREAS);
  const resto = ordenadas.slice(MAX_AREAS).reduce((s, [, v]) => s + v, 0);
  if (resto > 0) principais.push([OUTRAS, resto]);
  return principais.map(([area, v]) => ({ area, percentual: (v / total) * 100 }));
}

const plural = (n, um, varios) => (n === 1 ? um : varios);

// ─── Causas comuns de cada padrão (ícone + frase curta) ─────────────────────
export const CAUSAS = {
  zScore: [
    { Icone: ConstructionRoundedIcon, titulo: 'Obras e reformas', texto: 'Uma obra costuma valer muito mais que uma compra do dia a dia.' },
    { Icone: AccountBalanceRoundedIcon, titulo: 'Repasses e convênios', texto: 'Transferências para outras entidades públicas saem em valores altos.' },
    { Icone: CalendarMonthRoundedIcon, titulo: 'Contratos anuais', texto: 'Um serviço de um ano inteiro pode ser empenhado de uma só vez.' },
    { Icone: Inventory2RoundedIcon, titulo: 'Compras em grande volume', texto: 'Remédios, merenda e combustível são comprados em lotes grandes.' },
  ],
  fracionamento: [
    { Icone: EventRepeatRoundedIcon, titulo: 'Serviços mensais', texto: 'Limpeza, vigilância e manutenção costumam ter o mesmo valor todo mês.' },
    { Icone: HomeWorkRoundedIcon, titulo: 'Aluguéis', texto: 'Imóveis alugados pela prefeitura geram parcelas sempre iguais.' },
    { Icone: ReceiptLongRoundedIcon, titulo: 'Parcelas de um contrato', texto: 'Um contrato dividido em parcelas fixas gera vários empenhos iguais.' },
    { Icone: PriceCheckRoundedIcon, titulo: 'Preços tabelados', texto: 'Itens com preço fixo, como exames e diárias, repetem o mesmo valor.' },
  ],
  monopolio: [
    { Icone: EngineeringRoundedIcon, titulo: 'Serviço especializado', texto: 'Alguns serviços têm poucas empresas habilitadas a prestá-los.' },
    { Icone: StorefrontRoundedIcon, titulo: 'Poucos fornecedores na região', texto: 'Em cidades menores, o mercado local pode ter uma ou duas opções.' },
    { Icone: HandshakeRoundedIcon, titulo: 'Contrato único para a área', texto: 'Uma área pode ser atendida por um único contrato no período.' },
    { Icone: PieChartRoundedIcon, titulo: 'Área com pouco gasto no mês', texto: 'Quando a área gasta pouco, um só pagamento já ocupa quase tudo.' },
  ],
  concentracao: [
    { Icone: BusinessRoundedIcon, titulo: 'Contratos de grande porte', texto: 'Obras e serviços contínuos concentram os maiores pagamentos.' },
    { Icone: AutorenewRoundedIcon, titulo: 'Serviços essenciais', texto: 'Saúde, transporte e limpeza não param e pesam todo mês.' },
    { Icone: AccountBalanceRoundedIcon, titulo: 'Repasses públicos', texto: 'Transferências para outros órgãos podem estar entre os maiores valores.' },
    { Icone: CalendarMonthRoundedIcon, titulo: 'Mês com pagamentos grandes', texto: 'Um mês com parcelas altas concentra mais que um mês comum.' },
  ],
  benford: [
    { Icone: PriceCheckRoundedIcon, titulo: 'Preços tabelados', texto: 'Muitos valores iguais começam sempre com o mesmo dígito.' },
    { Icone: TollRoundedIcon, titulo: 'Valores arredondados', texto: 'Diárias e bolsas em valores redondos alteram a proporção.' },
    { Icone: CalculateRoundedIcon, titulo: 'Poucos registros', texto: 'Com poucos valores, a proporção natural ainda não aparece.' },
    { Icone: EventRepeatRoundedIcon, titulo: 'O mesmo serviço repetido', texto: 'Pagamentos mensais iguais repetem o primeiro dígito.' },
  ],
};

// ─── Retrato agregado de cada destaque ──────────────────────────────────────
/**
 * @param tipo     chave do motor
 * @param dados    resultado do motor (GovTrace API)
 * @param contexto { despesas, setores, totais, distribuicao, totalFornecedores }
 */
export function lerDestaque(tipo, dados, contexto) {
  if (!dados?.alerta) return null;
  const { despesas = [], setores = new Map(), totais, distribuicao = [], totalFornecedores = 0 } = contexto;
  const areaDe = (fornecedorId) => setores.get(fornecedorId) ?? SEM_AREA;

  switch (tipo) {
    case 'zScore': {
      const destacados = dados.outliers ?? [];
      const soma = destacados.reduce((s, d) => s + Math.abs(Number(d.valor) || 0), 0);
      const totalEmpenhos = totais?.totalEmpenhos ?? 0;
      return {
        numeros: [
          { valor: destacados.length, formatar: formatarInteiro, rotulo: `${plural(destacados.length, 'empenho', 'empenhos')} de alta amplitude` },
          ...(totalEmpenhos ? [{ valor: (destacados.length / totalEmpenhos) * 100, formatar: formatarPercentual, rotulo: `dos ${formatarInteiro(totalEmpenhos)} empenhos do mês` }] : []),
          { valor: soma, formatar: formatarMoedaExtenso, rotulo: 'somados, juntos' },
        ],
        areas: {
          titulo: 'Em que áreas esses valores aparecem',
          itens: fatiasPorArea(destacados.map((d) => ({ area: areaDe(d.fornecedorId), valor: d.valor }))),
        },
        causas: CAUSAS.zScore,
      };
    }

    case 'fracionamento': {
      const grupos = dados.anomalias ?? [];
      const empenhos = grupos.reduce((s, g) => s + g.repeticoes, 0);
      const soma = grupos.reduce((s, g) => s + g.valor * g.repeticoes, 0);
      // O nome só serve para achar a área do grupo; não sai daqui
      const idPorNome = new Map(despesas.map((d) => [d.fornecedorNome, d.fornecedorId]));
      return {
        numeros: [
          { valor: grupos.length, formatar: formatarInteiro, rotulo: `${plural(grupos.length, 'grupo', 'grupos')} de valores repetidos` },
          { valor: empenhos, formatar: formatarInteiro, rotulo: 'empenhos nesses grupos' },
          { valor: soma, formatar: formatarMoedaExtenso, rotulo: 'somados, juntos' },
        ],
        areas: {
          titulo: 'Em que áreas as repetições aparecem',
          itens: fatiasPorArea(grupos.map((g) => ({ area: areaDe(idPorNome.get(g.nome)), valor: g.valor * g.repeticoes }))),
        },
        causas: CAUSAS.fracionamento,
      };
    }

    case 'monopolio': {
      const areas = dados.departamentosDependentes ?? [];
      const maior = areas.length ? Math.max(...areas.map((a) => Number(a.percentual))) : 0;
      // Peso de cada área destacada no total pago do mês: mostra se a
      // concentração aconteceu numa área grande ou numa área pequena
      const pesoNoMes = areas
        .map((a) => ({ area: a.orgao, percentual: Number(distribuicao.find((d) => d.nome === a.orgao)?.percentual) }))
        .filter((a) => Number.isFinite(a.percentual));
      const somaPeso = pesoNoMes.reduce((s, a) => s + a.percentual, 0);
      return {
        numeros: [
          { valor: areas.length, formatar: formatarInteiro, rotulo: `${plural(areas.length, 'área destacada', 'áreas destacadas')}` },
          { valor: maior, formatar: formatarPercentual, rotulo: 'maior fatia de um único credor' },
          ...(pesoNoMes.length ? [{ valor: somaPeso, formatar: formatarPercentual, rotulo: `do valor pago no mês ${plural(pesoNoMes.length, 'está nessa área', 'está nessas áreas')}` }] : []),
        ],
        areas: pesoNoMes.length
          ? { titulo: 'Quanto cada área destacada pesa no mês', itens: pesoNoMes, escala: 'mes' }
          : null,
        causas: CAUSAS.monopolio,
      };
    }

    case 'concentracao': {
      const top5 = dados.top5 ?? [];
      const percentual = Number(dados.percentual) || 0;
      return {
        numeros: [
          ...(totalFornecedores ? [{ valor: totalFornecedores, formatar: formatarInteiro, rotulo: 'fornecedores receberam no mês' }] : []),
          { valor: Number(dados.somaTop5) || 0, formatar: formatarMoedaExtenso, rotulo: 'ficaram com os 5 maiores' },
          { valor: 100 - percentual, formatar: formatarPercentual, rotulo: `dividido entre ${totalFornecedores > 5 ? `os outros ${formatarInteiro(totalFornecedores - 5)}` : 'os demais'}` },
        ],
        areas: {
          titulo: 'Em que áreas atuam os 5 maiores',
          itens: fatiasPorArea(top5.map((f) => ({ area: areaDe(f.id), valor: f.valorTotal }))),
        },
        causas: CAUSAS.concentracao,
      };
    }

    case 'benford': {
      const f = (dados.frequencias ?? []).find((x) => x.digito === dados.digitoSuspeito);
      return {
        numeros: [
          { valor: Number(dados.totalAnalisado) || 0, formatar: formatarInteiro, rotulo: 'valores analisados' },
          ...(f ? [{ valor: f.percentualObservado - f.percentualEsperado, formatar: (v) => `+${formatarPercentual(v).replace('%', '')} pontos`, rotulo: `de diferença no dígito ${f.digito}` }] : []),
        ],
        areas: null,
        causas: CAUSAS.benford,
      };
    }

    default:
      return null;
  }
}
