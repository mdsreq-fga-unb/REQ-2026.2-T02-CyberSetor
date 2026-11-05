import { Injectable, NotFoundException } from '@nestjs/common';
import { missingFields } from '../goals/goal-completion.js';
import { deadlineAlert, todayInBrasilia } from '../goals/goal-deadline.js';
import type { Prisma } from '../generated/prisma/client.js';
import { SituacaoMeta } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ProjectTimelineResponse,
  TimelineGoalResponse,
  TimelinePendingResponse,
} from './project-timeline.dto.js';
import { requirementSituation } from './requirement-situation.js';

const COMPLETION = {
  indicador: true,
  parametroPlanejado: true,
  formaComprovacao: true,
  periodoInicio: true,
  periodoFim: true,
  modalidadeAfericao: true,
} satisfies Prisma.MetaSelect;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isDraft(goal: Prisma.MetaGetPayload<{ select: typeof COMPLETION }>): boolean {
  return missingFields(goal).length > 0;
}

function pending(goals: TimelineGoalResponse[]): TimelinePendingResponse {
  return {
    metas: goals.length,
    vencendo: goals.filter((goal) => goal.alerta === 'VENCENDO').length,
    vencidas: goals.filter((goal) => goal.alerta === 'VENCIDA').length,
    semResponsavel: goals.filter(
      (goal) => goal.situacao !== SituacaoMeta.CONCLUIDA && goal.responsavel === null,
    ).length,
  };
}

@Injectable()
export class ProjectTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async get(projectId: string, now: Date = new Date()): Promise<ProjectTimelineResponse> {
    const row = await this.prisma.projeto.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        codigo: true,
        titulo: true,
        inicio: true,
        fim: true,
        metas: {
          select: {
            ...COMPLETION,
            id: true,
            ordem: true,
            objetivo: true,
            situacao: true,
            responsavel: { select: { id: true, ativo: true, pessoa: { select: { nome: true } } } },
            setor: { select: { id: true, nome: true, ativo: true } },
          },
          orderBy: [{ periodoFim: { sort: 'asc', nulls: 'last' } }, { ordem: 'asc' }],
        },
        instrumento: {
          select: {
            id: true,
            numeroProcesso: true,
            orgaoConcedente: true,
            vigenciaInicio: true,
            vigenciaFim: true,
            ativo: true,
            requisitos: {
              select: {
                id: true,
                descricao: true,
                referencia: true,
                metas: {
                  select: {
                    meta: {
                      select: {
                        ...COMPLETION,
                        id: true,
                        ordem: true,
                        objetivo: true,
                        situacao: true,
                        projeto: { select: { id: true, codigo: true } },
                        resultados: {
                          select: { alcance: true },
                          orderBy: [{ dataReferencia: 'desc' }, { criadoEm: 'desc' }],
                          take: 1,
                        },
                      },
                    },
                  },
                  orderBy: { meta: { ordem: 'asc' } },
                },
              },
              orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
            },
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Projeto não encontrado.');

    const today = todayInBrasilia(now);
    const metas = row.metas.map((goal): TimelineGoalResponse => {
      const periodoFim = goal.periodoFim ? isoDate(goal.periodoFim) : null;
      return {
        metaId: goal.id,
        ordem: goal.ordem,
        objetivo: goal.objetivo,
        periodoFim,
        situacao: goal.situacao,
        alerta: deadlineAlert(periodoFim, goal.situacao, today),
        rascunho: isDraft(goal),
        foraDaVigencia: goal.periodoFim !== null && goal.periodoFim > row.fim,
        setor: goal.setor,
        responsavel: goal.responsavel
          ? {
              id: goal.responsavel.id,
              nome: goal.responsavel.pessoa.nome,
              ativo: goal.responsavel.ativo,
            }
          : null,
      };
    });
    const { instrumento } = row;

    return {
      hoje: today,
      instrumento: {
        id: instrumento.id,
        numeroProcesso: instrumento.numeroProcesso,
        orgaoConcedente: instrumento.orgaoConcedente,
        vigenciaInicio: isoDate(instrumento.vigenciaInicio),
        vigenciaFim: isoDate(instrumento.vigenciaFim),
        ativo: instrumento.ativo,
      },
      projeto: {
        id: row.id,
        codigo: row.codigo,
        titulo: row.titulo,
        inicio: isoDate(row.inicio),
        fim: isoDate(row.fim),
      },
      pendencias: pending(metas),
      metas,
      requisitos: instrumento.requisitos.map((requirement) => {
        const goals = requirement.metas.map(({ meta }) => ({
          metaId: meta.id,
          ordem: meta.ordem,
          objetivo: meta.objetivo,
          situacao: meta.situacao,
          rascunho: isDraft(meta),
          alcance: meta.resultados[0]?.alcance ?? null,
          projetoId: meta.projeto.id,
          projetoCodigo: meta.projeto.codigo,
        }));
        return {
          id: requirement.id,
          descricao: requirement.descricao,
          referencia: requirement.referencia,
          situacao: requirementSituation(goals),
          metas: goals,
        };
      }),
    };
  }
}
