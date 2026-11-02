import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { firstOperation } from './garden-expression-steps';
import { GardenRoundFlow } from './garden-round-flow';
import {
  buildGardenItem,
  GARDEN_SKILLS,
  gardenKindOf,
  gardenSkillPool,
  planGardenRounds,
} from './garden-round-plan';

const stat = (box: number): FactStat => ({
  attempts: 3,
  correct: 2,
  totalMs: 9000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1,
  streak: 0,
  fluent: false,
  errs: [],
});

const rightAnswer = (step: ReasoningStep) => {
  if (step.kind === 'number') return step.answer;
  if (step.kind === 'verdict') return step.answer;
  const right = step.options.filter((o) => o.correct).map((o) => o.id);
  return step.kind === 'multi' ? right : (right[0] as string);
};

describe('garden skill pool and round plan', () => {
  it('drills the eight pattern, unknown and expression skills', () => {
    expect(gardenSkillPool()).toEqual(GARDEN_SKILLS.map((id) => `sk:${id}`));
    expect(GARDEN_SKILLS).toHaveLength(8);
    expect(gardenKindOf('pattern-skip-count')).toBe('pattern');
    expect(gardenKindOf('unknown-mul-div')).toBe('balance');
    expect(gardenKindOf('expr-from-story')).toBe('bag');
  });

  it('rotates the three round kinds (never two in a row) and keeps the planner first', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = mulberry32(seed);
      const pool = gardenSkillPool();
      const planned = Array.from({ length: 6 }, () => pool[Math.floor(rng() * 3)] as string);
      const rounds = planGardenRounds(planned, {}, rng, 6);
      expect(rounds).toHaveLength(6);
      expect(rounds[0]?.factKey).toBe(planned[0]);
      for (let i = 1; i < rounds.length; i++) {
        expect(rounds[i]?.kind).not.toBe(rounds[i - 1]?.kind);
      }
      expect(new Set(rounds.map((r) => r.kind)).size).toBe(3);
      for (const r of rounds) {
        expect(r.factKey).toBe(`sk:${r.skillId}`);
        expect(gardenKindOf(r.skillId)).toBe(r.kind);
      }
    }
  });

  it('starts every skill at tier 1 and raises it with the skill box', () => {
    const plan = (box?: number) =>
      planGardenRounds(
        ['sk:pattern-add'],
        box ? { 'sk:pattern-add': stat(box) } : {},
        mulberry32(4),
        1,
      );
    expect(plan()[0]?.item.tier).toBe(1);
    expect(plan(3)[0]?.item.tier).toBe(2);
    expect(plan(5)[0]?.item.tier).toBe(3);
  });

  it('keeps every number in prompts, steps and answers within 0..100', () => {
    for (const id of GARDEN_SKILLS) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 40; seed++) {
          const item = buildGardenItem(id, mulberry32(seed), tier);
          for (const n of item.work) expect(n).toBeLessThanOrEqual(100);
          const text = JSON.stringify(item);
          for (const m of text.matchAll(/\d+/g)) expect(Number(m[0])).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('offers three seed packets for a tier-1 pattern', () => {
    const item = buildGardenItem('pattern-add', mulberry32(9), 1);
    const step = item.steps[0] as ReasoningStep;
    expect(step.kind).toBe('choice');
    if (step.kind !== 'choice') return;
    expect(step.options).toHaveLength(3);
    const right = step.options.find((o) => o.correct);
    expect(right?.label).toEqual({ key: 'gardenPacket', params: { n: item.work[4] } });
  });

  it('expression rounds ask which part comes first, then its value, then the rest', () => {
    for (const id of ['expr-order', 'expr-brackets'] as const) {
      for (const tier of [1, 2, 3] as const) {
        const item = buildGardenItem(id, mulberry32(11 + tier), tier);
        const [first, second] = item.steps;
        const text = String(item.story.params?.text);
        const { part } = firstOperation(text);
        expect(first?.kind).toBe('choice');
        if (first?.kind !== 'choice') continue;
        expect(first.prompt.key).toBe('gardenFirstOp');
        expect(first.options.length).toBeGreaterThanOrEqual(2);
        expect(first.options.find((o) => o.correct)?.label.params?.text).toBe(part);
        expect(second).toEqual({
          kind: 'number',
          prompt: { key: 'askPart', params: { text: part } },
          answer: item.work[0],
        });
        expect(item.steps.filter((s) => s.prompt.key === 'askPart')).toHaveLength(1);
      }
    }
  });

  it('finds the part done first: brackets, then × and :', () => {
    expect(firstOperation('(28 + 12) × 2 − 15')).toEqual({
      part: '28 + 12',
      others: [
        { text: '12 × 2', misconception: 'ignore-brackets' },
        { text: '2 − 15', misconception: 'left-to-right' },
      ],
    });
    expect(firstOperation('7 + 3 × 4')).toEqual({
      part: '3 × 4',
      others: [{ text: '7 + 3', misconception: 'left-to-right' }],
    });
    expect(firstOperation('50 − (10 + 5)').part).toBe('10 + 5');
    expect(firstOperation('50 − (10 + 5)').others[0]?.text).toBe('50 − 10');
  });
});

