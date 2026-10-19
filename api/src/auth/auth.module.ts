import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccountsModule } from '../accounts/accounts.module.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { SessionCookieService } from './session-cookie.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [
    AccountsModule,
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
  providers: [AuthService, SessionService, SessionCookieService, AuthGuard],
  exports: [SessionService],
})
export class AuthModule {}
