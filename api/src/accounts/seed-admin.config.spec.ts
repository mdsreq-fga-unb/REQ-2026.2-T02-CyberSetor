import { validateSeedAdminConfig } from './seed-admin.config.js';

describe('validateSeedAdminConfig', () => {
  const valid = {
    SEED_ADMIN_NAME: 'Pessoa Administradora',
    SEED_ADMIN_EMAIL: 'admin@instituto.test',
    SEED_ADMIN_PASSWORD: 'senha temporaria longa',
  };

  it('aceita nome, e-mail e senha de 15 a 64 caracteres', () => {
    expect(validateSeedAdminConfig(valid)).toMatchObject(valid);
  });

  it('recusa variavel ausente', () => {
    expect(() => validateSeedAdminConfig({ ...valid, SEED_ADMIN_NAME: undefined })).toThrow(
      'SEED_ADMIN_NAME',
    );
  });

  it('recusa e-mail invalido', () => {
    expect(() => validateSeedAdminConfig({ ...valid, SEED_ADMIN_EMAIL: 'admin' })).toThrow(
      'SEED_ADMIN_EMAIL',
    );
  });

  it('recusa senha curta ou longa demais sem repetir o valor na mensagem', () => {
    const short = 'curta-demais';
    expect(() => validateSeedAdminConfig({ ...valid, SEED_ADMIN_PASSWORD: short })).toThrow(
      'SEED_ADMIN_PASSWORD',
    );
    expect(() => validateSeedAdminConfig({ ...valid, SEED_ADMIN_PASSWORD: short })).not.toThrow(
      short,
    );
    expect(() =>
      validateSeedAdminConfig({ ...valid, SEED_ADMIN_PASSWORD: 'x'.repeat(65) }),
    ).toThrow('SEED_ADMIN_PASSWORD');
  });
});
