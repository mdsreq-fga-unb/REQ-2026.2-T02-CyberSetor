import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, CampoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CAMPOS_MINIMOS } from '../registrations/registrations.dto.js';
import { termVersion } from '../registrations/term.js';
import { DATA_NOTICE } from './notice.js';
import { ageOn, birthDateProblem, isValidCpf } from './participant-data.js';
import type {
  PublicFormResponse,
  SubmitRegistrationDto,
  SubmittedRegistrationResponse,
} from './public-registrations.dto.js';

const ADULT_AGE = 18;

/** Campo da lista fechada ↔ propriedade do envio. */
const FIELD_OF: Record<CampoInscricao, 'email' | 'cpf' | 'bairroRegiao' | 'escolaridade'> = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
};

const WITH_ACTIVITY = {
  atividade: {
    select: {
      id: true,
      titulo: true,
      data: true,
      local: true,
      projeto: { select: { instrumento: { select: { ativo: true } } } },
    },
  },
} as const;

type ConfigWithActivity = Prisma.ConfiguracaoInscricaoGetPayload<{ include: typeof WITH_ACTIVITY }>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function publicActivity(config: ConfigWithActivity) {
  return {
    titulo: config.atividade.titulo,
    data: isoDate(config.atividade.data),
    local: config.atividade.local,
  };
}

function isOpen(config: ConfigWithActivity): boolean {
  return config.aberta && config.atividade.projeto.instrumento.ativo;
}

function invalid(code: string, message: string, details: object = {}): BadRequestException {
  return new BadRequestException({ code, message, details });
}

