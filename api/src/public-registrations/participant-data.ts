const CPF_LENGTH = 11;

/** Confere os dígitos verificadores do CPF (só dígitos, 11 posições). */
export function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split('').map(Number);
  const check = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce((acc, digit, i) => acc + digit * (length + 1 - i), 0);
    const rest = (sum * 10) % CPF_LENGTH;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === digits[9] && check(10) === digits[10];
}

/** Idade completa em anos numa data de referência, as duas no formato AAAA-MM-DD. */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Transformações dos campos do participante, usadas no formulário público e na correção.
export const toDigits = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? onlyDigits(value) : value;

// O preenchimento automático do celular costuma trazer o +55.
export const toPhoneDigits = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const digits = onlyDigits(value);
  return /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
};

export const toLowerTrim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const MAX_AGE = 120;

/** Motivo da recusa da data de nascimento (AAAA-MM-DD), ou null quando está certa. */
export function birthDateProblem(birthDate: string, today: string): string | null {
  const date = new Date(`${birthDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) {
    return 'Data de nascimento inexistente.';
  }
  if (birthDate > today || ageOn(birthDate, today) > MAX_AGE)
    return 'Confira a data de nascimento.';
  return null;
}
