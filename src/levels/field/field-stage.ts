// Scene, lights and camera of the field level, tuned like the world (sky horizon colour, fog,
// hemisphere fill + shadow-casting sun). The renderer's global state is never touched: the sky is
// the scene background. The camera frames the plot inside the canvas area the HUD leaves free.
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
} from 'three';
import { SKY_HORIZON_COLOR } from '../../config/world-constants';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';

const FOV = 40;
const ELEVATION = (54 * Math.PI) / 180;
/** Canvas share the HUD covers: right column in landscape, lower part in portrait. */
const PANEL_RIGHT_PX = 392;
const PANEL_BOTTOM_SHARE = 0.57;
const SPEECH_TOP_PX = 88;

export interface FieldStage {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  /** Frames a plot of `radius` world units for a `width` x `height` canvas (CSS px). */
  fit(width: number, height: number, radius: number): void;
  /** Frees the sun's shadow map (a render target the scene disposer never reaches; QA M-3). */
  dispose(): void;
}

export function createFieldStage(lowPower: boolean): FieldStage {
  const scene = new Scene();
  scene.background = new Color(SKY_HORIZON_COLOR);
  scene.fog = new Fog(SKY_HORIZON_COLOR, 40, 90);
  scene.add(
    new HemisphereLight(
      WORLD_LIGHTING.hemisphereSky,
      WORLD_LIGHTING.hemisphereGround,
      WORLD_LIGHTING.hemisphereIntensity,
    ),
  );
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-10, 18, 9);
  sun.castShadow = true;
  const size = lowPower ? 512 : 1024;
  sun.shadow.mapSize.set(size, size);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -17,
    right: 17,
    top: 17,
    bottom: -17,
    near: 1,
    far: 60,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 120);
  const target = new Vector3(0, 0.3, 0.4);

  return {
    scene,
    camera,
    fit(width, height, radius) {
      if (width <= 0 || height <= 0) return;
      const portrait = width <= height * 1.05;
      const right = portrait ? 0 : Math.min(PANEL_RIGHT_PX, width * 0.45);
      const bottom = portrait ? height * PANEL_BOTTOM_SHARE : 0;
      const top = SPEECH_TOP_PX;
      const availW = Math.max(width - right, width * 0.4);
      const availH = Math.max(height - bottom - top, height * 0.3);
      const tanHalf = Math.tan(((FOV / 2) * Math.PI) / 180);
      const distance = Math.max(8, (radius * height) / (tanHalf * Math.min(availW, availH)));
      camera.aspect = width / height;
      camera.position.set(
        target.x,
        target.y + Math.sin(ELEVATION) * distance,
        target.z + Math.cos(ELEVATION) * distance,
      );
      camera.lookAt(target);
      const centerX = availW / 2;
      const centerY = top + availH / 2;
      camera.setViewOffset(width, height, width / 2 - centerX, height / 2 - centerY, width, height);
      camera.updateProjectionMatrix();
    },
    dispose: () => sun.shadow.dispose(),
  };
}
