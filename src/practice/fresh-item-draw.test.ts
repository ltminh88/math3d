import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { STEP_KIT_FIXTURE_ID } from '../reasoning/step-kit-fixture';
import { drawFreshItem } from './fresh-item-draw';
import { itemFingerprint } from './item-fingerprint';
import { itemForSkill } from './item-for-skill';

const SKILL = 'mul-tens-mental';

/** The next rng value after a draw — proves identical rng consumption. */
const nextValue = (rng: () => number): number => rng();

describe('drawFreshItem', () => {
  it('with empty seen is bit-identical to itemForSkill (item + next rng value)', () => {
    const rngA = mulberry32(7);
    const expected = itemForSkill(SKILL, rngA, 1);
    const nextA = nextValue(rngA);
    const rngB = mulberry32(7);
    const got = drawFreshItem(SKILL, rngB, 1, []);
    expect(got).toEqual(expected);
    expect(nextValue(rngB)).toBe(nextA);
  });

  it('skips a seen fingerprint and returns a different item', () => {
    const first = itemForSkill(SKILL, mulberry32(7), 1);
    // The second draw from the same seed is the next candidate after the first.
    const rng = mulberry32(7);
    itemForSkill(SKILL, rng, 1);
    const expectedSecond = itemForSkill(SKILL, rng, 1);
    const got = drawFreshItem(SKILL, mulberry32(7), 1, [itemFingerprint(first)]);
    expect(got).toEqual(expectedSecond);
    expect(itemFingerprint(got)).not.toBe(itemFingerprint(first));
  });

  it('when all tries hit, returns the least-recently-seen candidate', () => {
    const rng = mulberry32(7);
    const first = itemForSkill(SKILL, rng, 1);
    const second = itemForSkill(SKILL, rng, 1);
    // seen is oldest-first: the second draw is older (index 0), so it wins.
    const got = drawFreshItem(
      SKILL,
      mulberry32(7),
      1,
      [itemFingerprint(second), itemFingerprint(first)],
      2,
    );
    expect(got).toEqual(second);
  });

  it('with a pool of one returns it after maxTries, never throwing', () => {
    const seen = [itemFingerprint(itemForSkill(STEP_KIT_FIXTURE_ID, mulberry32(1), 1))];
    const got = drawFreshItem(STEP_KIT_FIXTURE_ID, mulberry32(1), 1, seen, 8);
    expect(got).toEqual(itemForSkill(STEP_KIT_FIXTURE_ID, mulberry32(1), 1));
  });
});
