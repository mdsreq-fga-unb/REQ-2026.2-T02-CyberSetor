'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DownloadIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { DateField } from '@/components/form/fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { ApiError } from '@/lib/api';
import { dateSchema } from '@/lib/schemas';
import { useExportProjectCsv } from '@/queries/relatorios';
import { EXPORT_GOAL_VIEWS, type ExportGoalView } from '@/types/relatorios';

const DATE = dateSchema('Informe a data completa.');

const schema = z
  .object({
    from: DATE,
    to: DATE,
    visao: z.enum(EXPORT_GOAL_VIEWS, { message: 'Escolha a visão das metas.' }),
  })
  .refine((values) => values.to >= values.from, {
    path: ['to'],
    message: 'A data final não pode ser anterior à data inicial.',
    when: (payload) => z.object({ from: DATE, to: DATE }).safeParse(payload.value).success,
  });

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  from: '',
  to: '',
  visao: 'CONSOLIDADA',
};

const VIEW_LABELS: Record<ExportGoalView, string> = {
  CONSOLIDADA: 'Consolidada',
  ANALITICA: 'Analítica',
};

const VIEW_DESCRIPTIONS: Record<ExportGoalView, string> = {
  CONSOLIDADA: 'Último resultado de cada meta até o fim do período, com resumo por alcance.',
  ANALITICA: 'Cada resultado registrado no período, para acompanhar a evolução.',
};

function exportFailure(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível exportar a planilha. Tente de novo.';
  }
  if (error.status === 403) {
    return 'O seu perfil não exporta dados do projeto.';
  }
  if ([400, 404].includes(error.status)) return error.message;
  return 'Não foi possível exportar a planilha. Tente de novo.';
}

function saveDownloadedFile(blob: Blob, fileName: string): void {
  if (typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL?.(url);
}

/**
 * Exportação dos dados de execução do projeto em planilha CSV aberta (HU-13, RF38, CA-13.5).
 */
export function ProjectExportDialog({
  projectId,
  open,
  onClose,
  onExported,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onExported?: (fileName: string) => void;
}) {
  const exportCsv = useExportProjectCsv(projectId);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const visao = useWatch({
    control: form.control,
    name: 'visao',
    defaultValue: DEFAULT_VALUES.visao,
  });

  function close() {
    setFailure(null);
    form.reset(DEFAULT_VALUES);
    onClose();
  }

  async function onValid(values: FormValues) {
    try {
      const { blob, fileName } = await exportCsv.mutateAsync(values);
      saveDownloadedFile(blob, fileName);
      close();
      onExported?.(fileName);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_PERIOD') {
        form.setError('to', { type: 'server', message: error.message }, { shouldFocus: true });
        return;
      }
      setFailure(exportFailure(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const busy = exportCsv.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar planilha</DialogTitle>
          <DialogDescription>
            Baixe a planilha CSV (UTF-8, separada por ponto e vírgula) com a legenda dos campos, a
            data de corte, as metas e as atividades do período.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DateField
                control={form.control}
                name="from"
                label="Início do período"
                disabled={busy}
              />
              <DateField control={form.control} name="to" label="Fim do período" disabled={busy} />
            </div>

            <FieldSet>
              <FieldLegend variant="label">Visão das metas</FieldLegend>
              {EXPORT_GOAL_VIEWS.map((option) => (
                <label
                  key={option}
                  className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="visao"
                    value={option}
                    checked={visao === option}
                    disabled={busy}
                    onChange={() => form.setValue('visao', option)}
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <span className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">{VIEW_LABELS[option]}</span>
                    <span className="text-muted-foreground">{VIEW_DESCRIPTIONS[option]}</span>
                  </span>
                </label>
              ))}
            </FieldSet>

            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                <DownloadIcon data-icon="inline-start" />
                {busy ? 'Exportando…' : 'Baixar planilha'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
