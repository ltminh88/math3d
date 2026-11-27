// Length-ladder generators (boost, Phase 1B): 1000 seeds x 3 tiers per skill.
// The sweep checks the shape every item must have (skill/tier, whole numbers
// 0..1000, 3-4 choice options with exactly one correct and a bug on every
// wrong one, determinism) and then recomputes each answer from the story
// params — independently from the generator — including every wrong option's
// value against the bug catalogue.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { Misconception, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import { bugConvertValue, bugMixedPair, bugMixedValue } from './length-bug-catalogue';
import { OBJECTS } from './length-everyday-objects';
import { LENGTH_SKILLS, lengthItemForSkill } from './length-item-for-skill';
import {
  convertLength,
  LENGTH_LADDER,
  type LengthUnit,
  MM_PER_UNIT,
  mixedToMm,
} from './length-units';
import { LENGTH_LADDER_MAX } from './measurement-ranges';

const p = (i: ReasoningItem, k: string) => i.story.params?.[k];
const ps = (i: ReasoningItem, k: string) => String(p(i, k));
const pn = (i: ReasoningItem, k: string) => Number(p(i, k));

function choiceSteps(item: ReasoningItem): ReasoningStep[] {
  return item.steps.filter((s) => s.kind === 'choice');
}

/** The single choice step (len items have at most one); its correct label params. */
function correctParams(item: ReasoningItem): Record<string, number | string> {
  const step = choiceSteps(item)[0];
  if (step?.kind !== 'choice') throw new Error('no choice step');
  return step.options.find((o) => o.correct)?.label.params ?? {};
}

/** Parse "1 m 5 cm" (or "105 cm") into mm, from the story's formatted strings. */
function parseMixed(text: string): number {
  const parts = text.replace(/\u202F/g, '').split(' ');
  if (parts.length === 2) return Number(parts[0]) * MM_PER_UNIT[parts[1] as LengthUnit];
  return (
    Number(parts[0]) * MM_PER_UNIT[parts[1] as LengthUnit] +
    Number(parts[2]) * MM_PER_UNIT[parts[3] as LengthUnit]
  );
}

function checkShape(item: ReasoningItem, skillId: string, tier: SkillTier, seed: number): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId, where).toBe(skillId);
  expect(item.tier, where).toBe(tier);
  expect(item.steps.length, where).toBeGreaterThan(0);
  for (const n of numbersOfItem(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= LENGTH_LADDER_MAX, `${where}: ${n}`).toBe(true);
  }
  for (const step of item.steps) {
    if (step.kind === 'number') {
      expect(Number.isInteger(step.answer), where).toBe(true);
      expect(step.answer >= 0 && step.answer <= LENGTH_LADDER_MAX, where).toBe(true);
    }
    if (step.kind !== 'choice') continue;
    expect(step.options.length, where).toBeGreaterThanOrEqual(3);
    expect(step.options.length, where).toBeLessThanOrEqual(4);
    expect(
      step.options.filter((o) => o.correct),
      where,
    ).toHaveLength(1);
    const labels = step.options.map((o) => JSON.stringify(o.label));
    expect(new Set(labels).size, `${where} unique labels`).toBe(labels.length);
    for (const o of step.options)
      if (!o.correct) expect(o.misconception, `${where} ${o.id}`).toBeDefined();
  }
}

/** A wrong option's value must equal what its bug predicts (near-misses excluded). */
function checkBugValue(
  _item: ReasoningItem,
  bug: Misconception,
  value: number,
  expected: number | null,
  where: string,
): void {
  if (bug === 'near-miss') return;
  expect(expected, `${where}: bug ${bug} has a value`).not.toBeNull();
  expect(value, `${where}: bug ${bug}`).toBe(expected);
}

const lenConvertOracle = (item: ReasoningItem, tier: SkillTier, seed: number): void => {
  const where = `${item.skillId} t${tier} #${seed}`;
  const from = ps(item, 'from') as LengthUnit;
  const to = ps(item, 'to') as LengthUnit;
  const answer = convertLength(pn(item, 'n'), from, to) as number;
  const step = item.steps[0];
  if (step?.kind === 'number') {
    expect(step.answer, where).toBe(answer);
    return;
  }
  expect(Number(correctParams(item).n), where).toBe(answer);
  for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
    if (o.correct) continue;
    checkBugValue(
      item,
      o.misconception as Misconception,
      Number(o.label.params?.n),
      bugConvertValue(o.misconception as Misconception, pn(item, 'n'), from, to),
      where,
    );
  }
};

