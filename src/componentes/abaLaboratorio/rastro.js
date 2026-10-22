/**
 * Pseudonimização + "Trilha do Empenho" do Laboratório Matemático.
 *
 * Regra da tela: nenhum nome de credor (empresa ou pessoa) é exibido. Este é
 * o ÚNICO módulo do laboratório que lê `fornecedorNome`, e apenas para
 * cruzar resultados da API que não trazem o ID do credor (Recorrência e
 * Concentração Setorial). Nenhum objeto devolvido daqui carrega o nome: os
 * componentes recebem só documento, data, órgão, valor e uma identidade
 * anônima.
 */

const ROTULO_ETAPA = {
  Empenhado: 'Empenho',
  Liquidado: 'Liquidação',
  Pago: 'Pagamento',
  Reforço: 'Reforço',
  Anulação: 'Anulação',
};
const ORDEM_ETAPA = ['Empenhado', 'Reforço', 'Liquidado', 'Pago', 'Anulação'];

export const SEM_DOCUMENTO = 'Sem documento';

/** fornecedorId → área de política pública (CNAE oficial, quando a API classificou). */
export function criarMapaSetores(ranking = []) {
  const mapa = new Map();
  for (const credor of ranking) {
    if (credor?.id && credor.atividade?.area) mapa.set(credor.id, credor.atividade.area);
  }
  return mapa;
}

/**
 * Identidade anônima e didática.
 *   PJ: "Empresa do Setor de Saúde e Medicamentos • Final #0124"
 *   PF: "Credor Pessoa Física • Ref. #7105"  (o TCE-SP já publica o CPF mascarado)
 */
export function identidadeAnonima({ fornecedorId, ehPessoaJuridica } = {}, setores, areaAlternativa) {
  const id = String(fornecedorId ?? '').replace(/\D/g, '');
  if (!id) return 'Credor sem identificação no registro';

  const pessoaJuridica = ehPessoaJuridica ?? id.length === 14;
  if (!pessoaJuridica) return `Credor Pessoa Física • Ref. #${id.slice(0, 4)}`;

  const area = setores?.get(id) || areaAlternativa;
  return area
    ? `Empresa do Setor de ${area} • Final #${id.slice(-4)}`
    : `Empresa de setor não classificado • Final #${id.slice(-4)}`;
}

/** "dd/mm/aaaa" → número ordenável (aaaammdd); inválido vai para o fim. */
const chaveData = (data) => {
  const [d, m, a] = String(data ?? '').split('/');
  const n = Number(`${a}${m}${d}`);
  return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
};

/** Dia do mês (1–31) de um registro, para posicionar na linha do tempo. */
export const diaDoMes = (data) => {
  const dia = Number(String(data ?? '').split('/')[0]);
  return dia >= 1 && dia <= 31 ? dia : 15;
};

/**
 * Agrupa registros contábeis pelo número do empenho. O mesmo documento
 * aparece uma vez por etapa (empenho, liquidação, pagamento): a trilha
 * mostra o documento uma vez só, com as etapas encontradas.
 */
export function agruparPorEmpenho(registros = [], setores, areaAlternativa) {
  const grupos = new Map();

  registros.forEach((r, i) => {
    const temDocumento = r.documento && r.documento !== SEM_DOCUMENTO;
    const chave = temDocumento ? r.documento : `__sem_${i}`;
    const atual = grupos.get(chave);
    const valor = Math.abs(Number(r.valor) || 0);

    if (!atual) {
      grupos.set(chave, {
        documento: temDocumento ? r.documento : null,
        data: r.data || '',
        orgao: r.orgao || 'Órgão não informado',
        valor,
        etapas: new Set([r.evento]),
        registros: 1,
        credor: { fornecedorId: r.fornecedorId, ehPessoaJuridica: r.ehPessoaJuridica },
      });
      return;
    }

    atual.registros += 1;
    atual.valor = Math.max(atual.valor, valor);
    atual.etapas.add(r.evento);
    if (chaveData(r.data) < chaveData(atual.data)) atual.data = r.data;
  });

  return [...grupos.values()]
    .map(({ credor, etapas, ...g }) => ({
      ...g,
      etapas: ORDEM_ETAPA.filter((e) => etapas.has(e)).map((e) => ROTULO_ETAPA[e]),
      identidade: identidadeAnonima(credor, setores, areaAlternativa),
    }))
    .sort((a, b) => b.valor - a.valor);
}

