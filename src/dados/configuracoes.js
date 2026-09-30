/**
 * Configurações exclusivas da interface.
 *
 * Parâmetros matemáticos, listas de exclusão e a Lei de Benford ideal vivem
 * na GovTrace API (src/dominio/configuracoes.js), fonte única da verdade.
 */

// Períodos de consulta oferecidos no SeletorPeriodo
export const ANOS_DISPONIVEIS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
export const MESES_DISPONIVEIS = Array.from({ length: 12 }, (_, i) => { const data = new Date(0, i); return { valor: (i + 1).toString(), rotulo: data.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()) }; });
