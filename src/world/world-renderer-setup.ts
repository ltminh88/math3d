// WebGL renderer, fog and lights. Phones / small or touch screens take the "low power" path:
// lower pixel ratio, half-size shadow map and fewer scattered instances (see world-scatter.ts).
import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PCFShadowMap,
  type Scene,
  SRGBColorSpace,
  type Vector3,
  WebGLRenderer,
} from 'three';
import { SKY_HORIZON_COLOR } from '../config/world-constants';
import { WORLD_LIGHTING } from './world-lighting-tuning';

const LOW_POWER_QUERY = '(max-width: 900px), (pointer: coarse)';

export interface WorldRendererSetup {
  renderer: WebGLRenderer;
  lowPower: boolean;
}

/** Creates the renderer on `canvas` and decides the low-power path (evaluated once). */
export function createWorldRenderer(canvas: HTMLCanvasElement): WorldRendererSetup {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  const lowPower = matchMedia(LOW_POWER_QUERY).matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));
  renderer.shadowMap.enabled = true;
  // r182+: PCFSoftShadowMap is gone; PCFShadowMap is the soft filter now.
  renderer.shadowMap.type = PCFShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = WORLD_LIGHTING.toneMappingExposure;
  renderer.setClearColor(SKY_HORIZON_COLOR);
  return { renderer, lowPower };
}

/** Adds fog, the hemisphere fill and the shadow-casting sun; returns the sun. */
export function addWorldLights(scene: Scene, lowPower: boolean): DirectionalLight {
  scene.fog = new Fog(SKY_HORIZON_COLOR, 150, 560);
  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.castShadow = true;
  const mapSize = lowPower ? 1024 : 2048;
  sun.shadow.mapSize.set(mapSize, mapSize);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  scene.add(sun, sun.target);
  return sun;
}

export interface SunShadowState {
  readonly sun: DirectionalLight;
  readonly active: boolean;
  /** Camera focus point; the shadow box is centred on it. */
  readonly target: Vector3;
  /** Half-extent of the current shadow camera box (0 = not configured yet). */
  shadowSize: number;
}

/** Tight shadow box while playing, wide one on the title screen; sun trails the focus point. */
export function updateSunShadow(state: SunShadowState): void {
  const size = state.active ? 46 : 95;
  const shadow = state.sun.shadow;
  if (size !== state.shadowSize) {
    state.shadowSize = size;
    Object.assign(shadow.camera, {
      left: -size,
      right: size,
      top: size,
      bottom: -size,
      near: 1,
      far: size * 3.2,
    });
    shadow.camera.updateProjectionMatrix();
  }
  state.sun.target.position.copy(state.target);
  state.sun.position.set(state.target.x - 24, 42, state.target.z + 16);
}
