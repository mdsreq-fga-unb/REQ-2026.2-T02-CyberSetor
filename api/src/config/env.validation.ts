import { isIP } from 'node:net';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  ValidateBy,
  validateSync,
} from 'class-validator';

const PROXY_RANGES = new Set(['loopback', 'linklocal', 'uniquelocal']);

function isProxyItem(item: string): boolean {
  if (PROXY_RANGES.has(item)) return true;
  const [address, prefix, ...rest] = item.split('/');
  const version = isIP(address);
  if (version === 0 || rest.length > 0) return false;
  if (prefix === undefined) return true;
  return /^\d{1,3}$/.test(prefix) && Number(prefix) <= (version === 4 ? 32 : 128);
}

export function isTrustProxy(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return true;
  return trimmed.split(',').every((item) => isProxyItem(item.trim()));
}

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsOptional()
  @IsString()
  CORS_ORIGIN: string = '';

  @IsUrl({ protocols: ['postgresql', 'postgres'], require_tld: false, require_protocol: true })
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ACCESS_TOKEN_TTL_MINUTES: number = 15;

  @IsOptional()
  @IsInt()
  @Min(1)
  SESSION_IDLE_TIMEOUT_MINUTES: number = 30;

  @IsOptional()
  @IsInt()
  @Min(1)
  SESSION_ABSOLUTE_TIMEOUT_HOURS: number = 8;

  @IsOptional()
  @ValidateBy({ name: 'isTrustProxy', validator: { validate: isTrustProxy } })
  TRUST_PROXY?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const filled = Object.fromEntries(Object.entries(config).filter(([, value]) => value !== ''));
  const validated = plainToInstance(EnvironmentVariables, filled, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const detalhe = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('; ');
    throw new Error(`Variaveis de ambiente invalidas — ${detalhe}`);
  }
  return validated;
}
