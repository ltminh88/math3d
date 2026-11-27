// Repeat baseline report (anti-repeat Phase 1): one deterministic report that
// says, per skill x tier and per run type, how many distinct items and shapes
// a child can meet and how often a run repeats an item from itself or the
// last 5 runs. Skipped unless REPEAT_REPORT=1; writes the markdown + json
// under the plan's reports/ dir. Two runs give byte-identical output.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../../src/learning/kntt-lesson-index';
import { SKILL_CATALOG } from '../../src/learning/skill-catalog';
import { CITY_REASONING_SKILLS } from '../../src/levels/city/city-stage-plan';
import { FIELD_REASONING_SKILLS } from '../../src/levels/field/field-stage-plan';
import { FOREST_REASONING_SKILLS } from '../../src/levels/forest/forest-stage-plan';
import { TOWER_REASONING_SKILLS } from '../../src/levels/tower/tower-stage-plan';
import { countSkill, drawSkillItem, type PoolCount } from './pool-counting';
import {
  countShapes,
  REPEAT_SEED,
  type RunRecord,
  recordRuns,
  shapeSignature,
} from './repeat-metrics';
import {
  lessonSeedFor,
  simulateDailyDays,
  simulateLessonRuns,
  simulateLevelRounds,
  syntheticDailyStats,
} from './repeat-run-simulators';

/** Pool counting params from the research baseline (2000 draws, seed 20261113). */
const POOL_OPTS = { draws: 2000, trials: 10, cap: 300, seed: REPEAT_SEED };
const LESSON_REPLAYS = 10;
const DAILY_DAYS = 30;
const LEVEL_ROUNDS = 50;
const START_DAY = 20000;
const LEVELS = [
  { level: 'field', skills: FIELD_REASONING_SKILLS },
  { level: 'forest', skills: FOREST_REASONING_SKILLS },
  { level: 'city', skills: CITY_REASONING_SKILLS },
  { level: 'tower', skills: TOWER_REASONING_SKILLS },
] as const;

interface SkillRow {
  skill: string;
  family: string;
  lesson: string;
  t1: PoolCount;
  t2: PoolCount;
  t3: PoolCount;
  shapes: number;
}
interface RunRow {
  name: string;
  items: number;
  inRun: number;
  seenPrev: number;
  seenPct: number;
}

const sum = (rs: RunRecord[], f: (r: RunRecord) => number): number =>
  rs.reduce((a, r) => a + f(r), 0);
const toRunRow = (name: string, rs: RunRecord[]): RunRow => {
  const items = sum(rs, (r) => r.items.length);
  const inRun = sum(rs, (r) => r.inRunRepeats);
  const seenPrev = sum(rs, (r) => r.seenInPreviousRuns);
  return { name, items, inRun, seenPrev, seenPct: items === 0 ? 0 : seenPrev / items };
};

