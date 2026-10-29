import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, Perfil } from '../generated/prisma/enums.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ActivityResponse,
  CreateActivityDto,
  ResponsibleResponse,
  UpdateActivityDto,
} from './activities.dto.js';

export const ACTIVITY_EDITORS = [Perfil.PRESIDENCIA_GESTAO, Perfil.NUCLEO_PEDAGOGICO];

const WITH_DETAILS = {
  modalidade: { select: { id: true, nome: true, ativo: true } },
  responsavel: { select: { id: true, ativo: true, pessoa: { select: { nome: true } } } },
  metas: {
    select: { meta: { select: { id: true, ordem: true, objetivo: true } } },
    orderBy: { meta: { ordem: 'asc' } },
  },
  inscricao: { select: { aberta: true, vagas: true } },
  _count: { select: { inscricoes: true } },
} satisfies Prisma.AtividadeInclude;

type ActivityRow = Prisma.AtividadeGetPayload<{ include: typeof WITH_DETAILS }>;
type ProjectWithInstrument = Prisma.ProjetoGetPayload<{ include: { instrumento: true } }>;

const SCALAR_FIELDS = ['titulo', 'modalidadeId', 'responsavelId', 'data', 'local'] as const;

interface ActivityValues {
  titulo: string;
  modalidadeId: string;
  responsavelId: string;
  data: string;
  local: string;
  metaIds: string[];
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function brDate(date: Date): string {
  return isoDate(date).split('-').reverse().join('/');
}

function toResponse(row: ActivityRow): ActivityResponse {
  return {
    id: row.id,
    versao: row.versao,
    projetoId: row.projetoId,
    titulo: row.titulo,
    data: isoDate(row.data),
    local: row.local,
    modalidade: {
      id: row.modalidade.id,
      nome: row.modalidade.nome,
      ativo: row.modalidade.ativo,
    },
    responsavel: {
      id: row.responsavel.id,
      nome: row.responsavel.pessoa.nome,
      ativo: row.responsavel.ativo,
    },
    metas: row.metas.map(({ meta }) => ({
      id: meta.id,
      ordem: meta.ordem,
      objetivo: meta.objetivo,
    })),
    inscricao: row.inscricao
      ? {
          aberta: row.inscricao.aberta,
          vagas: row.inscricao.vagas,
          inscritos: row._count.inscricoes,
        }
      : null,
  };
}

function valuesOf(activity: ActivityResponse): ActivityValues {
  return {
    titulo: activity.titulo,
    modalidadeId: activity.modalidade.id,
    responsavelId: activity.responsavel.id,
    data: activity.data,
    local: activity.local,
    metaIds: activity.metas.map((meta) => meta.id),
  };
}

function sameSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
}

function assertActiveInstrument(project: ProjectWithInstrument): void {
  if (!project.instrumento.ativo) {
    throw new ConflictException({
      code: 'INSTRUMENT_INACTIVE',
      message: 'O instrumento está inativo e não recebe nem altera atividades.',
    });
  }
}

