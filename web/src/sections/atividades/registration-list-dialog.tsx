'use client';

import { useDeferredValue, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu, type RowAction } from '@/components/list/row-actions-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime, formatPhone } from '@/lib/br';
import { useConfirmFromWaitlist, useRegistration, useRegistrationList } from '@/queries/inscricoes';
import type { Activity } from '@/types/atividades';
import type { RegisteredPerson, SituacaoInscricao } from '@/types/inscricoes';
import { CANAL_LABEL } from '../participantes/format';
import { useDialogState } from '@/hooks/use-dialog-state';
import { ParticipantRecord } from '../participantes/participant-record';
import { CancelRegistrationDialog } from './cancel-registration-dialog';

const COLUMNS = 3;

const CAPTION: Record<SituacaoInscricao, string> = {
  CONFIRMADA: 'Pessoas com vaga confirmada, pela ordem de chegada.',
  LISTA_ESPERA: 'Pessoas na lista de espera, pela posição.',
  CANCELADA: 'Inscrições canceladas, que não ocupam vaga.',
};

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Só o Núcleo Pedagógico vê os nomes dos inscritos.';
  }
  return 'Não foi possível carregar os inscritos. Tente de novo.';
}

function Authorizations({ person }: { person: RegisteredPerson }) {
  const given = [
    person.autorizaComunicados && 'comunicados',
    person.autorizaImagem && 'imagem',
  ].filter(Boolean);
  return given.length > 0 ? `Autoriza ${given.join(' e ')}` : 'Sem autorizações';
}

