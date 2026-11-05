import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import type { EmailMessage, EmailSender } from './email-sender.js';

/** Desenvolvimento e testes: registra que o aviso seria enviado, sem sair da API. */
export class LogEmailSender implements EmailSender {
  private readonly logger = new Logger(LogEmailSender.name);

  accepts(): boolean {
    return true;
  }

  send({ tag }: EmailMessage): Promise<{ messageId: string }> {
    this.logger.log(`E-mail não enviado (EMAIL_DRIVER=log): tipo ${tag}`);
    return Promise.resolve({ messageId: `log-${randomUUID()}` });
  }
}
