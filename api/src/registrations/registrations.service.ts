import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, CampoInscricao, SituacaoInscricao } from '../generated/prisma/enums.js';
import { deadlineOf, nowInBrasilia, withinDeadline } from './deadline.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DATA_NOTICE } from '../public-registrations/notice.js';
import { ageOn, birthDateProblem, isValidCpf } from '../public-registrations/participant-data.js';
import { lockRegistration, nextSituation, waitlistPosition } from './waitlist.js';
import {
  CAMPOS_MINIMOS,
  type AssistedRegistrationResponse,
  type CreateAssistedRegistrationDto,
  type OpenRegistrationDto,
  type RegistrationResponse,
  type UpdateRegistrationDto,
} from './registrations.dto.js';

type RegistrationRow = Prisma.ConfiguracaoInscricaoGetPayload<object>;

const FIELDS = [
  'aberta',
  'vagas',
  'camposAdicionais',
  'campoDuplicidade',
  'listaEspera',
  'promocaoAutomatica',
  'termoCompromisso',
  'apresentacao',
  'prazoInscricao',
  'prazoHora',
  'contatoWhatsapp',
] as const;
type Field = (typeof FIELDS)[number];

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function toDate(isoDay: string | null): Date | null {
  return isoDay ? new Date(`${isoDay}T00:00:00.000Z`) : null;
}

function hourOf(time: Date | null): string | null {
  return time ? time.toISOString().slice(11, 16) : null;
}

function toTime(hour: string | null): Date | null {
  return hour ? new Date(`1970-01-01T${hour}:00.000Z`) : null;
}

function toResponse(row: RegistrationRow): RegistrationResponse {
  return {
    atividadeId: row.atividadeId,
    versao: row.versao,
    aberta: row.aberta,
    vagas: row.vagas,
    camposMinimos: [...CAMPOS_MINIMOS],
    camposAdicionais: [...row.camposAdicionais].sort(),
    campoDuplicidade: row.campoDuplicidade,
    listaEspera: row.listaEspera,
    promocaoAutomatica: row.promocaoAutomatica,
    termoCompromisso: row.termoCompromisso,
    apresentacao: row.apresentacao,
    prazoInscricao: isoDate(row.prazoInscricao),
    prazoHora: hourOf(row.prazoHora),
    contatoWhatsapp: row.contatoWhatsapp,
    codigoPublico: row.codigoPublico,
    linkPublico: `/inscrever/${row.codigoPublico}`,
  };
}

function same(field: Field, left: RegistrationResponse, right: RegistrationResponse): boolean {
  return JSON.stringify(left[field]) === JSON.stringify(right[field]);
}

function assertKeyAsked(campos: readonly string[], chave: string): void {
  if (!campos.includes(chave)) {
    throw new BadRequestException({
      code: 'DUPLICATE_KEY_NOT_ASKED',
      message: 'O campo que identifica cadastro repetido precisa estar entre os campos pedidos.',
    });
  }
}

/**
 * O prazo vai de agora (Brasília) até a data da atividade, inclusive; a hora é opcional e só
 * existe junto da data.
 */
