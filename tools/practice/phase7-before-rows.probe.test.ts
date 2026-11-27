// TEMPORARY probe (delete before commit): Phase 7 before-rows — shapes per tier
// and distinct exact items for the mental ×/÷ skills and the 2d-1d small pools.
import { describe, expect, it } from 'vitest';
import { countShapes } from './repeat-metrics';
import { countSkill } from './pool-counting';

const SKILLS = [
  'mul-tens-mental',
  'mul-hundreds-mental',
  'div-tens-mental',
  'div-hundreds-mental',
  'mul-2d-1d',
  'div-2d-1d',
] as const;

describe('phase7 before rows', () => {
  it('prints shapes + distinct items per skill per tier', () => {
    for (const skill of SKILLS) {
      const shapes = [1, 2, 3].map((t) => countShapes(skill, t as 1 | 2 | 3));
      const items = [1, 2, 3].map((t) => countSkill(skill, t as 1 | 2 | 3, { draws: 1000 }).distinct);
      console.log(`${skill} shapes T1/T2/T3=${shapes.join('/')} distinct=${items.join('/')}`);
    }
    expect(true).toBe(true);
  });
});
