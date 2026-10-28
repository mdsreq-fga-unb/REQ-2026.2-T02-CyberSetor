/**
 * Formatos brasileiros usados nos campos e nas telas. O valor que vai para a API é sempre o
 * "cru" (só dígitos, data AAAA-MM-DD, decimal com ponto); a formatação é só de exibição.
 */

const TIME_ZONE = 'America/Sao_Paulo';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Telefone só com DDD e número; tira o +55 que o preenchimento automático do celular traz. */
export function phoneDigits(value: string): string {
  const digits = onlyDigits(value);
  return /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
}

export function isValidPhone(digits: string): boolean {
  return /^\d{10,11}$/.test(digits);
}

/** (61) 3333-4444 ou (61) 99999-8888, também enquanto a pessoa digita. */
export function formatPhone(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const local = d.slice(2);
  const split = d.length === 11 ? 5 : 4;
  if (local.length <= split) return `(${d.slice(0, 2)}) ${local}`;
  return `(${d.slice(0, 2)}) ${local.slice(0, split)}-${local.slice(split)}`;
}

/** Confere os dígitos verificadores do CPF; a API confere de novo. */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split('').map(Number);
  const check = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce((acc, digit, i) => acc + digit * (length + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === digits[9] && check(10) === digits[10];
}

/** 000.000.000-00, também enquanto a pessoa digita. */
export function formatCpf(digits: string): string {
  const d = digits.slice(0, 11);
  return (
    [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join('.') +
    (d.length > 9 ? `-${d.slice(9)}` : '')
  );
}

/** Hoje no fuso de Brasília, no formato AAAA-MM-DD, como a API calcula. */
export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

/** Idade completa em anos, com as datas no formato AAAA-MM-DD. */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** AAAA-MM-DD (ou data e hora ISO) para DD/MM/AAAA, sem passar por fuso. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

export function formatMoney(value: string): string {
  return BRL.format(Number(value));
}

export function formatDateTime(value: string): string {
  return DATE_TIME.format(new Date(value));
}
