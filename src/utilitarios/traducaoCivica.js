/**
 * Tradutor Cívico — converte valores em R$ para uma unidade que o cidadão
 * comum reconhece no dia a dia.
 *
 * Princípio: só traduz para unidades com fonte oficial e estável (o salário
 * mínimo nacional). Nunca inventa equivalências sem base ("dá para construir
 * X escolas"), porque isso implicaria precisão que o GovTrace não tem.
 *
 * O valor de referência fica em dados/configuracoes.js, com a data e o
 * aviso de que precisa de checagem anual — ver o comentário lá.
 */
import { ANO_REFERENCIA_SALARIO, SALARIO_MINIMO_REFERENCIA } from '../dados/configuracoes';

const inteiro = new Intl.NumberFormat('pt-BR');

/** 292226206.17 → 192.507,37 (quantidade de salários mínimos) */
export const paraSalariosMinimos = (valor) => (Number(valor) || 0) / SALARIO_MINIMO_REFERENCIA;

/**
 * Frase pronta para encaixar em texto corrido:
 *   "equivale a 192.507 salários mínimos (2025: R$ 1.518,00)"
 *   "equivale a menos de 1 salário mínimo (2025: R$ 1.518,00)"
 */
export const formatarEmSalariosMinimos = (valor) => {
  const qtd = paraSalariosMinimos(valor);
  const referencia = `${ANO_REFERENCIA_SALARIO}: R$ ${SALARIO_MINIMO_REFERENCIA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (qtd < 1) return `menos de 1 salário mínimo (${referencia})`;
  if (qtd < 2) return `1 salário mínimo (${referencia})`;
  return `${inteiro.format(Math.round(qtd))} salários mínimos (${referencia})`;
};
