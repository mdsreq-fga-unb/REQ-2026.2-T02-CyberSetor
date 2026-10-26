import { describe, expect, it } from 'vitest';
import { generateQrCodeDataUrl } from './qrcode';

describe('qrcode', () => {
  it('gera data URL em base64 a partir do texto', async () => {
    const dataUrl = await generateQrCodeDataUrl('https://exemplo.org/inscrever/abc');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
