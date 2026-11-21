// Practice scenes (phase 02): a generated item is a ReasoningItem, optionally carrying a
// plain-data scene the levels or the dialog draw (geometry/measurement scenes in
// src/geometry/geo-scene-types.ts; the six new families add theirs in phases 16/17).
// Scenes are plain data, never three.js objects, so tests run in node.
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** Base type for a plain-data scene: `kind` names the renderer that draws it. */
export interface PracticeScene {
  readonly kind: string;
}

/** A generated practice item: a ReasoningItem, optionally carrying a scene. */
export type PracticeItem = ReasoningItem & { readonly scene?: PracticeScene };
