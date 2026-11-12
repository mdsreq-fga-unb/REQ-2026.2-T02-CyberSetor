import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountsModule } from '../accounts/accounts.module.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LOGIN_ATTEMPTS_PER_MINUTE_PER_IP } from './login-protection.js';
import { ProfilesGuard } from './profiles.guard.js';
import { SessionCookieService } from './session-cookie.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [
    AccountsModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: LOGIN_ATTEMPTS_PER_MINUTE_PER_IP }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.get('ACCESS_TOKEN_TTL_MINUTES', { infer: true }) * 60,
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    SessionCookieService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ProfilesGuard },
  ],
  exports: [SessionService],
})
export class AuthModule {}
