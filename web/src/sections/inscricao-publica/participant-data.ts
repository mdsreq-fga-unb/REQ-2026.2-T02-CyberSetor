export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Telefone só com DDD e número; tira o +55 que o preenchimento automático do celular traz. */
export function phoneDigits(value: string): string {
  const digits = onlyDigits(value);
  return /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
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

/** Idade completa em anos, com as datas no formato AAAA-MM-DD. */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Hoje no fuso de Brasília, como a API calcula a maioridade. */
export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}

export function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
