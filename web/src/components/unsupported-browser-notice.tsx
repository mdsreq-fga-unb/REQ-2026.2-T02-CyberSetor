import { UNSUPPORTED_NOTICE_ID } from '@/lib/browser-support';

// Estilos em linha: o aviso aparece justamente quando o CSS do Tailwind pode não funcionar.
const box = {
  display: 'none',
  maxWidth: '36rem',
  margin: '0 auto',
  padding: '1.5rem',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '1.125rem',
  lineHeight: 1.5,
  color: '#111',
  background: '#fff',
} as const;

/**
 * Aviso para navegador sem suporte (#329). Fica oculto e só aparece quando o script de
 * conferência marca o `<html>` (ver `lib/browser-support.ts`). Sem JavaScript, o `<noscript>`
 * explica o motivo no lugar do "Carregando…".
 */
export function UnsupportedBrowserNotice() {
  return (
    <>
      <div id={UNSUPPORTED_NOTICE_ID} style={box}>
        <h1 style={{ fontSize: '1.375rem', margin: '0 0 0.75rem' }}>
          Este navegador não consegue abrir o CyberSetor
        </h1>
        <p style={{ margin: '0 0 0.75rem' }}>
          O sistema funciona nas versões atuais do Chrome, do Safari, do Edge e do Firefox.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>No iPhone:</strong> atualize o iOS para a versão 16.4 ou mais recente, em
            Ajustes › Geral › Atualização de Software, e abra o link no Safari.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>No Android:</strong> atualize o Chrome pela Play Store e abra o link nele.
          </li>
          <li>
            Se não for possível atualizar, use outro celular ou um computador, ou procure a equipe
            do Instituto.
          </li>
        </ul>
      </div>
      <noscript>
        <p style={{ ...box, display: 'block' }}>
          O CyberSetor precisa do JavaScript ativado. Ative o JavaScript no navegador e recarregue a
          página.
        </p>
      </noscript>
    </>
  );
}
