import { defineConfig, devices } from '@playwright/test';

// SwiftShader keeps WebGL available in headless CI; e2e asserts state, not pixels.
const webglArgs = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    launchOptions: { args: webglArgs },
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: webglArgs } },
    },
    {
      name: 'mobile-pixel',
      use: { ...devices['Pixel 7'], hasTouch: true, launchOptions: { args: webglArgs } },
    },
  ],
  webServer: {
    command: 'npm run build:test && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
