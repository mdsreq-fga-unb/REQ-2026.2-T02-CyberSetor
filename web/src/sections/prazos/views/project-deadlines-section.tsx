'use client';

import { cn } from 'cn';
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  TargetIcon,
  UserXIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ListEmpty, ListError } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/br';
import { useProjectTimeline } from '@/queries/prazos';
import {
  DeadlineBadge,
  DeadlineList,
  GoalOwner,
  PanelCard,
  SummaryWidget,
  TermList,
} from '@/sections/inicio/home-widgets';
import { REACHES, SITUATIONS } from '@/sections/metas/format';
import type {
  ProjectTimeline,
  RequirementSituation,
  TimelineGoal,
  TimelineRequirement,
} from '@/types/prazos';
import { REQUIREMENT_SITUATIONS } from '../format';
import { attentionGoals, buildTimeline, type TimelineEvent } from '../timeline';

function dotClass(event: TimelineEvent): string {
  if (event.kind === 'hoje') return 'size-3.5 bg-primary ring-4 ring-primary/20';
  if (event.kind === 'marco') return 'size-3 bg-primary';
  if (event.goal.situacao === 'CONCLUIDA') return 'size-3 bg-success';
  if (event.goal.alerta === 'VENCIDA') return 'size-3 bg-destructive';
  if (event.goal.alerta === 'VENCENDO') return 'size-3 bg-warning';
  return 'size-3 bg-muted-foreground';
}

function GoalEvent({ goal, date, hoje }: { goal: TimelineGoal; date: string; hoje: string }) {
  return (
    <>
      <p className="font-medium wrap-break-word">
        Meta {goal.ordem} · {goal.objetivo}
      </p>
      <GoalOwner
        responsavel={goal.responsavel}
        setor={goal.setor}
        concluded={goal.situacao === 'CONCLUIDA'}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Prazo {formatDate(date)} · {SITUATIONS[goal.situacao]}
        </span>
        <DeadlineBadge goal={goal} hoje={hoje} />
        {goal.foraDaVigencia && (
          <Badge className="bg-warning text-warning-foreground">Fora da vigência</Badge>
        )}
        {goal.rascunho && <Badge variant="outline">Rascunho</Badge>}
      </div>
    </>
  );
}

function Milestone({ title, date, current }: { title: string; date: string; current?: boolean }) {
  return (
    <>
      <p className={current ? 'font-semibold text-primary' : 'font-medium'}>{title}</p>
      <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
    </>
  );
}

