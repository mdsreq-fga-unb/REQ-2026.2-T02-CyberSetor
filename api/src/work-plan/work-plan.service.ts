import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, ModalidadeAfericao, TipoVersaoPlano } from '../generated/prisma/enums.js';
import { plannedNumber } from '../goals/goal-result.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreatePlanVersionDto,
  PlanVersionResponse,
  RepactuatedGoalDto,
  WorkPlanResponse,
} from './work-plan.dto.js';

/** Número da primeira versão registrada: a versão 1 é a pactuação original. */
const FIRST_REGISTERED = 2;

const WITH_DETAILS = {
  registradoPor: { select: { id: true, pessoa: { select: { nome: true } } } },
  metas: {
    include: { meta: { select: { ordem: true, objetivo: true } } },
    orderBy: { meta: { ordem: 'asc' } },
  },
} satisfies Prisma.PlanoVersaoInclude;

type VersionRow = Prisma.PlanoVersaoGetPayload<{ include: typeof WITH_DETAILS }>;

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function brDate(date: Date): string {
  return date.toISOString().slice(0, 10).split('-').reverse().join('/');
}

function invalid(code: string, message: string): BadRequestException {
  return new BadRequestException({ code, message });
}

function toResponse(row: VersionRow): PlanVersionResponse {
  return {
    id: row.id,
    numero: row.numero,
    tipo: row.tipo,
    dataDocumento: isoDate(row.dataDocumento)!,
    documentoOrigem: row.documentoOrigem,
    publicacao: row.publicacao,
    justificativa: row.justificativa,
    vigenciaFimAnterior: isoDate(row.vigenciaFimAnterior),
    vigenciaFimNova: isoDate(row.vigenciaFimNova),
    registradoPor: { id: row.registradoPor.id, nome: row.registradoPor.pessoa.nome },
    criadoEm: row.criadoEm.toISOString(),
    metas: row.metas.map((linha) => ({
      metaId: linha.metaId,
      ordem: linha.meta.ordem,
      objetivo: linha.meta.objetivo,
      parametroAntes: linha.parametroAntes,
      parametroDepois: linha.parametroDepois,
      periodoInicioAntes: isoDate(linha.periodoInicioAntes),
      periodoInicioDepois: isoDate(linha.periodoInicioDepois),
      periodoFimAntes: isoDate(linha.periodoFimAntes),
      periodoFimDepois: isoDate(linha.periodoFimDepois),
    })),
  };
}

function versionConflict(): ConflictException {
  return new ConflictException({
    code: 'VERSION_CONFLICT',
    message: 'O plano foi alterado por outra pessoa. Recarregue e confira antes de registrar.',
  });
}

