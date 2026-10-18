import { defineConfig } from '@playwright/test';
import { PARITY_LAUNCH_ARGS, PARITY_PROJECTS } from './scenarios/parity-projects';

// Parity runs (phase 02+): local build vs committed live baselines. Same projects, SwiftShader
// args and dpr 1 as tools/recovery/capture-live-baselines.mjs; the scenario list lives in
// tests/parity/scenarios/parity-scenarios.ts. Run: npx playwright test -c tests/parity/playwright.parity.config.ts
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.parity.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 15 * 60_000,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/baselines/live/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: PARITY_PROJECTS.map((p) => ({
    name: p.name,
    use: {
      browserName: 'chromium' as const,
      viewport: p.viewport,
      deviceScaleFactor: p.deviceScaleFactor,
      isMobile: p.isMobile,
      hasTouch: p.hasTouch,
      locale: 'vi-VN',
      timezoneId: 'Asia/Ho_Chi_Minh',
      launchOptions: { args: PARITY_LAUNCH_ARGS },
    },
  })),
  webServer: {
    command: 'npm run build:test && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