function PeopleTable({
  situacao,
  people,
  loading,
  actionsFor,
}: {
  situacao: SituacaoInscricao;
  people: RegisteredPerson[];
  loading: boolean;
  actionsFor?: (person: RegisteredPerson) => RowAction[];
}) {
  const waiting = situacao === 'LISTA_ESPERA';
  return (
    <Table aria-busy={loading}>
      <TableCaption className="sr-only">{CAPTION[situacao]}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="px-4">
            {waiting ? 'Posição e pessoa' : 'Pessoa'}
          </TableHead>
          <TableHead scope="col" className="hidden w-40 md:table-cell">
            Telefone
          </TableHead>
          <TableHead scope="col" className="hidden w-44 md:table-cell">
            Inscrita em
          </TableHead>
          {actionsFor && (
            <TableHead scope="col" className="w-16 px-4">
              <span className="sr-only">Ações</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableSkeleton columns={actionsFor ? COLUMNS + 1 : COLUMNS} rows={2} />
        ) : (
          people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="px-4 py-3 whitespace-normal">
                <div className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {waiting && `${person.posicaoEspera}º · `}
                    {person.nome}
                    {person.menor && <Badge variant="outline">Menor</Badge>}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {person.idade} anos · <Authorizations person={person} />
                  </span>
                  {person.responsavelNome && (
                    <span className="text-sm text-muted-foreground">
                      Responsável: {person.responsavelNome}
                      {person.responsavelTelefone && (
                        <>
                          {' · '}
                          <span className="whitespace-nowrap">
                            {formatPhone(person.responsavelTelefone)}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                  {person.cancelamento && (
                    <span className="text-sm text-muted-foreground">
                      Cancelada a pedido em {formatDate(person.cancelamento.pedidoEm)} ·{' '}
                      {CANAL_LABEL[person.cancelamento.canal]}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground md:hidden">
                    {formatPhone(person.telefone)} · {formatDateTime(person.inscritoEm)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{formatPhone(person.telefone)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDateTime(person.inscritoEm)}
              </TableCell>
              {actionsFor && (
                <TableCell className="px-4 text-right">
                  <PersonActions person={person} actions={actionsFor(person)} />
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function PersonActions({ person, actions }: { person: RegisteredPerson; actions: RowAction[] }) {
  return actions.length > 0 ? (
    <RowActionsMenu label={`Ações de ${person.nome}`} actions={actions} />
  ) : null;
}

function confirmFailure(error: unknown): string {
  if (error instanceof ApiError && [403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível confirmar a vaga. Tente de novo.';
}

/**
 * Inscritos da atividade, para o Núcleo (HU-07c, RNF04): vagas confirmadas, lista de espera e
 * canceladas, com a confirmação da vaga de quem espera e o cancelamento a pedido da pessoa.
 */
export function RegistrationListDialog({
  open,
  activity,
  editable,
  onClose,
}: {
  open: boolean;
  activity: Activity | null;
  /** Instrumento ativo: confirmar e cancelar ficam disponíveis. */
  editable: boolean;
  onClose: () => void;
}) {
  const [busca, setBusca] = useState('');
  const deferred = useDeferredValue(busca);
  const list = useRegistrationList(activity?.id, deferred, open);
  const registration = useRegistration(activity?.id, open && editable);
  const confirm = useConfirmFromWaitlist(activity?.id ?? '');
  const [cancelling, setCancelling] = useState<RegisteredPerson | null>(null);
  const record = useDialogState<string>();
  const freeVacancy = list.data ? list.data.confirmadas < list.data.vagas : false;

  async function confirmVacancy(person: RegisteredPerson) {
    try {
      await confirm.mutateAsync(person.id);
      toast.add({ type: 'success', title: `Vaga de ${person.nome} confirmada` });
    } catch (error) {
      toast.add({ type: 'error', title: confirmFailure(error) });
    }
  }

  // A ficha abre mesmo com o instrumento inativo; confirmar e cancelar só com ele ativo.
  function actionsFor(person: RegisteredPerson): RowAction[] {
    const actions: RowAction[] = [
      { label: 'Ver ficha', onSelect: () => record.show(person.participanteId) },
    ];
    if (!editable || person.situacao === 'CANCELADA') return actions;
    if (person.situacao === 'LISTA_ESPERA' && freeVacancy) {
      actions.push({
        label: 'Confirmar vaga',
        disabled: confirm.isPending,
        onSelect: () => void confirmVacancy(person),
      });
    }
    actions.push({
      label: 'Cancelar inscrição',
      destructive: true,
      onSelect: () => setCancelling(person),
    });
    return actions;
  }

  const searching = deferred.trim() !== '';
  const people = list.data?.inscricoes ?? [];
  const of = (situacao: SituacaoInscricao) =>
    people.filter((person) => person.situacao === situacao);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setBusca('');
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Inscritos: {activity?.titulo}</DialogTitle>
            <DialogDescription>
              {list.data
                ? `${list.data.confirmadas} de ${list.data.vagas} vagas confirmadas · ${list.data.emEspera} na lista de espera`
                : 'Vagas confirmadas e lista de espera, pela ordem de chegada.'}
            </DialogDescription>
          </DialogHeader>

          {list.error && !list.data ? (
            <ListError message={loadFailure(list.error)} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <SearchIcon
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Nome, telefone ou e-mail"
                  aria-label="Buscar inscrito por nome, telefone ou e-mail"
                  className="pl-9"
                />
              </div>

              <section aria-labelledby="inscritos-confirmados" className="flex flex-col gap-2">
                <h3 id="inscritos-confirmados" className="text-sm font-medium">
                  Vagas confirmadas ({list.data?.confirmadas ?? 0})
                </h3>
                {!list.isPending && of('CONFIRMADA').length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {searching
                      ? 'Ninguém encontrado com vaga confirmada.'
                      : 'Nenhuma vaga confirmada.'}
                  </p>
                ) : (
                  <PeopleTable
                    situacao="CONFIRMADA"
                    people={of('CONFIRMADA')}
                    loading={list.isPending}
                    actionsFor={actionsFor}
                  />
                )}
              </section>

              {(list.data?.emEspera ?? 0) > 0 && (
                <section aria-labelledby="inscritos-espera" className="flex flex-col gap-2">
                  <h3 id="inscritos-espera" className="text-sm font-medium">
                    Lista de espera ({list.data?.emEspera})
                  </h3>
                  {of('LISTA_ESPERA').length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ninguém encontrado na lista de espera.
                    </p>
                  ) : (
                    <PeopleTable
                      situacao="LISTA_ESPERA"
                      people={of('LISTA_ESPERA')}
                      loading={false}
                      actionsFor={actionsFor}
                    />
                  )}
                </section>
              )}

              {(list.data?.canceladas ?? 0) > 0 && (
                <section aria-labelledby="inscritos-canceladas" className="flex flex-col gap-2">
                  <h3 id="inscritos-canceladas" className="text-sm font-medium">
                    Canceladas ({list.data?.canceladas})
                  </h3>
                  {of('CANCELADA').length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ninguém encontrado entre as canceladas.
                    </p>
                  ) : (
                    <PeopleTable
                      situacao="CANCELADA"
                      people={of('CANCELADA')}
                      loading={false}
                      actionsFor={actionsFor}
                    />
                  )}
                </section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CancelRegistrationDialog
        activityId={activity?.id ?? ''}
        person={cancelling}
        vacancyGoesTo={
          (list.data?.emEspera ?? 0) === 0
            ? 'livre'
            : registration.data?.promocaoAutomatica
              ? 'espera'
              : 'escolha'
        }
        onClose={() => setCancelling(null)}
        onCancelled={(person) =>
          toast.add({ type: 'success', title: `Inscrição de ${person.nome} cancelada` })
        }
      />

      <ParticipantRecord open={record.open} participantId={record.value} onClose={record.close} />
    </>
  );
}
