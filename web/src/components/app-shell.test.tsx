import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('mostra cabecalho, navegacao, botao de menu para celular e o conteudo', () => {
    render(
      <AppShell>
        <p>conteudo da pagina</p>
      </AppShell>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('conteudo da pagina');
  });

  it('fecha o menu do celular ao escolher um destino', async () => {
    render(
      <AppShell>
        <p>conteudo da pagina</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const menu = await screen.findByRole('dialog');
    fireEvent.click(within(menu).getByRole('link', { name: 'Início' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
