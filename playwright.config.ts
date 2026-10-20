import { defineConfig, devices } from '@playwright/test'

const CI = Boolean(process.env.CI)

/**
 * End-to-end tests for the three core journeys in docs/PRD.md, against a
 * production build (`vite preview`). Each test starts in a fresh browser
 * profile, so the app opens on the sample data as a first visit.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // Locally, use the installed Chrome instead of downloading a browser; CI installs Chromium.
        channel: CI ? undefined : 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