function assertDateWithinProject(data: string, project: ProjectWithInstrument): void {
  toDate(data);
  if (data < isoDate(project.inicio) || data > isoDate(project.fim)) {
    throw new BadRequestException({
      code: 'OUTSIDE_PROJECT_PERIOD',
      message: `A data da atividade deve ficar dentro da execução do projeto, de ${brDate(project.inicio)} a ${brDate(project.fim)}.`,
    });
  }
}

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(projetoId: string): Promise<ActivityResponse[]> {
    await this.project(this.prisma, projetoId);
    const rows = await this.prisma.atividade.findMany({
      where: { projetoId },
      include: WITH_DETAILS,
      orderBy: [{ data: 'asc' }, { titulo: 'asc' }],
    });
    return rows.map(toResponse);
  }

  async get(id: string): Promise<ActivityResponse> {
    const row = await this.prisma.atividade.findUnique({
      where: { id },
      include: WITH_DETAILS,
    });
    if (!row) throw new NotFoundException('Atividade não encontrada.');
    return toResponse(row);
  }

  async eligibleResponsibles(): Promise<ResponsibleResponse[]> {
    const rows = await this.prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, pessoa: { select: { nome: true } } },
      orderBy: { pessoa: { nome: 'asc' } },
    });
    return rows.map((row) => ({ id: row.id, nome: row.pessoa.nome }));
  }

  async create(
    projetoId: string,
    data: CreateActivityDto,
    actor: Actor,
  ): Promise<ActivityResponse> {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.project(tx, projetoId);
      assertActiveInstrument(project);
      assertDateWithinProject(data.data, project);
      await this.assertActiveModality(tx, data.modalidadeId);
      await this.assertActiveResponsible(tx, data.responsavelId);
      await this.assertMetasBelongToProject(tx, projetoId, data.metaIds);

      const row = await tx.atividade.create({
        data: {
          projetoId,
          modalidadeId: data.modalidadeId,
          responsavelId: data.responsavelId,
          titulo: data.titulo,
          data: toDate(data.data),
          local: data.local,
          metas: {
            create: data.metaIds.map((metaId) => ({ metaId })),
          },
        },
        include: WITH_DETAILS,
      });

      const atividade = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACTIVITY_CREATED',
          entidade: 'atividade',
          entidadeId: row.id,
          depois: { projetoId, ...valuesOf(atividade) },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return atividade;
    });
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateActivityDto,
    actor: Actor,
  ): Promise<ActivityResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.atividade.findUnique({
        where: { id },
        include: {
          ...WITH_DETAILS,
          projeto: { include: { instrumento: true } },
        },
      });
      if (!current) throw new NotFoundException('Atividade não encontrada.');
      if (current.versao !== versao) throw this.versionConflict();
      assertActiveInstrument(current.projeto);

      const beforeResponse = toResponse(current);
      const before = valuesOf(beforeResponse);
      const next: ActivityValues = {
        titulo: changes.titulo ?? before.titulo,
        modalidadeId: changes.modalidadeId ?? before.modalidadeId,
        responsavelId: changes.responsavelId ?? before.responsavelId,
        data: changes.data ?? before.data,
        local: changes.local ?? before.local,
        metaIds: changes.metaIds ?? before.metaIds,
      };

      const changedScalars = SCALAR_FIELDS.filter((field) => next[field] !== before[field]);
      const metasChanged = !sameSet(next.metaIds, before.metaIds);
      if (changedScalars.length === 0 && !metasChanged) return beforeResponse;

      if (changedScalars.includes('data')) assertDateWithinProject(next.data, current.projeto);
      if (changedScalars.includes('modalidadeId')) {
        await this.assertActiveModality(tx, next.modalidadeId);
      }
      if (changedScalars.includes('responsavelId')) {
        await this.assertActiveResponsible(tx, next.responsavelId);
      }
      if (metasChanged) {
        await this.assertMetasBelongToProject(tx, current.projetoId, next.metaIds);
      }

      const updated = await tx.atividade.updateMany({
        where: { id, versao },
        data: {
          titulo: next.titulo,
          modalidadeId: next.modalidadeId,
          responsavelId: next.responsavelId,
          data: toDate(next.data),
          local: next.local,
          versao: { increment: 1 },
        },
      });
      if (updated.count === 0) throw this.versionConflict();

      if (metasChanged) {
        const toRemove = before.metaIds.filter((metaId) => !next.metaIds.includes(metaId));
        const toAdd = next.metaIds.filter((metaId) => !before.metaIds.includes(metaId));
        if (toRemove.length > 0) {
          await tx.atividadeMeta.deleteMany({
            where: { atividadeId: id, metaId: { in: toRemove } },
          });
        }
        if (toAdd.length > 0) {
          await tx.atividadeMeta.createMany({
            data: toAdd.map((metaId) => ({ atividadeId: id, metaId })),
          });
        }
      }

      const atividade = toResponse(
        await tx.atividade.findUniqueOrThrow({ where: { id }, include: WITH_DETAILS }),
      );
      const after = valuesOf(atividade);
      const antes: Record<string, unknown> = Object.fromEntries(
        changedScalars.map((field) => [field, before[field]]),
      );
      const depois: Record<string, unknown> = Object.fromEntries(
        changedScalars.map((field) => [field, after[field]]),
      );
      if (metasChanged) {
        antes.metaIds = before.metaIds;
        depois.metaIds = after.metaIds;
      }

      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACTIVITY_UPDATED',
          entidade: 'atividade',
          entidadeId: id,
          antes: antes as Prisma.InputJsonObject,
          depois: depois as Prisma.InputJsonObject,
          correlationId: actor.correlationId,
        },
        tx,
      );
      return atividade;
    });
  }

  private async project(
    client: Prisma.TransactionClient,
    projetoId: string,
  ): Promise<ProjectWithInstrument> {
    const project = await client.projeto.findUnique({
      where: { id: projetoId },
      include: { instrumento: true },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado.');
    return project;
  }

  private async assertActiveModality(
    tx: Prisma.TransactionClient,
    modalidadeId: string,
  ): Promise<void> {
    const count = await tx.modalidade.count({
      where: { id: modalidadeId, ativo: true },
    });
    if (count === 0) {
      throw new BadRequestException({
        code: 'INVALID_MODALITY',
        message: 'Escolha uma modalidade ativa cadastrada pelo Instituto.',
      });
    }
  }

  private async assertActiveResponsible(
    tx: Prisma.TransactionClient,
    responsavelId: string,
  ): Promise<void> {
    const count = await tx.usuario.count({
      where: { id: responsavelId, ativo: true },
    });
    if (count === 0) {
      throw new BadRequestException({
        code: 'INVALID_RESPONSIBLE',
        message: 'Escolha o responsável entre as contas ativas do Instituto.',
      });
    }
  }

  private async assertMetasBelongToProject(
    tx: Prisma.TransactionClient,
    projetoId: string,
    metaIds: string[],
  ): Promise<void> {
    const count = await tx.meta.count({
      where: { id: { in: metaIds }, projetoId },
    });
    if (count !== metaIds.length) {
      throw new BadRequestException({
        code: 'META_OUTSIDE_PROJECT',
        message: 'Selecione apenas metas pertencentes ao mesmo projeto da atividade.',
      });
    }
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A atividade foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
