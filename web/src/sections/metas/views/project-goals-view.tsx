'use client';

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ClockIcon,
  ListFilterIcon,
  PlusIcon,
  TargetIcon,
  UserXIcon,
} from 'lucide-react';
import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu, type RowAction } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { useDialogState } from '@/hooks/use-dialog-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStoredChoice } from '@/hooks/use-stored-choice';
import { ApiError } from '@/lib/api';
import { useInstrument } from '@/queries/instrumentos';
import { useGoals } from '@/queries/metas';
import { useProject } from '@/queries/projetos';
import { useRequirements } from '@/queries/requisitos';
import { useCurrentUser } from '@/queries/sessao';
import { paths } from '@/routes/paths';
import { ProjectActivitiesSection } from '@/sections/atividades/views/project-activities-section';
import type { Goal } from '@/types/metas';
import type { Project } from '@/types/projetos';
import { INSTRUMENT_TYPES, formatDate } from '../../instrumentos/format';
import {
  DEADLINE_ALERTS,
  SITUATIONS,
  SITUATION_ORDER,
  missingText,
  requirementLabel,
} from '../format';
import {
  FILTER_LABELS,
  GOAL_FILTERS,
  defaultFilter,
  filtersFor,
  matches,
  type GoalFilter,
} from '../goal-filters';
import { GoalFormDialog } from '../goal-form-dialog';
import { GoalSituationDialog } from '../goal-situation-dialog';

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta projetos nem metas.';
  }
  if (error instanceof ApiError && error.status === 404) return 'Projeto não encontrado.';
  return 'Não foi possível carregar o projeto. Tente de novo.';
}

function period(start: string | null, end: string | null): string {
  if (!start && !end) return 'Período a definir';
  return `${start ? formatDate(start) : '…'} a ${end ? formatDate(end) : '…'}`;
}

function measure(goal: Goal): string | null {
  return [goal.parametroPlanejado, goal.unidade].filter(Boolean).join(' ') || null;
}

function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-1 text-muted-foreground">
      <span className="flex flex-wrap items-center gap-2">
        Coordenação {project.coordenador.nome}
        {!project.coordenador.ativo && <Badge variant="outline">Conta desativada</Badge>}
      </span>
      <span>
        Execução {formatDate(project.inicio)} a {formatDate(project.fim)}
      </span>
    </div>
  );
}

function DeadlineBadge({ goal }: { goal: Goal }) {
  if (!goal.alertaPrazo) return null;
  const overdue = goal.alertaPrazo === 'VENCIDA';
  const Icon = overdue ? AlertTriangleIcon : ClockIcon;
  return (
    <Badge variant={overdue ? 'destructive' : 'outline'}>
      <Icon data-icon="inline-start" />
      {DEADLINE_ALERTS[goal.alertaPrazo]}
    </Badge>
  );
}

function Deadline({ goal }: { goal: Goal }) {
  return (
    <span className="flex flex-col items-start gap-1">
      <span>{period(goal.periodoInicio, goal.periodoFim)}</span>
      <DeadlineBadge goal={goal} />
    </span>
  );
}

function Owner({ goal }: { goal: Goal }) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-muted-foreground">
      {goal.responsavel ? (
        `Responsável: ${goal.responsavel.nome}`
      ) : (
        <Badge variant="outline">
          <UserXIcon data-icon="inline-start" />
          Sem responsável
        </Badge>
      )}
      {goal.responsavel && !goal.responsavel.ativo && (
        <Badge variant="outline">Conta desativada</Badge>
      )}
      {goal.setor && <span>Setor: {goal.setor.nome}</span>}
    </span>
  );
}

const VIEWS = ['LISTA', 'QUADRO'] as const;

