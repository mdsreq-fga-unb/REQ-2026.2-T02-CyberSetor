import { formatDate } from '@/lib/br';

/** Texto inicial da mensagem de divulgação, no formato que o Instituto já dispara: editável antes de enviar. */
export function shareMessage(
  activity: { titulo: string; data: string; local: string },
  url: string,
): string {
  return [
    `Inscrições abertas: ${activity.titulo}`,
    `${formatDate(activity.data)} · ${activity.local}`,
    '',
    `Inscreva-se pelo link: ${url}`,
  ].join('\n');
}

/** Abre o WhatsApp de quem divulga com a mensagem pronta; a pessoa escolhe para quem enviar. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
