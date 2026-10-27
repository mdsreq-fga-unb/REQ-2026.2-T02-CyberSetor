'use client';

import { ExternalLinkIcon, FileTextIcon, UploadIcon } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { ListEmpty, ListError } from '@/components/list/list-states';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { useAttachDocument, useInstrumentDocument } from '@/queries/instrumentos';
import type { Instrument } from '@/types/instrumentos';
import {
  DOCUMENT_ACCEPT,
  documentFileProblem,
  documentKind,
  formatBytes,
  formatDateTime,
} from './format';

function uploadFailure(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível enviar o arquivo. Tente de novo.';
  if (error.status === 415) return 'O documento formal precisa ser PDF ou DOCX.';
  if (error.status === 413) return 'O arquivo passa de 20 MB.';
  if (error.status === 403) return 'Só a Presidência e Gestão anexa o documento formal.';
  if ([400, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível enviar o arquivo. Tente de novo.';
}

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta o documento formal.';
  }
  return 'Não foi possível carregar o documento formal. Tente de novo.';
}

export function InstrumentDocument({
  instrument,
  canEdit,
}: {
  instrument: Instrument;
  canEdit: boolean;
}) {
  const document = useInstrumentDocument(instrument.id);
  const attach = useAttachDocument(instrument.id);
  const input = useRef<HTMLInputElement>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const replacing = Boolean(document.data);

  async function onChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = documentFileProblem(file);
    setFailure(problem);
    if (problem) return;
    try {
      await attach.mutateAsync(file);
      toast.add({
        type: 'success',
        title: replacing ? 'Documento formal substituído' : 'Documento formal anexado',
      });
    } catch (error) {
      setFailure(uploadFailure(error));
    }
  }

  const chooseButton = canEdit && (
    <Button
      variant={replacing ? 'outline' : 'default'}
      disabled={attach.isPending}
      onClick={() => input.current?.click()}
    >
      <UploadIcon data-icon="inline-start" />
      {attach.isPending ? 'Enviando…' : replacing ? 'Substituir documento' : 'Anexar documento'}
    </Button>
  );

  return (
    <section className="flex flex-col gap-4" aria-labelledby="documento-titulo">
      <h2 id="documento-titulo" className="text-lg font-semibold">
        Documento formal
      </h2>
      {canEdit && (
        <input
          ref={input}
          type="file"
          accept={DOCUMENT_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label="Arquivo do documento formal"
          onChange={(event) => void onChosen(event)}
        />
      )}

      {document.isPending ? (
        <div className="flex flex-col gap-2 rounded-lg border p-4" aria-hidden="true">
          <Skeleton className="h-5 w-full max-w-sm" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      ) : document.error && document.data === undefined ? (
        <div className="flex flex-col gap-3">
          <ListError message={loadFailure(document.error)} />
          <Button variant="outline" className="self-start" onClick={() => void document.refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : document.data ? (
        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <FileTextIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-medium break-all">{document.data.nomeArquivo}</span>
              <span className="text-muted-foreground">
                {documentKind(document.data.tipoConteudo)} · {formatBytes(document.data.tamanho)} ·
                enviado em {formatDateTime(document.data.enviadoEm)} por{' '}
                {document.data.enviadoPor.nome}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {document.data.url && (
              <a
                href={document.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'default' })}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                Abrir documento
              </a>
            )}
            {chooseButton}
          </div>
        </div>
      ) : (
        <ListEmpty
          icon={FileTextIcon}
          title="Nenhum documento formal anexado"
          description="Anexe o termo ou o ato que celebra o instrumento, em PDF ou DOCX, com até 20 MB."
          action={chooseButton || undefined}
        />
      )}

      {failure && (
        <p role="alert" className="text-destructive">
          {failure}
        </p>
      )}
    </section>
  );
}