function GoalsBoard({
  goals,
  actionsFor,
}: {
  goals: Goal[];
  actionsFor: (goal: Goal) => RowAction[];
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SITUATION_ORDER.map((situacao) => {
        const column = goals.filter((goal) => goal.situacao === situacao);
        return (
          <section
            key={situacao}
            aria-labelledby={`coluna-${situacao}`}
            className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3"
          >
            <h3 id={`coluna-${situacao}`} className="px-1 font-semibold">
              {SITUATIONS[situacao]} ({column.length})
            </h3>
            {column.length === 0 ? (
              <p className="px-1 text-sm text-muted-foreground">Nenhuma meta.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {column.map((goal) => (
                  <li
                    key={goal.id}
                    className="flex items-start justify-between gap-2 rounded-lg border bg-background p-3 text-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">
                        {goal.ordem} · {goal.objetivo}
                      </span>
                      <Owner goal={goal} />
                      <span className="text-muted-foreground">
                        <Deadline goal={goal} />
                      </span>
                      {goal.rascunho && (
                        <Badge variant="outline" className="self-start">
                          Rascunho
                        </Badge>
                      )}
                    </div>
                    {actionsFor(goal).length > 0 && (
                      <RowActionsMenu
                        label={`Ações da meta ${goal.ordem}`}
                        actions={actionsFor(goal)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function bySituation(a: Goal, b: Goal): number {
  return (
    SITUATION_ORDER.indexOf(a.situacao) - SITUATION_ORDER.indexOf(b.situacao) || a.ordem - b.ordem
  );
}

function GoalSummary({ goal }: { goal: Goal }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">
        {goal.ordem} · {goal.objetivo}
      </span>
      <span>{goal.descricao}</span>
      <span className="text-muted-foreground">
        Requisitos: {goal.requisitos.map(requirementLabel).join(' · ')}
      </span>
      <Owner goal={goal} />
      {goal.rascunho && (
        <span className="flex flex-col items-start gap-1">
          <Badge variant="outline">Rascunho</Badge>
          <span className="text-muted-foreground">{missingText(goal.camposFaltantes)}</span>
        </span>
      )}
      <span className="text-muted-foreground md:hidden">{goal.indicador ?? 'Sem indicador'}</span>
      {measure(goal) && <span className="text-muted-foreground md:hidden">{measure(goal)}</span>}
      <span className="text-muted-foreground md:hidden">
        <Deadline goal={goal} />
      </span>
    </div>
  );
}

export function ProjectGoalsView({
  instrumentId,
  projectId,
}: {
  instrumentId: string;
  projectId: string;
}) {
  const { session } = useSession();
  const instrument = useInstrument(instrumentId);
  const project = useProject(projectId);
  const requirements = useRequirements(instrumentId);
  const goals = useGoals(projectId);
  const me = useCurrentUser();
  const viewer = me.data ?? null;
  const [storedFilter, chooseFilter] = useStoredChoice<GoalFilter>(
    `cybersetor-metas-filtro-${viewer?.usuarioId ?? ''}`,
    viewer ? filtersFor(viewer) : GOAL_FILTERS,
  );
  const [storedView, chooseView] = useStoredChoice('cybersetor-metas-visao', VIEWS);
  const mobile = useIsMobile();
  const standard = viewer ? defaultFilter(viewer) : 'TODAS';
  const filter = storedFilter ?? standard;
  const board = !mobile && storedView === 'QUADRO';
  const sorted = useMemo(
    () =>
      goals.data &&
      goals.data.filter((goal) => !viewer || matches(goal, filter, viewer)).sort(bySituation),
    [goals.data, filter, viewer],
  );
  const pagination = usePagination(sorted);
  const form = useDialogState<{ goal: Goal | null }>();
  const situation = useDialogState<{ goal: Goal }>();
  const manager = session?.perfil === 'PRESIDENCIA_GESTAO';
  const active = instrument.data?.ativo === true;
  const canEdit = manager && active && requirements.data !== undefined;
  const canChange = (goal: Goal) =>
    active && (manager || (!!me.data && me.data.usuarioId === goal.responsavel?.id));
  const actionsFor = (goal: Goal): RowAction[] => [
    ...(canEdit ? [{ label: 'Editar meta', onSelect: () => form.show({ goal }) }] : []),
    ...(canChange(goal)
      ? [{ label: 'Mudar situação', onSelect: () => situation.show({ goal }) }]
      : []),
  ];
  const withActions = canEdit || !!sorted?.some(canChange);
  const columns = withActions ? 4 : 3;
  const countOf = (situacao: Goal['situacao']) =>
    sorted?.filter((goal) => goal.situacao === situacao).length ?? 0;
  const withoutRequirements = requirements.data?.length === 0;

  const back = (
    <Link
      href={paths.dashboard.instrument(instrumentId)}
      className="flex min-h-12 items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
    >
      <ArrowLeftIcon className="size-4 shrink-0" />
      {instrument.data
        ? `${INSTRUMENT_TYPES[instrument.data.tipo]} · ${instrument.data.orgaoConcedente}`
        : 'Instrumento'}
    </Link>
  );

  const misplaced = project.data && project.data.instrumentoId !== instrumentId;
  if ((project.error && !project.data) || misplaced) {
    return (
      <>
        {back}
        <ListError message={misplaced ? 'Projeto não encontrado.' : loadFailure(project.error)} />
      </>
    );
  }

  const createButton = canEdit && (
    <Button onClick={() => form.show({ goal: null })} disabled={!requirements.data?.length}>
      <PlusIcon data-icon="inline-start" />
      Nova meta
    </Button>
  );

  return (
    <>
      {back}
      {project.data ? (
        <div className="flex flex-col gap-3">
          <PageHeader
            title={`${project.data.codigo} · ${project.data.titulo}`}
            action={createButton}
          />
          <ProjectSummary project={project.data} />
        </div>
      ) : (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      )}

      {instrument.data && !instrument.data.ativo && (
        <p className="text-muted-foreground">Instrumento inativo: não recebe nem altera metas.</p>
      )}
      {manager && (instrument.error || requirements.error) && (
        <p role="alert" className="text-destructive">
          Não foi possível carregar o instrumento e os requisitos dele; o cadastro e a edição de
          metas ficam indisponíveis. Recarregue a página.
        </p>
      )}
      {canEdit && withoutRequirements && (
        <p className="text-muted-foreground">
          Cadastre os requisitos do instrumento antes das metas, na{' '}
          <Link
            href={paths.dashboard.instrument(instrumentId)}
            className="text-foreground underline underline-offset-4"
          >
            página do instrumento
          </Link>
          .
        </p>
      )}

      <h2 className="text-lg font-semibold">Metas</h2>
      {viewer && !!goals.data?.length && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filtro das metas" className="flex flex-wrap gap-2">
            {filtersFor(viewer).map((option) => (
              <Button
                key={option}
                variant={option === filter ? 'default' : 'outline'}
                aria-pressed={option === filter}
                onClick={() => chooseFilter(option === standard ? null : option)}
              >
                {FILTER_LABELS[option]}
              </Button>
            ))}
          </div>
          {!mobile && (
            <div role="group" aria-label="Visão das metas" className="flex gap-2">
              {VIEWS.map((option) => (
                <Button
                  key={option}
                  variant={(option === 'QUADRO') === board ? 'secondary' : 'ghost'}
                  aria-pressed={(option === 'QUADRO') === board}
                  onClick={() => chooseView(option === 'LISTA' ? null : option)}
                >
                  {option === 'LISTA' ? 'Lista' : 'Quadro'}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      {goals.error && !goals.data ? (
        <ListError message="Não foi possível carregar as metas. Tente de novo." />
      ) : goals.data?.length === 0 ? (
        <ListEmpty
          icon={TargetIcon}
          title="Nenhuma meta neste projeto"
          description="Cadastre cada meta do plano de trabalho com o indicador, o período e a forma de comprovação."
          action={(!withoutRequirements && createButton) || undefined}
        />
      ) : sorted?.length === 0 ? (
        <ListEmpty
          icon={ListFilterIcon}
          title="Nenhuma meta neste filtro"
          description={`O filtro "${FILTER_LABELS[filter]}" não tem metas neste projeto.`}
          action={
            <Button variant="outline" onClick={() => chooseFilter('TODAS')}>
              Ver todas as metas
            </Button>
          }
        />
      ) : board && sorted ? (
        <GoalsBoard goals={sorted} actionsFor={actionsFor} />
      ) : (
        <ListCard>
          <Table aria-busy={goals.isPending}>
            <TableCaption className="sr-only">
              Metas do projeto {project.data?.codigo ?? ''}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Meta
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Indicador
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Período e prazo
                </TableHead>
                {withActions && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.isPending ? (
                <TableSkeleton columns={columns} />
              ) : (
                pagination.pageRows.map((goal, index) => (
                  <Fragment key={goal.id}>
                    {pagination.pageRows[index - 1]?.situacao !== goal.situacao && (
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead
                          scope="colgroup"
                          colSpan={columns}
                          className="px-4 font-semibold"
                        >
                          {SITUATIONS[goal.situacao]} ({countOf(goal.situacao)})
                        </TableHead>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="px-4 py-3 whitespace-normal">
                        <GoalSummary goal={goal} />
                      </TableCell>
                      <TableCell className="hidden whitespace-normal md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span>{goal.indicador ?? '—'}</span>
                          {measure(goal) && (
                            <span className="text-muted-foreground">{measure(goal)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Deadline goal={goal} />
                      </TableCell>
                      {withActions && (
                        <TableCell className="px-4 text-right">
                          {actionsFor(goal).length > 0 && (
                            <RowActionsMenu
                              label={`Ações da meta ${goal.ordem}`}
                              actions={actionsFor(goal)}
                            />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação das metas" />
        </ListCard>
      )}

      {instrument.data && project.data && (
        <ProjectActivitiesSection instrument={instrument.data} project={project.data} />
      )}

      {requirements.data && project.data && (
        <GoalFormDialog
          open={form.open}
          projectId={projectId}
          execution={project.data}
          requirements={requirements.data}
          goal={form.value?.goal ?? null}
          onClose={form.close}
          onSaved={(goal) => toast.add({ type: 'success', title: `Meta ${goal.ordem} salva` })}
        />
      )}
      <GoalSituationDialog
        open={situation.open}
        projectId={projectId}
        goal={situation.value?.goal ?? null}
        onClose={situation.close}
        onChanged={(goal) =>
          toast.add({
            type: 'success',
            title: `Meta ${goal.ordem}: ${SITUATIONS[goal.situacao].toLowerCase()}`,
          })
        }
        onConflict={(goal) =>
          toast.add({
            type: 'error',
            title: `Outra pessoa alterou a meta ${goal.ordem}`,
            description: 'A lista foi atualizada. Confira a situação e tente de novo.',
          })
        }
      />
    </>
  );
}
