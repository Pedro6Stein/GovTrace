/**
 * Módulo Central de Dados e Configurações Estáticas
 * 
 * Centraliza listas de exclusão, metadados de domínio e parâmetros matemáticos
 * para que todo o sistema (motores e UI) tenha uma única fonte da verdade,
 * evitando hardcodes espalhados.
 */

// 1. MÁQUINA PÚBLICA (Entidades Ignoradas)
// Exclui entidades estatais, impostos e bancos das análises de mercado competitivo.
export const ENTIDADES_IGNORADAS = [
  'PREFEITURA', 
  'MINISTERIO DA FAZENDA', 
  'CAIXA ECONOMICA', 
  'BANCO DO BRASIL', 
  'INSS', 
  'INSTITUTO NACIONAL DO SEGURO SOCIAL',
  'SANTANDER', 
  'BRADESCO', 
  'TRIBUNAL DE JUSTICA'
];

// 2. PARÂMETROS MATEMÁTICOS DOS MOTORES
export const PARAMETROS_ANALISE = {
  Z_SCORE_LIMITE: 4,               // Desvios padrões para ser outlier
  BENFORD_DESVIO_ALERTA: 5,        // Diferença percentual tolerável
  FRACIONAMENTO_MIN_REPETICOES: 5, // Qtd. de notas repetidas para gerar alerta
  FRACIONAMENTO_VALOR_MINIMO: 500, // Valor mínimo para considerar fracionamento (em R$)
  MONOPOLIO_PERCENTUAL: 50,        // % de dependência para alertar monopólio
  MONOPOLIO_VALOR_CORTE: 50000,    // Movimentação mínima do órgão para ser avaliado (em R$)
  CONCENTRACAO_CR5_ALERTA: 30,     // % de concentração nos top 5 fornecedores
};

// 3. EVENTOS CONTÁBEIS E SEMÂNTICA VISUAL (Para a UI)
export const CONFIG_ESTAGIOS_CONTABEIS = {
  Empenhado: { cor: '#0284C7', fundo: '#E0F2FE', rotulo: 'Empenho' },
  Liquidado: { cor: '#7C3AED', fundo: '#EDE9FE', rotulo: 'Liquidação' },
  Pago:      { cor: '#059669', fundo: '#D1FAE5', rotulo: 'Pagamento' },
  Reforço:   { cor: '#B45309', fundo: '#FEF3C7', rotulo: 'Reforço' },
  Anulação:  { cor: '#B91C1C', fundo: '#FEE2E2', rotulo: 'Anulação' },
};

// 4. DISTRIBUIÇÃO ESPERADA DA LEI DE BENFORD (1 ao 9)
export const LEI_BENFORD_IDEAL = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

// 5. PERIODOS DE CONSULTA
export const ANOS_DISPONIVEIS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
export const MESES_DISPONIVEIS = Array.from({ length: 12 }, (_, i) => { const data = new Date(0, i); return { valor: (i + 1).toString(), rotulo: data.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()) }; });

// 6. FILTROS DETERMINISTICOS (IDs E NOMES)
export const IDS_BANCOS_GOVERNO = ['00000000', '00360305', '00394460', '29979036'];
export const NOMES_IGNORADOS_PESSOAL = ['IDENTIFICA��O ESPECIAL', 'SEM CPF/CNPJ', 'FOLHA DE PAGAMENTO'];
