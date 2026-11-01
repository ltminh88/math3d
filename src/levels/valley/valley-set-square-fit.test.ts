import { describe, expect, it } from 'vitest';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { layoutFigure } from './valley-figure-layout';
import { cornerAngleDeg, fitsSetSquare, turnPoint } from './valley-set-square-fit';

const TIERS: readonly SkillTier[] = [1, 2, 3];

describe('ê-ke fit (pure)', () => {
  it('a right angle fits however it is turned; others never do', () => {
    for (let turn = 0; turn < 360; turn += 7) {
      const at = turnPoint([0, 0], [0, 0], turn);
      const right = cornerAngleDeg(
        turnPoint([3, 0], [0, 0], turn),
        at,
        turnPoint([0, 2], [0, 0], turn),
      );
      expect(fitsSetSquare(right)).toBe(true);
      for (const deg of [45, 60, 75, 88, 92, 105, 120, 135]) {
        const rad = (deg * Math.PI) / 180;
        const arm: [number, number] = [2 * Math.cos(rad), 2 * Math.sin(rad)];
        const angle = cornerAngleDeg(
          turnPoint([3, 0], [0, 0], turn),
          at,
          turnPoint(arm, [0, 0], turn),
        );
        expect(fitsSetSquare(angle)).toBe(false);
      }
    }
  });

  it('allows ±1° of drawing error around 90°', () => {
    expect(fitsSetSquare(89.2)).toBe(true);
    expect(fitsSetSquare(90.9)).toBe(true);
    expect(fitsSetSquare(88.5)).toBe(false);
  });

  it('corner marks of every laid-out angle and shape match the item (1000 seeds)', () => {
    for (const skill of ['geo-right-angle', 'geo-count-right-angles']) {
      for (const tier of TIERS) {
        for (let seed = 1; seed <= 1000; seed++) {
          const item = geometryItemForSkill(skill, mulberry32(seed), tier);
          const corners = layoutFigure(item).targets.filter((t) => t.kind === 'corner');
          if (item.scene.kind === 'angles') {
            expect(corners.map((c) => c.fits)).toEqual(
              item.scene.angles.map((a) => a.degrees === 90),
            );
          } else if (item.scene.kind === 'shapes' && item.scene.shapes.length === 1) {
            const step = item.steps[0];
            const answer =
              step?.kind === 'number'
                ? step.answer
                : Number(
                    step?.kind === 'choice' && step.options.find((o) => o.correct)?.label.params?.n,
                  );
            expect(corners.filter((c) => c.fits)).toHaveLength(answer);
          }
        }
      }
    }
  });
});
