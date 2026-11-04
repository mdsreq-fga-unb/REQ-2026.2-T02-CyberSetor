import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../auth/decorators.js';
import {
  PublicFormResponse,
  SubmitRegistrationDto,
  SubmittedRegistrationResponse,
} from './public-registrations.dto.js';
import { PublicRegistrationsService } from './public-registrations.service.js';

export const PUBLIC_SUBMISSIONS_PER_MINUTE_PER_IP = 20;
const CODE = /^[A-Za-z0-9_-]{16}$/;

function checkedCode(codigo: string): string {
  if (!CODE.test(codigo)) {
    throw new NotFoundException({
      code: 'REGISTRATION_LINK_NOT_FOUND',
      message: 'Link de inscrição inválido. Confira o endereço com o Instituto.',
    });
  }
  return codigo;
}

/** Formulário público de inscrição (HU-07a): sem conta nem senha (RF11). */
@ApiTags('public-registrations')
@Public()
@Controller('public/registrations')
export class PublicRegistrationsController {
  constructor(private readonly registrations: PublicRegistrationsService) {}

  @Get(':codigo')
  @ApiOkResponse({ type: PublicFormResponse })
  @ApiNotFoundResponse({ description: 'REGISTRATION_LINK_NOT_FOUND' })
  form(@Param('codigo') codigo: string): Promise<PublicFormResponse> {
    return this.registrations.form(checkedCode(codigo));
  }

  @Post(':codigo')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: PUBLIC_SUBMISSIONS_PER_MINUTE_PER_IP, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SubmittedRegistrationResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, NOTICE_OUTDATED, TERM_NOT_ACCEPTED, TERM_OUTDATED, FIELD_NOT_ASKED, MISSING_FIELDS, INVALID_CPF, INVALID_BIRTH_DATE ou GUARDIAN_REQUIRED',
  })
  @ApiConflictResponse({ description: 'REGISTRATION_CLOSED ou ALREADY_REGISTERED' })
  @ApiNotFoundResponse({ description: 'REGISTRATION_LINK_NOT_FOUND' })
  @ApiTooManyRequestsResponse({ description: 'Limite de envios por IP' })
  submit(
    @Param('codigo') codigo: string,
    @Body() body: SubmitRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SubmittedRegistrationResponse> {
    return this.registrations.submit(
      checkedCode(codigo),
      body,
      String(res.locals.correlationId ?? ''),
    );
  }
}
