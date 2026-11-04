import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api';
import type { Report, ReportPreviewGoal } from '@/types/relatorios';
import {
  buildJustificationPayload,
  computePendingReportItems,
  finalizeFailureMessage,
  goalsWithChangedResult,
  initialRectificationJustifications,
  readReportPendencias,
  rectifyFailureMessage,
  requiresJustification,
} from './report-finalization';

const BASE_GOAL: ReportPreviewGoal = {
  id: 'meta-1',
  ordem: 1,
  origem: 'PROJETO',
  objetivo: 'Capacitar jovens',
  descricao: 'Capacitar jovens em dança',
  indicador: 'Jovens certificados',
  modalidadeAfericao: 'QUANTITATIVA',
  parametroPlanejado: '100',
  unidade: 'jovens',
  periodoInicio: '2026-01-01',
  periodoFim: '2026-06-30',
  situacao: 'CONCLUIDA',
  rascunho: false,
  resultado: {
    id: 'res-1',
    dataReferencia: '2026-06-30',
    descricao: 'Concluída',
    valorAlcancado: 100,
    parametroPlanejado: 100,
    percentual: 100,
    alcance: 'CUMPRIDA',
    registradoPor: { id: 'usr-1', nome: 'Ana' },
    registradoEm: '2026-06-30T10:00:00.000Z',
  },
  percentual: 100,
  status: 'CUMPRIDA',
};

