import type pdfmake from 'pdfmake';
import type { Content, TableCell } from 'pdfmake';
import type { AlcanceMeta, OrigemMeta, TipoInstrumento } from '../../generated/prisma/enums.js';
import type { ReportGoalItemResponse } from '../reports.dto.js';

export type ReportDocument = Parameters<typeof pdfmake.createPdf>[0];

/** Dados de uma versão emitida, todos da cópia gravada na emissão (RNF08). */
export interface ReportForPdf {
  versao: number;
  versaoAnterior: number | null;
  motivoRetificacao: string | null;
  periodoInicio: string;
  periodoFim: string;
  criadoEm: Date;
  emitidoPorNome: string;
  projetoCodigo: string;
  projetoTitulo: string;
  instrumentoTipo: TipoInstrumento;
  orgaoConcedente: string;
  numeroProcesso: string;
  metas: ReportGoalItemResponse[];
}

const INSTITUTO = 'Instituto Cultural e Social No Setor';
const TITULO = 'Relatório de Execução do Objeto';
const EVIDENCIAS = 'Versão sem evidências — v1';

const INSTRUMENT_TYPES: Record<TipoInstrumento, string> = {
  EDITAL: 'Edital',
  EMENDA: 'Emenda parlamentar',
  PARCERIA: 'Parceria',
};

const ORIGINS: Record<OrigemMeta, string> = {
  EDITAL: 'Edital',
  PROJETO: 'Projeto',
  INSTITUTO: 'Instituto',
};

const REACHES: Record<AlcanceMeta, string> = {
  CUMPRIDA: 'Cumprida',
  PARCIALMENTE_CUMPRIDA: 'Parcialmente cumprida',
  NAO_CUMPRIDA: 'Não cumprida',
};

const REACH_ORDER: AlcanceMeta[] = ['CUMPRIDA', 'PARCIALMENTE_CUMPRIDA', 'NAO_CUMPRIDA'];

const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function brDate(iso: string): string {
  return iso.split('-').reverse().join('/');
}

function quantity(value: number | null, unidade: string | null): string {
  if (value === null) return '—';
  return unidade ? `${NUMBER.format(value)} ${unidade}` : NUMBER.format(value);
}

function percent(value: number | null): string {
  return value === null ? '—' : `${NUMBER.format(value)}%`;
}

function header(label: string, value: string): TableCell[] {
  return [
    { text: label, style: 'label' },
    { text: value, style: 'value' },
  ];
}

function identification(report: ReportForPdf): Content {
  const rows: TableCell[][] = [
    header(
      'Instrumento',
      `${INSTRUMENT_TYPES[report.instrumentoTipo]} · ${report.orgaoConcedente} · processo ${report.numeroProcesso}`,
    ),
    header('Projeto', `${report.projetoCodigo} — ${report.projetoTitulo}`),
    header('Período', `${brDate(report.periodoInicio)} a ${brDate(report.periodoFim)}`),
    header('Versão', String(report.versao)),
    header('Emitido por', `${report.emitidoPorNome}, em ${DATE_TIME.format(report.criadoEm)}`),
  ];
  if (report.versaoAnterior !== null) {
    rows.push(header('Retifica', `a versão ${report.versaoAnterior}`));
    rows.push(header('Motivo', report.motivoRetificacao ?? '—'));
  }
  return {
    table: { widths: [80, '*'], body: rows },
    layout: 'noBorders',
    margin: [0, 0, 0, 16],
  };
}

function summary(metas: ReportGoalItemResponse[]): Content {
  const count = (reach: AlcanceMeta) => metas.filter((meta) => meta.alcance === reach).length;
  const rows: TableCell[][] = REACH_ORDER.map((reach) => [
    REACHES[reach],
    { text: String(count(reach)), alignment: 'right' },
  ]);
  rows.push([
    { text: 'Metas apuradas', bold: true },
    { text: String(metas.length), alignment: 'right', bold: true },
  ]);
  return [
    { text: 'Sumário', style: 'section' },
    {
      table: { widths: ['*', 60], body: rows },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    },
  ];
}

