import type { GroundPoint } from './interaction-types';

/** Snap radius must stay generous for small fingers (world units). */
export const MIN_SNAP_RADIUS = 0.8;

export type ZoneShape =
  | { kind: 'circle'; radius: number }
  | { kind: 'box'; halfWidth: number; halfDepth: number };

export interface DropZone {
  id: string;
  center: GroundPoint;
  shape: ZoneShape;
  accepts(itemId: string): boolean;
}

/** Distance from a point to the zone's area; 0 when the point is inside. */
export function distanceToZone(zone: DropZone, point: GroundPoint): number {
  const dx = point.x - zone.center.x;
  const dz = point.z - zone.center.z;
  if (zone.shape.kind === 'circle') {
    return Math.max(0, Math.hypot(dx, dz) - zone.shape.radius);
  }
  const outsideX = Math.max(0, Math.abs(dx) - zone.shape.halfWidth);
  const outsideZ = Math.max(0, Math.abs(dz) - zone.shape.halfDepth);
  return Math.hypot(outsideX, outsideZ);
}

/**
 * Nearest accepting zone within the snap radius (never below MIN_SNAP_RADIUS). Ties go to the zone
 * whose center is closer.
 */
export function findSnapZone(
  zones: readonly DropZone[],
  point: GroundPoint,
  itemId: string,
  snapRadius: number = MIN_SNAP_RADIUS,
): DropZone | null {
  const radius = Math.max(snapRadius, MIN_SNAP_RADIUS);
  let best: DropZone | null = null;
  let bestEdge = Number.POSITIVE_INFINITY;
  let bestCenter = Number.POSITIVE_INFINITY;
  for (const zone of zones) {
    if (!zone.accepts(itemId)) continue;
    const edge = distanceToZone(zone, point);
    if (edge > radius) continue;
    const center = Math.hypot(point.x - zone.center.x, point.z - zone.center.z);
    if (edge < bestEdge || (edge === bestEdge && center < bestCenter)) {
      best = zone;
      bestEdge = edge;
      bestCenter = center;
    }
  }
  return best;
}