/** Linha do tempo em lista vertical, que cabe em 360 px (RF07, CA-02b.1). */
function Timeline({ timeline }: { timeline: ProjectTimeline }) {
  const { events, undated } = buildTimeline(timeline);
  return (
    <div className="flex flex-col gap-4">
      <ol>
        {events.map((event, index) => (
          <li
            key={event.id}
            aria-current={event.kind === 'hoje' ? 'date' : undefined}
            className="flex gap-3"
          >
            <div className="flex w-4 shrink-0 flex-col items-center">
              <span aria-hidden className={cn('mt-1.5 shrink-0 rounded-full', dotClass(event))} />
              {index < events.length - 1 && <span aria-hidden className="w-0.5 flex-1 bg-border" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-5">
              {event.kind === 'meta' ? (
                <GoalEvent goal={event.goal} date={event.date} hoje={timeline.hoje} />
              ) : (
                <Milestone
                  title={event.kind === 'hoje' ? 'Hoje' : event.title}
                  date={event.date}
                  current={event.kind === 'hoje'}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
      {undated.length > 0 && (
        <section aria-labelledby="metas-sem-prazo" className="flex flex-col gap-2 border-t pt-4">
          <h3 id="metas-sem-prazo" className="text-sm font-medium">
            Metas sem prazo definido
          </h3>
          <ul className="flex flex-col gap-2">
            {undated.map((goal) => (
              <li key={goal.metaId} className="min-w-0">
                <p className="text-sm wrap-break-word">
                  Meta {goal.ordem} · {goal.objetivo}
                </p>
                <GoalOwner responsavel={goal.responsavel} setor={goal.setor} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RequirementBadge({ situacao }: { situacao: RequirementSituation }) {
  const label = REQUIREMENT_SITUATIONS[situacao];
  if (situacao === 'ATENDIDO') {
    return <Badge className="bg-success text-success-foreground">{label}</Badge>;
  }
  return <Badge variant={situacao === 'PENDENTE' ? 'secondary' : 'outline'}>{label}</Badge>;
}

function linkedGoalText(goal: TimelineRequirement['metas'][number], projectId: string): string {
  return [
    ...(goal.projetoId === projectId ? [] : [goal.projetoCodigo]),
    `Meta ${goal.ordem}`,
    goal.rascunho ? 'Rascunho' : SITUATIONS[goal.situacao],
    ...(goal.alcance ? [REACHES[goal.alcance]] : []),
  ].join(' · ');
}

/** Requisitos do instrumento e as metas que os atendem, de qualquer projeto (RN-01). */
function RequirementList({ timeline }: { timeline: ProjectTimeline }) {
  return (
    <ul className="divide-y">
      {timeline.requisitos.map((requirement) => (
        <li key={requirement.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
          <RequirementBadge situacao={requirement.situacao} />
          <p className="text-sm wrap-break-word">{requirement.descricao}</p>
          {requirement.referencia && (
            <p className="text-xs text-muted-foreground">{requirement.referencia}</p>
          )}
          {requirement.metas.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              {requirement.metas.map((goal) => (
                <li key={goal.metaId} className="wrap-break-word">
                  {linkedGoalText(goal, timeline.projeto.id)}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando os prazos do projeto"
      className="flex flex-col gap-4 lg:gap-6"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <Skeleton className="h-64 lg:col-span-8" />
        <Skeleton className="h-64 lg:col-span-4" />
      </div>
    </div>
  );
}

function Panel({
  timeline,
  createGoal,
  onSelectGoal,
}: {
  timeline: ProjectTimeline;
  createGoal?: ReactNode;
  onSelectGoal?: (metaId: string) => void;
}) {
  const { pendencias, hoje, metas, requisitos, instrumento } = timeline;
  const attended = requisitos.filter((item) => item.situacao === 'ATENDIDO').length;
  const attention = attentionGoals(metas);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <SummaryWidget
          title="Metas vencidas"
          value={pendencias.vencidas}
          caption="Prazo passou sem conclusão"
          icon={AlertTriangleIcon}
          tone="destructive"
        />
        <SummaryWidget
          title="Prazo em até 30 dias"
          value={pendencias.vencendo}
          caption="Metas ainda não concluídas"
          icon={CalendarClockIcon}
          tone="warning"
        />
        <SummaryWidget
          title="Sem responsável"
          value={pendencias.semResponsavel}
          caption="Metas ainda não concluídas"
          icon={UserXIcon}
          tone="warning"
        />
        <SummaryWidget
          title="Requisitos atendidos"
          value={attended}
          caption={
            requisitos.length > 0
              ? `De ${requisitos.length} do instrumento`
              : 'Nenhum requisito cadastrado'
          }
          icon={CheckCircle2Icon}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 lg:gap-6">
          {pendencias.metas === 0 ? (
            <ListEmpty
              icon={TargetIcon}
              title="Nenhuma meta cadastrada"
              description={
                createGoal
                  ? 'Cadastre as metas do projeto para acompanhar os prazos aqui.'
                  : 'Os prazos aparecem aqui depois que a gestão cadastrar as metas do projeto.'
              }
              action={createGoal}
            />
          ) : (
            <PanelCard
              id="prazos-das-metas"
              title="Prazos das metas"
              description="Vencidas, com prazo em até 30 dias ou sem responsável"
              empty={attention.length === 0 ? 'Nenhuma pendência de prazo.' : null}
            >
              <DeadlineList goals={attention} hoje={hoje} onSelect={onSelectGoal} />
            </PanelCard>
          )}
          <PanelCard id="linha-do-tempo" title="Linha do tempo">
            <Timeline timeline={timeline} />
          </PanelCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4 lg:gap-6">
          <PanelCard id="vigencia" title="Vigência do instrumento">
            <TermList terms={[instrumento]} hoje={hoje} />
          </PanelCard>
          <PanelCard
            id="requisitos-do-instrumento"
            title="Requisitos do instrumento"
            description="Atendido: metas vinculadas concluídas e cumpridas"
            empty={
              requisitos.length === 0 ? 'O instrumento ainda não tem requisitos cadastrados.' : null
            }
          >
            <RequirementList timeline={timeline} />
          </PanelCard>
        </div>
      </div>
    </>
  );
}

/** Painel do projeto: prazos, linha do tempo e requisitos atendidos (HU-02b). */
export function ProjectDeadlinesSection({
  projectId,
  createGoal,
  onSelectGoal,
}: {
  projectId: string;
  createGoal?: ReactNode;
  /** Abre a meta escolhida no cartão de pendências. */
  onSelectGoal?: (metaId: string) => void;
}) {
  const timeline = useProjectTimeline(projectId);
  const forbidden = timeline.error instanceof ApiError && timeline.error.status === 403;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <h2 className="text-lg font-semibold">Prazos</h2>
      {timeline.isPending && <Loading />}
      {timeline.isError &&
        (forbidden ? (
          <ListError message="O seu perfil não consulta os prazos deste projeto." />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <ListError message="Não foi possível carregar os prazos do projeto. Recarregue a página ou tente de novo." />
            <Button variant="outline" onClick={() => void timeline.refetch()}>
              Tentar de novo
            </Button>
          </div>
        ))}
      {timeline.data && (
        <Panel timeline={timeline.data} createGoal={createGoal} onSelectGoal={onSelectGoal} />
      )}
    </div>
  );
}
