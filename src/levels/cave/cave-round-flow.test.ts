import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import type { ReasoningItem, ReasoningStep } from '../../reasoning/reasoning-types';
import { buildCaveChambers, type CaveChamber } from './cave-chamber-formats';
import { CaveRoundFlow } from './cave-round-flow';

const ref = (key: string) => ({ key });

function chamber(skillId: string, steps: ReasoningStep[]): CaveChamber {
  const item: ReasoningItem = { skillId, tier: 1, story: ref('s'), steps, work: [] };
  const format = skillId === 'tf-explain' ? 'tf-explain' : 'choose-all';
  return { skillId, format, family: 'reasoning', item, steps: [...steps] };
}

const multi: ReasoningStep = {
  kind: 'multi',
  prompt: ref('p'),
  options: [
    { id: 'o0', label: ref('a'), correct: true },
    { id: 'o1', label: ref('b'), correct: false, misconception: 'near-miss' },
    { id: 'o2', label: ref('c'), correct: true },
  ],
};
const verdictFalse: ReasoningStep = {
  kind: 'verdict',
  prompt: ref('p'),
  statement: ref('s'),
  answer: false,
  fix: { prompt: ref('f'), answer: 3 },
};
const fixStep: ReasoningStep = { kind: 'number', prompt: ref('f'), answer: 3 };
const clock = () => 1000;

describe('cave round flow', () => {
  it('scores choose-all only when all and only the right ones are chosen', () => {
    const flow = new CaveRoundFlow([chamber('choose-all-correct', [multi])], clock);
    expect(flow.answer(['o0']).verdict).toBe('wrong');
    expect(flow.answer(['o0', 'o1', 'o2']).verdict).toBe('wrong');
    const result = flow.answer(['o2', 'o0']);
    expect(result.verdict).toBe('correct');
    expect(result.outcome).toMatchObject({ factKey: 'sk:choose-all-correct', correct: true });
    expect(result.outcome?.firstTry).toBe(false);
  });

  it('records a verdict and its fix as one question', () => {
    const flow = new CaveRoundFlow([chamber('tf-explain', [verdictFalse, fixStep])], clock);
    const first = flow.answer(false);
    expect(first).toEqual({ verdict: 'correct' });
    expect(flow.stepIndex).toBe(1);
    expect(flow.answer(4).verdict).toBe('wrong');
    const done = flow.answer(3);
    expect(done.outcome).toMatchObject({
      factKey: 'sk:tf-explain',
      correct: true,
      firstTry: false,
    });
    expect(done.outcome?.wrongAnswers).toEqual([4]);
    expect(flow.roundComplete).toBe(true);
  });

  it('reveals after three misses across steps (recorded not correct)', () => {
    const flow = new CaveRoundFlow([chamber('tf-explain', [verdictFalse, fixStep])], clock);
    expect(flow.answer(true).verdict).toBe('wrong');
    expect(flow.answer(false).verdict).toBe('correct');
    expect(flow.answer(1).verdict).toBe('wrong');
    const revealed = flow.answer(2);
    expect(revealed.verdict).toBe('revealed');
    expect(revealed.outcome).toMatchObject({ correct: false, usedHint: true });
    expect(revealed.outcome?.wrongAnswers).toEqual([1, 2]);
    expect(flow.answer(3).verdict).toBe('ignored');
  });

  it('offers hints up to rung 3, then moves to the next chamber and ends', () => {
    const chambers = buildCaveChambers(['tf-explain', 'expr-order'], {}, mulberry32(4));
    const flow = new CaveRoundFlow(chambers, clock);
    expect(flow.hintOffered(10_000)).toBe(true);
    expect([flow.takeHint(), flow.takeHint(), flow.takeHint()]).toEqual([1, 2, 3]);
    expect(flow.hintOffered(10_000)).toBe(false);
    for (const step of flow.chamber?.steps ?? []) {
      flow.answer(step.kind === 'verdict' || step.kind === 'number' ? step.answer : 'x');
    }
    expect(flow.roundComplete).toBe(true);
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.hint.rung).toBe(0);
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.done).toBe(false);
  });

  it('restarts the hint ladder on each new step; hints taken still count for the chamber', () => {
    const flow = new CaveRoundFlow([chamber('tf-explain', [verdictFalse, fixStep])], clock);
    expect([flow.takeHint(), flow.takeHint(), flow.takeHint()]).toEqual([1, 2, 3]);
    expect(flow.answer(false)).toEqual({ verdict: 'correct' });
    expect(flow.hint.rung).toBe(0);
    expect(flow.hintOffered(10_000)).toBe(true);
    expect(flow.takeHint()).toBe(1);
    expect(flow.answer(3).outcome).toMatchObject({ correct: true, usedHint: true });
  });

  it('misses count per step: 2 + 2 do not reveal, 3 on one step do', () => {
    const flow = new CaveRoundFlow([chamber('tf-explain', [verdictFalse, fixStep])], clock);
    expect(flow.answer(true).verdict).toBe('wrong');
    expect(flow.answer(true).verdict).toBe('wrong');
    expect(flow.answer(false)).toEqual({ verdict: 'correct' });
    expect(flow.answer(1).verdict).toBe('wrong');
    expect(flow.answer(2).verdict).toBe('wrong');
    const solved = flow.answer(3);
    expect(solved.verdict).toBe('correct');
    expect(solved.outcome).toMatchObject({ correct: true, firstTry: false, usedHint: false });
  });

  it('three misses on the first step show it and go on; the chamber ends not correct', () => {
    const flow = new CaveRoundFlow([chamber('tf-explain', [verdictFalse, fixStep])], clock);
    flow.answer(true);
    flow.answer(true);
    expect(flow.answer(true)).toEqual({ verdict: 'revealed' });
    expect(flow.stepIndex).toBe(1);
    expect(flow.roundComplete).toBe(false);
    expect(flow.hint.wrongAttempts).toBe(0);
    const last = flow.answer(3);
    expect(last.verdict).toBe('correct');
    expect(last.outcome).toMatchObject({ correct: false, firstTry: false, usedHint: true });
  });
});
