// The parcel box with its ribbon, baked into one vertex-coloured geometry shared by every parcel.
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { PARCEL_SIZE } from './city-layout';

export function parcelGeometry() {
  const scratch = new Group();
  const part = (w: number, h: number, d: number, color: number) =>
    scratch.add(new Mesh(new BoxGeometry(w, h, d), new MeshStandardMaterial({ color })));
  const s = PARCEL_SIZE;
  part(s, s * 0.8, s, 0xc9935a);
  part(s * 1.02, s * 0.82, s * 0.16, 0xe85d5d);
  part(s * 0.16, s * 0.82, s * 1.02, 0xe85d5d);
  return bakeVertexColoredGeometry(scratch);
}
