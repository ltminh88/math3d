import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { runLocalParityScenario } from '../../tools/recovery/capture-local-parity-session.mjs';
import { PARITY_SCENARIOS } from './scenarios/parity-scenarios';

const baselines = process.env.PARITY_BASELINES === 'live' ? 'live' : 'local';

// Local build (dist/, built by parity-build-global-setup.ts) vs committed baselines:
// PARITY_BASELINES=local (default, tests/parity/baselines/local, generated from the renamed
// math3d build) or live (npm run test:parity:live; archived, valid only at tag recovered-r180).
// Gates per shot: canvas PNG + shot JSON + trace JSON + scene dumps exact; DOM PNG within the
// per-shot tolerance of parity-shot-tolerances.json (noisy shots gated structurally).
for (const scenario of PARITY_SCENARIOS) {
  test(`local parity: ${scenario.id}`, async ({ browser }, testInfo) => {
    const outDir = testInfo.outputPath('capture');
    mkdirSync(outDir, { recursive: true });
    const result = await runLocalParityScenario({
      browser,
      projectName: testInfo.project.name,
      scenarioId: scenario.id,
      outDir,
      baselines,
    });
    await testInfo.attach('parity-result.json', {
      body: JSON.stringify(result, null, 1),
      contentType: 'application/json',
    });
    for (const t of result.tolerated) console.log(`  TOLERATED ${JSON.stringify(t)}`);
    for (const p of result.problems) console.log(`  DIFF ${JSON.stringify(p)}`);
    expect(result.compared, 'compared artifacts').toBeGreaterThan(0);
    expect(result.problems, `capture kept at ${outDir}`).toEqual([]);
  });
}
