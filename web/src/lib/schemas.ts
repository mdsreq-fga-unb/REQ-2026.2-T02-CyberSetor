import { z } from 'zod';
import { isValidCpf, isValidPhone, todayInBrasilia } from './br';

/**
 * Regras de validação dos campos comuns, com o valor no formato da API. Os campos de
 * `components/form` guardam esse mesmo valor, então a regra e o envio não convertem nada.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DECIMAL = /^\d+(\.\d{1,2})?$/;
const MAX_MONEY_DIGITS = 12;

/** Telefone com DDD, só dígitos (10 ou 11). */
export function phoneSchema(message = 'Informe o telefone com DDD, como (61) 99999-8888.') {
  return z.string().refine(isValidPhone, message);
}

/** CPF só com dígitos e com os verificadores conferidos. */
export function cpfSchema(
  required = 'Informe o CPF.',
  invalid = 'CPF inválido. Confira os números.',
) {
  return z.string().min(1, required).refine(isValidCpf, invalid);
}

/** Data AAAA-MM-DD; com `notFuture`, até hoje em Brasília. */
export function dateSchema(
  message = 'Informe a data completa.',
  { notFuture }: { notFuture?: string } = {},
) {
  const date = z.string().regex(ISO_DATE, message);
  return notFuture ? date.refine((value) => value <= todayInBrasilia(), notFuture) : date;
}

/** Valor em reais maior que zero; sai com duas casas ("150000.00"), como a API guarda. */
export function moneySchema(required = 'Informe o valor.') {
  return z
    .string()
    .min(1, required)
    .refine((value) => DECIMAL.test(value) && Number(value) > 0, 'Informe um valor maior que zero.')
    .refine(
      (value) => value.split('.')[0].replace(/^0+(?=\d)/, '').length <= MAX_MONEY_DIGITS,
      `O valor tem no máximo ${MAX_MONEY_DIGITS} dígitos antes da vírgula.`,
    )
    .transform((value) => Number(value).toFixed(2));
}

/** Número com até duas casas decimais ("12.5"); `positive` recusa zero. */
export function decimalSchema(message: string, { positive }: { positive?: boolean } = {}) {
  return z
    .string()
    .refine((value) => DECIMAL.test(value) && (!positive || Number(value) > 0), message);
}
