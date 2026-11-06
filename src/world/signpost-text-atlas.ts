// Text faces of the signpost boards: one canvas atlas with a row per (place name, arrow side),
// and every board face as a plane mapped onto its row, merged into a single mesh (one draw call,
// no shadow pass). Font family as the other world signs (Baloo 2 loads before the world).
import {
  CanvasTexture,
  type Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WORLD_LIGHTING } from './world-lighting-tuning';

/** Face size on the board, in world units; the atlas rows share its aspect. */
export const FACE_WIDTH = 3.6;
export const FACE_HEIGHT = 0.86;
const ROW_WIDTH = 1024;
const ROW_HEIGHT = Math.round((ROW_WIDTH * FACE_HEIGHT) / FACE_WIDTH);
const BACKGROUND = '#fff4d6';
const INK = '#194f42';
const ARROW = '#d9622b';

export type ArrowSide = 'right' | 'left';

/** One face to draw: `text` with the arrow on `side`, placed by `matrix` (plane faces +z). */
export interface SignFace {
  readonly text: string;
  readonly side: ArrowSide;
  readonly matrix: Matrix4;
}

function drawRow(ctx: CanvasRenderingContext2D, top: number, text: string, side: ArrowSide): void {
  const h = ROW_HEIGHT;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, top, ROW_WIDTH, h);
  // Arrow: shaft + head at the pointing end.
  const arrowW = h * 0.95;
  const left = side === 'right' ? ROW_WIDTH - arrowW - h * 0.12 : h * 0.12;
  const tipX = side === 'right' ? left + arrowW : left;
  const baseX = side === 'right' ? left + arrowW * 0.45 : left + arrowW * 0.55;
  const tailX = side === 'right' ? left : left + arrowW;
  const mid = top + h / 2;
  ctx.fillStyle = ARROW;
  ctx.fillRect(Math.min(tailX, baseX), mid - h * 0.11, Math.abs(baseX - tailX), h * 0.22);
  ctx.beginPath();
  ctx.moveTo(tipX, mid);
  ctx.lineTo(baseX, mid - h * 0.32);
  ctx.lineTo(baseX, mid + h * 0.32);
  ctx.closePath();
  ctx.fill();
  // Name, shrunk until it fits beside the arrow.
  const room = ROW_WIDTH - arrowW - h * 0.5;
  let size = Math.round(h * 0.62);
  ctx.font = `900 ${size}px "Baloo 2", "Trebuchet MS", sans-serif`;
  while (ctx.measureText(text).width > room && size > 12) {
    size -= 2;
    ctx.font = `900 ${size}px "Baloo 2", "Trebuchet MS", sans-serif`;
  }
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const center = side === 'right' ? (ROW_WIDTH - arrowW) / 2 : arrowW + (ROW_WIDTH - arrowW) / 2;
  ctx.fillText(text, center, mid + h * 0.05);
}

/** Bakes `faces` into one textured mesh (throws on an empty list or a missing 2D context). */
export function buildSignpostText(faces: readonly SignFace[]): Mesh {
  const rows = [...new Set(faces.map((f) => `${f.side}|${f.text}`))];
  const canvas = document.createElement('canvas');
  canvas.width = ROW_WIDTH;
  canvas.height = ROW_HEIGHT * rows.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable for signpost text');
  rows.forEach((key, i) => {
    const [side, ...text] = key.split('|');
    drawRow(ctx, i * ROW_HEIGHT, text.join('|'), side as ArrowSide);
  });
  const parts = faces.map((face) => {
    const row = rows.indexOf(`${face.side}|${face.text}`);
    const plane = new PlaneGeometry(FACE_WIDTH, FACE_HEIGHT);
    const uv = plane.getAttribute('uv');
    // Canvas row `row` (top-down) → v range of a flipY texture (bottom-up).
    const v0 = 1 - (row + 1) / rows.length;
    for (let i = 0; i < uv.count; i++) uv.setY(i, v0 + uv.getY(i) / rows.length);
    return plane.toNonIndexed().applyMatrix4(face.matrix);
  });
  const merged = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  if (!merged) throw new Error('buildSignpostText: nothing to merge');
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const mesh = new Mesh(
    merged,
    new MeshStandardMaterial({ map: texture, roughness: WORLD_LIGHTING.roughness.sign }),
  );
  mesh.name = 'expansion-signpost-text';
  return mesh;
}
