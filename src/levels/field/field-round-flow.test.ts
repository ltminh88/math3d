import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import {
  answerEquations,
  answerTotal,
  askHint,
  planFieldRounds,
  roundOutcome,
  startRound,
} from './field-round-flow';

const rng = () => mulberry32(7);
const plan = (facts: string[], box = 1) => planFieldRounds({ facts, boxOf: () => box, rng: rng() });

describe('planFieldRounds', () => {
  it('turns pooled facts into rows x cols plots, small factor as rows', () => {
    const [round] = plan(['mul:3x4']);
    expect(round).toMatchObject({ factKey: 'mul:3x4', rows: 3, cols: 4, total: 12 });
  });

  it('alternates build (a) and equations (b) while the fact is new', () => {
    const rounds = plan(['mul:3x4', 'mul:4x7', 'mul:3x9', 'mul:2x4', 'mul:3x5']);
    expect(rounds.map((r) => r.type)).toEqual([
      'build',
      'equations',
      'build',
      'equations',
      'build',
    ]);
  });

  it('square facts never ask for two different equations', () => {
    expect(plan(['mul:2x3', 'mul:4x4']).map((r) => r.type)).toEqual(['build', 'build']);
  });

  it('box 3+ facts are recalled (c), shown in either order', () => {
    const rounds = planFieldRounds({
      facts: Array.from({ length: 12 }, () => 'mul:3x8'),
      boxOf: () => 3,
      rng: rng(),
    });
    expect(rounds.every((r) => r.type === 'recall')).toBe(true);
    const orders = new Set(rounds.map((r) => r.shownOrder.join('x')));
    expect(orders).toEqual(new Set(['3x8', '8x3']));
  });

  it('equation rounds offer both orders plus two distractors that do not describe the plot', () => {
    const round = plan(['mul:2x3', 'mul:3x4'])[1];
    const labels = round?.options.map((o) => o.label) ?? [];
    expect(new Set(labels).size).toBe(4);
    expect(
      round?.options
        .filter((o) => o.correct)
        .map((o) => o.label)
        .sort(),
    ).toEqual(['3 × 4', '4 × 3']);
    expect(round?.options.filter((o) => !o.correct).every((o) => o.value !== 12)).toBe(true);
  });
});

describe('round answers', () => {
  const [build, equations] = plan(['mul:3x4', 'mul:3x4']);
  if (!build || !equations) throw new Error('plan failed');

  it('a correct first answer is a clean first try', () => {
    const { verdict, state } = answerTotal(startRound(build), 12);
    expect(verdict).toBe('correct');
    expect(roundOutcome(state, 4000)).toEqual({
      factKey: 'mul:3x4',
      ms: 4000,
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
  });

  it('wrong answers are kept, hints are counted, and the third miss reveals the answer', () => {
    let state = startRound(build);
    state = answerTotal(state, 7).state;
    state = askHint(state);
    expect(state.hint.rung).toBe(1);
    const second = answerTotal(state, 11);
    expect(second.verdict).toBe('wrong');
    const third = answerTotal(second.state, 13);
    expect(third.verdict).toBe('revealed');
    expect(roundOutcome(third.state, 9000)).toMatchObject({
      correct: false,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [7, 11, 13],
    });
    // A finished round ignores further answers.
    expect(answerTotal(third.state, 12).verdict).toBe('revealed');
  });

  it('hint rungs stop at 4 (the worked answer only comes from failing)', () => {
    let state = startRound(build);
    for (let i = 0; i < 6; i++) state = askHint(state);
    expect(state.hint.rung).toBe(4);
  });

  it('equations need exactly both correct choices; a wrong pick records its value', () => {
    const right = equations.options.filter((o) => o.correct).map((o) => o.id);
    const wrong = equations.options.find((o) => !o.correct);
    if (!wrong) throw new Error('no distractor');
    const missed = answerEquations(startRound(equations), [right[0] as string, wrong.id]);
    expect(missed.verdict).toBe('wrong');
    expect(missed.state.wrongAnswers).toEqual([wrong.value]);
    expect(answerEquations(missed.state, right).verdict).toBe('correct');
    expect(roundOutcome(answerEquations(missed.state, right).state, 1).firstTry).toBe(false);
  });
});
