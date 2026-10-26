import type { ActivityMeta } from '@/types/atividades';

export function metaBadgeLabel(meta: ActivityMeta): string {
  return `Meta ${meta.ordem}`;
}

export function metaFullLabel(meta: { ordem: number; objetivo: string }): string {
  return `Meta ${meta.ordem} — ${meta.objetivo}`;
}
