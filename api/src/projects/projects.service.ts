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
import { missingFields } from '../goals/goal-completion.js';
import { toResult, WITH_AUTHOR } from '../goals/goals.service.js';
import type {
  CoordinatorResponse,
  CreateProjectDto,
  ProjectResponse,
  UpdateProjectDto,
} from './projects.dto.js';
import type { ReportPreviewQueryDto, ReportPreviewResponse } from './report-preview.dto.js';

export const COORDINATOR_PROFILES = [Perfil.PRESIDENCIA_GESTAO, Perfil.NUCLEO_PEDAGOGICO];

const WITH_COORDINATOR = {
  coordenador: { select: { id: true, ativo: true, pessoa: { select: { nome: true } } } },
} satisfies Prisma.ProjetoInclude;

type ProjectRow = Prisma.ProjetoGetPayload<{ include: typeof WITH_COORDINATOR }>;
type InstrumentRow = Prisma.InstrumentoGetPayload<object>;

const FIELDS = ['codigo', 'titulo', 'coordenadorId', 'inicio', 'fim'] as const;
type ProjectValues = Record<(typeof FIELDS)[number], string>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function brDate(date: Date): string {
  return isoDate(date).split('-').reverse().join('/');
}

function toResponse(row: ProjectRow): ProjectResponse {
  return {
    id: row.id,
    versao: row.versao,
    instrumentoId: row.instrumentoId,
    codigo: row.codigo,
    titulo: row.titulo,
    coordenador: {
      id: row.coordenador.id,
      nome: row.coordenador.pessoa.nome,
      ativo: row.coordenador.ativo,
    },
    inicio: isoDate(row.inicio),
    fim: isoDate(row.fim),
  };
}

function valuesOf(project: ProjectResponse): ProjectValues {
  return {
    codigo: project.codigo,
    titulo: project.titulo,
    coordenadorId: project.coordenador.id,
    inicio: project.inicio,
    fim: project.fim,
  };
}

function assertSchedule(values: ProjectValues, instrument: InstrumentRow): void {
  [values.inicio, values.fim].forEach(toDate);
  if (values.fim < values.inicio) {
    throw new BadRequestException({
      code: 'INVALID_SCHEDULE',
      message: 'O fim da execução não pode ser anterior ao início.',
    });
  }
  if (
    values.inicio < isoDate(instrument.vigenciaInicio) ||
    values.fim > isoDate(instrument.vigenciaFim)
  ) {
    throw new BadRequestException({
      code: 'OUTSIDE_INSTRUMENT_TERM',
      message: `A execução deve ficar dentro da vigência do instrumento, de ${brDate(instrument.vigenciaInicio)} a ${brDate(instrument.vigenciaFim)}.`,
    });
  }
}

