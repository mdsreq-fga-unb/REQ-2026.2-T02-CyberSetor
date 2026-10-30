import { describe, expect, it } from 'vitest';
import { shareMessage, whatsappShareUrl } from './share-message';

describe('mensagem de divulgacao', () => {
  it('monta a mensagem com titulo, data, local e link', () => {
    expect(
      shareMessage(
        { titulo: 'Oficina de serigrafia', data: '2026-11-10', local: 'Setor Comercial Sul' },
        'https://exemplo.org/inscrever/abc',
      ),
    ).toBe(
      'Inscrições abertas: Oficina de serigrafia\n10/11/2026 · Setor Comercial Sul\n\nInscreva-se pelo link: https://exemplo.org/inscrever/abc',
    );
  });

  it('codifica a mensagem no link do WhatsApp', () => {
    expect(whatsappShareUrl('Oficina & mostra\nlink')).toBe(
      'https://wa.me/?text=Oficina%20%26%20mostra%0Alink',
    );
  });
});
