import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  // Single worker: the demo app holds one shared in-memory store and tests reset it,
  // so they must not interleave. Revisit with per-test data namespacing as the suite grows.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node demo-app/server.js',
    // Derived from env.baseUrl (not a raw HTTP `url` check) because the demo app has
    // no route at "/" — it 404s there, and Playwright's url-based readiness check
    // only accepts 2xx/3xx. A port-based TCP check plus PORT below keeps the spawned
    // server's actual port in sync with baseUrl without depending on "/" responding.
    port: Number(new URL(env.baseUrl).port) || 3000,
    env: { PORT: new URL(env.baseUrl).port || '3000' },
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      testDir: './tests/donor',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/donor',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/donor',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup-firefox',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'setup-webkit',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'admin',
      testDir: './tests/admin',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/admin-setup.json' },
      dependencies: ['setup'],
    },
    {
      name: 'admin-firefox',
      testDir: './tests/admin',
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/admin-setup-firefox.json' },
      dependencies: ['setup-firefox'],
    },
    {
      name: 'admin-webkit',
      testDir: './tests/admin',
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/admin-setup-webkit.json' },
      dependencies: ['setup-webkit'],
    },
  ],
});
