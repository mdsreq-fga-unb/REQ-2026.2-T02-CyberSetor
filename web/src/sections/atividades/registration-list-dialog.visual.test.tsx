import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import type { RegisteredPerson, RegistrationList } from '@/types/inscricoes';
import { RegistrationListDialog } from './registration-list-dialog';

const ACTIVITY = {
  id: '00000000-0000-4000-8000-000000000061',
  titulo: 'Oficina de serigrafia',
} as Activity;

function person(index: number, nome: string, espera: number | null): RegisteredPerson {
  return {
    id: `inscricao-${index}`,
    participanteId: `participante-${index}`,
    nome,
    idade: espera === 2 ? 14 : 20 + index,
    menor: espera === 2,
    telefone: `6199999${String(index).padStart(4, '0')}`,
    email: null,
    situacao: espera === null ? 'CONFIRMADA' : 'LISTA_ESPERA',
    posicaoEspera: espera,
    inscritoEm: `2026-10-2${index}T13:0${index}:00.000Z`,
    autorizaComunicados: index % 2 === 0,
    autorizaImagem: index === 0,
    responsavelNome: espera === 2 ? 'Carla Mendes' : null,
    responsavelTelefone: espera === 2 ? '61988887777' : null,
    cancelamento: null,
    cadastroExistente: null,
  };
}

const LIST: RegistrationList = {
  vagas: 3,
  confirmadas: 2,
  emEspera: 2,
  canceladas: 1,
  inscricoes: [
    person(0, 'Ana Souza', null),
    { ...person(1, 'Bruno Lima', null), cadastroExistente: 'REAPROVEITADO' },
    { ...person(2, 'Davi Rocha', 1), cadastroExistente: 'CPF' },
    person(3, 'Elisa Mendes', 2),
    {
      ...person(4, 'Fábio Costa', null),
      situacao: 'CANCELADA',
      cancelamento: { pedidoEm: '2026-10-29', canal: 'WHATSAPP' },
    },
  ],
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 900],
  ['desktop', 1280, 800],
])('inscritos da atividade no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false })
          : json(LIST),
      ),
    );
    await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('vagas confirmadas e lista de espera com posicao, menor e responsavel', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await render(
      <QueryClientProvider client={client}>
        <RegistrationListDialog open activity={ACTIVITY} editable onClose={() => undefined} />
      </QueryClientProvider>,
    );

    await expect.element(page.getByText('Elisa Mendes')).toBeVisible();
    await expect.element(page.getByRole('dialog')).toMatchScreenshot(`inscritos-${device}`);
  });
});
