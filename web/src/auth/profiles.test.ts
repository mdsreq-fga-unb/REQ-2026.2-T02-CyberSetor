import { NAVIGATION, isActiveItem, navigationFor, profileLabel } from './profiles';
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

  it.each(PERFIS)('contas aparece so para a administracao do sistema: %s', (perfil) => {
    const hrefs = navigationFor(perfil, NAVIGATION).map((item) => item.href);
    expect(hrefs.includes('/contas')).toBe(perfil === 'ADMINISTRACAO_SISTEMA');
  });

  it.each(PERFIS)('instrumentos segue a matriz da secao 8.5.1: %s', (perfil) => {
    const hrefs = navigationFor(perfil, NAVIGATION).map((item) => item.href);
    expect(hrefs.includes('/instrumentos')).toBe(
      ['PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO', 'ADMINISTRATIVO_FINANCEIRO'].includes(perfil),
    );
  });

  it.each(PERFIS)('modalidades aparece para quem consulta ou cadastra: %s', (perfil) => {
    const hrefs = navigationFor(perfil, NAVIGATION).map((item) => item.href);
    expect(hrefs.includes('/modalidades')).toBe(
      ['PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO', 'ADMINISTRATIVO_FINANCEIRO'].includes(perfil),
    );
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

  it('o item fica marcado tambem nas paginas internas da secao', () => {
    expect(isActiveItem('/instrumentos/abc', '/instrumentos')).toBe(true);
    expect(isActiveItem('/instrumentos', '/instrumentos')).toBe(true);
    expect(isActiveItem('/instrumentos-antigos', '/instrumentos')).toBe(false);
    expect(isActiveItem('/instrumentos', '/')).toBe(false);
  });
});
