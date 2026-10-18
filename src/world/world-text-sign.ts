// Canvas-texture sign boards (region labels, math symbols). The font string must stay
// identical: Baloo 2 is loaded before the world is built, exactly as in the original game.
import {
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

const SIGN_FONT = '900 76px "Baloo 2", "Trebuchet MS", sans-serif';

/** Adds a double-sided `width` x `width / 2` sign with centred `text` to `parent`. */
export function addSign(
  parent: Object3D,
  text: string,
  x: number,
  y: number,
  z: number,
  width: number,
  background = '#fffbea',
  foreground = '#194f42',
  rotationY = 0,
): Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas context unavailable for sign texture');
  context.fillStyle = background;
  context.beginPath();
  context.roundRect(4, 4, 248, 120, 26);
  context.fill();
  context.fillStyle = foreground;
  context.font = SIGN_FONT;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 70);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const sign = new Mesh(
    new PlaneGeometry(width, width / 2),
    new MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.8, side: DoubleSide }),
  );
  sign.position.set(x, y, z);
  sign.rotation.y = rotationY;
  parent.add(sign);
  return sign;
}
