'use client';

import { cn } from 'cn';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  CalendarCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { paths } from '@/routes/paths';
import type { InstrumentTerm, OpenRegistration, PanelGoal, UpcomingActivity } from '@/types/painel';
import { formatDate } from '@/lib/br';

const DAY = 24 * 60 * 60 * 1000;

/** Dias de `from` até `to`, as duas no formato AAAA-MM-DD, sem passar por fuso. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function deadlineText(periodoFim: string, hoje: string): string {
  const days = daysBetween(hoje, periodoFim);
  if (days < 0) return `Vencida há ${plural(-days, 'dia', 'dias')}`;
  if (days === 0) return 'Vence hoje';
  return `Vence em ${plural(days, 'dia', 'dias')}`;
}

/** Cartão de boas-vindas, com o resumo do dia e a ação principal do perfil. */
export function WelcomeCard({
  name,
  subtitle,
  summary,
  action,
}: {
  name: string;
  subtitle: string;
  summary: string;
  action?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="boas-vindas"
      className="relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-xl bg-linear-to-br from-surface-inverse via-surface-inverse-muted to-primary p-6 text-surface-inverse-foreground md:p-8"
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-10 size-56 rounded-full bg-surface-inverse-foreground/5 md:size-72"
      />
      <div
        aria-hidden
        className="absolute right-24 -bottom-20 size-40 rounded-full bg-surface-inverse-foreground/5"
      />
      <CalendarCheckIcon
        aria-hidden
        className="absolute right-8 bottom-6 hidden size-24 text-surface-inverse-foreground/15 md:block"
      />
      <div className="relative flex max-w-xl flex-col gap-2">
        <p className="text-sm text-surface-inverse-foreground/70">{subtitle}</p>
        <h1 id="boas-vindas" className="text-2xl font-semibold md:text-3xl">
          Olá, {name}
        </h1>
        <p className="text-sm text-surface-inverse-foreground/80 md:text-base">{summary}</p>
      </div>
      {action && <div className="relative">{action}</div>}
    </section>
  );
}

const TONES = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/20 text-warning-strong',
  destructive: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
} as const;

/** Número de destaque com rótulo e ícone, como os cartões de resumo do painel. */
export function SummaryWidget({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
}) {
  return (
    <Card className="flex-row items-center gap-3 p-4 sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="text-sm font-medium text-balance">{title}</h2>
        <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'hidden size-12 shrink-0 items-center justify-center rounded-full sm:flex',
          TONES[tone],
        )}
      >
        <Icon className="size-6" />
      </span>
    </Card>
  );
}

