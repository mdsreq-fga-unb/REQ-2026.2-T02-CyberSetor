import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { NodeEnv, type EnvironmentVariables } from '../config/env.validation.js';

@Injectable()
export class SessionCookieService {
  readonly name: string;
  private readonly secure: boolean;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.secure = config.get('NODE_ENV', { infer: true }) === NodeEnv.PRODUCTION;
    this.name = this.secure ? '__Host-session' : 'session';
  }

  set(res: Response, refreshToken: string, expiresAt: Date): void {
    res.cookie(this.name, refreshToken, { ...this.options(), expires: expiresAt });
  }

  clear(res: Response): void {
    res.clearCookie(this.name, this.options());
  }

  read(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[this.name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private options(): CookieOptions {
    return { httpOnly: true, secure: this.secure, sameSite: 'strict', path: '/' };
  }
}
