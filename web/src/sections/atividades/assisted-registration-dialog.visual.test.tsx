import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import { AssistedRegistrationDialog } from './assisted-registration-dialog';

const ACTIVITY: Activity = {
  id: '00000000-0000-4000-8000-000000000060',
  versao: 1,
  projetoId: '00000000-0000-4000-8000-000000000010',
  titulo: 'Oficina de Expressão Corporal',
  modalidade: { id: 'm1', nome: 'Expressão', ativo: true },
  responsavel: { id: 'u1', nome: 'Carla', ativo: true },
  data: '2026-11-20',
  horaInicio: '14:00',
  horaFim: '16:00',
  cargaHorariaMinutos: 120,
  local: 'Galpão Cultural',
  inscricao: { aberta: true, vagas: 20, inscritos: 15, emEspera: 0 },
  metas: [],
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 900],
  ['desktop', 1280, 800],
])('inscrição presencial assistida no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          return json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false });
        }
        if (url.includes('/registration')) {
          return json({
            atividadeId: ACTIVITY.id,
            versao: 1,
            aberta: true,
            vagas: 20,
            camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
            camposAdicionais: ['CPF', 'EMAIL'],
            campoDuplicidade: 'CPF',
            codigoPublico: 'abc-visual',
            linkPublico: '/inscrever/abc-visual',
          });
        }
        if (url.includes('/public/registrations/')) {
          return json({
            atividade: { titulo: ACTIVITY.titulo, data: ACTIVITY.data, local: ACTIVITY.local },
            aberta: true,
            vagasEsgotadas: false,
            listaEspera: true,
            camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
            camposAdicionais: ['CPF', 'EMAIL'],
            aviso: {
              versao: '2026-10-30-provisoria',
              texto:
                'O Instituto Cultural e Social No Setor usa os dados deste formulário para a sua inscrição.',
            },
            termo: null,
            apresentacao: null,
            prazoInscricao: null,
            prazoHora: null,
            contatoWhatsapp: null,
          });
        }
        return json({});
      }),
    );
    await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('exibe diálogo de inscrição assistida com campos e aviso LGPD', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await render(
      <QueryClientProvider client={client}>
        <AssistedRegistrationDialog open activity={ACTIVITY} onClose={() => undefined} />
      </QueryClientProvider>,
    );

    await expect.element(page.getByText('Inscrição Presencial Assistida')).toBeVisible();
    await expect.element(page.getByRole('dialog')).toMatchScreenshot(`inscricao-assistida-${device}`);
  });
});
