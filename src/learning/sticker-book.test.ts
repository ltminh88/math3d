import { expect, it } from 'vitest';

// Sticker book derivation (phase 12): a skill at box 4 is earned, a table at 13 of its 18
// mul+div facts; a fresh profile owns nothing; an old save's boxes derive the same stickers.
import { divFactsForTables, mulFactsForTables } from './curriculum-tables';
import type { FactKey } from './fact-key';
import type { FactStat } from './learning-types';
import { newFactStat } from './leitner-box';
import { SKILL_CATALOG, skillsOfFamily } from './skill-catalog';
import {
  createEarningTracker,
  deriveStickers,
  STICKER_EARN_BOX,
  STICKER_TABLES,
  TOPIC_SKILLS,
  topicProgress,
  visibleTopics,
} from './sticker-book';

const stat = (box: number): FactStat => ({ ...newFactStat(), attempts: 1, correct: 1, box });

function tableStats(table: number, atBox4: number): Record<FactKey, FactStat> {
  const facts = [...mulFactsForTables([table]), ...divFactsForTables([table])];
  const stats: Record<FactKey, FactStat> = {};
  for (const key of facts.slice(0, atBox4)) stats[key] = stat(4);
  return stats;
}

it('fresh stats: one sticker per catalog skill and table, none earned', () => {
  const stickers = deriveStickers({});
  expect(stickers).toHaveLength(SKILL_CATALOG.length + STICKER_TABLES.length);
  expect(stickers.filter((s) => s.earned)).toHaveLength(0);
  expect(topicProgress(stickers, 'tables')).toEqual({ earned: 0, total: STICKER_TABLES.length });
  expect(topicProgress(stickers, 'remainder')).toEqual({ earned: 0, total: 2 });
  expect(topicProgress(stickers, 'unknown-pattern')).toEqual({ earned: 0, total: 7 });
  expect(topicProgress(stickers, 'expression-logic')).toEqual({ earned: 0, total: 13 });
  expect(topicProgress(stickers, 'geometry')).toEqual({ earned: 0, total: 10 });
  expect(topicProgress(stickers, 'measurement')).toEqual({ earned: 0, total: 24 });
  // New-family page totals are derived from the catalog, so the next family phase
  // does not have to edit this test (Brian's suggestion, phase 13 onward).
  expect(topicProgress(stickers, 'number')).toEqual({
    earned: 0,
    total: skillsOfFamily('number').length,
  });
  expect(topicProgress(stickers, 'fraction')).toEqual({
    earned: 0,
    total: skillsOfFamily('fraction').length,
  });
  expect(topicProgress(stickers, 'time')).toEqual({
    earned: 0,
    total: skillsOfFamily('time').length,
  });
  expect(topicProgress(stickers, 'money')).toEqual({
    earned: 0,
    total: skillsOfFamily('money').length,
  });
  expect(topicProgress(stickers, 'data')).toEqual({
    earned: 0,
    total: skillsOfFamily('data').length,
  });
});

it('every catalog skill has exactly one sticker, and no other skill sticker exists', () => {
  const stickers = deriveStickers({});
  const skillStickers = stickers.filter((s) => s.id.startsWith('sk:'));
  expect(skillStickers).toHaveLength(SKILL_CATALOG.length);
  const ids = new Set(skillStickers.map((s) => s.id.slice(3)));
  expect([...ids].sort()).toEqual(SKILL_CATALOG.map((s) => s.id).sort());
  const tables = stickers.filter((s) => s.topic === 'tables').map((s) => s.id);
  expect(tables).toEqual(STICKER_TABLES.map((t) => `table:${t}`));
});