function buildBaseline(): { md: string; json: string } {
  const skills = SKILL_CATALOG.filter((s) => s.family !== 'english');
  const tableA: SkillRow[] = skills.map((s) => ({
    skill: s.id,
    family: s.family,
    lesson: s.lesson,
    t1: countSkill(s.id, 1, POOL_OPTS),
    t2: countSkill(s.id, 2, POOL_OPTS),
    t3: countSkill(s.id, 3, POOL_OPTS),
    shapes: countShapes(s.id, 1),
  }));
  tableA.sort(
    (a, b) =>
      Math.min(a.t1.distinct, a.t2.distinct, a.t3.distinct) -
        Math.min(b.t1.distinct, b.t2.distinct, b.t3.distinct) || (a.skill < b.skill ? -1 : 1),
  );
  const lessonRuns = new Map<number, RunRecord[]>();
  const sigCounts = new Map<string, number>();
  for (const lesson of ALL_LESSONS) {
    const runs = simulateLessonRuns(lesson.n, LESSON_REPLAYS);
    lessonRuns.set(lesson.n, runs);
    for (const r of runs) for (const s of r.items) sigCounts.set(s, (sigCounts.get(s) ?? 0) + 1);
  }
  const tableB: RunRow[] = ALL_LESSONS.map((l) =>
    toRunRow(`B${l.n} ${l.titleVi}`, lessonRuns.get(l.n) as RunRecord[]),
  ).sort((a, b) => b.seenPct - a.seenPct || b.inRun - a.inRun);
  const dailyStats = syntheticDailyStats(
    skills.map((s) => s.id),
    START_DAY,
  );
  const dailyRuns = simulateDailyDays(dailyStats, DAILY_DAYS, { startDay: START_DAY });
  const tableC = toRunRow('daily (30 days)', dailyRuns);
  const tableD: RunRow[] = LEVELS.map((l, i) =>
    toRunRow(l.level, simulateLevelRounds(l.skills, LEVEL_ROUNDS, REPEAT_SEED + i)),
  );
  const topRepeaters = [...sigCounts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 20)
    .map(([signature, count]) => ({ signature, count }));
  const below60 = tableA.filter(
    (r) => Math.min(r.t1.distinct, r.t2.distinct, r.t3.distinct) < 60,
  ).length;
  const data = {
    seed: REPEAT_SEED,
    windowK: 5,
    lessonReplays: LESSON_REPLAYS,
    dailyDays: DAILY_DAYS,
    levelRounds: LEVEL_ROUNDS,
    below60,
    tableA,
    tableB,
    tableC,
    tableD,
    topRepeaters,
  };
  const cell = (r: PoolCount): string => `${r.distinct} (med ${r.medianBeforeRepeat ?? '>300'})`;
  const runLine = (r: RunRow): string =>
    `| ${r.name} | ${r.items} | ${r.inRun} | ${r.seenPrev} | ${(r.seenPct * 100).toFixed(1)}% |`;
  const md = [
    '# Repeat baseline (anti-repeat Phase 1)',
    '',
    `Measured on main with seed ${REPEAT_SEED}: 2000 draws per skill x tier (median over 10 trials, cap 300), shapes from 1000 tier-1 draws, ${LESSON_REPLAYS} replays per lesson, ${DAILY_DAYS} daily days, ${LEVEL_ROUNDS} level rounds. Window K = 5 previous runs. English ids have no \`itemForSkill\` generator and are skipped (${SKILL_CATALOG.length - skills.length} ids). Lesson sims use the default renderable filter; the game additionally drops unrenderable keys. Level lists are the base stage lists (stages 1-3). Daily profile: every non-English skill attempted once, boxes spread 1-5, all due on day 0.`,
    '',
    `## Targets (plan.md): T2 — ${below60} skill x tier cells below 60 distinct in 2000 draws. Worst lesson seen-in-previous-5: ${tableB[0]?.name} at ${((tableB[0]?.seenPct ?? 0) * 100).toFixed(1)}%.`,
    '',
    '## A. Distinct items + shapes per skill x tier (worst first)',
    '',
    '| skill | family | lesson | tier 1 | tier 2 | tier 3 | shapes (t1) |',
    '|---|---|---|---|---|---|---|',
    ...tableA.map(
      (r) =>
        `| ${r.skill} | ${r.family} | ${r.lesson} | ${cell(r.t1)} | ${cell(r.t2)} | ${cell(r.t3)} | ${r.shapes} |`,
    ),
    '',
    '## B. Lesson replays (10 replays each, worst first)',
    '',
    '| lesson | items | in-run repeats | seen in previous 5 | seen % |',
    '|---|---|---|---|---|',
    ...tableB.map(runLine),
    '',
    '## C. Daily (30 days)',
    '',
    '| run | items | in-run repeats | seen in previous 5 | seen % |',
    '|---|---|---|---|---|',
    runLine(tableC),
    '',
    '## D. Level reasoning rounds (50 rounds each)',
    '',
    '| level | items | in-run repeats | seen in previous 5 | seen % |',
    '|---|---|---|---|---|',
    ...tableD.map(runLine),
    '',
    '## Top 20 repeaters (lesson replays, signature + count)',
    '',
    '| signature | count |',
    '|---|---|',
    ...topRepeaters.map((t) => `| \`${t.signature}\` | ${t.count} |`),
    '',
  ].join('\n');
  return { md, json: JSON.stringify(data, null, 2) };
}

