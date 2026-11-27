// add-sub-match generator (boost, Phase 3A): RED-first — the generator does not exist yet.
// Four ladder pairs as a `match` step: the left side shows the calculations, the
// right side their results (shuffled); one right value is ALSO the bug value of
// another pair in the set, so pairing that pair with it records the bug (the
// decoy). The item is always solvable: every right value is a correct value of
// exactly one left.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { type AddSubBug, bugsFor, bugValue } from './add-sub-bug-catalogue';
import { ADD_SUB_MATCH_GENERATORS, matchAddSub } from './add-sub-match-generator';
import { ADD_SUB_MATCH_FALLBACK } from './add-sub-match-sets';
import { sweepArithmeticItem } from './arithmetic-test-sweep';
import { countAddCarries, countSubBorrows } from './carry-count';

const generate = (tier: SkillTier, seed: number): PracticeItem =>
  matchAddSub(mulberry32(seed), tier) as PracticeItem;

const matchStep = (item: PracticeItem): ReasoningStep & { kind: 'match' } => {
  expect(item.steps).toHaveLength(1);
  const step = item.steps[0];
  expect(step?.kind).toBe('match');
  return step as ReasoningStep & { kind: 'match' };
};

/** The (a, b, op) behind a left label 'a op b'. */
const parseLeft = (text: string): { a: number; b: number; op: '+' | '−' } => {
  const m = text.match(/^(\d+) ([+−]) (\d+)$/);
  if (!m) throw new Error(`bad left label: ${text}`);
  return { a: Number(m[1]), b: Number(m[3]), op: m[2] as '+' | '−' };
};

const rightValue = (item: PracticeItem, i: number): number => {
  const step = matchStep(item);
  const label = step.right[i]?.label;
  expect(label?.key).toBe('num');
  const n = label?.params?.n;
  if (typeof n !== 'number') throw new Error('right option has no number label');
  return n;
};

describe('add-sub-match sweeps clean', () => {
  it('sweeps clean at every tier', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        sweepArithmeticItem(generate(tier, seed), 'add-sub-match', tier, seed);
      }
    }
  });

  it('is registered under its skill id', () => {
    expect(ADD_SUB_MATCH_GENERATORS['add-sub-match']).toBe(matchAddSub);
  });
});

describe('add-sub-match pairs', () => {
  it('has four lefts and four rights, pairs a permutation, all values distinct', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(tier, seed);
        const step = matchStep(item);
        expect(step.left).toHaveLength(4);
        expect(step.right).toHaveLength(4);
        expect(step.pairs).toHaveLength(4);
        expect([...step.pairs].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
        const values = [0, 1, 2, 3].map((i) => rightValue(item, i));
        expect(new Set(values).size).toBe(4);
        // Every left pairs with its own correct value.
        for (let i = 0; i < 4; i++) {
          const { a, b, op } = parseLeft(String(step.left[i]?.params?.text));
          const correct = op === '+' ? a + b : a - b;
          expect(rightValue(item, step.pairs[i] as number)).toBe(correct);
        }
      }
    }
  });

  it('every pair follows the tier ladder (oracle-local)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const step = matchStep(generate(tier, seed));
        for (const left of step.left) {
          const { a, b, op } = parseLeft(String(left.params?.text ?? ''));
          if (op === '+') {
            const c = countAddCarries(a, b);
            expect(tier === 1 ? c === 0 : tier === 2 ? c === 1 : c >= 2).toBe(true);
          } else {
            const borrows = countSubBorrows(a, b);
            expect(tier === 1 ? borrows === 0 : tier === 2 ? borrows === 1 : borrows >= 2).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it('exactly one right value is tagged, and it is a bug value of another pair', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(tier, seed);
        const step = matchStep(item);
        const tagged = step.right
          .map((o, i) => ({ o, i }))
          .filter(({ o }) => o.misconception !== undefined);
        expect(tagged).toHaveLength(1);
        const { o, i } = tagged[0] as { o: (typeof step.right)[number]; i: number };
        const decoy = rightValue(item, i);
        // The tagged value is some other pair's bug value (never its own pair's).
        const ownLeft = step.pairs.indexOf(i);
        const others = step.left.filter((_, li) => li !== ownLeft);
        const isBugOfOther = others.some(({ params }) => {
          const { a, b, op } = parseLeft(String(params?.text ?? ''));
          return bugsFor(a, b, op).some((f) => f.value === decoy && f.bug === o.misconception);
        });
        expect(isBugOfOther).toBe(true);
        // And the bug value really is that bug of that pair (recomputed, not copied).
        const culprit = others.find(({ params }) => {
          const { a, b, op } = parseLeft(String(params?.text ?? ''));
          return bugValue(o.misconception as AddSubBug, a, b, op) === decoy;
        });
        expect(culprit).toBeDefined();
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = generate(2, 7);
    const b = generate(2, 7);
    expect(a).toEqual(b);
  });
});

describe('add-sub-match fixed fallbacks', () => {
  it('every tier fallback has four distinct correct values and a real collision', () => {
    for (const tier of [1, 2, 3] as const) {
      const pairs = ADD_SUB_MATCH_FALLBACK[tier];
      expect(pairs).toHaveLength(4);
      expect(new Set(pairs.map((p) => p.correct)).size).toBe(4);
      const collision = pairs.some((culprit, i) =>
        pairs.some((target, j) => {
          if (i === j) return false;
          return bugsFor(culprit.a, culprit.b, culprit.op).some((f) => f.value === target.correct);
        }),
      );
      expect(collision).toBe(true);
      for (const { a, b, op } of pairs) {
        if (op === '+') {
          const c = countAddCarries(a, b);
          expect(tier === 1 ? c === 0 : tier === 2 ? c === 1 : c >= 2).toBe(true);
        } else {
          const borrows = countSubBorrows(a, b);
          expect(tier === 1 ? borrows === 0 : tier === 2 ? borrows === 1 : borrows >= 2).toBe(true);
        }
      }
    }
  });
});
