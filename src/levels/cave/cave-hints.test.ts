import { describe, expect, it } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { buildCaveChambers, CAVE_SKILLS, type CaveChamber } from './cave-chamber-formats';
import { caveHintText, firstStepExpression, renderOf } from './cave-hints';
import { caveStrings } from './cave-strings';

const cs = caveStrings(defineStrings);
const numbers = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

/** What the child already sees: the story, the steps up to now and the answers given. */
function visibleText(c: CaveChamber, stepIndex: number): string {
  const render = renderOf(c.family);
  const parts = [render(c.item.story)];
  c.steps.slice(0, stepIndex + 1).forEach((s, i) => {
    parts.push(render(s.prompt));
    if (s.kind === 'verdict') parts.push(render(s.statement));
    if (i < stepIndex && s.kind === 'number') parts.push(String(s.answer));
  });
  return parts.join(' ');
}

function hiddenAnswer(c: CaveChamber, step: ReasoningStep): string | number | null {
  if (step.kind === 'number') return step.answer;
  if (step.kind === 'choice') {
    const right = step.options.find((o) => o.correct);
    return right ? renderOf(c.family)(right.label) : null;
  }
  return null;
}

const chambersFor = (tier: SkillTier, seed: number) => {
  const box = tier === 1 ? 1 : tier === 2 ? 3 : 5;
  const stats = Object.fromEntries(CAVE_SKILLS.map((id) => [`sk:${id}`, { box }]));
  return buildCaveChambers(CAVE_SKILLS, stats as never, mulberry32(seed));
};

describe('cave hints', () => {
  it('no rung shows the result the step asks for (every skill × tier × step)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 25; seed++) {
        for (const c of chambersFor(tier, seed)) {
          c.steps.forEach((step, stepIndex) => {
            const seen = visibleText(c, stepIndex);
            const answer = hiddenAnswer(c, step);
            for (const rung of [1, 2, 3] as const) {
              const text = caveHintText(cs, rung, c, stepIndex);
              const where = `${c.skillId} t${tier} s${seed} step ${stepIndex} rung ${rung}`;
              expect(text.length, where).toBeGreaterThan(10);
              if (typeof answer === 'number' && numbers(text).includes(answer)) {
                expect(numbers(seen), `${where}: ${text}`).toContain(answer);
              }
              if (typeof answer === 'string' && !seen.includes(answer)) {
                expect(text.includes(answer), `${where}: ${text}`).toBe(false);
              }
            }
          });
        }
      }
    }
  });

  it('works the first step with a "?" result, and choose-all names one wrong sentence', () => {
    const [wp] = buildCaveChambers(['wp-times-then-add'], {}, mulberry32(2));
    const { a, n } = (wp?.item.story.params ?? {}) as { a: number; n: number };
    expect(firstStepExpression(wp as CaveChamber)).toBe(`${a} × ${n}`);
    expect(caveHintText(cs, 3, wp as CaveChamber, 0)).toContain(`${a} × ${n} = ?`);
    for (let seed = 1; seed <= 30; seed++) {
      const [all] = buildCaveChambers(['choose-all-correct'], {}, mulberry32(seed));
      const step = all?.steps[0];
      if (!all || step?.kind !== 'multi') throw new Error('choose-all is one multi step');
      const wrong = step.options
        .filter((o) => !o.correct)
        .map((o) => renderOf('reasoning')(o.label));
      const text = caveHintText(cs, 3, all, 0);
      if (wrong.length > 0) expect(wrong.some((w) => text.includes(w))).toBe(true);
    }
  });

  it('rung 2 draws the line diagram for word problems and restates the question', () => {
    const [wp] = buildCaveChambers(['wp-unit-then-times'], {}, mulberry32(5));
    const text = caveHintText(cs, 2, wp as CaveChamber, 0);
    expect(text).toContain('sơ đồ đoạn thẳng');
    expect(text).toContain(
      renderOf('reasoning')((wp as CaveChamber).steps[0]?.prompt ?? { key: '' }),
    );
  });
});
