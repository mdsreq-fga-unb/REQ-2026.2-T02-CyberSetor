import { AlcanceMeta } from '../generated/prisma/enums.js';
import { percentOf, plannedNumber, reachOf } from './goal-result.js';

describe('resultado alcançado da meta', () => {
  it.each([
    ['120', 120],
    ['12,5', 12.5],
    ['12.75', 12.75],
    ['0', null],
    ['12,555', null],
    ['cento e vinte', null],
    ['-3', null],
  ])('parametro planejado %s vira %s', (value, expected) => {
    expect(plannedNumber(value)).toBe(expected);
  });

  it('percentual sobre o planejado, com duas casas e sem teto', () => {
    expect(percentOf(84, 120)).toBe(70);
    expect(percentOf(1, 3)).toBe(33.33);
    expect(percentOf(150, 120)).toBe(125);
  });

  it.each([
    [125, AlcanceMeta.CUMPRIDA],
    [100, AlcanceMeta.CUMPRIDA],
    [99.99, AlcanceMeta.PARCIALMENTE_CUMPRIDA],
    [0.5, AlcanceMeta.PARCIALMENTE_CUMPRIDA],
    [0, AlcanceMeta.NAO_CUMPRIDA],
  ])('classificacao de %s%%', (percent, expected) => {
    expect(reachOf(percent)).toBe(expected);
  });
});
