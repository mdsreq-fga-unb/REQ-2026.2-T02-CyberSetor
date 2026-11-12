import type { Prisma } from '../generated/prisma/client.js';
import { CampoDuplicidade } from '../generated/prisma/enums.js';

/**
 * Cadastro que já existia antes da inscrição (RF22; D2 do checkpoint de 29/10/2026):
 * - REAPROVEITADO: a inscrição usa um cadastro criado antes dela, ou que já tinha outra
 *   inscrição antes desta (inscrição presencial que reaproveitou o cadastro, CA-08.3). O cadastro
 *   novo nasce na mesma transação da inscrição, milissegundos antes dela; por isso só conta o
 *   cadastro criado mais de `NEW_RECORD_WINDOW_MS` antes da inscrição;
 * - EMAIL ou CPF: a inscrição criou um cadastro novo, mas já havia outro, mais antigo, com o
 *   mesmo e-mail ou CPF, conforme o campo que identifica cadastro repetido na inscrição.
 * A lista mostra só o indicador; os dados do outro cadastro não saem daqui (RNF05).
 */
export type ExistingRecord = 'REAPROVEITADO' | 'EMAIL' | 'CPF';

/** Folga entre a criação do cadastro novo e a da inscrição, na mesma transação. */
export const NEW_RECORD_WINDOW_MS = 60_000;

export interface RegistrationKey {
  id: string;
  participanteId: string;
  participanteCriadoEm: Date;
  criadoEm: Date;
  email: string | null;
  cpf: string | null;
}

export interface EarlierRegistration {
  id: string;
  participanteId: string;
  criadoEm: Date;
}

export interface OtherRecord {
  id: string;
  email: string | null;
  cpf: string | null;
  criadoEm: Date;
}

export function existingRecord(
  row: RegistrationKey,
  campo: CampoDuplicidade,
  earlier: readonly EarlierRegistration[],
  others: readonly OtherRecord[],
): ExistingRecord | null {
  const reused =
    row.criadoEm.getTime() - row.participanteCriadoEm.getTime() > NEW_RECORD_WINDOW_MS ||
    earlier.some(
      (other) =>
        other.participanteId === row.participanteId &&
        other.id !== row.id &&
        other.criadoEm < row.criadoEm,
    );
  if (reused) return 'REAPROVEITADO';
  const key = campo === CampoDuplicidade.CPF ? row.cpf : row.email;
  if (!key) return null;
  const repeated = others.some(
    (other) =>
      other.id !== row.participanteId &&
      other.criadoEm < row.criadoEm &&
      (campo === CampoDuplicidade.CPF ? other.cpf : other.email) === key,
  );
  if (!repeated) return null;
  return campo === CampoDuplicidade.CPF ? 'CPF' : 'EMAIL';
}

/** Consultas que alimentam `existingRecord` para as inscrições de uma atividade. */
export async function loadExistingRecords(
  prisma: Prisma.TransactionClient,
  campo: CampoDuplicidade,
  rows: readonly RegistrationKey[],
): Promise<Map<string, ExistingRecord>> {
  const result = new Map<string, ExistingRecord>();
  if (rows.length === 0) return result;
  const participantIds = [...new Set(rows.map((row) => row.participanteId))];
  const keys = [
    ...new Set(
      rows
        .map((row) => (campo === CampoDuplicidade.CPF ? row.cpf : row.email))
        .filter((key): key is string => key !== null),
    ),
  ];
  const [earlier, others] = await Promise.all([
    prisma.inscricao.findMany({
      where: { participanteId: { in: participantIds } },
      select: { id: true, participanteId: true, criadoEm: true },
    }),
    keys.length === 0
      ? Promise.resolve([] as OtherRecord[])
      : prisma.participante.findMany({
          where: campo === CampoDuplicidade.CPF ? { cpf: { in: keys } } : { email: { in: keys } },
          select: { id: true, email: true, cpf: true, criadoEm: true },
        }),
  ]);
  for (const row of rows) {
    const found = existingRecord(row, campo, earlier, others);
    if (found) result.set(row.id, found);
  }
  return result;
}
