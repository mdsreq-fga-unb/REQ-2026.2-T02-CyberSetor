import { ApiError } from '@/lib/api';

export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 404, 409].includes(error.status)) return error.message;
  if (error.status === 403) return 'Só a administração do sistema gerencia contas.';
  if (error.status === 401) return 'Sessão encerrada. Entre novamente.';
  return 'Não foi possível concluir. Tente de novo.';
}
