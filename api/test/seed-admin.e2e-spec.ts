import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapAdminService, EmailInUseError } from '../src/accounts/bootstrap-admin.service.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { AutorTipo, Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('seed:admin (e2e)', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let bootstrap: BootstrapAdminService;
  let passwords: PasswordService;

  const data = {
    name: 'Pessoa Administradora',
    email: ' Admin@Instituto.test ',
    password: 'senha temporaria longa',
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    await moduleRef.init();
    prisma = moduleRef.get(PrismaService);
    bootstrap = moduleRef.get(BootstrapAdminService);
    passwords = moduleRef.get(PasswordService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('cria pessoa, conta de administracao com troca obrigatoria e evento de sistema na trilha', async () => {
    const result = await bootstrap.run(data);

    expect(result.status).toBe('CREATED');
    const usuario = await prisma.usuario.findUniqueOrThrow({
      where: { emailLogin: 'admin@instituto.test' },
      include: { pessoa: true },
    });
    expect(usuario).toMatchObject({
      perfil: Perfil.ADMINISTRACAO_SISTEMA,
      ativo: true,
      deveTrocarSenha: true,
    });
    expect(usuario.pessoa).toMatchObject({ nome: 'Pessoa Administradora', setorId: null });
    expect(await passwords.verify(usuario.senhaHash, data.password)).toBe(true);

    const events = await prisma.trilhaAuditoria.findMany();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      autorTipo: AutorTipo.SISTEMA,
      usuarioId: null,
      acao: 'ADMIN_BOOTSTRAPPED',
      entidadeId: usuario.id,
    });
    expect(JSON.stringify(events[0].depois)).not.toContain(data.password);
    expect(JSON.stringify(events[0].depois)).not.toContain(usuario.senhaHash);
  });

  it('reexecucao nao redefine senha, nao duplica identidade nem registra novo evento', async () => {
    await bootstrap.run(data);
    const before = await prisma.usuario.findFirstOrThrow();

    const result = await bootstrap.run({ ...data, password: 'outra senha temporaria' });

    expect(result.status).toBe('ADMIN_EXISTS');
    const after = await prisma.usuario.findFirstOrThrow();
    expect(after.senhaHash).toBe(before.senhaHash);
    expect(after.atualizadoEm).toEqual(before.atualizadoEm);
    expect(await prisma.usuario.count()).toBe(1);
    expect(await prisma.pessoa.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count()).toBe(1);
  });

  it('reexecucao nao reativa administrador desativado', async () => {
    await bootstrap.run(data);
    await prisma.usuario.updateMany({ data: { ativo: false } });

    const result = await bootstrap.run(data);

    expect(result.status).toBe('ADMIN_EXISTS');
    expect((await prisma.usuario.findFirstOrThrow()).ativo).toBe(false);
  });

  it('nao promove conta existente com o mesmo e-mail e nao altera nada', async () => {
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Educadora' } });
    await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin: 'admin@instituto.test',
        senhaHash: await passwords.hash('senha da educadora longa'),
        perfil: Perfil.NUCLEO_PEDAGOGICO,
      },
    });

    await expect(bootstrap.run(data)).rejects.toBeInstanceOf(EmailInUseError);

    const usuario = await prisma.usuario.findFirstOrThrow();
    expect(usuario.perfil).toBe(Perfil.NUCLEO_PEDAGOGICO);
    expect(await prisma.pessoa.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count()).toBe(0);
  });
});
