/** Prazo de inscrição comparável como texto: "AAAA-MM-DD HH:MM", no horário de Brasília. */
export function deadlineOf(prazo: string, hora: string | null): string {
  return `${prazo} ${hora ?? '23:59'}`;
}

/** Agora no horário de Brasília, no mesmo formato do prazo. */
export function nowInBrasilia(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`;
}

/** Aberta até o fim do minuto do prazo; sem prazo, não encerra por data. */
export function withinDeadline(
  prazo: string | null,
  hora: string | null,
  now: Date = new Date(),
): boolean {
  return prazo === null || nowInBrasilia(now) <= deadlineOf(prazo, hora);
}
