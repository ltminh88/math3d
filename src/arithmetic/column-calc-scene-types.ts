// Column-calc scene (boost, Phase 2A): the column layout for "đặt tính rồi tính".
// Plain data only, never three.js objects, so tests run in node. The scene is
// rendered once per item (daily-skill-item / the level round controllers), so
// `filled` and `carries` start empty: a future host that re-renders between steps
// may pass the digits and marks confirmed so far. The true carry marks are NEVER
// pre-drawn — they would answer the "Có nhớ 1 không?" / "Có phải vay 1 không?"
// steps. Digits are least-significant-first: index 0 is the units column.
import type { PracticeScene } from '../practice/practice-scene';

export interface ColumnCalcScene extends PracticeScene {
  readonly kind: 'column-calc';
  readonly op: '+' | '−';
  readonly top: number;
  readonly bottom: number;
  /** Result digits filled so far, least-significant-first (index = column). */
  readonly filled: readonly number[];
  /** Carry/borrow out of each column, least-significant-first (1 = regroups). */
  readonly carries: readonly number[];
  /** The column the child starts on (0 = units). */
  readonly focusCol: number;
  /** For find-error: the (wrong) result row to display, least-significant-first. */
  readonly buggy?: readonly number[];
}