function assertActive(instrument: InstrumentRow): void {
  if (!instrument.ativo) {
    throw new ConflictException({
      code: 'INSTRUMENT_INACTIVE',
      message: 'O instrumento está inativo e não recebe nem altera projetos.',
    });
  }
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(instrumentoId: string): Promise<ProjectResponse[]> {
    await this.instrument(this.prisma, instrumentoId);
    const rows = await this.prisma.projeto.findMany({
      where: { instrumentoId },
      include: WITH_COORDINATOR,
      orderBy: { codigo: 'asc' },
    });
    return rows.map(toResponse);
  }

  async get(id: string): Promise<ProjectResponse> {
    const row = await this.prisma.projeto.findUnique({ where: { id }, include: WITH_COORDINATOR });
    if (!row) throw new NotFoundException('Projeto não encontrado.');
    return toResponse(row);
  }

  async reportPreview(
    projectId: string,
    { from, to }: ReportPreviewQueryDto,
  ): Promise<ReportPreviewResponse> {
    const fromDateVal = toDate(from);
    const toDateVal = toDate(to);
    if (from > to) {
      throw new BadRequestException({
        code: 'INVALID_PERIOD',
        message: 'A data inicial (from) não pode ser posterior à data final (to).',
      });
    }

    const project = await this.prisma.projeto.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        codigo: true,
        titulo: true,
        instrumentoId: true,
        inicio: true,
        fim: true,
      },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    const goals = await this.prisma.meta.findMany({
      where: { projetoId: projectId },
      orderBy: { ordem: 'asc' },
      include: {
        resultados: {
          where: { dataReferencia: { gte: fromDateVal, lte: toDateVal } },
          include: WITH_AUTHOR,
          orderBy: [{ dataReferencia: 'desc' }, { criadoEm: 'desc' }],
          take: 1,
        },
      },
    });

    const metas = goals.map((goal) => {
      const periodoInicio = goal.periodoInicio ? isoDate(goal.periodoInicio) : null;
      const periodoFim = goal.periodoFim ? isoDate(goal.periodoFim) : null;
      const rascunho = missingFields({ ...goal, periodoInicio, periodoFim }).length > 0;
      const latestResult = goal.resultados[0] ? toResult(goal.resultados[0]) : null;

      return {
        id: goal.id,
        ordem: goal.ordem,
        origem: goal.origem,
        objetivo: goal.objetivo,
        descricao: goal.descricao,
        indicador: goal.indicador,
        modalidadeAfericao: goal.modalidadeAfericao,
        parametroPlanejado: goal.parametroPlanejado,
        unidade: goal.unidade,
        periodoInicio,
        periodoFim,
        situacao: goal.situacao,
        rascunho,
        resultado: latestResult,
        percentual: latestResult?.percentual ?? null,
        status: latestResult?.alcance ?? null,
      };
    });

    return {
      projeto: {
        id: project.id,
        codigo: project.codigo,
        titulo: project.titulo,
        instrumentoId: project.instrumentoId,
        inicio: isoDate(project.inicio),
        fim: isoDate(project.fim),
      },
      periodo: { from, to },
      metas,
    };
  }

  async eligibleCoordinators(): Promise<CoordinatorResponse[]> {
    const rows = await this.prisma.usuario.findMany({
      where: { ativo: true, perfil: { in: COORDINATOR_PROFILES } },
      select: { id: true, pessoa: { select: { nome: true } } },
      orderBy: { pessoa: { nome: 'asc' } },
    });
    return rows.map((row) => ({ id: row.id, nome: row.pessoa.nome }));
  }

  async create(
    instrumentoId: string,
    data: CreateProjectDto,
    actor: Actor,
  ): Promise<ProjectResponse> {
    return this.withCodeConflict(() =>
      this.prisma.$transaction(async (tx) => {
        const instrument = await this.instrument(tx, instrumentoId);
        assertActive(instrument);
        assertSchedule(data, instrument);
        await this.assertCoordinator(tx, data.coordenadorId);
        await this.assertCodeFree(tx, instrumentoId, data.codigo);

        const row = await tx.projeto.create({
          data: {
            instrumentoId,
            coordenadorId: data.coordenadorId,
            codigo: data.codigo,
            titulo: data.titulo,
            inicio: toDate(data.inicio),
            fim: toDate(data.fim),
          },
          include: WITH_COORDINATOR,
        });
        const projeto = toResponse(row);
        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'PROJECT_CREATED',
            entidade: 'projeto',
            entidadeId: row.id,
            depois: { instrumentoId, ...valuesOf(projeto) },
            correlationId: actor.correlationId,
          },
          tx,
        );
        return projeto;
      }),
    );
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateProjectDto,
    actor: Actor,
  ): Promise<ProjectResponse> {
    return this.withCodeConflict(() =>
      this.prisma.$transaction(async (tx) => {
        const current = await tx.projeto.findUnique({
          where: { id },
          include: { ...WITH_COORDINATOR, instrumento: true },
        });
        if (!current) throw new NotFoundException('Projeto não encontrado.');
        if (current.versao !== versao) throw this.versionConflict();
        assertActive(current.instrumento);

        const before = valuesOf(toResponse(current));
        const next = { ...before, ...changes };
        const changed = FIELDS.filter((field) => next[field] !== before[field]);
        if (changed.length === 0) return toResponse(current);
        if (changed.includes('inicio') || changed.includes('fim')) {
          assertSchedule(next, current.instrumento);
        }
        if (changed.includes('coordenadorId')) await this.assertCoordinator(tx, next.coordenadorId);
        if (changed.includes('codigo')) {
          await this.assertCodeFree(tx, current.instrumentoId, next.codigo, id);
        }

        const updated = await tx.projeto.updateMany({
          where: { id, versao },
          data: {
            codigo: next.codigo,
            titulo: next.titulo,
            coordenadorId: next.coordenadorId,
            inicio: toDate(next.inicio),
            fim: toDate(next.fim),
            versao: { increment: 1 },
          },
        });
        if (updated.count === 0) throw this.versionConflict();

        const projeto = toResponse(
          await tx.projeto.findUniqueOrThrow({ where: { id }, include: WITH_COORDINATOR }),
        );
        const after = valuesOf(projeto);
        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'PROJECT_UPDATED',
            entidade: 'projeto',
            entidadeId: id,
            antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
            depois: Object.fromEntries(changed.map((field) => [field, after[field]])),
            correlationId: actor.correlationId,
          },
          tx,
        );
        return projeto;
      }),
    );
  }

  private async instrument(
    client: Prisma.TransactionClient,
    instrumentoId: string,
  ): Promise<InstrumentRow> {
    const instrument = await client.instrumento.findUnique({ where: { id: instrumentoId } });
    if (!instrument) throw new NotFoundException('Instrumento não encontrado.');
    return instrument;
  }

  private async assertCoordinator(
    tx: Prisma.TransactionClient,
    coordenadorId: string,
  ): Promise<void> {
    const eligible = await tx.usuario.count({
      where: { id: coordenadorId, ativo: true, perfil: { in: COORDINATOR_PROFILES } },
    });
    if (eligible === 0) {
      throw new BadRequestException({
        code: 'INVALID_COORDINATOR',
        message:
          'Escolha o coordenador entre as contas ativas de Presidência e Gestão ou de Núcleo Pedagógico.',
      });
    }
  }

  private async assertCodeFree(
    tx: Prisma.TransactionClient,
    instrumentoId: string,
    codigo: string,
    exceptId?: string,
  ): Promise<void> {
    const taken = await tx.projeto.count({
      where: {
        instrumentoId,
        codigo: { equals: codigo, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    if (taken > 0) throw this.codeConflict();
  }

  private async withCodeConflict<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.codeConflict();
      }
      throw error;
    }
  }

  private codeConflict(): ConflictException {
    return new ConflictException({
      code: 'PROJECT_CODE_TAKEN',
      message: 'Já existe projeto com este código no instrumento.',
    });
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'O projeto foi alterado por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
