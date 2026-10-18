// The quest bridge: one hidden plank group per segment across the river, plus the fixed lamp
// posts on both banks. Revealing a segment with `animate` drops it from y=3 (the frame loop
// lowers it) and fires a spark burst.
import { Group, Vector3 } from 'three';
import { BRIDGE_SEGMENTS, RIVER } from '../config/world-constants';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder, addSphere } from './world-primitives';

export function buildBridge(ctx: WorldBuildContext, bridge: Group): void {
  for (let index = 0; index < BRIDGE_SEGMENTS; index++) {
    const segment = new Group();
    segment.position.x = RIVER.riverMin + index + 0.5;
    addBox(ctx, segment, 0, 0.12, 0, 0.97, 0.35, RIVER.bridgeWidth, 0xc3b895);
    addBox(ctx, segment, 0, 0.33, 0, 0.86, 0.06, RIVER.bridgeWidth - 0.15, 0xe5d6ae);
    for (const z of [-1.6, 1.6]) {
      addBox(ctx, segment, 0, 0.9, z, 0.17, 1.3, 0.17, 0xa98458);
      addBox(ctx, segment, 0, 1.35, z, 1.08, 0.12, 0.15, 0xbfa479);
    }
    segment.visible = false;
    bridge.add(segment);
  }
  for (const x of [3.6, 10.4]) {
    for (const z of [-1.85, 1.85]) {
      addCylinder(ctx, ctx.scene, x, 0.65, z, 0.23, 0.3, 1.3, 0xcac09e);
      addSphere(ctx, ctx.scene, x, 1.4, z, 0.28, 0xf4d37c);
    }
  }
}

/** Shows the first `count` segments; with `animate`, the newest one drops in with a burst. */
export function showBridgeSegments(
  bridge: Group,
  count: number,
  animate: boolean,
  burst: (at: Vector3) => void,
): void {
  bridge.children.forEach((segment, index) => {
    segment.visible = index < count;
    if (animate && index === count - 1) {
      segment.position.y = 3;
      burst(new Vector3(segment.position.x, 0.8, 0));
    }
  });
}
