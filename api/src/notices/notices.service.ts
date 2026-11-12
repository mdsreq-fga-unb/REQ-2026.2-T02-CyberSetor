import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { EMAIL_SENDER, EmailDeliveryError, type EmailSender } from '../email/email-sender.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  Perfil,
  SituacaoAvisoEmail,
  SituacaoMeta,
  TipoAvisoEmail,
} from '../generated/prisma/enums.js';
import {
  addDays,
  deadlineAlert,
  DEADLINE_WARNING_DAYS,
  todayInBrasilia,
} from '../goals/goal-deadline.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ReportPendencia } from '../reports/report-finalization.js';
import {
  blockedReportEmail,
  goalDigestEmail,
  type GoalDigest,
  type GoalLine,
  type RenderedEmail,
} from './notice-templates.js';

const MAX_ATTEMPTS = 3;
/** Aviso ainda pendente depois disso ficou de uma corrida interrompida: volta como a falha. */
const STALE_PENDING_MS = 60 * 60 * 1000;
const READERS: readonly Perfil[] = INSTRUMENT_READERS;

const RECIPIENT = {
  select: { id: true, ativo: true, perfil: true, emailLogin: true },
} satisfies Prisma.UsuarioDefaultArgs;

const PROJECT = {
  select: { id: true, codigo: true, titulo: true, instrumentoId: true, coordenador: RECIPIENT },
} satisfies Prisma.ProjetoDefaultArgs;

const GOAL = {
  id: true,
  ordem: true,
  periodoFim: true,
  situacao: true,
  responsavel: RECIPIENT,
  projeto: PROJECT,
} satisfies Prisma.MetaSelect;

type Recipient = Prisma.UsuarioGetPayload<typeof RECIPIENT>;
type GoalRow = Prisma.MetaGetPayload<{ select: typeof GOAL }>;
type ProjectRow = Prisma.ProjetoGetPayload<typeof PROJECT>;

interface NoticeItem {
  chave: string;
  tipo: TipoAvisoEmail;
  usuario: Recipient;
  projetoId: string;
  metaId: string | null;
}

interface DigestItem extends NoticeItem {
  linha: GoalLine;
}

export interface NoticeRunSummary {
  avisos: number;
}

export interface BlockedReport {
  projetoId: string;
  from: string;
  to: string;
  pendencias: readonly ReportPendencia[];
  /** Quem tentou finalizar já viu a recusa na tela e não recebe o e-mail. */
  autorId: string;
}

