import { describe, expect, it } from 'vitest';
import { GEOMETRY_SKILLS } from '../../geometry/geometry-item-for-skill';
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import { buildValleyRounds, ValleyRoundFlow } from './valley-round-flow';
import { planValleyRounds, VALLEY_KIND, valleyFactPool } from './valley-round-plan';

const stat = (box: number, attempts = 2): FactStat => ({
  attempts,
  correct: attempts,
  totalMs: 4000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1,
  streak: 0,
  fluent: false,
  errs: [],
});

const allSeen = (box: number) =>
  Object.fromEntries(GEOMETRY_SKILLS.map((id) => [skillKey(id), stat(box)]));

describe('valley round plan', () => {
  it('a first run only uses midpoint, circle and right-angle skills', () => {
    const pool = valleyFactPool({});
    expect(pool.length).toBeGreaterThan(0);
    for (const key of pool)
      expect(['midpoint', 'circle', 'right-angle']).toContain(VALLEY_KIND[key.slice(3)]);
    const plan = planValleyRounds(pool.slice(0, 2), {}, 6);
    expect(plan).toHaveLength(6);
    expect(plan.every((r) => r.tier === 1)).toBe(true);
    expect(new Set(plan.map((r) => VALLEY_KIND[r.skillId])).size).toBe(3);
  });

  it('once the valley was played every geo skill joins, every kind shows up, kinds rotate', () => {
    const stats = allSeen(3);
    expect(valleyFactPool(stats)).toHaveLength(GEOMETRY_SKILLS.length);
    const plan = planValleyRounds([skillKey('geo-solid-parts')], stats, 6);
    expect(plan[0]?.skillId).toBe('geo-solid-parts');
    const kinds = plan.map((r) => VALLEY_KIND[r.skillId]);
    expect(new Set(kinds).size).toBe(5);
    for (let i = 1; i < kinds.length; i++) expect(kinds[i]).not.toBe(kinds[i - 1]);
    expect(plan.every((r) => r.tier === 2)).toBe(true);
  });

  it('tiers follow each skill box', () => {
    const stats = { ...allSeen(1), [skillKey('geo-midpoint')]: stat(5) };
    const plan = planValleyRounds([skillKey('geo-midpoint')], stats, 6);
    expect(plan.find((r) => r.skillId === 'geo-midpoint')?.tier).toBe(3);
  });
});

describe('valley round flow', () => {
  const flowFor = (skillId: string, tier: 1 | 2 | 3, seed = 4) =>
    new ValleyRoundFlow(buildValleyRounds([{ skillId, tier }], mulberry32(seed)), () => 0);

  it('the midpoint round starts with the stone tap, then the steps', () => {
    const flow = flowFor('geo-midpoint', 1);
    expect(flow.phase).toBe('action');
    expect(flow.tap('stone:1')).toBe('wrong');
    expect(flow.tap('stone:3')).toBe('right');
    expect(flow.phase).toBe('steps');
    expect(flow.answer(true, 5)).toBe('correct');
    const outcome = flow.completeSteps();
    expect(outcome).toMatchObject({ factKey: 'sk:geo-midpoint', correct: true, firstTry: false });
    expect(flow.phase).toBe('complete');
  });

  it('three misses on a step reveal it and record the round as not correct', () => {
    const flow = flowFor('geo-radius-diameter', 1);
    expect(flow.tap('pt:A')).toBe('wrong');
    expect(flow.tap('centre')).toBe('right');
    expect(flow.answer(false, 7)).toBe('wrong');
    expect(flow.answer(false, 9)).toBe('wrong');
    expect(flow.answer(false, 8)).toBe('revealed');
    const outcome = flow.completeSteps();
    expect(outcome).toMatchObject({ correct: false, usedHint: true, wrongAnswers: [7, 9, 8] });
  });

  it('any corner places the ê-ke; classify rounds have no action', () => {
    const angle = flowFor('geo-right-angle', 2);
    expect(angle.phase).toBe('action');
    expect(angle.tap('corner:2')).toBe('right');
    expect(angle.hint.wrongAttempts).toBe(0);
    expect(flowFor('geo-shape-classify', 2).phase).toBe('steps');
  });

  it('hints stop at rung 3 and count as used', () => {
    const flow = flowFor('geo-solid-parts', 1);
    expect([flow.takeHint(), flow.takeHint(), flow.takeHint(), flow.takeHint()]).toEqual([
      1, 2, 3, 3,
    ]);
    flow.tap('block');
    flow.answer(true, 6);
    expect(flow.completeSteps()).toMatchObject({ correct: true, firstTry: true, usedHint: true });
  });

  it('moves on round by round until done', () => {
    const rounds = buildValleyRounds(
      [
        { skillId: 'geo-shape-count', tier: 1 },
        { skillId: 'geo-solid-identify', tier: 2 },
      ],
      mulberry32(2),
    );
    const flow = new ValleyRoundFlow(rounds, () => 0);
    flow.answer(true, 'o0');
    flow.completeSteps();
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.phase).toBe('steps');
    flow.answer(true, ['o1']);
    flow.completeSteps();
    flow.next();
    expect(flow.done).toBe(true);
  });

  it('the board action has its own three tries, then each step has three', () => {
    const flow = flowFor('geo-midpoint', 1);
    expect(flow.tap('stone:1')).toBe('wrong');
    expect(flow.tap('stone:2')).toBe('wrong');
    expect(flow.tap('stone:3')).toBe('right');
    expect(flow.answer(false, 1)).toBe('wrong');
    expect(flow.answer(false, 2)).toBe('wrong');
    expect(flow.answer(true, 3)).toBe('correct');
    expect(flow.completeSteps()).toMatchObject({ correct: true, firstTry: false, usedHint: false });
  });

  it('2 + 2 misses over two steps do not reveal; 3 on one step do (not correct)', () => {
    const flow = flowFor('geo-solid-parts', 3);
    expect(flow.tap('block')).toBe('right');
    expect(flow.answer(false, 1)).toBe('wrong');
    expect(flow.answer(false, 2)).toBe('wrong');
    expect(flow.answer(true, 3)).toBe('correct');
    expect(flow.answer(false, 4)).toBe('wrong');
    expect(flow.answer(false, 5)).toBe('wrong');
    expect(flow.answer(false, 6)).toBe('revealed');
    expect(flow.completeSteps()).toMatchObject({
      correct: false,
      usedHint: true,
      wrongAnswers: [1, 2, 4, 5, 6],
    });
  });

  it('three misses on the action show the right target; the steps start a fresh budget', () => {
    const flow = flowFor('geo-midpoint', 1);
    expect(flow.tap('stone:1')).toBe('wrong');
    expect(flow.tap('stone:2')).toBe('wrong');
    expect(flow.tap('stone:4')).toBe('revealed');
    expect(flow.phase).toBe('steps');
    expect(flow.answer(false, 1)).toBe('wrong');
    expect(flow.answer(false, 2)).toBe('wrong');
    expect(flow.answer(true, 3)).toBe('correct');
    expect(flow.completeSteps()).toMatchObject({ correct: false, firstTry: false });
  });
});
