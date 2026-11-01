import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { reasoningItemForSkill } from '../../reasoning/reasoning-item-for-skill';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { renderPrompt } from '../../reasoning/reasoning-strings';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { reasoningHint } from './reasoning-round-hints';

// The skills of field, forest, city and tower (their *_REASONING_SKILLS lists).
const SKILLS = [
  'wp-times-then-add',
  'pattern-skip-count',
  'div-rem-floor',
  'div-rem-ceil',
  'wp-times-compare',
  'unknown-mul-div',
  'expr-brackets',
  'expr-order',
  'tf-explain',
];
const TIERS: readonly SkillTier[] = [1, 2, 3];
const SEEDS = 300;

const numbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number);
const shownText = (step: ReasoningStep) =>
  `${renderPrompt(step.prompt)} ${step.kind === 'verdict' ? renderPrompt(step.statement) : ''}`;

describe('reasoningHint', () => {
  it('no rung 2+ gives the current step its answer: every number is already on screen', () => {
    const leaks: string[] = [];
    for (const skill of SKILLS)
      for (const tier of TIERS)
        for (let seed = 0; seed < SEEDS; seed++) {
          const item = reasoningItemForSkill(skill, mulberry32(seed), tier);
          const steps = playableSteps(item);
          for (const [index, step] of steps.entries()) {
            // On screen: the story, the prompts so far and the answers of the steps already done.
            const shown = new Set(numbers(renderPrompt(item.story)));
            for (const done of steps.slice(0, index + 1))
              for (const n of numbers(shownText(done))) shown.add(n);
            for (const done of steps.slice(0, index))
              if (done.kind === 'number') shown.add(done.answer);
            for (const rung of [2, 3]) {
              const text = reasoningHint(item, rung, index);
              const extra = numbers(text).filter((n) => !shown.has(n));
              const gives = step.kind === 'number' && numbers(text).includes(step.answer);
              if (extra.length || (gives && !shown.has(step.answer)))
                leaks.push(`${skill} t${tier} s${seed} step ${index} rung ${rung}: ${text}`);
            }
          }
        }
    expect(leaks.slice(0, 5)).toEqual([]);
  });

  it('follows the step: the second step shows its own operation, not the first one again', () => {
    const item = reasoningItemForSkill('wp-times-then-add', mulberry32(7), 1);
    const [first, second] = playableSteps(item);
    if (first?.kind !== 'number' || second?.kind !== 'number') throw new Error('two number steps');
    const { a, n } = item.story.params as { a: number; n: number };
    expect(reasoningHint(item, 3, 0)).toContain(`${a} × ${n} = ?`);
    expect(reasoningHint(item, 3, 1)).toContain(`${first.answer} + ${a} = ?`);
  });
});