/** Cartão com título, descrição e conteúdo; o estado vazio aparece no lugar da lista. */
export function PanelCard({
  id,
  title,
  description,
  empty,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  empty?: string | null;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card role="region" className={cn('gap-4', className)} aria-labelledby={id}>
      <CardHeader>
        <CardTitle>
          <h2 id={id}>{title}</h2>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">{empty}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/** Item de lista que leva a outra tela: sublinha ao passar e mostra a seta. */
const ITEM_LINK =
  'group/item inline-flex max-w-full items-center gap-1 font-medium underline-offset-4 hover:underline';

function ItemArrow() {
  return (
    <ChevronRightIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/item:translate-x-0.5"
    />
  );
}

function projectHref(projeto: PanelGoal['projeto']): string {
  return `${paths.dashboard.project(projeto.instrumentoId, projeto.id)}#prazos`;
}

/** Responsável e setor da meta; sem responsável, a falta fica em destaque (CA-02b.3). */
export function GoalOwner({
  responsavel,
  setor,
  concluded = false,
}: {
  responsavel: PanelGoal['responsavel'];
  setor?: { nome: string } | null;
  concluded?: boolean;
}) {
  return (
    <p className="text-sm">
      {responsavel ? (
        <>
          Responsável: {responsavel.nome}
          {!responsavel.ativo && (
            <Badge variant="outline" className="ml-2">
              Conta desativada
            </Badge>
          )}
        </>
      ) : (
        <span className={concluded ? 'text-muted-foreground' : 'font-medium text-destructive'}>
          Sem responsável
        </span>
      )}
      {setor && <span className="text-muted-foreground"> · Setor: {setor.nome}</span>}
    </p>
  );
}

/** Selo do prazo: vencida ou dentro da antecedência de aviso (CA-02b.2). */
export function DeadlineBadge({
  goal,
  hoje,
}: {
  goal: Pick<PanelGoal, 'periodoFim' | 'alerta'>;
  hoje: string;
}) {
  if (!goal.periodoFim || !goal.alerta) return null;
  const text = deadlineText(goal.periodoFim, hoje);
  return goal.alerta === 'VENCIDA' ? (
    <Badge variant="destructive">{text}</Badge>
  ) : (
    <Badge className="bg-warning text-warning-foreground">{text}</Badge>
  );
}

type DeadlineGoal = Omit<PanelGoal, 'projeto'> & {
  projeto?: PanelGoal['projeto'];
  setor?: { nome: string } | null;
};

/**
 * Prazos das metas: vencidas primeiro, depois as que vencem em até 30 dias (CA-02b.2). Na tela
 * inicial, a meta leva ao projeto; dentro do projeto, `onSelect` abre a própria meta.
 */
export function DeadlineList({
  goals,
  hoje,
  onSelect,
}: {
  goals: DeadlineGoal[];
  hoje: string;
  onSelect?: (metaId: string) => void;
}) {
  return (
    <ul className="divide-y">
      {goals.map((goal) => {
        const title = `Meta ${goal.ordem} · ${goal.objetivo}`;
        return (
          <li
            key={goal.metaId}
            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              {goal.projeto ? (
                <>
                  <Link href={projectHref(goal.projeto)} className={ITEM_LINK}>
                    {title}
                    <ItemArrow />
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {goal.projeto.codigo} · {goal.projeto.titulo}
                  </p>
                </>
              ) : onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(goal.metaId)}
                  className={cn(
                    ITEM_LINK,
                    'text-left focus-visible:underline focus-visible:outline-none',
                  )}
                >
                  {title}
                  <ItemArrow />
                </button>
              ) : (
                <p className="font-medium">{title}</p>
              )}
              <GoalOwner responsavel={goal.responsavel} setor={goal.setor} />
            </div>
            {goal.periodoFim && (
              <div className="flex flex-col gap-1 sm:items-end">
                <DeadlineBadge goal={goal} hoje={hoje} />
                <span className="text-xs text-muted-foreground">
                  Prazo {formatDate(goal.periodoFim)}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Metas sem responsável (CA-02b.3). */
export function UnownedGoalList({ goals }: { goals: PanelGoal[] }) {
  return (
    <ul className="divide-y">
      {goals.map((goal) => (
        <li key={goal.metaId} className="py-3 first:pt-0 last:pb-0">
          <Link href={projectHref(goal.projeto)} className={ITEM_LINK}>
            Meta {goal.ordem} · {goal.objetivo}
            <ItemArrow />
          </Link>
          <p className="text-sm text-muted-foreground">
            {goal.projeto.codigo}
            {goal.periodoFim && ` · prazo ${formatDate(goal.periodoFim)}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Progress({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="h-2 overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** Vigência dos instrumentos ativos, do fim mais próximo (CA-02b.1). */
export function TermList({ terms, hoje }: { terms: InstrumentTerm[]; hoje: string }) {
  return (
    <ul className="flex flex-col gap-4">
      {terms.map((term) => {
        const total = daysBetween(term.vigenciaInicio, term.vigenciaFim);
        const elapsed = daysBetween(term.vigenciaInicio, hoje);
        const left = daysBetween(hoje, term.vigenciaFim);
        return (
          <li key={term.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Link
                href={paths.dashboard.instrument(term.id)}
                className={cn(ITEM_LINK, 'min-w-0 text-sm')}
              >
                <span className="truncate">{term.numeroProcesso}</span>
                <ItemArrow />
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">
                {left < 0 ? 'Vigência encerrada' : `Faltam ${plural(left, 'dia', 'dias')}`}
              </span>
            </div>
            <Progress
              value={total > 0 ? (elapsed / total) * 100 : 100}
              label={`Vigência decorrida do processo ${term.numeroProcesso}`}
            />
            <p className="truncate text-xs text-muted-foreground">{term.orgaoConcedente}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(term.vigenciaInicio)} a {formatDate(term.vigenciaFim)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function registrationText(activity: UpcomingActivity): string {
  if (!activity.inscricao) return 'Inscrição não aberta';
  const { aberta, inscritos, vagas } = activity.inscricao;
  return `${aberta ? 'Inscrição aberta' : 'Inscrição encerrada'} · ${inscritos} de ${vagas}`;
}

/** Atividades dos próximos 30 dias, com a situação da inscrição. */
export function UpcomingActivityList({ activities }: { activities: UpcomingActivity[] }) {
  return (
    <ul className="divide-y">
      {activities.map((activity) => {
        const [, month, day] = activity.data.split('-');
        return (
          <li key={activity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div
              aria-hidden
              className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            >
              <span className="text-lg leading-none font-semibold">{day}</span>
              <span className="text-xs">{MONTHS[Number(month) - 1]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={paths.dashboard.project(activity.projeto.instrumentoId, activity.projeto.id)}
                className={ITEM_LINK}
              >
                {activity.titulo}
                <ItemArrow />
              </Link>
              <p className="truncate text-sm text-muted-foreground">
                {formatDate(activity.data)} · {activity.local} · {activity.projeto.codigo}
              </p>
              <p className="text-sm sm:hidden">{registrationText(activity)}</p>
            </div>
            <Badge
              variant={activity.inscricao?.aberta ? 'default' : 'outline'}
              className="hidden sm:inline-flex"
            >
              {registrationText(activity)}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

/** Inscrições abertas em destaque, uma de cada vez, com o link para divulgar. */
export function OpenRegistrations({
  registrations,
  total,
  canOpen,
}: {
  registrations: OpenRegistration[];
  total: number;
  canOpen: boolean;
}) {
  const [index, setIndex] = useState(0);
  const position = Math.min(index, registrations.length - 1);
  const current = registrations[position];

  if (!current) {
    return (
      <section
        aria-labelledby="inscricoes-abertas"
        className="flex h-full flex-col justify-center gap-2 rounded-xl border border-dashed p-6"
      >
        <h2 id="inscricoes-abertas" className="font-semibold">
          Inscrições abertas
        </h2>
        <p className="text-sm text-muted-foreground">
          {canOpen
            ? 'Nenhuma inscrição aberta. Abra pela lista de atividades, na página do projeto.'
            : 'Nenhuma inscrição aberta no momento.'}
        </p>
        {canOpen && (
          <Link
            href={paths.dashboard.instruments}
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 self-start')}
          >
            Ver projetos
          </Link>
        )}
      </section>
    );
  }

  const link = `${typeof window === 'undefined' ? '' : window.location.origin}${current.linkPublico}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast.add({ type: 'success', title: 'Link copiado', description: current.titulo });
    } catch {
      toast.add({ type: 'error', title: 'Não foi possível copiar', description: link });
    }
  }

  return (
    <section
      aria-labelledby="inscricoes-abertas"
      aria-roledescription="carrossel"
      className="flex h-full flex-col gap-4 rounded-xl bg-linear-to-br from-primary to-surface-inverse p-6 text-surface-inverse-foreground"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="inscricoes-abertas"
          className="text-xs font-semibold tracking-wide text-surface-inverse-foreground/80 uppercase"
        >
          Inscrições abertas
          {total > 1 && ` · ${position + 1} de ${total}`}
        </h2>
        {registrations.length > 1 && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-surface-inverse-foreground hover:bg-surface-inverse-foreground/10 hover:text-surface-inverse-foreground"
              aria-label="Inscrição anterior"
              onClick={() => setIndex((position - 1 + registrations.length) % registrations.length)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-surface-inverse-foreground hover:bg-surface-inverse-foreground/10 hover:text-surface-inverse-foreground"
              aria-label="Próxima inscrição"
              onClick={() => setIndex((position + 1) % registrations.length)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`${position + 1} de ${registrations.length}`}
        aria-live="polite"
        className="flex flex-1 flex-col gap-1"
      >
        <p className="text-xl font-semibold">{current.titulo}</p>
        <p className="text-sm text-surface-inverse-foreground/80">
          {formatDate(current.data)} · {current.local}
        </p>
        <p className="mt-3 text-sm">
          {current.inscritos} de {current.vagas} vagas preenchidas
        </p>
        <div
          className="h-2 overflow-hidden rounded-full bg-surface-inverse-foreground/20"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-surface-inverse-foreground"
            style={{ width: `${Math.min(100, (current.inscritos / current.vagas) * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={copy}>
          <CopyIcon data-icon="inline-start" />
          Copiar link
        </Button>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'text-surface-inverse-foreground hover:bg-surface-inverse-foreground/10 hover:text-surface-inverse-foreground',
          )}
        >
          <ExternalLinkIcon data-icon="inline-start" />
          Abrir formulário
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
    </section>
  );
}