const PENDENCY_LABEL: Record<ReportPendencia['motivo'], string> = {
  SEM_RESULTADO_REGISTRADO: 'sem resultado registrado',
  SEM_JUSTIFICATIVA: 'sem justificativa',
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateOf(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function brazilianDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function active(...people: (Recipient | null)[]): Recipient[] {
  const unique = new Map<string, Recipient>();
  for (const person of people) {
    // Conta mudada para perfil sem acesso às metas deixa de receber (RNF04).
    if (person?.ativo && READERS.includes(person.perfil)) unique.set(person.id, person);
  }
  return [...unique.values()];
}

function goalLabel(goal: Pick<GoalRow, 'ordem' | 'projeto'>): string {
  return `${goal.projeto.codigo}, meta ${goal.ordem}`;
}

function linesOf(items: DigestItem[], tipo: TipoAvisoEmail): GoalLine[] {
  return items.filter((item) => item.tipo === tipo).map((item) => item.linha);
}

function digestOf(items: DigestItem[]): GoalDigest {
  return {
    avisos: linesOf(items, TipoAvisoEmail.ADICIONAL),
    vencidas: linesOf(items, TipoAvisoEmail.VENCIDA),
    vencendo: linesOf(items, TipoAvisoEmail.VENCIMENTO),
    semResponsavel: linesOf(items, TipoAvisoEmail.SEM_RESPONSAVEL),
  };
}

@Injectable()
export class NoticesService {
  private readonly logger = new Logger(NoticesService.name);
  private readonly webUrl: string | null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_SENDER) private readonly email: EmailSender,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.webUrl = config.get('APP_WEB_URL', { infer: true })?.replace(/\/+$/, '') ?? null;
  }

  /** Um resumo por pessoa e por dia, com tudo o que é novo para ela. */
  async runDaily(now: Date = new Date()): Promise<NoticeRunSummary> {
    const today = todayInBrasilia(now);
    const items = [...(await this.additionalItems(today)), ...(await this.goalItems(today))];

    const byPerson = new Map<string, DigestItem[]>();
    for (const item of items) {
      byPerson.set(item.usuario.id, [...(byPerson.get(item.usuario.id) ?? []), item]);
    }
    for (const personItems of byPerson.values()) {
      await this.deliver(personItems, 'RESUMO_METAS', (pending) =>
        goalDigestEmail(digestOf(pending)),
      );
    }
    return { avisos: items.length };
  }

  /** Nunca lança: a recusa da finalização não depende do aviso. */
  async reportBlocked(report: BlockedReport, now: Date = new Date()): Promise<void> {
    try {
      const today = todayInBrasilia(now);
      const project = await this.prisma.projeto.findUniqueOrThrow({
        where: { id: report.projetoId },
        select: PROJECT.select,
      });
      const people = await this.coordination(project);
      for (const usuario of people.filter((person) => person.id !== report.autorId)) {
        const item: NoticeItem = {
          chave: `TRAVA_RELATORIO:${project.id}:${report.from}:${report.to}:${today}:${usuario.id}`,
          tipo: TipoAvisoEmail.TRAVA_RELATORIO,
          usuario,
          projetoId: project.id,
          metaId: null,
        };
        await this.deliver([item], TipoAvisoEmail.TRAVA_RELATORIO, () =>
          blockedReportEmail({
            projeto: project.codigo,
            periodo: `${brazilianDate(report.from)} a ${brazilianDate(report.to)}`,
            pendencias: report.pendencias.map(
              ({ ordem, motivo }) => `Meta ${ordem}: ${PENDENCY_LABEL[motivo]}.`,
            ),
            url: this.projectUrl(project, 'relatorios'),
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Aviso da trava do relatório não registrado: ${String(error)}`);
    }
  }

  private projectUrl(project: ProjectRow, tab: 'prazos' | 'relatorios'): string | null {
    if (!this.webUrl) return null;
    return `${this.webUrl}/instrumentos/${project.instrumentoId}/projetos/${project.id}#${tab}`;
  }

  private async goalItems(today: string): Promise<DigestItem[]> {
    const goals = await this.prisma.meta.findMany({
      where: {
        situacao: { not: SituacaoMeta.CONCLUIDA },
        projeto: { instrumento: { ativo: true } },
        OR: [
          { responsavelId: null },
          { periodoFim: { lte: dateOf(addDays(today, DEADLINE_WARNING_DAYS)) } },
        ],
      },
      select: GOAL,
      orderBy: [{ periodoFim: 'asc' }, { ordem: 'asc' }],
    });
    const leadership = await this.leadership();
    return goals.flatMap((goal) => [
      ...this.deadlineItems(goal, today),
      ...(goal.responsavel ? [] : this.unownedItems(goal, leadership)),
    ]);
  }

  private deadlineItems(goal: GoalRow, today: string): DigestItem[] {
    const prazo = goal.periodoFim && isoDate(goal.periodoFim);
    const alert = deadlineAlert(prazo, goal.situacao, today);
    if (!alert || !prazo) return [];
    const tipo = alert === 'VENCIDA' ? TipoAvisoEmail.VENCIDA : TipoAvisoEmail.VENCIMENTO;
    const verbo = tipo === TipoAvisoEmail.VENCIDA ? 'venceu em' : 'vence em';
    const linha = {
      texto: `${goalLabel(goal)}, ${verbo} ${brazilianDate(prazo)}`,
      url: this.projectUrl(goal.projeto, 'prazos'),
    };
    return active(goal.responsavel, goal.projeto.coordenador).map((usuario) => ({
      linha,
      chave: `${tipo}:${goal.id}:${prazo}:${usuario.id}`,
      tipo,
      usuario,
      projetoId: goal.projeto.id,
      metaId: goal.id,
    }));
  }

  private unownedItems(goal: GoalRow, leadership: Recipient[]): DigestItem[] {
    const linha = {
      texto: goalLabel(goal),
      url: this.projectUrl(goal.projeto, 'prazos'),
    };
    return active(goal.projeto.coordenador, ...leadership).map((usuario) => ({
      linha,
      chave: `${TipoAvisoEmail.SEM_RESPONSAVEL}:${goal.id}:${usuario.id}`,
      tipo: TipoAvisoEmail.SEM_RESPONSAVEL,
      usuario,
      projetoId: goal.projeto.id,
      metaId: goal.id,
    }));
  }

  private async additionalItems(today: string): Promise<DigestItem[]> {
    const rows = await this.prisma.avisoMeta.findMany({
      where: {
        dataAviso: { lte: dateOf(today) },
        meta: {
          situacao: { not: SituacaoMeta.CONCLUIDA },
          projeto: { instrumento: { ativo: true } },
        },
      },
      select: { id: true, mensagem: true, meta: { select: GOAL } },
    });
    return rows.flatMap(({ id, mensagem, meta }) =>
      active(meta.responsavel, meta.projeto.coordenador).map((usuario) => ({
        linha: {
          texto: `${goalLabel(meta)}: ${mensagem}`,
          url: this.projectUrl(meta.projeto, 'prazos'),
        },
        chave: `${TipoAvisoEmail.ADICIONAL}:${id}:${usuario.id}`,
        tipo: TipoAvisoEmail.ADICIONAL,
        usuario,
        projetoId: meta.projeto.id,
        metaId: meta.id,
      })),
    );
  }

  private leadership(): Promise<Recipient[]> {
    return this.prisma.usuario.findMany({
      where: { ativo: true, perfil: Perfil.PRESIDENCIA_GESTAO },
      select: RECIPIENT.select,
      orderBy: { id: 'asc' },
    });
  }

  private async coordination(project: ProjectRow): Promise<Recipient[]> {
    return active(project.coordenador, ...(await this.leadership()));
  }

  /**
   * Só um envio por chave; falha definida volta na corrida seguinte, até o limite. Pendente antigo
   * (a corrida parou antes de registrar o resultado) também volta, para o aviso não se perder.
   */
  private async claim(item: NoticeItem): Promise<string | null> {
    const { chave, tipo, usuario, projetoId, metaId } = item;
    try {
      const { id } = await this.prisma.avisoEmail.create({
        data: { chave, tipo, usuarioId: usuario.id, projetoId, metaId },
        select: { id: true },
      });
      return id;
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
        throw error;
      }
    }
    const { count } = await this.prisma.avisoEmail.updateMany({
      where: {
        chave,
        tentativas: { lt: MAX_ATTEMPTS },
        OR: [
          { situacao: SituacaoAvisoEmail.FALHOU },
          {
            situacao: SituacaoAvisoEmail.PENDENTE,
            atualizadoEm: { lt: new Date(Date.now() - STALE_PENDING_MS) },
          },
        ],
      },
      data: { situacao: SituacaoAvisoEmail.PENDENTE, tentativas: { increment: 1 } },
    });
    if (count === 0) return null;
    const { id } = await this.prisma.avisoEmail.findUniqueOrThrow({
      where: { chave },
      select: { id: true },
    });
    return id;
  }

  /** Nunca lança: a falha de um e-mail não interrompe os demais. */
  private async deliver<T extends NoticeItem>(
    items: T[],
    tag: string,
    render: (pending: T[]) => RenderedEmail,
  ): Promise<void> {
    try {
      const claimed: { id: string; item: T }[] = [];
      for (const item of items) {
        const id = await this.claim(item);
        if (id) claimed.push({ id, item });
      }
      if (claimed.length === 0) return;
      await this.send(
        claimed.map(({ id }) => id),
        items[0].usuario,
        tag,
        render(claimed.map(({ item }) => item)),
      );
    } catch (error) {
      this.logger.error(`E-mail ${tag} não processado: ${String(error)}`);
    }
  }

  private async send(
    ids: string[],
    usuario: Recipient,
    tag: string,
    email: RenderedEmail,
  ): Promise<void> {
    if (!this.email.accepts(usuario.emailLogin)) {
      await this.finish(ids, SituacaoAvisoEmail.BLOQUEADO);
      return;
    }
    try {
      const { messageId } = await this.email.send({
        ...email,
        to: usuario.emailLogin,
        tag,
      });
      await this.finish(ids, SituacaoAvisoEmail.ENVIADO, { messageId });
    } catch (error) {
      const uncertain = !(error instanceof EmailDeliveryError) || error.uncertain;
      const code = error instanceof EmailDeliveryError ? error.code : 'ERRO_INESPERADO';
      this.logger.warn(`E-mail ${tag} não enviado: ${code}`);
      await this.finish(ids, uncertain ? SituacaoAvisoEmail.INCERTO : SituacaoAvisoEmail.FALHOU, {
        erro: code,
      });
    }
  }

  private async finish(
    ids: string[],
    situacao: SituacaoAvisoEmail,
    data: { messageId?: string; erro?: string } = {},
  ): Promise<void> {
    await this.prisma.avisoEmail.updateMany({
      where: { id: { in: ids } },
      data: { situacao, ...data },
    });
  }
}
