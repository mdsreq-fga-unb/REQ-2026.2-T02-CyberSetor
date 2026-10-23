import { missingText, requirementLabel } from './format';

describe('formatacao das metas', () => {
  it('lista o que falta para a meta sair do rascunho', () => {
    expect(missingText(['indicador', 'periodoFim'])).toBe('Falta: indicador, fim do período.');
  });

  it('identifica o requisito pela referencia ou, sem ela, pela descricao', () => {
    expect(
      requirementLabel({ id: '1', referencia: 'TR, item 24.1', descricao: 'Frequência' }),
    ).toBe('TR, item 24.1');
    expect(requirementLabel({ id: '2', referencia: null, descricao: 'Certificado' })).toBe(
      'Certificado',
    );
  });
});
