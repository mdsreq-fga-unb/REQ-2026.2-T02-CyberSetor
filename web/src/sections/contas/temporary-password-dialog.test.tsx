import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { TemporaryPasswordResult } from '@/types/contas';
import { TemporaryPasswordDialog } from './temporary-password-dialog';

const RESULT: TemporaryPasswordResult = {
  conta: {
    id: 'a',
    pessoaId: 'p',
    nome: 'Bia Educadora',
    emailLogin: 'bia@instituto.org.br',
    perfil: 'NUCLEO_PEDAGOGICO',
    ativo: true,
    versao: 1,
    deveTrocarSenha: true,
    bloqueadoAte: null,
    ultimoAcessoEm: null,
    setor: null,
  },
  senhaTemporaria: 'Temporaria-123456',
};

function renderDialog(onClose = vi.fn()) {
  render(<TemporaryPasswordDialog open result={RESULT} title="Conta criada" onClose={onClose} />);
  return onClose;
}

describe('senha temporaria', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('mostra a senha num campo rotulado e so fecha por Concluir', async () => {
    const onClose = renderDialog();

    expect(await screen.findByLabelText('Senha temporária')).toHaveValue('Temporaria-123456');
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('avisa quando a copia falha', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined });
    renderDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Copiar senha' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Não foi possível copiar; selecione a senha e copie manualmente.',
    );
  });

  it('confirma a copia quando o navegador permite', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    renderDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Copiar senha' }));

    expect(await screen.findByText('Senha copiada.')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith('Temporaria-123456');
  });
});
