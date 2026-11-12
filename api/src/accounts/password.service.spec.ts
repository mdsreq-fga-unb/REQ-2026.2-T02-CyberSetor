import argon2 from 'argon2';
import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  const service = new PasswordService();
  const password = 'uma senha longa de teste';

  it('gera hash Argon2id com m=19456 KiB, t=2 e p=1', async () => {
    const hash = await service.hash(password);

    expect(hash.startsWith('$argon2id$v=19$m=19456,p=1,t=2$')).toBe(true);
  });

  it('confere a senha correta e recusa a incorreta', async () => {
    const hash = await service.hash(password);

    expect(await service.verify(hash, password)).toBe(true);
    expect(await service.verify(hash, 'outra senha longa de teste')).toBe(false);
  });

  it('recusa hash malformado sem lancar excecao', async () => {
    expect(await service.verify('nao-e-um-hash', password)).toBe(false);
  });

  it('pede novo hash so quando os parametros gravados sao outros', async () => {
    const current = await service.hash(password);
    const legacy = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 4096,
      timeCost: 1,
    });

    expect(service.needsRehash(current)).toBe(false);
    expect(service.needsRehash(legacy)).toBe(true);
  });
});
