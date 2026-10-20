import 'reflect-metadata';
import { NodeEnv, validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  const required = {
    DATABASE_URL: 'postgresql://usuario:senha@localhost:5432/banco',
    JWT_SECRET: 'x'.repeat(32),
  };

  it('aplica os padroes de desenvolvimento quando as opcionais faltam', () => {
    expect(validateEnv(required)).toMatchObject({
      NODE_ENV: NodeEnv.DEVELOPMENT,
      PORT: 3001,
      CORS_ORIGIN: '',
      ACCESS_TOKEN_TTL_MINUTES: 15,
      SESSION_IDLE_TIMEOUT_MINUTES: 30,
      SESSION_ABSOLUTE_TIMEOUT_HOURS: 8,
    });
  });

  it.each(['1', 'loopback, linklocal, uniquelocal', '10.0.0.0/8'])(
    'aceita TRUST_PROXY no formato do Express: %s',
    (value) => {
      expect(validateEnv({ ...required, TRUST_PROXY: value }).TRUST_PROXY).toBe(value);
    },
  );

  it.each(['true', 'loopback; rm -rf', '*'])('recusa TRUST_PROXY fora do formato: %s', (value) => {
    expect(() => validateEnv({ ...required, TRUST_PROXY: value })).toThrow('TRUST_PROXY');
  });

  it('trata variavel vazia como ausente', () => {
    const env = validateEnv({ ...required, PORT: '', NODE_ENV: '', ACCESS_TOKEN_TTL_MINUTES: '' });

    expect(env).toMatchObject({
      PORT: 3001,
      NODE_ENV: NodeEnv.DEVELOPMENT,
      ACCESS_TOKEN_TTL_MINUTES: 15,
    });
  });

  it('converte os valores numericos informados', () => {
    expect(
      validateEnv({ ...required, SESSION_IDLE_TIMEOUT_MINUTES: '20' }).SESSION_IDLE_TIMEOUT_MINUTES,
    ).toBe(20);
  });

  it('exige JWT_SECRET com pelo menos 32 caracteres', () => {
    expect(() => validateEnv({ ...required, JWT_SECRET: '' })).toThrow('JWT_SECRET');
    expect(() => validateEnv({ ...required, JWT_SECRET: 'curto' })).toThrow('JWT_SECRET');
  });

  it('recusa NODE_ENV fora de development, test e production', () => {
    expect(() => validateEnv({ ...required, NODE_ENV: 'homologacao' })).toThrow('NODE_ENV');
  });
});
