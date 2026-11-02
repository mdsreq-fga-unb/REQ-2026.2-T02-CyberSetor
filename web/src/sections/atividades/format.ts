import { ApiError } from '@/lib/api';
import type { ActivityMeta, ActivityRegistrationStatus } from '@/types/atividades';

export type RegistrationTone = 'open' | 'full' | 'closed' | 'none';

/** Situação da inscrição na lista de atividades: texto e tom do selo. */
export function registrationStatus(inscricao: ActivityRegistrationStatus | null): {
  label: string;
  tone: RegistrationTone;
} {
  if (!inscricao) return { label: 'Inscrição não aberta', tone: 'none' };
  const total = `${inscricao.inscritos} de ${inscricao.vagas}`;
  if (!inscricao.aberta) return { label: `Inscrição encerrada · ${total}`, tone: 'closed' };
  if (inscricao.inscritos >= inscricao.vagas) {
    return { label: `Vagas preenchidas · ${total}`, tone: 'full' };
  }
  return { label: `Inscrição aberta · ${total}`, tone: 'open' };
}

export function metaBadgeLabel(meta: ActivityMeta): string {
  return `Meta ${meta.ordem}`;
}

export function metaFullLabel(meta: { ordem: number; objetivo: string }): string {
  return `Meta ${meta.ordem} — ${meta.objetivo}`;
}

export function registrationLoadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta a inscrição desta atividade.';
  }
  return 'Não foi possível carregar a inscrição. Tente de novo.';
}
