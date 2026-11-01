// Inputs of one map draw (original `rc()` object in the UI) and the shared rounded-rect helper.
import type { ExpansionRegion } from '../config/expansion-regions';
import type { Region } from '../config/regions';

export type RegionUnlockPredicate = (region: Region, questComplete: boolean) => boolean;

export interface MapDrawState {
  readonly player: { readonly x: number; readonly z: number; readonly facing: number };
  readonly milo: { readonly x: number; readonly z: number };
  /** Built bridge segments (0..BRIDGE_SEGMENTS). */
  readonly bridge: number;
  readonly questComplete: boolean;
  /** Highlighted region id (full map only). */
  readonly selected?: string | undefined;
  /** Full-map style: bigger markers plus region name pills. */
  readonly labels: boolean;
  readonly translate: (text: string) => string;
  /** Seconds; drives the player pulse. */
  readonly time: number;
  /** Lock rule; defaults to `isRegionUnlocked` (phase 13 injects the new progression rule). */
  readonly isUnlocked?: RegionUnlockPredicate | undefined;
  /** Draws the chapter 2 regions and roads too (absent: the original draw, call for call). */
  readonly expansion?: { readonly name: (region: ExpansionRegion) => string } | undefined;
}

/** Begins a new path holding one rounded rect from (x0, y0) to (x1, y1) (original `vi`). */
export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x0, y0, x1 - x0, y1 - y0, radius);
}
