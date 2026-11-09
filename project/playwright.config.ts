import { defineConfig, devices } from '@playwright/test';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/EthioAgri';
export default defineConfig({
  testDir: './tests', fullyParallel: true, retries: process.env.CI ? 1 : 0,
  reporter: 'list', use: { baseURL: `http://127.0.0.1:3100${basePath}/`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: { command: `node scripts/preview.mjs --port 3100 --base-path ${basePath}`, url: `http://127.0.0.1:3100${basePath}/`, reuseExistingServer: !process.env.CI },
});
