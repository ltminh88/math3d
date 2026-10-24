// Bakes a tree of single-colour meshes (the recovered builders' style) into one geometry with
// per-vertex colours, so a whole diorama or animal costs one draw call (plus its shadow pass).
// The source meshes, their geometries and materials are disposed: they are never rendered.
import {
  type BufferGeometry,
  Color,
  Float32BufferAttribute,
  type Material,
  Matrix4,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const KEPT_ATTRIBUTES = new Set(['position', 'normal']);

function colorOf(material: Material | Material[]): Color {
  const single = Array.isArray(material) ? material[0] : material;
  return (single as Partial<MeshStandardMaterial> | undefined)?.color ?? new Color(0xffffff);
}

/** One geometry (position, normal, color) in `root`'s local space; empty roots throw. */
export function bakeVertexColoredGeometry(root: Object3D): BufferGeometry {
  root.updateMatrixWorld(true);
  const toRoot = new Matrix4().copy(root.matrixWorld).invert();
  const parts: BufferGeometry[] = [];
  const materials = new Set<Material>();
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const source = node.geometry as BufferGeometry;
    const part = source.index ? source.toNonIndexed() : source.clone();
    part.applyMatrix4(new Matrix4().multiplyMatrices(toRoot, node.matrixWorld));
    for (const name of Object.keys(part.attributes)) {
      if (!KEPT_ATTRIBUTES.has(name)) part.deleteAttribute(name);
    }
    part.clearGroups();
    const color = colorOf(node.material);
    const count = part.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
    part.setAttribute('color', new Float32BufferAttribute(colors, 3));
    parts.push(part);
    source.dispose();
    for (const m of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(m);
    }
  });
  const merged = parts.length > 0 ? mergeGeometries(parts) : null;
  for (const part of parts) part.dispose();
  for (const material of materials) material.dispose();
  if (!merged) throw new Error('bakeVertexColoredGeometry: nothing to bake');
  merged.computeBoundingSphere();
  return merged;
}
