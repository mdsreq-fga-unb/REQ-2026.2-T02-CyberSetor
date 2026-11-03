import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, CampoInscricao, SituacaoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { participantSearch } from './participant-search.js';
import {
  ageOn,
  birthDateProblem,
  isValidCpf,
  onlyDigits,
} from '../public-registrations/participant-data.js';
import type {
  CheckDuplicateDto,
  CorrectParticipantDto,
  DuplicateCheckResponse,
  ParticipantResponse,
  ParticipantSummaryResponse,
  RevokeAuthorizationDto,
} from './participants.dto.js';

const ADULT_AGE = 18;
const LIST_LIMIT = 200;

const FIELDS = [
  'nome',
  'nomePreferencia',
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
    nomePreferencia: row.nomePreferencia,
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
    nomePreferencia: row.nomePreferencia,
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
      termoAceitoEm: inscricao.termoAceitoEm,
      comunicadosRevogacao:
        inscricao.comunicadosRevogadosEm && inscricao.comunicadosRevogacaoCanal
          ? {
              pedidoEm: isoDate(inscricao.comunicadosRevogadosEm),
              canal: inscricao.comunicadosRevogacaoCanal,
            }
          : null,
      imagemRevogacao:
        inscricao.imagemRevogadaEm && inscricao.imagemRevogacaoCanal
          ? { pedidoEm: isoDate(inscricao.imagemRevogadaEm), canal: inscricao.imagemRevogacaoCanal }
          : null,
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

/** Final do telefone, para a pessoa confirmar que é o dela. */
function maskPhone(telefone: string): string {
  return `(**) *****-${telefone.slice(-4)}`;
}

function maskEmail(email: string): string {
  const [user = '', domain = ''] = email.split('@');
  return user.length <= 2 ? `***@${domain}` : `${user[0]}***${user.slice(-1)}@${domain}`;
}

function maskCpf(cpf: string): string {
  return `***.***.${cpf.slice(6, 9)}-**`;
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
    const where = participantSearch(busca) ?? {};
    const today = todayInBrasilia();
    const rows = await this.prisma.participante.findMany({
      where,
      orderBy: [{ nome: 'asc' }, { criadoEm: 'asc' }],
      // Um a mais que o limite avisa a tela de que a lista foi cortada.
      take: LIST_LIMIT + 1,
      include: {
        // Inscrições com vaga confirmada, como na atividade e no painel (RF14).
        _count: { select: { inscricoes: { where: { situacao: SituacaoInscricao.CONFIRMADA } } } },
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
        nomePreferencia: row.nomePreferencia,
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

  /**
   * Cadastro já existente pelo CPF ou pelo e-mail, para a inscrição presencial (CA-08.3, RF22): só
   * o nome e os contatos mascarados, para a confirmação verbal (RNF05, minimização).
   */
  async checkDuplicate(dto: CheckDuplicateDto): Promise<DuplicateCheckResponse> {
    const cpf = dto.cpf ? onlyDigits(dto.cpf) : undefined;
    const email = dto.email || undefined;
    // A mesma pessoa pode ter mais de um cadastro (um por inscrição pública): vale o mais recente.
    const latest = (where: Prisma.ParticipanteWhereInput) =>
      this.prisma.participante.findFirst({ where, orderBy: { criadoEm: 'desc' } });
    const [porCpf, porEmail] = await Promise.all([
      cpf ? latest({ cpf }) : null,
      email ? latest({ email }) : null,
    ]);
    if (porCpf && porEmail && porCpf.id !== porEmail.id) {
      throw new ConflictException({
        code: 'AMBIGUOUS_DUPLICATE_KEY',
        message: 'O CPF e o e-mail informados pertencem a cadastros diferentes.',
      });
    }
    const row = porCpf ?? porEmail;
    if (!row) return { existe: false, participante: null };
    return {
      existe: true,
      participante: {
        id: row.id,
        nome: row.nome,
        telefoneMascarado: maskPhone(row.telefone),
        emailMascarado: row.email ? maskEmail(row.email) : null,
        cpfMascarado: row.cpf ? maskCpf(row.cpf) : null,
        camposDisponiveis: (['email', 'cpf', 'bairroRegiao', 'escolaridade'] as const).filter(
          (campo) => row[campo] !== null,
        ),
      },
    };
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
        // A inscrição cancelada não tem chave e continua sem ela.
        for (const inscricao of current.inscricoes) {
          const field =
            inscricao.chaveDuplicidade === null
              ? null
              : inscricao.chaveDuplicidade === before.email
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

  /**
   * Revogação de autorização a pedido do titular (CA-07a.6): guarda a data do pedido e o canal,
   * mantém a autorização dada no envio como registro e não mexe na inscrição.
   */
  async revoke(
    id: string,
    inscricaoId: string,
    dto: RevokeAuthorizationDto,
    actor: Actor,
  ): Promise<ParticipantResponse> {
    const today = todayInBrasilia();
    const pedidoEm = new Date(`${dto.pedidoEm}T00:00:00.000Z`);
    const exists =
      !Number.isNaN(pedidoEm.getTime()) && pedidoEm.toISOString().slice(0, 10) === dto.pedidoEm;
    if (!exists || dto.pedidoEm > today) {
      throw invalid('INVALID_REQUEST_DATE', 'Confira a data do pedido; ela não pode ser futura.');
    }
    const comunicados = dto.autorizacao === 'COMUNICADOS';
    return this.prisma.$transaction(async (tx) => {
      const inscricao = await tx.inscricao.findFirst({
        where: { id: inscricaoId, participanteId: id },
      });
      if (!inscricao)
        throw new NotFoundException('Inscrição não encontrada para este participante.');
      const given = comunicados ? inscricao.autorizaComunicados : inscricao.autorizaImagem;
      if (!given) {
        throw new ConflictException({
          code: 'AUTHORIZATION_NOT_GIVEN',
          message: 'Esta autorização não foi dada na inscrição; não há o que revogar.',
        });
      }
      const updated = await tx.inscricao.updateMany({
        where: comunicados
          ? { id: inscricaoId, comunicadosRevogadosEm: null }
          : { id: inscricaoId, imagemRevogadaEm: null },
        data: comunicados
          ? { comunicadosRevogadosEm: pedidoEm, comunicadosRevogacaoCanal: dto.canal }
          : { imagemRevogadaEm: pedidoEm, imagemRevogacaoCanal: dto.canal },
      });
      if (updated.count === 0) {
        throw new ConflictException({
          code: 'ALREADY_REVOKED',
          message: 'Esta autorização já foi revogada.',
        });
      }
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'AUTHORIZATION_REVOKED',
          entidade: 'inscricao',
          entidadeId: inscricaoId,
          depois: { autorizacao: dto.autorizacao, canal: dto.canal, pedidoEm: dto.pedidoEm },
          correlationId: actor.correlationId,
        },
        tx,
      );
      const row = await tx.participante.findUniqueOrThrow({
        where: { id },
        include: WITH_REGISTRATIONS,
      });
      return toResponse(row, today);
    });
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
