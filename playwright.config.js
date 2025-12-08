// @ts-check
import { defineConfig, devices } from '@playwright/test';

/* global process */

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    timeout: 30000,
  },

  /* Используем только Chromium и Firefox в CI, локально все браузеры */
  projects: process.env.CI ? [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ] : [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: process.env.CI 
      ? 'npm run build && npm run serve'  // В CI: сборка + статический сервер
      : 'npm run dev',                    // Локально: dev-сервер
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});