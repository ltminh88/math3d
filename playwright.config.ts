import { defineConfig, devices } from '@playwright/test';

// SwiftShader keeps WebGL available in headless CI; e2e asserts state, not pixels.
// E2E_PORT lets parallel worktrees run e2e side by side without reusing each other's server.
const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://localhost:${port}`;
const webglArgs = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

type Device = (typeof devices)[string];
/** Keep the iPad viewport/UA/touch but run it on Chromium (the only engine installed). */
function tablet(device: Device) {
  const { defaultBrowserType: _webkit, ...rest } = device;
  return { ...rest, browserName: 'chromium' as const, hasTouch: true, isMobile: true };
}

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
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
    // iPad Pro 11 viewports on Chromium: touch + coarse pointer, same SwiftShader WebGL.
    {
      name: 'tablet-portrait',
      use: { ...tablet(devices['iPad Pro 11']), launchOptions: { args: webglArgs } },
    },
    {
      name: 'tablet-landscape',
      use: { ...tablet(devices['iPad Pro 11 landscape']), launchOptions: { args: webglArgs } },
    },
  ],
  webServer: {
    command: `npm run build:test && npm run preview -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
