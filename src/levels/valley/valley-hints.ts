// Valley hint ladder (pure): 1 encourage, 2 the KNTT definition behind the item, 3 a visual aid on
// the board (the log coloured A..M and M..B, a dashed diameter through O, a spare ê-ke, corner dots,
// coloured faces). No rung names the answer; the third miss reveals it (valley-round-flow.ts).
import type { GeoItem } from '../../geometry/geo-scene-types';
import { VALLEY_KIND, type ValleyKind } from './valley-round-plan';

export interface ValleyHint {
  /** Valley strings key. */
  readonly key: string;
  /** Rung 3: the board shows its visual aid. */
  readonly aid: boolean;
}

const AID_KEY: Readonly<Record<ValleyKind, string>> = {
  midpoint: 'aidMidpoint',
  circle: 'aidCircle',
  'right-angle': 'aidRightAngle',
  classify: 'aidShapes',
  solids: 'aidSolids',
};

function definitionKey(item: GeoItem): string {
  switch (item.skillId) {
    case 'geo-midpoint':
      return 'defMidpoint';
    case 'geo-circle-parts':
    case 'geo-radius-diameter':
      return 'defCircle';
    case 'geo-right-angle':
    case 'geo-count-right-angles':
      return 'defRightAngle';
    case 'geo-shape-classify': {
      // The target class is in the step prompt: pickOne_rect, pickAll_triangle...
      const target = item.steps[0]?.prompt.key.split('_')[1] ?? 'quad';
      return `def_${target}`;
    }
    case 'geo-shape-count':
      return 'defCount';
    case 'geo-solid-identify':
      return 'defCube';
    default:
      return 'defParts';
  }
}

export function valleyHint(item: GeoItem, rung: 1 | 2 | 3): ValleyHint {
  if (rung === 1) return { key: 'hint1', aid: false };
  if (rung === 2) return { key: definitionKey(item), aid: false };
  return { key: AID_KEY[VALLEY_KIND[item.skillId] as ValleyKind], aid: true };
}
