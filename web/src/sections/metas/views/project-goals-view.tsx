'use client';

import { ArrowLeftIcon, PlusIcon, TargetIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
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
import { ApiError } from '@/lib/api';
import { useInstrument } from '@/queries/instrumentos';
import { useGoals } from '@/queries/metas';
import { useProject } from '@/queries/projetos';
import { useRequirements } from '@/queries/requisitos';
import { paths } from '@/routes/paths';
import type { Goal } from '@/types/metas';
import type { Project } from '@/types/projetos';
import { INSTRUMENT_TYPES, formatDate } from '../../instrumentos/format';
import { missingText, requirementLabel } from '../format';
import { GoalFormDialog } from '../goal-form-dialog';

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
      {goal.rascunho && (
        <span className="flex flex-col items-start gap-1">
          <Badge variant="outline">Rascunho</Badge>
          <span className="text-muted-foreground">{missingText(goal.camposFaltantes)}</span>
        </span>
      )}
      <span className="text-muted-foreground md:hidden">{goal.indicador ?? 'Sem indicador'}</span>
      {measure(goal) && <span className="text-muted-foreground md:hidden">{measure(goal)}</span>}
      <span className="text-muted-foreground md:hidden">
        {period(goal.periodoInicio, goal.periodoFim)}
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
  const pagination = usePagination(goals.data);
  const form = useDialogState<{ goal: Goal | null }>();
  const manager = session?.perfil === 'PRESIDENCIA_GESTAO';
  const canEdit = manager && instrument.data?.ativo === true && requirements.data !== undefined;
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
      {goals.error && !goals.data ? (
        <ListError message="Não foi possível carregar as metas. Tente de novo." />
      ) : goals.data?.length === 0 ? (
        <ListEmpty
          icon={TargetIcon}
          title="Nenhuma meta neste projeto"
          description="Cadastre cada meta do plano de trabalho com o indicador, o período e a forma de comprovação."
          action={(!withoutRequirements && createButton) || undefined}
        />
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
                  Período
                </TableHead>
                {canEdit && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.isPending ? (
                <TableSkeleton columns={canEdit ? 4 : 3} />
              ) : (
                pagination.pageRows.map((goal) => (
                  <TableRow key={goal.id}>
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
                      {period(goal.periodoInicio, goal.periodoFim)}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações da meta ${goal.ordem}`}
                          actions={[{ label: 'Editar meta', onSelect: () => form.show({ goal }) }]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação das metas" />
        </ListCard>
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
    </>
  );
}