function assertDeadline(
  prazo: string | null,
  hora: string | null,
  atividadeData: Date,
  now: Date = new Date(),
): void {
  if (prazo === null) {
    if (hora !== null) {
      throw new BadRequestException({
        code: 'DEADLINE_INVALID',
        message: 'Informe a data do prazo antes da hora.',
      });
    }
    return;
  }
  if (isoDate(toDate(prazo)) !== prazo) {
    throw new BadRequestException({
      code: 'DEADLINE_INVALID',
      message: 'Confira a data do prazo; ela não existe no calendário.',
    });
  }
  const dataAtividade = isoDate(atividadeData)!;
  if (deadlineOf(prazo, hora) < nowInBrasilia(now) || prazo > dataAtividade) {
    throw new BadRequestException({
      code: 'DEADLINE_INVALID',
      message: `O prazo de inscrição precisa ir de agora até a data da atividade, ${dataAtividade.split('-').reverse().join('/')}.`,
    });
  }
}

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async get(atividadeId: string): Promise<RegistrationResponse> {
    const row = await this.prisma.configuracaoInscricao.findUnique({ where: { atividadeId } });
    if (!row) {
      await this.assertActivityExists(this.prisma, atividadeId);
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_OPENED',
        message: 'A inscrição desta atividade ainda não foi aberta.',
      });
    }
    return toResponse(row);
  }

  async open(
    atividadeId: string,
    data: OpenRegistrationDto,
    actor: Actor,
  ): Promise<RegistrationResponse> {
    assertKeyAsked(data.camposAdicionais, data.campoDuplicidade);
    return this.prisma.$transaction(async (tx) => {
      const atividade = await this.assertEditableActivity(tx, atividadeId);
      assertDeadline(data.prazoInscricao ?? null, data.prazoHora ?? null, atividade.data);
      const existing = await tx.configuracaoInscricao.count({ where: { atividadeId } });
      if (existing > 0) {
        throw new ConflictException({
          code: 'REGISTRATION_ALREADY_OPENED',
          message: 'A inscrição desta atividade já foi aberta; edite a configuração existente.',
        });
      }
      const row = await tx.configuracaoInscricao.create({
        data: {
          atividadeId,
          vagas: data.vagas,
          camposAdicionais: data.camposAdicionais,
          campoDuplicidade: data.campoDuplicidade,
          listaEspera: data.listaEspera ?? true,
          promocaoAutomatica: data.promocaoAutomatica ?? true,
          termoCompromisso: data.termoCompromisso ?? null,
          apresentacao: data.apresentacao ?? null,
          prazoInscricao: toDate(data.prazoInscricao ?? null),
          prazoHora: toTime(data.prazoHora ?? null),
          contatoWhatsapp: data.contatoWhatsapp ?? null,
          codigoPublico: randomBytes(12).toString('base64url'),
        },
      });
      const inscricao = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'REGISTRATION_OPENED',
          entidade: 'configuracao_inscricao',
          entidadeId: atividadeId,
          depois: Object.fromEntries(FIELDS.map((field) => [field, inscricao[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return inscricao;
    });
  }

  async update(
    atividadeId: string,
    { versao, ...changes }: UpdateRegistrationDto,
    actor: Actor,
  ): Promise<RegistrationResponse> {
    return this.prisma.$transaction(async (tx) => {
      const atividade = await this.assertEditableActivity(tx, atividadeId);
      const current = await tx.configuracaoInscricao.findUnique({ where: { atividadeId } });
      if (!current) {
        throw new NotFoundException({
          code: 'REGISTRATION_NOT_OPENED',
          message: 'A inscrição desta atividade ainda não foi aberta.',
        });
      }
      if (current.versao !== versao) throw this.versionConflict();

      const before = toResponse(current);
      const next: RegistrationResponse = {
        ...before,
        aberta: changes.aberta ?? before.aberta,
        vagas: changes.vagas ?? before.vagas,
        camposAdicionais: changes.camposAdicionais
          ? [...changes.camposAdicionais].sort()
          : before.camposAdicionais,
        campoDuplicidade: changes.campoDuplicidade ?? before.campoDuplicidade,
        listaEspera: changes.listaEspera ?? before.listaEspera,
        promocaoAutomatica: changes.promocaoAutomatica ?? before.promocaoAutomatica,
        termoCompromisso:
          changes.termoCompromisso === undefined
            ? before.termoCompromisso
            : changes.termoCompromisso,
        apresentacao:
          changes.apresentacao === undefined ? before.apresentacao : changes.apresentacao,
        prazoInscricao:
          changes.prazoInscricao === undefined ? before.prazoInscricao : changes.prazoInscricao,
        // Tirar a data tira também a hora, que só existe junto dela.
        prazoHora:
          changes.prazoHora !== undefined
            ? changes.prazoHora
            : changes.prazoInscricao === null
              ? null
              : before.prazoHora,
        contatoWhatsapp:
          changes.contatoWhatsapp === undefined ? before.contatoWhatsapp : changes.contatoWhatsapp,
      };
      assertKeyAsked(next.camposAdicionais, next.campoDuplicidade);
      const prazoMudou =
        next.prazoInscricao !== before.prazoInscricao || next.prazoHora !== before.prazoHora;
      if (
        changes.aberta === true &&
        !withinDeadline(before.prazoInscricao, before.prazoHora) &&
        (!prazoMudou || next.prazoInscricao === null)
      ) {
        throw new UnprocessableEntityException({
          code: 'DEADLINE_PASSED',
          message: 'O prazo de inscrição já terminou. Informe um prazo novo para reabrir.',
        });
      }
      if (prazoMudou) {
        assertDeadline(next.prazoInscricao, next.prazoHora, atividade.data);
      }
      const changed = FIELDS.filter((field) => !same(field, before, next));
      if (changed.length === 0) return before;

      const updated = await tx.configuracaoInscricao.updateMany({
        where: { atividadeId, versao },
        data: {
          aberta: next.aberta,
          vagas: next.vagas,
          camposAdicionais: next.camposAdicionais,
          campoDuplicidade: next.campoDuplicidade,
          listaEspera: next.listaEspera,
          promocaoAutomatica: next.promocaoAutomatica,
          termoCompromisso: next.termoCompromisso,
          apresentacao: next.apresentacao,
          prazoInscricao: toDate(next.prazoInscricao),
          prazoHora: toTime(next.prazoHora),
          contatoWhatsapp: next.contatoWhatsapp,
          versao: { increment: 1 },
        },
      });
      if (updated.count === 0) throw this.versionConflict();

      const inscricao = toResponse(
        await tx.configuracaoInscricao.findUniqueOrThrow({ where: { atividadeId } }),
      );
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao:
            changed.length === 1 && changed[0] === 'aberta'
              ? inscricao.aberta
                ? 'REGISTRATION_REOPENED'
                : 'REGISTRATION_CLOSED'
              : 'REGISTRATION_UPDATED',
          entidade: 'configuracao_inscricao',
          entidadeId: atividadeId,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, inscricao[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      // Ligar a promoção também confirma a espera nas vagas que estiverem livres; a trilha
      // registra a alteração antes das promoções que ela causou.
      if (
        next.promocaoAutomatica &&
        (changed.includes('vagas') || changed.includes('promocaoAutomatica'))
      ) {
        await promoteWaitlist(tx, this.audit, atividadeId, next.vagas, actor);
      }
      return inscricao;
    });
  }

  private async assertActivityExists(
    client: Prisma.TransactionClient | PrismaService,
    atividadeId: string,
  ): Promise<void> {
    const count = await client.atividade.count({ where: { id: atividadeId } });
    if (count === 0) throw new NotFoundException('Atividade não encontrada.');
  }

  private async assertEditableActivity(
    tx: Prisma.TransactionClient,
    atividadeId: string,
  ): Promise<{ data: Date }> {
    const atividade = await tx.atividade.findUnique({
      where: { id: atividadeId },
      select: { data: true, projeto: { select: { instrumento: { select: { ativo: true } } } } },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada.');
    if (!atividade.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está inativo e não abre nem altera inscrições.',
      });
    }
    return { data: atividade.data };
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A inscrição foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }

  /** Inscrição presencial assistida pelo Núcleo (CA-08.1 a CA-08.5, RF13, RF14, RF15, RF22). */
  async createAssisted(
    atividadeId: string,
    data: CreateAssistedRegistrationDto,
    actor: Actor,
  ): Promise<AssistedRegistrationResponse> {
    const config = await this.prisma.configuracaoInscricao.findUnique({
      where: { atividadeId },
      include: {
        atividade: {
          select: {
            projeto: { select: { instrumento: { select: { ativo: true } } } },
          },
        },
      },
    });

    if (!config) {
      await this.assertActivityExists(this.prisma, atividadeId);
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_OPENED',
        message: 'A inscrição desta atividade ainda não foi aberta.',
      });
    }

    if (!config.aberta || !config.atividade.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'REGISTRATION_CLOSED',
        message: 'As inscrições desta atividade estão encerradas.',
      });
    }

    // Regra de encerramento por prazo
    const prazo = deadlineOf(config.prazoInscricao, config.prazoHora);
    if (!withinDeadline(prazo, nowInBrasilia())) {
      throw new ConflictException({
        code: 'REGISTRATION_CLOSED',
        message: 'O prazo de inscrição desta atividade terminou.',
      });
    }

    if (data.versaoAviso !== DATA_NOTICE.versao) {
      throw new BadRequestException({
        code: 'NOTICE_OUTDATED',
        message: 'O aviso de tratamento de dados mudou. Leia o aviso atual e envie de novo.',
      });
    }

    const today = todayInBrasilia();

    return this.prisma.$transaction(async (tx) => {
      const regras = await lockRegistration(tx, atividadeId);

      let participanteId: string;
      let participanteNome: string;
      let chave: string;

      if (data.reaproveitarParticipanteId) {
        const existente = await tx.participante.findUnique({
          where: { id: data.reaproveitarParticipanteId },
        });
        if (!existente) {
          throw new NotFoundException({
            code: 'PARTICIPANT_NOT_FOUND',
            message: 'Participante para reaproveitamento não encontrado.',
          });
        }

        const chaveExtraida = config.campoDuplicidade === 'EMAIL' ? existente.email : existente.cpf;
        if (!chaveExtraida) {
          throw new BadRequestException({
            code: 'DUPLICATE_KEY_MISSING',
            message: 'O cadastro existente não possui o dado identificador desta atividade.',
          });
        }
        chave = chaveExtraida;

        // Validação se o participante reaproveitado supre os campos da atividade
        const FIELD_OF: Record<CampoInscricao, keyof typeof existente> = {
          EMAIL: 'email',
          CPF: 'cpf',
          BAIRRO_REGIAO: 'bairroRegiao',
          ESCOLARIDADE: 'escolaridade',
        };
        for (const campo of config.camposAdicionais) {
          const prop = FIELD_OF[campo];
          if (!existente[prop] && !data[prop as keyof CreateAssistedRegistrationDto]) {
            throw new BadRequestException({
              code: 'MISSING_FIELDS',
              message: `O cadastro reaproveitado não possui o campo ${campo}, obrigatório nesta atividade.`,
            });
          }
        }

        const birthDateStr = existente.dataNascimento.toISOString().slice(0, 10);
        if (ageOn(birthDateStr, today) < 18) {
          if (!data.responsavelNome || !data.responsavelTelefone) {
            throw new BadRequestException({
              code: 'GUARDIAN_REQUIRED',
              message: 'Para menores de 18 anos, informe o nome e o telefone do responsável legal.',
            });
          }
        }

        participanteId = existente.id;
        participanteNome = existente.nome;
      } else {
        if (!data.nome || !data.telefone || !data.dataNascimento) {
          throw new BadRequestException({
            code: 'MISSING_FIELDS',
            message: 'Nome, telefone e data de nascimento são obrigatórios.',
          });
        }

        const birthProblem = birthDateProblem(data.dataNascimento, today);
        if (birthProblem) {
          throw new BadRequestException({
            code: 'INVALID_BIRTH_DATE',
            message: birthProblem,
          });
        }

        if (ageOn(data.dataNascimento, today) < 18) {
          if (!data.responsavelNome || !data.responsavelTelefone) {
            throw new BadRequestException({
              code: 'GUARDIAN_REQUIRED',
              message: 'Para menores de 18 anos, informe o nome e o telefone do responsável legal.',
            });
          }
        }

        if (config.camposAdicionais.includes(CampoInscricao.EMAIL) && !data.email) {
          throw new BadRequestException({
            code: 'MISSING_FIELDS',
            message: 'O campo e-mail é obrigatório nesta atividade.',
          });
        }

        if (config.camposAdicionais.includes(CampoInscricao.CPF)) {
          if (!data.cpf) {
            throw new BadRequestException({
              code: 'MISSING_FIELDS',
              message: 'O campo CPF é obrigatório nesta atividade.',
            });
          }
          if (!isValidCpf(data.cpf)) {
            throw new BadRequestException({
              code: 'INVALID_CPF',
              message: 'CPF inválido. Confira os números.',
            });
          }
        }

        chave = config.campoDuplicidade === 'EMAIL' ? data.email! : data.cpf!;

        const novo = await tx.participante.create({
          data: {
            nome: data.nome,
            telefone: data.telefone,
            dataNascimento: new Date(`${data.dataNascimento}T00:00:00.000Z`),
            email: data.email ?? null,
            cpf: data.cpf ?? null,
            bairroRegiao: data.bairroRegiao ?? null,
            escolaridade: data.escolaridade ?? null,
          },
        });
        participanteId = novo.id;
        participanteNome = novo.nome;
      }

      const repeated = await tx.inscricao.count({
        where: { atividadeId, chaveDuplicidade: chave },
      });
      if (repeated > 0) {
        throw new ConflictException({
          code: 'ALREADY_REGISTERED',
          message: 'Já existe uma inscrição com estes dados nesta atividade.',
        });
      }

      const situacao = await nextSituation(tx, atividadeId, regras.vagas);
      if (situacao === SituacaoInscricao.LISTA_ESPERA && !regras.listaEspera) {
        throw new ConflictException({
          code: 'REGISTRATION_CLOSED',
          message: 'As vagas desta atividade foram preenchidas.',
        });
      }

      const inscricao = await tx.inscricao.create({
        data: {
          atividadeId,
          participanteId,
          criadoPorId: actor.usuarioId,
          situacao,
          chaveDuplicidade: chave,
          versaoAviso: data.versaoAviso,
          avisoApresentadoEm: new Date(),
          autorizaComunicados: data.autorizaComunicados,
          autorizaImagem: data.autorizaImagem,
          responsavelNome: data.responsavelNome ?? null,
          responsavelTelefone: data.responsavelTelefone ?? null,
          termoAceito: config.termoCompromisso ? config.termoCompromisso : null,
          termoAceitoEm: config.termoCompromisso ? new Date() : null,
        },
      });

      const posicaoEspera =
        situacao === SituacaoInscricao.LISTA_ESPERA
          ? await waitlistPosition(tx, atividadeId, inscricao.ordemChegada)
          : null;

      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ASSISTED_REGISTRATION_CREATED',
          entidade: 'inscricao',
          entidadeId: inscricao.id,
          depois: {
            atividadeId,
            situacao: inscricao.situacao,
            ...(posicaoEspera !== null ? { posicaoEspera } : {}),
            reaproveitou: Boolean(data.reaproveitarParticipanteId),
          },
          correlationId: actor.correlationId,
        },
        tx,
      );

      return {
        id: inscricao.id,
        situacao: inscricao.situacao,
        posicaoEspera,
        reaproveitouParticipante: Boolean(data.reaproveitarParticipanteId),
        participante: {
          id: participanteId,
          nome: participanteNome,
        },
        inscritoEm: inscricao.criadoEm.toISOString(),
      };
    });
  }
}
