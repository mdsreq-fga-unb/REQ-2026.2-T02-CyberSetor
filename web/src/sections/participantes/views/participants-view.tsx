'use client';

import { useDeferredValue, useState } from 'react';
import { SearchIcon, UserRoundSearchIcon } from 'lucide-react';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { PageHeader } from '@/components/page-header';
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
import { useDialogState } from '@/hooks/use-dialog-state';
import { ApiError } from '@/lib/api';
import { formatDate, formatPhone } from '@/lib/br';
import { useParticipant, useParticipants } from '@/queries/participantes';
import type { ParticipantRegistration, ParticipantSummary } from '@/types/participantes';
import { CorrectParticipantDialog } from '../correct-participant-dialog';
import { ParticipantDialog } from '../participant-dialog';
import { RevokeAuthorizationDialog } from '../revoke-authorization-dialog';

const TITLE = 'Participantes';
const DESCRIPTION =
  'Pessoas inscritas nas atividades, com a ficha e a correção a pedido do titular.';
const COLUMNS = 4;
/** A API devolve até 200 por nome e um item a mais quando há outros. */
const LIMIT = 200;

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não acessa as fichas de participantes.';
  }
  return 'Não foi possível carregar os participantes. Recarregue a página.';
}

function lastActivity(participant: ParticipantSummary): string {
  if (!participant.ultimaAtividade) return 'Sem inscrição';
  const { titulo, data } = participant.ultimaAtividade;
  return `${titulo} · ${formatDate(data)}`;
}

/** Fichas de participantes para o Núcleo Pedagógico (HU-15a; seção 8.5.1). */
export function ParticipantsView() {
  const { session } = useSession();
  const isNucleo = session?.perfil === 'NUCLEO_PEDAGOGICO';
  const [busca, setBusca] = useState('');
  const deferred = useDeferredValue(busca);
  const participants = useParticipants(deferred, isNucleo);

  const viewing = useDialogState<string>();
  const [correcting, setCorrecting] = useState(false);
  const [revoking, setRevoking] = useState<ParticipantRegistration | null>(null);
  const participant = useParticipant(viewing.value);
  const truncated = (participants.data?.length ?? 0) > LIMIT;
  const pagination = usePagination(participants.data?.slice(0, LIMIT));

  function show(id: string, correct: boolean) {
    setCorrecting(correct);
    viewing.show(id);
  }

  function closeAll() {
    setCorrecting(false);
    setRevoking(null);
    viewing.close();
  }

  if (!isNucleo) {
    return (
      <PageHeader
        title={TITLE}
        description="Só o Núcleo Pedagógico acessa as fichas de participantes."
      />
    );
  }

  const searching = deferred.trim() !== '';

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />

      <div className="relative max-w-md">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Nome, telefone ou e-mail"
          aria-label="Buscar participante por nome, telefone ou e-mail"
          className="pl-9"
        />
      </div>

      {truncated && (
        <p role="status" className="text-sm text-muted-foreground">
          Mostrando os {LIMIT} primeiros por nome. Busque pelo nome, pelo telefone ou pelo e-mail
          para achar quem não aparece.
        </p>
      )}

      {participants.error && !participants.data ? (
        <ListError message={loadFailure(participants.error)} />
      ) : participants.data?.length === 0 ? (
        <ListEmpty
          icon={UserRoundSearchIcon}
          title={searching ? 'Ninguém encontrado' : 'Nenhum participante inscrito'}
          description={
            searching
              ? 'Confira a grafia ou busque pelo telefone com DDD.'
              : 'As pessoas aparecem aqui depois de se inscrever pelo link da atividade.'
          }
        />
      ) : (
        <ListCard>
          <Table aria-busy={participants.isPending}>
            <TableCaption className="sr-only">{DESCRIPTION}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Pessoa
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Telefone
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Última inscrição
                </TableHead>
                <TableHead scope="col" className="w-16 px-4">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.isPending ? (
                <TableSkeleton columns={COLUMNS} />
              ) : (
                pagination.pageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {row.nome}
                          {row.nomePreferencia && (
                            <span className="font-normal text-muted-foreground">
                              {' '}
                              ({row.nomePreferencia})
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {row.idade} anos · {row.inscricoes}{' '}
                          {row.inscricoes === 1 ? 'inscrição' : 'inscrições'}
                        </span>
                        <span className="text-sm text-muted-foreground md:hidden">
                          {formatPhone(row.telefone)}
                        </span>
                        <span className="text-sm text-muted-foreground md:hidden">
                          {lastActivity(row)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatPhone(row.telefone)}
                    </TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      {lastActivity(row)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <RowActionsMenu
                        label={`Ações de ${row.nome}`}
                        actions={[
                          { label: 'Ver ficha', onSelect: () => show(row.id, false) },
                          { label: 'Corrigir dados', onSelect: () => show(row.id, true) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação dos participantes" />
        </ListCard>
      )}

      <ParticipantDialog
        // Enquanto a ficha carrega, ou se ela falhar, mostra a ficha mesmo vindo de "Corrigir dados".
        open={viewing.open && !revoking && (!correcting || !participant.data)}
        participant={participant.data}
        loading={participant.isPending}
        failed={participant.isError}
        onClose={closeAll}
        onCorrect={() => setCorrecting(true)}
        onRevoke={setRevoking}
      />
      <RevokeAuthorizationDialog
        open={viewing.open && Boolean(revoking)}
        participant={participant.data ?? null}
        registration={revoking}
        onClose={() => setRevoking(null)}
        onRevoked={() => toast.add({ type: 'success', title: 'Revogação registrada' })}
      />
      <CorrectParticipantDialog
        open={viewing.open && correcting && Boolean(participant.data)}
        participant={participant.data ?? null}
        onClose={() => setCorrecting(false)}
        onConflict={() => void participant.refetch()}
        onCorrected={(corrected) =>
          toast.add({ type: 'success', title: `Dados de ${corrected.nome} corrigidos` })
        }
      />
    </>
  );
}