describe('report-finalization helpers', () => {
  it('exige justificativa apenas para alcance parcial ou não cumprido', () => {
    expect(requiresJustification('CUMPRIDA')).toBe(false);
    expect(requiresJustification(null)).toBe(false);
    expect(requiresJustification('PARCIALMENTE_CUMPRIDA')).toBe(true);
    expect(requiresJustification('NAO_CUMPRIDA')).toBe(true);
  });

  it('lê pendências válidas do payload 422 e ignora itens malformados', () => {
    expect(readReportPendencias(null)).toEqual([]);
    expect(readReportPendencias({ pendencias: 'invalido' })).toEqual([]);

    const parsed = readReportPendencias({
      pendencias: [
        {
          metaId: 'meta-2',
          ordem: 2,
          descricao: 'Oficinas em escolas',
          motivo: 'SEM_JUSTIFICATIVA',
          alcance: 'PARCIALMENTE_CUMPRIDA',
          percentual: 50,
        },
        {
          metaId: 'meta-invalida',
          ordem: '2',
          descricao: 'Ignorada',
          motivo: 'OUTRO',
        },
      ],
    });

    expect(parsed).toEqual([
      {
        metaId: 'meta-2',
        ordem: 2,
        descricao: 'Oficinas em escolas',
        motivo: 'SEM_JUSTIFICATIVA',
        alcance: 'PARCIALMENTE_CUMPRIDA',
        percentual: 50,
      },
    ]);
  });

  it('calcula pendências ignorando rascunhos (RN-02) e textos só com espaços', () => {
    const goals: ReportPreviewGoal[] = [
      BASE_GOAL,
      {
        ...BASE_GOAL,
        id: 'meta-rascunho',
        ordem: 2,
        rascunho: true,
        resultado: null,
        status: null,
      },
      {
        ...BASE_GOAL,
        id: 'meta-sem-res',
        ordem: 3,
        descricao: 'Sem resultado',
        resultado: null,
        status: null,
      },
      {
        ...BASE_GOAL,
        id: 'meta-parcial',
        ordem: 4,
        descricao: 'Parcial',
        percentual: 50,
        status: 'PARCIALMENTE_CUMPRIDA',
      },
    ];

    expect(computePendingReportItems(goals, { 'meta-parcial': '   ' })).toEqual([
      {
        metaId: 'meta-sem-res',
        ordem: 3,
        descricao: 'Sem resultado',
        motivo: 'SEM_RESULTADO_REGISTRADO',
        alcance: null,
        percentual: null,
      },
      {
        metaId: 'meta-parcial',
        ordem: 4,
        descricao: 'Parcial',
        motivo: 'SEM_JUSTIFICATIVA',
        alcance: 'PARCIALMENTE_CUMPRIDA',
        percentual: 50,
      },
    ]);

    expect(computePendingReportItems(goals, { 'meta-parcial': '  Chuva intensa  ' })).toEqual([
      {
        metaId: 'meta-sem-res',
        ordem: 3,
        descricao: 'Sem resultado',
        motivo: 'SEM_RESULTADO_REGISTRADO',
        alcance: null,
        percentual: null,
      },
    ]);
  });

  it('monta payload aparado apenas para metas ativas que exigem justificativa', () => {
    const goals: ReportPreviewGoal[] = [
      BASE_GOAL,
      {
        ...BASE_GOAL,
        id: 'meta-2',
        ordem: 2,
        status: 'NAO_CUMPRIDA',
      },
    ];

    expect(
      buildJustificationPayload(goals, { 'meta-1': 'Ignorada', 'meta-2': '   ' }),
    ).toBeUndefined();
    expect(
      buildJustificationPayload(goals, {
        'meta-1': 'Ignorada',
        'meta-2': '  Atraso na licitação  ',
      }),
    ).toEqual([{ metaId: 'meta-2', texto: 'Atraso na licitação' }]);
  });

  it('traduz mensagens de falha da API na finalização', () => {
    expect(finalizeFailureMessage(new Error('rede'))).toContain('falar com o servidor');
    expect(finalizeFailureMessage(new ApiError(403, 'FORBIDDEN', 'Proibido'))).toContain(
      'Presidência e Gestão',
    );
    expect(
      finalizeFailureMessage(new ApiError(409, 'REPORT_ALREADY_FINALIZED', 'Já finalizado.')),
    ).toBe('Já finalizado.');
  });

  it('reaproveita na retificação apenas justificativa cujo resultado permaneceu o mesmo e indica mudança de resultado', () => {
    const report: Report = {
      id: 'rep-1',
      projetoId: 'proj-1',
      versao: 1,
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      relatorioAnteriorId: null,
      motivoRetificacao: null,
      emitidoPor: { id: 'usr-1', nome: 'Helena' },
      criadoEm: '2026-07-01T12:00:00.000Z',
      pdf: null,
      metas: [
        {
          id: 'rm-1',
          metaId: 'meta-estavel',
          resultadoMetaId: 'res-estavel',
          metaOrdem: 1,
          metaOrigem: 'PROJETO',
          metaObjetivo: 'Meta estável',
          metaDescricao: 'Descrição 1',
          metaIndicador: null,
          modalidadeAfericao: 'QUANTITATIVA',
          unidade: 'jovens',
          parametroPlanejado: 100,
          valorAlcancado: 70,
          percentual: 70,
          alcance: 'PARCIALMENTE_CUMPRIDA',
          resultadoDataReferencia: '2026-06-15',
          resultadoDescricao: '70 jovens',
          justificativa: 'Atraso de transporte escolar.',
        },
        {
          id: 'rm-2',
          metaId: 'meta-mudou',
          resultadoMetaId: 'res-antigo',
          metaOrdem: 2,
          metaOrigem: 'PROJETO',
          metaObjetivo: 'Meta revista',
          metaDescricao: 'Descrição 2',
          metaIndicador: null,
          modalidadeAfericao: 'QUANTITATIVA',
          unidade: 'jovens',
          parametroPlanejado: 100,
          valorAlcancado: 50,
          percentual: 50,
          alcance: 'PARCIALMENTE_CUMPRIDA',
          resultadoDataReferencia: '2026-06-15',
          resultadoDescricao: '50 jovens',
          justificativa: 'Chuva intensa na quinzena inicial.',
        },
      ],
    };

    const goals: ReportPreviewGoal[] = [
      {
        ...BASE_GOAL,
        id: 'meta-estavel',
        ordem: 1,
        status: 'PARCIALMENTE_CUMPRIDA',
        percentual: 70,
        resultado: { ...BASE_GOAL.resultado!, id: 'res-estavel', percentual: 70 },
      },
      {
        ...BASE_GOAL,
        id: 'meta-mudou',
        ordem: 2,
        status: 'PARCIALMENTE_CUMPRIDA',
        percentual: 80,
        resultado: { ...BASE_GOAL.resultado!, id: 'res-novo', percentual: 80 },
      },
    ];

    expect(initialRectificationJustifications(report, goals)).toEqual({
      'meta-estavel': 'Atraso de transporte escolar.',
    });
    expect(Array.from(goalsWithChangedResult(report, goals))).toEqual(['meta-mudou']);
  });

  it('traduz mensagens de falha da API na retificação sem vazar erro interno 500', () => {
    expect(rectifyFailureMessage(new Error('rede'))).toContain('falar com o servidor');
    expect(rectifyFailureMessage(new ApiError(403, 'FORBIDDEN', 'Proibido'))).toContain(
      'Presidência e Gestão',
    );
    expect(
      rectifyFailureMessage(
        new ApiError(
          409,
          'REPORT_NOT_LATEST_VERSION',
          'Apenas a versão mais recente do relatório pode ser retificada.',
        ),
      ),
    ).toBe('Apenas a versão mais recente do relatório pode ser retificada.');
    expect(rectifyFailureMessage(new ApiError(500, 'INTERNAL', 'TypeError: detalhe cru'))).toBe(
      'Não foi possível retificar o relatório. Tente de novo.',
    );
  });
});
