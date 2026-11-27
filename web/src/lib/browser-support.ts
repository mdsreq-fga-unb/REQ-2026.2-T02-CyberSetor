/**
 * Conferência de compatibilidade do navegador (#329, RNF15 e RNF16).
 *
 * O código gerado pelo Next.js 16 e o CSS do Tailwind v4 exigem Safari 16.4 ou mais recente
 * (bloco `static {}` em classe e `color-mix()`). Num iPhone com iOS anterior, o JavaScript
 * para no erro de sintaxe e a tela fica em "Carregando…" sem explicação. Esta conferência roda
 * num script inline no `<head>`, antes dos arquivos do Next, e marca o `<html>` para que a
 * página mostre o que fazer em vez do carregamento infinito.
 */

export const UNSUPPORTED_ATTRIBUTE = 'data-navegador-sem-suporte';
export const UNSUPPORTED_NOTICE_ID = 'navegador-sem-suporte';

export interface BrowserEnvironment {
  Function: FunctionConstructor;
  CSS?: { supports?: (property: string, value: string) => boolean };
}

// Vira texto no script inline: só sintaxe que o Safari 13.1 já entende (const, ?., catch sem
// variável). O bloco `static {}` fica numa string e só é avaliado dentro do `try`.
export function isBrowserSupported(env: BrowserEnvironment): boolean {
  try {
    new env.Function('class A { static { } }');
  } catch {
    return false;
  }
  const css = env.CSS;
  return (
    typeof css?.supports === 'function' && css.supports('color', 'color-mix(in srgb, red, blue)')
  );
}

export const BROWSER_SUPPORT_SCRIPT =
  `(function(){try{if(!(${isBrowserSupported.toString()})(window))` +
  `document.documentElement.setAttribute('${UNSUPPORTED_ATTRIBUTE}','')}catch(e){}})();`;

/** Sem a marca, o aviso fica oculto; com ela, só o aviso aparece. CSS simples, sem Tailwind. */
export const BROWSER_SUPPORT_STYLE =
  `html[${UNSUPPORTED_ATTRIBUTE}] #${UNSUPPORTED_NOTICE_ID}{display:block!important}` +
  `html[${UNSUPPORTED_ATTRIBUTE}] body>:not(#${UNSUPPORTED_NOTICE_ID}){display:none!important}`;
