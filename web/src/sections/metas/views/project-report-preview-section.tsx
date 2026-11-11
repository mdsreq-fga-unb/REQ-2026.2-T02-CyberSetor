'use client';

import { Fragment, useRef, useState } from 'react';
import { CircleCheckIcon, FileCheckIcon, FileTextIcon, TriangleAlertIcon } from 'lucide-react';
import { useSession } from '@/auth/hooks/use-session';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime, formatNumber } from '@/lib/br';
import { useFinalizeReport, useReportPreview } from '@/queries/relatorios';
import type { GoalReach } from '@/types/metas';
import type { Report, ReportPendencia, ReportPreviewGoal } from '@/types/relatorios';
import { plannedNumber, REACHES } from '../format';
import {
  REPORT_JUSTIFICATION_MAX_LENGTH,
  buildJustificationPayload,
  computePendingReportItems,
  finalizeFailureMessage,
  mergeUnresolvedPendencias,
  pendenciaReasonText,
  readReportPendencias,
  requiresJustification,
} from '../report-finalization';

interface ProjectReportPreviewSectionProps {
  projectId: string;
  instrumentActive?: boolean;
}

// Tons de situação pelos tokens success e warning, como nas atividades e no painel.
function ReachBadge({ reach, draft }: { reach: GoalReach | null; draft: boolean }) {
  if (draft) return <Badge variant="outline">Rascunho, fora da apuração</Badge>;
  if (reach === 'CUMPRIDA') {
    return <Badge className="bg-success text-success-foreground">{REACHES.CUMPRIDA}</Badge>;
  }
  if (reach === 'PARCIALMENTE_CUMPRIDA') {
    return <Badge variant="warning">{REACHES.PARCIALMENTE_CUMPRIDA}</Badge>;
  }
  if (reach === 'NAO_CUMPRIDA') {
    return <Badge variant="destructive">{REACHES.NAO_CUMPRIDA}</Badge>;
  }
  return <Badge variant="secondary">Sem resultado no período</Badge>;
}

function withUnit(value: number, unit: string | null): string {
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

// O percentual vem do resultado gravado; o planejado mostrado é o mesmo da conta (RN-14).
function plannedText(goal: ReportPreviewGoal): string {
  if (goal.modalidadeAfericao !== 'QUANTITATIVA') return goal.parametroPlanejado ?? 'A definir';
  const planned = goal.resultado?.parametroPlanejado ?? plannedNumber(goal.parametroPlanejado);
  return planned === null ? 'A definir' : withUnit(planned, goal.unidade);
}

function reachedText(goal: ReportPreviewGoal): string {
  if (!goal.resultado) return '—';
  const when = `em ${formatDate(goal.resultado.dataReferencia)}`;
  if (goal.modalidadeAfericao === 'QUANTITATIVA' && goal.resultado.valorAlcancado !== null) {
    return `${withUnit(goal.resultado.valorAlcancado, goal.unidade)} ${when}`;
  }
  return `${goal.resultado.descricao} (${when})`;
}

function percentText(goal: ReportPreviewGoal): string {
  return goal.percentual === null ? '—' : `${formatNumber(goal.percentual)}%`;
}

function previewFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta a prévia do relatório.';
  }
  if (error instanceof ApiError && [400, 404, 422].includes(error.status)) return error.message;
  return 'Não foi possível carregar a prévia do relatório. Tente de novo.';
}

