import { isAllowedRecipient, parseAllowedRecipients } from './allowed-recipients.js';

describe('destinatários permitidos', () => {
  it('lista vazia não permite ninguém', () => {
    expect(isAllowedRecipient('ana@equipe.org', parseAllowedRecipients(''))).toBe(false);
  });

  it('aceita endereço exato sem diferenciar maiúsculas', () => {
    const lista = parseAllowedRecipients(' Ana@Equipe.org , bia@equipe.org');
    expect(isAllowedRecipient('ANA@equipe.org', lista)).toBe(true);
    expect(isAllowedRecipient('caio@equipe.org', lista)).toBe(false);
  });

  it('aceita domínio, com ou sem arroba, sem aceitar subdomínio', () => {
    expect(isAllowedRecipient('ana@equipe.org', ['@equipe.org'])).toBe(true);
    expect(isAllowedRecipient('ana@equipe.org', ['equipe.org'])).toBe(true);
    expect(isAllowedRecipient('ana@sub.equipe.org', ['equipe.org'])).toBe(false);
  });

  it('asterisco permite todos', () => {
    expect(isAllowedRecipient('ana@cybersetor.test', ['*'])).toBe(true);
  });
});