@Injectable()
export class PublicRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async form(codigo: string): Promise<PublicFormResponse> {
    const config = await this.findConfig(codigo);
    return {
      atividade: publicActivity(config),
      aberta: isOpen(config),
      camposMinimos: [...CAMPOS_MINIMOS],
      camposAdicionais: [...config.camposAdicionais].sort(),
      aviso: { versao: DATA_NOTICE.versao, texto: DATA_NOTICE.texto },
      termo: config.termoCompromisso
        ? { versao: termVersion(config.termoCompromisso), texto: config.termoCompromisso }
        : null,
    };
  }

  async submit(
    codigo: string,
    data: SubmitRegistrationDto,
    correlationId: string,
  ): Promise<SubmittedRegistrationResponse> {
    const config = await this.findConfig(codigo);
    if (!isOpen(config)) {
      throw new ConflictException({
        code: 'REGISTRATION_CLOSED',
        message: 'As inscrições desta atividade estão encerradas.',
      });
    }
    if (data.versaoAviso !== DATA_NOTICE.versao) {
      throw invalid(
        'NOTICE_OUTDATED',
        'O aviso de tratamento de dados mudou. Leia o aviso atual e envie de novo.',
      );
    }
    this.assertTermAccepted(config.termoCompromisso, data.versaoTermo);
    this.assertFieldsMatchConfig(config.camposAdicionais, data);
    const guardian = this.guardianOf(data);
    if (data.cpf !== undefined && !isValidCpf(data.cpf)) {
      throw invalid('INVALID_CPF', 'CPF inválido. Confira os números.');
    }
    const chave = config.campoDuplicidade === 'EMAIL' ? data.email! : data.cpf!;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const repeated = await tx.inscricao.count({
          where: { atividadeId: config.atividadeId, chaveDuplicidade: chave },
        });
        if (repeated > 0) throw this.alreadyRegistered();

        const participante = await tx.participante.create({
          data: {
            nome: data.nome,
            nomePreferencia: data.nomePreferencia ?? null,
            telefone: data.telefone,
            dataNascimento: new Date(`${data.dataNascimento}T00:00:00.000Z`),
            email: data.email ?? null,
            cpf: data.cpf ?? null,
            bairroRegiao: data.bairroRegiao ?? null,
            escolaridade: data.escolaridade ?? null,
          },
        });
        const inscricao = await tx.inscricao.create({
          data: {
            atividadeId: config.atividadeId,
            participanteId: participante.id,
            chaveDuplicidade: chave,
            versaoAviso: DATA_NOTICE.versao,
            avisoApresentadoEm: new Date(),
            autorizaComunicados: data.autorizaComunicados,
            autorizaImagem: data.autorizaImagem,
            responsavelNome: guardian?.nome ?? null,
            responsavelTelefone: guardian?.telefone ?? null,
            termoAceito: config.termoCompromisso,
            termoAceitoEm: config.termoCompromisso ? new Date() : null,
          },
        });
        await this.audit.record(
          {
            autorTipo: AutorTipo.PUBLICO,
            acao: 'REGISTRATION_SUBMITTED',
            entidade: 'inscricao',
            entidadeId: inscricao.id,
            depois: { atividadeId: config.atividadeId, situacao: inscricao.situacao },
            correlationId,
          },
          tx,
        );
        return {
          situacao: inscricao.situacao,
          atividade: publicActivity(config),
          inscritoEm: inscricao.criadoEm.toISOString(),
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.alreadyRegistered();
      }
      throw error;
    }
  }

  private async findConfig(codigo: string): Promise<ConfigWithActivity> {
    const config = await this.prisma.configuracaoInscricao.findUnique({
      where: { codigoPublico: codigo },
      include: WITH_ACTIVITY,
    });
    if (!config) {
      throw new NotFoundException({
        code: 'REGISTRATION_LINK_NOT_FOUND',
        message: 'Link de inscrição inválido. Confira o endereço com o Instituto.',
      });
    }
    return config;
  }

  /** Com termo, o envio traz a versão aceita, que precisa ser a do texto atual. */
  private assertTermAccepted(termo: string | null, versaoTermo: string | undefined): void {
    if (termo && versaoTermo === undefined) {
      throw invalid(
        'TERM_NOT_ACCEPTED',
        'Leia e aceite os compromissos da turma para se inscrever.',
      );
    }
    if (versaoTermo !== undefined && (!termo || versaoTermo !== termVersion(termo))) {
      throw invalid(
        'TERM_OUTDATED',
        'Os compromissos da turma mudaram. Leia o texto atual e envie de novo.',
      );
    }
  }

  /** Só entram os campos pedidos pela atividade, e todos os pedidos são obrigatórios (RNF05). */
  private assertFieldsMatchConfig(asked: CampoInscricao[], data: SubmitRegistrationDto): void {
    const notAsked = (Object.keys(FIELD_OF) as CampoInscricao[]).filter(
      (campo) => !asked.includes(campo) && data[FIELD_OF[campo]] !== undefined,
    );
    if (notAsked.length > 0) {
      throw invalid('FIELD_NOT_ASKED', 'O formulário recebeu campos que esta atividade não pede.', {
        campos: notAsked,
      });
    }
    const missing = asked.filter((campo) => data[FIELD_OF[campo]] === undefined);
    if (missing.length > 0) {
      throw invalid('MISSING_FIELDS', 'Preencha todos os campos pedidos.', { campos: missing });
    }
  }

  /** Menor de 18 anos exige o responsável legal (RN-06); para adulto, o responsável é descartado. */
  private guardianOf(data: SubmitRegistrationDto): { nome: string; telefone: string } | null {
    const today = todayInBrasilia();
    const problem = birthDateProblem(data.dataNascimento, today);
    if (problem) throw invalid('INVALID_BIRTH_DATE', problem);
    if (ageOn(data.dataNascimento, today) >= ADULT_AGE) return null;
    if (!data.responsavelNome || !data.responsavelTelefone) {
      throw invalid(
        'GUARDIAN_REQUIRED',
        'Para menores de 18 anos, informe o nome e o telefone do responsável legal.',
      );
    }
    return { nome: data.responsavelNome, telefone: data.responsavelTelefone };
  }

  private alreadyRegistered(): ConflictException {
    return new ConflictException({
      code: 'ALREADY_REGISTERED',
      message: 'Já existe uma inscrição com estes dados nesta atividade.',
    });
  }
}