const ORACLE: Record<string, (item: ReasoningItem, tier: SkillTier, seed: number) => void> = {
  lenLadder: (item, _tier, seed) => {
    const where = `meas-len-ladder #${seed}`;
    const chain = ps(item, 'chain').replace(/\u202F/g, '');
    const tokens = chain.split(' = ');
    const blank = tokens.indexOf('?');
    expect(blank, where).toBeGreaterThanOrEqual(0);
    // Every shown rung is the same length; the answer, in the blank's unit,
    // is that same length. The blank's unit is one of the two ladder
    // neighbours of a shown neighbour — exactly one of them makes the
    // answer's millimetres match the shown length.
    const mmOf = (token: string): number => {
      const [n, unit] = token.split(' ');
      return Number(n) * MM_PER_UNIT[unit as LengthUnit];
    };
    const shown = tokens.filter((t) => t !== '?').map(mmOf);
    expect(new Set(shown).size, where).toBe(1);
    const neighbour = tokens[blank + 1] ?? tokens[blank - 1] ?? '';
    const [, neighbourUnit] = neighbour.split(' ');
    const rung = LENGTH_LADDER.indexOf(neighbourUnit as LengthUnit);
    const candidates = [LENGTH_LADDER[rung - 1], LENGTH_LADDER[rung + 1]].filter(
      (u): u is LengthUnit => u !== undefined,
    );
    const step = item.steps[0];
    expect(step?.kind).toBe('number');
    if (step?.kind === 'number') {
      const fitting = candidates.filter((u) => step.answer * MM_PER_UNIT[u] === shown[0]);
      expect(fitting, where).toHaveLength(1);
      // The generator's work holds the full chain: the blank's number is work[blank].
      expect(item.work[blank], where).toBe(step.answer);
    }
  },
  // lenConvertFar shares the oracle: same params (n/from/to) and step shape,
  // only the story carries a noun (R113).
  lenConvert: lenConvertOracle,
  lenConvertFar: lenConvertOracle,
  lenCompare: (item, _tier, seed) => {
    const where = `meas-len-compare #${seed}`;
    const aMm = pn(item, 'a') * MM_PER_UNIT[ps(item, 'ua') as LengthUnit];
    const bMm = pn(item, 'b') * MM_PER_UNIT[ps(item, 'ub') as LengthUnit];
    const sign = aMm === bMm ? '=' : aMm > bMm ? '>' : '<';
    expect(String(correctParams(item).s), where).toBe(sign);
    const bare = pn(item, 'a') === pn(item, 'b') ? '=' : pn(item, 'a') > pn(item, 'b') ? '>' : '<';
    for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
      if (o.correct) continue;
      const s = String(o.label.params?.s);
      if (o.misconception === 'ignore-unit') expect(s, where).toBe(bare);
      if (o.misconception === 'unit-direction') {
        expect(s, where).not.toBe(bare);
        expect(s, where).not.toBe(sign);
      }
      if (o.misconception === 'near-miss') expect(s, where).toBe('=');
    }
  },
  lenOrder: (item, _tier, seed) => {
    const where = `meas-len-order #${seed}`;
    const shown = [ps(item, 'a'), ps(item, 'b'), ps(item, 'c')].map((s) => {
      const [n, unit] = s.replace(/\u202F/g, '').split(' ');
      return {
        n: Number(n),
        unit: unit as LengthUnit,
        mm: Number(n) * MM_PER_UNIT[unit as LengthUnit],
      };
    });
    const step = item.steps[0];
    expect(step?.kind, where).toBe('order');
    if (step?.kind !== 'order') return;
    // Three distinct tiles, the story's shown quantities in display order.
    expect(step.tiles, where).toHaveLength(3);
    const tileMms = step.tiles.map((t) => {
      const n = Number(t.params?.n);
      const unit = String(t.params?.unit) as LengthUnit;
      return n * MM_PER_UNIT[unit];
    });
    expect(
      [...tileMms].sort((a, b) => a - b),
      where,
    ).toEqual([...shown].map((q) => q.mm).sort((a, b) => a - b));
    // The answer is a permutation of the tile indices, smallest first.
    expect([...step.answer].sort(), where).toEqual([0, 1, 2]);
    const ordered = step.answer.map((i) => tileMms[i] as number);
    expect(ordered, where).toEqual([...ordered].sort((a, b) => a - b));
  },
  lenChooseObj: (item, _tier, seed) => {
    const where = `meas-len-choose-unit #${seed}`;
    const found = OBJECTS.find((o) => o.item === ps(item, 'item'));
    expect(found, where).toBeDefined();
    expect(String(correctParams(item).unit), where).toBe(found?.unit);
    // The shown number is drawn inside the object's realistic range.
    expect(pn(item, 'n'), where).toBeGreaterThanOrEqual(found?.lo ?? 0);
    expect(pn(item, 'n'), where).toBeLessThanOrEqual(found?.hi ?? 0);
    const units = (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options.map(
      (o) => String(o.label.params?.unit),
    );
    expect([...units].sort(), where).toEqual(['cm', 'dm', 'm', 'mm']);
  },
  lenMixedToSingle: (item, tier, seed) => {
    const where = `meas-len-mixed t${tier} #${seed}`;
    const to = ps(item, 'to') as LengthUnit;
    const total =
      mixedToMm(
        pn(item, 'a'),
        ps(item, 'ua') as LengthUnit,
        pn(item, 'b'),
        ps(item, 'ub') as LengthUnit,
      ) / MM_PER_UNIT[to];
    const step = item.steps[0];
    if (step?.kind === 'number') {
      expect(step.answer, where).toBe(total);
      return;
    }
    expect(Number(correctParams(item).n), where).toBe(total);
    for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
      if (o.correct) continue;
      checkBugValue(
        item,
        o.misconception as Misconception,
        Number(o.label.params?.n),
        bugMixedValue(
          o.misconception as Misconception,
          pn(item, 'a'),
          ps(item, 'ua') as LengthUnit,
          pn(item, 'b'),
          ps(item, 'ub') as LengthUnit,
          to,
        ),
        where,
      );
    }
  },
  lenMixedFromSingle: (item, _tier, seed) => {
    const where = `meas-len-mixed #${seed}`;
    const from = ps(item, 'from') as LengthUnit;
    const bigUnit = ps(item, 'to') as LengthUnit;
    const smallUnit = ps(item, 'to2') as LengthUnit;
    const mm = pn(item, 'n') * MM_PER_UNIT[from];
    const params = correctParams(item);
    expect(mixedToMm(Number(params.a), bigUnit, Number(params.b), smallUnit), where).toBe(mm);
    for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
      if (o.correct) continue;
      const pair = { big: Number(o.label.params?.a), small: Number(o.label.params?.b) };
      if (o.misconception === 'near-miss') {
        const correct = correctParams(item);
        const dBig = Math.abs(pair.big - Number(correct.a));
        const dSmall = Math.abs(pair.small - Number(correct.b));
        expect(dBig + dSmall, where).toBe(1);
        continue;
      }
      const want = bugMixedPair(o.misconception as Misconception, mm, bigUnit, smallUnit);
      expect(want, `${where}: bug ${o.misconception}`).not.toBeNull();
      expect(pair, where).toEqual(want);
    }
  },
  lenAddStory: (item, tier, seed) => addSubOracle(item, tier, seed, true),
  lenSubStory: (item, tier, seed) => addSubOracle(item, tier, seed, false),
  lenAddMixedStory: (item, tier, seed) => addSubMixedOracle(item, tier, seed, true),
  lenSubMixedStory: (item, tier, seed) => addSubMixedOracle(item, tier, seed, false),
};

