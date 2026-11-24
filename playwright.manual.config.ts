// Manual-run config (TASK R18): runs the 81-lesson manual walkthrough script in
// tools/lesson-walkthrough/ with the same projects/webServer as the main config.
// CI never uses this file (its testDir is tests/e2e); the reviewer runs:
//   E2E_PORT=4181 npx playwright test --config playwright.manual.config.ts \
//     --project=desktop-chromium --workers=1
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({ ...base, testDir: 'tools/lesson-walkthrough' });
