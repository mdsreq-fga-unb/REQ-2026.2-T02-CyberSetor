import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, Perfil } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AccountResponse,
  CreateAccountDto,
  DeactivationResponse,
  TemporaryPasswordResponse,
} from './accounts.dto.js';
import { normalizeEmail } from './email.js';
import { PasswordService } from './password.service.js';

export interface Actor {
  usuarioId: string;
  correlationId: string;
}

const ACCOUNT_SELECT = {
  id: true,
  pessoaId: true,
  emailLogin: true,
  perfil: true,
  ativo: true,
  deveTrocarSenha: true,
  bloqueadoAte: true,
  ultimoAcessoEm: true,
  pessoa: { select: { nome: true } },
} satisfies Prisma.UsuarioSelect;

type AccountRow = Prisma.UsuarioGetPayload<{ select: typeof ACCOUNT_SELECT }>;

const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };

function toResponse({ pessoa, ...usuario }: AccountRow): AccountResponse {
  return { ...usuario, nome: pessoa.nome };
}

function generateTemporaryPassword(): string {
  return randomBytes(18).toString('base64url');
}

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(): Promise<AccountResponse[]> {
    const rows = await this.prisma.usuario.findMany({
      select: ACCOUNT_SELECT,
      orderBy: { pessoa: { nome: 'asc' } },
    });
    return rows.map(toResponse);
  }

  async create(data: CreateAccountDto, actor: Actor): Promise<TemporaryPasswordResponse> {
    const emailLogin = normalizeEmail(data.emailLogin);
    const senhaTemporaria = generateTemporaryPassword();
    const senhaHash = await this.passwords.hash(senhaTemporaria);

    const conta = await this.prisma.$transaction(async (tx) => {
      if (await tx.usuario.findUnique({ where: { emailLogin }, select: { id: true } })) {
        throw new ConflictException('Ja existe conta com este e-mail.');
      }
      const pessoa = await tx.pessoa.create({ data: { nome: data.nome } });
      const usuario = await tx.usuario.create({
        data: {
          pessoaId: pessoa.id,
          emailLogin,
          senhaHash,
          perfil: data.perfil,
          deveTrocarSenha: true,
        },
        select: ACCOUNT_SELECT,
      });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACCOUNT_CREATED',
          entidade: 'usuario',
          entidadeId: usuario.id,
          depois: { emailLogin, perfil: usuario.perfil },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return usuario;
    }, SERIALIZABLE);

    return { conta: toResponse(conta), senhaTemporaria };
  }

  async changeProfile(id: string, perfil: Perfil, actor: Actor): Promise<AccountResponse> {
    const conta = await this.prisma.$transaction(async (tx) => {
      const current = await this.findOrFail(tx, id);
      if (current.perfil === perfil) return current;
      await this.ensureNotLastAdmin(tx, current);

      const updated = await tx.usuario.update({
        where: { id },
        data: { perfil },
        select: ACCOUNT_SELECT,
      });
      await this.revokeSessions(tx, id);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACCOUNT_PROFILE_CHANGED',
          entidade: 'usuario',
          entidadeId: id,
          antes: { perfil: current.perfil },
          depois: { perfil },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return updated;
    }, SERIALIZABLE);
    return toResponse(conta);
  }

  async deactivate(id: string, actor: Actor): Promise<DeactivationResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await this.findOrFail(tx, id);
      const projetosCoordenados = await tx.projeto.count({ where: { coordenadorId: id } });
      if (!current.ativo) return { conta: toResponse(current), projetosCoordenados };
      await this.ensureNotLastAdmin(tx, current);

      const updated = await tx.usuario.update({
        where: { id },
        data: { ativo: false },
        select: ACCOUNT_SELECT,
      });
      await this.revokeSessions(tx, id);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACCOUNT_DEACTIVATED',
          entidade: 'usuario',
          entidadeId: id,
          antes: { ativo: true },
          depois: { ativo: false, projetosCoordenados },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return { conta: toResponse(updated), projetosCoordenados };
    }, SERIALIZABLE);
  }

  async reactivate(id: string, actor: Actor): Promise<AccountResponse> {
    const conta = await this.prisma.$transaction(async (tx) => {
      const current = await this.findOrFail(tx, id);
      if (current.ativo) return current;

      const updated = await tx.usuario.update({
        where: { id },
        data: { ativo: true },
        select: ACCOUNT_SELECT,
      });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACCOUNT_REACTIVATED',
          entidade: 'usuario',
          entidadeId: id,
          antes: { ativo: false },
          depois: { ativo: true },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return updated;
    }, SERIALIZABLE);
    return toResponse(conta);
  }

  async resetPassword(id: string, actor: Actor): Promise<TemporaryPasswordResponse> {
    const senhaTemporaria = generateTemporaryPassword();
    const senhaHash = await this.passwords.hash(senhaTemporaria);

    const conta = await this.prisma.$transaction(async (tx) => {
      await this.findOrFail(tx, id);
      const updated = await tx.usuario.update({
        where: { id },
        data: { senhaHash, deveTrocarSenha: true, falhasLogin: 0, bloqueadoAte: null },
        select: ACCOUNT_SELECT,
      });
      await this.revokeSessions(tx, id);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'ACCOUNT_PASSWORD_RESET',
          entidade: 'usuario',
          entidadeId: id,
          depois: { deveTrocarSenha: true },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return updated;
    }, SERIALIZABLE);

    return { conta: toResponse(conta), senhaTemporaria };
  }

  private async findOrFail(tx: Prisma.TransactionClient, id: string): Promise<AccountRow> {
    const conta = await tx.usuario.findUnique({ where: { id }, select: ACCOUNT_SELECT });
    if (!conta) throw new NotFoundException('Conta nao encontrada.');
    return conta;
  }

  private async ensureNotLastAdmin(tx: Prisma.TransactionClient, conta: AccountRow): Promise<void> {
    if (conta.perfil !== Perfil.ADMINISTRACAO_SISTEMA || !conta.ativo) return;
    const others = await tx.usuario.count({
      where: { perfil: Perfil.ADMINISTRACAO_SISTEMA, ativo: true, id: { not: conta.id } },
    });
    if (others === 0) {
      throw new ConflictException({
        code: 'LAST_ADMIN',
        message: 'A operacao deixaria o sistema sem administrador ativo.',
      });
    }
  }

  private async revokeSessions(tx: Prisma.TransactionClient, usuarioId: string): Promise<void> {
    await tx.sessao.updateMany({
      where: { usuarioId, revogadaEm: null },
      data: { revogadaEm: new Date() },
    });
  }
}
