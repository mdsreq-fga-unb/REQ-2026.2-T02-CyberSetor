'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, CheckCircle2Icon, RotateCcwIcon, UserPlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useSession } from '@/auth/hooks/use-session';
import { CpfField, DateField, PhoneField, TextField } from '@/components/form/fields';
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
import { Field, FieldGroup } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { ageOn, isValidCpf, isValidPhone, todayInBrasilia } from '@/lib/br';
import { phoneSchema } from '@/lib/schemas';
import { usePublicForm } from '@/queries/inscricao-publica';
import { useCreateAssistedRegistration, useRegistration } from '@/queries/inscricoes';
import { checkParticipantDuplicate, type DuplicateCheckParticipant } from '@/queries/participantes';
import type { Activity } from '@/types/atividades';
import type { AssistedRegistrationResponse, CampoInscricao } from '@/types/inscricoes';

const ADULT_AGE = 18;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FALLBACK_NOTICE = {
  versao: '2026-10-30-provisoria',
  texto:
    'O Instituto Cultural e Social No Setor usa os dados deste formulário para a sua inscrição ' +
    'na atividade e para a prestação de contas da parceria que a financia. Os dados ficam ' +
    'acessíveis só à equipe pedagógica, são guardados pelo prazo legal da prestação de contas ' +
    'e não são compartilhados para outros fins. As autorizações de comunicados e de uso de ' +
    'imagem e voz são opcionais e podem ser revogadas a qualquer momento junto ao Instituto. ' +
    'Você pode pedir a correção, a exclusão ou a anonimização dos seus dados.',
};

function isMinor(birthDate: string): boolean {
  return ISO_DATE.test(birthDate) && ageOn(birthDate, todayInBrasilia()) < ADULT_AGE;
}

