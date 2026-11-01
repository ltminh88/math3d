import { describe, expect, it } from 'vitest';
import { GEOMETRY_SKILLS, geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { renderGeometryPrompt } from '../../geometry/geometry-strings';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { valleyHint } from './valley-hints';
import { VALLEY_KIND } from './valley-round-plan';
import { valleyStrings, valleyText } from './valley-strings';

const vs = valleyStrings(defineStrings);
const TIERS: readonly SkillTier[] = [1, 2, 3];
const word = (text: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${text}($|[^\\p{L}\\p{N}])`, 'u');

const answersOf = (step: ReasoningStep): string[] => {
  if (step.kind === 'number') return [String(step.answer)];
  if (step.kind === 'verdict') return [];
  // Numbers ("6", "14 cm") and figure names ("B", "OA"); named terms ("Khối lập phương") are
  // what a definition is about, so they are not answers a hint could leak.
  return step.options
    .filter((o) => o.correct)
    .map((o) => renderGeometryPrompt(o.label))
    .filter((label) => /^\d+( \S+)?$|^[A-Z]{1,2}$/.test(label));
};

describe('valley hint ladder', () => {
  it('rung 1 encourages, rung 2 defines, rung 3 adds the visual aid', () => {
    const item = geometryItemForSkill('geo-midpoint', mulberry32(1), 1);
    expect(valleyHint(item, 1)).toEqual({ key: 'hint1', aid: false });
    expect(valleyHint(item, 2)).toEqual({ key: 'defMidpoint', aid: false });
    expect(valleyHint(item, 3)).toEqual({ key: 'aidMidpoint', aid: true });
    expect(vs('defMidpoint')).toContain('trung điểm');
  });

  it('the right-angle definition is the ê-ke fit, also for turned figures', () => {
    const item = geometryItemForSkill('geo-right-angle', mulberry32(2), 2);
    expect(valleyText(vs, valleyHint(item, 2).key)).toMatch(/ê-ke/);
  });

  it('shape definitions follow the target and never call a square a rectangle', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const item = geometryItemForSkill('geo-shape-classify', mulberry32(seed), 2);
      const target = playableSteps(item)[0]?.prompt.key.split('_')[1];
      expect(valleyHint(item, 2).key).toBe(`def_${target}`);
    }
    expect(vs('def_rect')).not.toMatch(/vuông là hình chữ nhật|hình vuông/);
  });

  it('no rung from 2 on gives the answer (every skill, tier, 300 seeds)', () => {
    for (const skill of GEOMETRY_SKILLS) {
      expect(VALLEY_KIND[skill]).toBeDefined();
      for (const tier of TIERS) {
        for (let seed = 1; seed <= 300; seed++) {
          const item = geometryItemForSkill(skill, mulberry32(seed), tier);
          const answers = playableSteps(item).flatMap(answersOf);
          for (const rung of [2, 3] as const) {
            const { key } = valleyHint(item, rung);
            const text = valleyText(vs, key);
            expect(text).not.toBe(key);
            for (const answer of answers)
              expect(text, `${skill} t${tier} #${seed}`).not.toMatch(word(answer));
          }
        }
      }
    }
  });
});
