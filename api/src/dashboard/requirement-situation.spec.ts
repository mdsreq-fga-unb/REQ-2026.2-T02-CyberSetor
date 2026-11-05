import { AlcanceMeta, SituacaoMeta } from '../generated/prisma/enums.js';
import { requirementSituation } from './requirement-situation.js';

const DONE = { situacao: SituacaoMeta.CONCLUIDA, rascunho: false, alcance: null };

describe('requirementSituation', () => {
  it('sem meta vinculada', () => {
    expect(requirementSituation([])).toBe('SEM_META');
  });

  it('metas concluídas, com ou sem resultado cumprido', () => {
    expect(requirementSituation([DONE, { ...DONE, alcance: AlcanceMeta.CUMPRIDA }])).toBe(
      'ATENDIDO',
    );
  });

  it.each([SituacaoMeta.PENDENTE, SituacaoMeta.EM_ANDAMENTO])(
    'uma meta %s mantém o requisito pendente',
    (situacao) => {
      expect(requirementSituation([DONE, { ...DONE, situacao }])).toBe('PENDENTE');
    },
  );

  it.each([AlcanceMeta.PARCIALMENTE_CUMPRIDA, AlcanceMeta.NAO_CUMPRIDA])(
    'meta concluída com alcance %s não atende',
    (alcance) => {
      expect(requirementSituation([DONE, { ...DONE, alcance }])).toBe('PENDENTE');
    },
  );

  it('meta em rascunho não entra na conta (RN-02)', () => {
    expect(requirementSituation([{ ...DONE, rascunho: true }])).toBe('PENDENTE');
  });
});
