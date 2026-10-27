import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

if (existsSync('.env.test')) {
  process.loadEnvFile('.env.test');
}

process.env.JWT_SECRET ||= 'segredo-dos-testes-de-ponta-a-ponta-com-mais-de-32-caracteres';
process.env.STORAGE_LOCAL_DIR ||= join(tmpdir(), 'cybersetor-e2e-anexos');

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
  },
});
