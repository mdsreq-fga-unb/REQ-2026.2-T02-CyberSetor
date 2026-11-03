import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DATA_NOTICE } from '../public-registrations/notice.js';
import { isValidCpf } from '../public-registrations/participant-data.js';
import { storedWithinDeadline } from './deadline.js';
import {
  alreadyRegistered,
  assertAskedPresent,
  assertOnlyAsked,
  assertTermAccepted,
  enroll,
  type AskedFields,
  FIELD_OF,
  guardianOf,
  invalid,
} from './enrollment.js';
import type {
  AssistedRegistrationResponse,
  CreateAssistedRegistrationDto,
} from './registrations.dto.js';
import { lockRegistration } from './waitlist.js';

const CONFIG_WITH_INSTRUMENT = {
  atividade: { select: { projeto: { select: { instrumento: { select: { ativo: true } } } } } },
} as const;

/**
 * Inscrição presencial registrada pelo Núcleo Pedagógico (HU-08, CA-08.1 a CA-08.5): as mesmas
 * regras do formulário público, pela `enrollment.ts`, com o autor gravado na inscrição e na trilha.
 */
@Injectable()
export class AssistedRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async create(
    atividadeId: string,
    data: CreateAssistedRegistrationDto,
    actor: Actor,
  ): Promise<AssistedRegistrationResponse> {
    const config = await this.prisma.configuracaoInscricao.findUnique({
      where: { atividadeId },
      include: CONFIG_WITH_INSTRUMENT,
    });
    if (!config) {
      const count = await this.prisma.atividade.count({ where: { id: atividadeId } });
      if (count === 0) throw new NotFoundException('Atividade não encontrada.');
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_OPENED',
        message: 'A inscrição desta atividade ainda não foi aberta.',
      });
    }
    if (
      !config.aberta ||
      !config.atividade.projeto.instrumento.ativo ||
      !storedWithinDeadline(config.prazoInscricao, config.prazoHora)
    ) {
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
    if (data.cpf !== undefined && !isValidCpf(data.cpf)) {
      throw invalid('INVALID_CPF', 'CPF inválido. Confira os números.');
    }
    const today = todayInBrasilia();
    const reused = data.reaproveitarParticipanteId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const regras = await lockRegistration(tx, atividadeId);
        if (!regras) throw new NotFoundException('Atividade não encontrada.');

        let person: {
          nome: string;
          dataNascimento: string;
          values: AskedFields;
        };
        let existing: { id: string; nome: string } | null = null;
        if (reused) {
          const row = await tx.participante.findUnique({ where: { id: reused } });
          if (!row) {
            throw new NotFoundException({
              code: 'PARTICIPANT_NOT_FOUND',
              message: 'O cadastro escolhido para reaproveitar não existe mais. Busque de novo.',
            });
          }
          existing = { id: row.id, nome: row.nome };
          // O envio só completa o que o cadastro não tem; o que já existe não é trocado aqui.
          person = {
            nome: row.nome,
            dataNascimento: row.dataNascimento.toISOString().slice(0, 10),
            values: {
              email: row.email ?? data.email,
              cpf: row.cpf ?? data.cpf,
              bairroRegiao: row.bairroRegiao ?? data.bairroRegiao,
              escolaridade: row.escolaridade ?? data.escolaridade,
            },
          };
        } else {
          if (!data.nome || !data.telefone || !data.dataNascimento) {
            throw invalid('MISSING_FIELDS', 'Informe nome, telefone e data de nascimento.', {
              campos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO'],
            });
          }
          person = { nome: data.nome, dataNascimento: data.dataNascimento, values: data };
        }
        assertAskedPresent(config.camposAdicionais, person.values);
        const guardian = guardianOf(person.dataNascimento, data, today);
        const chave = person.values[FIELD_OF[config.campoDuplicidade]]!;

        const { inscricao, participanteId, posicaoEspera } = await enroll(tx, {
          atividadeId,
          regras,
          chave,
          versaoAviso: data.versaoAviso,
          autorizaComunicados: data.autorizaComunicados,
          autorizaImagem: data.autorizaImagem,
          guardian,
          termo: config.termoCompromisso,
          criadoPorId: actor.usuarioId,
          participante: async () => {
            if (existing) {
              const missing = Object.fromEntries(
                config.camposAdicionais
                  .map((campo) => FIELD_OF[campo])
                  .map((campo) => [campo, person.values[campo]]),
              );
              await tx.participante.update({ where: { id: existing.id }, data: missing });
              return existing;
            }
            return tx.participante.create({
              data: {
                nome: person.nome,
                nomePreferencia: data.nomePreferencia ?? null,
                telefone: data.telefone!,
                dataNascimento: new Date(`${person.dataNascimento}T00:00:00.000Z`),
                email: data.email ?? null,
                cpf: data.cpf ?? null,
                bairroRegiao: data.bairroRegiao ?? null,
                escolaridade: data.escolaridade ?? null,
              },
            });
          },
        });
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
              reaproveitouCadastro: Boolean(existing),
            },
            correlationId: actor.correlationId,
          },
          tx,
        );
        return {
          id: inscricao.id,
          situacao: inscricao.situacao,
          posicaoEspera,
          reaproveitouParticipante: Boolean(existing),
          participante: { id: participanteId, nome: person.nome },
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
}
