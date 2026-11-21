// Cross-family dispatcher (phase 00): one skill id + rng + tier -> the item its family
// generates. Reasoning items have no scene and render in the shared dialog; geometry and
// measurement items carry a scene only their levels draw, so daily filters those skills
// out until phase 04 registers dialog scene renderers.
import { geometryItemForSkill, isGeometrySkill } from '../geometry/geometry-item-for-skill';
import type { Rng } from '../learning/seeded-rng';
import { type SkillFamily, skillEntry } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import {
  isMeasurementSkill,
  measurementItemForSkill,
} from '../measurement/measurement-item-for-skill';
import { isReasoningSkill, reasoningItemForSkill } from '../reasoning/reasoning-item-for-skill';
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** The skill's family, read from the catalog — never from the id prefix. */
export function familyOfSkill(id: string): SkillFamily | undefined {
  return skillEntry(id)?.family;
}

/** Pure and deterministic for a seeded `rng`; throws only for unknown ids. */
export function itemForSkill(id: string, rng: Rng, tier: SkillTier): ReasoningItem {
  if (isReasoningSkill(id)) return reasoningItemForSkill(id, rng, tier);
  if (isGeometrySkill(id)) return geometryItemForSkill(id, rng, tier);
  if (isMeasurementSkill(id)) return measurementItemForSkill(id, rng, tier);
  throw new Error(`practice: no generator for skill "${id}"`);
}

/**
 * True when the item can be shown in the shared dialog: a reasoning item has no scene.
 * An id renders exactly when its family has no scene; an unknown id never renders.
 */
export function dialogRenderable(itemOrId: ReasoningItem | string): boolean {
  if (typeof itemOrId === 'string') {
    const family = familyOfSkill(itemOrId);
    return family !== undefined && family !== 'geometry' && family !== 'measurement';
  }
  return !('scene' in itemOrId);
}
