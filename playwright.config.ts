import { defineConfig } from '@playwright/test';

const live = process.env.HEWBERRY_TEST_URL;
const baseURL = live ?? 'http://127.0.0.1:4317/hewberry-website-concept/';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  workers: 2,
  use: {
    baseURL,
    browserName: 'chromium',
    channel: process.env.HEWBERRY_BROWSER,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
    trace: 'retain-on-failure',
  },
  webServer: live ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4317',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 35_000,
  },
});
