import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { ReasoningRoundFlow } from './reasoning-round-flow';
import { planReasoningRound } from './reasoning-round-slot';

function plan(skill: string, box = 3) {
  const stats = {
    [`sk:${skill}`]: {
      box,
      attempts: 1,
      correct: 1,
      totalMs: 1,
      lastSeenSession: 1,
      lastSeenAt: 1,
      errs: [],
    },
  };
  const p = planReasoningRound({
    stats: stats as never,
    facts: ['mul:2x3', 'mul:2x4'],
    skills: [skill],
    rng: mulberry32(9),
  });
  if (!p) throw new Error('no plan');
  return p;
}

describe('ReasoningRoundFlow', () => {
  it('right answers walk the steps and record once, correct first try, with the sk: key', () => {
    let t = 0;
    const p = plan('div-rem-floor');
    const flow = new ReasoningRoundFlow(p, () => (t += 100));
    const steps = playableSteps(p.item);
    const verdicts = steps.map((_, i) => flow.answer({ stepIndex: i, correct: true, answer: 1 }));
    expect(verdicts.slice(0, -1).every((v) => v.verdict === 'step' && !v.outcome)).toBe(true);
    const last = verdicts[verdicts.length - 1];
    expect(last?.verdict).toBe('correct');
    expect(last?.outcome).toMatchObject({
      factKey: 'sk:div-rem-floor',
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    expect(flow.answer({ stepIndex: 0, correct: true, answer: 1 }).verdict).toBe('ignored');
  });

  it('three misses reveal the answer: recorded, not correct; numeric misses kept', () => {
    const flow = new ReasoningRoundFlow(plan('wp-times-compare'), () => 0);
    expect(flow.answer({ stepIndex: 0, correct: false, answer: 12 }).verdict).toBe('wrong');
    expect(flow.answer({ stepIndex: 0, correct: false, answer: 'o2' }).verdict).toBe('wrong');
    const third = flow.answer({ stepIndex: 0, correct: false, answer: 13 });
    expect(third.verdict).toBe('revealed');
    expect(third.outcome).toMatchObject({
      correct: false,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [12, 13],
    });
    expect(flow.done).toBe(true);
  });

  it('hints climb encourage -> picture/first step -> strategy, then stop', () => {
    const flow = new ReasoningRoundFlow(plan('wp-times-then-add'), () => 0);
    const texts = [flow.takeHint(), flow.takeHint(), flow.takeHint()];
    expect(new Set(texts).size).toBe(3);
    expect(texts[1]).toMatch(/sơ đồ đoạn thẳng/i);
    expect(flow.canHint).toBe(false);
    const last = playableSteps(flow.plan.item)
      .map((_, i) => flow.answer({ stepIndex: i, correct: true, answer: 0 }))
      .pop();
    expect(last?.outcome?.usedHint).toBe(true);
    expect(last?.outcome?.correct).toBe(true);
  });

  it('misses count per step: 2 + 2 do not reveal, 3 on one step show it and go on', () => {
    const p = plan('pattern-add');
    const steps = playableSteps(p.item).length;
    expect(steps).toBeGreaterThanOrEqual(2);
    const flow = new ReasoningRoundFlow(p, () => 0);
    const miss = (stepIndex: number, answer: number) =>
      flow.answer({ stepIndex, correct: false, answer }).verdict;
    expect([miss(0, 1), miss(0, 2)]).toEqual(['wrong', 'wrong']);
    expect(flow.answer({ stepIndex: 0, correct: true, answer: 0 }).verdict).toBe('step');
    expect([miss(1, 3), miss(1, 4)]).toEqual(['wrong', 'wrong']);
    const third = flow.answer({ stepIndex: 1, correct: false, answer: 5 });
    expect(third.verdict).toBe('revealed');
    if (steps > 2) {
      expect(third.outcome).toBeUndefined();
      expect(flow.done).toBe(false);
      for (let i = 2; i < steps; i++) flow.answer({ stepIndex: i, correct: true, answer: 0 });
    }
    expect(flow.done).toBe(true);
  });

  it('a step shown mid-round moves on; the round is recorded once, not correct', () => {
    const p = plan('pattern-add');
    const steps = playableSteps(p.item).length;
    const flow = new ReasoningRoundFlow(p, () => 0);
    for (const a of [1, 2]) flow.answer({ stepIndex: 0, correct: false, answer: a });
    expect(flow.answer({ stepIndex: 0, correct: false, answer: 3 })).toEqual({
      verdict: 'revealed',
    });
    let last = flow.answer({ stepIndex: 1, correct: true, answer: 0 });
    for (let i = 2; i < steps; i++) last = flow.answer({ stepIndex: i, correct: true, answer: 0 });
    expect(last.verdict).toBe('correct');
    expect(last.outcome).toMatchObject({
      correct: false,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [1, 2, 3],
    });
  });
});
