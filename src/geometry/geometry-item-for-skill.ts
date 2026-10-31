// One entry point for the geometry valley (phase 06): a geo-* skill id + rng + tier -> item.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { geoCountRightAngles, geoRightAngle } from './angle-generators';
import type { GeoGenerator, GeoItem } from './geo-scene-types';
import { geoCircleParts, geoMidpoint, geoRadiusDiameter } from './midpoint-and-circle-generators';
import { geoShapeClassify, geoShapeCount } from './shape-generators';
import { geoSolidIdentify, geoSolidParts } from './solid-generators';

const GENERATORS: Readonly<Record<string, GeoGenerator>> = {
  'geo-midpoint': geoMidpoint,
  'geo-circle-parts': geoCircleParts,
  'geo-radius-diameter': geoRadiusDiameter,
  'geo-right-angle': geoRightAngle,
  'geo-count-right-angles': geoCountRightAngles,
  'geo-shape-classify': geoShapeClassify,
  'geo-shape-count': geoShapeCount,
  'geo-solid-identify': geoSolidIdentify,
  'geo-solid-parts': geoSolidParts,
};

/** The geometry skills (catalog order) that have a generator. */
export const GEOMETRY_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isGeometrySkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a geometry generator. */
export function geometryItemForSkill(id: string, rng: Rng, tier: SkillTier): GeoItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`geometry: no generator for skill "${id}"`);
  return generate(rng, tier);
}
