import { type BufferGeometry, type Material, MeshLambertMaterial } from 'three';
import { LOW_POLY_PALETTE, type PaletteKey } from './low-poly-palette';

// Never-disposed cache for geometries and materials shared across scenes. The scene disposer asks
// isShared() so it only frees per-scene one-offs.
const geometries = new Map<string, BufferGeometry>();
const materials = new Map<string, Material>();

export function getGeometry(key: string, build: () => BufferGeometry): BufferGeometry {
  let geometry = geometries.get(key);
  if (!geometry) {
    geometry = build();
    geometries.set(key, geometry);
  }
  return geometry;
}

/** Flat-shaded Lambert material for a palette color (one instance per color). */
export function getMaterial(paletteKey: PaletteKey): Material {
  return getCustomMaterial(`palette:${paletteKey}`, () => {
    return new MeshLambertMaterial({ color: LOW_POLY_PALETTE[paletteKey], flatShading: true });
  });
}

/** For non-palette shared materials (e.g. the transparent blob shadow). */
export function getCustomMaterial(key: string, build: () => Material): Material {
  let material = materials.get(key);
  if (!material) {
    material = build();
    materials.set(key, material);
  }
  return material;
}

export function isShared(resource: object): boolean {
  for (const g of geometries.values()) if (g === resource) return true;
  for (const m of materials.values()) if (m === resource) return true;
  return false;
}
