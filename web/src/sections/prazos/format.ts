import type { RequirementSituation } from '@/types/prazos';

export const REQUIREMENT_SITUATIONS: Record<RequirementSituation, string> = {
  ATENDIDO: 'Atendido',
  PENDENTE: 'Pendente',
  SEM_META: 'Sem meta vinculada',
};
