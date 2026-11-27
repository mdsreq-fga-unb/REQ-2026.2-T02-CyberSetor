import {
  BROWSER_SUPPORT_SCRIPT,
  BROWSER_SUPPORT_STYLE,
  UNSUPPORTED_ATTRIBUTE,
  UNSUPPORTED_NOTICE_ID,
  isBrowserSupported,
} from './browser-support';

const COLOR_MIX = { supports: (_p: string, v: string) => v.startsWith('color-mix(') };

// Safari anterior ao 16.4: não entende o bloco `static {}` que o Next 16 gera (causa do #329).
const SafariSemStaticBlock = function (this: unknown, ...args: string[]) {
  if (args.join(' ').includes('static {')) throw new SyntaxError("Unexpected token '{'");
  return Function(...args);
} as unknown as FunctionConstructor;

function runScript() {
  new Function(BROWSER_SUPPORT_SCRIPT)();
  return document.documentElement.hasAttribute(UNSUPPORTED_ATTRIBUTE);
}

describe('conferência de compatibilidade do navegador (#329)', () => {
  afterEach(() => {
    document.documentElement.removeAttribute(UNSUPPORTED_ATTRIBUTE);
    vi.unstubAllGlobals();
  });

  it('aceita navegador com bloco static e color-mix', () => {
    expect(isBrowserSupported({ Function, CSS: COLOR_MIX })).toBe(true);
  });

  it('recusa o navegador que não entende o bloco static, como o Safari do iOS 15', () => {
    expect(isBrowserSupported({ Function: SafariSemStaticBlock, CSS: COLOR_MIX })).toBe(false);
  });

  it('recusa o navegador sem color-mix ou sem CSS.supports', () => {
    expect(isBrowserSupported({ Function, CSS: { supports: () => false } })).toBe(false);
    expect(isBrowserSupported({ Function })).toBe(false);
  });

  it('o script inline marca o html só quando o navegador não tem suporte', () => {
    vi.stubGlobal('CSS', COLOR_MIX);
    expect(runScript()).toBe(false);

    vi.stubGlobal('CSS', { supports: () => false });
    expect(runScript()).toBe(true);
  });

  it('o estilo mostra só o aviso quando o html está marcado', () => {
    expect(BROWSER_SUPPORT_STYLE).toContain(
      `html[${UNSUPPORTED_ATTRIBUTE}] #${UNSUPPORTED_NOTICE_ID}{display:block!important}`,
    );
    expect(BROWSER_SUPPORT_STYLE).toContain(
      `html[${UNSUPPORTED_ATTRIBUTE}] body>:not(#${UNSUPPORTED_NOTICE_ID}){display:none!important}`,
    );
  });
});
