import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, 'e2e/.env.e2e') })

const PORT = process.env.E2E_PORT ?? 3000
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  projects: [
    { name: 'setup', testMatch: /\.setup\.ts$/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/citizen.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/citizen.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 240_000 : 120_000,
  },
})
