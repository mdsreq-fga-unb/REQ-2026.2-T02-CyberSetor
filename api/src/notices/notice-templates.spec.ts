import { blockedReportEmail, goalDigestEmail } from './notice-templates.js';

const line = (texto: string, url: string | null = null) => ({ texto, url });
const EMPTY = { avisos: [], vencidas: [], vencendo: [], semResponsavel: [] };

describe('modelos de e-mail', () => {
  it('o resumo só mostra as seções com item e conta no assunto', () => {
    const email = goalDigestEmail({
      ...EMPTY,
      vencidas: [line('P01, meta 1', 'https://app.test/p1')],
      vencendo: [line('P01, meta 2')],
    });

    expect(email.subject).toBe('2 avisos de metas');
    expect(email.html).toContain('Vencidas');
    expect(email.html).toContain('Vencem em até 30 dias');
    expect(email.html).not.toContain('Sem responsável');
    expect(email.html).toContain('href="https://app.test/p1"');
    expect(email.text).toContain('- P01, meta 1\n  https://app.test/p1');
  });

  it('usa o singular com um item', () => {
    const { subject } = goalDigestEmail({ ...EMPTY, semResponsavel: [line('P01, meta 1')] });

    expect(subject).toBe('1 aviso de meta');
  });

  it('escapa o texto cadastrado no HTML e mantém o original no texto', () => {
    const { html, text } = goalDigestEmail({
      ...EMPTY,
      avisos: [line('P01, meta 1: Revisar <b>"lista"</b> & ata')],
    });

    expect(html).toContain('Revisar &lt;b&gt;&quot;lista&quot;&lt;/b&gt; &amp; ata');
    expect(html).not.toContain('<b>"');
    expect(text).toContain('Revisar <b>"lista"</b> & ata');
  });

  it('todo modelo identifica o Instituto, em pt-BR, sem variável crua', () => {
    const emails = [
      goalDigestEmail({ ...EMPTY, vencidas: [line('x')] }),
      blockedReportEmail({
        projeto: 'P01',
        periodo: '01/01/2025 a 30/06/2025',
        pendencias: ['x'],
        url: 'https://app.test/p1',
      }),
    ];

    for (const { html, text } of emails) {
      expect(html).toContain('lang="pt-BR"');
      expect(html).toContain('Instituto No Setor');
      expect(text).toContain('Instituto No Setor');
      expect(html).not.toContain('{{');
    }
  });

  it('o relatório bloqueado lista o que falta e o caminho até o projeto', () => {
    const { subject, text, html } = blockedReportEmail({
      projeto: 'P01',
      periodo: '01/01/2025 a 30/06/2025',
      pendencias: ['Meta 1: sem justificativa.'],
      url: 'https://app.test/p1',
    });

    expect(subject).toBe('Relatório do P01 bloqueado');
    expect(text).toContain('Meta 1: sem justificativa.');
    expect(html).toContain('Abrir no CyberSetor');
  });
});
