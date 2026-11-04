import type { Account } from '@/types/contas';

export interface StatusTag {
  label: string;
  tone: 'default' | 'secondary' | 'destructive' | 'outline';
}

const TIME = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function statusTags(account: Account, now: Date = new Date()): StatusTag[] {
  if (!account.ativo) return [{ label: 'Desativada', tone: 'outline' }];
  const tags: StatusTag[] = [{ label: 'Ativa', tone: 'secondary' }];
  if (account.bloqueadoAte && new Date(account.bloqueadoAte) > now) {
    tags.push({
      label: `Bloqueada até ${TIME.format(new Date(account.bloqueadoAte))}`,
      tone: 'destructive',
    });
  }
  if (account.deveTrocarSenha) tags.push({ label: 'Troca de senha pendente', tone: 'default' });
  return tags;
}
