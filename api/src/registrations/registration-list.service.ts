import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { SituacaoInscricao } from '../generated/prisma/enums.js';
import { todayInBrasilia } from '../goals/goal-deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ageOn, onlyDigits } from '../public-registrations/participant-data.js';
import type { RegistrationListResponse } from './registration-list.dto.js';
import { confirmFromWaitlist } from './waitlist.js';

const ADULT_AGE = 18;
const MIN_PHONE_SEARCH = 3;

const ORDER: Record<SituacaoInscricao, number> = {
  [SituacaoInscricao.CONFIRMADA]: 0,
  [SituacaoInscricao.LISTA_ESPERA]: 1,
};

/** Lista nominal dos inscritos de uma atividade, para o Núcleo Pedagógico (HU-07c, RNF04). */
@Injectable()
export class RegistrationListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  /** Vaga confirmada a uma pessoa da espera, quando há vaga livre (promoção manual). */
  async confirm(
    atividadeId: string,
    inscricaoId: string,
    actor: Actor,
  ): Promise<RegistrationListResponse> {
    const ativo = await this.prisma.atividade.findUnique({
      where: { id: atividadeId },
      select: { projeto: { select: { instrumento: { select: { ativo: true } } } } },
    });
    if (!ativo) throw new NotFoundException('Atividade não encontrada.');
    if (!ativo.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está inativo e não altera inscrições.',
      });
    }
    const refused = await this.prisma.$transaction((tx) =>
      confirmFromWaitlist(tx, this.audit, atividadeId, inscricaoId, actor),
    );
    if (refused === 'NOT_FOUND') throw new NotFoundException('Inscrição não encontrada.');
    if (refused === 'NOT_WAITING') {
      throw new ConflictException({
        code: 'NOT_IN_WAITLIST',
        message: 'Esta inscrição não está na lista de espera.',
      });
    }
    if (refused === 'NO_VACANCY') {
      throw new ConflictException({
        code: 'NO_VACANCY',
        message: 'Não há vaga livre. Aumente as vagas da inscrição para confirmar.',
      });
    }
    return this.list(atividadeId);
  }

  async list(atividadeId: string, busca?: string): Promise<RegistrationListResponse> {
    const config = await this.prisma.configuracaoInscricao.findUnique({
      where: { atividadeId },
      select: { vagas: true },
    });
    if (!config) {
      const count = await this.prisma.atividade.count({ where: { id: atividadeId } });
      if (count === 0) throw new NotFoundException('Atividade não encontrada.');
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_OPENED',
        message: 'A inscrição desta atividade ainda não foi aberta.',
      });
    }
    const rows = await this.prisma.inscricao.findMany({
      where: { atividadeId },
      orderBy: { ordemChegada: 'asc' },
      include: {
        participante: {
          select: { nome: true, dataNascimento: true, telefone: true, email: true },
        },
      },
    });

    const today = todayInBrasilia();
    let espera = 0;
    const inscricoes = rows
      .map((row) => {
        const idade = ageOn(row.participante.dataNascimento.toISOString().slice(0, 10), today);
        const emEspera = row.situacao === SituacaoInscricao.LISTA_ESPERA;
        return {
          id: row.id,
          participanteId: row.participanteId,
          nome: row.participante.nome,
          idade,
          menor: idade < ADULT_AGE,
          telefone: row.participante.telefone,
          email: row.participante.email,
          situacao: row.situacao,
          posicaoEspera: emEspera ? ++espera : null,
          inscritoEm: row.criadoEm,
          autorizaComunicados: row.autorizaComunicados,
          autorizaImagem: row.autorizaImagem,
          responsavelNome: row.responsavelNome,
          responsavelTelefone: row.responsavelTelefone,
        };
      })
      .sort((a, b) => ORDER[a.situacao] - ORDER[b.situacao]);

    return {
      vagas: config.vagas,
      confirmadas: inscricoes.length - espera,
      emEspera: espera,
      inscricoes: inscricoes.filter(matches(busca)),
    };
  }
}

/** Mesma busca da lista de participantes: nome, e-mail ou, com três dígitos, telefone. */
function matches(busca?: string) {
  const text = busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
  const digits = onlyDigits(text);
  return (row: { nome: string; email: string | null; telefone: string }): boolean =>
    !text ||
    row.nome.toLocaleLowerCase('pt-BR').includes(text) ||
    (row.email?.includes(text) ?? false) ||
    (digits.length >= MIN_PHONE_SEARCH && row.telefone.includes(digits));
}
