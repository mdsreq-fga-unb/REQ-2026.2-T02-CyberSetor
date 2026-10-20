import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { RowActionsMenu } from './row-actions-menu';

describe('menu de acoes da linha', () => {
  afterEach(cleanup);

  it('abre pelo botao rotulado, separa a acao destrutiva e chama a acao escolhida', async () => {
    const edit = vi.fn();
    const remove = vi.fn();
    render(
      <RowActionsMenu
        label="Ações de Ana"
        actions={[
          { label: 'Desativar conta', onSelect: remove, destructive: true },
          { label: 'Mudar perfil', onSelect: edit },
        ]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Ações de Ana' });
    expect(trigger).toHaveClass('size-12');
    fireEvent.click(trigger);

    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Mudar perfil', 'Desativar conta']);
    expect(within(menu).getByRole('separator')).toBeInTheDocument();
    expect(items[1]).toHaveAttribute('data-variant', 'destructive');

    fireEvent.click(items[0]);
    expect(edit).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
  });

  it('sem acao destrutiva nao desenha separador', async () => {
    render(<RowActionsMenu label="Ações" actions={[{ label: 'Editar', onSelect: vi.fn() }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ações' }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).queryByRole('separator')).not.toBeInTheDocument();
  });
});
