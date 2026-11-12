import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { buildProjectExportCsv, type ProjectExportData } from './project-export.csv.js';
import { buildProjectExportXlsx } from './project-export.xlsx.js';

type XlsxInput = Parameters<ExcelJS.Xlsx['load']>[0];

const DATA: ProjectExportData = {
  projeto: { codigo: 'P01', titulo: 'Oficinas' },
  periodo: { from: '2025-04-01', to: '2025-06-30' },
  visao: 'CONSOLIDADA',
  geradoEm: new Date('2025-07-01T13:00:00Z'),
  metas: [
    {
      ordem: 1,
      origem: 'EDITAL',
      objetivo: '=HYPERLINK("http://exemplo.test")',
      descricao: 'Formar 100 pessoas',
      indicador: 'Pessoas formadas',
      modalidadeAfericao: 'QUANTITATIVA',
      unidade: 'pessoas',
      parametroPlanejado: '100',
      periodoInicio: '2025-01-10',
      periodoFim: '2025-06-30',
      situacao: 'EM_ANDAMENTO',
      rascunho: false,
      resultados: [
        {
          dataReferencia: '2025-06-20',
          valorAlcancado: 90.5,
          parametroPlanejado: 100,
          percentual: 90.5,
          alcance: 'PARCIALMENTE_CUMPRIDA',
          registradoEm: '2025-06-21T15:00:00.000Z',
        },
      ],
    },
  ],
  atividades: [],
};

async function load(data: ProjectExportData): Promise<ExcelJS.Worksheet> {
  const workbook = new ExcelJS.Workbook();
  // O tipo do exceljs é anterior ao Buffer genérico do Node.
  await workbook.xlsx.load((await buildProjectExportXlsx(data)) as unknown as XlsxInput);
  const sheet = workbook.getWorksheet('Exportação');
  if (!sheet) throw new Error('planilha ausente');
  return sheet;
}

function rowStarting(sheet: ExcelJS.Worksheet, first: unknown): ExcelJS.Row | undefined {
  let found: ExcelJS.Row | undefined;
  sheet.eachRow((row) => {
    if (!found && row.getCell(1).value === first) found = row;
  });
  return found;
}

describe('buildProjectExportXlsx (RF38, CA-13.1)', () => {
  it('traz as mesmas linhas não vazias do CSV, com os títulos de seção em negrito', async () => {
    const sheet = await load(DATA);
    const csvLines = buildProjectExportCsv(DATA)
      .replace(/^\uFEFF/, '')
      .split('\r\n')
      .filter((line) => line !== '');
    expect(sheet.actualRowCount).toBe(csvLines.length);
    expect(rowStarting(sheet, 'Legenda')?.font?.bold).toBe(true);
    expect(rowStarting(sheet, 'Atividades do período')?.font?.bold).toBe(true);
    expect(rowStarting(sheet, 'Sem registros no período.')).toBeDefined();
  });

  it('guarda números como número e texto que pareceria fórmula como texto', async () => {
    const sheet = await load(DATA);
    const meta = rowStarting(sheet, 1);
    expect(meta?.getCell(3).value).toBe('=HYPERLINK("http://exemplo.test")');
    expect(meta?.getCell(3).formula).toBeUndefined();
    expect(meta?.getCell(14).value).toBe(90.5);
    expect(meta?.getCell(16).value).toBe(90.5);
  });
});
