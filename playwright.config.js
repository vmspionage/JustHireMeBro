import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.js',
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 900 },
    baseURL: 'http://127.0.0.1:12321/',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  retries: 0,
  workers: 1,
});
