import { ApiError } from '@/lib/api';
import type { GoalReach } from '@/types/metas';
import type {
  Report,
  ReportJustificationInput,
  ReportPendencia,
  ReportPendenciaMotivo,
  ReportPreviewGoal,
} from '@/types/relatorios';

export const REPORT_JUSTIFICATION_MAX_LENGTH = 2000;
export const REPORT_RECTIFICATION_MOTIVO_MAX_LENGTH = 2000;

const VALID_REACHES: readonly GoalReach[] = ['CUMPRIDA', 'PARCIALMENTE_CUMPRIDA', 'NAO_CUMPRIDA'];

const VALID_MOTIVOS: readonly ReportPendenciaMotivo[] = [
  'SEM_RESULTADO_REGISTRADO',
  'SEM_JUSTIFICATIVA',
];

export function requiresJustification(reach: GoalReach | null): boolean {
  return reach === 'PARCIALMENTE_CUMPRIDA' || reach === 'NAO_CUMPRIDA';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGoalReach(value: unknown): value is GoalReach {
  return typeof value === 'string' && VALID_REACHES.includes(value as GoalReach);
}

function isPendenciaMotivo(value: unknown): value is ReportPendenciaMotivo {
  return typeof value === 'string' && VALID_MOTIVOS.includes(value as ReportPendenciaMotivo);
}

export function readReportPendencias(details: unknown): ReportPendencia[] {
  if (!isRecord(details) || !Array.isArray(details.pendencias)) return [];

  const result: ReportPendencia[] = [];
  for (const item of details.pendencias) {
    if (!isRecord(item)) continue;
    if (
      typeof item.metaId !== 'string' ||
      typeof item.ordem !== 'number' ||
      typeof item.descricao !== 'string' ||
      !isPendenciaMotivo(item.motivo)
    ) {
      continue;
    }

    result.push({
      metaId: item.metaId,
      ordem: item.ordem,
      descricao: item.descricao,
      motivo: item.motivo,
      alcance: isGoalReach(item.alcance) ? item.alcance : null,
      percentual: typeof item.percentual === 'number' ? item.percentual : null,
    });
  }

  return result;
}

/**
 * Avalia quais pendências ainda impedem a finalização do relatório no período,
 * combinando as metas ativas da prévia (excluindo rascunhos conforme RN-02)
 * com as justificativas já digitadas na tela.
 */
export function computePendingReportItems(
  goals: readonly ReportPreviewGoal[],
  justifications: Readonly<Record<string, string>>,
): ReportPendencia[] {
  const pendencias: ReportPendencia[] = [];

  for (const goal of goals) {
    if (goal.rascunho) continue;

    if (!goal.resultado || !goal.status) {
      pendencias.push({
        metaId: goal.id,
        ordem: goal.ordem,
        descricao: goal.descricao,
        motivo: 'SEM_RESULTADO_REGISTRADO',
        alcance: null,
        percentual: null,
      });
      continue;
    }

    if (requiresJustification(goal.status)) {
      const texto = (justifications[goal.id] ?? '').trim();
      if (!texto) {
        pendencias.push({
          metaId: goal.id,
          ordem: goal.ordem,
          descricao: goal.descricao,
          motivo: 'SEM_JUSTIFICATIVA',
          alcance: goal.status,
          percentual: goal.percentual,
        });
      }
    }
  }

  return pendencias;
}

export function buildJustificationPayload(
  goals: readonly ReportPreviewGoal[],
  justifications: Readonly<Record<string, string>>,
): ReportJustificationInput[] | undefined {
  const items: ReportJustificationInput[] = [];

  for (const goal of goals) {
    if (goal.rascunho || !requiresJustification(goal.status)) continue;
    const texto = (justifications[goal.id] ?? '').trim();
    if (texto.length > 0) {
      items.push({ metaId: goal.id, texto });
    }
  }

  return items.length > 0 ? items : undefined;
}

export function pendenciaReasonText(item: ReportPendencia): string {
  if (item.motivo === 'SEM_RESULTADO_REGISTRADO') {
    return 'sem resultado registrado no período';
  }
  return 'meta não atingida integralmente sem justificativa registrada';
}

/**
 * Junta o bloqueio devolvido pela API ao que ainda falta na tela: o que foi resolvido sai da lista,
 * e a meta fora da apuração carregada continua nela, porque só a API sabe dela.
 */
export function mergeUnresolvedPendencias(
  apiPendencias: readonly ReportPendencia[],
  goals: readonly ReportPreviewGoal[],
  justifications: Readonly<Record<string, string>>,
): ReportPendencia[] {
  const liveByMetaId = new Map(
    computePendingReportItems(goals, justifications).map((item) => [item.metaId, item]),
  );
  const resolved: ReportPendencia[] = [];

  for (const item of apiPendencias) {
    const live = liveByMetaId.get(item.metaId);
    if (live) {
      resolved.push(live);
      liveByMetaId.delete(item.metaId);
    } else if (!goals.some((goal) => goal.id === item.metaId)) {
      resolved.push(item);
    }
  }

  for (const remaining of liveByMetaId.values()) {
    resolved.push(remaining);
  }

  return resolved;
}

export function finalizeFailureMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível falar com o servidor para finalizar o relatório. Tente de novo.';
  }
  if (error.status === 403) {
    return 'Apenas o perfil Presidência e Gestão de Projetos pode finalizar relatórios.';
  }
  if ([400, 404, 409, 422].includes(error.status)) {
    return error.message;
  }
  return 'Não foi possível finalizar o relatório. Tente de novo.';
}

/**
 * Reaproveita na retificação apenas as justificativas da versão anterior cujo resultado apurado
 * (`resultadoMetaId`) permanece o mesmo (CA-05a.2 e CA-05a.3).
 */
export function initialRectificationJustifications(
  report: Report,
  goals: readonly ReportPreviewGoal[],
): Record<string, string> {
  const goalById = new Map(goals.map((goal) => [goal.id, goal]));
  const initial: Record<string, string> = {};

  for (const item of report.metas) {
    if (!item.justificativa) continue;
    const current = goalById.get(item.metaId);
    if (current?.resultado?.id === item.resultadoMetaId) {
      initial[item.metaId] = item.justificativa;
    }
  }

  return initial;
}

/**
 * Identifica metas ativas cujo resultado mudou desde a versão que está sendo retificada,
 * exigindo releitura da justificativa quando o alcance segue parcial ou não cumprido.
 */
export function goalsWithChangedResult(
  report: Report,
  goals: readonly ReportPreviewGoal[],
): Set<string> {
  const previousResultByMetaId = new Map(
    report.metas.map((item) => [item.metaId, item.resultadoMetaId]),
  );
  const changed = new Set<string>();

  for (const goal of goals) {
    if (goal.rascunho || !goal.resultado) continue;
    const previousResultId = previousResultByMetaId.get(goal.id);
    if (previousResultId !== undefined && previousResultId !== goal.resultado.id) {
      changed.add(goal.id);
    }
  }

  return changed;
}

export function rectifyFailureMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível falar com o servidor para retificar o relatório. Tente de novo.';
  }
  if (error.status === 403) {
    return 'Apenas o perfil Presidência e Gestão de Projetos pode retificar relatórios.';
  }
  if ([400, 404, 409, 422].includes(error.status)) {
    return error.message;
  }
  return 'Não foi possível retificar o relatório. Tente de novo.';
}
