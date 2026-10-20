import { render, screen } from '@testing-library/react';
import { Button } from './button';
import { Input } from './input';
import { Sheet, SheetContent, SheetTitle } from './sheet';

describe('alvos de toque de 48 px (RNF15)', () => {
  it('o botao padrao tem 48 px de altura', () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole('button', { name: 'Entrar' })).toHaveClass('h-12');
  });

  it('o botao de icone tem 48 px de lado', () => {
    render(<Button size="icon" aria-label="Abrir menu" />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveClass('size-12');
  });

  it('o botao grande nao fica menor que o padrao', () => {
    render(<Button size="lg">Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('h-14');
  });

  it('o botao de fechar do menu lateral tem 48 px de lado', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(await screen.findByRole('button', { name: 'Fechar' })).toHaveClass('size-12');
  });

  it('o campo de texto tem 48 px de altura', () => {
    render(<Input aria-label="E-mail" />);
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveClass('h-12');
  });
});
