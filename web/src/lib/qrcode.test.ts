import { describe, expect, it, vi } from 'vitest';
import { downloadDataUrl, generateQrCodeDataUrl } from './qrcode';

describe('qrcode', () => {
  it('gera data URL em base64 a partir do texto', async () => {
    const dataUrl = await generateQrCodeDataUrl('https://exemplo.org/inscrever/abc');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('dispara o download criando elemento <a> temporario com atributos corretos', () => {
    const clickSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    downloadDataUrl('data:image/png;base64,teste', 'qrcode-inscricao-teste.png');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });
});
