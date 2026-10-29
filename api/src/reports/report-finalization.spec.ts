import { describe, expect, it } from 'vitest';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import type { ReportPreviewGoalResponse } from '../projects/report-preview.dto.js';
import { evaluateReportGoals, requiresJustification } from './report-finalization.js';

function makeGoal(overrides: Partial<ReportPreviewGoalResponse> = {}): ReportPreviewGoalResponse {
  const alcance = overrides.status !== undefined ? overrides.status : AlcanceMeta.CUMPRIDA;
  const hasResult =
    overrides.resultado !== undefined ? overrides.resultado !== null : alcance !== null;

  return {
    id: overrides.id ?? '11111111-1111-4111-8111-111111111111',
    ordem: overrides.ordem ?? 1,
    origem: overrides.origem ?? OrigemMeta.EDITAL,
    objetivo: overrides.objetivo ?? 'Formar jovens em oficinas culturais',
    descricao: overrides.descricao ?? 'Realizar oficinas com 100 participantes',
    indicador: overrides.indicador !== undefined ? overrides.indicador : 'Frequência mínima de 75%',
    modalidadeAfericao:
      overrides.modalidadeAfericao !== undefined
        ? overrides.modalidadeAfericao
        : ModalidadeAfericao.QUANTITATIVA,
    parametroPlanejado:
      overrides.parametroPlanejado !== undefined ? overrides.parametroPlanejado : '100',
    unidade: overrides.unidade !== undefined ? overrides.unidade : 'participantes',
    periodoInicio: overrides.periodoInicio !== undefined ? overrides.periodoInicio : '2026-01-01',
    periodoFim: overrides.periodoFim !== undefined ? overrides.periodoFim : '2026-06-30',
    situacao: overrides.situacao ?? SituacaoMeta.EM_ANDAMENTO,
    rascunho: overrides.rascunho ?? false,
    resultado: hasResult
      ? (overrides.resultado ?? {
          id: '22222222-2222-4222-8222-222222222222',
          dataReferencia: '2026-06-15',
          descricao: 'Oficinas concluídas conforme cronograma.',
          valorAlcancado: 100,
          parametroPlanejado: 100,
          percentual: 100,
          alcance: alcance ?? AlcanceMeta.CUMPRIDA,
          registradoPor: { id: '33333333-3333-4333-8333-333333333333', nome: 'Ana Pedagógica' },
          registradoEm: '2026-06-15T14:00:00.000Z',
        })
      : null,
    percentual: overrides.percentual !== undefined ? overrides.percentual : hasResult ? 100 : null,
    status: alcance,
  };
}

