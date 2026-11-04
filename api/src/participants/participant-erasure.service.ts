import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, SituacaoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { cancelRegistration } from '../registrations/waitlist.js';
import type { ErasurePlanResponse, EraseParticipantDto } from './participants.dto.js';

/** Nome que fica no lugar do nome da pessoa anonimizada. */
export const ANONYMIZED_NAME = 'Participante anonimizado';

const WITH_ACTIVITIES = {
  inscricoes: {
    select: {
      id: true,
      situacao: true,
      atividadeId: true,
      criadoEm: true,
      atividade: { select: { data: true } },
    },
  },
} satisfies Prisma.ParticipanteInclude;

type ParticipantRow = Prisma.ParticipanteGetPayload<{ include: typeof WITH_ACTIVITIES }>;

/**
 * Classes de dado e o que acontece com cada uma (RN-07): o fundamento vai no texto, para a tela
 * mostrar antes de confirmar (CA-15b.4) e a trilha guardar junto do pedido (CA-15b.2).
 */
const CLASSES = {
  identificacao:
    'Identificação e contato: nome, nome de preferência, telefone, e-mail, CPF, bairro e escolaridade (LGPD, art. 16 e 18)',
  responsavel: 'Nome e telefone do responsável legal (LGPD, art. 18)',
  autorizacoes: 'Autorizações de comunicados e de uso de imagem e voz (LGPD, art. 8º, § 5º)',
  nascimento: 'Data de nascimento, reduzida ao ano para a faixa etária dos totais (RN-07)',
  inscricoes:
    'Inscrições em atividades realizadas: atividade, situação e datas, sem dado pessoal, porque compõem vagas, inscritos e relatórios (RN-07; Lei 13.019/2014, art. 68)',
  futuras: 'Inscrições em atividades futuras, canceladas na data do pedido',
  trilha: 'Trilha de auditoria, que guarda os nomes dos campos e não os valores (RNF02, RNF05)',
} as const;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Exclusão ou anonimização dos dados de uma pessoa (HU-15b, RF27, RN-07). */
@Injectable()
export class ParticipantErasureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  /** O que o pedido vai fazer, sem gravar nada (CA-15b.4). */
  async plan(id: string): Promise<ErasurePlanResponse> {
    const row = await this.prisma.participante.findUnique({
      where: { id },
      include: WITH_ACTIVITIES,
    });
    if (!row) throw new NotFoundException('Participante não encontrado.');
    this.assertNotAnonymized(row);
    return planOf(row, todayInBrasilia());
  }

  async erase(id: string, dto: EraseParticipantDto, actor: Actor): Promise<ErasurePlanResponse> {
    const today = todayInBrasilia();
    if (!validDate(dto.pedidoEm) || dto.pedidoEm > today) {
      throw new BadRequestException({
        code: 'INVALID_REQUEST_DATE',
        message: 'Confira a data do pedido; ela não pode ser futura.',
      });
    }
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.participante.findUnique({ where: { id }, include: WITH_ACTIVITIES });
      if (!row) throw new NotFoundException('Participante não encontrado.');
      this.assertNotAnonymized(row);
      if (row.versao !== dto.versao) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'O cadastro foi alterado por outra pessoa. Recarregue e confira antes de pedir.',
        });
      }
      const plan = planOf(row, today);
      const pedidoEm = new Date(`${dto.pedidoEm}T00:00:00.000Z`);

      // Inscrição futura e ativa: cancelada como um pedido de desistência, liberando a vaga.
      for (const inscricao of row.inscricoes) {
        if (isoDate(inscricao.atividade.data) < today) continue;
        if (inscricao.situacao === SituacaoInscricao.CANCELADA) continue;
        // Inscrição feita depois do pedido conta a partir do dia em que foi feita.
        const inscritoEm = todayInBrasilia(inscricao.criadoEm);
        await cancelRegistration(
          tx,
          this.audit,
          inscricao.atividadeId,
          inscricao.id,
          { canal: dto.canal, pedidoEm: dto.pedidoEm < inscritoEm ? inscritoEm : dto.pedidoEm },
          actor,
        );
      }

      if (plan.acao === 'EXCLUIR') {
        await tx.inscricao.deleteMany({ where: { participanteId: id } });
        await tx.participante.delete({ where: { id } });
      } else {
        await tx.inscricao.updateMany({
          where: { participanteId: id },
          data: { responsavelNome: null, responsavelTelefone: null, chaveDuplicidade: null },
        });
        await tx.inscricao.updateMany({
          where: { participanteId: id, autorizaComunicados: true, comunicadosRevogadosEm: null },
          data: { comunicadosRevogadosEm: pedidoEm, comunicadosRevogacaoCanal: dto.canal },
        });
        await tx.inscricao.updateMany({
          where: { participanteId: id, autorizaImagem: true, imagemRevogadaEm: null },
          data: { imagemRevogadaEm: pedidoEm, imagemRevogacaoCanal: dto.canal },
        });
        await tx.participante.update({
          where: { id },
          data: {
            nome: ANONYMIZED_NAME,
            nomePreferencia: null,
            telefone: '',
            email: null,
            cpf: null,
            bairroRegiao: null,
            escolaridade: null,
            dataNascimento: new Date(`${row.dataNascimento.getUTCFullYear()}-01-01T00:00:00.000Z`),
            anonimizadoEm: new Date(),
            versao: { increment: 1 },
          },
        });
      }

      // A trilha guarda o pedido e o que foi feito por classe, sem valor pessoal (RNF02, RNF05).
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: plan.acao === 'EXCLUIR' ? 'PARTICIPANT_DELETED' : 'PARTICIPANT_ANONYMIZED',
          entidade: 'participante',
          entidadeId: id,
          depois: {
            motivo: dto.motivo,
            canal: dto.canal,
            pedidoEm: dto.pedidoEm,
            excluidos: plan.excluidos,
            anonimizados: plan.anonimizados,
            preservados: plan.preservados,
            inscricoesCanceladas: plan.inscricoesCanceladas,
          },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return plan;
    });
  }

  private assertNotAnonymized(row: { anonimizadoEm: Date | null }): void {
    if (row.anonimizadoEm) {
      throw new ConflictException({
        code: 'ALREADY_ANONYMIZED',
        message: 'Os dados desta pessoa já foram anonimizados.',
      });
    }
  }
}

function validDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && isoDate(date) === value;
}

/**
 * Sem inscrição em atividade já realizada, nada compõe total reportado: o cadastro é excluído.
 * Com ela, a pessoa é anonimizada e as inscrições ficam sem dado pessoal (RN-07).
 */
function planOf(row: ParticipantRow, today: string): ErasurePlanResponse {
  const realized = row.inscricoes.filter(
    (inscricao) =>
      isoDate(inscricao.atividade.data) < today &&
      inscricao.situacao !== SituacaoInscricao.CANCELADA,
  );
  const futuras = row.inscricoes.filter(
    (inscricao) =>
      isoDate(inscricao.atividade.data) >= today &&
      inscricao.situacao !== SituacaoInscricao.CANCELADA,
  ).length;
  if (realized.length === 0) {
    return {
      acao: 'EXCLUIR',
      excluidos: [
        CLASSES.identificacao,
        CLASSES.nascimento,
        CLASSES.responsavel,
        CLASSES.autorizacoes,
      ],
      anonimizados: [],
      preservados: [CLASSES.trilha],
      inscricoesCanceladas: futuras,
    };
  }
  return {
    acao: 'ANONIMIZAR',
    excluidos: [CLASSES.identificacao, CLASSES.responsavel, CLASSES.autorizacoes],
    anonimizados: [CLASSES.nascimento],
    preservados: [CLASSES.inscricoes, ...(futuras > 0 ? [CLASSES.futuras] : []), CLASSES.trilha],
    inscricoesCanceladas: futuras,
  };
}