/** Versões do plano de trabalho por termo aditivo, apostila ou ofício (HU-14, RF31, RF44, RN-09). */
@Injectable()
export class WorkPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async get(projetoId: string): Promise<WorkPlanResponse> {
    const projeto = await this.prisma.projeto.findUnique({
      where: { id: projetoId },
      select: { fim: true },
    });
    if (!projeto) throw new NotFoundException('Projeto não encontrado.');
    const versoes = await this.prisma.planoVersao.findMany({
      where: { projetoId },
      include: WITH_DETAILS,
      orderBy: { numero: 'desc' },
    });
    const metas = await this.prisma.meta.findMany({
      where: { projetoId },
      orderBy: { ordem: 'asc' },
      select: {
        id: true,
        ordem: true,
        objetivo: true,
        unidade: true,
        parametroPlanejado: true,
        periodoFim: true,
        resultados: {
          orderBy: [{ dataReferencia: 'desc' }, { criadoEm: 'desc' }],
          take: 1,
          select: { valorAlcancado: true, dataReferencia: true },
        },
      },
    });
    // A linha da versão mais antiga de cada meta guarda o previsto original.
    const original = new Map<string, string | null>();
    for (const versao of [...versoes].reverse()) {
      for (const linha of versao.metas) {
        if (!original.has(linha.metaId)) original.set(linha.metaId, linha.parametroAntes);
      }
    }
    return {
      versoes: versoes.map(toResponse),
      repactuadas: metas
        .filter((meta) => original.has(meta.id))
        .map((meta) => ({
          metaId: meta.id,
          ordem: meta.ordem,
          objetivo: meta.objetivo,
          unidade: meta.unidade,
          previstoOriginal: original.get(meta.id) ?? null,
          reprogramado: meta.parametroPlanejado,
          realizado: meta.resultados[0]?.valorAlcancado?.toNumber() ?? null,
          realizadoEm: isoDate(meta.resultados[0]?.dataReferencia ?? null),
        })),
      foraDaVigencia: metas
        .filter((meta) => meta.periodoFim !== null && meta.periodoFim > projeto.fim)
        .map((meta) => meta.id),
    };
  }

  async create(
    projetoId: string,
    data: CreatePlanVersionDto,
    actor: Actor,
  ): Promise<PlanVersionResponse> {
    const oficio = data.tipo === TipoVersaoPlano.OFICIO;
    if (oficio && (!data.publicacao || !data.justificativa || !data.vigenciaFim)) {
      throw invalid(
        'OFFICE_REQUIRES_PUBLICATION',
        'A mudança de período por ofício exige a publicação, a justificativa e o novo fim da vigência.',
      );
    }
    if (!oficio && data.vigenciaFim !== undefined) {
      throw invalid('PERIOD_REQUIRES_OFFICE', 'A vigência só muda por ofício.');
    }
    if (!oficio && data.metas.length === 0) {
      throw invalid('NO_GOAL_CHANGED', 'Informe ao menos uma meta repactuada.');
    }
    const dataDocumento = toDate(data.dataDocumento);
    const vigenciaFim = data.vigenciaFim ? toDate(data.vigenciaFim) : null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const projeto = await tx.projeto.findUnique({
          where: { id: projetoId },
          include: { instrumento: true },
        });
        if (!projeto) throw new NotFoundException('Projeto não encontrado.');
        if (!projeto.instrumento.ativo) {
          throw new ConflictException({
            code: 'INSTRUMENT_INACTIVE',
            message: 'O instrumento está inativo e não recebe nova versão do plano.',
          });
        }
        if (vigenciaFim && vigenciaFim < projeto.inicio) {
          throw invalid(
            'INVALID_PERIOD',
            `O novo fim da vigência não pode ser anterior ao início do projeto, ${brDate(projeto.inicio)}.`,
          );
        }
        const fim = vigenciaFim ?? projeto.fim;
        const anteriores = await tx.planoVersao.count({ where: { projetoId } });
        const versao = await tx.planoVersao.create({
          data: {
            projetoId,
            numero: FIRST_REGISTERED + anteriores,
            tipo: data.tipo,
            dataDocumento,
            documentoOrigem: data.documentoOrigem,
            publicacao: data.publicacao ?? null,
            justificativa: data.justificativa ?? null,
            vigenciaFimAnterior: vigenciaFim ? projeto.fim : null,
            vigenciaFimNova: vigenciaFim,
            registradoPorId: actor.usuarioId,
          },
        });

        for (const meta of data.metas) {
          await this.repactuate(tx, projetoId, versao.id, meta, { inicio: projeto.inicio, fim });
        }
        if (vigenciaFim) {
          await tx.projeto.update({
            where: { id: projetoId },
            data: { fim: vigenciaFim, versao: { increment: 1 } },
          });
          await tx.instrumento.update({
            where: { id: projeto.instrumentoId },
            data: { vigenciaFim, versao: { increment: 1 } },
          });
        }

        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'PLAN_VERSION_CREATED',
            entidade: 'projeto',
            entidadeId: projetoId,
            antes: vigenciaFim ? { vigenciaFim: isoDate(projeto.fim) } : undefined,
            depois: {
              numero: versao.numero,
              tipo: data.tipo,
              documentoOrigem: data.documentoOrigem,
              metas: data.metas.map((meta) => meta.metaId),
              ...(vigenciaFim && { vigenciaFim: data.vigenciaFim }),
            },
            correlationId: actor.correlationId,
          },
          tx,
        );
        return toResponse(
          await tx.planoVersao.findUniqueOrThrow({
            where: { id: versao.id },
            include: WITH_DETAILS,
          }),
        );
      });
    } catch (error) {
      // Dois registros ao mesmo tempo disputam o mesmo número de versão.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw versionConflict();
      }
      throw error;
    }
  }

  /** Atualiza a meta e guarda o previsto de antes e de depois (CA-14.2). */
  private async repactuate(
    tx: Prisma.TransactionClient,
    projetoId: string,
    versaoId: string,
    data: RepactuatedGoalDto,
    execucao: { inicio: Date; fim: Date },
  ): Promise<void> {
    const meta = await tx.meta.findFirst({ where: { id: data.metaId, projetoId } });
    if (!meta) throw new NotFoundException('Meta não encontrada neste projeto.');
    if (meta.versao !== data.versao) throw versionConflict();

    const parametro = data.parametroPlanejado ?? meta.parametroPlanejado;
    if (
      data.parametroPlanejado !== undefined &&
      meta.modalidadeAfericao === ModalidadeAfericao.QUANTITATIVA &&
      plannedNumber(data.parametroPlanejado) === null
    ) {
      throw invalid(
        'INVALID_PLANNED_VALUE',
        'Na meta quantitativa, o parâmetro planejado é um número maior que zero, com até duas casas decimais (por exemplo, 120 ou 12,5).',
      );
    }
    const inicio = data.periodoInicio ? toDate(data.periodoInicio) : meta.periodoInicio;
    const fim = data.periodoFim ? toDate(data.periodoFim) : meta.periodoFim;
    if (inicio && fim && fim < inicio) {
      throw invalid('INVALID_PERIOD', 'O fim do período não pode ser anterior ao início.');
    }
    const days = [data.periodoInicio && inicio, data.periodoFim && fim].filter(
      (day): day is Date => day instanceof Date,
    );
    if (days.some((day) => day < execucao.inicio || day > execucao.fim)) {
      throw invalid(
        'OUTSIDE_PROJECT_EXECUTION',
        `O período da meta deve ficar dentro da execução do projeto, de ${brDate(execucao.inicio)} a ${brDate(execucao.fim)}.`,
      );
    }
    const updated = await tx.meta.updateMany({
      where: { id: meta.id, versao: data.versao },
      data: {
        parametroPlanejado: parametro,
        periodoInicio: inicio,
        periodoFim: fim,
        versao: { increment: 1 },
      },
    });
    if (updated.count === 0) throw versionConflict();
    await tx.planoVersaoMeta.create({
      data: {
        versaoId,
        metaId: meta.id,
        parametroAntes: meta.parametroPlanejado,
        parametroDepois: parametro,
        periodoInicioAntes: meta.periodoInicio,
        periodoInicioDepois: inicio,
        periodoFimAntes: meta.periodoFim,
        periodoFimDepois: fim,
      },
    });
  }
}
