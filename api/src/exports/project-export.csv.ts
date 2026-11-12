import type {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import { brIsoDate } from '../reports/reports.service.js';

/** Visões das metas na exportação (RF38, CA-13.5). */
export const VISOES_METAS = ['ANALITICA', 'CONSOLIDADA'] as const;
export type VisaoMetas = (typeof VISOES_METAS)[number];

export interface ExportGoalResult {
  dataReferencia: string;
  valorAlcancado: number | null;
  parametroPlanejado: number | null;
  percentual: number | null;
  alcance: AlcanceMeta;
  registradoEm: string;
}

export interface ExportGoal {
  ordem: number;
  origem: OrigemMeta;
  objetivo: string;
  descricao: string;
  indicador: string | null;
  modalidadeAfericao: ModalidadeAfericao | null;
  unidade: string | null;
  parametroPlanejado: string | null;
  periodoInicio: string | null;
  periodoFim: string | null;
  situacao: SituacaoMeta;
  rascunho: boolean;
  /** Consolidada: o último resultado até o fim do período. Analítica: cada registro do período. */
  resultados: ExportGoalResult[];
}

export interface ExportActivity {
  data: string;
  horaInicio: string | null;
  horaFim: string | null;
  cargaHorariaMinutos: number | null;
  titulo: string;
  modalidade: string;
  local: string;
  responsavel: string;
  metas: number[];
}

export interface ProjectExportData {
  projeto: { codigo: string; titulo: string };
  periodo: { from: string; to: string };
  visao: VisaoMetas;
  geradoEm: Date;
  metas: ExportGoal[];
  atividades: ExportActivity[];
}

export type Cell = string | number | null;

const SEPARATOR = ';';
const LINE_BREAK = '\r\n';
/** BOM para o Excel reconhecer o UTF-8 e mostrar os acentos. */
const BOM = '\uFEFF';
const EMPTY_PERIOD = 'Sem registros no período.';

const VIEWS: Record<VisaoMetas, string> = {
  ANALITICA: 'Analítica',
  CONSOLIDADA: 'Consolidada',
};

const ORIGINS: Record<OrigemMeta, string> = {
  EDITAL: 'Edital',
  PROJETO: 'Projeto',
  INSTITUTO: 'Instituto',
};

const MEASUREMENTS: Record<ModalidadeAfericao, string> = {
  QUANTITATIVA: 'Quantitativa',
  QUALITATIVA: 'Qualitativa',
};

const SITUATIONS: Record<SituacaoMeta, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
};

const REACHES: Record<AlcanceMeta, string> = {
  CUMPRIDA: 'Cumprida',
  PARCIALMENTE_CUMPRIDA: 'Parcialmente cumprida',
  NAO_CUMPRIDA: 'Não cumprida',
};

const REACH_ORDER: AlcanceMeta[] = ['CUMPRIDA', 'PARCIALMENTE_CUMPRIDA', 'NAO_CUMPRIDA'];

const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, useGrouping: false });

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const GOAL_COLUMNS = [
  ['Ordem', 'Número da meta no plano de trabalho.'],
  ['Origem', 'Edital, Projeto ou Instituto.'],
  ['Objetivo', 'Objetivo pactuado da meta.'],
  ['Descrição', 'Descrição pactuada da meta.'],
  ['Indicador', 'Indicador de verificação da meta.'],
  ['Aferição', 'Quantitativa (com percentual) ou Qualitativa (sem percentual).'],
  ['Unidade', 'Unidade do parâmetro planejado.'],
  ['Planejado', 'Parâmetro planejado da meta.'],
  ['Início da meta', 'Início do prazo da meta (dd/mm/aaaa).'],
  ['Fim da meta', 'Fim do prazo da meta (dd/mm/aaaa).'],
  ['Situação', 'Pendente, Em andamento ou Concluída.'],
  ['Em rascunho', 'Sim quando faltam campos da meta, que assim não entra na apuração.'],
  ['Data de referência', 'Data a que o resultado se refere (dd/mm/aaaa).'],
  ['Valor alcançado', 'Valor registrado no resultado, vazio na meta qualitativa.'],
  ['Planejado no registro', 'Parâmetro planejado vigente quando o resultado foi registrado.'],
  ['Percentual (%)', 'Valor alcançado sobre o planejado, vazio na meta qualitativa.'],
  ['Alcance', 'Cumprida, Parcialmente cumprida ou Não cumprida.'],
  ['Registrado em', 'Data e hora do registro do resultado (horário de Brasília).'],
] as const;

