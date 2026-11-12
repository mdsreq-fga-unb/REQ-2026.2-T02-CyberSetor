/** Lista por vírgula: `*`, endereço exato ou domínio (`equipe.org` ou `@equipe.org`). */
export function parseAllowedRecipients(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item !== '');
}

export function isAllowedRecipient(email: string, allowed: readonly string[]): boolean {
  const address = email.trim().toLowerCase();
  const domain = address.slice(address.lastIndexOf('@') + 1);
  return allowed.some(
    (item) => item === '*' || item === address || item.replace(/^@/, '') === domain,
  );
}
