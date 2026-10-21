/**
 * Configurações exclusivas da interface.
 *
 * Parâmetros matemáticos, listas de exclusão e a Lei de Benford ideal vivem
 * na GovTrace API (src/dominio/configuracoes.js), fonte única da verdade.
 */

// Portal oficial de transparência do TCE-SP (mesmo endereço do rodapé)
export const URL_PORTAL_TCE = 'https://transparencia.tce.sp.gov.br/';

// Períodos de consulta oferecidos no SeletorPeriodo
export const ANOS_DISPONIVEIS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
export const MESES_DISPONIVEIS = Array.from({ length: 12 }, (_, i) => { const data = new Date(0, i); return { valor: (i + 1).toString(), rotulo: data.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()) }; });

// ─── Tradutor Cívico ──────────────────────────────────────────────────────
// Converte valores grandes em uma unidade que o cidadão reconhece no dia a
// dia. Fonte: Decreto federal nº 12.797/2025, vigente desde 1º/01/2026.
// https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12797.htm
//
// ⚠️ ATENÇÃO: o salário mínimo é reajustado todo mês de janeiro por decreto.
// CONFIRA o valor vigente no ano da consulta/defesa e atualize estas duas
// constantes antes de publicar; o ano aparece sempre ao lado do valor na
// tela, exatamente para que essa checagem fique visível.
export const ANO_REFERENCIA_SALARIO = 2026;
export const SALARIO_MINIMO_REFERENCIA = 1621.00;