function buildAssistedSchema(hasTerm: boolean) {
  return z
    .object({
      nome: z.string().trim().min(2, 'Informe o nome completo.').max(150),
      nomePreferencia: z.string().max(80, 'Use no máximo 80 caracteres.').optional(),
      telefone: phoneSchema(),
      dataNascimento: z
        .string()
        .regex(ISO_DATE, 'Informe a data de nascimento no formato AAAA-MM-DD.')
        .refine((v) => v <= todayInBrasilia(), 'A data não pode ser no futuro.'),
      email: z.string().optional(),
      cpf: z.string().optional(),
      bairroRegiao: z.string().optional(),
      escolaridade: z.string().optional(),
      avisoLido: z
        .boolean()
        .refine(
          (val) => val === true,
          'É obrigatório confirmar a leitura e apresentação verbal do aviso.',
        ),
      aceiteTermo: z.boolean().optional(),
      autorizaComunicados: z.boolean(),
      autorizaImagem: z.boolean(),
      responsavelNome: z.string().optional(),
      responsavelTelefone: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isMinor(data.dataNascimento)) {
        if (!data.responsavelNome || data.responsavelNome.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['responsavelNome'],
            message: 'Informe o nome do responsável legal para participantes menores de 18 anos.',
          });
        }
        if (!data.responsavelTelefone || !isValidPhone(data.responsavelTelefone)) {
          ctx.addIssue({
            code: 'custom',
            path: ['responsavelTelefone'],
            message: 'Informe o telefone do responsável legal com DDD.',
          });
        }
      }
      if (hasTerm && !data.aceiteTermo) {
        ctx.addIssue({
          code: 'custom',
          path: ['aceiteTermo'],
          message: 'É obrigatório confirmar a apresentação e o aceite dos compromissos da turma.',
        });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildAssistedSchema>>;

const DEFAULT_VALUES: FormValues = {
  nome: '',
  nomePreferencia: '',
  telefone: '',
  dataNascimento: '',
  email: '',
  cpf: '',
  bairroRegiao: '',
  escolaridade: '',
  avisoLido: true,
  aceiteTermo: false,
  autorizaComunicados: false,
  autorizaImagem: false,
  responsavelNome: '',
  responsavelTelefone: '',
};

export function AssistedRegistrationDialog({
  open,
  activity,
  onClose,
  onSuccess,
}: {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSuccess?: (res: AssistedRegistrationResponse) => void;
}) {
  const { session } = useSession();
  const createAssisted = useCreateAssistedRegistration(activity?.id ?? '');
  const registrationQuery = useRegistration(activity?.id, open && Boolean(activity?.id));
  const publicForm = usePublicForm(registrationQuery.data?.codigoPublico ?? '');

  const [duplicateParticipant, setDuplicateParticipant] =
    useState<DuplicateCheckParticipant | null>(null);
  const [isReusing, setIsReusing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const hasTerm = Boolean(publicForm.data?.termo);
  const noticeVersion = publicForm.data?.aviso.versao ?? FALLBACK_NOTICE.versao;
  const noticeText = publicForm.data?.aviso.texto ?? FALLBACK_NOTICE.texto;

  const vagasEsgotadas =
    publicForm.data?.vagasEsgotadas ??
    (activity?.inscricao
      ? (activity.inscricao.inscritos ?? 0) >= (activity.inscricao.vagas ?? 0)
      : false);
  const proximaPosicao =
    ((activity?.inscricao as unknown as { emEspera?: number; listaEspera?: number })?.emEspera ??
      (activity?.inscricao as unknown as { emEspera?: number; listaEspera?: number })?.listaEspera ??
      0) + 1;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildAssistedSchema(hasTerm)),
    defaultValues: DEFAULT_VALUES,
  });

  const birthDate = useWatch({ control, name: 'dataNascimento' });
  const cpfValue = useWatch({ control, name: 'cpf' });
  const emailValue = useWatch({ control, name: 'email' });

  const askedFields: CampoInscricao[] = registrationQuery.data?.camposAdicionais ?? [
    'CPF',
    'EMAIL',
  ];
  const keyField = registrationQuery.data?.campoDuplicidade ?? 'CPF';

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    setDuplicateParticipant(null);
    setIsReusing(false);
    setServerError(null);
    onClose();
  };

  // Consulta duplicidade em tempo real (POST com payload JSON sem PII em URL - RNF05)
  useEffect(() => {
    if (!open || isReusing) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        if (keyField === 'CPF') {
          const digits = (cpfValue ?? '').replace(/\D/g, '');
          if (digits.length === 11 && isValidCpf(digits)) {
            const res = await checkParticipantDuplicate({ cpf: digits });
            if (active && res.existe && res.participante) {
              setDuplicateParticipant(res.participante);
            } else if (active) {
              setDuplicateParticipant(null);
            }
          } else if (active) {
            setDuplicateParticipant(null);
          }
        } else if (keyField === 'EMAIL') {
          const trimmed = (emailValue ?? '').trim().toLowerCase();
          if (trimmed.includes('@') && trimmed.includes('.')) {
            const res = await checkParticipantDuplicate({ email: trimmed });
            if (active && res.existe && res.participante) {
              setDuplicateParticipant(res.participante);
            } else if (active) {
              setDuplicateParticipant(null);
            }
          } else if (active) {
            setDuplicateParticipant(null);
          }
        }
      } catch {
        // Falhas silenciosas de checagem prévia não impedem o fluxo
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, keyField, cpfValue, emailValue, isReusing]);

  const handleApplyReuse = () => {
    if (!duplicateParticipant) return;
    setValue('nome', duplicateParticipant.nome);
    setIsReusing(true);
  };

  const handleCancelReuse = () => {
    setIsReusing(false);
  };

  const onSubmit = async (values: FormValues) => {
    if (!activity) return;
    setServerError(null);

    try {
      const response = await createAssisted.mutateAsync({
        reaproveitarParticipanteId: isReusing ? duplicateParticipant?.id : undefined,
        nome: values.nome,
        nomePreferencia: values.nomePreferencia?.trim() || undefined,
        telefone: values.telefone,
        dataNascimento: values.dataNascimento,
        email: values.email || undefined,
        cpf: values.cpf || undefined,
        bairroRegiao: values.bairroRegiao || undefined,
        escolaridade: values.escolaridade || undefined,
        versaoAviso: noticeVersion,
        autorizaComunicados: values.autorizaComunicados,
        autorizaImagem: values.autorizaImagem,
        responsavelNome: isMinor(values.dataNascimento) ? values.responsavelNome : undefined,
        responsavelTelefone: isMinor(values.dataNascimento)
          ? values.responsavelTelefone
          : undefined,
      });

      if (response.situacao === 'CONFIRMADA') {
        toast.add({
          type: 'success',
          title: `Inscrição de "${response.participante.nome}" confirmada!`,
          description: 'Vaga garantida na atividade.',
        });
      } else {
        toast.add({
          type: 'info',
          title: `Inscrição de "${response.participante.nome}" na lista de espera!`,
          description: `Participante colocado na ${response.posicaoEspera}ª posição.`,
        });
      }

      onSuccess?.(response);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'ALREADY_REGISTERED') {
          setServerError('Esta pessoa já possui inscrição ativa nesta atividade.');
        } else if (err.code === 'GUARDIAN_REQUIRED') {
          setServerError('Dados do responsável legal são obrigatórios para menores de 18 anos.');
        } else if (err.code === 'MISSING_FIELDS') {
          setServerError('Preencha todos os campos obrigatórios exigidos pela atividade.');
        } else if (err.code === 'REGISTRATION_CLOSED') {
          setServerError('As inscrições para esta atividade estão encerradas.');
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Não foi possível registrar a inscrição. Tente novamente.');
      }
    }
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <UserPlusIcon className="size-4" aria-hidden="true" />
            <span>Inscrição Presencial Assistida</span>
          </div>
          <DialogTitle className="text-xl">Inscrever participante em {activity.titulo}</DialogTitle>
          <DialogDescription>
            Preencha os dados do participante sem celular ou conexão. O registro será associado ao
            seu usuário para fins de auditoria.
          </DialogDescription>
        </DialogHeader>

        {/* Banner prévio de Lista de Espera se vagas esgotadas (CA-08.5) */}
        {vagasEsgotadas && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2.5 p-3 rounded-md bg-warning/20 border border-warning/40 text-foreground text-sm"
          >
            <AlertCircleIcon
              className="size-5 shrink-0 text-amber-700 dark:text-warning mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-900 dark:text-warning">
                Vagas esgotadas: Esta inscrição entrará na Lista de Espera
              </p>
              <p className="text-xs text-amber-800 dark:text-muted-foreground">
                Ao concluir o cadastro presencial, o participante será posicionado na{' '}
                <strong>{proximaPosicao}ª posição</strong> da lista de espera.
              </p>
            </div>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20"
          >
            <AlertCircleIcon className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="space-y-3">
            <div className="text-sm font-semibold text-foreground/80 border-b pb-1">
              1. Identificação do participante
            </div>

            {isReusing && duplicateParticipant && (
              <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/60 border text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
                  <span>
                    Reaproveitando cadastro de <strong>{duplicateParticipant.nome}</strong>
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelReuse}
                  className="min-h-12 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcwIcon className="size-3.5 mr-1" aria-hidden="true" />
                  Desfazer
                </Button>
              </div>
            )}

            <TextField control={control} name="nome" label="Nome completo *" disabled={isReusing} />

            <TextField
              control={control}
              name="nomePreferencia"
              label="Como prefere ser chamado(a)? (opcional)"
              disabled={isReusing}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PhoneField
                control={control}
                name="telefone"
                label="Telefone com DDD *"
                disabled={isReusing}
              />

              <DateField
                control={control}
                name="dataNascimento"
                label="Data de nascimento *"
                disabled={isReusing}
              />
            </div>

            {/* Aviso dinâmico de Menor de 18 anos */}
            {isMinor(birthDate) && (
              <div className="p-3 rounded-md bg-warning/15 border border-warning/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-warning">
                  <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>Participante menor de 18 anos — dados do responsável obrigatórios</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="responsavelNome"
                    label="Nome do responsável legal *"
                  />
                  <PhoneField
                    control={control}
                    name="responsavelTelefone"
                    label="Telefone do responsável *"
                  />
                </div>
              </div>
            )}

            {/* Chave de duplicidade da atividade */}
            {keyField === 'CPF' && (
              <CpfField
                control={control}
                name="cpf"
                label="CPF do participante *"
                disabled={isReusing}
              />
            )}

            {keyField === 'EMAIL' && (
              <TextField
                control={control}
                name="email"
                type="email"
                label="E-mail do participante *"
                disabled={isReusing}
              />
            )}

            {/* Card de Aviso se detectar duplicidade na digitação (RNF05 com dados mascarados) */}
            {duplicateParticipant && !isReusing && (
              <div
                role="region"
                aria-label="Aviso de cadastro repetido"
                className="p-3.5 rounded-md bg-warning/15 border border-warning/30 text-sm space-y-2.5"
              >
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="size-5 text-amber-700 dark:text-warning shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-900 dark:text-warning">
                      Cadastro existente detectado na base
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      Encontramos o cadastro de <strong>{duplicateParticipant.nome}</strong> (tel:{' '}
                      {duplicateParticipant.telefoneMascarado}
                      {duplicateParticipant.cpfMascarado
                        ? ` · CPF: ${duplicateParticipant.cpfMascarado}`
                        : ''}
                      {duplicateParticipant.emailMascarado
                        ? ` · e-mail: ${duplicateParticipant.emailMascarado}`
                        : ''}
                      ). Confirme verbalmente com o participante para reaproveitar os dados sem
                      duplicidade.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={handleApplyReuse}
                    className="min-h-12 px-4"
                  >
                    Reaproveitar cadastro
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue(keyField === 'CPF' ? 'cpf' : 'email', '');
                      setDuplicateParticipant(null);
                    }}
                    className="min-h-12 px-4"
                  >
                    Corrigir {keyField === 'CPF' ? 'CPF' : 'E-mail'}
                  </Button>
                </div>
              </div>
            )}

            {/* Demais campos adicionais pedidos pela atividade */}
            {askedFields.includes('BAIRRO_REGIAO') && (
              <TextField
                control={control}
                name="bairroRegiao"
                label="Bairro ou Região Administrativa"
                disabled={isReusing}
              />
            )}

            {askedFields.includes('ESCOLARIDADE') && (
              <TextField
                control={control}
                name="escolaridade"
                label="Escolaridade"
                disabled={isReusing}
              />
            )}
          </FieldGroup>

          <FieldGroup className="space-y-3 pt-2">
            <div className="text-sm font-semibold text-foreground/80 border-b pb-1">
              2. Consentimentos e Apresentação (LGPD)
            </div>

            {/* Apresentação do Aviso de Privacidade para leitura verbal (CA-08.4) */}
            <div className="rounded-md border bg-muted/40 p-3 space-y-1.5 text-xs text-muted-foreground max-h-32 overflow-y-auto">
              <p className="font-semibold text-foreground">
                Aviso de Tratamento de Dados (apresentar verbalmente):
              </p>
              <p className="leading-relaxed">{noticeText}</p>
            </div>

            <Field className="space-y-1">
              <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer min-h-12 py-1">
                <input
                  type="checkbox"
                  {...register('avisoLido')}
                  className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                />
                <span>
                  Confirmo que <strong>li e apresentei verbalmente</strong> o Aviso de Tratamento de
                  Dados ao participante/responsável legal antes da coleta. *
                </span>
              </label>
              {errors.avisoLido && (
                <span className="text-xs text-destructive">{errors.avisoLido.message}</span>
              )}
            </Field>

            {/* Termo de Compromisso da Turma quando configurado */}
            {hasTerm && publicForm.data?.termo && (
              <div className="space-y-2 pt-1 border-t">
                <div className="rounded-md border bg-muted/40 p-3 space-y-1 text-xs text-muted-foreground max-h-28 overflow-y-auto">
                  <p className="font-semibold text-foreground">Compromissos da turma:</p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {publicForm.data.termo.texto}
                  </p>
                </div>
                <Field className="space-y-1">
                  <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer min-h-12 py-1">
                    <input
                      type="checkbox"
                      {...register('aceiteTermo')}
                      className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                    />
                    <span>
                      Confirmo a apresentação e o <strong>aceite dos compromissos da turma</strong>{' '}
                      pelo participante. *
                    </span>
                  </label>
                  {errors.aceiteTermo && (
                    <span className="text-xs text-destructive">{errors.aceiteTermo.message}</span>
                  )}
                </Field>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer min-h-12 py-1">
                <input
                  type="checkbox"
                  {...register('autorizaComunicados')}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                />
                <span>
                  Participante autoriza receber comunicados e lembretes por WhatsApp/E-mail
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer min-h-12 py-1">
                <input
                  type="checkbox"
                  {...register('autorizaImagem')}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                />
                <span>
                  Participante autoriza uso institucional de imagem e voz para prestação de contas
                </span>
              </label>
            </div>
          </FieldGroup>

          <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground border">
            Inscrição assistida registrada com perfil autenticado{' '}
            <Badge variant="outline" className="text-[10px] ml-1">
              {session?.perfil === 'NUCLEO_PEDAGOGICO'
                ? 'Núcleo Pedagógico'
                : (session?.perfil ?? 'Operador')}
            </Badge>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-h-12 px-4"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-12 px-4">
              {isSubmitting ? 'Concluindo...' : 'Concluir inscrição'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
