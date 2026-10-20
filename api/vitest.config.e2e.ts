import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

if (existsSync('.env.test')) {
  process.loadEnvFile('.env.test');
}

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
  },
});
