// Gradient sky dome and the height function that raises hills beyond the walkable banks.
import { BackSide, Color, MathUtils, Mesh, ShaderMaterial, SphereGeometry } from 'three';
import { SKY_HORIZON_COLOR, SKY_TOP_COLOR, WALKABLE_BOUNDS } from '../config/world-constants';

// Shader sources are kept verbatim (phase 10 checks them against three deprecations).
const SKY_VERTEX_SHADER =
  'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const SKY_FRAGMENT_SHADER = `uniform vec3 top; uniform vec3 horizon; varying vec3 vDir; void main(){ float h = smoothstep(0.0, 0.55, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/** Back-faced, fog-free sphere drawn first (renderOrder -1); the frame loop keeps it on the camera. */
export function createSkyDome(): Mesh {
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new Color(SKY_TOP_COLOR) },
      horizon: { value: new Color(SKY_HORIZON_COLOR) },
    },
    vertexShader: SKY_VERTEX_SHADER,
    fragmentShader: SKY_FRAGMENT_SHADER,
  });
  const sky = new Mesh(new SphereGeometry(1200, 32, 16), material);
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  return sky;
}

/** Terrain height at (x, z): flat within 8 units of the walkable area, rolling hills beyond. */
export function groundHeight(x: number, z: number): number {
  const bounds = WALKABLE_BOUNDS;
  const outsideX = Math.max(bounds.west.minX - x, x - bounds.east.maxX, 0);
  const outsideZ = Math.max(bounds.minZ - z, z - bounds.maxZ, 0);
  const distance = Math.hypot(outsideX, outsideZ);
  if (distance < 8) {
    return 0;
  }
  const riverFade = MathUtils.clamp((Math.abs(x - 7) - 7) / 24, 0, 1);
  const noise =
    (Math.sin(x * 0.045) + Math.sin(z * 0.06 + 1.3) + Math.sin((x + z) * 0.025 + 2) + 3) / 6;
  return Math.min(1, (distance - 8) / 70) * riverFade * (3 + noise * 20);
}
