import {
  Building2Icon,
  FileTextIcon,
  HouseIcon,
  ShapesIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';
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
  {
    href: paths.dashboard.instruments,
    label: 'Instrumentos',
    icon: FileTextIcon,
    profiles: ['PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO', 'ADMINISTRATIVO_FINANCEIRO'],
  },
  {
    href: paths.dashboard.modalities,
    label: 'Modalidades',
    icon: ShapesIcon,
    profiles: ['PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO', 'ADMINISTRATIVO_FINANCEIRO'],
  },
  {
    href: paths.dashboard.sectors,
    label: 'Setores',
    icon: Building2Icon,
    profiles: [
      'PRESIDENCIA_GESTAO',
      'NUCLEO_PEDAGOGICO',
      'ADMINISTRATIVO_FINANCEIRO',
      'ADMINISTRACAO_SISTEMA',
    ],
  },
  {
    href: paths.dashboard.accounts,
    label: 'Contas',
    icon: UsersIcon,
    profiles: ['ADMINISTRACAO_SISTEMA'],
  },
];

export const PROFILES = Object.keys(LABELS) as Perfil[];

export function profileLabel(perfil: Perfil): string {
  return LABELS[perfil];
}

export function navigationFor(perfil: Perfil, items: NavItem[] = NAVIGATION): NavItem[] {
  return items.filter((item) => !item.profiles || item.profiles.includes(perfil));
}

export function isActiveItem(pathname: string, href: string): boolean {
  return pathname === href || (href !== paths.dashboard.root && pathname.startsWith(`${href}/`));
}
