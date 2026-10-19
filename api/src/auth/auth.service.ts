import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { normalizeEmail } from '../accounts/email.js';
import { PasswordService } from '../accounts/password.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LOCKOUT_MINUTES, LOCKOUT_THRESHOLD } from './login-protection.js';
import { SessionService, type IssuedSession, type ValidSession } from './session.service.js';

export interface AccessGrant {
  accessToken: string;
  session: ValidSession;
  issued: IssuedSession;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly jwt: JwtService,
    private readonly audit: AuditTrailService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.passwords.hash(randomBytes(32).toString('base64url'));
  }

  async login(email: string, password: string, correlationId: string): Promise<AccessGrant | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { emailLogin: normalizeEmail(email) },
    });
    const locked = usuario?.bloqueadoAte != null && usuario.bloqueadoAte.getTime() > Date.now();
    const passwordMatches = await this.passwords.verify(
      usuario && !locked ? usuario.senhaHash : this.dummyHash,
      password,
    );

    if (!usuario || locked || !passwordMatches || !usuario.ativo) {
      await this.audit.record({
        autorTipo: AutorTipo.PUBLICO,
        acao: 'LOGIN_FAILED',
        entidade: 'usuario',
        entidadeId: usuario?.id ?? null,
        correlationId,
      });
      if (usuario && !locked && !passwordMatches) {
        await this.registerFailure(usuario.id, correlationId);
      }
      return null;
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        ultimoAcessoEm: new Date(),
        falhasLogin: 0,
        bloqueadoAte: null,
        ...(this.passwords.needsRehash(usuario.senhaHash)
          ? { senhaHash: await this.passwords.hash(password) }
          : {}),
      },
    });
    const issued = await this.sessions.create(usuario.id);
    await this.audit.record({
      autorTipo: AutorTipo.USUARIO,
      usuarioId: usuario.id,
      acao: 'LOGIN_SUCCEEDED',
      entidade: 'sessao',
      entidadeId: issued.sessionId,
      correlationId,
    });

    const session: ValidSession = {
      sessionId: issued.sessionId,
      usuarioId: usuario.id,
      perfil: usuario.perfil,
      deveTrocarSenha: usuario.deveTrocarSenha,
    };
    return { accessToken: await this.sign(session), session, issued };
  }

  async refresh(refreshToken: string, correlationId: string): Promise<AccessGrant | null> {
    const result = await this.sessions.refresh(refreshToken);
    if (result.status === 'REUSED') {
      await this.audit.record({
        autorTipo: AutorTipo.PUBLICO,
        acao: 'REFRESH_TOKEN_REUSED',
        entidade: 'usuario',
        entidadeId: result.usuarioId,
        correlationId,
      });
      return null;
    }
    if (result.status === 'INVALID') return null;
    return {
      accessToken: await this.sign(result.session),
      session: result.session,
      issued: result.issued,
    };
  }

  async logout(refreshToken: string, correlationId: string): Promise<void> {
    const usuarioId = await this.sessions.end(refreshToken);
    if (!usuarioId) return;
    await this.audit.record({
      autorTipo: AutorTipo.USUARIO,
      usuarioId,
      acao: 'LOGOUT',
      entidade: 'usuario',
      entidadeId: usuarioId,
      correlationId,
    });
  }

  async changePassword(
    session: ValidSession,
    currentPassword: string,
    newPassword: string,
    correlationId: string,
  ): Promise<void> {
    if (currentPassword === newPassword) {
      throw new BadRequestException('A nova senha precisa ser diferente da atual.');
    }
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: session.usuarioId },
    });
    if (!(await this.passwords.verify(usuario.senhaHash, currentPassword))) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const senhaHash = await this.passwords.hash(newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { senhaHash, deveTrocarSenha: false },
      });
      await tx.sessao.updateMany({
        where: { usuarioId: usuario.id, revogadaEm: null, id: { not: session.sessionId } },
        data: { revogadaEm: new Date() },
      });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: usuario.id,
          acao: 'PASSWORD_CHANGED',
          entidade: 'usuario',
          entidadeId: usuario.id,
          antes: { deveTrocarSenha: usuario.deveTrocarSenha },
          depois: { deveTrocarSenha: false },
          correlationId,
        },
        tx,
      );
    });
  }

  private async registerFailure(usuarioId: string, correlationId: string): Promise<void> {
    const { falhasLogin } = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { falhasLogin: { increment: 1 } },
      select: { falhasLogin: true },
    });
    if (falhasLogin < LOCKOUT_THRESHOLD) return;

    const bloqueadoAte = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { falhasLogin: 0, bloqueadoAte },
    });
    await this.audit.record({
      autorTipo: AutorTipo.SISTEMA,
      acao: 'ACCOUNT_LOCKED',
      entidade: 'usuario',
      entidadeId: usuarioId,
      depois: { bloqueadoAte: bloqueadoAte.toISOString() },
      correlationId,
    });
  }

  private sign(session: ValidSession): Promise<string> {
    return this.jwt.signAsync({ sub: session.usuarioId, sid: session.sessionId });
  }
}
