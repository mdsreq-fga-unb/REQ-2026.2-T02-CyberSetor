import { plainToInstance } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, validateSync } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './password.service.js';

export class SeedAdminConfig {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  SEED_ADMIN_NAME!: string;

  @IsEmail()
  SEED_ADMIN_EMAIL!: string;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  SEED_ADMIN_PASSWORD!: string;
}

export function validateSeedAdminConfig(env: Record<string, unknown>): SeedAdminConfig {
  const config = plainToInstance(SeedAdminConfig, {
    SEED_ADMIN_NAME: env.SEED_ADMIN_NAME,
    SEED_ADMIN_EMAIL: env.SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD: env.SEED_ADMIN_PASSWORD,
  });
  const errors = validateSync(config);
  if (errors.length > 0) {
    const detail = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('; ');
    throw new Error(`Variaveis do seed invalidas — ${detail}`);
  }
  return config;
}
