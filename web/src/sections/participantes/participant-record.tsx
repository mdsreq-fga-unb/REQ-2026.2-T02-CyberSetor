'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/toast';
import { useParticipant } from '@/queries/participantes';
import type { ParticipantRegistration } from '@/types/participantes';
import { CorrectParticipantDialog } from './correct-participant-dialog';
import { ParticipantDialog } from './participant-dialog';
import { RevokeAuthorizationDialog } from './revoke-authorization-dialog';

/**
 * Ficha do participante com a correção e a revogação a pedido do titular (HU-15a). Serve à tela de
 * participantes e à lista de inscritos da atividade, para as duas abrirem a mesma ficha.
 */
export function ParticipantRecord({
  open,
  participantId,
  correcting: startCorrecting = false,
  onClose,
}: {
  open: boolean;
  /** Fica com o último aberto depois de fechar, para o conteúdo não sumir na animação. */
  participantId: string | null;
  /** Abre direto na correção, como "Corrigir dados" na tela de participantes. */
  correcting?: boolean;
  onClose: () => void;
}) {
  const participant = useParticipant(participantId);
  const [correctingNow, setCorrecting] = useState<boolean | null>(null);
  const [revoking, setRevoking] = useState<ParticipantRegistration | null>(null);
  const correcting = correctingNow ?? startCorrecting;

  function closeAll() {
    setCorrecting(null);
    setRevoking(null);
    onClose();
  }

  return (
    <>
      <ParticipantDialog
        // Enquanto a ficha carrega, ou se ela falhar, mostra a ficha mesmo vindo de "Corrigir dados".
        open={open && !revoking && (!correcting || !participant.data)}
        participant={participant.data}
        loading={participant.isPending}
        failed={participant.isError}
        onClose={closeAll}
        onCorrect={() => setCorrecting(true)}
        onRevoke={setRevoking}
      />
      <RevokeAuthorizationDialog
        open={open && Boolean(revoking)}
        participant={participant.data ?? null}
        registration={revoking}
        onClose={() => setRevoking(null)}
        onRevoked={() => toast.add({ type: 'success', title: 'Revogação registrada' })}
      />
      <CorrectParticipantDialog
        open={open && correcting && Boolean(participant.data)}
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
