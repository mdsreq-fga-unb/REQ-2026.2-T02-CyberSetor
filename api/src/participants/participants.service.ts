import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, CampoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ageOn,
  birthDateProblem,
  isValidCpf,
  onlyDigits,
} from '../public-registrations/participant-data.js';
import type {
  CorrectParticipantDto,
  ParticipantResponse,
  ParticipantSummaryResponse,
} from './participants.dto.js';

const ADULT_AGE = 18;
const LIST_LIMIT = 200;
const MIN_PHONE_SEARCH = 3;

const FIELDS = [
  'nome',
  'telefone',
  'dataNascimento',
  'email',
  'cpf',
  'bairroRegiao',
  'escolaridade',
] as const;
type Field = (typeof FIELDS)[number];
type Values = Record<Field, string | null>;

/** Campo da lista fechada do formulário ↔ propriedade do participante. */
const FIELD_OF: Record<CampoInscricao, Field> = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
};

const WITH_REGISTRATIONS = {
  inscricoes: {
    orderBy: { criadoEm: 'desc' },
    include: {
      atividade: {
        select: {
          id: true,
          titulo: true,
          data: true,
          projetoId: true,
          projeto: { select: { instrumentoId: true } },
          inscricao: { select: { camposAdicionais: true, campoDuplicidade: true } },
        },
      },
    },
  },
} satisfies Prisma.ParticipanteInclude;

type ParticipantRow = Prisma.ParticipanteGetPayload<{ include: typeof WITH_REGISTRATIONS }>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function valuesOf(row: ParticipantRow): Values {
  return {
    nome: row.nome,
    telefone: row.telefone,
    dataNascimento: isoDate(row.dataNascimento),
    email: row.email,
    cpf: row.cpf,
    bairroRegiao: row.bairroRegiao,
    escolaridade: row.escolaridade,
  };
}

function toResponse(row: ParticipantRow, today: string): ParticipantResponse {
  const values = valuesOf(row);
  return {
    id: row.id,
    versao: row.versao,
    nome: row.nome,
    telefone: row.telefone,
    dataNascimento: values.dataNascimento!,
    idade: ageOn(values.dataNascimento!, today),
    email: row.email,
    cpf: row.cpf,
    bairroRegiao: row.bairroRegiao,
    escolaridade: row.escolaridade,
    inscricoes: row.inscricoes.map((inscricao) => ({
      id: inscricao.id,
      situacao: inscricao.situacao,
      inscritoEm: inscricao.criadoEm,
      autorizaComunicados: inscricao.autorizaComunicados,
      autorizaImagem: inscricao.autorizaImagem,
      responsavelNome: inscricao.responsavelNome,
      responsavelTelefone: inscricao.responsavelTelefone,
      atividade: {
        id: inscricao.atividade.id,
        titulo: inscricao.atividade.titulo,
        data: isoDate(inscricao.atividade.data),
      },
      projetoId: inscricao.atividade.projetoId,
      instrumentoId: inscricao.atividade.projeto.instrumentoId,
    })),
  };
}

function invalid(code: string, message: string, details: object = {}): BadRequestException {
  return new BadRequestException({ code, message, details });
}

/**
 * Participantes inscritos pelo formulário público, para o Núcleo Pedagógico: busca, ficha com
 * as inscrições e correção a pedido do titular (HU-15a, RF26). A trilha guarda quem corrigiu,
 * quando, a justificativa e os nomes dos campos, nunca os valores (RNF02, RNF05).
 */
