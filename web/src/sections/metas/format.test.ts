import { missingText, plannedNumber, reachOf, requirementLabel, resultText } from './format';

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

  it('le o parametro planejado numerico e classifica o alcance pelo percentual', () => {
    expect(plannedNumber('12,5')).toBe(12.5);
    expect(plannedNumber('cento e vinte')).toBeNull();
    expect(plannedNumber('0')).toBeNull();
    expect([reachOf(100), reachOf(99.5), reachOf(0)]).toEqual([
      'CUMPRIDA',
      'PARCIALMENTE_CUMPRIDA',
      'NAO_CUMPRIDA',
    ]);
  });

  it('descreve o resultado pelo valor e percentual ou, na qualitativa, so pelo alcance', () => {
    const base = {
      id: 'r1',
      dataReferencia: '2026-06-30',
      descricao: 'x',
      registradoPor: { id: 'u1', nome: 'Ana' },
      registradoEm: '2026-06-30T12:00:00.000Z',
    };
    expect(
      resultText(
        {
          ...base,
          valorAlcancado: 12.5,
          parametroPlanejado: 10,
          percentual: 125,
          alcance: 'CUMPRIDA',
        },
        'turmas',
      ),
    ).toBe('12,5 de 10 turmas (125%) · Cumprida');
    expect(
      resultText(
        {
          ...base,
          valorAlcancado: null,
          parametroPlanejado: null,
          percentual: null,
          alcance: 'NAO_CUMPRIDA',
        },
        null,
      ),
    ).toBe('Não cumprida');
  });
});
