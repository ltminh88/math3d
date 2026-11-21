// Scene data for money items (phase 14). A note is a flat coloured card with its value
// text — never a banknote image (legal/copyright). The renderer (phase 17) draws the
// value with the shared numbers formatter (SGK grouping: "10 000", never "10000") and a
// letter badge when the note has one; scene data carries numbers, not pixels or text.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** One note card: its value, and the letter badge shown when the child must pick it. */
export interface MoneyNote {
  readonly value: number;
  readonly label?: string;
}

/** The notes on the table: one card per note, in display order. */
export interface NotesScene {
  readonly kind: 'notes';
  readonly notes: readonly MoneyNote[];
  readonly minUnitPx: number;
}

export type MoneyScene = NotesScene;

export interface MoneyItem extends ReasoningItem {
  readonly scene?: MoneyScene;
}

export type MoneyGenerator = (rng: Rng, tier: SkillTier) => MoneyItem;