@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(busca?: string): Promise<ParticipantSummaryResponse[]> {
    const text = busca?.trim() ?? '';
    const digits = onlyDigits(text);
    // % e _ são curingas do ILIKE: a busca procura o texto como foi digitado.
    const literal = text.replace(/[\\%_]/g, (char) => `\\${char}`);
    const where: Prisma.ParticipanteWhereInput = text
      ? {
          OR: [
            { nome: { contains: literal, mode: 'insensitive' } },
            { email: { contains: literal.toLowerCase() } },
            ...(digits.length >= MIN_PHONE_SEARCH ? [{ telefone: { contains: digits } }] : []),
          ],
        }
      : {};
    const today = todayInBrasilia();
    const rows = await this.prisma.participante.findMany({
      where,
      orderBy: [{ nome: 'asc' }, { criadoEm: 'asc' }],
      // Um a mais que o limite avisa a tela de que a lista foi cortada.
      take: LIST_LIMIT + 1,
      include: {
        _count: { select: { inscricoes: true } },
        inscricoes: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
          select: { atividade: { select: { id: true, titulo: true, data: true } } },
        },
      },
    });
    return rows.map((row) => {
      const ultima = row.inscricoes[0]?.atividade;
      return {
        id: row.id,
        versao: row.versao,
        nome: row.nome,
        idade: ageOn(isoDate(row.dataNascimento), today),
        telefone: row.telefone,
        email: row.email,
        inscricoes: row._count.inscricoes,
        ultimaAtividade: ultima
          ? { id: ultima.id, titulo: ultima.titulo, data: isoDate(ultima.data) }
          : null,
      };
    });
  }

  async get(id: string): Promise<ParticipantResponse> {
    const row = await this.prisma.participante.findUnique({
      where: { id },
      include: WITH_REGISTRATIONS,
    });
    if (!row) throw new NotFoundException('Participante não encontrado.');
    return toResponse(row, todayInBrasilia());
  }

  async correct(
    id: string,
    dto: CorrectParticipantDto,
    actor: Actor,
  ): Promise<ParticipantResponse> {
    const today = todayInBrasilia();
    return this.withKeyConflict(() =>
      this.prisma.$transaction(async (tx) => {
        const current = await tx.participante.findUnique({
          where: { id },
          include: WITH_REGISTRATIONS,
        });
        if (!current) throw new NotFoundException('Participante não encontrado.');
        if (current.versao !== dto.versao) throw this.versionConflict();

        const before = valuesOf(current);
        const next: Values = { ...before };
        for (const field of FIELDS) {
          if (dto[field] !== undefined) next[field] = dto[field];
        }
        const changed = FIELDS.filter((field) => next[field] !== before[field]);
        if (changed.length === 0) return toResponse(current, today);

        this.assertValid(current, next, changed, today);

        const updated = await tx.participante.updateMany({
          where: { id, versao: dto.versao },
          data: {
            ...Object.fromEntries(
              changed.map((field) => [
                field,
                field === 'dataNascimento' ? new Date(`${next[field]}T00:00:00.000Z`) : next[field],
              ]),
            ),
            versao: { increment: 1 },
          },
        });
        if (updated.count === 0) throw this.versionConflict();

        // A chave de cadastro repetido da inscrição guarda o e-mail ou o CPF: acompanha a correção.
        // A chave guardada diz qual dado ela copiou, mesmo que a configuração tenha mudado depois.
        // Dado apagado a pedido do titular não fica na chave: ela passa a ser um marcador da inscrição.
        for (const inscricao of current.inscricoes) {
          const field =
            inscricao.chaveDuplicidade === before.email
              ? 'email'
              : inscricao.chaveDuplicidade === before.cpf
                ? 'cpf'
                : null;
          if (field && changed.includes(field)) {
            await tx.inscricao.update({
              where: { id: inscricao.id },
              data: { chaveDuplicidade: next[field] ?? `apagado:${inscricao.id}` },
            });
          }
        }

        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'PARTICIPANT_CORRECTED',
            entidade: 'participante',
            entidadeId: id,
            depois: { campos: changed, justificativa: dto.justificativa },
            correlationId: actor.correlationId,
          },
          tx,
        );
        const row = await tx.participante.findUniqueOrThrow({
          where: { id },
          include: WITH_REGISTRATIONS,
        });
        return toResponse(row, today);
      }),
    );
  }

  private assertValid(
    current: ParticipantRow,
    next: Values,
    changed: Field[],
    today: string,
  ): void {
    if (changed.includes('cpf') && next.cpf !== null && !isValidCpf(next.cpf)) {
      throw invalid('INVALID_CPF', 'CPF inválido. Confira os números.');
    }
    if (changed.includes('dataNascimento')) {
      const problem = birthDateProblem(next.dataNascimento!, today);
      if (problem) throw invalid('INVALID_BIRTH_DATE', problem);
      const minor = ageOn(next.dataNascimento!, today) < ADULT_AGE;
      if (minor && current.inscricoes.some((inscricao) => !inscricao.responsavelNome)) {
        throw invalid(
          'GUARDIAN_REQUIRED',
          'Com esta data a pessoa é menor de idade, e há inscrição sem responsável legal. Confira a data com o titular.',
        );
      }
    }
    // Campo que o formulário de alguma inscrição pede não pode ficar vazio.
    const required = new Set(
      current.inscricoes.flatMap((inscricao) =>
        (inscricao.atividade.inscricao?.camposAdicionais ?? []).map((campo) => FIELD_OF[campo]),
      ),
    );
    const emptied = changed.filter((field) => next[field] === null && required.has(field));
    if (emptied.length > 0) {
      throw invalid(
        'FIELD_REQUIRED_BY_FORM',
        'O formulário de uma das inscrições pede este dado; ele não pode ficar vazio.',
        { campos: emptied },
      );
    }
  }

  private async withKeyConflict<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          code: 'REGISTRATION_KEY_TAKEN',
          message: 'Outra inscrição na mesma atividade já usa este e-mail ou CPF.',
        });
      }
      throw error;
    }
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'Os dados foram alterados por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
