// Cross-family dispatcher (phase 00, extended in phase 02): one skill id + rng + tier -> the
// item its family generates. Reasoning items have no scene and render in the shared dialog;
// geometry and measurement items carry a scene, which renders only when a dialog scene
// renderer covers its kind (phase 04 registers them all; a kind without one stays filtered).
// The six new families (numbers, arithmetic, fractions, time, money, data) have empty
// GENERATORS until their phases land, so no id dispatches to them yet — but the wiring is
// here, so adding a skill means editing one family folder only.
import { arithmeticItemForSkill, isArithmeticSkill } from '../arithmetic/arithmetic-item-for-skill';
import { dataItemForSkill, isDataSkill } from '../data/data-item-for-skill';
import { fractionItemForSkill, isFractionSkill } from '../fractions/fraction-item-for-skill';
import { geometryItemForSkill, isGeometrySkill } from '../geometry/geometry-item-for-skill';
import type { Rng } from '../learning/seeded-rng';
import { type SkillFamily, skillEntry } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import {
  isMeasurementSkill,
  measurementItemForSkill,
} from '../measurement/measurement-item-for-skill';
import { isMoneySkill, moneyItemForSkill } from '../money/money-item-for-skill';
import { isNumberSkill, numberItemForSkill } from '../numbers/number-item-for-skill';
import { isReasoningSkill, reasoningItemForSkill } from '../reasoning/reasoning-item-for-skill';
import { isTimeSkill, timeItemForSkill } from '../time/time-item-for-skill';
import { hasSceneRenderer } from '../ui/dialog-scenes/dialog-scene-registry';
import type { PracticeItem } from './practice-scene';

/** The skill's family, read from the catalog — never from the id prefix. */
export function familyOfSkill(id: string): SkillFamily | undefined {
  return skillEntry(id)?.family;
}

/** Pure and deterministic for a seeded `rng`; throws only for unknown ids. */
export function itemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  if (isReasoningSkill(id)) return reasoningItemForSkill(id, rng, tier);
  if (isGeometrySkill(id)) return geometryItemForSkill(id, rng, tier);
  if (isMeasurementSkill(id)) return measurementItemForSkill(id, rng, tier);
  if (isNumberSkill(id)) return numberItemForSkill(id, rng, tier);
  if (isArithmeticSkill(id)) return arithmeticItemForSkill(id, rng, tier);
  if (isFractionSkill(id)) return fractionItemForSkill(id, rng, tier);
  if (isTimeSkill(id)) return timeItemForSkill(id, rng, tier);
  if (isMoneySkill(id)) return moneyItemForSkill(id, rng, tier);
  if (isDataSkill(id)) return dataItemForSkill(id, rng, tier);
  throw new Error(`practice: no generator for skill "${id}"`);
}

/**
 * True when the item can be shown in the shared dialog — judged on the ITEM, never on
 * the skill's family (phase 04, le 21/11 11:01): an item with no scene always renders
 * (e.g. a number-entry arithmetic item); a scene item renders exactly when its kind
 * has a renderer (the lookup defaults to the dialog scene registry; a stub keeps this
 * pure in node tests). A scene item without a renderer is dropped, never a blank
 * picture. Unknown ids never reach here — the call site drops them (itemForSkill
 * throws for them) instead of asking this function about an id.
 */
export function dialogRenderable(
  item: PracticeItem,
  hasRenderer: (kind: string) => boolean = hasSceneRenderer,
): boolean {
  return item.scene === undefined || hasRenderer(item.scene.kind);
}
