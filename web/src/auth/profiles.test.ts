import { NAVIGATION, navigationFor, profileLabel } from './profiles';
import type { Perfil } from './types';

const PERFIS: Perfil[] = [
  'PRESIDENCIA_GESTAO',
  'NUCLEO_PEDAGOGICO',
  'ADMINISTRATIVO_FINANCEIRO',
  'CONCEDENTE_AUDITORIA',
  'ADMINISTRACAO_SISTEMA',
];

describe('perfis de acesso', () => {
  it.each([
    ['PRESIDENCIA_GESTAO', 'Presidência e Gestão de Projetos'],
    ['NUCLEO_PEDAGOGICO', 'Núcleo Pedagógico e Educadores'],
    ['ADMINISTRATIVO_FINANCEIRO', 'Administrativo-Financeiro'],
    ['CONCEDENTE_AUDITORIA', 'Órgão Concedente e Auditoria'],
    ['ADMINISTRACAO_SISTEMA', 'Administração do sistema'],
  ] as [Perfil, string][])('o perfil %s tem o nome da secao 8.5.1', (perfil, label) => {
    expect(profileLabel(perfil)).toBe(label);
  });

  it.each(PERFIS)('o inicio aparece para o perfil %s', (perfil) => {
    expect(navigationFor(perfil, NAVIGATION).map((item) => item.href)).toContain('/');
  });

  it('item restrito so aparece para os perfis autorizados', () => {
    const items = [
      { href: '/a', label: 'A' },
      { href: '/b', label: 'B', profiles: ['ADMINISTRACAO_SISTEMA'] as Perfil[] },
    ];

    expect(navigationFor('NUCLEO_PEDAGOGICO', items).map((item) => item.href)).toEqual(['/a']);
    expect(navigationFor('ADMINISTRACAO_SISTEMA', items).map((item) => item.href)).toEqual([
      '/a',
      '/b',
    ]);
  });
});