export function ProjectReportPreviewSection({
  projectId,
  instrumentActive = true,
}: ProjectReportPreviewSectionProps) {
  const { session } = useSession();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [justificationsOpen, setJustificationsOpen] = useState(false);
  const [isBlockedAfterAttempt, setIsBlockedAfterAttempt] = useState(false);
  const [apiPendencias, setApiPendencias] = useState<ReportPendencia[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emittedReport, setEmittedReport] = useState<Report | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const { data, isLoading, isError, error } = useReportPreview(projectId, from, to);
  const finalize = useFinalizeReport(projectId);

  const hasPeriod = Boolean(from && to);
  const isPeriodReversed = hasPeriod && from > to;
  const manager = session?.perfil === 'PRESIDENCIA_GESTAO';
  const coordinator = session?.perfil === 'NUCLEO_PEDAGOGICO';
  const canFinalize = manager && instrumentActive;

  const activeGoals = data?.metas.filter((goal) => !goal.rascunho) ?? [];
  const goalsNeedingJustification = activeGoals.filter((goal) =>
    requiresJustification(goal.status),
  );
  const clientPendencias = data ? computePendingReportItems(data.metas, justifications) : [];
  const unresolvedBlockedPendencias =
    isBlockedAfterAttempt && data
      ? mergeUnresolvedPendencias(apiPendencias, data.metas, justifications)
      : [];

  const showJustificationInputs =
    canFinalize && !emittedReport && (justificationsOpen || isBlockedAfterAttempt);

  const emittedJustificationByMetaId = new Map(
    (emittedReport?.metas ?? [])
      .filter((item) => Boolean(item.justificativa))
      .map((item) => [item.metaId, item.justificativa as string]),
  );

  function resetPeriodAttemptState() {
    setIsBlockedAfterAttempt(false);
    setApiPendencias([]);
    setJustificationsOpen(false);
    setSubmitError(null);
    setEmittedReport(null);
  }

  function handleFromChange(nextFrom: string) {
    setFrom(nextFrom);
    resetPeriodAttemptState();
  }

  function handleToChange(nextTo: string) {
    setTo(nextTo);
    resetPeriodAttemptState();
  }

  function handleJustificationChange(metaId: string, value: string) {
    setJustifications((prev) => ({ ...prev, [metaId]: value }));
    if (submitError) setSubmitError(null);
  }

  function focusFirstPendingTextarea(pendencias: readonly ReportPendencia[]) {
    const firstUnjustified = pendencias.find((item) => item.motivo === 'SEM_JUSTIFICATIVA');
    if (!firstUnjustified) return;
    requestAnimationFrame(() => {
      textareaRefs.current[firstUnjustified.metaId]?.focus();
    });
  }

  function handleOpenJustifications() {
    setJustificationsOpen(true);
    focusFirstPendingTextarea(clientPendencias);
  }

  async function handleFinalize() {
    if (!data) return;
    setSubmitError(null);

    try {
      const justificativas = buildJustificationPayload(data.metas, justifications);
      const report = await finalize.mutateAsync({
        from,
        to,
        ...(justificativas ? { justificativas } : {}),
      });

      setEmittedReport(report);
      setIsBlockedAfterAttempt(false);
      setApiPendencias([]);
      setJustificationsOpen(false);
      toast.add({
        type: 'success',
        title: `Relatório finalizado (versão ${report.versao})`,
        description: `Período de ${formatDate(report.periodoInicio)} a ${formatDate(report.periodoFim)} emitido com sucesso.`,
      });
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 422 &&
        err.code === 'REPORT_FINALIZATION_BLOCKED'
      ) {
        const parsed = readReportPendencias(err.details);
        const pendencias = parsed.length > 0 ? parsed : clientPendencias;
        setApiPendencias(pendencias);
        setIsBlockedAfterAttempt(true);
        setJustificationsOpen(true);
        toast.add({
          type: 'warning',
          title: 'Finalização do relatório bloqueada',
          description: err.message,
        });
        focusFirstPendingTextarea(pendencias);
        return;
      }

      const message = finalizeFailureMessage(err);
      setSubmitError(message);
      toast.add({
        type: 'error',
        title: 'Não foi possível finalizar o relatório',
        description: message,
      });
    }
  }

  const isFinalizeButtonDisabled =
    finalize.isPending || (isBlockedAfterAttempt && unresolvedBlockedPendencias.length > 0);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="relatorio-heading">
      <div>
        <h2 id="relatorio-heading" className="text-lg font-semibold">
          Relatório de Execução do Objeto
        </h2>
        <p className="text-sm text-muted-foreground">
          Consolidação das metas e apuração de resultados para prestação de contas no período
          selecionado.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-from" className="text-sm font-medium">
              Data inicial
            </label>
            <Input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-44 bg-background"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-to" className="text-sm font-medium">
              Data final
            </label>
            <Input
              id="report-to"
              type="date"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-44 bg-background"
            />
          </div>

          {isPeriodReversed && (
            <span className="text-sm font-medium text-destructive">
              A data inicial não pode ser posterior à data final.
            </span>
          )}
        </div>

        {!hasPeriod && (
          <ListEmpty
            icon={FileTextIcon}
            title="Nenhum período selecionado"
            description="Escolha a data inicial e final acima para visualizar a prévia das metas do relatório."
          />
        )}

        {hasPeriod && isPeriodReversed && (
          <ListEmpty
            icon={FileTextIcon}
            title="Intervalo de datas inválido"
            description="Ajuste as datas acima para que o início seja anterior ou igual ao fim."
          />
        )}

        {hasPeriod && !isPeriodReversed && isLoading && (
          <div className="rounded-md border">
            <Table>
              <TableBody>
                <TableSkeleton columns={6} rows={3} />
              </TableBody>
            </Table>
          </div>
        )}

        {hasPeriod && !isPeriodReversed && isError && <ListError message={previewFailure(error)} />}

        {hasPeriod && !isPeriodReversed && data && (
          <>
            {data.metas.length === 0 ? (
              <ListEmpty
                icon={FileTextIcon}
                title="Nenhuma meta no projeto"
                description="Este projeto ainda não possui metas cadastradas."
              />
            ) : (
              <>
                {isBlockedAfterAttempt && unresolvedBlockedPendencias.length > 0 && (
                  <div
                    role="alert"
                    className="flex flex-col gap-2 rounded-lg border border-warning/60 bg-warning/10 p-4 text-sm"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
                      <span>Finalização do relatório bloqueada</span>
                    </div>
                    <p className="text-foreground">
                      A emissão final exige resultado registrado em todas as metas ativas do período
                      e justificativa para cada meta parcialmente cumprida ou não cumprida (Lei
                      13.019/2014, art. 64, §1º). Confira o que falta:
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      {unresolvedBlockedPendencias.map((item) => (
                        <li key={item.metaId}>
                          <span className="font-medium">
                            Meta {item.ordem} ({item.descricao})
                          </span>
                          : {pendenciaReasonText(item)}.
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      A trava atinge apenas a finalização do relatório: os registros de metas,
                      resultados, atividades e demais áreas continuam liberados.
                    </p>
                  </div>
                )}

                {isBlockedAfterAttempt &&
                  unresolvedBlockedPendencias.length === 0 &&
                  !emittedReport && (
                    <div
                      role="status"
                      className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-4 text-sm"
                    >
                      <CircleCheckIcon
                        className="size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span>
                        Todas as justificativas pendentes foram preenchidas. A finalização do
                        relatório está liberada.
                      </span>
                    </div>
                  )}

                {coordinator && clientPendencias.length > 0 && (
                  <div
                    role="status"
                    className="flex flex-col gap-1.5 rounded-lg border border-warning/60 bg-warning/10 p-4 text-sm"
                  >
                    <span className="font-semibold">
                      Pendências para finalização do relatório neste período
                    </span>
                    <p className="text-muted-foreground">
                      Há {clientPendencias.length}{' '}
                      {clientPendencias.length === 1 ? 'meta pendente' : 'metas pendentes'} de
                      resultado ou justificativa antes da emissão pela Presidência e Gestão. Os
                      registros de metas, resultados, atividades e demais áreas continuam liberados.
                    </p>
                  </div>
                )}

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {submitError}
                  </p>
                )}

                {emittedReport && (
                  <div
                    role="status"
                    className="flex flex-col gap-1 rounded-lg border border-success/40 bg-success/10 p-4 text-sm"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <FileCheckIcon className="size-4 shrink-0 text-success" aria-hidden="true" />
                      <span>Relatório finalizado — Versão {emittedReport.versao}</span>
                    </div>
                    <p className="text-muted-foreground">
                      Período de {formatDate(emittedReport.periodoInicio)} a{' '}
                      {formatDate(emittedReport.periodoFim)} ·{' '}
                      {emittedReport.metas.length === 1
                        ? '1 meta apurada'
                        : `${emittedReport.metas.length} metas apuradas`}{' '}
                      · Emitido por {emittedReport.emitidoPor.nome} em{' '}
                      {formatDateTime(emittedReport.criadoEm)}.
                    </p>
                  </div>
                )}

                <ListCard>
                  <Table>
                    <TableCaption className="sr-only">
                      Metas do projeto no período, com o planejado, o alcançado e o cumprimento
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead scope="col" className="w-12">
                          Meta
                        </TableHead>
                        <TableHead scope="col">Objetivo</TableHead>
                        <TableHead scope="col" className="hidden md:table-cell">
                          Planejado
                        </TableHead>
                        <TableHead scope="col" className="hidden md:table-cell">
                          Alcançado
                        </TableHead>
                        <TableHead scope="col" className="hidden md:table-cell">
                          Percentual
                        </TableHead>
                        <TableHead scope="col">Cumprimento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.metas.map((goal) => {
                        const needsJustification =
                          !goal.rascunho && requiresJustification(goal.status);
                        const currentText = justifications[goal.id] ?? '';
                        const hasTypedJustification = currentText.trim().length > 0;
                        const savedJustification = emittedJustificationByMetaId.get(goal.id);

                        return (
                          <Fragment key={goal.id}>
                            <TableRow>
                              <TableCell className="font-semibold">{goal.ordem}</TableCell>
                              <TableCell className="whitespace-normal">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium">{goal.objetivo}</span>
                                  {goal.indicador && (
                                    <span className="text-xs text-muted-foreground">
                                      Indicador: {goal.indicador}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground md:hidden">
                                    Planejado: {plannedText(goal)} · Alcançado: {reachedText(goal)}
                                    {goal.percentual !== null && ` (${percentText(goal)})`}
                                  </span>
                                  {savedJustification && (
                                    <span className="mt-1 text-xs text-muted-foreground">
                                      Justificativa registrada: {savedJustification}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="hidden whitespace-normal text-sm md:table-cell">
                                {plannedText(goal)}
                              </TableCell>
                              <TableCell className="hidden whitespace-normal text-sm md:table-cell">
                                {reachedText(goal)}
                              </TableCell>
                              <TableCell className="hidden text-sm font-medium md:table-cell">
                                {percentText(goal)}
                              </TableCell>
                              <TableCell className="whitespace-normal">
                                <div className="flex flex-col items-start gap-1">
                                  <ReachBadge reach={goal.status} draft={goal.rascunho} />
                                  {needsJustification && !emittedReport && (
                                    <span className="text-xs text-muted-foreground">
                                      {hasTypedJustification
                                        ? 'Justificativa preenchida'
                                        : 'Sem justificativa'}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>

                            {showJustificationInputs && needsJustification && (
                              <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableCell colSpan={6} className="px-4 py-3 whitespace-normal">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <label
                                        htmlFor={`justificativa-${goal.id}`}
                                        className="text-sm font-medium"
                                      >
                                        Justificativa da meta {goal.ordem}
                                      </label>
                                      <span className="text-xs text-muted-foreground">
                                        {currentText.length}/{REPORT_JUSTIFICATION_MAX_LENGTH}
                                      </span>
                                    </div>
                                    <Textarea
                                      id={`justificativa-${goal.id}`}
                                      ref={(el) => {
                                        textareaRefs.current[goal.id] = el;
                                      }}
                                      value={currentText}
                                      maxLength={REPORT_JUSTIFICATION_MAX_LENGTH}
                                      aria-invalid={isBlockedAfterAttempt && !hasTypedJustification}
                                      placeholder="Descreva os motivos do alcance parcial ou não cumprimento desta meta (Lei 13.019/2014, art. 64, §1º)."
                                      onChange={(e) =>
                                        handleJustificationChange(goal.id, e.target.value)
                                      }
                                      className="bg-background"
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ListCard>

                {manager && !instrumentActive && (
                  <p className="text-sm text-muted-foreground">
                    Instrumento inativo: não permite finalizar relatórios.
                  </p>
                )}

                {canFinalize && activeGoals.length > 0 && !emittedReport && (
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {goalsNeedingJustification.length > 0 && !showJustificationInputs && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenJustifications}
                        disabled={finalize.isPending}
                      >
                        Informar justificativas
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleFinalize}
                      disabled={isFinalizeButtonDisabled}
                    >
                      {finalize.isPending ? 'Finalizando…' : 'Finalizar relatório'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
