import { BrevoClient, BrevoError, BrevoTimeoutError } from '@getbrevo/brevo';
import { isAllowedRecipient } from './allowed-recipients.js';
import { EmailDeliveryError, type EmailMessage, type EmailSender } from './email-sender.js';

const TIMEOUT_SECONDS = 10;

export interface BrevoOptions {
  apiKey: string;
  from: { email: string; name: string };
  allowedRecipients: readonly string[];
  sandbox: boolean;
}

type TransactionalEmails = Pick<BrevoClient['transactionalEmails'], 'sendTransacEmail'>;

function deliveryError(error: unknown): EmailDeliveryError {
  if (error instanceof BrevoTimeoutError) return new EmailDeliveryError('BREVO_TIMEOUT', true);
  if (error instanceof BrevoError && error.statusCode !== undefined) {
    return new EmailDeliveryError(`BREVO_${error.statusCode}`, false);
  }
  return new EmailDeliveryError('BREVO_SEM_RESPOSTA', true);
}

export class BrevoEmailSender implements EmailSender {
  private readonly emails: TransactionalEmails;

  constructor(
    private readonly options: BrevoOptions,
    emails?: TransactionalEmails,
  ) {
    // Sem repetição no SDK: um POST repetido depois de timeout poderia duplicar o e-mail.
    this.emails =
      emails ??
      new BrevoClient({
        apiKey: options.apiKey,
        timeoutInSeconds: TIMEOUT_SECONDS,
        maxRetries: 0,
      }).transactionalEmails;
  }

  accepts(email: string): boolean {
    return isAllowedRecipient(email, this.options.allowedRecipients);
  }

  async send(message: EmailMessage): Promise<{ messageId: string }> {
    try {
      const { messageId } = await this.emails.sendTransacEmail({
        sender: this.options.from,
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        tags: [message.tag],
        ...(this.options.sandbox ? { headers: { 'X-Sib-Sandbox': 'drop' } } : {}),
      });
      return { messageId: messageId ?? '' };
    } catch (error) {
      throw deliveryError(error);
    }
  }
}