describe('report-finalization (RN-02, RN-11, CA-05a.2, CA-05a.7)', () => {
  it('identifica quais classificações de alcance exigem justificativa', () => {
    expect(requiresJustification(AlcanceMeta.CUMPRIDA)).toBe(false);
    expect(requiresJustification(null)).toBe(false);
    expect(requiresJustification(AlcanceMeta.PARCIALMENTE_CUMPRIDA)).toBe(true);
    expect(requiresJustification(AlcanceMeta.NAO_CUMPRIDA)).toBe(true);
  });

  it('ignora metas em rascunho (RN-02) mesmo sem resultado registrado', () => {
    const cumprida = makeGoal({ id: 'meta-1', ordem: 1, status: AlcanceMeta.CUMPRIDA });
    const rascunho = makeGoal({
      id: 'meta-2',
      ordem: 2,
      rascunho: true,
      indicador: null,
      resultado: null,
      percentual: null,
      status: null,
    });

    const evalResult = evaluateReportGoals([cumprida, rascunho]);
    expect(evalResult.kind).toBe('ready');
    if (evalResult.kind === 'ready') {
      expect(evalResult.metas).toHaveLength(1);
      expect(evalResult.metas[0]?.goal.id).toBe('meta-1');
    }
  });

  it('bloqueia quando há meta ativa sem resultado registrado (CA-05a.7)', () => {
    const semResultado = makeGoal({
      id: 'meta-sem-res',
      ordem: 2,
      descricao: 'Apresentação aberta ao público',
      resultado: null,
      percentual: null,
      status: null,
    });

    const evalResult = evaluateReportGoals([semResultado]);
    expect(evalResult).toEqual({
      kind: 'blocked',
      pendencias: [
        {
          metaId: 'meta-sem-res',
          ordem: 2,
          descricao: 'Apresentação aberta ao público',
          motivo: 'SEM_RESULTADO_REGISTRADO',
          alcance: null,
          percentual: null,
        },
      ],
    });
  });

  it('bloqueia metas parcialmente cumpridas ou não cumpridas sem justificativa (CA-05a.2)', () => {
    const parcial = makeGoal({
      id: 'meta-parcial',
      ordem: 1,
      descricao: 'Meta parcial',
      percentual: 75,
      status: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    });
    const naoCumprida = makeGoal({
      id: 'meta-zero',
      ordem: 2,
      descricao: 'Meta não cumprida',
      percentual: 0,
      status: AlcanceMeta.NAO_CUMPRIDA,
    });

    const bloqueado = evaluateReportGoals([parcial, naoCumprida]);
    expect(bloqueado).toEqual({
      kind: 'blocked',
      pendencias: [
        {
          metaId: 'meta-parcial',
          ordem: 1,
          descricao: 'Meta parcial',
          motivo: 'SEM_JUSTIFICATIVA',
          alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
          percentual: 75,
        },
        {
          metaId: 'meta-zero',
          ordem: 2,
          descricao: 'Meta não cumprida',
          motivo: 'SEM_JUSTIFICATIVA',
          alcance: AlcanceMeta.NAO_CUMPRIDA,
          percentual: 0,
        },
      ],
    });

    const aprovado = evaluateReportGoals(
      [parcial, naoCumprida],
      [
        { metaId: 'meta-parcial', texto: '  Atraso na entrega de insumos  ' },
        { metaId: 'meta-zero', texto: 'Interdição temporária do espaço cultural' },
      ],
    );
    expect(aprovado.kind).toBe('ready');
    if (aprovado.kind === 'ready') {
      expect(aprovado.metas[0]?.justificativa).toBe('Atraso na entrega de insumos');
      expect(aprovado.metas[1]?.justificativa).toBe('Interdição temporária do espaço cultural');
    }
  });

  it('rejeita justificativa para meta de outro projeto ou em rascunho', () => {
    const cumprida = makeGoal({ id: 'meta-1' });
    const rascunho = makeGoal({
      id: 'meta-rascunho',
      rascunho: true,
      resultado: null,
      status: null,
    });

    expect(
      evaluateReportGoals([cumprida, rascunho], [{ metaId: 'meta-estranha', texto: 'Motivo' }]),
    ).toEqual({ kind: 'invalid_goal', metaId: 'meta-estranha' });

    expect(
      evaluateReportGoals([cumprida, rascunho], [{ metaId: 'meta-rascunho', texto: 'Motivo' }]),
    ).toEqual({ kind: 'invalid_goal', metaId: 'meta-rascunho' });
  });

  it('rejeita justificativa para meta cumprida', () => {
    const cumprida = makeGoal({ id: 'meta-cumprida', status: AlcanceMeta.CUMPRIDA });

    expect(
      evaluateReportGoals([cumprida], [{ metaId: 'meta-cumprida', texto: 'Desnecessária' }]),
    ).toEqual({ kind: 'justification_not_applicable', metaId: 'meta-cumprida' });
  });

  it('aproveita justificativa herdada da versão anterior na retificação e descarta se meta virou cumprida', () => {
    const parcial = makeGoal({
      id: 'meta-parcial',
      status: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
      percentual: 80,
    });
    const agoraCumprida = makeGoal({
      id: 'meta-recuperada',
      ordem: 2,
      status: AlcanceMeta.CUMPRIDA,
      percentual: 100,
    });

    const herdadas = new Map<string, string>([
      ['meta-parcial', 'Justificativa da v1'],
      ['meta-recuperada', 'Justificativa antiga antes de atingir 100%'],
    ]);

    const res = evaluateReportGoals([parcial, agoraCumprida], [], herdadas);
    expect(res.kind).toBe('ready');
    if (res.kind === 'ready') {
      expect(res.metas[0]?.justificativa).toBe('Justificativa da v1');
      expect(res.metas[1]?.justificativa).toBeNull();
    }
  });
});
