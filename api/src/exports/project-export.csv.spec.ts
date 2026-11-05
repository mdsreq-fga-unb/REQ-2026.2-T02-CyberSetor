import { describe, expect, it } from 'vitest';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import {
  buildProjectExportCsv,
  exportFileName,
  type ExportActivity,
  type ExportGoal,
  type ProjectExportData,
} from './project-export.csv.js';

function makeGoal(overrides: Partial<ExportGoal> = {}): ExportGoal {
  return {
    ordem: 1,
    origem: OrigemMeta.EDITAL,
    objetivo: 'Formar jovens em oficinas artísticas',
    descricao: 'Realizar oficinas com 100 participantes',
    indicador: 'Participantes com frequência mínima de 75%',
    modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
    unidade: 'participantes',
    parametroPlanejado: '100',
    periodoInicio: '2025-01-10',
    periodoFim: '2025-06-30',
    situacao: SituacaoMeta.EM_ANDAMENTO,
    rascunho: false,
    resultados: [
      {
        dataReferencia: '2025-06-15',
        valorAlcancado: 80.5,
        parametroPlanejado: 100,
        percentual: 80.5,
        alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
        registradoEm: '2025-06-16T13:05:00.000Z',
      },
    ],
    ...overrides,
  };
}

function makeActivity(overrides: Partial<ExportActivity> = {}): ExportActivity {
  return {
    data: '2025-03-12',
    horaInicio: '09:00',
    horaFim: '12:00',
    cargaHorariaMinutos: 150,
    titulo: 'Oficina de música — Turma A',
    modalidade: 'Oficina contínua',
    local: 'Galpão Cultural SCS',
    responsavel: 'Ana Pedagógica',
    metas: [1, 2],
    ...overrides,
  };
}

function makeData(overrides: Partial<ProjectExportData> = {}): ProjectExportData {
  return {
    projeto: { codigo: 'P01', titulo: 'Oficinas Culturais no Setor' },
    periodo: { from: '2025-01-01', to: '2025-06-30' },
    visao: 'CONSOLIDADA',
    geradoEm: new Date('2026-11-05T14:30:00.000Z'),
    metas: [makeGoal()],
    atividades: [makeActivity()],
    ...overrides,
  };
}

function lines(csv: string): string[] {
  return csv.replace(/^﻿/, '').split('\r\n');
}

