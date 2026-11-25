import axe from 'axe-core';
import './src/app/globals.css';

document.documentElement.lang = 'pt-BR';
document.documentElement.classList.add('antialiased');
document.documentElement.style.setProperty('--font-sans', 'ui-sans-serif, system-ui, sans-serif');

/*
 * Conferências comuns a todas as telas dos testes visuais, em cada navegador e largura:
 * - RNF15: sem rolagem horizontal e sem violação automática da WCAG 2.1 A e AA (axe-core);
 * - RNF16: sem erro de script.
 * Rodam depois de cada teste, com a tela do teste ainda montada.
 */

const scriptErrors: string[] = [];
window.addEventListener('error', (event) => scriptErrors.push(event.message));
window.addEventListener('unhandledrejection', (event) =>
  scriptErrors.push(`Promise rejeitada: ${String(event.reason)}`),
);

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

afterEach(async () => {
  const errors = scriptErrors.splice(0);
  expect(errors, 'erros de script (RNF16)').toEqual([]);

  const root = document.documentElement;
  expect(root.scrollWidth, 'rolagem horizontal (RNF15, RNF16)').toBeLessThanOrEqual(
    root.clientWidth,
  );

  const { violations } = await axe.run(document.body, {
    runOnly: { type: 'tag', values: WCAG_21_AA },
  });
  expect(
    violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
    ),
    'violações da WCAG 2.1 AA pelo axe-core (RNF15)',
  ).toEqual([]);
});
