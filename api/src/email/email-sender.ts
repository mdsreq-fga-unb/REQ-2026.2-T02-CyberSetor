export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  tag: string;
}

export class EmailDeliveryError extends Error {
  /**
   * @param code motivo sem dados pessoais, seguro para registro
   * @param uncertain o provedor pode ter aceitado o envio, então repetir pode duplicar o e-mail
   */
  constructor(
    readonly code: string,
    readonly uncertain: boolean,
  ) {
    super(`Falha no envio de e-mail: ${code}`);
    this.name = 'EmailDeliveryError';
  }
}

export interface EmailSender {
  accepts(email: string): boolean;
  send(message: EmailMessage): Promise<{ messageId: string }>;
}