/** Credor que mais recebeu entre os registros (resolve matriz/filial com o mesmo nome). */
function credorPrincipal(registros) {
  const somas = new Map();
  for (const r of registros) {
    const atual = somas.get(r.fornecedorId) ?? { ...r, soma: 0 };
    atual.soma += Number(r.valor) || 0;
    somas.set(r.fornecedorId, atual);
  }
  const [maior] = [...somas.values()].sort((a, b) => b.soma - a.soma);
  return maior ? { fornecedorId: maior.fornecedorId, ehPessoaJuridica: maior.ehPessoaJuridica } : {};
}

// ─── Modelos de exibição por cena (já sem nomes) ─────────────────────────────

export function trilhaZScore(dados, setores) {
  return agruparPorEmpenho(dados?.outliers ?? [], setores);
}

/** Recorrência: a API devolve { nome, valor, repeticoes } — cruzamos por nome + valor exato. */
export function trilhaRecorrencia(dados, despesas, setores) {
  return (dados?.anomalias ?? [])
    .map((grupo) => {
      const registros = despesas.filter((d) => d.fornecedorNome === grupo.nome && d.valor === grupo.valor);
      const empenhos = agruparPorEmpenho(registros, setores);
      return {
        valor: grupo.valor,
        repeticoes: grupo.repeticoes,
        identidade: identidadeAnonima(credorPrincipal(registros), setores),
        empenhos,
        // Um bloco por empenho (não por etapa), na data em que ele apareceu primeiro
        dias: empenhos.map((e) => diaDoMes(e.data)),
      };
    })
    .sort((a, b) => b.repeticoes - a.repeticoes);
}

/** Concentração Setorial: a API devolve { orgao (área), empresa, percentual } — cruzamos pelo nome. */
export function trilhaConcentracaoSetorial(dados, despesas, setores) {
  return (dados?.departamentosDependentes ?? [])
    .map((item) => {
      const registros = despesas.filter((d) => d.fornecedorNome === item.empresa && d.valor > 0);
      return {
        area: item.orgao,
        percentual: Number(item.percentual),
        identidade: identidadeAnonima(credorPrincipal(registros), setores, item.orgao),
        empenhos: agruparPorEmpenho(registros, setores, item.orgao),
      };
    })
    .sort((a, b) => b.percentual - a.percentual);
}

/** CR5: o top 5 já traz o ID do credor — nenhum cruzamento por nome é necessário. */
export function trilhaCR5(dados, despesas, totalPago, setores) {
  return (dados?.top5 ?? []).map((credor, posicao) => {
    const registros = despesas.filter((d) => d.fornecedorId === credor.id && d.valor > 0);
    return {
      posicao: posicao + 1,
      valorTotal: credor.valorTotal,
      quantidade: credor.quantidade,
      participacao: totalPago > 0 ? (credor.valorTotal / totalPago) * 100 : null,
      identidade: identidadeAnonima(
        { fornecedorId: credor.id, ehPessoaJuridica: registros[0]?.ehPessoaJuridica },
        setores,
      ),
      empenhos: agruparPorEmpenho(registros, setores),
    };
  });
}

/** Z de cada empenho destacado — posiciona os pontos na curva. */
export function zDosEmpenhos(dados) {
  const est = dados?.estatisticas;
  if (!est?.desvioPadrao) return [];
  return trilhaZScore(dados)
    .map((e) => (e.valor - est.media) / est.desvioPadrao)
    .filter(Number.isFinite);
}
