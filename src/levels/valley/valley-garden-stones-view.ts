// The rebuilt stone garden: each finished round sets one shape stone (cube, cone, cylinder,
// pyramid, ball, box) back on its pedestal around the board. Re-baked into one mesh per change.
import { BufferGeometry, Mesh, MeshStandardMaterial, Scene } from 'three';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { scratchContext } from './valley-figure-meshes';
import { GARDEN_STONE_COLORS, PEDESTALS } from './valley-layout-constants';

const PEDESTAL_TOP = 0.36;

export class ValleyGardenStonesView {
  private readonly mesh = new Mesh(
    new BufferGeometry(),
    new MeshStandardMaterial({
      vertexColors: true,
      roughness: WORLD_LIGHTING.roughness.primitive,
      flatShading: true,
    }),
  );
  /** Stones standing on their pedestals. */
  count = 0;

  constructor(scene: Scene) {
    this.mesh.castShadow = true;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  /** Shows the first `count` stones (one per finished round). */
  setCount(count: number): void {
    this.count = Math.min(count, PEDESTALS.length);
    const scratch = new Scene();
    const ctx = scratchContext(scratch);
    for (let i = 0; i < this.count; i++) {
      const [x, z] = PEDESTALS[i] as readonly [number, number];
      const color = GARDEN_STONE_COLORS[i] as number;
      const y = PEDESTAL_TOP;
      switch (i % 6) {
        case 0:
          addBox(ctx, scratch, x, y + 0.45, z, 0.9, 0.9, 0.9, color);
          break;
        case 1:
          addCylinder(ctx, scratch, x, y + 0.6, z, 0, 0.5, 1.2, color, 10);
          break;
        case 2:
          addCylinder(ctx, scratch, x, y + 0.5, z, 0.42, 0.42, 1, color, 12);
          break;
        case 3:
          addCylinder(ctx, scratch, x, y + 0.5, z, 0, 0.6, 1, color, 4);
          break;
        case 4:
          addSphere(ctx, scratch, x, y + 0.45, z, 0.45, color);
          break;
        default:
          addBox(ctx, scratch, x, y + 0.35, z, 1.1, 0.7, 0.6, color);
      }
    }
    this.mesh.geometry.dispose();
    this.mesh.geometry = this.count > 0 ? bakeVertexColoredGeometry(scratch) : new BufferGeometry();
    this.mesh.visible = this.count > 0;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
  }
}
