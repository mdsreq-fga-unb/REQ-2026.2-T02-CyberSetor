'use client';

import { useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReportPreview } from '@/queries/relatorios';
import type { GoalReach } from '@/types/metas';
import type { ReportPreviewGoal } from '@/types/relatorios';

interface ProjectReportPreviewSectionProps {
  projectId: string;
}

function ReachBadge({ reach }: { reach: GoalReach | null }) {
  if (reach === 'CUMPRIDA') {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600">
        Cumprida
      </Badge>
    );
  }
  if (reach === 'PARCIALMENTE_CUMPRIDA') {
    return (
      <Badge className="bg-amber-500 text-white hover:bg-amber-500 dark:bg-amber-500">
        Parcialmente cumprida
      </Badge>
    );
  }
  if (reach === 'NAO_CUMPRIDA') {
    return <Badge variant="destructive">Não cumprida</Badge>;
  }
  return <Badge variant="secondary">Sem resultado no período</Badge>;
}

function plannedText(goal: ReportPreviewGoal): string {
  if (goal.modalidadeAfericao === 'QUANTITATIVA') {
    return goal.parametroPlanejado
      ? `${goal.parametroPlanejado} ${goal.unidade ?? ''}`.trim()
      : 'A definir';
  }
  return 'Marco / Qualitativa';
}

function reachedText(goal: ReportPreviewGoal): string {
  if (!goal.resultado) return '—';
  if (goal.modalidadeAfericao === 'QUANTITATIVA' && goal.resultado.valorAlcancado !== null) {
    return `${goal.resultado.valorAlcancado} ${goal.unidade ?? ''}`.trim();
  }
  return goal.resultado.descricao;
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
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Meta</TableHead>
                      <TableHead>Objetivo</TableHead>
                      <TableHead>Planejado</TableHead>
                      <TableHead>Alcançado</TableHead>
                      <TableHead className="w-24">Cumprimento</TableHead>
                      <TableHead className="w-48">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.metas.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell className="font-semibold">{goal.ordem}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{goal.objetivo}</span>
                            {goal.indicador && (
                              <span className="text-xs text-muted-foreground">
                                Indicador: {goal.indicador}
                              </span>
                            )}
                            {goal.rascunho && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                Meta em rascunho
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{plannedText(goal)}</TableCell>
                        <TableCell className="text-sm">{reachedText(goal)}</TableCell>
                        <TableCell className="font-medium text-sm">
                          {goal.percentual !== null ? `${goal.percentual}%` : '—'}
                        </TableCell>
                        <TableCell>
                          <ReachBadge reach={goal.status} />
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
