import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hhmm } from '../activities/activities.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, SituacaoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CAMPOS_MINIMOS } from '../registrations/registrations.dto.js';
import { storedWithinDeadline } from '../registrations/deadline.js';
import { termVersion } from '../registrations/term.js';
import {
  alreadyRegistered,
  assertAskedPresent,
  assertOnlyAsked,
  assertTermAccepted,
  enroll,
  guardianOf,
  invalid,
} from '../registrations/enrollment.js';
import { lockRegistration, nextSituation } from '../registrations/waitlist.js';
import { DATA_NOTICE } from './notice.js';
import { isValidCpf } from './participant-data.js';
import type {
  PublicFormResponse,
  SubmitRegistrationDto,
  SubmittedRegistrationResponse,
} from './public-registrations.dto.js';

const WITH_ACTIVITY = {
  atividade: {
    select: {
      id: true,
      titulo: true,
      data: true,
      horaInicio: true,
      horaFim: true,
      cargaHorariaMinutos: true,
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
    horaInicio: hhmm(config.atividade.horaInicio),
    horaFim: hhmm(config.atividade.horaFim),
    cargaHorariaMinutos: config.atividade.cargaHorariaMinutos,
    local: config.atividade.local,
  };
}

function isOpen(config: ConfigWithActivity): boolean {
  return (
    config.aberta &&
    config.atividade.projeto.instrumento.ativo &&
    storedWithinDeadline(config.prazoInscricao, config.prazoHora)
  );
}

@Injectable()
export class PublicRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async form(codigo: string): Promise<PublicFormResponse> {
    const config = await this.findConfig(codigo);
    const situacao = await nextSituation(this.prisma, config.atividadeId, config.vagas);
    return {
      atividade: publicActivity(config),
      aberta: isOpen(config),
      vagasEsgotadas: situacao === SituacaoInscricao.LISTA_ESPERA,
      listaEspera: config.listaEspera,
      camposMinimos: [...CAMPOS_MINIMOS],
      camposAdicionais: [...config.camposAdicionais].sort(),
      aviso: { versao: DATA_NOTICE.versao, texto: DATA_NOTICE.texto },
      termo: config.termoCompromisso
        ? { versao: termVersion(config.termoCompromisso), texto: config.termoCompromisso }
        : null,
      apresentacao: config.apresentacao,
      prazoInscricao: config.prazoInscricao?.toISOString().slice(0, 10) ?? null,
      prazoHora: config.prazoHora?.toISOString().slice(11, 16) ?? null,
      contatoWhatsapp: config.contatoWhatsapp,
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
    assertTermAccepted(config.termoCompromisso, data.versaoTermo);
    assertOnlyAsked(config.camposAdicionais, data);
    assertAskedPresent(config.camposAdicionais, data);
    const guardian = guardianOf(data.dataNascimento, data, todayInBrasilia());
    if (data.cpf !== undefined && !isValidCpf(data.cpf)) {
      throw invalid('INVALID_CPF', 'CPF inválido. Confira os números.');
    }
    const chave = config.campoDuplicidade === 'EMAIL' ? data.email! : data.cpf!;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const regras = await lockRegistration(tx, config.atividadeId);
        if (!regras) throw this.linkNotFound();
        const { inscricao, posicaoEspera } = await enroll(tx, {
          atividadeId: config.atividadeId,
          regras,
          chave,
          versaoAviso: DATA_NOTICE.versao,
          autorizaComunicados: data.autorizaComunicados,
          autorizaImagem: data.autorizaImagem,
          guardian,
          termo: config.termoCompromisso,
          participante: () =>
            tx.participante.create({
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
            }),
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
          posicaoEspera,
          atividade: publicActivity(config),
          inscritoEm: inscricao.criadoEm.toISOString(),
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw alreadyRegistered();
      }
      throw error;
    }
  }

  private async findConfig(codigo: string): Promise<ConfigWithActivity> {
    const config = await this.prisma.configuracaoInscricao.findUnique({
      where: { codigoPublico: codigo },
      include: WITH_ACTIVITY,
    });
    if (!config) throw this.linkNotFound();
    return config;
  }

  private linkNotFound(): NotFoundException {
    return new NotFoundException({
      code: 'REGISTRATION_LINK_NOT_FOUND',
      message: 'Link de inscrição inválido. Confira o endereço com o Instituto.',
    });
  }
}
