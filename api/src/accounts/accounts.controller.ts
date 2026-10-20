import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import {
  AccountResponse,
  ChangeProfileDto,
  CreateAccountDto,
  DeactivationResponse,
  TemporaryPasswordResponse,
} from './accounts.dto.js';
import { AccountsService, type Actor } from './accounts.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('accounts')
@ApiBearerAuth()
@Profiles(Perfil.ADMINISTRACAO_SISTEMA)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOkResponse({ type: [AccountResponse] })
  list(): Promise<AccountResponse[]> {
    return this.accounts.list();
  }

  @Post()
  @ApiCreatedResponse({ type: TemporaryPasswordResponse })
  @ApiConflictResponse({ description: 'E-mail ja usado por outra conta' })
  create(
    @Body() body: CreateAccountDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TemporaryPasswordResponse> {
    return this.accounts.create(body, actorOf(user, res));
  }

  @Patch(':id/profile')
  @ApiOkResponse({ type: AccountResponse })
  @ApiConflictResponse({ description: 'Deixaria o sistema sem administrador ativo' })
  changeProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeProfileDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccountResponse> {
    return this.accounts.changeProfile(id, body.perfil, actorOf(user, res));
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DeactivationResponse })
  @ApiConflictResponse({ description: 'Deixaria o sistema sem administrador ativo' })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeactivationResponse> {
    return this.accounts.deactivate(id, actorOf(user, res));
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccountResponse })
  reactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccountResponse> {
    return this.accounts.reactivate(id, actorOf(user, res));
  }

  @Post(':id/password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TemporaryPasswordResponse })
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TemporaryPasswordResponse> {
    return this.accounts.resetPassword(id, actorOf(user, res));
  }
}
