import { AlcanceMeta } from '../generated/prisma/enums.js';
import type { GoalResultResponse } from '../goals/goals.dto.js';
import type { ReportPreviewGoalResponse } from '../projects/report-preview.dto.js';

export const REPORT_PENDENCIA_MOTIVOS = ['SEM_RESULTADO_REGISTRADO', 'SEM_JUSTIFICATIVA'] as const;

export type ReportPendenciaMotivo = (typeof REPORT_PENDENCIA_MOTIVOS)[number];

export interface ReportPendencia {
  metaId: string;
  ordem: number;
  descricao: string;
  motivo: ReportPendenciaMotivo;
  alcance: AlcanceMeta | null;
  percentual: number | null;
}

export interface JustificativaInput {
  metaId: string;
  texto: string;
}

export interface EvaluatedReportGoal {
  goal: ReportPreviewGoalResponse;
  resultado: GoalResultResponse;
  alcance: AlcanceMeta;
  justificativa: string | null;
}

export type ReportEvaluationResult =
  | { kind: 'invalid_goal'; metaId: string }
  | { kind: 'justification_not_applicable'; metaId: string }
  | { kind: 'blocked'; pendencias: ReportPendencia[] }
  | { kind: 'ready'; metas: EvaluatedReportGoal[] };

export function requiresJustification(alcance: AlcanceMeta | null): boolean {
  return alcance === AlcanceMeta.PARCIALMENTE_CUMPRIDA || alcance === AlcanceMeta.NAO_CUMPRIDA;
}

/**
 * Avalia as metas apuráveis do período (excluindo metas em rascunho conforme RN-02),
 * valida as justificativas enviadas e coleta pendências bloqueantes (CA-05a.2 e CA-05a.7).
 */
export function evaluateReportGoals(
  metas: readonly ReportPreviewGoalResponse[],
  justificativas: readonly JustificativaInput[] = [],
  inheritedJustifications: ReadonlyMap<string, string> = new Map(),
): ReportEvaluationResult {
  // RN-02: metas em rascunho ficam fora da apuração e nunca travam a finalização.
  const activeGoals = metas.filter((meta) => !meta.rascunho);
  const activeById = new Map(activeGoals.map((meta) => [meta.id, meta]));

  const explicitJustifications = new Map<string, string>();
  for (const item of justificativas) {
    const goal = activeById.get(item.metaId);
    if (!goal) {
      return { kind: 'invalid_goal', metaId: item.metaId };
    }
    if (goal.status === AlcanceMeta.CUMPRIDA) {
      return { kind: 'justification_not_applicable', metaId: item.metaId };
    }
    const texto = item.texto.trim();
    if (texto.length > 0) {
      explicitJustifications.set(item.metaId, texto);
    }
  }

  const pendencias: ReportPendencia[] = [];
  const evaluated: EvaluatedReportGoal[] = [];

  for (const goal of activeGoals) {
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

    const needsJustification = requiresJustification(goal.status);
    const justificativa = needsJustification
      ? (explicitJustifications.get(goal.id) ?? inheritedJustifications.get(goal.id) ?? null)
      : null;

    if (needsJustification && !justificativa) {
      pendencias.push({
        metaId: goal.id,
        ordem: goal.ordem,
        descricao: goal.descricao,
        motivo: 'SEM_JUSTIFICATIVA',
        alcance: goal.status,
        percentual: goal.percentual,
      });
      continue;
    }

    evaluated.push({
      goal,
      resultado: goal.resultado,
      alcance: goal.status,
      justificativa,
    });
  }

  if (pendencias.length > 0) {
    return { kind: 'blocked', pendencias };
  }

  return { kind: 'ready', metas: evaluated };
}