it('a skill at box 4 is earned, at box 3 it is not, at box 5 it stays earned', () => {
  const at4 = deriveStickers({ 'sk:geo-midpoint': stat(4) });
  expect(at4.find((s) => s.id === 'sk:geo-midpoint')).toMatchObject({
    earned: true,
    box: 4,
    topic: 'geometry',
  });
  expect(deriveStickers({ 'sk:geo-midpoint': stat(3) })).toContainEqual(
    expect.objectContaining({ id: 'sk:geo-midpoint', earned: false, box: 3 }),
  );
  expect(deriveStickers({ 'sk:geo-midpoint': stat(5) })).toContainEqual(
    expect.objectContaining({ id: 'sk:geo-midpoint', earned: true, box: 5 }),
  );
});

it('a table needs 13 of 18 facts at box 4 (70%): 13 earns, 12 does not', () => {
  const earned = deriveStickers(tableStats(3, 13));
  expect(earned.find((s) => s.id === 'table:3')).toMatchObject({
    earned: true,
    box: 13,
    topic: 'tables',
  });
  expect(deriveStickers(tableStats(3, 12)).find((s) => s.id === 'table:3')).toMatchObject({
    earned: false,
    box: 12,
  });
  expect(STICKER_EARN_BOX).toBe(4);
});

it('an old save derives the same stickers from its boxes alone (pure, no storage)', () => {
  // Stats shaped like an imported M3D3 save: boxes only, no sticker field anywhere.
  const oldSave: Record<FactKey, FactStat> = {
    ...tableStats(7, 13),
    'sk:meas-ml': stat(4),
    'sk:geo-right-angle': stat(3),
  };
  const first = deriveStickers(oldSave);
  expect(first.find((s) => s.id === 'table:7')?.earned).toBe(true);
  expect(first.find((s) => s.id === 'sk:meas-ml')?.earned).toBe(true);
  expect(first.find((s) => s.id === 'sk:geo-right-angle')?.earned).toBe(false);
  expect(deriveStickers(oldSave)).toEqual(first);
});

it('earning tracker: baseline never announces, a new sticker announces exactly once', () => {
  const tracker = createEarningTracker();
  tracker.noteBaseline({ ...tableStats(3, 13), 'sk:geo-midpoint': stat(4) });
  // A sticker earned before the session started (old save) never announces.
  expect(tracker.check({ ...tableStats(3, 13), 'sk:geo-midpoint': stat(4) })).toEqual([]);
  // One clean answer moves a skill to box 4: announced once, then never again.
  const after = { ...tableStats(3, 13), 'sk:geo-midpoint': stat(4), 'sk:meas-ml': stat(4) };
  const fresh = tracker.check(after);
  expect(fresh.map((s) => s.id)).toEqual(['sk:meas-ml']);
  expect(tracker.check(after)).toEqual([]);
  // A first check without a baseline treats the current state as the baseline.
  const late = createEarningTracker();
  expect(late.check({ 'sk:meas-ml': stat(4) })).toEqual([]);
  expect(late.check({ 'sk:meas-ml': stat(4), 'sk:geo-midpoint': stat(4) })).toHaveLength(1);
});

it('topic skills are all catalog ids (the grouping follows the catalog)', () => {
  const catalog = new Set(SKILL_CATALOG.map((s) => s.id));
  for (const ids of Object.values(TOPIC_SKILLS)) {
    for (const id of ids) expect(catalog.has(id), id).toBe(true);
  }
});

it('empty family topics stay hidden until their skills exist', () => {
  const stickers = deriveStickers({});
  expect(visibleTopics(stickers)).toEqual([
    'tables',
    'remainder',
    'unknown-pattern',
    'expression-logic',
    'geometry',
    'measurement',
    'number',
    'arithmetic',
    'fraction',
    'time',
    'money',
    'data',
    // English landed in Phase 0: 41 stickers, none earned yet (the island opens in 1A/1B).
    'english',
  ]);
  // Arithmetic landed in phase 09: twelve stickers, none earned yet.
  expect(topicProgress(stickers, 'arithmetic')).toEqual({
    earned: 0,
    total: skillsOfFamily('arithmetic').length,
  });
  expect(topicProgress(stickers, 'english')).toEqual({
    earned: 0,
    total: skillsOfFamily('english').length,
  });
});
