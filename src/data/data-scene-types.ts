// Scene data for data items (phase 15). Every data skill needs its picture — the table,
// the tally strip, the bag or the die — so no data skill is scene-free (playable after
// the phase-17 renderer). Scene data carries numbers and refs, not pixels or text: table
// headers are 'i:<noun>' refs and row labels are 'l:<key>' refs (both resolved by
// renderDataPrompt), bag colours are Colour keys (resolved via the colour_* keys), dice
// faces are pip counts.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningItem } from '../reasoning/reasoning-types';
import type { Colour } from './data-ranges';

/** A data table: column headers, rows of values, an optional hidden cell to fill. */
export interface DataTableScene {
  readonly kind: 'data-table';
  /** One 'i:<noun>' ref per column. */
  readonly headers: readonly string[];
  /** Rows of cell values; null is the hidden cell (table-fill-missing only). */
  readonly rows: readonly (readonly (number | null)[])[];
  /** One 'l:<key>' ref per row, for 2-row tables (weeks) and the class table. */
  readonly rowLabels?: readonly string[];
  readonly hiddenCell?: { readonly row: number; readonly col: number };
  readonly minUnitPx: number;
}

/** A tally strip: true = O (hit), false = X (miss), in the order they were marked. */
export interface TallyScene {
  readonly kind: 'tally';
  readonly marks: readonly boolean[];
  readonly minUnitPx: number;
}

export interface BagItem {
  readonly colour: Colour;
  readonly count: number;
}

/** A bag of marbles: how many of each colour, and how many are drawn at once. */
export interface BagScene {
  readonly kind: 'bag';
  readonly items: readonly BagItem[];
  readonly pick: number;
  readonly minUnitPx: number;
}

/** A die: the face on top, a face seen in a second view (T2+), faces covered over (T3). */
export interface DiceScene {
  readonly kind: 'dice';
  readonly up: number;
  readonly other?: number;
  readonly hidden?: readonly number[];
  readonly minUnitPx: number;
}

export type DataScene = DataTableScene | TallyScene | BagScene | DiceScene;

export interface DataItem extends ReasoningItem {
  readonly scene?: DataScene;
}

export type DataGenerator = (rng: Rng, tier: SkillTier) => DataItem;
