import { ApiError } from '@/lib/api';
import type { ActivityMeta } from '@/types/atividades';

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
