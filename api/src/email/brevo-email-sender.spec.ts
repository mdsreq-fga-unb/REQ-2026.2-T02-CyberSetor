import { BrevoError, BrevoTimeoutError } from '@getbrevo/brevo';
import { BrevoEmailSender, type BrevoOptions } from './brevo-email-sender.js';
import { EmailDeliveryError, type EmailMessage } from './email-sender.js';

const KEY = 'xkeysib-chave-de-teste';

const message: EmailMessage = {
  to: 'ana@equipe.org',
  subject: 'Assunto',
  text: 'Texto',
  html: '<p>Texto</p>',
  tag: 'VENCIMENTO',
};

function setup(overrides: Partial<BrevoOptions> = {}) {
  const sendTransacEmail = vi.fn();
  const sender = new BrevoEmailSender(
    {
      apiKey: KEY,
      from: { email: 'cybersetor-mail@netvitae.org', name: 'CyberSetor' },
      allowedRecipients: ['equipe.org'],
      sandbox: false,
      ...overrides,
    },
    { sendTransacEmail },
  );
  return { sender, sendTransacEmail };
}

async function failure(sender: BrevoEmailSender): Promise<EmailDeliveryError> {
  return (await sender.send(message).catch((error: unknown) => error)) as EmailDeliveryError;
}

describe('BrevoEmailSender', () => {
  it('envia com remetente, corpo e etiqueta', async () => {
    const { sender, sendTransacEmail } = setup();
    sendTransacEmail.mockResolvedValue({ messageId: '<id@relay>' });

    await expect(sender.send(message)).resolves.toEqual({ messageId: '<id@relay>' });
    expect(sendTransacEmail).toHaveBeenCalledWith({
      sender: { email: 'cybersetor-mail@netvitae.org', name: 'CyberSetor' },
      to: [{ email: 'ana@equipe.org' }],
      subject: 'Assunto',
      htmlContent: '<p>Texto</p>',
      textContent: 'Texto',
      tags: ['VENCIMENTO'],
    });
  });

  it('liga o modo sandbox pelo cabeçalho do Brevo', async () => {
    const { sender, sendTransacEmail } = setup({ sandbox: true });
    sendTransacEmail.mockResolvedValue({ messageId: 'x' });

    await sender.send(message);

    expect(sendTransacEmail.mock.calls[0][0]).toMatchObject({
      headers: { 'X-Sib-Sandbox': 'drop' },
    });
  });

  it('só aceita destinatário da lista', () => {
    const { sender } = setup();
    expect(sender.accepts('ana@equipe.org')).toBe(true);
    expect(sender.accepts('nucleo@cybersetor.test')).toBe(false);
  });

  it('timeout é falha incerta', async () => {
    const { sender, sendTransacEmail } = setup();
    sendTransacEmail.mockRejectedValue(new BrevoTimeoutError('Timeout'));

    await expect(failure(sender)).resolves.toMatchObject({
      code: 'BREVO_TIMEOUT',
      uncertain: true,
    });
  });

  it('429 é falha definida, que pode repetir', async () => {
    const { sender, sendTransacEmail } = setup();
    sendTransacEmail.mockRejectedValue(new BrevoError({ statusCode: 429 }));

    await expect(failure(sender)).resolves.toMatchObject({ code: 'BREVO_429', uncertain: false });
  });

  it('o erro não carrega a chave nem o corpo da resposta', async () => {
    const { sender, sendTransacEmail } = setup();
    sendTransacEmail.mockRejectedValue(
      new BrevoError({ message: `chave ${KEY} recusada`, statusCode: 401, body: { key: KEY } }),
    );

    const error = await failure(sender);

    expect(JSON.stringify({ ...error, message: error.message })).not.toContain(KEY);
  });
});
