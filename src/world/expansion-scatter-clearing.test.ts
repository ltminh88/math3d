import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { clearExpansionGround, type ScatterMeshes } from './expansion-scatter-clearing';

const material = new MeshBasicMaterial();
const at = (x: number, z: number) => new Matrix4().makeTranslation(x, 0, z);

function mesh(points: readonly (readonly [number, number])[], colored = false): InstancedMesh {
  const m = new InstancedMesh(new BoxGeometry(), material, points.length + 2);
  points.forEach(([x, z], i) => {
    m.setMatrixAt(i, at(x, z));
    if (colored) m.setColorAt(i, new Color(i / 10, 0, 0));
  });
  m.count = points.length;
  return m;
}

function positions(m: InstancedMesh): number[][] {
  const out: number[][] = [];
  const matrix = new Matrix4();
  for (let i = 0; i < m.count; i++) {
    m.getMatrixAt(i, matrix);
    out.push([12, 14].map((k) => Math.round((matrix.elements[k] as number) * 100) / 100));
  }
  return out;
}

// Free ground (kept), valley centre (40,-37), workshop road (46,20), cave centre (-32,32).
const FREE: [number, number] = [20, 30];
const FREE2: [number, number] = [-20, -30];
const VALLEY: [number, number] = [40, -37];
const ROAD: [number, number] = [46, 20];
const CAVE: [number, number] = [-32, 32];

function scatter(): ScatterMeshes {
  // Trees 0 (pine: 2 cones), 1 and 2 (leafy: 2 blobs each), 3 (pine), 4 (leafy).
  const trees: [number, number][] = [FREE, VALLEY, FREE2, ROAD, [60, 0]];
  return {
    trunks: mesh(trees),
    cones: mesh([FREE, FREE, ROAD, ROAD], true),
    blobs: mesh([VALLEY, [41, -36.5], FREE2, FREE2, [60, 0], [60.5, 0.2]], true),
    rocks: mesh([CAVE, FREE, [55, -5]]),
    stems: mesh([FREE, CAVE, [46.5, 30]]),
    blossoms: mesh([FREE, CAVE, [46.5, 30]], true),
    tufts: mesh([
      [21, 31],
      [-31, 33],
      [47, 31],
    ]),
  };
}

describe('clearExpansionGround', () => {
  it('removes scatter inside expansion footprints and on expansion roads, keeps the rest in order', () => {
    const meshes = scatter();
    const obstacles = [
      { x: 0, z: 0, radius: 1 }, // before the scatter range: never touched
      ...[FREE, VALLEY, FREE2, ROAD].map(([x, z]) => ({ x, z, radius: 0.5 })),
      { x: 41, z: -36, radius: 2 }, // after the range (a gate): never touched
    ];
    const random = vi.spyOn(Math, 'random');
    clearExpansionGround(meshes, obstacles, 1, 5);
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();

    expect(positions(meshes.trunks)).toEqual([FREE, FREE2, [60, 0]]);
    expect(positions(meshes.cones)).toEqual([FREE, FREE]);
    expect(positions(meshes.blobs)).toEqual([FREE2, FREE2, [60, 0], [60.5, 0.2]]);
    expect(positions(meshes.rocks)).toEqual([FREE, [55, -5]]);
    expect(positions(meshes.stems)).toEqual([FREE]);
    expect(positions(meshes.blossoms)).toEqual([FREE]);
    expect(positions(meshes.tufts)).toEqual([[21, 31]]);
    expect(obstacles.map((o) => [o.x, o.z])).toEqual([[0, 0], FREE, FREE2, [41, -36]]);
  });

  it('moves instance colours with their instances', () => {
    const meshes = scatter();
    clearExpansionGround(meshes, [], 0, 0);
    const color = new Color();
    meshes.blobs.getColorAt(0, color);
    expect(color.r).toBeCloseTo(0.2);
    meshes.blobs.getColorAt(2, color);
    expect(color.r).toBeCloseTo(0.4);
  });
});