function addSubOracle(item: ReasoningItem, tier: SkillTier, seed: number, add: boolean): void {
  const where = `meas-len-add-sub t${tier} #${seed}`;
  const a = pn(item, 'a');
  const ua = ps(item, 'ua') as LengthUnit;
  const b = pn(item, 'b');
  const ub = ps(item, 'ub') as LengthUnit;
  const to = tier === 1 ? ua : ub;
  const conv = (v: number, u: LengthUnit) => convertLength(v, u, to) as number;
  const total = conv(a, ua) + (add ? 1 : -1) * conv(b, ub);
  const step = item.steps[0];
  if (step?.kind === 'number') {
    expect(step.answer, where).toBe(total);
    return;
  }
  expect(Number(correctParams(item).n), where).toBe(total);
  const partWithBug = (bug: Misconception, v: number, u: LengthUnit) =>
    bugConvertValue(bug, v, u, to) ?? (convertLength(v, u, to) as number);
  for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
    if (o.correct) continue;
    const bug = o.misconception as Misconception;
    if (bug === 'near-miss') continue;
    const want = partWithBug(bug, a, ua) + (add ? 1 : -1) * partWithBug(bug, b, ub);
    expect(Number(o.label.params?.n), `${where}: bug ${bug}`).toBe(want);
  }
}

