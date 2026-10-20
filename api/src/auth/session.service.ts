import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { Perfil } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ValidSession {
  sessionId: string;
  usuarioId: string;
  perfil: Perfil;
  deveTrocarSenha: boolean;
}

export interface IssuedSession {
  sessionId: string;
  refreshToken: string;
  expiresAt: Date;
}

export type RefreshResult =
  | { status: 'REFRESHED'; session: ValidSession; issued: IssuedSession }
  | { status: 'INVALID' }
  | { status: 'REUSED'; usuarioId: string };

const LAST_USED_WRITE_INTERVAL_MS = 60_000;

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function splitRefreshToken(refreshToken: string): { sessionId: string; secret: string } | null {
  const [sessionId, secret, ...rest] = refreshToken.split('.');
  if (!sessionId || !secret || rest.length > 0) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId))
    return null;
  return { sessionId, secret };
}

@Injectable()
export class SessionService {
  private readonly idleTimeoutMs: number;
  private readonly absoluteTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.idleTimeoutMs = config.get('SESSION_IDLE_TIMEOUT_MINUTES', { infer: true }) * 60_000;
    this.absoluteTimeoutMs =
      config.get('SESSION_ABSOLUTE_TIMEOUT_HOURS', { infer: true }) * 3_600_000;
  }

  async create(usuarioId: string): Promise<IssuedSession> {
    const secret = randomBytes(32).toString('base64url');
    const sessao = await this.prisma.sessao.create({
      data: {
        usuarioId,
        tokenHash: hashSecret(secret),
        expiraEm: new Date(Date.now() + this.absoluteTimeoutMs),
      },
    });
    return {
      sessionId: sessao.id,
      refreshToken: `${sessao.id}.${secret}`,
      expiresAt: sessao.expiraEm,
    };
  }

  async validateAccess(sessionId: string): Promise<ValidSession | null> {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: sessionId },
      include: { usuario: true },
    });
    const now = Date.now();
    if (!sessao || !this.isActive(sessao, now) || !sessao.usuario.ativo) return null;

    if (now - sessao.ultimoUsoEm.getTime() > LAST_USED_WRITE_INTERVAL_MS) {
      await this.prisma.sessao.update({
        where: { id: sessao.id },
        data: { ultimoUsoEm: new Date(now) },
      });
    }

    return {
      sessionId: sessao.id,
      usuarioId: sessao.usuarioId,
      perfil: sessao.usuario.perfil,
      deveTrocarSenha: sessao.usuario.deveTrocarSenha,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const parts = splitRefreshToken(refreshToken);
    if (!parts) return { status: 'INVALID' };

    const sessao = await this.prisma.sessao.findUnique({
      where: { id: parts.sessionId },
      include: { usuario: true },
    });
    if (!sessao || !this.isActive(sessao, Date.now()) || !sessao.usuario.ativo) {
      return { status: 'INVALID' };
    }

    if (!hashesMatch(sessao.tokenHash, hashSecret(parts.secret))) {
      await this.revoke(sessao.id);
      return { status: 'REUSED', usuarioId: sessao.usuarioId };
    }

    const newSecret = randomBytes(32).toString('base64url');
    const { count } = await this.prisma.sessao.updateMany({
      where: { id: sessao.id, tokenHash: sessao.tokenHash, revogadaEm: null },
      data: { tokenHash: hashSecret(newSecret) },
    });
    if (count === 0) return { status: 'INVALID' };

    return {
      status: 'REFRESHED',
      session: {
        sessionId: sessao.id,
        usuarioId: sessao.usuarioId,
        perfil: sessao.usuario.perfil,
        deveTrocarSenha: sessao.usuario.deveTrocarSenha,
      },
      issued: {
        sessionId: sessao.id,
        refreshToken: `${sessao.id}.${newSecret}`,
        expiresAt: sessao.expiraEm,
      },
    };
  }

  async end(refreshToken: string): Promise<string | null> {
    const parts = splitRefreshToken(refreshToken);
    if (!parts) return null;
    const sessao = await this.prisma.sessao.findUnique({ where: { id: parts.sessionId } });
    if (!sessao || !hashesMatch(sessao.tokenHash, hashSecret(parts.secret))) return null;
    await this.revoke(sessao.id);
    return sessao.usuarioId;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.sessao.updateMany({
      where: { id: sessionId, revogadaEm: null },
      data: { revogadaEm: new Date() },
    });
  }

  private isActive(
    sessao: { revogadaEm: Date | null; expiraEm: Date; ultimoUsoEm: Date },
    now: number,
  ): boolean {
    return (
      sessao.revogadaEm === null &&
      sessao.expiraEm.getTime() > now &&
      now - sessao.ultimoUsoEm.getTime() < this.idleTimeoutMs
    );
  }
}