describe('garden round flow', () => {
  const rounds = planGardenRounds(gardenSkillPool().slice(0, 6), {}, mulberry32(21), 6);

  it('records one outcome per round under the skill key', () => {
    let t = 0;
    const flow = new GardenRoundFlow(rounds, () => (t += 500));
    const outcomes = [];
    while (!flow.done) {
      const steps = playableSteps(flow.round?.item as never);
      for (let i = 0; i < steps.length; i++) {
        expect(flow.stepIndex).toBe(i);
        const result = flow.submit(rightAnswer(steps[i] as ReasoningStep));
        expect(result.verdict).toBe('correct');
        if (i < steps.length - 1) expect(result.outcome).toBeUndefined();
        else outcomes.push(result.outcome);
      }
      expect(flow.submit(1)).toEqual({ verdict: 'ignored' });
      flow.next();
    }
    expect(outcomes.map((o) => o?.factKey)).toEqual(rounds.map((r) => r.factKey));
    expect(outcomes.every((o) => o?.correct && o.firstTry && !o.usedHint)).toBe(true);
  });

  it('three misses reveal the round (recorded as not correct); hints restart per step', () => {
    const bag = {
      kind: 'bag' as const,
      skillId: 'expr-order',
      factKey: 'sk:expr-order',
      item: buildGardenItem('expr-order', mulberry32(3), 1),
    };
    const flow = new GardenRoundFlow([bag, ...rounds], () => 0);
    const steps = playableSteps(bag.item);
    expect(steps).toHaveLength(3);
    expect(flow.takeHint()).toBe(1);
    expect(flow.submit(rightAnswer(steps[0] as ReasoningStep)).verdict).toBe('correct');
    expect(flow.hint.rung).toBe(0);
    expect(flow.submit(-1).verdict).toBe('wrong');
    expect(flow.hintOffered(0)).toBe(false);
    expect(flow.submit(-2).verdict).toBe('wrong');
    expect(flow.hintOffered(0)).toBe(true);
    const last = flow.submit(-3);
    expect(last.verdict).toBe('revealed');
    expect(last.outcome).toMatchObject({
      correct: false,
      usedHint: true,
      wrongAnswers: [-1, -2, -3],
    });
    expect(flow.roundComplete).toBe(true);
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.hint.rung).toBe(0);
  });

  it('misses count per step: 2 + 2 do not reveal, 3 on one step show that step and go on', () => {
    const bag = {
      kind: 'bag' as const,
      skillId: 'expr-order',
      factKey: 'sk:expr-order',
      item: buildGardenItem('expr-order', mulberry32(3), 1),
    };
    const flow = new GardenRoundFlow([bag], () => 0);
    const steps = playableSteps(bag.item) as ReasoningStep[];
    const wrongOf = (step: ReasoningStep) =>
      step.kind === 'choice'
        ? (step.options.find((o) => !o.correct)?.id as string)
        : (rightAnswer(step) as number) + 1;
    expect(flow.submit(wrongOf(steps[0] as ReasoningStep)).verdict).toBe('wrong');
    expect(flow.submit(wrongOf(steps[0] as ReasoningStep)).verdict).toBe('wrong');
    expect(flow.submit(rightAnswer(steps[0] as ReasoningStep)).verdict).toBe('correct');
    expect(flow.submit(-1).verdict).toBe('wrong');
    expect(flow.submit(-2).verdict).toBe('wrong');
    expect(flow.submit(rightAnswer(steps[1] as ReasoningStep)).verdict).toBe('correct');
    expect(flow.submit(-3).verdict).toBe('wrong');
    expect(flow.submit(-4).verdict).toBe('wrong');
    expect(flow.submit(-5)).toEqual({
      verdict: 'revealed',
      outcome: expect.objectContaining({
        correct: false,
        firstTry: false,
        usedHint: true,
        wrongAnswers: [-1, -2, -3, -4, -5],
      }),
    });
    expect(flow.roundComplete).toBe(true);
  });

  it('a step shown after three misses moves on; the round ends not correct', () => {
    const bag = {
      kind: 'bag' as const,
      skillId: 'expr-order',
      factKey: 'sk:expr-order',
      item: buildGardenItem('expr-order', mulberry32(3), 1),
    };
    const flow = new GardenRoundFlow([bag], () => 0);
    const steps = playableSteps(bag.item) as ReasoningStep[];
    expect(flow.submit(rightAnswer(steps[0] as ReasoningStep)).verdict).toBe('correct');
    flow.submit(-1);
    flow.submit(-2);
    expect(flow.submit(-3)).toEqual({ verdict: 'revealed' });
    expect(flow.stepIndex).toBe(2);
    expect(flow.roundComplete).toBe(false);
    expect(flow.hint.wrongAttempts).toBe(0);
    const last = flow.submit(rightAnswer(steps[2] as ReasoningStep));
    expect(last.verdict).toBe('correct');
    expect(last.outcome).toMatchObject({ correct: false, firstTry: false, usedHint: true });
  });
});
