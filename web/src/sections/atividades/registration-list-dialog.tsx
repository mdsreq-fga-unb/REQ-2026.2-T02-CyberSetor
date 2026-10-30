'use client';

import { useDeferredValue, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { ListError, TableSkeleton } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ApiError } from '@/lib/api';
import { formatDateTime, formatPhone } from '@/lib/br';
import { toast } from '@/components/ui/toast';
import { useConfirmFromWaitlist, useRegistrationList } from '@/queries/inscricoes';
import type { Activity } from '@/types/atividades';
import type { RegisteredPerson } from '@/types/inscricoes';

const COLUMNS = 3;
const WAITING_COLUMNS = 4;

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

function ConfirmButton({
  person,
  disabled,
  onConfirm,
  className,
}: {
  person: RegisteredPerson;
  disabled: boolean;
  onConfirm: (person: RegisteredPerson) => void;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      className={className}
      disabled={disabled}
      onClick={() => onConfirm(person)}
      aria-label={`Confirmar vaga de ${person.nome}`}
    >
      Confirmar vaga
    </Button>
  );
}

function PeopleTable({
  caption,
  people,
  loading,
  waiting,
  onConfirm,
  confirming,
}: {
  caption: string;
  people: RegisteredPerson[];
  loading: boolean;
  waiting: boolean;
  /** Na espera, com vaga livre: confirma a vaga da pessoa. */
  onConfirm?: (person: RegisteredPerson) => void;
  confirming?: string | null;
}) {
  return (
    <Table aria-busy={loading}>
      <TableCaption className="sr-only">{caption}</TableCaption>
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
          {onConfirm && (
            <TableHead scope="col" className="hidden w-36 px-4 md:table-cell">
              <span className="sr-only">Ações</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableSkeleton columns={onConfirm ? WAITING_COLUMNS : COLUMNS} rows={2} />
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
                  <span className="text-sm text-muted-foreground md:hidden">
                    {formatPhone(person.telefone)} · {formatDateTime(person.inscritoEm)}
                  </span>
                  {onConfirm && (
                    <ConfirmButton
                      className="mt-1 self-start md:hidden"
                      person={person}
                      disabled={Boolean(confirming)}
                      onConfirm={onConfirm}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{formatPhone(person.telefone)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDateTime(person.inscritoEm)}
              </TableCell>
              {onConfirm && (
                <TableCell className="hidden px-4 text-right md:table-cell">
                  <ConfirmButton
                    person={person}
                    disabled={Boolean(confirming)}
                    onConfirm={onConfirm}
                  />
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

/** Inscritos da atividade: vagas confirmadas e lista de espera, para o Núcleo (HU-07c, RNF04). */
export function RegistrationListDialog({
  open,
  activity,
  onClose,
}: {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
}) {
  const [busca, setBusca] = useState('');
  const deferred = useDeferredValue(busca);
  const list = useRegistrationList(activity?.id, deferred, open);
  const confirm = useConfirmFromWaitlist(activity?.id ?? '');
  const [confirming, setConfirming] = useState<string | null>(null);
  const freeVacancy = list.data ? list.data.confirmadas < list.data.vagas : false;

  async function confirmVacancy(person: RegisteredPerson) {
    setConfirming(person.id);
    try {
      await confirm.mutateAsync(person.id);
      toast.add({ type: 'success', title: `Vaga de ${person.nome} confirmada` });
    } catch (error) {
      toast.add({
        type: 'error',
        title:
          error instanceof ApiError
            ? error.message
            : 'Não foi possível confirmar a vaga. Tente de novo.',
      });
    } finally {
      setConfirming(null);
    }
  }
  const searching = deferred.trim() !== '';
  const people = list.data?.inscricoes ?? [];
  const confirmed = people.filter((person) => person.situacao === 'CONFIRMADA');
  const waiting = people.filter((person) => person.situacao === 'LISTA_ESPERA');

  return (
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
              {!list.isPending && confirmed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {searching
                    ? 'Ninguém encontrado com vaga confirmada.'
                    : 'Nenhuma inscrição ainda.'}
                </p>
              ) : (
                <PeopleTable
                  caption="Pessoas com vaga confirmada, pela ordem de chegada."
                  people={confirmed}
                  loading={list.isPending}
                  waiting={false}
                />
              )}
            </section>

            {(list.data?.emEspera ?? 0) > 0 && (
              <section aria-labelledby="inscritos-espera" className="flex flex-col gap-2">
                <h3 id="inscritos-espera" className="text-sm font-medium">
                  Lista de espera ({list.data?.emEspera})
                </h3>
                {waiting.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ninguém encontrado na lista de espera.
                  </p>
                ) : (
                  <PeopleTable
                    caption="Pessoas na lista de espera, pela posição."
                    people={waiting}
                    loading={false}
                    waiting
                    onConfirm={freeVacancy ? (person) => void confirmVacancy(person) : undefined}
                    confirming={confirming}
                  />
                )}
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
