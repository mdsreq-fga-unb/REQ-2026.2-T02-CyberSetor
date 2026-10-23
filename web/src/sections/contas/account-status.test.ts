import type { Account } from '@/types/contas';
import { statusTags } from './account-status';

const BASE: Account = {
  id: 'a',
  pessoaId: 'p',
  nome: 'Ana',
  emailLogin: 'ana@instituto.org.br',
  perfil: 'NUCLEO_PEDAGOGICO',
  ativo: true,
  deveTrocarSenha: false,
  bloqueadoAte: null,
  ultimoAcessoEm: null,
  setor: null,
};

const NOW = new Date('2026-10-20T12:00:00Z');

function labels(account: Account): string[] {
  return statusTags(account, NOW).map((tag) => tag.label);
}

describe('situacao da conta', () => {
  it('conta ativa sem pendencia', () => {
    expect(labels(BASE)).toEqual(['Ativa']);
  });

  it('conta desativada mostra so a desativacao', () => {
    expect(labels({ ...BASE, ativo: false, deveTrocarSenha: true })).toEqual(['Desativada']);
  });

  it('bloqueio vigente aparece; bloqueio vencido nao', () => {
    expect(labels({ ...BASE, bloqueadoAte: '2026-10-20T12:15:00Z' })[1]).toMatch(/^Bloqueada até/);
    expect(labels({ ...BASE, bloqueadoAte: '2026-10-20T11:00:00Z' })).toEqual(['Ativa']);
  });

  it('troca de senha pendente', () => {
    expect(labels({ ...BASE, deveTrocarSenha: true })).toEqual([
      'Ativa',
      'Troca de senha pendente',
    ]);
  });
});
