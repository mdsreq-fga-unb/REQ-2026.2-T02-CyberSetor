import { Prisma } from '../generated/prisma/client.js';
import { SituacaoInscricao } from '../generated/prisma/enums.js';

/**
 * Vagas e lista de espera da inscrição (HU-07c, RF14, RF15).
 *
 * Quem decide a vaga é a ordem de chegada (`ordemChegada`), atribuída depois da trava da linha
 * da configuração: envios concorrentes na última vaga entram um de cada vez, e só um confirma.
 * A posição na espera não é guardada; sai da ordem de chegada entre as inscrições em espera.
 */

/** Trava a configuração da atividade até o fim da transação e devolve as vagas em vigor. */
export async function lockRegistration(
  tx: Prisma.TransactionClient,
  atividadeId: string,
): Promise<number> {
  const [row] = await tx.$queryRaw<{ vagas: number }[]>`
    SELECT "vagas" FROM "configuracao_inscricao" WHERE "atividade_id" = ${atividadeId}::uuid FOR UPDATE`;
  return row.vagas;
}

/** Situação da próxima inscrição: confirmada enquanto houver vaga; depois, lista de espera. */
export async function nextSituation(
  tx: Prisma.TransactionClient,
  atividadeId: string,
  vagas: number,
): Promise<SituacaoInscricao> {
  const confirmadas = await tx.inscricao.count({
    where: { atividadeId, situacao: SituacaoInscricao.CONFIRMADA },
  });
  return confirmadas < vagas ? SituacaoInscricao.CONFIRMADA : SituacaoInscricao.LISTA_ESPERA;
}

/** Posição (1, 2, …) de uma inscrição em espera, pela ordem de chegada. */
export async function waitlistPosition(
  tx: Prisma.TransactionClient,
  atividadeId: string,
  ordemChegada: number,
): Promise<number> {
  return tx.inscricao.count({
    where: {
      atividadeId,
      situacao: SituacaoInscricao.LISTA_ESPERA,
      ordemChegada: { lte: ordemChegada },
    },
  });
}
