// Plain-data scenes for the numbers family (phase 07): base-10 blocks on a place-value table
// and a number line with the gap(s) marked '?'. Plain data only, never three.js objects, so
// tests run in node. The renderers land in phase 16; until then the daily filter drops the
// (skill, tier) pairs that carry one of these. The shape is a PracticeScene (kind: string),
// so it stays compatible with the later widening of the dialog registry (phase 16/17).
import type { PracticeScene } from '../practice/practice-scene';

/** The scene kinds the numbers family produces. */
export type NumberSceneKind = 'place-value' | 'number-line';

/** A column of the place-value table: the place and how many blocks sit in it. */
export type PlaceName = 'tenThousands' | 'thousands' | 'hundreds' | 'tens' | 'ones';

export interface PlaceColumn {
  readonly place: PlaceName;
  readonly blocks: number;
}

export type NumberScene =
  | {
      readonly kind: 'place-value';
      /** One column per place of the skill's range, blocks = the digit in that place. */
      readonly columns: readonly PlaceColumn[];
    }
  | {
      readonly kind: 'number-line';
      /** The first mark; the step between marks is 1 or -1. */
      readonly start: number;
      readonly step: 1 | -1;
      /** Every mark of the line (the missing ones carry their true value; the renderer
          draws '?' at the missing indices). */
      readonly marks: readonly number[];
      /** Indices into `marks` drawn as '?'. */
      readonly missing: readonly number[];
    };

/** A numbers scene is a PracticeScene: `kind` names the renderer that draws it. */
export type NumberItemScene = NumberScene & PracticeScene;
