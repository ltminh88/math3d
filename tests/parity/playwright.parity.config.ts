import { defineConfig } from '@playwright/test';
import { PARITY_LAUNCH_ARGS, PARITY_PROJECTS } from './scenarios/parity-projects';

// Parity runs: local build vs committed local baselines (PARITY_BASELINES=live: archived live
// baselines, npm run test:parity:live, valid only at tag recovered-r180). Same projects, SwiftShader
// args and dpr 1 as tools/recovery/capture-live-baselines.mjs; the scenario list lives in
// tests/parity/scenarios/parity-scenarios.ts. Run: npm run test:parity
// dist/ is built by the global setup and served under the live origin via Playwright routing
// (tools/recovery/capture-local-routes.mjs), so no web server is needed.
export default defineConfig({
  testDir: '.',
  testMatch: 'local-parity.spec.ts',
  globalSetup: './parity-build-global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 15 * 60_000,
  reporter: 'list',
  use: { trace: 'off' },
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
});
