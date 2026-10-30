import type { Autorizacao, CanalPedido, ParticipantRegistration } from '@/types/participantes';

export const AUTORIZACAO_LABEL: Record<Autorizacao, string> = {
  COMUNICADOS: 'Comunicados',
  IMAGEM: 'Imagem e voz',
};

export const CANAL_LABEL: Record<CanalPedido, string> = {
  EMAIL: 'E-mail',
  TELEFONE: 'Telefone',
  WHATSAPP: 'WhatsApp',
  PRESENCIAL: 'Presencial',
  OUTRO: 'Outro',
};

/** Autorizações dadas no envio e ainda não revogadas: só elas podem ser revogadas. */
export function revocableOf(inscricao: ParticipantRegistration): Autorizacao[] {
  const list: Autorizacao[] = [];
  if (inscricao.autorizaComunicados && !inscricao.comunicadosRevogacao) list.push('COMUNICADOS');
  if (inscricao.autorizaImagem && !inscricao.imagemRevogacao) list.push('IMAGEM');
  return list;
}
