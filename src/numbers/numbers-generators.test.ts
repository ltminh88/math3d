// Numbers generators (phase 07): exact answers per story key, unique options, numbers inside
// the skill's range, deterministic per seed. RED-first: the generators do not exist yet.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { skillsOfFamily } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import { dialogRenderable } from '../practice/item-for-skill';
import type { PracticeItem } from '../practice/practice-scene';
import { ref } from '../reasoning/reasoning-distractors';
import { evalExpr } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { NUMBER_SKILLS, numberItemForSkill } from './number-item-for-skill';
import { formatDigitRuns } from './numbers-format';
import { fromDigits } from './numbers-ranges';
import type { NumberScene } from './numbers-scene-types';
import { renderNumbersPrompt } from './numbers-strings';
import {
  correctLabel,
  digitAtPlace,
  stepNumber,
  stepSign,
  stepValues,
  wordsToNumber,
} from './numbers-test-oracles';
import { SCENE_SKILLS, sweepNumberItem } from './numbers-test-sweep';

const p = (i: PracticeItem, k: string) => Number(i.story.params?.[k]);
const listOf = (i: PracticeItem) =>
  String(i.story.params?.list)
    .split(',')
    .map((s) => Number(s.trim()));
const values = (i: PracticeItem) => stepValues(i);
const last = (i: PracticeItem) => values(i).at(-1);

/** The place-value scene (when present) shows the blocks of this number, nothing else. */
function checkPlaceValueScene(i: PracticeItem, n: number): void {
  const scene = i.scene as NumberScene | undefined;
  if (!scene) return;
  expect(scene.kind).toBe('place-value');
  if (scene.kind !== 'place-value') return;
  const placeValue: Record<string, number> = {
    ones: 1,
    tens: 10,
    hundreds: 100,
    thousands: 1000,
    tenThousands: 10000,
  };
  expect(scene.columns.reduce((sum, c) => sum + c.blocks * (placeValue[c.place] ?? 0), 0)).toBe(n);
}

/** The number-line scene (when present) shows the sequence with '?' at the gap(s). */
function checkNumberLineScene(
  i: PracticeItem,
  marks: readonly number[],
  missing: readonly number[],
): void {
  const scene = i.scene as NumberScene | undefined;
  if (!scene) return;
  expect(scene.kind).toBe('number-line');
  if (scene.kind !== 'number-line') return;
  expect([...scene.marks]).toEqual(marks);
  expect([...scene.missing]).toEqual(missing);
}

/** A step that must exist (the item's steps are never empty). */
const stepAt = (i: PracticeItem, idx: number): ReasoningStep => {
  const step = i.steps[idx];
  if (!step) throw new Error(`missing step ${idx}`);
  return step;
};