function goalsTable(metas: ReportGoalItemResponse[]): Content {
  const head: TableCell[] = [
    { text: 'Meta', style: 'tableHeader' },
    ...['Planejado', 'Alcançado', '%'].map<TableCell>((text) => ({
      text,
      style: 'tableHeader',
      alignment: 'right',
    })),
    { text: 'Alcance', style: 'tableHeader' },
  ];
  const rows: TableCell[][] = metas.map((meta) => [
    {
      stack: [
        { text: `${meta.metaOrdem}. ${meta.metaObjetivo}`, bold: true },
        {
          text: [ORIGINS[meta.metaOrigem], meta.metaIndicador].filter(Boolean).join(' · '),
          style: 'muted',
        },
      ],
    },
    { text: quantity(meta.parametroPlanejado, meta.unidade), alignment: 'right' },
    { text: quantity(meta.valorAlcancado, meta.unidade), alignment: 'right' },
    { text: percent(meta.percentual), alignment: 'right' },
    REACHES[meta.alcance],
  ]);
  return [
    { text: 'Metas pactuadas e resultados', style: 'section' },
    {
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['*', 62, 62, 40, 70],
        body: [head, ...rows],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    },
  ];
}

function details(metas: ReportGoalItemResponse[]): Content {
  return [
    { text: 'Resultado e justificativa de cada meta', style: 'section' },
    ...metas.map<Content>((meta) => ({
      stack: [
        { text: `Meta ${meta.metaOrdem}. ${meta.metaObjetivo}`, bold: true },
        { text: meta.metaDescricao, style: 'muted' },
        {
          text: [
            { text: `Resultado em ${brDate(meta.resultadoDataReferencia)}: `, bold: true },
            meta.resultadoDescricao,
          ],
        },
        ...(meta.justificativa
          ? [{ text: [{ text: 'Justificativa: ', bold: true }, meta.justificativa] }]
          : []),
      ],
      margin: [0, 0, 0, 10],
      unbreakable: true,
    })),
  ];
}

/** Documento do pdfmake para uma versão do relatório (RF37, CA-05b.1), sem miniaturas (#133). */
export function buildReportDocument(report: ReportForPdf): ReportDocument {
  const label = `${report.projetoCodigo} · versão ${report.versao}`;
  return {
    pageSize: 'A4',
    pageMargins: [40, 56, 40, 48],
    // Datas fixas na emissão: a mesma versão gera sempre os mesmos bytes (RNF08).
    info: {
      title: `${TITULO} · ${label}`,
      author: INSTITUTO,
      creationDate: report.criadoEm,
      modDate: report.criadoEm,
    },
    header: () => ({
      columns: [
        { text: INSTITUTO, style: 'running' },
        { text: label, style: 'running', alignment: 'right' },
      ],
      margin: [40, 24, 40, 0],
    }),
    footer: (page: number, pages: number) => ({
      columns: [
        { text: EVIDENCIAS, style: 'running' },
        { text: `Página ${page} de ${pages}`, style: 'running', alignment: 'right' },
      ],
      margin: [40, 16, 40, 0],
    }),
    content: [
      { text: TITULO, style: 'title' },
      identification(report),
      summary(report.metas),
      goalsTable(report.metas),
      details(report.metas),
    ],
    defaultStyle: { font: 'Roboto', fontSize: 9, lineHeight: 1.2 },
    styles: {
      title: { fontSize: 16, bold: true, margin: [0, 0, 0, 12] },
      section: { fontSize: 11, bold: true, margin: [0, 4, 0, 6] },
      label: { bold: true, color: '#475569' },
      value: {},
      muted: { color: '#64748b', fontSize: 8 },
      tableHeader: { bold: true, color: '#334155' },
      running: { fontSize: 7, color: '#64748b' },
    },
  };
}
