import { describe, expect, it } from 'vitest';
import type { GeoItem, GeoScene } from '../../geometry/geo-scene-types';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import {
  MEASUREMENT_SKILLS,
  measurementItemForSkill,
} from '../../measurement/measurement-item-for-skill';
import { renderMeasurementPrompt } from '../../measurement/measurement-strings';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { workshopHintStrings } from './workshop-hint-strings';
import { misconceptionNote, workshopHint } from './workshop-hints';

const hs = workshopHintStrings(defineStrings);
const render = (ref: { key: string; params?: Record<string, string | number> }) =>
  hs(ref.key as never, ref.params);
const numbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

/** Numbers the child can already see: story, step prompts, labelled scene values. */
function visibleNumbers(item: GeoItem): Set<number> {
  const seen = new Set<number>([1, 2, 4, 10]);
  const add = (ns: readonly number[]) => {
    for (const n of ns) seen.add(n);
  };
  add(numbers(renderMeasurementPrompt(item.story)));
  for (const step of playableSteps(item)) add(numbers(renderMeasurementPrompt(step.prompt)));
  const s: GeoScene = item.scene;
  if (s.kind === 'ruler') add([s.fromMm, s.fromMm / 10]);
  if (s.kind === 'side-polygon') add(s.sides.filter((_, i) => !s.hidden.includes(i)));
  if (s.kind === 'rect') {
    if (s.showWidth) add([s.width]);
    if (s.showHeight) add([s.height]);
    add([s.cut ?? 0, s.gate ?? 0]);
  }
  if (s.kind === 'balance') add([...s.weights, s.count]);
  if (s.kind === 'jug') add([s.capacity, s.marks]);
  if (s.kind === 'thermometers') add([s.minorStep]);
  return seen;
}

describe('workshop hint ladder', () => {
  it('rung 1 encourages; rungs 2-3 never state an answer or a number the child cannot see', () => {
    for (const id of MEASUREMENT_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 1; seed <= 150; seed++) {
          const item = measurementItemForSkill(id, mulberry32(seed), tier);
          const seen = visibleNumbers(item);
          playableSteps(item).forEach((step, i) => {
            expect(workshopHint(item, 1, i).key).toBe('h1');
            for (const rung of [2, 3]) {
              const text = render(workshopHint(item, rung, i));
              expect(text.length, `${id} t${tier} s${i} r${rung}`).toBeGreaterThan(10);
              expect(text, `${id} t${tier} s${i} r${rung}`).not.toMatch(/[{}]|undefined|NaN/);
              if (step.kind === 'number')
                expect(text, `${id} t${tier} s${i}`).not.toMatch(
                  new RegExp(`=\\s*${step.answer}\\b`),
                );
              for (const n of numbers(text))
                expect(seen.has(n), `${id} t${tier} seed ${seed} step ${i}: ${text}`).toBe(true);
            }
          });
        }
  });

  it('perimeter hints walk the edge; area hints cover with squares', () => {
    const rng = () => mulberry32(3);
    const perim = measurementItemForSkill('meas-perimeter-rect', rng(), 1);
    const area = measurementItemForSkill('meas-area-count', rng(), 1);
    expect(render(workshopHint(perim, 2, 0))).toContain('đi một vòng quanh viền');
    expect(render(workshopHint(area, 2, 0))).toContain('đếm ô vuông phủ kín');
  });

  it('a chu vi / diện tích mix-up names the right concept', () => {
    expect(render(misconceptionNote('perimeter-not-area') ?? { key: '' })).toContain('Diện tích');
    expect(render(misconceptionNote('area-not-perimeter') ?? { key: '' })).toContain('Chu vi');
    expect(misconceptionNote('near-miss')).toBeNull();
  });
});
