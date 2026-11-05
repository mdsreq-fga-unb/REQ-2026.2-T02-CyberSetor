import Handlebars from 'handlebars';
import { COMPILED_TEMPLATES } from './templates/compiled.js';

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

export interface GoalLine {
  texto: string;
  url: string | null;
}

export interface GoalDigest {
  avisos: GoalLine[];
  vencidas: GoalLine[];
  vencendo: GoalLine[];
  semResponsavel: GoalLine[];
}

export interface BlockedReportNotice {
  projeto: string;
  periodo: string;
  pendencias: string[];
  url: string | null;
}

// Assuntos e títulos 🔧, a validar com o Instituto; o corpo fica nos arquivos de templates/.
const TEXTS = {
  digestOne: '1 aviso de meta',
  digestMany: (total: number) => `${total} avisos de metas`,
  avisos: 'Avisos registrados',
  vencidas: 'Vencidas',
  vencendo: 'Vencem em até 30 dias',
  semResponsavel: 'Sem responsável',
  blocked: (projeto: string) => `Relatório do ${projeto} bloqueado`,
};

type TemplateName = keyof typeof COMPILED_TEMPLATES;

// HTML com escape automático; texto puro sem escape, porque não é interpretado.
const OPTIONS = { knownHelpers: { if: true, each: true }, knownHelpersOnly: true };

function compiled(name: TemplateName) {
  const { html, text } = COMPILED_TEMPLATES[name];
  return {
    html: Handlebars.compile(html, OPTIONS),
    text: Handlebars.compile(text, { ...OPTIONS, noEscape: true }),
  };
}

const TEMPLATES = {
  'resumo-metas': compiled('resumo-metas'),
  'relatorio-bloqueado': compiled('relatorio-bloqueado'),
};

function render(name: TemplateName, subject: string, context: object): RenderedEmail {
  const data = { ...context, titulo: subject };
  const template = TEMPLATES[name];
  return { subject, text: template.text(data), html: template.html(data) };
}

export function goalDigestEmail(digest: GoalDigest): RenderedEmail {
  const secoes = [
    { titulo: TEXTS.avisos, linhas: digest.avisos },
    { titulo: TEXTS.vencidas, linhas: digest.vencidas },
    { titulo: TEXTS.vencendo, linhas: digest.vencendo },
    { titulo: TEXTS.semResponsavel, linhas: digest.semResponsavel },
  ].filter(({ linhas }) => linhas.length > 0);
  const total = secoes.reduce((sum, { linhas }) => sum + linhas.length, 0);
  const subject = total === 1 ? TEXTS.digestOne : TEXTS.digestMany(total);
  return render('resumo-metas', subject, { secoes });
}

export function blockedReportEmail(report: BlockedReportNotice): RenderedEmail {
  return render('relatorio-bloqueado', TEXTS.blocked(report.projeto), report);
}
