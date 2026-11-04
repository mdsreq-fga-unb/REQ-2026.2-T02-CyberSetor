import { describe, expect, it } from 'vitest';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import type { ReportPreviewGoalResponse } from '../projects/report-preview.dto.js';
import {
  evaluateReportGoals,
  requiresJustification,
  type PreviousGoalJustification,
} from './report-finalization.js';

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
          registradoPor: {
            id: '33333333-3333-4333-8333-333333333333',
            nome: 'Ana Pedagógica',
          },
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

  it('recusa emissão quando não há metas ativas no período', () => {
    expect(evaluateReportGoals([])).toEqual({ kind: 'no_active_goals' });

    const apenasRascunho = makeGoal({
      id: 'meta-rascunho',
      rascunho: true,
      indicador: null,
      resultado: null,
      status: null,
    });
    expect(evaluateReportGoals([apenasRascunho])).toEqual({ kind: 'no_active_goals' });
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

  it('rejeita justificativa para meta de outro projeto, outro período ou em rascunho', () => {
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

  it('herda justificativa na retificação apenas quando resultadoMetaId não mudou', () => {
    const mesmoResultado = makeGoal({
      id: 'meta-mesmo-res',
      ordem: 1,
      status: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
      percentual: 50,
      resultado: {
        id: 'res-v1',
        dataReferencia: '2026-06-15',
        descricao: '50 participantes.',
        valorAlcancado: 50,
        parametroPlanejado: 100,
        percentual: 50,
        alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
        registradoPor: { id: 'usr-1', nome: 'Ana Pedagógica' },
        registradoEm: '2026-06-15T14:00:00.000Z',
      },
    });
    const novoResultadoParcial = makeGoal({
      id: 'meta-novo-res',
      ordem: 2,
      descricao: 'Meta que subiu de 50% para 80%',
      status: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
      percentual: 80,
      resultado: {
        id: 'res-v2-novo',
        dataReferencia: '2026-06-28',
        descricao: '80 participantes.',
        valorAlcancado: 80,
        parametroPlanejado: 100,
        percentual: 80,
        alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
        registradoPor: { id: 'usr-1', nome: 'Ana Pedagógica' },
        registradoEm: '2026-06-28T14:00:00.000Z',
      },
    });

    const anteriores = new Map<string, PreviousGoalJustification>([
      ['meta-mesmo-res', { resultadoMetaId: 'res-v1', justificativa: 'Chuva na semana 2' }],
      ['meta-novo-res', { resultadoMetaId: 'res-antigo', justificativa: 'Chuva para 50%' }],
    ]);

    // Sem nova justificativa para a meta cujo resultado mudou: bloqueia!
    const bloqueado = evaluateReportGoals([mesmoResultado, novoResultadoParcial], [], anteriores);
    expect(bloqueado).toEqual({
      kind: 'blocked',
      pendencias: [
        {
          metaId: 'meta-novo-res',
          ordem: 2,
          descricao: 'Meta que subiu de 50% para 80%',
          motivo: 'SEM_JUSTIFICATIVA',
          alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
          percentual: 80,
        },
      ],
    });

    // Fornecendo justificativa para o novo resultado, herda apenas a da meta inalterada
    const aprovado = evaluateReportGoals(
      [mesmoResultado, novoResultadoParcial],
      [{ metaId: 'meta-novo-res', texto: 'Faltaram 20 vagas após reposição.' }],
      anteriores,
    );
    expect(aprovado.kind).toBe('ready');
    if (aprovado.kind === 'ready') {
      expect(aprovado.metas[0]?.justificativa).toBe('Chuva na semana 2');
      expect(aprovado.metas[1]?.justificativa).toBe('Faltaram 20 vagas após reposição.');
    }
  });
});
