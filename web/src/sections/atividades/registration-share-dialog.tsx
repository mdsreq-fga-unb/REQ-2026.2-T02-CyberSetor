'use client';

import { CheckIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, QrCodeIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ListError } from '@/components/list/list-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { downloadDataUrl, generateQrCodeDataUrl } from '@/lib/qrcode';
import { useRegistration } from '@/queries/inscricoes';
import type { Activity } from '@/types/atividades';
import type { Registration } from '@/types/inscricoes';
import { registrationLoadFailure } from './format';

export function RegistrationShareDialog({
  open,
  activity,
  initialRegistration,
  onClose,
  onOpenConfigure,
}: {
  open: boolean;
  activity: Activity | null;
  initialRegistration?: Registration | null;
  onClose: () => void;
  onOpenConfigure?: () => void;
}) {
  const activityId = activity?.id ?? '';
  const registrationQuery = useRegistration(activityId, open && !initialRegistration);
  const registration = initialRegistration ?? registrationQuery.data;

  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState<{ forUrl: string; dataUrl: string } | null>(null);
  const [qrError, setQrError] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fullUrl =
    typeof window !== 'undefined' && registration?.linkPublico
      ? `${window.location.origin}${registration.linkPublico}`
      : (registration?.linkPublico ?? '');

  const qrDataUrl = generated?.forUrl === fullUrl ? generated.dataUrl : null;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open || !fullUrl) return;
    let cancelled = false;
    generateQrCodeDataUrl(fullUrl)
      .then((url) => {
        if (!cancelled) {
          setGenerated({ forUrl: fullUrl, dataUrl: url });
          setQrError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError(true);
          setGenerated(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, fullUrl]);

  function copyInputFallback() {
    const input = document.getElementById('link-publico-input') as HTMLInputElement | null;
    if (input) {
      input.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback silencioso
      }
    }
  }

  async function handleCopy() {
    if (!fullUrl) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
      } else {
        copyInputFallback();
      }
    } catch {
      copyInputFallback();
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const safeTitle = activity?.titulo
      ? activity.titulo
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .slice(0, 30)
      : 'atividade';
    downloadDataUrl(qrDataUrl, `qrcode-inscricao-${safeTitle}.png`);
  }

  function handleClose() {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setCopied(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Divulgar inscrição da atividade</DialogTitle>
          <DialogDescription>
            Compartilhe o link público ou o QR Code nos canais do Instituto.
          </DialogDescription>
        </DialogHeader>

        {registrationQuery.isPending && !initialRegistration ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando link público…
          </div>
        ) : registrationQuery.isError && !initialRegistration ? (
          <div className="flex flex-col gap-3 py-2">
            <ListError message={registrationLoadFailure(registrationQuery.error)} />
            <Button
              variant="outline"
              onClick={() => void registrationQuery.refetch()}
              className="h-12 min-h-12 self-start"
            >
              Tentar de novo
            </Button>
          </div>
        ) : !registration ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <QrCodeIcon className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">A inscrição desta atividade ainda não foi aberta.</p>
            <p className="text-xs text-muted-foreground">
              Configure o formulário e abra a inscrição para gerar o link e o QR Code públicos.
            </p>
            {onOpenConfigure && (
              <Button
                onClick={() => {
                  handleClose();
                  onOpenConfigure();
                }}
                className="mt-2 h-12 min-h-12"
              >
                Configurar inscrição agora
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {!registration.aberta && (
              <div
                role="alert"
                className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400"
              >
                <span>
                  <strong>Aviso:</strong> As inscrições estão encerradas. O formulário público
                  exibirá aviso de encerramento e não aceitará novos envios.
                </span>
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-500 text-amber-700 dark:text-amber-400"
                >
                  Encerrada
                </Badge>
              </div>
            )}

            {/* Link público com botão de cópia */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="link-publico-input" className="text-sm font-medium">
                Link público do formulário
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="link-publico-input"
                  readOnly
                  value={fullUrl}
                  className="h-12 min-h-12 font-mono text-xs sm:text-sm"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="h-12 min-h-12 shrink-0 sm:w-36"
                >
                  {copied ? (
                    <>
                      <CheckIcon data-icon="inline-start" className="size-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <CopyIcon data-icon="inline-start" className="size-4" />
                      Copiar link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Visualização do QR Code */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-6 text-center">
              {qrError ? (
                <p className="text-sm text-destructive">
                  Não foi possível gerar a imagem do QR Code.
                </p>
              ) : qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg bg-white p-3 shadow-xs dark:bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={`QR Code para inscrição na atividade ${activity?.titulo ?? ''}`}
                      width={216}
                      height={216}
                      className="size-[216px]"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{activity?.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      Aponte a câmera do celular para se inscrever
                    </span>
                  </div>
                </div>
              ) : (
                <div className="size-[216px] animate-pulse rounded-lg bg-muted" />
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-12 min-h-12"
              >
                Fechar
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  className="h-12 min-h-12"
                >
                  <DownloadIcon data-icon="inline-start" className="size-4" />
                  Baixar QR Code PNG
                </Button>
                <Button
                  type="button"
                  onClick={() => window.open(fullUrl, '_blank', 'noopener,noreferrer')}
                  className="h-12 min-h-12"
                >
                  <ExternalLinkIcon data-icon="inline-start" className="size-4" />
                  Abrir formulário
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
