import { cleanup, render, screen } from '@testing-library/react';
import { UNSUPPORTED_NOTICE_ID } from '@/lib/browser-support';
import { UnsupportedBrowserNotice } from './unsupported-browser-notice';

describe('aviso de navegador sem suporte (#329)', () => {
  afterEach(cleanup);

  it('fica oculto por padrão e diz o que fazer no iPhone e no Android', () => {
    const { container } = render(<UnsupportedBrowserNotice />);
    const notice = container.querySelector(`#${UNSUPPORTED_NOTICE_ID}`) as HTMLElement;

    expect(notice.style.display).toBe('none');
    expect(screen.getByText('Este navegador não consegue abrir o CyberSetor')).toBeInTheDocument();
    expect(notice).toHaveTextContent('iOS para a versão 16.4 ou mais recente');
    expect(notice).toHaveTextContent('atualize o Chrome pela Play Store');
  });
});
