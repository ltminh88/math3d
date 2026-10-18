// Minified three r180 identifiers used by the recovered app section, mapped to their
// public export names. `marker` is a string that must appear inside the minified
// definition in recovered/formatted/three-section.js; strip-three verifies every entry.

export type ThreeIdEntry = {
  /** Export name in `three` (or in the addon module below). */
  name: string;
  /** Text that proves the identity of the minified definition. */
  marker: string;
  /** Import source, defaults to `three`. */
  from?: string;
};

export const BUFFER_GEOMETRY_UTILS = 'three/addons/utils/BufferGeometryUtils.js';

export const THREE_ID_MAP: Record<string, ThreeIdEntry> = {
  $i: { name: 'ConeGeometry', marker: "type = 'ConeGeometry'" },
  Ba: { name: 'OctahedronGeometry', marker: "type = 'OctahedronGeometry'" },
  En: { name: 'InstancedMesh', marker: 'isInstancedMesh = !0' },
  F: { name: 'Vector3', marker: 'isVector3 = !0' },
  Li: { name: 'PlaneGeometry', marker: "type = 'PlaneGeometry'" },
  Lt: { name: 'BackSide', marker: 'Lt = 1,' },
  Mt: { name: 'Object3D', marker: 'isObject3D = !0' },
  Na: { name: 'Fog', marker: 'isFog = !0' },
  Ni: { name: 'BoxGeometry', marker: "type = 'BoxGeometry'" },
  Oa: { name: 'DodecahedronGeometry', marker: "type = 'DodecahedronGeometry'" },
  Qh: { name: 'HemisphereLight', marker: 'isHemisphereLight = !0' },
  Ss: { name: 'MeshStandardMaterial', marker: 'isMeshStandardMaterial = !0' },
  St: { name: 'Mesh', marker: 'isMesh = !0' },
  Tn: { name: 'Plane', marker: 'isPlane = !0' },
  Ut: { name: 'SRGBColorSpace', marker: "Ut = 'srgb'," },
  Vm: { name: 'WebGLRenderer', marker: 'isWebGLRenderer = !0' },
  We: { name: 'Vector2', marker: 'isVector2 = !0' },
  Wh: { name: 'Scene', marker: 'isScene = !0' },
  Wm: {
    name: 'mergeGeometries',
    marker: 'mergeGeometries() failed',
    from: BUFFER_GEOMETRY_UTILS,
  },
  Wt: { name: 'PerspectiveCamera', marker: 'isPerspectiveCamera = !0' },
  Yi: { name: 'IcosahedronGeometry', marker: "type = 'IcosahedronGeometry'" },
  Zh: { name: 'CanvasTexture', marker: 'isCanvasTexture = !0' },
  _l: { name: 'PCFSoftShadowMap', marker: '_l = 2,' },
  fr: { name: 'MathUtils', marker: 'DEG2RAD: Xi' },
  gn: { name: 'ShaderMaterial', marker: 'isShaderMaterial = !0' },
  ke: { name: 'Color', marker: 'isColor = !0' },
  kt: { name: 'BufferAttribute', marker: 'isBufferAttribute = !0' },
  nu: { name: 'DirectionalLight', marker: 'isDirectionalLight = !0' },
  ru: { name: 'Clock', marker: 'this.autoStart = e' },
  su: { name: 'Raycaster', marker: 'this.ray = new Dl(e, t)' },
  tn: { name: 'DoubleSide', marker: 'tn = 2,' },
  tr: { name: 'CylinderGeometry', marker: "type = 'CylinderGeometry'" },
  ut: { name: 'Group', marker: 'isGroup = !0' },
  xl: { name: 'ACESFilmicToneMapping', marker: 'xl = 4,' },
  za: { name: 'SphereGeometry', marker: "type = 'SphereGeometry'" },
};
