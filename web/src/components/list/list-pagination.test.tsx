import { cleanup, fireEvent, render, renderHook, screen, act } from '@testing-library/react';
import { useState } from 'react';
import { ListPagination } from './list-pagination';
import { usePagination } from './use-pagination';

const ROWS = Array.from({ length: 42 }, (_, index) => `linha ${index + 1}`);

function Harness({ rows }: { rows: string[] }) {
  const pagination = usePagination(rows);
  return (
    <>
      <ul aria-label="Linhas">
        {pagination.pageRows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      <ListPagination pagination={pagination} />
    </>
  );
}

function Shrinking() {
  const [rows, setRows] = useState(ROWS);
  return (
    <>
      <button onClick={() => setRows(ROWS.slice(0, 15))}>Encolher</button>
      <button onClick={() => setRows(ROWS)}>Crescer</button>
      <Harness rows={rows} />
    </>
  );
}

describe('paginacao de lista', () => {
  afterEach(cleanup);

  it('mostra a primeira pagina, o intervalo e os botoes de 48 px num nav rotulado', () => {
    render(<Harness rows={ROWS} />);

    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent('1–10 de 42');
    expect(nav).toHaveTextContent('1 de 5');
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toHaveClass('size-12');
  });

  it('avanca, vai para a ultima e volta para a primeira', () => {
    render(<Harness rows={ROWS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByRole('status')).toHaveTextContent('11–20 de 42');

    fireEvent.click(screen.getByRole('button', { name: 'Última página' }));
    expect(screen.getByRole('status')).toHaveTextContent('41–42 de 42');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Primeira página' }));
    expect(screen.getByRole('status')).toHaveTextContent('1–10 de 42');
  });

  it('trocar itens por pagina volta para a primeira pagina', () => {
    render(<Harness rows={ROWS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '25' } });

    expect(screen.getByRole('status')).toHaveTextContent('1–25 de 42');
    expect(screen.getAllByRole('listitem')).toHaveLength(25);
  });

  it('lista que encolhe nao deixa a pagina vazia', () => {
    render(<Shrinking />);

    fireEvent.click(screen.getByRole('button', { name: 'Última página' }));
    fireEvent.click(screen.getByRole('button', { name: 'Encolher' }));

    expect(screen.getByRole('status')).toHaveTextContent('11–15 de 15');
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('depois de encolher e crescer, fica na pagina que estava a vista', () => {
    render(<Shrinking />);

    fireEvent.click(screen.getByRole('button', { name: 'Última página' }));
    fireEvent.click(screen.getByRole('button', { name: 'Encolher' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crescer' }));

    expect(screen.getByRole('status')).toHaveTextContent('11–20 de 42');
  });

  it('some quando todos os registros cabem no menor tamanho de pagina', () => {
    render(<Harness rows={ROWS.slice(0, 10)} />);

    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
  });

  it('sem dados ainda, o hook devolve pagina vazia sem erro', () => {
    const { result } = renderHook(() => usePagination<string>(undefined));

    expect(result.current).toMatchObject({ total: 0, page: 1, pageCount: 1, pageRows: [] });
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(1);
  });
});