describe('buildProjectExportCsv (RF38, CA-13.1, CA-13.2, CA-13.5, CA-13.6)', () => {
  it('abre em UTF-8 com BOM, separa por ponto e vírgula e traz cabeçalho com a data de corte', () => {
    const csv = buildProjectExportCsv(makeData());
    expect(csv.startsWith('﻿')).toBe(true);
    const [titulo, projeto, periodo, visao, corte] = lines(csv);
    expect(titulo).toBe('Exportação de dados do projeto');
    expect(projeto).toBe('Projeto;P01 — Oficinas Culturais no Setor');
    expect(periodo).toBe('Período;01/01/2025 a 30/06/2025');
    expect(visao).toBe('Visão das metas;Consolidada');
    expect(corte).toBe('Data de corte;05/11/2026 11:30 (horário de Brasília)');
  });

  it('traz a legenda de cada campo das metas e das atividades (CA-13.2)', () => {
    const all = lines(buildProjectExportCsv(makeData()));
    expect(all).toContain('Legenda');
    expect(all).toContain('Seção;Campo;Descrição');
    expect(all).toContain(
      'Metas;Percentual (%);Valor alcançado sobre o planejado, vazio na meta qualitativa.',
    );
    expect(all.some((line) => line.startsWith('Atividades;Carga horária (h);'))).toBe(true);
  });

  it('visão consolidada: uma linha por meta, com números em formato brasileiro e resumo por alcance', () => {
    const csv = buildProjectExportCsv(
      makeData({
        metas: [
          makeGoal(),
          makeGoal({
            ordem: 2,
            modalidadeAfericao: ModalidadeAfericao.QUALITATIVA,
            parametroPlanejado: null,
            unidade: null,
            resultados: [
              {
                dataReferencia: '2025-05-20',
                valorAlcancado: null,
                parametroPlanejado: null,
                percentual: null,
                alcance: AlcanceMeta.CUMPRIDA,
                registradoEm: '2025-05-21T12:00:00.000Z',
              },
            ],
          }),
          makeGoal({ ordem: 3, resultados: [] }),
          makeGoal({ ordem: 4, rascunho: true, resultados: [] }),
        ],
      }),
    );
    const all = lines(csv);
    expect(all).toContain(
      '1;Edital;Formar jovens em oficinas artísticas;Realizar oficinas com 100 participantes;Participantes com frequência mínima de 75%;Quantitativa;participantes;100;10/01/2025;30/06/2025;Em andamento;Não;15/06/2025;80,5;100;80,5;Parcialmente cumprida;16/06/2025 10:05',
    );
    expect(
      all.some((line) => line.startsWith('2;') && line.endsWith(';Cumprida;21/05/2025 09:00')),
    ).toBe(true);
    expect(
      all.some((line) => line.startsWith('3;') && line.endsWith(';Em andamento;Não;;;;;;')),
    ).toBe(true);
    const resumo = all.indexOf('Resumo das metas');
    expect(all.slice(resumo + 1, resumo + 8)).toEqual([
      'Situação das metas;Quantidade',
      'Metas no período;4',
      'Cumprida;1',
      'Parcialmente cumprida;1',
      'Não cumprida;0',
      'Sem resultado registrado;1',
      'Em rascunho;1',
    ]);
  });

  it('visão analítica: uma linha por resultado registrado no período e sem resumo', () => {
    const goal = makeGoal({
      resultados: [
        {
          dataReferencia: '2025-03-31',
          valorAlcancado: 40,
          parametroPlanejado: 100,
          percentual: 40,
          alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
          registradoEm: '2025-04-01T12:00:00.000Z',
        },
        {
          dataReferencia: '2025-06-15',
          valorAlcancado: 100,
          parametroPlanejado: 100,
          percentual: 100,
          alcance: AlcanceMeta.CUMPRIDA,
          registradoEm: '2025-06-16T12:00:00.000Z',
        },
      ],
    });
    const all = lines(buildProjectExportCsv(makeData({ visao: 'ANALITICA', metas: [goal] })));
    expect(all).toContain('Visão das metas;Analítica');
    expect(all).toContain('Metas (visão analítica: cada resultado registrado no período)');
    expect(all.filter((line) => line.startsWith('1;Edital;'))).toHaveLength(2);
    expect(all).not.toContain('Resumo das metas');
  });

  it('lista as atividades com carga horária em horas e as metas vinculadas', () => {
    const all = lines(buildProjectExportCsv(makeData()));
    expect(all).toContain(
      '12/03/2025;09:00;12:00;2,5;Oficina de música — Turma A;Oficina contínua;Galpão Cultural SCS;Ana Pedagógica;1, 2',
    );
  });

  it('período sem registro gera o arquivo com a legenda, a data de corte e a indicação (CA-13.6)', () => {
    const all = lines(buildProjectExportCsv(makeData({ metas: [], atividades: [] })));
    expect(all.some((line) => line.startsWith('Data de corte;'))).toBe(true);
    expect(all).toContain('Legenda');
    expect(all.filter((line) => line === 'Sem registros no período.')).toHaveLength(2);
    expect(all).toContain('Metas no período;0');
  });

  it('protege aspas, quebras de linha e textos que virariam fórmula na planilha', () => {
    const all = buildProjectExportCsv(
      makeData({
        atividades: [
          makeActivity({
            titulo: '=HYPERLINK("http://x")',
            local: 'Sala 2; bloco "B"\nfundos',
            responsavel: '@Ana',
          }),
        ],
      }),
    );
    expect(all).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect(all).toContain('"Sala 2; bloco ""B""\nfundos"');
    expect(all).toContain(";'@Ana;");
  });
});

describe('exportFileName', () => {
  it('monta um nome seguro com o código do projeto, o período e a visão', () => {
    expect(exportFileName('P01', { from: '2025-01-01', to: '2025-06-30' }, 'CONSOLIDADA')).toBe(
      'exportacao-P01-2025-01-01-a-2025-06-30-consolidada.csv',
    );
    expect(
      exportFileName('Ação/2025 "A"', { from: '2025-01-01', to: '2025-01-31' }, 'ANALITICA'),
    ).toBe('exportacao-Acao-2025-A-2025-01-01-a-2025-01-31-analitica.csv');
  });
});
