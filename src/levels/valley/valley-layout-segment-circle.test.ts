import { describe, expect, it } from 'vitest';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { mulberry32 } from '../../learning/seeded-rng';
import { layoutFigure } from './valley-figure-layout';

const logOf = (seed: number, tier: 1 | 2 | 3) => {
  const item = geometryItemForSkill('geo-midpoint', mulberry32(seed), tier);
  const layout = layoutFigure(item);
  const log = layout.draws.find((d) => d.kind === 'log');
  if (log?.kind !== 'log' || item.scene.kind !== 'segment') throw new Error('midpoint log');
  const m = item.scene.points.find((p) => p.label === 'M');
  const mx = m ? log.a[0] + ((log.b[0] - log.a[0]) * m.at) / item.scene.length : null;
  return { layout, log, mx };
};

describe('valley midpoint log', () => {
  it('tier 3 (is M the midpoint?) opens with no tap that would settle the verdict', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { layout } = logOf(seed, 3);
      expect(layout.action).toBeNull();
      expect(layout.targets.filter((t) => t.right)).toEqual([]);
    }
  });

  it('the hint aid splits the log at M as drawn (AM and MB), not at the true middle', () => {
    for (let seed = 1; seed <= 200; seed++)
      for (const tier of [1, 2, 3] as const) {
        const { log, mx } = logOf(seed, tier);
        expect(mx).not.toBeNull();
        expect(log.split?.[0]).toBeCloseTo(mx as number, 6);
      }
  });
});
