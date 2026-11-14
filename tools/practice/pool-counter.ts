// Pool counter CLI (phase 01): writes the before-report (or prints raw counts with
// `--json`). The counting itself lives in `pool-counting.ts`.
// Run: `npx tsx tools/practice/pool-counter.ts` (writes the before-report) or with
// `--json` (prints the raw counts).
import { writeFileSync } from 'node:fs';
import { SKILL_CATALOG } from '../../src/learning/skill-catalog';
import type { SkillTier } from '../../src/learning/skill-tiers';
import {
  countFactPool,
  countSkill,
  countStoryContexts,
  FACT_POOLS,
  type PoolCount,
} from './pool-counting';

const TIERS: readonly SkillTier[] = [1, 2, 3];

function run(): void {
  const json = process.argv.includes('--json');
  const skills = SKILL_CATALOG.map((s) => ({
    id: s.id,
    family: s.family,
    lesson: s.lesson,
    tiers: TIERS.map((tier) => ({ tier, ...countSkill(s.id, tier) })),
    contexts: s.family === 'word-problem' ? countStoryContexts(s.id, 1) : undefined,
  }));
  const facts = FACT_POOLS.map((p) => ({
    level: p.level,
    size: p.pool.length,
    ...countFactPool(p.pool),
  }));
  if (json) {
    console.log(JSON.stringify({ skills, facts }, null, 2));
    return;
  }
  const cell = (r: PoolCount) => `${r.distinct} (med ${r.medianBeforeRepeat ?? '>1000'})`;
  const lines = [
    '# Pool counts — before (phase 01)',
    '',
    'Measured with `tools/practice/pool-counter.ts`: 10,000 seeded draws per skill × tier',
    '(seed 20261113) and per fact pool. A signature is the visible prompt (story key +',
    'params, every step prompt + correct answer, and the scene for geometry/measurement);',
    'wrong options are not part of a signature. `median before repeat` is the median draws',
    'before an exact repeat over 20 trials (cap 1000; `>1000` means more than half the',
    'trials never repeated within the cap).',
    '',
    '## Skills',
    '',
    '| skill | family | tier 1 | tier 2 | tier 3 | story contexts (wp only) |',
    '|---|---|---|---|---|---|',
    ...skills.map(
      (s) =>
        `| ${s.id} | ${s.family} | ${cell(s.tiers[0] as PoolCount)} | ${cell(s.tiers[1] as PoolCount)} | ${cell(s.tiers[2] as PoolCount)} | ${s.contexts?.join(', ') ?? '—'} |`,
    ),
    '',
    '## Fact pools (mul/div)',
    '',
    '| level | pool size | distinct in 10,000 draws | median before repeat |',
    '|---|---|---|---|',
    ...facts.map(
      (f) => `| ${f.level} | ${f.size} | ${f.distinct} | ${f.medianBeforeRepeat ?? '>1000'} |`,
    ),
    '',
    '## Before / after (phase 02 fills the "after" column)',
    '',
    '| skill × tier | before | after |',
    '|---|---|---|',
    ...skills.flatMap((s) => s.tiers.map((t) => `| ${s.id} × t${t.tier} | ${t.distinct} | |`)),
  ];
  const path = 'plans/261113-1951-more-practice-content-for-muse/reports/pool-counts-before.md';
  writeFileSync(path, `${lines.join('\n')}\n`);
  console.log(`wrote ${path}`);
}

if (process.argv[1]?.endsWith('pool-counter.ts')) run();
