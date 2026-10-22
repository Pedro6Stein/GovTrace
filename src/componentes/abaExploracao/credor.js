/**
 * Utilitários de exibição de um credor (fornecedor) na aba Exploração.
 */

/** "46384111000140" → "CNPJ 46.384.111/0001-40"; CPF já vem mascarado pelo TCE-SP. */
export function formatarDocumentoCredor(id) {
  const digitos = String(id ?? '').replace(/\D/g, '');
  if (digitos.length === 14) {
    return `CNPJ ${digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}`;
  }
  // O TCE-SP publica só os 6 dígitos do meio do CPF (padrão LGPD)
  if (digitos.length === 6) return `CPF ***.${digitos.slice(0, 3)}.${digitos.slice(3)}-**`;
  return digitos ? `Identificação ${digitos}` : 'Sem identificação no registro';
}

const PALAVRAS_IGNORADAS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'LTDA', 'ME', 'EPP', 'S/A', 'SA', 'EIRELI']);

/** Iniciais para o avatar: "MILCLEAN COMERCIO E SERVICOS LTDA" → "MC". */
export function iniciaisCredor(nome) {
  const palavras = String(nome ?? '')
    .toUpperCase()
    .replace(/[^A-ZÀ-Ú0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((p) => p && !PALAVRAS_IGNORADAS.has(p));
  return (palavras[0]?.[0] ?? '?') + (palavras[1]?.[0] ?? '');
}

/** Sem acento e em minúsculas — para a busca por nome. */
export const normalizarBusca = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const chaveData = (data) => {
  const [d, m, a] = String(data ?? '').split('/');
  const n = Number(`${a}${m}${d}`);
  return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
};

// `texto`: tom mais escuro da mesma cor, para rótulos sobre o `fundo` (contraste ≥ 4,5:1)
export const ETAPAS_DO_DINHEIRO = [
  { evento: 'Empenhado', rotulo: 'Empenho', explicacao: 'dinheiro reservado', cor: '#0284C7', fundo: '#E0F2FE', texto: '#0369A1' },
  { evento: 'Liquidado', rotulo: 'Liquidação', explicacao: 'serviço ou produto confirmado', cor: '#7C3AED', fundo: '#EDE9FE', texto: '#6D28D9' },
  { evento: 'Pago', rotulo: 'Pagamento', explicacao: 'dinheiro saiu do caixa', cor: '#059669', fundo: '#D1FAE5', texto: '#047857' },
];

/**
 * Agrupa os registros pelo número do empenho, somando o valor de cada etapa
 * (empenho, reforço, liquidação, pagamento, anulação) — a mesma nota aparece
 * uma vez por etapa nos dados do TCE-SP.
 */
export function agruparEmpenhosDoCredor(registros = []) {
  const grupos = new Map();
  registros.forEach((r, i) => {
    const chave = r.documento && r.documento !== 'Sem documento' ? r.documento : `__sem_${i}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, { documento: chave.startsWith('__sem_') ? null : chave, orgao: r.orgao, data: r.data, etapas: {} });
    }
    const grupo = grupos.get(chave);
    const etapa = grupo.etapas[r.evento] ?? { valor: 0, data: r.data };
    etapa.valor += Number(r.valor) || 0;
    if (chaveData(r.data) < chaveData(etapa.data)) etapa.data = r.data;
    grupo.etapas[r.evento] = etapa;
    if (chaveData(r.data) < chaveData(grupo.data)) grupo.data = r.data;
  });

  return [...grupos.values()]
    .map((g) => ({
      ...g,
      // Valor de referência: o maior entre as etapas (o mesmo dinheiro passa por todas)
      valor: Math.max(...Object.values(g.etapas).map((e) => Math.abs(e.valor)), 0),
    }))
    .sort((a, b) => b.valor - a.valor);
}

/** Soma por etapa: quanto foi empenhado, liquidado, pago e anulado. */
export function somarPorEtapa(registros = []) {
  return registros.reduce((acc, r) => {
    acc[r.evento] = (acc[r.evento] ?? 0) + (Number(r.valor) || 0);
    return acc;
  }, {});
}
