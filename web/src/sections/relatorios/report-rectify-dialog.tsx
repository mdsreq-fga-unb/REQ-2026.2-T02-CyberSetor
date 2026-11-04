'use client';

import { TriangleAlertIcon } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ListError } from '@/components/list/list-states';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/br';
import { useRectifyReport, useReportPreview } from '@/queries/relatorios';
import { REACHES } from '@/sections/metas/format';
import {
  REPORT_JUSTIFICATION_MAX_LENGTH,
  REPORT_RECTIFICATION_MOTIVO_MAX_LENGTH,
  buildJustificationPayload,
  computePendingReportItems,
  goalsWithChangedResult,
  initialRectificationJustifications,
  mergeUnresolvedPendencias,
  pendenciaReasonText,
  readReportPendencias,
  rectifyFailureMessage,
  requiresJustification,
} from '@/sections/metas/report-finalization';
import type { Report, ReportPendencia, ReportPreviewGoal } from '@/types/relatorios';

function previewFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta a apuração do relatório.';
  }
  if (error instanceof ApiError && [400, 404, 422].includes(error.status)) return error.message;
  return 'Não foi possível carregar a apuração das metas para retificar. Tente de novo.';
}

function goalReachSummary(goal: ReportPreviewGoal): string {
  if (!goal.status) return goal.objetivo;
  const reach = REACHES[goal.status];
  const percent = goal.percentual !== null ? ` (${formatNumber(goal.percentual)}%)` : '';
  return `${goal.objetivo} · ${reach}${percent}`;
}

/**
 * Emite nova versão retificada do relatório, preservando a versão anterior intocada
 * e exigindo releitura de justificativa quando o resultado da meta mudou (CA-05a.3, RF39, RNF08).
 */
