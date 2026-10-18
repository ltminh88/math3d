import type { PerspectiveCamera } from 'three';

export interface PlayfieldBounds {
  /** Extent along x. */
  width: number;
  /** Extent along z. */
  depth: number;
  /** Tallest point above the ground (y). */
  height: number;
  /** Ground-plane center; defaults to the origin. */
  center?: { x: number; z: number };
}

export interface CameraFitOptions {
  /** Angle of the view direction above the ground plane. */
  elevationDeg?: number;
  /** >1 leaves a border around the playfield. */
  margin?: number;
}

export interface CameraPose {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

const DEG = Math.PI / 180;

/**
 * Pose of a fixed camera (looking at the playfield center from the +z side) that keeps the whole
 * box visible for the given aspect ratio. Works for landscape and portrait.
 */
export function computeCameraPose(
  bounds: PlayfieldBounds,
  vfovDeg: number,
  aspect: number,
  options: CameraFitOptions = {},
): CameraPose {
  const { elevationDeg = 55, margin = 1.1 } = options;
  const elevation = elevationDeg * DEG;
  const safeAspect = Math.max(aspect, 0.1);
  const tanHalf = Math.tan((vfovDeg * DEG) / 2);
  const sin = Math.sin(elevation);
  const cos = Math.cos(elevation);

  const screenHeight = bounds.depth * sin + bounds.height * cos;
  // Points nearer the camera look bigger, so back the camera off by half the view-axis extent.
  const viewAxisHalf = (bounds.depth * cos + bounds.height * sin) / 2;
  const byHeight = screenHeight / 2 / tanHalf;
  const byWidth = bounds.width / 2 / (tanHalf * safeAspect);
  const distance = Math.max(byHeight, byWidth) * margin + viewAxisHalf;

  const cx = bounds.center?.x ?? 0;
  const cz = bounds.center?.z ?? 0;
  const targetY = bounds.height / 2;
  return {
    target: { x: cx, y: targetY, z: cz },
    position: { x: cx, y: targetY + distance * sin, z: cz + distance * cos },
  };
}

/** Apply computeCameraPose to a camera and refresh its projection. */
export function fitCamera(
  camera: PerspectiveCamera,
  bounds: PlayfieldBounds,
  aspect: number,
  options?: CameraFitOptions,
): void {
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  const pose = computeCameraPose(bounds, camera.fov, aspect, options);
  camera.position.set(pose.position.x, pose.position.y, pose.position.z);
  camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
  camera.updateMatrixWorld();
}

/**
 * World size that appears at least `minPx` CSS pixels tall at `distance` from the camera. Used to
 * size invisible hit proxies so small objects stay tappable.
 */
export function minWorldSizeForPixels(
  minPx: number,
  distance: number,
  vfovDeg: number,
  viewportHeightPx: number,
): number {
  if (viewportHeightPx <= 0) return 0;
  const worldHeightAtDistance = 2 * distance * Math.tan((vfovDeg * DEG) / 2);
  return (minPx * worldHeightAtDistance) / viewportHeightPx;
}
