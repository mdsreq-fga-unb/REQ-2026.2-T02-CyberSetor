import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, CanalPedido, SituacaoInscricao } from '../generated/prisma/enums.js';
import type { AuditTrailService } from '../audit/audit-trail.service.js';

/**
 * Vagas e lista de espera da inscrição (HU-07c, RF14, RF15).
 *
 * Quem decide a vaga é a ordem de chegada (`ordemChegada`), atribuída depois da trava da linha
 * da configuração: envios concorrentes na última vaga entram um de cada vez, e só um confirma.
 * A posição na espera não é guardada; sai da ordem de chegada entre as inscrições em espera.
 */

/** Trava a configuração da atividade até o fim da transação e devolve as regras em vigor. */
export async function lockRegistration(
  tx: Prisma.TransactionClient,
  atividadeId: string,
): Promise<{ vagas: number; listaEspera: boolean; promocaoAutomatica: boolean }> {
  const [row] = await tx.$queryRaw<
    { vagas: number; lista_espera: boolean; promocao_automatica: boolean }[]
  >`
    SELECT "vagas", "lista_espera", "promocao_automatica" FROM "configuracao_inscricao" WHERE "atividade_id" = ${atividadeId}::uuid FOR UPDATE`;
  return {
    vagas: row.vagas,
    listaEspera: row.lista_espera,
    promocaoAutomatica: row.promocao_automatica,
  };
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

/**
 * Confirma, a pedido do Núcleo, uma inscrição da espera numa vaga livre, fora da ordem de chegada
 * quando a promoção automática estiver desligada. Devolve o motivo da recusa, se houver.
 */
export async function confirmFromWaitlist(
  tx: Prisma.TransactionClient,
  audit: AuditTrailService,
  atividadeId: string,
  inscricaoId: string,
  actor: { usuarioId: string; correlationId: string },
): Promise<'NOT_FOUND' | 'NOT_WAITING' | 'NO_VACANCY' | null> {
  const { vagas } = await lockRegistration(tx, atividadeId);
  const inscricao = await tx.inscricao.findFirst({
    where: { id: inscricaoId, atividadeId },
    select: { situacao: true },
  });
  if (!inscricao) return 'NOT_FOUND';
  if (inscricao.situacao !== SituacaoInscricao.LISTA_ESPERA) return 'NOT_WAITING';
  if ((await nextSituation(tx, atividadeId, vagas)) !== SituacaoInscricao.CONFIRMADA) {
    return 'NO_VACANCY';
  }
  await tx.inscricao.update({
    where: { id: inscricaoId },
    data: { situacao: SituacaoInscricao.CONFIRMADA },
  });
  await audit.record(
    {
      autorTipo: AutorTipo.USUARIO,
      usuarioId: actor.usuarioId,
      acao: 'REGISTRATION_CONFIRMED_FROM_WAITLIST',
      entidade: 'inscricao',
      entidadeId: inscricaoId,
      antes: { situacao: SituacaoInscricao.LISTA_ESPERA },
      depois: { situacao: SituacaoInscricao.CONFIRMADA },
      correlationId: actor.correlationId,
    },
    tx,
  );
  return null;
}

/**
 * Cancelamento ou desistência registrado pelo Núcleo, com a data do pedido e o canal. A vaga
 * confirmada que se libera vai para a espera quando a promoção automática estiver ligada.
 */
export async function cancelRegistration(
  tx: Prisma.TransactionClient,
  audit: AuditTrailService,
  atividadeId: string,
  inscricaoId: string,
  pedido: { canal: CanalPedido; pedidoEm: string },
  actor: { usuarioId: string; correlationId: string },
): Promise<'NOT_FOUND' | 'ALREADY_CANCELLED' | null> {
  const regras = await lockRegistration(tx, atividadeId);
  const inscricao = await tx.inscricao.findFirst({
    where: { id: inscricaoId, atividadeId },
    select: { situacao: true },
  });
  if (!inscricao) return 'NOT_FOUND';
  if (inscricao.situacao === SituacaoInscricao.CANCELADA) return 'ALREADY_CANCELLED';
  await tx.inscricao.update({
    where: { id: inscricaoId },
    data: {
      situacao: SituacaoInscricao.CANCELADA,
      canceladaEm: new Date(`${pedido.pedidoEm}T00:00:00.000Z`),
      cancelamentoCanal: pedido.canal,
    },
  });
  await audit.record(
    {
      autorTipo: AutorTipo.USUARIO,
      usuarioId: actor.usuarioId,
      acao: 'REGISTRATION_CANCELLED',
      entidade: 'inscricao',
      entidadeId: inscricaoId,
      antes: { situacao: inscricao.situacao },
      depois: {
        situacao: SituacaoInscricao.CANCELADA,
        canal: pedido.canal,
        pedidoEm: pedido.pedidoEm,
      },
      correlationId: actor.correlationId,
    },
    tx,
  );
  if (inscricao.situacao === SituacaoInscricao.CONFIRMADA && regras.promocaoAutomatica) {
    await promoteWaitlist(tx, audit, atividadeId, regras.vagas, actor);
  }
  return null;
}

/**
 * Com mais vagas, as primeiras da espera passam a confirmadas, na ordem de chegada. Com menos
 * vagas, ninguém perde a vaga já confirmada: só as novas inscrições vão para a espera.
 */
export async function promoteWaitlist(
  tx: Prisma.TransactionClient,
  audit: AuditTrailService,
  atividadeId: string,
  vagas: number,
  actor: { usuarioId: string; correlationId: string },
): Promise<void> {
  const confirmadas = await tx.inscricao.count({
    where: { atividadeId, situacao: SituacaoInscricao.CONFIRMADA },
  });
  if (confirmadas >= vagas) return;
  const promovidas = await tx.inscricao.findMany({
    where: { atividadeId, situacao: SituacaoInscricao.LISTA_ESPERA },
    orderBy: { ordemChegada: 'asc' },
    take: vagas - confirmadas,
    select: { id: true },
  });
  for (const { id } of promovidas) {
    await tx.inscricao.update({ where: { id }, data: { situacao: SituacaoInscricao.CONFIRMADA } });
    await audit.record(
      {
        autorTipo: AutorTipo.USUARIO,
        usuarioId: actor.usuarioId,
        acao: 'REGISTRATION_PROMOTED',
        entidade: 'inscricao',
        entidadeId: id,
        antes: { situacao: SituacaoInscricao.LISTA_ESPERA },
        depois: { situacao: SituacaoInscricao.CONFIRMADA },
        correlationId: actor.correlationId,
      },
      tx,
    );
  }
}
