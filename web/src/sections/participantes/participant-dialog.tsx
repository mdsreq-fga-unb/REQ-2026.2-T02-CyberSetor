'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCpf, formatDate, formatDateTime, formatPhone } from '@/lib/br';
import { paths } from '@/routes/paths';
import type { Participant } from '@/types/participantes';

function Item({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{value || '—'}</dd>
    </div>
  );
}

function Authorization({ label, given }: { label: string; given: boolean }) {
  return (
    <Badge variant={given ? 'secondary' : 'outline'}>{`${label}: ${given ? 'sim' : 'não'}`}</Badge>
  );
}

/** Ficha do participante, com as inscrições, as autorizações e o responsável legal. */
export function ParticipantDialog({
  open,
  participant,
  loading,
  failed,
  onClose,
  onCorrect,
}: {
  open: boolean;
  participant: Participant | undefined;
  loading: boolean;
  failed: boolean;
  onClose: () => void;
  onCorrect: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{participant?.nome ?? 'Ficha do participante'}</DialogTitle>
          <DialogDescription>
            Dados da inscrição pelo formulário público. Só o Núcleo Pedagógico vê esta ficha.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div aria-busy="true" aria-label="Carregando a ficha" className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : failed || !participant ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar a ficha. Feche e tente de novo.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Item label="Nome de preferência" value={participant.nomePreferencia} />
              <Item label="Telefone" value={formatPhone(participant.telefone)} />
              <Item
                label="Nascimento"
                value={`${formatDate(participant.dataNascimento)} (${participant.idade} anos)`}
              />
              <Item label="E-mail" value={participant.email} />
              <Item label="CPF" value={participant.cpf && formatCpf(participant.cpf)} />
              <Item label="Bairro ou região" value={participant.bairroRegiao} />
              <Item label="Escolaridade" value={participant.escolaridade} />
            </dl>

            <section aria-labelledby="inscricoes-da-pessoa" className="flex flex-col gap-3">
              <h3 id="inscricoes-da-pessoa" className="text-sm font-semibold">
                Inscrições ({participant.inscricoes.length})
              </h3>
              <ul className="flex flex-col divide-y rounded-lg border">
                {participant.inscricoes.map((inscricao) => (
                  <li key={inscricao.id} className="flex flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={paths.dashboard.project(inscricao.instrumentoId, inscricao.projetoId)}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {inscricao.atividade.titulo}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(inscricao.atividade.data)} · inscrição em{' '}
                        {formatDateTime(inscricao.inscritoEm)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Authorization label="Comunicados" given={inscricao.autorizaComunicados} />
                      <Authorization label="Imagem e voz" given={inscricao.autorizaImagem} />
                    </div>
                    {inscricao.termoAceitoEm && (
                      <p className="text-sm text-muted-foreground">
                        Compromissos da turma aceitos em {formatDateTime(inscricao.termoAceitoEm)}
                      </p>
                    )}
                    {inscricao.responsavelNome && (
                      <p className="text-sm text-muted-foreground">
                        Responsável legal: {inscricao.responsavelNome}
                        {inscricao.responsavelTelefone &&
                          ` · ${formatPhone(inscricao.responsavelTelefone)}`}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onCorrect} disabled={!participant}>
            Corrigir dados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