const ACTIVITY_COLUMNS = [
  ['Data', 'Data da atividade (dd/mm/aaaa).'],
  ['Início', 'Hora de início (hh:mm).'],
  ['Fim', 'Hora de fim (hh:mm).'],
  ['Carga horária (h)', 'Carga horária da atividade, em horas.'],
  ['Título', 'Título da atividade.'],
  ['Modalidade', 'Modalidade da atividade.'],
  ['Local', 'Local de realização.'],
  ['Responsável', 'Pessoa da equipe responsável pela atividade.'],
  ['Metas vinculadas', 'Ordem das metas a que a atividade se liga.'],
] as const;

/**
 * Texto que começa com `=`, `+`, `-`, `@`, tabulação ou retorno vira fórmula no Excel e no
 * LibreOffice; o apóstrofo à frente faz a planilha mostrar o texto como texto.
 */
function neutralizeFormula(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function formatCell(cell: Cell): string {
  if (cell === null) return '';
  const text = typeof cell === 'number' ? NUMBER.format(cell) : neutralizeFormula(cell);
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toLine(cells: readonly Cell[]): string {
  return cells.map(formatCell).join(SEPARATOR);
}

function brDate(iso: string | null): string | null {
  return iso ? brIsoDate(iso) : null;
}

function brDateTime(date: Date): string {
  return DATE_TIME.format(date).replace(',', '');
}

function numberOrText(value: string | null): Cell {
  if (value === null) return null;
  const parsed = Number(value);
  return value.trim() !== '' && Number.isFinite(parsed) ? parsed : value;
}

function goalCells(goal: ExportGoal, result: ExportGoalResult | undefined): Cell[] {
  return [
    goal.ordem,
    ORIGINS[goal.origem],
    goal.objetivo,
    goal.descricao,
    goal.indicador,
    goal.modalidadeAfericao ? MEASUREMENTS[goal.modalidadeAfericao] : null,
    goal.unidade,
    numberOrText(goal.parametroPlanejado),
    brDate(goal.periodoInicio),
    brDate(goal.periodoFim),
    SITUATIONS[goal.situacao],
    goal.rascunho ? 'Sim' : 'Não',
    result ? brDate(result.dataReferencia) : null,
    result?.valorAlcancado ?? null,
    result?.parametroPlanejado ?? null,
    result?.percentual ?? null,
    result ? REACHES[result.alcance] : null,
    result ? brDateTime(new Date(result.registradoEm)) : null,
  ];
}

function goalLines(metas: readonly ExportGoal[]): Cell[][] {
  return metas.flatMap((goal) =>
    goal.resultados.length === 0
      ? [goalCells(goal, undefined)]
      : goal.resultados.map((result) => goalCells(goal, result)),
  );
}

function summaryLines(metas: readonly ExportGoal[]): Cell[][] {
  const apuradas = metas.filter((goal) => !goal.rascunho);
  const count = (alcance: AlcanceMeta) =>
    apuradas.filter((goal) => goal.resultados[0]?.alcance === alcance).length;
  return [
    ['Situação das metas', 'Quantidade'],
    ['Metas no período', metas.length],
    ...REACH_ORDER.map((alcance): Cell[] => [REACHES[alcance], count(alcance)]),
    ['Sem resultado registrado', apuradas.filter((goal) => goal.resultados.length === 0).length],
    ['Em rascunho', metas.length - apuradas.length],
  ];
}

function hours(minutes: number | null): number | null {
  return minutes === null ? null : Math.round((minutes / 60) * 100) / 100;
}

function activityLines(atividades: readonly ExportActivity[]): Cell[][] {
  return atividades.map((activity) => [
    brDate(activity.data),
    activity.horaInicio,
    activity.horaFim,
    hours(activity.cargaHorariaMinutos),
    activity.titulo,
    activity.modalidade,
    activity.local,
    activity.responsavel,
    activity.metas.join(', ') || null,
  ]);
}

function section(title: string, header: readonly string[], rows: Cell[][]): Cell[][] {
  return [[title], [...header], ...(rows.length > 0 ? rows : [[EMPTY_PERIOD]]), []];
}

/** Linha de título de seção, que a planilha XLSX destaca. */
export interface ExportRows {
  rows: Cell[][];
  titleRows: number[];
}

/**
 * Linhas da planilha aberta com os dados de execução do período (RF38), as mesmas no CSV e no
 * XLSX: cabeçalho com a data de corte, legenda dos campos, metas na visão escolhida e atividades
 * (CA-13.1, CA-13.2, CA-13.5). Período sem registro sai com a legenda e a indicação de que não há
 * registros (CA-13.6). Textos livres do resultado e das justificativas ficam fora (RNF05, CA-13.3).
 */
export function buildProjectExportRows(data: ProjectExportData): ExportRows {
  const consolidada = data.visao === 'CONSOLIDADA';
  const metasTitle = consolidada
    ? 'Metas (visão consolidada: último resultado registrado até o fim do período)'
    : 'Metas (visão analítica: cada resultado registrado no período)';

  const lines: Cell[][] = [
    ['Exportação de dados do projeto'],
    ['Projeto', `${data.projeto.codigo} — ${data.projeto.titulo}`],
    ['Período', `${brDate(data.periodo.from)} a ${brDate(data.periodo.to)}`],
    ['Visão das metas', VIEWS[data.visao]],
    ['Data de corte', `${brDateTime(data.geradoEm)} (horário de Brasília)`],
    [
      'Observação',
      'Os textos livres do resultado e das justificativas não entram na planilha. Eles constam no relatório de execução.',
    ],
    [],
    ['Legenda'],
    ['Seção', 'Campo', 'Descrição'],
    ...GOAL_COLUMNS.map(([campo, descricao]): Cell[] => ['Metas', campo, descricao]),
    ...ACTIVITY_COLUMNS.map(([campo, descricao]): Cell[] => ['Atividades', campo, descricao]),
    [],
    ...section(
      metasTitle,
      GOAL_COLUMNS.map(([campo]) => campo),
      goalLines(data.metas),
    ),
  ];

  if (consolidada) {
    lines.push(['Resumo das metas'], ...summaryLines(data.metas), []);
  }

  lines.push(
    ...section(
      'Atividades do período',
      ACTIVITY_COLUMNS.map(([campo]) => campo),
      activityLines(data.atividades),
    ),
  );

  const titles = new Set([
    'Exportação de dados do projeto',
    'Legenda',
    metasTitle,
    'Resumo das metas',
    'Atividades do período',
  ]);
  const titleRows = lines.flatMap((line, index) =>
    line.length === 1 && typeof line[0] === 'string' && titles.has(line[0]) ? [index] : [],
  );
  return { rows: lines, titleRows };
}

/** Planilha CSV em UTF-8 com BOM, separada por ponto e vírgula, que abre com acentos no Excel. */
export function buildProjectExportCsv(data: ProjectExportData): string {
  return BOM + buildProjectExportRows(data).rows.map(toLine).join(LINE_BREAK);
}

/** Nome do arquivo só com letras, números, hífen e sublinhado, para qualquer sistema. */
export function exportFileName(
  codigo: string,
  periodo: { from: string; to: string },
  visao: VisaoMetas,
  extensao: 'csv' | 'xlsx' = 'csv',
): string {
  const safeCode =
    codigo
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'projeto';
  return `exportacao-${safeCode}-${periodo.from}-a-${periodo.to}-${visao.toLowerCase()}.${extensao}`;
}
