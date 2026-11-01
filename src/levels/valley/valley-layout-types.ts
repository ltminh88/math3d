// What a round's figure looks like on the stone board, as plain data (pure, testable): what to
// draw, where the tap targets and label chips sit, and the 3D action the round starts with.
// Board coordinates: x to the right, z towards the camera (screen down); y is height.
import type { PromptRef } from '../../reasoning/reasoning-types';

export type XZ = readonly [x: number, z: number];

/** The one hands-on action that opens a round (null: the answer step comes first). */
export type ValleyAction = 'midpoint' | 'centre' | 'set-square' | 'lift';

export type TargetKind = 'stone' | 'centre' | 'ring' | 'corner' | 'shape' | 'block';

/** A tap target on the board (drawn as a >= 44 px DOM proxy over its projected point). */
export interface ValleyTarget {
  readonly id: string;
  readonly kind: TargetKind;
  readonly at: XZ;
  /** Spoken name (valley strings key). */
  readonly name: PromptRef;
  /** The right tap for the round's action. */
  readonly right: boolean;
  /** Card option the target stands for: tapping it chooses that option. */
  readonly option?: string;
  /** Corner only: the ê-ke fits (right angle) and how it is laid on the corner. */
  readonly fits?: boolean;
  readonly armAngle?: number;
  readonly turn?: 1 | -1;
}

/** A text chip (DOM, aria-hidden) projected from a board point. */
export interface ValleyChip {
  readonly at: XZ;
  readonly text: string;
  readonly kind: 'point' | 'letter' | 'size';
  /** Height above the board (block edge sizes). */
  readonly y?: number;
  /** Shown only once the round's action is done (the midpoint M of a "find M" round). */
  readonly afterAction?: boolean;
}

export type ValleyDraw =
  /** The wooden log AB with cm ticks (fractions of its length). */
  | { readonly kind: 'log'; readonly a: XZ; readonly b: XZ; readonly ticks: readonly number[] }
  | { readonly kind: 'line'; readonly a: XZ; readonly b: XZ; readonly group: string }
  | { readonly kind: 'ring'; readonly c: XZ; readonly r: number; readonly group: string }
  | { readonly kind: 'poly'; readonly points: readonly XZ[]; readonly group: string }
  | {
      readonly kind: 'block';
      readonly c: XZ;
      readonly size: readonly [w: number, h: number, d: number];
      readonly group: string;
    };

export interface FigureLayout {
  readonly action: ValleyAction | null;
  readonly draws: readonly ValleyDraw[];
  readonly targets: readonly ValleyTarget[];
  readonly chips: readonly ValleyChip[];
  /** Half extents (board units) the camera keeps in view. */
  readonly halfWidth: number;
  readonly halfDepth: number;
}

/** Math coordinates (y up) to board coordinates (z towards the camera). */
export const toBoard = (x: number, y: number): XZ => [x, -y];

export const nameRef = (key: string, params?: Record<string, string | number>): PromptRef =>
  params ? { key, params } : { key };
