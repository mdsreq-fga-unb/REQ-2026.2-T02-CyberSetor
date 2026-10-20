import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, Perfil } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from './email.js';
import { PasswordService } from './password.service.js';

export interface InitialAdminData {
  name: string;
  email: string;
  password: string;
}

export type BootstrapResult = { status: 'CREATED'; usuarioId: string } | { status: 'ADMIN_EXISTS' };

export class EmailInUseError extends Error {
  constructor() {
    super('O e-mail informado ja pertence a outra conta.');
  }
}

@Injectable()
export class BootstrapAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async run(data: InitialAdminData): Promise<BootstrapResult> {
    const emailLogin = normalizeEmail(data.email);
    const senhaHash = await this.passwords.hash(data.password);

    return this.prisma.$transaction(
      async (tx): Promise<BootstrapResult> => {
        const admin = await tx.usuario.findFirst({
          where: { perfil: Perfil.ADMINISTRACAO_SISTEMA },
          select: { id: true },
        });
        if (admin) {
          return { status: 'ADMIN_EXISTS' };
        }

        const inUse = await tx.usuario.findUnique({
          where: { emailLogin },
          select: { id: true },
        });
        if (inUse) {
          throw new EmailInUseError();
        }

        const pessoa = await tx.pessoa.create({ data: { nome: data.name.trim() } });
        const usuario = await tx.usuario.create({
          data: {
            pessoaId: pessoa.id,
            emailLogin,
            senhaHash,
            perfil: Perfil.ADMINISTRACAO_SISTEMA,
            ativo: true,
            deveTrocarSenha: true,
          },
        });
        await tx.trilhaAuditoria.create({
          data: {
            autorTipo: AutorTipo.SISTEMA,
            acao: 'ADMIN_BOOTSTRAPPED',
            entidade: 'usuario',
            entidadeId: usuario.id,
            depois: {
              emailLogin,
              perfil: usuario.perfil,
              ativo: usuario.ativo,
              deveTrocarSenha: usuario.deveTrocarSenha,
            },
            correlationId: randomUUID(),
          },
        });

        return { status: 'CREATED', usuarioId: usuario.id };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
