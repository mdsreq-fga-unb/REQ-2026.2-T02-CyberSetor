import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AccessResponse, LoginDto, SessionResponse } from './auth.dto.js';
import { AuthService, type AccessGrant } from './auth.service.js';
import { CurrentUser } from './authenticated-user.js';
import { CsrfGuard } from './csrf.guard.js';
import { Public } from './decorators.js';
import { SessionCookieService } from './session-cookie.service.js';
import type { ValidSession } from './session.service.js';

function correlationIdOf(res: Response): string {
  return String(res.locals.correlationId ?? '');
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookie: SessionCookieService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccessResponse, description: 'Define o cookie de renovacao' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessResponse> {
    const grant = await this.auth.login(body.email, body.senha, correlationIdOf(res));
    if (!grant) throw new UnauthorizedException('E-mail ou senha incorretos.');
    return this.respond(res, grant);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth()
  @ApiHeader({ name: 'X-CSRF', required: true, example: '1' })
  @ApiOkResponse({ type: AccessResponse, description: 'Renova o acesso e roda o cookie' })
  @ApiUnauthorizedResponse({ description: 'Sessao encerrada' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessResponse> {
    const refreshToken = this.cookie.read(req);
    const grant = refreshToken ? await this.auth.refresh(refreshToken, correlationIdOf(res)) : null;
    if (!grant) {
      this.cookie.clear(res);
      throw new UnauthorizedException('Sessao encerrada. Entre novamente.');
    }
    return this.respond(res, grant);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth()
  @ApiHeader({ name: 'X-CSRF', required: true, example: '1' })
  @ApiNoContentResponse({ description: 'Sessao revogada e cookie removido' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const refreshToken = this.cookie.read(req);
    if (refreshToken) await this.auth.logout(refreshToken, correlationIdOf(res));
    this.cookie.clear(res);
  }

  @Get('session')
  @ApiBearerAuth()
  @ApiOkResponse({ type: SessionResponse })
  session(@CurrentUser() user: ValidSession): SessionResponse {
    return {
      usuarioId: user.usuarioId,
      perfil: user.perfil,
      deveTrocarSenha: user.deveTrocarSenha,
    };
  }

  private respond(res: Response, grant: AccessGrant): AccessResponse {
    this.cookie.set(res, grant.issued.refreshToken, grant.issued.expiresAt);
    return {
      accessToken: grant.accessToken,
      perfil: grant.session.perfil,
      deveTrocarSenha: grant.session.deveTrocarSenha,
    };
  }
}
