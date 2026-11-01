// Stone blocks of the solids rounds (B21): one mesh each, so a block can lift and turn. A plain
// block is stone grey; a lifted block (or the solids hint) shows each of its six faces in its own
// colour and turns slowly so the hidden faces come round; a block chosen on the card is gold.
import { BoxGeometry, Float32BufferAttribute, Mesh, MeshStandardMaterial, type Scene } from 'three';
import { BOARD, VALLEY_COLORS as C, FACE_COLORS } from './valley-layout-constants';
import type { FigureLayout } from './valley-layout-types';

const LIFT = 0.9;
const SPIN = 0.6;

/** Box with a colour per vertex: all `color`, or one colour per face. */
function colouredBox(w: number, h: number, d: number): BoxGeometry {
  const geometry = new BoxGeometry(w, h, d);
  geometry.setAttribute('color', new Float32BufferAttribute(new Float32Array(24 * 3), 3));
  return geometry;
}

function paint(geometry: BoxGeometry, faces: readonly number[] | number): void {
  const colors = geometry.getAttribute('color');
  const c = { r: 0, g: 0, b: 0 };
  for (let face = 0; face < 6; face++) {
    const hex = typeof faces === 'number' ? faces : (faces[face] as number);
    [c.r, c.g, c.b] = [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
    for (let v = 0; v < 4; v++) colors.setXYZ(face * 4 + v, c.r, c.g, c.b);
  }
  colors.needsUpdate = true;
}

interface Block {
  mesh: Mesh;
  height: number;
  lifted: boolean;
}

export class ValleySolidsView {
  private readonly material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    flatShading: true,
  });
  private blocks: Block[] = [];

  constructor(
    private readonly scene: Scene,
    private readonly reducedMotion: boolean,
  ) {}

  show(layout: FigureLayout): void {
    this.clear();
    for (const draw of layout.draws) {
      if (draw.kind !== 'block') continue;
      const [w, h, d] = draw.size;
      const mesh = new Mesh(colouredBox(w, h, d), this.material);
      mesh.position.set(draw.c[0], BOARD.top + h / 2, draw.c[1]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      paint(mesh.geometry as BoxGeometry, C.block);
      this.scene.add(mesh);
      this.blocks.push({ mesh, height: h, lifted: false });
    }
  }

  /** Lift (or with `faces` false, set down) block `index`; `selected` blocks are gold. */
  update(state: { lifted: number | null; aid: boolean; selected: ReadonlySet<string> }): void {
    this.blocks.forEach((block, i) => {
      block.lifted = state.lifted === i || (state.aid && this.blocks.length === 1);
      const colors = state.selected.has(`o${i}`)
        ? C.gold
        : block.lifted || state.aid
          ? FACE_COLORS
          : C.block;
      paint(block.mesh.geometry as BoxGeometry, colors);
    });
  }

  get liftedCount(): number {
    return this.blocks.filter((b) => b.lifted).length;
  }

  frame(dt: number): void {
    for (const block of this.blocks) {
      const rest = BOARD.top + block.height / 2;
      const goal = rest + (block.lifted ? LIFT : 0);
      const y = block.mesh.position.y;
      block.mesh.position.y = this.reducedMotion ? goal : y + (goal - y) * Math.min(1, dt * 5);
      if (block.lifted && !this.reducedMotion) block.mesh.rotation.y += dt * SPIN;
    }
  }

  clear(): void {
    for (const block of this.blocks) {
      block.mesh.removeFromParent();
      block.mesh.geometry.dispose();
    }
    this.blocks = [];
  }

  dispose(): void {
    this.clear();
    this.material.dispose();
  }
}
