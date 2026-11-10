import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, SituacaoMeta } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateGoalNoticeDto, GoalNoticeResponse } from './goal-notices.dto.js';

const WITH_AUTHOR = {
  criadoPor: { select: { pessoa: { select: { nome: true } } } },
} satisfies Prisma.AvisoMetaInclude;

type NoticeRow = Prisma.AvisoMetaGetPayload<{ include: typeof WITH_AUTHOR }>;

function toResponse(row: NoticeRow): GoalNoticeResponse {
  return {
    id: row.id,
    dataAviso: row.dataAviso.toISOString().slice(0, 10),
    mensagem: row.mensagem,
    criadoPor: row.criadoPor.pessoa.nome,
    criadoEm: row.criadoEm.toISOString(),
  };
}

@Injectable()
export class GoalNoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(goalId: string): Promise<GoalNoticeResponse[]> {
    await this.assertGoal(goalId);
    const rows = await this.prisma.avisoMeta.findMany({
      where: { metaId: goalId },
      include: WITH_AUTHOR,
      orderBy: [{ dataAviso: 'asc' }, { criadoEm: 'asc' }],
    });
    return rows.map(toResponse);
  }

  async create(
    goalId: string,
    { dataAviso, mensagem }: CreateGoalNoticeDto,
    actor: Actor,
  ): Promise<GoalNoticeResponse> {
    const data = toDate(dataAviso);
    if (dataAviso < todayInBrasilia()) {
      throw new BadRequestException({
        code: 'PAST_NOTICE_DATE',
        message: 'A data do aviso não pode estar no passado.',
      });
    }
    const goal = await this.assertGoal(goalId);
    if (!goal.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está desativado.',
      });
    }
    // Meta concluída não recebe aviso: a rotina não avisa meta concluída, e o aviso nunca sairia.
    if (goal.situacao === SituacaoMeta.CONCLUIDA) {
      throw new ConflictException({
        code: 'GOAL_CONCLUDED',
        message: 'A meta já está concluída e não recebe aviso.',
      });
    }
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.avisoMeta.create({
        data: { metaId: goalId, dataAviso: data, mensagem, criadoPorId: actor.usuarioId },
        include: WITH_AUTHOR,
      });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_NOTICE_CREATED',
          entidade: 'aviso_meta',
          entidadeId: row.id,
          depois: { metaId: goalId, dataAviso, mensagem },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return toResponse(row);
    });
  }

  async remove(goalId: string, noticeId: string, actor: Actor): Promise<void> {
    const row = await this.prisma.avisoMeta.findFirst({ where: { id: noticeId, metaId: goalId } });
    if (!row) throw new NotFoundException('Aviso não encontrado.');
    const dataAviso = row.dataAviso.toISOString().slice(0, 10);
    if (dataAviso <= todayInBrasilia()) {
      throw new ConflictException({
        code: 'NOTICE_ALREADY_DUE',
        message: 'O aviso que já chegou à data de envio fica registrado.',
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.avisoMeta.delete({ where: { id: noticeId } });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_NOTICE_REMOVED',
          entidade: 'aviso_meta',
          entidadeId: noticeId,
          antes: { metaId: goalId, dataAviso, mensagem: row.mensagem },
          correlationId: actor.correlationId,
        },
        tx,
      );
    });
  }

  private async assertGoal(goalId: string) {
    const goal = await this.prisma.meta.findUnique({
      where: { id: goalId },
      select: {
        situacao: true,
        projeto: { select: { instrumento: { select: { ativo: true } } } },
      },
    });
    if (!goal) throw new NotFoundException('Meta não encontrada.');
    return goal;
  }
}
