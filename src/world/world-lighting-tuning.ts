// Lighting and material constants in one place (phase 10, three r180 -> r186 bump).
// r181+ energy conservation takes the Fresnel share out of the diffuse term (direct and
// hemisphere), so the same lights render ~1.3 sRGB levels darker on r186; r182+ dropped
// PCFSoftShadowMap for a noise-rotated PCFShadowMap. Measured against the r180 parity
// baselines (plans/.../reports/r186-retune/): both lights x1.027 and shadow radius 1.5 bring
// mean canvas delta from 1.56 to 0.25 levels.
// Rollback to the r180 values: hemisphere 2.6, sun 3.2, shadow radius 1 (three default).
const R181_ENERGY_COMPENSATION = 1.027;

export const WORLD_LIGHTING = {
  toneMappingExposure: 1.12,
  hemisphereSky: 0xf2fbff,
  hemisphereGround: 0x5c765c,
  hemisphereIntensity: 2.6 * R181_ENERGY_COMPENSATION,
  sunColor: 0xfff0c9,
  sunIntensity: 3.2 * R181_ENERGY_COMPENSATION,
  shadowRadius: 1.5,
  roughness: { primitive: 0.9, ground: 0.95, sign: 0.8 },
} as const;