function addSubMixedOracle(
  item: ReasoningItem,
  _tier: SkillTier,
  seed: number,
  add: boolean,
): void {
  const where = `meas-len-add-sub mixed #${seed}`;
  const m1 = parseMixed(ps(item, 'a'));
  const m2 = parseMixed(ps(item, 'b'));
  const to = ps(item, 'a').split(' ')[3] as LengthUnit;
  const total = (m1 + (add ? 1 : -1) * m2) / MM_PER_UNIT[to];
  expect(Number(correctParams(item).n), where).toBe(total);
  const partWithBug = (bug: Misconception, mm: number) => {
    const s = mm === m1 ? ps(item, 'a') : ps(item, 'b');
    const [big, bigUnit, small, smallUnit] = s.split(' ');
    return (
      bugMixedValue(
        bug,
        Number(big),
        bigUnit as LengthUnit,
        Number(small),
        smallUnit as LengthUnit,
        to,
      ) ?? mm / MM_PER_UNIT[to]
    );
  };
  for (const o of (choiceSteps(item)[0] as Extract<ReasoningStep, { kind: 'choice' }>).options) {
    if (o.correct) continue;
    const bug = o.misconception as Misconception;
    if (bug === 'near-miss') continue;
    const want = partWithBug(bug, m1) + (add ? 1 : -1) * partWithBug(bug, m2);
    expect(Number(o.label.params?.n), `${where}: bug ${bug}`).toBe(want);
  }
}

describe('length generators', () => {
  it('every length skill generates (unknown ids throw)', () => {
    expect(LENGTH_SKILLS).toEqual([
      'meas-len-ladder',
      'meas-len-convert',
      'meas-len-convert-far',
      'meas-len-compare',
      'meas-len-order',
      'meas-len-choose-unit',
      'meas-len-mixed',
      'meas-len-add-sub',
    ]);
    expect(() => lengthItemForSkill('meas-gram', mulberry32(1), 1)).toThrow();
  });

  for (const skillId of LENGTH_SKILLS)
    it(`${skillId}: valid items over 1000 seeds x 3 tiers, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = lengthItemForSkill(skillId, mulberry32(seed), tier);
          checkShape(item, skillId, tier, seed);
          const oracle = ORACLE[item.story.key];
          expect(
            oracle,
            `${skillId} t${tier} #${seed}: oracle for ${item.story.key}`,
          ).toBeDefined();
          oracle?.(item, tier, seed);
        }
      for (let seed = 0; seed < 20; seed++)
        for (const tier of [1, 2, 3] as SkillTier[])
          expect(lengthItemForSkill(skillId, mulberry32(seed), tier)).toEqual(
            lengthItemForSkill(skillId, mulberry32(seed), tier),
          );
    });

  it('tier 1 never jumps m<->mm and never offers mm objects', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const far = lengthItemForSkill('meas-len-convert-far', mulberry32(seed), 1);
      expect([ps(far, 'from'), ps(far, 'to')].sort().join(','), `convert-far #${seed}`).not.toBe(
        'm,mm',
      );
      // A tier-1 ladder has 2 rungs, so it can never span m to mm.
      const ladder = lengthItemForSkill('meas-len-ladder', mulberry32(seed), 1);
      expect(
        ps(ladder, 'chain')
          .replace(/\u202F/g, '')
          .split(' = '),
        `ladder #${seed}`,
      ).toHaveLength(2);
      const mixed = lengthItemForSkill('meas-len-mixed', mulberry32(seed), 1);
      if (mixed.story.key === 'lenMixedToSingle')
        expect([ps(mixed, 'ua'), ps(mixed, 'ub')], `mixed #${seed}`).not.toContain('m');
      else expect(ps(mixed, 'to'), `mixed #${seed}`).not.toBe('m');
      const choose = lengthItemForSkill('meas-len-choose-unit', mulberry32(seed), 1);
      const obj = OBJECTS.find((o) => o.item === ps(choose, 'item'));
      expect(obj?.unit, `choose-unit #${seed}`).not.toBe('mm');
    }
  });
});
