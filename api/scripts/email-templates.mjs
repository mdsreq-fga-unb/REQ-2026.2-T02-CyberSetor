// Gera src/notices/templates/compiled.ts a partir dos modelos MJML e de texto.
// O MJML roda por pnpm dlx, com versão fixa, para não entrar nas dependências nem na imagem.
// Uso: node scripts/email-templates.mjs [--check]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const MJML = 'mjml@5.4.1';
const dir = resolve(import.meta.dirname, '../src/notices/templates');
const target = join(dir, 'compiled.ts');
const sources = readdirSync(dir)
  .filter((file) => file.endsWith('.mjml') && !file.startsWith('_'))
  .sort();

const out = mkdtempSync(join(tmpdir(), 'email-templates-'));
try {
  execFileSync(
    'pnpm',
    [
      'dlx',
      MJML,
      ...sources,
      '-o',
      `${out}/`,
      '--config.allowIncludes',
      'true',
      '--config.includePath',
      dir,
      '--config.validationLevel',
      'strict',
      '--config.keepComments',
      'false',
      '--config.minify',
      'true',
    ],
    { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] },
  );

  const entries = sources.map((file) => {
    const name = basename(file, '.mjml');
    const html = readFileSync(join(out, `${name}.html`), 'utf8');
    const text = readFileSync(join(dir, `${name}.txt`), 'utf8');
    return `  ${JSON.stringify(name)}: {\n    html: ${JSON.stringify(html)},\n    text: ${JSON.stringify(text)},\n  },`;
  });

  const output = `// Gerado por scripts/email-templates.mjs. Não editar: altere os .mjml e .txt desta pasta.
export const COMPILED_TEMPLATES = {
${entries.join('\n')}
} as const;
`;

  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== output) {
      console.error('Modelos de e-mail desatualizados: rode pnpm email:build');
      process.exitCode = 1;
    }
  } else {
    writeFileSync(target, output);
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
