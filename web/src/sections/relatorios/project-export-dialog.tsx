'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DownloadIcon } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
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
import {
  EXPORT_FORMATS,
  EXPORT_GOAL_VIEWS,
  type ExportFormat,
  type ExportGoalView,
} from '@/types/relatorios';

const DATE = dateSchema('Informe a data completa.');

const schema = z
  .object({
    from: DATE,
    to: DATE,
    visao: z.enum(EXPORT_GOAL_VIEWS, { message: 'Escolha a visão das metas.' }),
    formato: z.enum(EXPORT_FORMATS, { message: 'Escolha o formato da planilha.' }),
  })
  .refine((values) => values.to >= values.from, {
    path: ['to'],
    message: 'A data final não pode ser anterior à data inicial.',
    when: (payload) => z.object({ from: DATE, to: DATE }).safeParse(payload.value).success,
  });

type FormValues = z.infer<typeof schema>;

function defaultValues(from = '', to = ''): FormValues {
  return {
    from,
    to,
    visao: 'CONSOLIDADA',
    formato: 'xlsx',
  };
}

const VIEW_LABELS: Record<ExportGoalView, string> = {
  CONSOLIDADA: 'Consolidada',
  ANALITICA: 'Analítica',
};

const VIEW_DESCRIPTIONS: Record<ExportGoalView, string> = {
  CONSOLIDADA: 'Último resultado de cada meta até o fim do período, com resumo por alcance.',
  ANALITICA: 'Cada resultado registrado no período, para acompanhar a evolução.',
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: 'Excel (XLSX)',
  csv: 'CSV',
};

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  xlsx: 'Abre direto no Excel, no LibreOffice e no Google Planilhas.',
  csv: 'Texto separado por ponto e vírgula, para levar a outros sistemas.',
};

function OptionCards<T extends string>({
  name,
  legend,
  options,
  labels,
  descriptions,
  value,
  disabled,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  labels: Record<T, string>;
  descriptions: Record<T, string>;
  value: T;
  disabled: boolean;
  onChange: (option: T) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      {options.map((option) => (
        <label
          key={option}
          className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            disabled={disabled}
            onChange={() => onChange(option)}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium">{labels[option]}</span>
            <span className="text-muted-foreground">{descriptions[option]}</span>
          </span>
        </label>
      ))}
    </FieldSet>
  );
}

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

const REVOKE_URL_DELAY_MS = 10_000;

function saveDownloadedFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_DELAY_MS);
}

/**
 * Exportação dos dados de execução do projeto em planilha aberta, XLSX ou CSV (HU-13, RF38,
 * CA-13.1, CA-13.5).
 */
export function ProjectExportDialog({
  projectId,
  open,
  defaultFrom = '',
  defaultTo = '',
  onClose,
  onExported,
}: {
  projectId: string;
  open: boolean;
  defaultFrom?: string;
  defaultTo?: string;
  onClose: () => void;
  onExported?: (fileName: string) => void;
}) {
  const exportCsv = useExportProjectCsv(projectId);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(defaultFrom, defaultTo),
  });

  useEffect(() => {
    if (open && !form.formState.isDirty) {
      form.reset(defaultValues(defaultFrom, defaultTo));
    }
  }, [open, defaultFrom, defaultTo, form]);

  const visao = useWatch({
    control: form.control,
    name: 'visao',
    defaultValue: 'CONSOLIDADA',
  });
  const formato = useWatch({
    control: form.control,
    name: 'formato',
    defaultValue: 'xlsx',
  });

  function close() {
    setFailure(null);
    form.reset(defaultValues(defaultFrom, defaultTo));
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
            Baixe a planilha com a legenda dos campos, a data de corte, as metas e as atividades do
            período.
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

            <OptionCards
              name="visao"
              legend="Visão das metas"
              options={EXPORT_GOAL_VIEWS}
              labels={VIEW_LABELS}
              descriptions={VIEW_DESCRIPTIONS}
              value={visao}
              disabled={busy}
              onChange={(option) => form.setValue('visao', option)}
            />

            <OptionCards
              name="formato"
              legend="Formato"
              options={EXPORT_FORMATS}
              labels={FORMAT_LABELS}
              descriptions={FORMAT_DESCRIPTIONS}
              value={formato}
              disabled={busy}
              onChange={(option) => form.setValue('formato', option)}
            />

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
