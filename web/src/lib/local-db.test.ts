import { localDb } from './local-db';

describe('localDb', () => {
  it('declara o banco local sem tabelas de dominio', () => {
    expect(localDb.name).toBe('cybersetor');
    expect(localDb.tables).toHaveLength(0);
  });
});
