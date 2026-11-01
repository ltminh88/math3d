import { describe, expect, it } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import type { HintRung } from '../../learning/hint-ladder';
import { mulberry32 } from '../../learning/seeded-rng';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningItem } from '../../reasoning/reasoning-types';
import { gardenHintSpec } from './garden-hints';
import { buildGardenItem, GARDEN_SKILLS } from './garden-round-plan';
import { gardenStrings } from './garden-strings';

const gs = gardenStrings(defineStrings);

const item = (
  skillId: string,
  story: ReasoningItem['story'],
  steps: ReasoningItem['steps'],
  work: number[] = [],
): ReasoningItem => ({ skillId, tier: 2, story, steps, work });

const number = (key: string, answer: number, params?: Record<string, number | string>) => ({
  kind: 'number' as const,
  prompt: params ? { key, params } : { key },
  answer,
});

describe('garden hint ladder', () => {
  const pattern = item(
    'pattern-add',
    { key: 'patternNext', params: { terms: '10, 15, 20, ?, ?' } },
    [number('askTerm', 25, { pos: 4 }), number('askTerm', 30, { pos: 5 })],
    [10, 15, 20, 25, 30],
  );

  it('rung 1 encourages', () => {
    expect(gardenHintSpec(1, pattern, 0)).toEqual({ key: 'hint1', vars: {} });
  });

  it('patterns: the rule in words, then the next term worked with "?"', () => {
    expect(gardenHintSpec(2, pattern, 0)).toEqual({ key: 'hintRuleAdd', vars: { d: 5 } });
    expect(gardenHintSpec(3, pattern, 1)).toEqual({
      key: 'hintWork',
      vars: { calc: '25 + 5 = ?' },
    });
    const down = item('pattern-sub', pattern.story, pattern.steps, [40, 37, 34, 31, 28]);
    expect(gardenHintSpec(2, down, 0)).toEqual({ key: 'hintRuleSub', vars: { d: 3 } });
    expect(gardenHintSpec(4, down, 0)).toEqual({
      key: 'hintCount',
      vars: { sequence: '34, 33, 32, ?' },
    });
  });

  it('the balance: the inverse operation in words, then worked with "?"', () => {
    const eq = (text: string, answer: number) =>
      item('unknown-add-sub', { key: 'unknownEq', params: { text } }, [
        number('askUnknown', answer),
      ]);
    expect(gardenHintSpec(2, eq('? + 23 = 80', 57), 0).key).toBe('hintFindAddend');
    expect(gardenHintSpec(3, eq('? + 23 = 80', 57), 0).vars).toEqual({ calc: '80 − 23 = ?' });
    expect(gardenHintSpec(2, eq('? − 8 = 30', 38), 0).key).toBe('hintFindMinuend');
    expect(gardenHintSpec(2, eq('45 − ? = 30', 15), 0).key).toBe('hintFindSubtrahend');
    expect(gardenHintSpec(3, eq('7 × ? = 56', 8), 0).vars).toEqual({ calc: '56 : 7 = ?' });
    expect(gardenHintSpec(3, eq('? : 4 = 9', 36), 0).vars).toEqual({ calc: '9 × 4 = ?' });
    expect(gardenHintSpec(2, eq('56 : ? = 8', 7), 0).key).toBe('hintFindDivisor');
  });

  it('expressions: "trong ngoặc trước" / "nhân, chia trước", then the first step worked', () => {
    const bag = buildGardenItem('expr-brackets', mulberry32(5), 1);
    expect(gardenHintSpec(2, bag, 0).key).toBe('hintBrackets');
    const order = buildGardenItem('expr-order', mulberry32(5), 1);
    expect(gardenHintSpec(2, order, 0).key).toBe('hintMulFirst');
    const text = String(order.story.params?.text);
    const part = order.steps[1]?.prompt.params?.text as string;
    expect(gardenHintSpec(3, order, 2)).toEqual({
      key: 'hintAfterPart',
      vars: {
        part,
        value: order.work[0] as number,
        calc: `${text.replace(part, String(order.work[0]))} = ?`,
      },
    });
  });

  it('no rung ever states the answer of the step it helps with', () => {
    for (const id of GARDEN_SKILLS) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 30; seed++) {
          const it = buildGardenItem(id, mulberry32(seed), tier);
          playableSteps(it).forEach((step, index) => {
            for (const rung of [1, 2, 3, 4] as HintRung[]) {
              const spec = gardenHintSpec(rung, it, index);
              // The problem's own equation may be quoted back; it is not the answer.
              const text = gs(spec.key, spec.vars).replace(String(it.story.params?.text), '');
              if (step.kind === 'number')
                expect(text).not.toMatch(new RegExp(`= ${step.answer}(\\D|$)`));
              if (step.kind === 'choice') {
                const right = step.options.find((o) => o.correct)?.label.params;
                const shown = String(right?.text ?? right?.n);
                if (step.prompt.key === 'gardenFirstOp') expect(text).not.toContain(shown);
                else expect(text).not.toMatch(new RegExp(`= ${shown}(\\D|$)`));
              }
            }
          });
        }
      }
    }
  });
});
