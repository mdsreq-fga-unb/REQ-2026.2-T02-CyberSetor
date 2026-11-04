import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { CampoInscricao, SituacaoInscricao } from '../generated/prisma/enums.js';
import { ageOn, birthDateProblem } from '../public-registrations/participant-data.js';
import { termVersion } from './term.js';
import { nextSituation, waitlistPosition } from './waitlist.js';

/**
 * Regras comuns da inscrição pelo formulário público (HU-07a) e da presencial assistida (HU-08):
 * campos pedidos pela atividade, responsável legal, compromissos da turma, cadastro repetido e
 * vaga ou lista de espera. As duas entradas usam estas funções para não divergirem.
 */

export const ADULT_AGE = 18;

/** Campo da lista fechada ↔ propriedade do envio e do cadastro do participante. */
export const FIELD_OF: Record<CampoInscricao, 'email' | 'cpf' | 'bairroRegiao' | 'escolaridade'> = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
};

export type AskedFields = Partial<Record<(typeof FIELD_OF)[CampoInscricao], string | null>>;

export interface Guardian {
  nome: string;
  telefone: string;
}

export function invalid(code: string, message: string, details: object = {}): BadRequestException {
  return new BadRequestException({ code, message, details });
}

export function alreadyRegistered(): ConflictException {
  return new ConflictException({
    code: 'ALREADY_REGISTERED',
    message: 'Já existe uma inscrição com estes dados nesta atividade.',
  });
}

/** Com termo, o envio traz a versão aceita, que precisa ser a do texto atual. */
export function assertTermAccepted(termo: string | null, versaoTermo: string | undefined): void {
  if (termo && versaoTermo === undefined) {
    throw invalid('TERM_NOT_ACCEPTED', 'Leia e aceite os compromissos da turma para se inscrever.');
  }
  if (versaoTermo !== undefined && (!termo || versaoTermo !== termVersion(termo))) {
    throw invalid(
      'TERM_OUTDATED',
      'Os compromissos da turma mudaram. Leia o texto atual e envie de novo.',
    );
  }
}

/** Campos que a atividade não pede e que vieram no envio (RNF05). */
export function assertOnlyAsked(asked: readonly CampoInscricao[], sent: AskedFields): void {
  const notAsked = (Object.keys(FIELD_OF) as CampoInscricao[]).filter(
    (campo) => !asked.includes(campo) && sent[FIELD_OF[campo]] !== undefined,
  );
  if (notAsked.length > 0) {
    throw invalid('FIELD_NOT_ASKED', 'O formulário recebeu campos que esta atividade não pede.', {
      campos: notAsked,
    });
  }
}

/** Todos os campos pedidos pela atividade precisam ter valor (RNF05). */
export function assertAskedPresent(asked: readonly CampoInscricao[], values: AskedFields): void {
  const missing = asked.filter((campo) => !values[FIELD_OF[campo]]);
  if (missing.length > 0) {
    throw invalid('MISSING_FIELDS', 'Preencha todos os campos pedidos.', { campos: missing });
  }
}

/** Menor de 18 anos exige o responsável legal (RN-06); para adulto, o responsável é descartado. */
export function guardianOf(
  dataNascimento: string,
  data: { responsavelNome?: string; responsavelTelefone?: string },
  today: string,
): Guardian | null {
  const problem = birthDateProblem(dataNascimento, today);
  if (problem) throw invalid('INVALID_BIRTH_DATE', problem);
  if (ageOn(dataNascimento, today) >= ADULT_AGE) return null;
  if (!data.responsavelNome || !data.responsavelTelefone) {
    throw invalid(
      'GUARDIAN_REQUIRED',
      'Para menores de 18 anos, informe o nome e o telefone do responsável legal.',
    );
  }
  return { nome: data.responsavelNome, telefone: data.responsavelTelefone };
}

export interface EnrollmentInput {
  atividadeId: string;
  regras: { vagas: number; listaEspera: boolean };
  chave: string;
  versaoAviso: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  guardian: Guardian | null;
  termo: string | null;
  /** Quem registrou a inscrição presencial; nulo no formulário público. */
  criadoPorId?: string;
  /** Cria ou completa o cadastro do participante depois das checagens de repetição e vaga. */
  participante: () => Promise<{ id: string }>;
}

/**
 * Grava a inscrição dentro da transação que travou a configuração (`lockRegistration`): recusa o
 * cadastro repetido, decide entre vaga e lista de espera e devolve a posição na espera.
 */
export async function enroll(
  tx: Prisma.TransactionClient,
  input: EnrollmentInput,
): Promise<{
  inscricao: { id: string; situacao: SituacaoInscricao; criadoEm: Date };
  participanteId: string;
  posicaoEspera: number | null;
}> {
  const { atividadeId, regras } = input;
  const repeated = await tx.inscricao.count({
    where: { atividadeId, chaveDuplicidade: input.chave },
  });
  if (repeated > 0) throw alreadyRegistered();

  const situacao = await nextSituation(tx, atividadeId, regras.vagas);
  if (situacao === SituacaoInscricao.LISTA_ESPERA && !regras.listaEspera) {
    throw new ConflictException({
      code: 'REGISTRATION_FULL',
      message: 'As vagas desta atividade já foram preenchidas.',
    });
  }
  const participante = await input.participante();
  const inscricao = await tx.inscricao.create({
    data: {
      atividadeId,
      participanteId: participante.id,
      situacao,
      chaveDuplicidade: input.chave,
      versaoAviso: input.versaoAviso,
      avisoApresentadoEm: new Date(),
      autorizaComunicados: input.autorizaComunicados,
      autorizaImagem: input.autorizaImagem,
      responsavelNome: input.guardian?.nome ?? null,
      responsavelTelefone: input.guardian?.telefone ?? null,
      termoAceito: input.termo,
      termoAceitoEm: input.termo ? new Date() : null,
      criadoPorId: input.criadoPorId ?? null,
    },
  });
  return {
    inscricao,
    participanteId: participante.id,
    posicaoEspera:
      situacao === SituacaoInscricao.LISTA_ESPERA
        ? await waitlistPosition(tx, atividadeId, inscricao.ordemChegada)
        : null,
  };
}
