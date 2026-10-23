import { missingFields } from './goal-completion.js';

const complete = {
  indicador: 'Participantes com frequência mínima de 70%',
  formaComprovacao: 'Listas de presença',
  periodoInicio: new Date('2026-01-05T00:00:00.000Z'),
  periodoFim: new Date('2026-06-30T00:00:00.000Z'),
};

describe('completude da meta', () => {
  it('meta com indicador, comprovacao e periodo nao tem campo faltando', () => {
    expect(missingFields(complete)).toEqual([]);
  });

  it.each([['indicador'], ['formaComprovacao'], ['periodoInicio'], ['periodoFim']] as const)(
    'meta sem %s tem so ele na lista do que falta',
    (field) => {
      expect(missingFields({ ...complete, [field]: null })).toEqual([field]);
    },
  );
});
