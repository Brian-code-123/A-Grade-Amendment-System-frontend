import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'
const isLocalBaseUrl = /127\.0\.0\.1|localhost/.test(baseURL)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  webServer: isLocalBaseUrl
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        port: 4173,
        timeout: 120_000,
        reuseExistingServer: true,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
