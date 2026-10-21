import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const VISUAL_TESTS = 'src/**/*.visual.test.tsx';
const remoteBrowser = process.env.PLAYWRIGHT_WS_ENDPOINT;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [VISUAL_TESTS],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [tailwindcss()],
        define: { 'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('http://localhost:3001/v1') },
        test: {
          name: 'visual',
          globals: true,
          include: [VISUAL_TESTS],
          setupFiles: ['./vitest.visual.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(
              remoteBrowser
                ? { connectOptions: { wsEndpoint: remoteBrowser, exposeNetwork: '<loopback>' } }
                : {},
            ),
            instances: [{ browser: 'chromium' }],
            expect: {
              toMatchScreenshot: {
                resolveScreenshotPath: ({
                  root,
                  testFileDirectory,
                  screenshotDirectory,
                  testFileName,
                  arg,
                  browserName,
                  ext,
                }) =>
                  `${root}/${testFileDirectory}/${screenshotDirectory}/${testFileName}/${arg}-${browserName}${ext}`,
                comparatorName: 'pixelmatch',
                comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.01 },
              },
            },
          },
        },
      },
    ],
  },
});