export function ReportRectifyDialog({
  projectId,
  open,
  report,
  onClose,
  onRectified,
}: {
  projectId: string;
  open: boolean;
  /** Mantém a última versão aberta durante a animação de fechamento. */
  report: Report | null;
  onClose: () => void;
  onRectified?: (report: Report) => void;
}) {
  const rectify = useRectifyReport(projectId);
  const preview = useReportPreview(
    projectId,
    open && report ? report.periodoInicio : '',
    open && report ? report.periodoFim : '',
  );

  const [motivo, setMotivo] = useState('');
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [editedJustifications, setEditedJustifications] = useState<Record<string, string>>({});
  const [apiPendencias, setApiPendencias] = useState<ReportPendencia[]>([]);
  const [isBlockedAfterAttempt, setIsBlockedAfterAttempt] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const motivoRef = useRef<HTMLTextAreaElement>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const previewGoals = useMemo(() => preview.data?.metas ?? [], [preview.data]);

  const inheritedJustifications = useMemo(
    () => (report ? initialRectificationJustifications(report, previewGoals) : {}),
    [report, previewGoals],
  );

  const changedResultIds = useMemo(
    () => (report ? goalsWithChangedResult(report, previewGoals) : new Set<string>()),
    [report, previewGoals],
  );

  const justifications = useMemo(
    () => ({ ...inheritedJustifications, ...editedJustifications }),
    [inheritedJustifications, editedJustifications],
  );

  const activeGoalsNeedingJustification = useMemo(
    () => previewGoals.filter((goal) => !goal.rascunho && requiresJustification(goal.status)),
    [previewGoals],
  );

  const clientPendencias = useMemo(
    () => computePendingReportItems(previewGoals, justifications),
    [previewGoals, justifications],
  );

  const unresolvedPendencias = useMemo(() => {
    if (!isBlockedAfterAttempt) return [];
    return mergeUnresolvedPendencias(apiPendencias, previewGoals, justifications);
  }, [isBlockedAfterAttempt, apiPendencias, previewGoals, justifications]);

  function close() {
    setMotivo('');
    setMotivoError(null);
    setEditedJustifications({});
    setApiPendencias([]);
    setIsBlockedAfterAttempt(false);
    setFailure(null);
    onClose();
  }

  function focusFirstPendingTextarea(pendencias: readonly ReportPendencia[]) {
    const firstUnjustified = pendencias.find((item) => item.motivo === 'SEM_JUSTIFICATIVA');
    if (!firstUnjustified) return;
    requestAnimationFrame(() => {
      textareaRefs.current[firstUnjustified.metaId]?.focus();
    });
  }

  function handleJustificationChange(metaId: string, value: string) {
    setEditedJustifications((prev) => ({ ...prev, [metaId]: value }));
    if (failure) setFailure(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report || !preview.data) return;
    setFailure(null);
    setMotivoError(null);

    const trimmedMotivo = motivo.trim();
    if (!trimmedMotivo) {
      setMotivoError('Informe o motivo da retificação.');
      motivoRef.current?.focus();
      return;
    }

    try {
      const justificativas = buildJustificationPayload(preview.data.metas, justifications);
      const created = await rectify.mutateAsync({
        reportId: report.id,
        body: {
          motivo: trimmedMotivo,
          ...(justificativas ? { justificativas } : {}),
        },
      });
      close();
      onRectified?.(created);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 422 &&
        error.code === 'REPORT_FINALIZATION_BLOCKED'
      ) {
        const parsed = readReportPendencias(error.details);
        const pendencias = parsed.length > 0 ? parsed : clientPendencias;
        setApiPendencias(pendencias);
        setIsBlockedAfterAttempt(true);
        focusFirstPendingTextarea(pendencias);
        return;
      }
      setFailure(rectifyFailureMessage(error));
    }
  }

  const nextVersion = (report?.versao ?? 1) + 1;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !rectify.isPending && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Retificar relatório</DialogTitle>
          <DialogDescription>
            {report &&
              `Nova versão (${nextVersion}) de ${formatDate(report.periodoInicio)} a ${formatDate(report.periodoFim)}, a partir da versão ${report.versao}. A versão ${report.versao} permanece preservada.`}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!motivoError}>
              <FieldLabel htmlFor="motivo-retificacao">Motivo da retificação</FieldLabel>
              <Textarea
                ref={motivoRef}
                id="motivo-retificacao"
                value={motivo}
                maxLength={REPORT_RECTIFICATION_MOTIVO_MAX_LENGTH}
                aria-invalid={!!motivoError}
                aria-describedby={
                  motivoError
                    ? 'motivo-retificacao-ajuda motivo-retificacao-erro'
                    : 'motivo-retificacao-ajuda'
                }
                placeholder="Descreva o que motivou a emissão desta versão retificada."
                onChange={(event) => {
                  setMotivo(event.target.value);
                  if (motivoError) setMotivoError(null);
                  if (failure) setFailure(null);
                }}
              />
              <FieldDescription id="motivo-retificacao-ajuda">
                Registrado na versão {nextVersion} e na trilha de auditoria.
              </FieldDescription>
              {motivoError && <FieldError id="motivo-retificacao-erro">{motivoError}</FieldError>}
            </Field>

            {preview.isLoading && (
              <p role="status" className="text-sm text-muted-foreground">
                Carregando apuração das metas no período…
              </p>
            )}

            {preview.isError && !preview.data && (
              <div className="flex flex-col gap-3">
                <ListError message={previewFailure(preview.error)} />
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  onClick={() => void preview.refetch()}
                >
                  Tentar de novo
                </Button>
              </div>
            )}

            {isBlockedAfterAttempt && unresolvedPendencias.length > 0 && (
              <div
                role="alert"
                className="flex flex-col gap-2 rounded-lg border border-warning/60 bg-warning/10 p-3 text-sm"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>Retificação bloqueada por pendências</span>
                </div>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  {unresolvedPendencias.map((item) => (
                    <li key={item.metaId}>
                      <span className="font-medium">
                        Meta {item.ordem} ({item.descricao}):
                      </span>{' '}
                      {pendenciaReasonText(item)}
                      {item.percentual !== null ? ` (${formatNumber(item.percentual)}%)` : ''}.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeGoalsNeedingJustification.map((goal) => {
              const currentText = justifications[goal.id] ?? '';
              const hasTypedJustification = currentText.trim().length > 0;
              const resultChanged = changedResultIds.has(goal.id);
              const invalid = isBlockedAfterAttempt && !hasTypedJustification;
              return (
                <Field key={goal.id} data-invalid={invalid}>
                  <FieldLabel htmlFor={`retificar-justificativa-${goal.id}`}>
                    Justificativa da meta {goal.ordem}
                  </FieldLabel>
                  <Textarea
                    ref={(el) => {
                      textareaRefs.current[goal.id] = el;
                    }}
                    id={`retificar-justificativa-${goal.id}`}
                    value={currentText}
                    maxLength={REPORT_JUSTIFICATION_MAX_LENGTH}
                    aria-invalid={invalid}
                    placeholder="Descreva os motivos do alcance parcial ou não cumprimento desta meta (Lei 13.019/2014, art. 64, §1º)."
                    onChange={(event) => handleJustificationChange(goal.id, event.target.value)}
                  />
                  <FieldDescription>
                    {goalReachSummary(goal)}
                    {resultChanged &&
                      ` · Novo resultado apurado após a versão ${report?.versao ?? 1}: informe a justificativa atualizada.`}
                  </FieldDescription>
                </Field>
              );
            })}

            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={rectify.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={rectify.isPending || !preview.data}>
                {rectify.isPending ? 'Retificando…' : 'Emitir retificação'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
