import { Injectable } from '@nestjs/common';
import { deadlineAlert, DEADLINE_WARNING_DAYS, todayInBrasilia } from '../goals/goal-deadline.js';
import { Perfil, SituacaoMeta } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AccountsSummaryResponse,
  DashboardResponse,
  GoalRefResponse,
  PanelResponse,
  ProjectRefResponse,
} from './dashboard.dto.js';

const LIST_SIZE = { prazos: 6, semResponsavel: 5, atividades: 5, vigencias: 4 };

const PROJECT_REF = { select: { id: true, codigo: true, titulo: true, instrumentoId: true } };

const GOAL_REF = {
  id: true,
  ordem: true,
  objetivo: true,
  periodoFim: true,
  situacao: true,
  projeto: PROJECT_REF,
  responsavel: { select: { id: true, pessoa: { select: { nome: true } } } },
} satisfies Prisma.MetaSelect;

type GoalRow = Prisma.MetaGetPayload<{ select: typeof GOAL_REF }>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateOf(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function addDays(iso: string, days: number): string {
  const date = dateOf(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function projectRef(row: ProjectRefResponse): ProjectRefResponse {
  return { id: row.id, codigo: row.codigo, titulo: row.titulo, instrumentoId: row.instrumentoId };
}

function goalRef(row: GoalRow, today: string): GoalRefResponse {
  const periodoFim = row.periodoFim ? isoDate(row.periodoFim) : null;
  return {
    metaId: row.id,
    ordem: row.ordem,
    objetivo: row.objetivo,
    periodoFim,
    alerta: deadlineAlert(periodoFim, row.situacao, today),
    responsavel: row.responsavel
      ? { id: row.responsavel.id, nome: row.responsavel.pessoa.nome }
      : null,
    projeto: projectRef(row.projeto),
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(usuarioId: string, perfil: Perfil, now: Date = new Date()): Promise<DashboardResponse> {
    const user = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: {
        perfil: true,
        pessoa: { select: { nome: true, setor: { select: { id: true, nome: true } } } },
      },
    });
    return {
      usuario: { nome: user.pessoa.nome, perfil: user.perfil, setor: user.pessoa.setor },
      painel: (INSTRUMENT_READERS as Perfil[]).includes(perfil)
        ? await this.panel(usuarioId, now)
        : null,
      contas: perfil === Perfil.ADMINISTRACAO_SISTEMA ? await this.accounts(now) : null,
    };
  }

  private async panel(usuarioId: string, now: Date): Promise<PanelResponse> {
    const today = todayInBrasilia(now);
    const todayDate = dateOf(today);
    const warningDate = dateOf(addDays(today, DEADLINE_WARNING_DAYS));
    // Metas e atividades de instrumento desativado saem do painel.
    const openGoal = {
      situacao: { not: SituacaoMeta.CONCLUIDA },
      projeto: { instrumento: { ativo: true } },
    } satisfies Prisma.MetaWhereInput;
    const upcoming = {
      data: { gte: todayDate, lte: warningDate },
      projeto: { instrumento: { ativo: true } },
    } satisfies Prisma.AtividadeWhereInput;
    const dueSoon = { ...openGoal, periodoFim: { gte: todayDate, lte: warningDate } };
    const overdue = { ...openGoal, periodoFim: { lt: todayDate } };
    const unowned = { ...openGoal, responsavelId: null };

    const [
      minhasMetas,
      metasVencendo,
      metasVencidas,
      metasSemResponsavel,
      inscricoesAbertas,
      atividadesProximas,
      prazos,
      semResponsavel,
      atividades,
      vigencias,
    ] = await this.prisma.$transaction([
      this.prisma.meta.count({ where: { ...openGoal, responsavelId: usuarioId } }),
      this.prisma.meta.count({ where: dueSoon }),
      this.prisma.meta.count({ where: overdue }),
      this.prisma.meta.count({ where: unowned }),
      this.prisma.configuracaoInscricao.count({
        where: { aberta: true, atividade: { projeto: { instrumento: { ativo: true } } } },
      }),
      this.prisma.atividade.count({ where: upcoming }),
      this.prisma.meta.findMany({
        where: { ...openGoal, periodoFim: { lte: warningDate } },
        select: GOAL_REF,
        orderBy: [{ periodoFim: 'asc' }, { ordem: 'asc' }],
        take: LIST_SIZE.prazos,
      }),
      this.prisma.meta.findMany({
        where: unowned,
        select: GOAL_REF,
        orderBy: [{ periodoFim: { sort: 'asc', nulls: 'last' } }, { ordem: 'asc' }],
        take: LIST_SIZE.semResponsavel,
      }),
      this.prisma.atividade.findMany({
        where: upcoming,
        select: {
          id: true,
          titulo: true,
          data: true,
          local: true,
          projeto: PROJECT_REF,
          inscricao: { select: { aberta: true, vagas: true, codigoPublico: true } },
          _count: { select: { inscricoes: true } },
        },
        orderBy: [{ data: 'asc' }, { titulo: 'asc' }],
        take: LIST_SIZE.atividades,
      }),
      this.prisma.instrumento.findMany({
        where: { ativo: true },
        select: {
          id: true,
          numeroProcesso: true,
          orgaoConcedente: true,
          vigenciaInicio: true,
          vigenciaFim: true,
        },
        orderBy: [{ vigenciaFim: 'asc' }, { numeroProcesso: 'asc' }],
        take: LIST_SIZE.vigencias,
      }),
    ]);

    return {
      hoje: today,
      resumo: {
        minhasMetas,
        metasVencendo,
        metasVencidas,
        metasSemResponsavel,
        inscricoesAbertas,
        atividadesProximas,
      },
      prazos: prazos.map((row) => goalRef(row, today)),
      semResponsavel: semResponsavel.map((row) => goalRef(row, today)),
      proximasAtividades: atividades.map((row) => ({
        id: row.id,
        titulo: row.titulo,
        data: isoDate(row.data),
        local: row.local,
        projeto: projectRef(row.projeto),
        inscricao: row.inscricao
          ? {
              aberta: row.inscricao.aberta,
              vagas: row.inscricao.vagas,
              inscritos: row._count.inscricoes,
              linkPublico: `/inscrever/${row.inscricao.codigoPublico}`,
            }
          : null,
      })),
      vigencias: vigencias.map((row) => ({
        id: row.id,
        numeroProcesso: row.numeroProcesso,
        orgaoConcedente: row.orgaoConcedente,
        vigenciaInicio: isoDate(row.vigenciaInicio),
        vigenciaFim: isoDate(row.vigenciaFim),
      })),
    };
  }

  private async accounts(now: Date): Promise<AccountsSummaryResponse> {
    const [ativas, bloqueadas, aguardandoPrimeiroAcesso] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where: { ativo: true } }),
      this.prisma.usuario.count({ where: { ativo: true, bloqueadoAte: { gt: now } } }),
      this.prisma.usuario.count({ where: { ativo: true, deveTrocarSenha: true } }),
    ]);
    return { ativas, bloqueadas, aguardandoPrimeiroAcesso };
  }
}
