'use client';

import { CalendarDaysIcon, PlusIcon } from 'lucide-react';
import { useSession } from '@/auth/hooks/use-session';
import type { Perfil } from '@/auth/types';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useActivities } from '@/queries/atividades';
import type { Activity } from '@/types/atividades';
import type { Instrument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import { formatDate } from '@/lib/br';
import { ActivityFormDialog } from '../activity-form-dialog';
import { RegistrationFormDialog } from '../registration-form-dialog';
import { RegistrationShareDialog } from '../registration-share-dialog';
import { metaBadgeLabel } from '../format';
import type { Registration } from '@/types/inscricoes';

const EDITORS: Perfil[] = ['PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO'];

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta atividades.';
  }
  return 'Não foi possível carregar as atividades. Tente de novo.';
}

function Responsible({ activity }: { activity: Activity }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {activity.responsavel.nome}
      {!activity.responsavel.ativo && <Badge variant="outline">Conta desativada</Badge>}
    </span>
  );
}

function registrationText(activity: Activity): string {
  const { inscricao } = activity;
  if (!inscricao) return 'Inscrição não aberta';
  const situacao = inscricao.aberta ? 'Inscrição aberta' : 'Inscrição encerrada';
  return `${situacao} · ${inscricao.inscritos} de ${inscricao.vagas}`;
}

function RegistrationStatus({
  activity,
  onOpen,
  onShare,
}: {
  activity: Activity;
  onOpen?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Badge variant={activity.inscricao?.aberta ? 'default' : 'outline'}>
        {registrationText(activity)}
      </Badge>
      {activity.inscricao
        ? onShare && (
            <Button
              variant="outline"
              onClick={onShare}
              aria-label={`Divulgar a inscrição de ${activity.titulo}`}
            >
              Divulgar
            </Button>
          )
        : onOpen && (
            <Button
              variant="outline"
              onClick={onOpen}
              aria-label={`Abrir inscrição de ${activity.titulo}`}
            >
              Abrir inscrição
            </Button>
          )}
    </div>
  );
}

function ActivitySummary({ activity }: { activity: Activity }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{activity.titulo}</span>
      <span className="text-sm text-muted-foreground">{activity.modalidade.nome}</span>
      <div className="mt-1 flex flex-wrap gap-1">
        {activity.metas
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map((meta) => (
            <Badge key={meta.id} variant="secondary">
              {metaBadgeLabel(meta)}
            </Badge>
          ))}
      </div>
      <span className="text-muted-foreground md:hidden">
        {formatDate(activity.data)} · {activity.local}
      </span>
      <span className="text-muted-foreground md:hidden">
        <Responsible activity={activity} />
      </span>
      <span className="text-sm md:hidden">{registrationText(activity)}</span>
    </div>
  );
}

export function ProjectActivitiesSection({
  instrument,
  project,
}: {
  instrument: Instrument;
  project: Project;
}) {
  const { session } = useSession();
  const activities = useActivities(project.id);
  const pagination = usePagination(activities.data);
  const form = useDialogState<{ activity: Activity | null }>();
  const registrationForm = useDialogState<{ activity: Activity }>();
  const registrationShare = useDialogState<{
    activity: Activity;
    initialRegistration?: Registration;
  }>();

  const canEdit = session !== null && EDITORS.includes(session.perfil) && instrument.ativo === true;

  const createButton = canEdit && (
    <Button onClick={() => form.show({ activity: null })}>
      <PlusIcon data-icon="inline-start" />
      Nova atividade
    </Button>
  );

  return (
    <section className="flex flex-col gap-3" aria-labelledby="atividades-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="atividades-heading" className="text-lg font-semibold">
          Atividades
        </h2>
        {createButton}
      </div>

      {instrument.ativo === false && (
        <p className="text-muted-foreground">
          Instrumento inativo: não recebe nem altera atividades.
        </p>
      )}

      {activities.error && !activities.data ? (
        <ListError message={loadFailure(activities.error)} />
      ) : activities.data?.length === 0 ? (
        <ListEmpty
          icon={CalendarDaysIcon}
          title="Nenhuma atividade cadastrada neste projeto"
          description="Cadastre as atividades realizadas no projeto vinculadas a modalidades e metas."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={activities.isPending}>
            <TableCaption className="sr-only">Atividades do projeto {project.codigo}.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Atividade
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Data e local
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Responsável
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Inscrição
                </TableHead>
                {canEdit && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.isPending ? (
                <TableSkeleton columns={canEdit ? 5 : 4} />
              ) : (
                pagination.pageRows.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <ActivitySummary activity={activity} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span>{formatDate(activity.data)}</span>
                        <span className="text-muted-foreground">{activity.local}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      <Responsible activity={activity} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <RegistrationStatus
                        activity={activity}
                        onOpen={canEdit ? () => registrationForm.show({ activity }) : undefined}
                        onShare={canEdit ? () => registrationShare.show({ activity }) : undefined}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações da atividade ${activity.titulo}`}
                          actions={[
                            {
                              label: 'Editar atividade',
                              onSelect: () => form.show({ activity }),
                            },
                            {
                              label: activity.inscricao
                                ? 'Configurar inscrição'
                                : 'Abrir inscrição',
                              onSelect: () => registrationForm.show({ activity }),
                            },
                            {
                              label: 'Link e QR Code',
                              onSelect: () => registrationShare.show({ activity }),
                            },
                          ]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação das atividades" />
        </ListCard>
      )}

      <ActivityFormDialog
        open={form.open}
        project={project}
        activity={form.value?.activity ?? null}
        onClose={form.close}
        onSaved={(activity) =>
          toast.add({ type: 'success', title: `Atividade "${activity.titulo}" salva` })
        }
      />

      <RegistrationFormDialog
        open={registrationForm.open}
        activity={registrationForm.value?.activity ?? null}
        instrumentAtivo={instrument.ativo}
        onClose={registrationForm.close}
        onSaved={(saved) => {
          toast.add({
            type: 'success',
            title: `Inscrição da atividade "${registrationForm.value?.activity?.titulo ?? ''}" salva`,
          });
          if (registrationForm.value?.activity) {
            registrationShare.show({
              activity: registrationForm.value.activity,
              initialRegistration: saved,
            });
          }
        }}
        onOpenShare={(saved) => {
          if (registrationForm.value?.activity) {
            registrationShare.show({
              activity: registrationForm.value.activity,
              initialRegistration: saved,
            });
          }
        }}
      />

      <RegistrationShareDialog
        open={registrationShare.open}
        activity={registrationShare.value?.activity ?? null}
        initialRegistration={registrationShare.value?.initialRegistration}
        onClose={registrationShare.close}
        onOpenConfigure={
          canEdit && registrationShare.value?.activity
            ? () => registrationForm.show({ activity: registrationShare.value!.activity })
            : undefined
        }
      />
    </section>
  );
}
