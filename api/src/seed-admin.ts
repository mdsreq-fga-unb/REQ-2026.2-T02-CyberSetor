import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BootstrapAdminService, EmailInUseError } from './accounts/bootstrap-admin.service.js';
import { validateSeedAdminConfig } from './accounts/seed-admin.config.js';
import { AppModule } from './app.module.js';

const logger = new Logger('SeedAdmin');

async function run(): Promise<void> {
  const config = validateSeedAdminConfig(process.env);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const result = await app.get(BootstrapAdminService).run({
      name: config.SEED_ADMIN_NAME,
      email: config.SEED_ADMIN_EMAIL,
      password: config.SEED_ADMIN_PASSWORD,
    });
    if (result.status === 'CREATED') {
      logger.log(
        `Administrador criado (${result.usuarioId}); troca de senha obrigatoria no primeiro acesso.`,
      );
    } else {
      logger.log('Ja existe administrador do sistema; nada foi alterado.');
    }
  } catch (error) {
    if (!(error instanceof EmailInUseError)) throw error;
    logger.error(`${error.message} Nada foi alterado.`);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
