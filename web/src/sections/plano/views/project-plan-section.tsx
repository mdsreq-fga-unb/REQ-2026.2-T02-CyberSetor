'use client';

import { TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';
import { ListCard, ListError, TableSkeleton } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime, formatNumber } from '@/lib/br';
import { useWorkPlan } from '@/queries/plano';
import type { Goal } from '@/types/metas';
import type { PlanVersion, RepactuatedGoal } from '@/types/plano';
import { TIPO_LABEL } from '../format';
import { PlanVersionDialog } from '../plan-version-dialog';

const COLUMNS = 4;

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta o plano de trabalho.';
  }
  return 'Não foi possível carregar o plano de trabalho. Tente de novo.';
}

function withUnit(value: string | number | null, unit: string | null): string {
  if (value === null) return '—';
  const shown = typeof value === 'number' ? formatNumber(value) : value;
  return unit ? `${shown} ${unit}` : shown;
}

function Comparison({ goals }: { goals: RepactuatedGoal[] }) {
  return (
    <section aria-labelledby="plano-comparativo" className="flex flex-col gap-2">
      <h3 id="plano-comparativo" className="text-sm font-semibold">
        Metas repactuadas
      </h3>
      <ListCard>
        <Table>
          <TableCaption className="sr-only">
            Previsto original, reprogramado e realizado de cada meta repactuada.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="px-4">
                Meta
              </TableHead>
              <TableHead scope="col">Original</TableHead>
              <TableHead scope="col">Reprogramado</TableHead>
              <TableHead scope="col">Realizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.metaId}>
                <TableCell className="px-4 py-3 whitespace-normal">
                  {goal.ordem} · {goal.objetivo}
                </TableCell>
                <TableCell>{withUnit(goal.previstoOriginal, goal.unidade)}</TableCell>
                <TableCell>{withUnit(goal.reprogramado, goal.unidade)}</TableCell>
                <TableCell className="whitespace-normal">
                  {withUnit(goal.realizado, goal.unidade)}
                  {goal.realizadoEm && (
                    <span className="block text-muted-foreground">
                      em {formatDate(goal.realizadoEm)}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListCard>
    </section>
  );
}

function VersionItem({ version }: { version: PlanVersion }) {
  return (
    <li className="flex flex-col gap-1 p-3 text-sm">
      <span className="flex flex-wrap items-center gap-2 font-medium">
        Versão {version.numero}
        <Badge variant="secondary">{TIPO_LABEL[version.tipo]}</Badge>
      </span>
      <span>
        {version.documentoOrigem}, de {formatDate(version.dataDocumento)}
        {version.publicacao && ` · ${version.publicacao}`}
      </span>
      {version.vigenciaFimAnterior && version.vigenciaFimNova && (
        <span>
          Vigência de {formatDate(version.vigenciaFimAnterior)} para{' '}
          {formatDate(version.vigenciaFimNova)}
        </span>
      )}
      {version.justificativa && (
        <span className="text-muted-foreground">{version.justificativa}</span>
      )}
      {version.metas.length > 0 && (
        <span className="text-muted-foreground">
          {version.metas.length === 1
            ? `Meta repactuada: ${version.metas[0].ordem}`
            : `Metas repactuadas: ${version.metas.map((meta) => meta.ordem).join(', ')}`}
        </span>
      )}
      <span className="text-muted-foreground">
        Registrada por {version.registradoPor.nome}, em {formatDateTime(version.criadoEm)}
      </span>
    </li>
  );
}

/** Plano de trabalho do projeto: versões e comparativo das metas repactuadas (HU-14, RF31, RF44). */
export function ProjectPlanSection({
  projectId,
  goals,
  canRegister,
}: {
  projectId: string;
  goals: Goal[];
  canRegister: boolean;
}) {
  const plan = useWorkPlan(projectId);
  const [registering, setRegistering] = useState(false);
  const outside = goals.filter((goal) => plan.data?.foraDaVigencia.includes(goal.id));

  return (
    <section className="flex flex-col gap-4" aria-labelledby="plano-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="plano-heading" className="text-lg font-semibold">
            Plano de trabalho
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada termo aditivo, apostila ou ofício gera uma nova versão; o que foi pactuado antes
            fica preservado.
          </p>
        </div>
        {canRegister && (
          <Button onClick={() => setRegistering(true)}>
            Registrar aditivo, apostila ou ofício
          </Button>
        )}
      </div>

      {plan.error && !plan.data ? (
        <div className="flex flex-col gap-3">
          <ListError message={loadFailure(plan.error)} />
          <Button variant="outline" className="self-start" onClick={() => void plan.refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : plan.isPending ? (
        <ListCard>
          <Table aria-busy="true">
            <TableBody>
              <TableSkeleton columns={COLUMNS} rows={2} />
            </TableBody>
          </Table>
        </ListCard>
      ) : (
        <>
          {outside.length > 0 && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-warning/60 bg-warning/10 p-3 text-sm"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                {outside.length === 1
                  ? `A meta ${outside[0].ordem} tem prazo fora da vigência e precisa de revisão.`
                  : `As metas ${outside.map((goal) => goal.ordem).join(', ')} têm prazo fora da vigência e precisam de revisão.`}
              </p>
            </div>
          )}
          {plan.data.repactuadas.length > 0 && <Comparison goals={plan.data.repactuadas} />}
          <section aria-labelledby="plano-versoes" className="flex flex-col gap-2">
            <h3 id="plano-versoes" className="text-sm font-semibold">
              Versões do plano
            </h3>
            <ul className="flex flex-col divide-y rounded-lg border">
              {plan.data.versoes.map((version) => (
                <VersionItem key={version.id} version={version} />
              ))}
              <li className="p-3 text-sm">
                <span className="font-medium">Versão 1</span> · Pactuação original
              </li>
            </ul>
          </section>
        </>
      )}

      {registering && (
        <PlanVersionDialog
          projectId={projectId}
          goals={goals}
          onClose={() => setRegistering(false)}
          onSaved={(numero) =>
            toast.add({ type: 'success', title: `Versão ${numero} do plano registrada` })
          }
        />
      )}
    </section>
  );
}
