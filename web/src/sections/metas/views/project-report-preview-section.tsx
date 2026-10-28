'use client';

import { useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
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
import { useReportPreview } from '@/queries/relatorios';
import type { GoalReach } from '@/types/metas';
import { formatNumber, plannedNumber, REACHES } from '../format';
import type { ReportPreviewGoal } from '@/types/relatorios';

interface ProjectReportPreviewSectionProps {
  projectId: string;
}

function ReachBadge({ reach, draft }: { reach: GoalReach | null; draft: boolean }) {
  if (draft) return <Badge variant="outline">Rascunho, fora da apuração</Badge>;
  if (reach === 'CUMPRIDA') {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600">
        {REACHES.CUMPRIDA}
      </Badge>
    );
  }
  if (reach === 'PARCIALMENTE_CUMPRIDA') {
    return (
      <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300">
        {REACHES.PARCIALMENTE_CUMPRIDA}
      </Badge>
    );
  }
  if (reach === 'NAO_CUMPRIDA') {
    return <Badge variant="destructive">{REACHES.NAO_CUMPRIDA}</Badge>;
  }
  return <Badge variant="secondary">Sem resultado no período</Badge>;
}

function withUnit(value: number, unit: string | null): string {
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

function dateBr(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

// O percentual vem do resultado gravado; o planejado mostrado é o mesmo da conta (RN-14).
function plannedText(goal: ReportPreviewGoal): string {
  if (goal.modalidadeAfericao !== 'QUANTITATIVA') return goal.parametroPlanejado ?? 'A definir';
  const planned = goal.resultado?.parametroPlanejado ?? plannedNumber(goal.parametroPlanejado);
  return planned === null ? 'A definir' : withUnit(planned, goal.unidade);
}

function reachedText(goal: ReportPreviewGoal): string {
  if (!goal.resultado) return '—';
  const when = `em ${dateBr(goal.resultado.dataReferencia)}`;
  if (goal.modalidadeAfericao === 'QUANTITATIVA' && goal.resultado.valorAlcancado !== null) {
    return `${withUnit(goal.resultado.valorAlcancado, goal.unidade)} ${when}`;
  }
  return `${goal.resultado.descricao} (${when})`;
}

function percentText(goal: ReportPreviewGoal): string {
  return goal.percentual === null ? '—' : `${formatNumber(goal.percentual)}%`;
}

export function ProjectReportPreviewSection({ projectId }: ProjectReportPreviewSectionProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, isError, error } = useReportPreview(projectId, from, to);

  const hasPeriod = Boolean(from && to);
  const isPeriodReversed = hasPeriod && from > to;

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
              onChange={(e) => setFrom(e.target.value)}
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
              onChange={(e) => setTo(e.target.value)}
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

        {hasPeriod && !isPeriodReversed && isError && (
          <ListError
            message={
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar a prévia do relatório. Tente de novo.'
            }
          />
        )}

        {hasPeriod && !isPeriodReversed && data && (
          <>
            {data.metas.length === 0 ? (
              <ListEmpty
                icon={FileTextIcon}
                title="Nenhuma meta no projeto"
                description="Este projeto ainda não possui metas cadastradas."
              />
            ) : (
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
                    {data.metas.map((goal) => (
                      <TableRow key={goal.id}>
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
                          <ReachBadge reach={goal.status} draft={goal.rascunho} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ListCard>
            )}
          </>
        )}
      </div>
    </section>
  );
}
