import { describe, expect, it } from 'vitest';
import { CampoDuplicidade } from '../generated/prisma/enums.js';
import { existingRecord } from './existing-record.js';

const at = (iso: string) => new Date(iso);
const row = {
  id: 'i2',
  participanteId: 'p1',
  participanteCriadoEm: at('2026-11-10T12:00:00Z'),
  criadoEm: at('2026-11-10T12:00:00Z'),
  email: 'ana@exemplo.org',
  cpf: '12345678909',
};

describe('existingRecord', () => {
  it('marca o cadastro reaproveitado que já tinha inscrição antes', () => {
    const earlier = [{ id: 'i1', participanteId: 'p1', criadoEm: at('2026-11-01T12:00:00Z') }];
    expect(existingRecord(row, CampoDuplicidade.EMAIL, earlier, [])).toBe('REAPROVEITADO');
  });

  it('marca o cadastro criado antes da inscrição, mesmo sem inscrição anterior', () => {
    const antigo = { ...row, participanteCriadoEm: at('2026-09-01T12:00:00Z') };
    expect(existingRecord(antigo, CampoDuplicidade.EMAIL, [], [])).toBe('REAPROVEITADO');
  });

  it('não marca o cadastro criado na mesma transação, milissegundos antes da inscrição', () => {
    const novo = { ...row, participanteCriadoEm: new Date(row.criadoEm.getTime() - 5) };
    expect(existingRecord(novo, CampoDuplicidade.EMAIL, [], [])).toBeNull();
  });

  it('não marca o cadastro novo, só com a própria inscrição', () => {
    const earlier = [{ id: 'i2', participanteId: 'p1', criadoEm: row.criadoEm }];
    expect(existingRecord(row, CampoDuplicidade.EMAIL, earlier, [])).toBeNull();
  });

  it('não conta inscrição posterior do mesmo cadastro', () => {
    const earlier = [{ id: 'i3', participanteId: 'p1', criadoEm: at('2026-11-11T12:00:00Z') }];
    expect(existingRecord(row, CampoDuplicidade.EMAIL, earlier, [])).toBeNull();
  });

  it('marca outro cadastro mais antigo com o mesmo e-mail', () => {
    const others = [
      { id: 'p0', email: 'ana@exemplo.org', cpf: null, criadoEm: at('2026-10-01T12:00:00Z') },
    ];
    expect(existingRecord(row, CampoDuplicidade.EMAIL, [], others)).toBe('EMAIL');
  });

  it('usa o campo escolhido na inscrição: com CPF, o e-mail igual não conta', () => {
    const others = [
      {
        id: 'p0',
        email: 'ana@exemplo.org',
        cpf: '98765432100',
        criadoEm: at('2026-10-01T12:00:00Z'),
      },
    ];
    expect(existingRecord(row, CampoDuplicidade.CPF, [], others)).toBeNull();
    const sameCpf = [{ ...others[0], cpf: '12345678909' }];
    expect(existingRecord(row, CampoDuplicidade.CPF, [], sameCpf)).toBe('CPF');
  });

  it('não marca cadastro com o mesmo e-mail criado depois da inscrição', () => {
    const others = [
      { id: 'p9', email: 'ana@exemplo.org', cpf: null, criadoEm: at('2026-11-12T12:00:00Z') },
    ];
    expect(existingRecord(row, CampoDuplicidade.EMAIL, [], others)).toBeNull();
  });

  it('sem o campo de duplicidade preenchido, não marca', () => {
    expect(existingRecord({ ...row, email: null }, CampoDuplicidade.EMAIL, [], [])).toBeNull();
  });
});
