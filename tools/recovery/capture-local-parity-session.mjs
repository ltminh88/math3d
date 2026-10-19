// Local parity gate for one project + scenario: serve dist/ under the live origin, run the
// scenario, compare with committed baselines: 'local' (default, generated from the renamed
// build) or 'live' (archived oracle + scene dumps, valid only at tag recovered-r180). Used by
// tests/parity/local-parity.spec.ts; the CLI equivalent is capture-live-baselines.mjs --origin local.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARITY_PROJECTS } from '../../tests/parity/scenarios/parity-projects.ts';
import { PARITY_SCENARIOS } from '../../tests/parity/scenarios/parity-scenarios.ts';
import { compareWithBaselines } from './capture-baseline-compare.mjs';
import { loadLocalFiles } from './capture-local-routes.mjs';
import { runScenario } from './capture-parity-run-scenario.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
let localFiles = null;

export async function runLocalParityScenario({
  browser,
  projectName,
  scenarioId,
  outDir,
  baselines = 'local',
}) {
  const project = PARITY_PROJECTS.find((p) => p.name === projectName);
  const scenario = PARITY_SCENARIOS.find((s) => s.id === scenarioId);
  if (!project || !scenario) throw new Error(`unknown ${projectName}/${scenarioId}`);
  localFiles ??= loadLocalFiles(join(root, 'dist'));
  await runScenario(browser, project, scenario, outDir, [], localFiles);
  return compareWithBaselines(root, projectName, [scenarioId], outDir, { scenes: true, baselines });
}
