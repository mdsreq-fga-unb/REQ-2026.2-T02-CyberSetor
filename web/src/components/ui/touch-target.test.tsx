import { render, screen } from '@testing-library/react';
import { Button } from './button';
import { Dialog, DialogContent, DialogTitle } from './dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
import { Input } from './input';
import { NativeSelect, NativeSelectOption } from './native-select';
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

  it('o botao de fechar do dialogo tem 48 px de lado', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Nova conta</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(await screen.findByRole('button', { name: 'Fechar' })).toHaveClass('size-12');
  });

  it('a lista de opcoes tem 48 px de altura', () => {
    render(
      <NativeSelect aria-label="Perfil">
        <NativeSelectOption value="a">A</NativeSelectOption>
      </NativeSelect>,
    );
    expect(screen.getByRole('combobox', { name: 'Perfil' })).toHaveClass('h-12');
  });

  it('o item de menu tem 48 px de altura', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuItem>Mudar perfil</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(await screen.findByRole('menuitem', { name: 'Mudar perfil' })).toHaveClass('min-h-12');
  });
});
