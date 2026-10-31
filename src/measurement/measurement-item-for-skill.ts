// One entry point for the measurement workshop (phase 07): a meas-* skill id + rng + tier -> item.
import type { GeoGenerator, GeoItem } from '../geometry/geo-scene-types';
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { measAreaCount, measAreaRect, measAreaSquare } from './area-generators';
import { measMmConvert, measRulerRead } from './length-and-unit-generators';
import { measGram, measMl, measTemperature } from './mass-volume-temperature-generators';
import {
  measPerimeterPolygon,
  measPerimeterRect,
  measPerimeterSquare,
  measWpFence,
} from './perimeter-generators';

const GENERATORS: Readonly<Record<string, GeoGenerator>> = {
  'meas-ruler-read': measRulerRead,
  'meas-mm-convert': measMmConvert,
  'meas-gram': measGram,
  'meas-ml': measMl,
  'meas-temperature': measTemperature,
  'meas-perimeter-polygon': measPerimeterPolygon,
  'meas-perimeter-rect': measPerimeterRect,
  'meas-perimeter-square': measPerimeterSquare,
  'meas-area-count': measAreaCount,
  'meas-area-rect': measAreaRect,
  'meas-area-square': measAreaSquare,
  'meas-wp-fence': measWpFence,
};

/** The measurement skills (catalog order) that have a generator. */
export const MEASUREMENT_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isMeasurementSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a measurement generator. */
export function measurementItemForSkill(id: string, rng: Rng, tier: SkillTier): GeoItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`measurement: no generator for skill "${id}"`);
  return generate(rng, tier);
}
