// World point -> canvas CSS-pixel position (floating DOM labels, tap targets).
import type { PerspectiveCamera, Vector3 } from 'three';
import type { ProjectedPoint } from './world-public-api';

/** Projects `point`; visible when in front of the camera and within 80 px of the canvas. */
export function projectToCanvas(
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  point: Vector3,
): ProjectedPoint {
  const ndc = point.clone().project(camera);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const x = (ndc.x * 0.5 + 0.5) * width;
  const y = (-0.5 * ndc.y + 0.5) * height;
  return {
    x,
    y,
    visible: ndc.z < 1 && x > -80 && x < width + 80 && y > -80 && y < height + 80,
    distance: camera.position.distanceTo(point),
  };
}
