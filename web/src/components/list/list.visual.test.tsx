import { FileTextIcon } from 'lucide-react';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPagination } from './list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from './list-states';

const PAGINATION = {
  page: 2,
  pageCount: 5,
  pageSize: 10,
  total: 42,
  start: 11,
  end: 20,
  setPage: () => undefined,
  setPageSize: () => undefined,
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="frame" className="bg-background p-4 text-foreground">
      {children}
    </div>
  );
}

describe.each([
  ['celular', 360],
  ['desktop', 1280],
])('estados da lista no %s', (device, width) => {
  beforeEach(async () => {
    await page.viewport(width, 800);
  });

  it('carregando, com cabecalho e paginacao', async () => {
    const screen = await render(
      <Frame>
        <ListCard>
          <Table aria-busy>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Pessoa</TableHead>
                <TableHead scope="col">Perfil</TableHead>
                <TableHead scope="col">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton columns={3} />
            </TableBody>
          </Table>
          <ListPagination pagination={PAGINATION} />
        </ListCard>
      </Frame>,
    );

    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`carregando-${device}`);
  });

  it('vazio com acao e erro', async () => {
    const screen = await render(
      <Frame>
        <div className="flex flex-col gap-4">
          <ListEmpty
            icon={FileTextIcon}
            title="Nenhum instrumento cadastrado"
            description="Cadastre o edital, a emenda ou a parceria que financia cada projeto."
            action={<Button>Novo instrumento</Button>}
          />
          <ListError message="Não foi possível carregar os instrumentos. Tente de novo." />
        </div>
      </Frame>,
    );

    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`vazio-erro-${device}`);
  });
});
