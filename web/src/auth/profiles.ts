import { HouseIcon, type LucideIcon } from 'lucide-react';
import { paths } from '@/routes/paths';
import type { Perfil } from './types';

const LABELS: Record<Perfil, string> = {
  PRESIDENCIA_GESTAO: 'Presidência e Gestão de Projetos',
  NUCLEO_PEDAGOGICO: 'Núcleo Pedagógico e Educadores',
  ADMINISTRATIVO_FINANCEIRO: 'Administrativo-Financeiro',
  CONCEDENTE_AUDITORIA: 'Órgão Concedente e Auditoria',
  ADMINISTRACAO_SISTEMA: 'Administração do sistema',
};

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  profiles?: Perfil[];
}

export const NAVIGATION: NavItem[] = [
  { href: paths.dashboard.root, label: 'Início', icon: HouseIcon },
];

export function profileLabel(perfil: Perfil): string {
  return LABELS[perfil];
}

export function navigationFor(perfil: Perfil, items: NavItem[] = NAVIGATION): NavItem[] {
  return items.filter((item) => !item.profiles || item.profiles.includes(perfil));
}
