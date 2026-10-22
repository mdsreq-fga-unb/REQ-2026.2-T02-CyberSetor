import type { Goal } from '@/types/metas';
import { defaultFilter, filtersFor, matches, type Viewer } from './goal-filters';

const SETOR = { id: 's1', nome: 'Coordenação Pedagógica' };
const NUCLEO: Viewer = { usuarioId: 'u1', perfil: 'NUCLEO_PEDAGOGICO', setor: SETOR };

function goal(change: Partial<Goal>): Goal {
  return { responsavel: null, setor: null, alertaPrazo: null, ...change } as Goal;
}

describe('filtros das metas', () => {
  it('o nucleo entra no proprio setor; sem setor, nas suas; os demais em todas', () => {
    expect(defaultFilter(NUCLEO)).toBe('MEU_SETOR');
    expect(defaultFilter({ ...NUCLEO, setor: null })).toBe('MINHAS');
    expect(defaultFilter({ ...NUCLEO, perfil: 'PRESIDENCIA_GESTAO' })).toBe('TODAS');
    expect(defaultFilter({ ...NUCLEO, perfil: 'ADMINISTRATIVO_FINANCEIRO' })).toBe('TODAS');
  });

  it('do meu setor so aparece para quem tem setor', () => {
    expect(filtersFor(NUCLEO)).toEqual(['TODAS', 'MINHAS', 'MEU_SETOR', 'PRAZO']);
    expect(filtersFor({ ...NUCLEO, setor: null })).toEqual(['TODAS', 'MINHAS', 'PRAZO']);
  });

  it('cada filtro seleciona pelo responsavel, pelo setor ou pelo alerta de prazo', () => {
    const minha = goal({ responsavel: { id: 'u1', nome: 'Ana', ativo: true } });
    const doSetor = goal({ setor: { ...SETOR, ativo: true } });
    const vencida = goal({ alertaPrazo: 'VENCIDA' });

    expect([minha, doSetor, vencida].map((item) => matches(item, 'MINHAS', NUCLEO))).toEqual([
      true,
      false,
      false,
    ]);
    expect([minha, doSetor, vencida].map((item) => matches(item, 'MEU_SETOR', NUCLEO))).toEqual([
      false,
      true,
      false,
    ]);
    expect([minha, doSetor, vencida].map((item) => matches(item, 'PRAZO', NUCLEO))).toEqual([
      false,
      false,
      true,
    ]);
    expect([minha, doSetor, vencida].every((item) => matches(item, 'TODAS', NUCLEO))).toBe(true);
  });
});
