import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

if (existsSync('.env.test')) {
  process.loadEnvFile('.env.test');
}

process.env.JWT_SECRET ||= 'segredo-dos-testes-de-ponta-a-ponta-com-mais-de-32-caracteres';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
  },
});