/** Independent answers per story key, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: PracticeItem) => void> = {
  readWords: (i) => {
    expect(last(i)).toBe(wordsToNumber(String(i.story.params?.words)));
  },
  writeWords: (i) => {
    expect(wordsToNumber(String(correctLabel(stepAt(i, 0)).params?.w))).toBe(p(i, 'n'));
  },
  matchParts3: (i) => {
    expect(last(i)).toBe(100 * p(i, 'a') + 10 * p(i, 'b') + p(i, 'c'));
    checkPlaceValueScene(i, last(i) as number);
  },
  matchParts4: (i) => {
    expect(last(i)).toBe(1000 * p(i, 'a') + 100 * p(i, 'b') + 10 * p(i, 'c') + p(i, 'd'));
    checkPlaceValueScene(i, last(i) as number);
  },
  matchParts5: (i) => {
    expect(last(i)).toBe(
      10000 * p(i, 'a') + 1000 * p(i, 'b') + 100 * p(i, 'c') + 10 * p(i, 'd') + p(i, 'e'),
    );
    checkPlaceValueScene(i, last(i) as number);
  },
  digitAtPlace: (i) => {
    expect(last(i)).toBe(digitAtPlace(p(i, 'n'), String(i.story.params?.place)));
    checkPlaceValueScene(i, p(i, 'n'));
  },
  expandSum: (i) => {
    expect(evalExpr(String(correctLabel(stepAt(i, 0)).params?.text))).toBe(p(i, 'n'));
    checkPlaceValueScene(i, p(i, 'n'));
  },
  neighbors: (i) => expect(values(i)).toEqual([p(i, 'n') - 1, p(i, 'n') + 1]),
  neighborsTrio: (i) => {
    const [a, b] = [p(i, 'a'), p(i, 'b')];
    expect(last(i)).toBe(b + (b - a));
  },
  sequence: (i) => {
    const [a, b, d] = [p(i, 'a'), p(i, 'b'), p(i, 'd')];
    const missing = a + 2 * (b - a);
    expect(d).toBe(a + 3 * (b - a));
    expect(last(i)).toBe(missing);
    checkNumberLineScene(i, [a, b, missing, d], [2]);
  },
  sequenceTwoGaps: (i) => {
    const [a, c] = [p(i, 'a'), p(i, 'c')];
    const s = (c - a) / 2;
    expect(Number.isInteger(s)).toBe(true);
    expect(values(i)).toEqual([a + s, a + 3 * s]);
    checkNumberLineScene(i, [a, a + s, c, a + 3 * s], [1, 3]);
  },
  compare: (i) => {
    const [a, b] = [p(i, 'a'), p(i, 'b')];
    expect(stepSign(stepAt(i, 0))).toBe(a > b ? '>' : a < b ? '<' : '=');
  },
  compareExpr: (i) => {
    const a = p(i, 'a');
    const v = evalExpr(String(i.story.params?.expr));
    expect(stepSign(stepAt(i, 0))).toBe(a > v ? '>' : a < v ? '<' : '=');
  },
  orderAsc: (i) => expect(values(i)).toEqual([...listOf(i)].sort((x, y) => x - y)),
  orderDesc: (i) => expect(values(i)).toEqual([...listOf(i)].sort((x, y) => y - x)),
  maxMin: (i) => {
    const list = listOf(i);
    const want = stepAt(i, 0).prompt.key === 'askMax' ? Math.max(...list) : Math.min(...list);
    expect(stepNumber(stepAt(i, 0))).toBe(want);
  },
  expandFill: (i) => expect(last(i)).toBe(p(i, 'n') - p(i, 'x') - p(i, 'y')),
  expandVerdict: (i) => {
    const step = stepAt(i, 0);
    if (step?.kind !== 'verdict') throw new Error('expandVerdict needs a verdict step');
    const claim =
      evalExpr(String(step.statement.params?.text)) === Number(step.statement.params?.value);
    expect(step.answer).toBe(claim);
    if (!claim && step.fix)
      expect(step.fix.answer).toBe(evalExpr(String(step.statement.params?.text)));
  },
  makeMaxMin: (i) => {
    const digits = String(i.story.params?.digits).split(' ').map(Number);
    const desc = [...digits].sort((x, y) => y - x);
    const asc = [...digits].sort((x, y) => x - y);
    expect(values(i)).toEqual([fromDigits(desc), fromDigits(asc)]);
  },
};

describe('numbers generators', () => {
  it('cover every num-* skill of the catalog', () => {
    expect([...NUMBER_SKILLS].sort()).toEqual(skillsOfFamily('number').sort());
  });

  for (const skillId of NUMBER_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers in range, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = numberItemForSkill(skillId, mulberry32(seed), tier);
          sweepNumberItem(item, skillId, tier, seed);
          const key = item.story.key;
          expect(ORACLE[key], `oracle for ${key}`).toBeDefined();
          ORACLE[key]?.(item);
          if (seed < 20) expect(numberItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });

  it('dialog filter: T1 always renderable; T2/T3 scene skills filtered until phase 16', () => {
    for (const skillId of NUMBER_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[]) {
        const item = numberItemForSkill(skillId, mulberry32(0), tier);
        // No renderer for 'place-value' / 'number-line' exists yet (phase 16), so a scene
        // item is not renderable; the filter drops exactly those (skill, tier) pairs.
        expect(dialogRenderable(item)).toBe(!(tier > 1 && skillId in SCENE_SKILLS));
      }
  });

  it('refuses skills it has no generator for', () => {
    expect(() => numberItemForSkill('meas-gram', mulberry32(1), 1)).toThrow();
  });
});

describe('numbers review fixes (phase 07 follow-up)', () => {
  const NBSP = '\u202F';

  it('verdict steps: the story shows the claimed sum, same name as the question', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = numberItemForSkill('num-expand-100000', mulberry32(seed), 3);
      const step = stepAt(item, 0);
      if (step?.kind !== 'verdict') throw new Error('expand T3 needs a verdict step');
      const story = renderNumbersPrompt(item.story);
      const question = renderNumbersPrompt(step.prompt);
      const claimed = formatDigitRuns(String(step.statement.params?.text));
      expect(story, `seed ${seed}: story shows the sum`).toContain('+');
      expect(story, `seed ${seed}: story shows An's sum`).toContain(claimed);
      expect(question, `seed ${seed}: question names An`).toContain('An');
      expect(question, `seed ${seed}: question does not name Nam`).not.toContain('Nam');
    }
  });

  it('maxMin options are exactly the numbers in the list', () => {
    for (const skillId of ['num-order-1000', 'num-order-10000', 'num-order-100000'])
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 200; seed++) {
          const item = numberItemForSkill(skillId, mulberry32(seed), tier);
          if (item.story.key !== 'maxMin') continue;
          const list = listOf(item);
          const step = stepAt(item, 0);
          if (step.kind !== 'choice') throw new Error('maxMin needs a choice step');
          for (const o of step.options) {
            expect(o.label.key).toBe('num');
            expect(list, `seed ${seed}: option ${o.label.params?.n} in list`).toContain(
              Number(o.label.params?.n),
            );
          }
        }
  });

  it('sequence T3 labels the two blanks and asks by label', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = numberItemForSkill('num-sequence-1000', mulberry32(seed), 3);
      const story = renderNumbersPrompt(item.story);
      expect(story).toContain('ô A');
      expect(story).toContain('ô B');
      const first = renderNumbersPrompt(stepAt(item, 0).prompt);
      const second = renderNumbersPrompt(stepAt(item, 1).prompt);
      expect(first).toContain('ô A');
      expect(second).toContain('ô B');
      expect(first).not.toBe(second);
    }
  });

  it('no rendered numbers story contains "?."', () => {
    for (const skillId of NUMBER_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 100; seed++) {
          const item = numberItemForSkill(skillId, mulberry32(seed), tier);
          expect(renderNumbersPrompt(item.story), `${skillId} t${tier} #${seed}`).not.toContain(
            '?.',
          );
        }
  });

  it('numbers ≥ 1000 render grouped with a narrow no-break space', () => {
    expect(renderNumbersPrompt(ref('writeWords', { n: 77224 }))).toContain(`77${NBSP}224`);
    expect(renderNumbersPrompt(ref('num', { n: 77224 }))).toBe(`77${NBSP}224`);
    expect(
      renderNumbersPrompt(ref('compareExpr', { a: 30254, expr: '60000 + 4000 + 500 + 20' })),
    ).toContain(`30${NBSP}254`);
    expect(
      renderNumbersPrompt(ref('compareExpr', { a: 30254, expr: '60000 + 4000 + 500 + 20' })),
    ).toContain(`60${NBSP}000 + 4${NBSP}000 + 500 + 20`);
    expect(renderNumbersPrompt(ref('orderAsc', { list: '12145, 66452, 19476' }))).toContain(
      `12${NBSP}145, 66${NBSP}452, 19${NBSP}476`,
    );
    expect(renderNumbersPrompt(ref('writeWords', { n: 999 }))).toBe(
      'Số 999 viết bằng chữ thế nào?',
    );
  });
});
