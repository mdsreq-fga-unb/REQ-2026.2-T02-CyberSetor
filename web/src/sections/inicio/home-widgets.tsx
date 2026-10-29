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
import type { InstrumentTerm, PanelGoal, UpcomingActivity } from '@/types/painel';
import { formatDate } from '../instrumentos/format';

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
      className="relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-xl bg-linear-to-br from-slate-900 via-slate-800 to-primary p-6 text-white md:p-8"
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-10 size-56 rounded-full bg-white/5 md:size-72"
      />
      <div aria-hidden className="absolute right-24 -bottom-20 size-40 rounded-full bg-white/5" />
      <CalendarCheckIcon
        aria-hidden
        className="absolute right-8 bottom-6 hidden size-24 text-white/15 md:block"
      />
      <div className="relative flex max-w-xl flex-col gap-2">
        <p className="text-sm text-white/70">{subtitle}</p>
        <h1 id="boas-vindas" className="text-2xl font-semibold md:text-3xl">
          Olá, {name}
        </h1>
        <p className="text-sm text-white/80 md:text-base">{summary}</p>
      </div>
      {action && <div className="relative">{action}</div>}
    </section>
  );
}

const TONES = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/20 text-amber-800 dark:text-warning',
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
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-full',
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

function projectHref(goal: { projeto: PanelGoal['projeto'] }): string {
  return paths.dashboard.project(goal.projeto.instrumentoId, goal.projeto.id);
}

/** Prazos das metas: vencidas primeiro, depois as que vencem em até 30 dias (CA-02b.2). */
export function DeadlineList({ goals, hoje }: { goals: PanelGoal[]; hoje: string }) {
  return (
    <ul className="divide-y">
      {goals.map((goal) => (
        <li
          key={goal.metaId}
          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={projectHref(goal)}
              className="font-medium underline-offset-4 hover:underline"
            >
              Meta {goal.ordem} · {goal.objetivo}
            </Link>
            <p className="text-sm text-muted-foreground">
              {goal.projeto.codigo} · {goal.projeto.titulo}
            </p>
            <p className="text-sm">
              {goal.responsavel ? (
                <>Responsável: {goal.responsavel.nome}</>
              ) : (
                <span className="font-medium text-destructive">Sem responsável</span>
              )}
            </p>
          </div>
          {goal.periodoFim && (
            <div className="flex flex-col gap-1 sm:items-end">
              <Badge variant={goal.alerta === 'VENCIDA' ? 'destructive' : 'secondary'}>
                {deadlineText(goal.periodoFim, hoje)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Prazo {formatDate(goal.periodoFim)}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Metas sem responsável (CA-02b.3). */
export function UnownedGoalList({ goals }: { goals: PanelGoal[] }) {
  return (
    <ul className="divide-y">
      {goals.map((goal) => (
        <li key={goal.metaId} className="py-3 first:pt-0 last:pb-0">
          <Link href={projectHref(goal)} className="font-medium underline-offset-4 hover:underline">
            Meta {goal.ordem} · {goal.objetivo}
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
                className="truncate text-sm font-medium underline-offset-4 hover:underline"
              >
                {term.numeroProcesso}
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">
                {left < 0 ? 'Vigência encerrada' : `Faltam ${plural(left, 'dia', 'dias')}`}
              </span>
            </div>
            <Progress
              value={total > 0 ? (elapsed / total) * 100 : 100}
              label={`Vigência decorrida do processo ${term.numeroProcesso}`}
            />
            <p className="truncate text-xs text-muted-foreground">
              {term.orgaoConcedente} · até {formatDate(term.vigenciaFim)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function registrationText(activity: UpcomingActivity): string {
  if (!activity.inscricao) return 'Sem inscrição';
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
                className="font-medium underline-offset-4 hover:underline"
              >
                {activity.titulo}
              </Link>
              <p className="truncate text-sm text-muted-foreground">
                {formatDate(activity.data)} · {activity.local} · {activity.projeto.codigo}
              </p>
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
  activities,
  total,
}: {
  activities: UpcomingActivity[];
  total: number;
}) {
  const [index, setIndex] = useState(0);
  const current = activities[Math.min(index, activities.length - 1)];

  if (!current?.inscricao) {
    return (
      <section
        aria-labelledby="inscricoes-abertas"
        className="flex h-full flex-col justify-center gap-2 rounded-xl border border-dashed p-6"
      >
        <h2 id="inscricoes-abertas" className="font-semibold">
          Inscrições abertas
        </h2>
        <p className="text-sm text-muted-foreground">
          {total > 0
            ? `${plural(total, 'inscrição aberta', 'inscrições abertas')}, nenhuma com atividade nos próximos 30 dias.`
            : 'Nenhuma inscrição aberta. Abra pelo menu da atividade, na página do projeto.'}
        </p>
      </section>
    );
  }

  const { inscricao } = current;
  const link = `${typeof window === 'undefined' ? '' : window.location.origin}${inscricao.linkPublico}`;

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
      className="flex h-full flex-col gap-4 rounded-xl bg-linear-to-br from-primary to-slate-900 p-6 text-white"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="inscricoes-abertas"
          className="text-xs font-semibold tracking-wide text-white/80 uppercase"
        >
          Inscrições abertas
        </h2>
        {activities.length > 1 && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Inscrição anterior"
              onClick={() => setIndex((index - 1 + activities.length) % activities.length)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Próxima inscrição"
              onClick={() => setIndex((index + 1) % activities.length)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
      <div aria-live="polite" className="flex flex-1 flex-col gap-1">
        <p className="sr-only">
          {Math.min(index, activities.length - 1) + 1} de {activities.length}
        </p>
        <p className="text-xl font-semibold">{current.titulo}</p>
        <p className="text-sm text-white/80">
          {formatDate(current.data)} · {current.local}
        </p>
        <p className="mt-3 text-sm">
          {inscricao.inscritos} de {inscricao.vagas} vagas preenchidas
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-white/20" aria-hidden>
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(100, (inscricao.inscritos / inscricao.vagas) * 100)}%` }}
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
            'text-white hover:bg-white/10 hover:text-white',
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
