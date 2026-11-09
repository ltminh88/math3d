// Wooden signposts of chapter 2 (low-poly: round pole, plank boards with a pointed tip). The wood
// goes into the expansion scenery scratch group (baked with it: no extra draw call); the board
// faces (place name + arrow) come back as one merged text mesh. No collision circles: posts stand
// beside the roads and the boards never reach over one (see expansion-signposts.test.ts).
import { CylinderGeometry, Group, Matrix4, type Mesh, type Object3D } from 'three';
import { expansionRegionText } from '../config/expansion-region-strings';
import { EXPANSION_REGIONS } from '../config/expansion-regions';
import {
  EXPANSION_SIGNPOSTS,
  SIGN_BOARD_REACH,
  type SignBoard,
} from '../config/expansion-signposts';
import { buildSignpostText, FACE_HEIGHT, FACE_WIDTH, type SignFace } from './signpost-text-atlas';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder, addMesh } from './world-primitives';

const POLE_COLOR = 0x7a5232;
const CAP_COLOR = 0x5c3b22;
const BOARD_COLOR = 0xc98f55;
/** Big enough to read from the follow camera: the face text is ~0.6 units tall. */
const POLE_HEIGHT = 4.6;
const POLE_RADIUS = 0.2;
const TOP_BOARD_Y = 4.05;
const BOARD_STEP = 1.1;
/** Plank behind the face: starts 0.5 behind the pole, ends at SHAFT_END, then the tip. */
const SHAFT_START = -0.5;
const SHAFT_END = 3.25;
const BOARD_HEIGHT = FACE_HEIGHT + 0.1;
const BOARD_DEPTH = 0.14;
const TIP_RADIUS = 0.66;
const TIP_REACH = SHAFT_END + 1.5 * TIP_RADIUS - 0.02;

/**
 * Y rotation that turns a board's local +x (its pointing end) onto the ground `heading`:
 * rotating (1, 0, 0) by θ about +y gives (cos θ, 0, −sin θ).
 */
export const boardRotationY = (heading: SignBoard['heading']): number =>
  Math.atan2(-heading[1], heading[0]);

const nameOf = (board: SignBoard): string => {
  const region = EXPANSION_REGIONS.find((r) => r.id === board.target);
  if (!region) throw new Error(`signpost target ${board.target} is not a region`);
  return expansionRegionText(region, 'name');
};

/** Plank + triangular tip pointing local +x, in the board group. */
function addPlank(ctx: WorldBuildContext, board: Object3D): void {
  const length = SHAFT_END - SHAFT_START;
  addBox(
    ctx,
    board,
    SHAFT_START + length / 2,
    0,
    0,
    length,
    BOARD_HEIGHT,
    BOARD_DEPTH,
    BOARD_COLOR,
  );
  // 3-sided prism along z with a corner on +x (rotateX then rotateZ swing a corner from +z to +x).
  const tip = new CylinderGeometry(TIP_RADIUS, TIP_RADIUS, BOARD_DEPTH, 3)
    .rotateX(Math.PI / 2)
    .rotateZ(Math.PI / 2);
  addMesh(ctx, board, tip, BOARD_COLOR, SHAFT_END + TIP_RADIUS / 2 - 0.02, 0, 0);
}

/** Front face (sees the tip on the right) and back face (tip on the left) of one board. */
function facesOf(board: Group, text: string): SignFace[] {
  board.updateMatrixWorld(true);
  const offset = (SHAFT_START + SHAFT_END) / 2 + 0.02;
  const z = BOARD_DEPTH / 2 + 0.006;
  const front = new Matrix4().makeTranslation(offset, 0, z);
  const back = new Matrix4()
    .makeTranslation(offset, 0, -z)
    .multiply(new Matrix4().makeRotationY(Math.PI));
  return [
    { text, side: 'right', matrix: board.matrixWorld.clone().multiply(front) },
    { text, side: 'left', matrix: board.matrixWorld.clone().multiply(back) },
  ];
}

/** Builds every signpost's wood into `root` and returns the merged text faces mesh. */
export function buildExpansionSignposts(ctx: WorldBuildContext, root: Group): Mesh {
  const faces: SignFace[] = [];
  for (const post of EXPANSION_SIGNPOSTS) {
    const [x, z] = post.position;
    addCylinder(
      ctx,
      root,
      x,
      POLE_HEIGHT / 2,
      z,
      POLE_RADIUS,
      POLE_RADIUS + 0.03,
      POLE_HEIGHT,
      POLE_COLOR,
    );
    addCylinder(ctx, root, x, POLE_HEIGHT + 0.16, z, 0, POLE_RADIUS + 0.12, 0.32, CAP_COLOR);
    post.boards.forEach((spec, i) => {
      const board = new Group();
      board.position.set(x, TOP_BOARD_Y - i * BOARD_STEP, z);
      board.rotation.y = boardRotationY(spec.heading);
      root.add(board);
      addPlank(ctx, board);
      faces.push(...facesOf(board, nameOf(spec)));
    });
  }
  if (FACE_WIDTH > SHAFT_END - SHAFT_START || TIP_REACH > SIGN_BOARD_REACH) {
    throw new Error('signpost board layout out of bounds');
  }
  return buildSignpostText(faces);
}
