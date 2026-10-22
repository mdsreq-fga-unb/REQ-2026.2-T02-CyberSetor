'use client';

import { ArrowLeftIcon, FolderKanbanIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { useProjects } from '@/queries/projetos';
import { paths } from '@/routes/paths';
import type { Instrument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import { InstrumentRequirements } from '../../requisitos/instrument-requirements';
import { INSTRUMENT_TYPES, formatDate } from '../../instrumentos/format';
import { ProjectFormDialog } from '../project-form-dialog';

function loadFailure(error: unknown, subject: string): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta instrumentos nem projetos.';
  }
  if (error instanceof ApiError && error.status === 404) return 'Instrumento não encontrado.';
  return `Não foi possível carregar ${subject}. Tente de novo.`;
}

function period(start: string, end: string): string {
  return `${formatDate(start)} a ${formatDate(end)}`;
}

function Coordinator({ project }: { project: Project }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {project.coordenador.nome}
      {!project.coordenador.ativo && <Badge variant="outline">Conta desativada</Badge>}
    </span>
  );
}

function InstrumentSummary({ instrument }: { instrument: Instrument }) {
  return (
    <div className="flex flex-col gap-1 text-muted-foreground">
      <span className="break-all">Processo {instrument.numeroProcesso}</span>
      <span>Vigência {period(instrument.vigenciaInicio, instrument.vigenciaFim)}</span>
      <span>
        <Badge variant={instrument.ativo ? 'secondary' : 'outline'}>
          {instrument.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </span>
    </div>
  );
}

export function InstrumentProjectsView({ instrumentId }: { instrumentId: string }) {
  const { session } = useSession();
  const router = useRouter();
  const instrument = useInstrument(instrumentId);
  const projects = useProjects(instrumentId);
  const pagination = usePagination(projects.data);
  const form = useDialogState<{ project: Project | null }>();
  const canEdit = session?.perfil === 'PRESIDENCIA_GESTAO' && instrument.data?.ativo === true;
  const description = instrument.data
    ? `Projetos do instrumento do processo ${instrument.data.numeroProcesso}.`
    : 'Projetos do instrumento.';

  const back = (
    <Link
      href={paths.dashboard.instruments}
      className={buttonVariants({ variant: 'ghost', className: 'self-start' })}
    >
      <ArrowLeftIcon data-icon="inline-start" />
      Instrumentos
    </Link>
  );

  if (instrument.error && !instrument.data) {
    return (
      <>
        {back}
        <ListError message={loadFailure(instrument.error, 'o instrumento')} />
      </>
    );
  }

  const createButton = canEdit && (
    <Button onClick={() => form.show({ project: null })}>
      <PlusIcon data-icon="inline-start" />
      Novo projeto
    </Button>
  );

  return (
    <>
      {back}
      {instrument.data ? (
        <div className="flex flex-col gap-3">
          <PageHeader
            title={`${INSTRUMENT_TYPES[instrument.data.tipo]} · ${instrument.data.orgaoConcedente}`}
            action={createButton}
          />
          <InstrumentSummary instrument={instrument.data} />
        </div>
      ) : (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      )}

      {instrument.data && !instrument.data.ativo && (
        <p className="text-muted-foreground">
          Instrumento inativo: não recebe nem altera requisitos nem projetos.
        </p>
      )}
      {instrument.data && <InstrumentRequirements instrument={instrument.data} canEdit={canEdit} />}

      <h2 className="text-lg font-semibold">Projetos</h2>

      {projects.error && !projects.data ? (
        <ListError message={loadFailure(projects.error, 'os projetos')} />
      ) : projects.data?.length === 0 ? (
        <ListEmpty
          icon={FolderKanbanIcon}
          title="Nenhum projeto neste instrumento"
          description="Cadastre cada projeto com código, título, coordenação e período de execução."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={projects.isPending}>
            <TableCaption className="sr-only">{description}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Projeto
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Coordenação
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Execução
                </TableHead>
                {canEdit && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.isPending ? (
                <TableSkeleton columns={canEdit ? 4 : 3} />
              ) : (
                pagination.pageRows.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={paths.dashboard.project(instrumentId, project.id)}
                          className="inline-flex min-h-12 items-center self-start font-medium underline-offset-4 hover:underline"
                        >
                          {project.codigo}
                        </Link>
                        <span>{project.titulo}</span>
                        <span className="text-muted-foreground md:hidden">
                          <Coordinator project={project} />
                        </span>
                        <span className="text-muted-foreground md:hidden">
                          {period(project.inicio, project.fim)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      <Coordinator project={project} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {period(project.inicio, project.fim)}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações do projeto ${project.codigo}`}
                          actions={[
                            {
                              label: 'Metas',
                              onSelect: () =>
                                router.push(paths.dashboard.project(instrumentId, project.id)),
                            },
                            { label: 'Editar projeto', onSelect: () => form.show({ project }) },
                          ]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação dos projetos" />
        </ListCard>
      )}

      {instrument.data && (
        <ProjectFormDialog
          open={form.open}
          instrument={instrument.data}
          project={form.value?.project ?? null}
          onClose={form.close}
          onSaved={(project) =>
            toast.add({ type: 'success', title: `Projeto ${project.codigo} salvo` })
          }
        />
      )}
    </>
  );
}