describe('repeat meter guard', () => {
  it('shapeSignature keeps the frame, drops numbers and answers', () => {
    const a = drawSkillItem('add-sub-1000', 1, () => 0.1);
    const a2 = drawSkillItem('add-sub-1000', 1, () => 0.1);
    const b = drawSkillItem('add-sub-1000', 1, () => 0.9);
    // Same draw -> same shape; the add frame and the sub frame differ.
    expect(shapeSignature(a)).toBe(shapeSignature(a2));
    expect(shapeSignature(a)).not.toBe(shapeSignature(b));
    expect(shapeSignature(a)).not.toContain('=');
    expect(shapeSignature(a).split('|')[0]).toBe(a.story.key);
    expect(shapeSignature(drawSkillItem('mul-tens-mental', 1, () => 0.1))).not.toBe(
      shapeSignature(a),
    );
  });

  it('lessonSeedFor moves with attempts (replays re-plan)', () => {
    const s1 = lessonSeedFor(7, 'repeat-meter', 10);
    expect(lessonSeedFor(7, 'repeat-meter', 10)).toBe(s1);
    expect(lessonSeedFor(7, 'repeat-meter', 16)).not.toBe(s1);
    expect(lessonSeedFor(8, 'repeat-meter', 10)).not.toBe(s1);
  });

  it('recordRuns counts in-run and previous-5 repeats', () => {
    const rs = recordRuns([['a', 'b', 'a'], ['b', 'c'], ['a']]);
    expect(rs[0]).toMatchObject({ inRunRepeats: 1, seenInPreviousRuns: 0 });
    expect(rs[1]).toMatchObject({ inRunRepeats: 0, seenInPreviousRuns: 1 });
    expect(rs[2]).toMatchObject({ inRunRepeats: 0, seenInPreviousRuns: 1 });
  });

  it('sims are deterministic', () => {
    expect(simulateLessonRuns(7, 2)).toEqual(simulateLessonRuns(7, 2));
    const stats = syntheticDailyStats(['mul-tens-mental', 'add-sub-1000'], START_DAY);
    expect(simulateDailyDays(stats, 2, { startDay: START_DAY })).toEqual(
      simulateDailyDays(stats, 2, { startDay: START_DAY }),
    );
    expect(simulateLevelRounds(FIELD_REASONING_SKILLS, 5, REPEAT_SEED)).toEqual(
      simulateLevelRounds(FIELD_REASONING_SKILLS, 5, REPEAT_SEED),
    );
  });

  it('meas-temperature tier 1 has 48 distinct prompts (report params)', () => {
    expect(countSkill('meas-temperature', 1, POOL_OPTS).distinct).toBe(48);
  });
});

describe('repeat baseline report', () => {
  const runReport = process.env.REPEAT_REPORT === '1';
  (runReport ? it : it.skip)('writes repeat-baseline.md + .json (REPEAT_REPORT=1)', () => {
    const t0 = Date.now();
    const first = buildBaseline();
    const firstMs = Date.now() - t0;
    console.log(`repeat baseline: one build ${firstMs}ms`);
    expect(firstMs).toBeLessThan(30000);
    const second = buildBaseline();
    expect(second.md).toBe(first.md);
    expect(second.json).toBe(first.json);
    const data = JSON.parse(first.json) as { tableA: SkillRow[] };
    const byId = Object.fromEntries(data.tableA.map((r) => [r.skill, r]));
    expect(byId['mul-tens-mental']?.t1.distinct).toBe(6);
    expect(byId['meas-len-choose-unit']?.t1.distinct).toBe(14);
    const dir = join(process.cwd(), 'plans/261127-1620-question-variety-anti-repeat/reports');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'repeat-baseline.md'), first.md);
    writeFileSync(join(dir, 'repeat-baseline.json'), `${first.json}\n`);
  });
});
