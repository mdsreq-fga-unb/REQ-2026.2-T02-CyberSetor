import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ReportGoalItemResponse } from '../reports.dto.js';
import { buildReportDocument, type ReportForPdf } from './report-document.js';
import { fontAccessAllowed, ReportPdfRenderer } from './report-pdf.renderer.js';

function goal(overrides: Partial<ReportGoalItemResponse> = {}): ReportGoalItemResponse {
  return {
    id: 'item-1',
    metaId: 'meta-1',
    resultadoMetaId: 'resultado-1',
    metaOrdem: 1,
    metaOrigem: 'EDITAL',
    metaObjetivo: 'Formar jovens em oficinas artísticas',
    metaDescricao: 'Realizar oficinas com 100 participantes',
    metaIndicador: 'Participantes com frequência mínima de 75%',
    modalidadeAfericao: 'QUANTITATIVA',
    unidade: 'participantes',
    parametroPlanejado: 100,
    valorAlcancado: 80.5,
    percentual: 80.5,
    alcance: 'PARCIALMENTE_CUMPRIDA',
    resultadoDataReferencia: '2025-06-15',
    resultadoDescricao: '80 participantes com lista de presença.',
    justificativa: 'Calendário reduzido pela reforma do galpão.',
    ...overrides,
  };
}

const REPORT: ReportForPdf = {
  versao: 1,
  versaoAnterior: null,
  motivoRetificacao: null,
  periodoInicio: '2025-01-01',
  periodoFim: '2025-06-30',
  criadoEm: new Date('2025-07-02T17:30:00.000Z'),
  emitidoPorNome: 'Beatriz Gestão',
  projetoCodigo: 'P01',
  projetoTitulo: 'Oficinas Culturais no Setor',
  instrumentoTipo: 'PARCERIA',
  orgaoConcedente: 'Secretaria de Cultura do DF',
  numeroProcesso: '00150-00009999/2025-01',
  metas: [
    goal(),
    goal({
      id: 'item-2',
      metaId: 'meta-2',
      metaOrdem: 2,
      metaOrigem: 'PROJETO',
      metaIndicador: null,
      modalidadeAfericao: 'QUALITATIVA',
      unidade: null,
      parametroPlanejado: null,
      valorAlcancado: null,
      percentual: null,
      alcance: 'CUMPRIDA',
      justificativa: null,
    }),
  ],
};

describe('documento do relatório em PDF (RF37, CA-05b.1)', () => {
  it('leva identificação, sumário, metas, justificativas e a marca da versão sem evidências', () => {
    const text = JSON.stringify(buildReportDocument(REPORT).content);

    expect(text).toContain('Relatório de Execução do Objeto');
    expect(text).toContain(
      'Parceria · Secretaria de Cultura do DF · processo 00150-00009999/2025-01',
    );
    expect(text).toContain('P01 — Oficinas Culturais no Setor');
    expect(text).toContain('01/01/2025 a 30/06/2025');
    expect(text).toContain('Beatriz Gestão, em 02/07/2025, 14:30');
    expect(text).toContain('80,5 participantes');
    expect(text).toContain('80,5%');
    expect(text).toContain('Parcialmente cumprida');
    expect(text).toContain('Resultado em 15/06/2025: ');
    expect(text).toContain('Calendário reduzido pela reforma do galpão.');
    expect(text).not.toContain('Retifica');
  });

  it('conta as metas por alcance no sumário', () => {
    const text = JSON.stringify(buildReportDocument(REPORT).content);
    expect(text).toContain('"Cumprida",{"text":"1"');
    expect(text).toContain('"Parcialmente cumprida",{"text":"1"');
    expect(text).toContain('"Não cumprida",{"text":"0"');
    expect(text).toContain('{"text":"Metas apuradas","bold":true},{"text":"2"');
  });

  it('na retificação, mostra a versão anterior e o motivo', () => {
    const text = JSON.stringify(
      buildReportDocument({
        ...REPORT,
        versao: 2,
        versaoAnterior: 1,
        motivoRetificacao: 'Inclusão de comprovação consolidada depois do fechamento.',
      }).content,
    );
    expect(text).toContain('a versão 1');
    expect(text).toContain('Inclusão de comprovação consolidada depois do fechamento.');
  });

  it('marca o rodapé e fixa as datas do arquivo na emissão', () => {
    const document = buildReportDocument(REPORT);
    const footer = (document.footer as (page: number, pages: number) => unknown)(2, 3);
    expect(JSON.stringify(footer)).toContain('Versão sem evidências — v1');
    expect(JSON.stringify(footer)).toContain('Página 2 de 3');
    expect(document.info).toMatchObject({
      creationDate: REPORT.criadoEm,
      modDate: REPORT.criadoEm,
    });
  });
});

describe('gerador do PDF (RNF08)', () => {
  const renderer = new ReportPdfRenderer();

  it('gera um PDF e, para a mesma versão, sempre os mesmos bytes', async () => {
    const first = await renderer.render(buildReportDocument(REPORT));
    const second = await renderer.render(buildReportDocument(REPORT));

    expect(first.body.subarray(0, 5).toString()).toBe('%PDF-');
    expect(first.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(second.sha256).toBe(first.sha256);
  });

  it('não busca imagem por URL citada no documento', async () => {
    const document = buildReportDocument(REPORT);
    await expect(
      renderer.render({ ...document, content: [{ image: 'https://exemplo.test/logo.png' }] }),
    ).rejects.toThrow();
  });

  it('justificativa maior que uma pagina continua na pagina seguinte, sem cortar', async () => {
    const longa = 'Calendário reduzido pela reforma do galpão e remarcação das turmas. '.repeat(
      400,
    );
    const pdf = await new ReportPdfRenderer().render(
      buildReportDocument({
        ...REPORT,
        metas: [goal({ metaObjetivo: 'Objetivo longo '.repeat(200), justificativa: longa })],
      }),
    );

    const pages = pdf.body.toString('latin1').match(/\/Type \/Page\b(?!s)/g) ?? [];
    expect(pages.length).toBeGreaterThan(3);
  });

  it('so le arquivos dentro da pasta das fontes', () => {
    const font = createRequire(import.meta.url).resolve('pdfmake/fonts/Roboto/Roboto-Regular.ttf');
    expect(fontAccessAllowed(font)).toBe(true);
    expect(fontAccessAllowed(join(dirname(font), '..', '..', '..', '..', 'etc', 'passwd'))).toBe(
      false,
    );
    expect(fontAccessAllowed(`${dirname(font)}-evil/Roboto-Regular.ttf`)).toBe(false);
  });
});
