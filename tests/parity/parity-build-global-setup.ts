import { execSync } from 'node:child_process';

// Build the local game once per parity run; the spec serves dist/ through Playwright routing
// under the live origin (no preview server). PARITY_SKIP_BUILD=1 reuses an existing dist/.
export default function buildLocalGame() {
  if (process.env.PARITY_SKIP_BUILD) return;
  execSync('npm run build:test', { stdio: 'inherit' });
}
