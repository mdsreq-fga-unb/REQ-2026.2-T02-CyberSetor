import { ModalidadeAfericao } from '../generated/prisma/enums.js';
import { missingFields } from './goal-completion.js';

const complete = {
  indicador: 'Participantes com frequência mínima de 70%',
  modalidadeAfericao: null,
  parametroPlanejado: null,
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

  it('so a meta quantitativa exige o parametro planejado', () => {
    const quantitativa = { ...complete, modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA };
    expect(missingFields(quantitativa)).toEqual(['parametroPlanejado']);
    expect(missingFields({ ...quantitativa, parametroPlanejado: '120' })).toEqual([]);
    expect(
      missingFields({ ...complete, modalidadeAfericao: ModalidadeAfericao.QUALITATIVA }),
    ).toEqual([]);
  });
});
