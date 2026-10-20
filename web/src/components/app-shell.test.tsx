import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('mostra cabecalho, navegacao, botao de menu para celular e o conteudo', () => {
    render(
      <AppShell>
        <p>conteudo da pagina</p>
      </AppShell>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegacao principal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('conteudo da pagina');
  });
});
