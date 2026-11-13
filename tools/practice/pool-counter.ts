// Pool counter (phase 01): distinct *visible prompts* per skill x tier and per mul/div
// fact pool. A signature is what a child recognises as "the same question": the story
// (key + params), every step's prompt (key + params) and its correct answer, and — for
// geometry/measurement — the whole scene. Wrong options are NOT part of a signature.
// Run: `npx tsx tools/practice/pool-counter.ts` (writes the before-report) or with
// `--json` (prints the raw counts).
import { writeFileSync } from 'node:fs';
import { geometryItemForSkill, isGeometrySkill } from '../../src/geometry/geometry-item-for-skill';
import type { GeoItem } from '../../src/geometry/geo-scene-types';
import { divFactsForTables, mulFactsForTables } from '../../src/learning/curriculum-tables';
import { mulberry32, pick, type Rng } from '../../src/learning/seeded-rng';
import { SKILL_CATALOG } from '../../src/learning/skill-catalog';
import type { SkillTier } from '../../src/learning/skill-tiers';
import { towerFactPool } from '../../src/levels/tower/tower-round-flow';
import { isMeasurementSkill, measurementItemForSkill } from '../../src/measurement/measurement-item-for-skill';
import { isReasoningSkill, reasoningItemForSkill } from '../../src/reasoning/reasoning-item-for-skill';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../../src/reasoning/reasoning-types';

const refSig = (ref: PromptRef): string => {
  const params = ref.params
    ? Object.entries(ref.params)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    : '';
  return `${ref.key}(${params})`;
};

const stepSig = (step: ReasoningStep): string => {
  if (step.kind === 'number') return `n:${refSig(step.prompt)}=${step.answer}`;
  if (step.kind === 'verdict')
    return `v:${refSig(step.prompt)}|${refSig(step.statement)}=${step.answer}${
      step.fix ? `|fix=${step.fix.answer}` : ''
    }`;
  const correct = step.options
    .filter((o) => o.correct)
    .map((o) => refSig(o.label))
    .sort();
  return `${step.kind}:${refSig(step.prompt)}|${step.options.length}|${correct.join('+')}`;
};

/** The visible prompt of one generated item, as a string. */
export function itemSignature(item: ReasoningItem): string {
  const base = `${item.skillId}|t${item.tier}|${refSig(item.story)}|${item.steps
    .map(stepSig)
    .join(';')}`;
  const scene = (item as GeoItem).scene;
  return scene ? `${base}|${JSON.stringify(scene)}` : base;
}

export function drawSkillItem(skillId: string, tier: SkillTier, rng: Rng): ReasoningItem {
  if (isReasoningSkill(skillId)) return reasoningItemForSkill(skillId, rng, tier);
  if (isGeometrySkill(skillId)) return geometryItemForSkill(skillId, rng, tier);
  return measurementItemForSkill(skillId, rng, tier);
}

export interface PoolCount {
  /** Distinct signatures seen in `draws` draws. */
  distinct: number;
  draws: number;
  /** Position of the first exact repeat in the 10,000-draw run (null = none seen). */
  firstRepeatAt: number | null;
  /** Median draws before an exact repeat over `trials` trials (null = > cap). */
  medianBeforeRepeat: number | null;
}

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2;
};

/** Counts a pool by drawing from it. `draw` returns one signature per call. */
export function countSignatures(
  draw: (rng: Rng) => string,
  opts: { draws?: number; trials?: number; cap?: number; seed?: number } = {},
): PoolCount {
  const { draws = 10_000, trials = 20, cap = 1000, seed = 20261113 } = opts;
  const seen = new Set<string>();
  let firstRepeatAt: number | null = null;
  const rng = mulberry32(seed);
  for (let i = 1; i <= draws; i++) {
    const sig = draw(rng);
    if (firstRepeatAt === null && seen.has(sig)) firstRepeatAt = i;
    seen.add(sig);
  }
  const before: number[] = [];
  for (let t = 0; t < trials; t++) {
    const r = mulberry32(seed + 1000 + t);
    const s = new Set<string>();
    let at = cap;
    for (let i = 1; i <= cap; i++) {
      const sig = draw(r);
      if (s.has(sig)) {
        at = i;
        break;
      }
      s.add(sig);
    }
    before.push(at);
  }
  const med = median(before);
  return { distinct: seen.size, draws, firstRepeatAt, medianBeforeRepeat: med >= cap ? null : med };
}

export function countSkill(
  skillId: string,
  tier: SkillTier,
  opts?: Parameters<typeof countSignatures>[1],
): PoolCount {
  return countSignatures((rng) => itemSignature(drawSkillItem(skillId, tier, rng)), opts);
}

/** Distinct story keys (contexts) a word-problem skill produces. */
export function countStoryContexts(
  skillId: string,
  tier: SkillTier,
  draws = 10_000,
  seed = 20261113,
): string[] {
  const rng = mulberry32(seed);
  const keys = new Set<string>();
  for (let i = 0; i < draws; i++) keys.add(drawSkillItem(skillId, tier, rng).story.key);
  return [...keys].sort();
}

export interface FactPoolDef {
  readonly level: string;
  readonly pool: readonly string[];
}

export const FACT_POOLS: readonly FactPoolDef[] = [
  { level: 'field', pool: mulFactsForTables([3, 4]) },
  { level: 'forest', pool: divFactsForTables([2, 3, 4, 5]) },
  { level: 'city', pool: mulFactsForTables([6, 7, 8, 9]) },
  { level: 'tower', pool: towerFactPool() },
];

export function countFactPool(pool: readonly string[]): PoolCount {
  return countSignatures((rng) => pick(rng, pool));
}

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
  const facts = FACT_POOLS.map((p) => ({ level: p.level, size: p.pool.length, ...countFactPool(p.pool) }));
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
    ...facts.map((f) => `| ${f.level} | ${f.size} | ${f.distinct} | ${f.medianBeforeRepeat ?? '>1000'} |`),
    '',
    '## Before / after (phase 02 fills the "after" column)',
    '',
    '| skill × tier | before | after |',
    '|---|---|---|',
    ...skills.flatMap((s) => s.tiers.map((t) => `| ${s.id} × t${t.tier} | ${t.distinct} | |`)),
  ];
  const path = 'plans/261113-1951-more-practice-content-for-muse/reports/pool-counts-before.md';
  writeFileSync(path, lines.join('\n') + '\n');
  console.log(`wrote ${path}`);
}

if (process.argv[1]?.endsWith('pool-counter.ts')) run();
