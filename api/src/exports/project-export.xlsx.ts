import ExcelJS from 'exceljs';
import { buildProjectExportRows, type ProjectExportData } from './project-export.csv.js';

const SHEET_NAME = 'Exportação';
const COLUMN_WIDTH = 22;

/**
 * Planilha XLSX com as mesmas linhas do CSV (RF38, CA-13.1), que abre no Excel, no LibreOffice e no
 * Google Planilhas. Os números ficam como número, e o texto, como texto: nenhuma célula é fórmula.
 */
export async function buildProjectExportXlsx(data: ProjectExportData): Promise<Buffer> {
  const { rows, titleRows } = buildProjectExportRows(data);
  const workbook = new ExcelJS.Workbook();
  workbook.created = data.geradoEm;
  const sheet = workbook.addWorksheet(SHEET_NAME);

  for (const row of rows) {
    sheet.addRow(row.map((cell) => cell ?? undefined));
  }
  for (const index of titleRows) {
    sheet.getRow(index + 1).font = { bold: true };
  }
  const widest = Math.max(1, ...rows.map((row) => row.length));
  for (let column = 1; column <= widest; column += 1) {
    sheet.getColumn(column).width = COLUMN_WIDTH;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
