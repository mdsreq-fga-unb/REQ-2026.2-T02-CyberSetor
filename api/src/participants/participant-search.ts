import type { Prisma } from '../generated/prisma/client.js';
import { onlyDigits } from '../public-registrations/participant-data.js';

const MIN_PHONE_SEARCH = 3;

/**
 * Busca de participante por nome, nome de preferência, e-mail ou, com três dígitos, telefone.
 * A mesma regra serve à lista de participantes e à lista de inscritos da atividade.
 */
export function participantSearch(busca?: string): Prisma.ParticipanteWhereInput | undefined {
  const text = busca?.trim() ?? '';
  if (!text) return undefined;
  const digits = onlyDigits(text);
  // % e _ são curingas do ILIKE: a busca procura o texto como foi digitado.
  const literal = text.replace(/[\\%_]/g, (char) => `\\${char}`);
  return {
    OR: [
      { nome: { contains: literal, mode: 'insensitive' } },
      { nomePreferencia: { contains: literal, mode: 'insensitive' } },
      { email: { contains: literal.toLowerCase() } },
      ...(digits.length >= MIN_PHONE_SEARCH ? [{ telefone: { contains: digits } }] : []),
    ],
  };
}
