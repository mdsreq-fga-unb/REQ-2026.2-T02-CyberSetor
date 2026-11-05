import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailDriver, type EnvironmentVariables } from '../config/env.validation.js';
import { parseAllowedRecipients } from './allowed-recipients.js';
import { BrevoEmailSender } from './brevo-email-sender.js';
import { EMAIL_SENDER, type EmailSender } from './email-sender.js';
import { LogEmailSender } from './log-email-sender.js';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_SENDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>): EmailSender => {
        if (config.get('EMAIL_DRIVER', { infer: true }) !== EmailDriver.BREVO) {
          return new LogEmailSender();
        }
        // A validação do ambiente já exige a chave e o remetente com o driver do Brevo.
        return new BrevoEmailSender({
          apiKey: config.get('BREVO_API_KEY', { infer: true }) ?? '',
          from: {
            email: config.get('EMAIL_FROM', { infer: true }) ?? '',
            name: config.get('EMAIL_FROM_NAME', { infer: true }),
          },
          allowedRecipients: parseAllowedRecipients(
            config.get('EMAIL_ALLOWED_RECIPIENTS', { infer: true }),
          ),
          sandbox: config.get('EMAIL_SANDBOX', { infer: true }) === 'true',
        });
      },
    },
  ],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
