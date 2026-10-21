// Low-poly animal friends in the recovered style (icosahedron bodies, cone ears and snouts),
// each baked into one vertex-coloured mesh. They face +z, towards the camera.
import {
  ConeGeometry,
  Group,
  IcosahedronGeometry,
  type Material,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { bakeVertexColoredGeometry } from './bake-vertex-colored-geometry';
import type { ANIMAL_NAME_KEYS } from './forest-strings';

export type AnimalKind = (typeof ANIMAL_NAME_KEYS)[number];

const EYE = 0x2b2b2b;
const NOSE = 0xd46a5f;

type Part = [
  geometry: 'ball' | 'cone',
  size: number,
  x: number,
  y: number,
  z: number,
  color: number,
];
interface PartOptions {
  scale?: [number, number, number];
  rotX?: number;
}

/** A crude part list per animal: [shape, radius, x, y, z, colour] (+ optional scale/tilt). */
const BODIES: Record<AnimalKind, readonly (readonly [Part, PartOptions?])[]> = {
  rabbit: [
    [['ball', 0.42, 0, 0.44, 0, 0xf4efe6], { scale: [1, 1.1, 1] }],
    [['ball', 0.3, 0, 0.98, 0.12, 0xf4efe6]],
    [['cone', 0.08, -0.12, 1.42, 0.06, 0xf4efe6], { scale: [1, 5, 1] }],
    [['cone', 0.08, 0.12, 1.42, 0.06, 0xf4efe6], { scale: [1, 5, 1] }],
    [['ball', 0.12, 0, 0.36, -0.42, 0xffffff]],
    [['ball', 0.06, 0, 0.92, 0.42, NOSE]],
  ],
  squirrel: [
    [['ball', 0.36, 0, 0.4, 0, 0xc9773d], { scale: [1, 1.15, 1] }],
    [['ball', 0.27, 0, 0.88, 0.1, 0xd0834a]],
    [['cone', 0.09, -0.15, 1.14, 0.06, 0xb2652f], { scale: [1, 2, 1] }],
    [['cone', 0.09, 0.15, 1.14, 0.06, 0xb2652f], { scale: [1, 2, 1] }],
    [['ball', 0.34, 0, 0.82, -0.42, 0xe09a5c], { scale: [0.8, 1.5, 0.7] }],
    [['ball', 0.16, 0, 0.36, 0.28, 0xf3dcc0]],
  ],
  fox: [
    [['ball', 0.4, 0, 0.42, 0, 0xe8742f], { scale: [1, 1, 1.15] }],
    [['ball', 0.29, 0, 0.9, 0.12, 0xee7f36]],
    [['cone', 0.13, 0, 0.84, 0.44, 0xf8efe2], { rotX: Math.PI / 2, scale: [1, 1.6, 1] }],
    [['cone', 0.11, -0.15, 1.2, 0.08, 0x40302a], { scale: [1, 2, 1] }],
    [['cone', 0.11, 0.15, 1.2, 0.08, 0x40302a], { scale: [1, 2, 1] }],
    [['ball', 0.22, 0, 0.42, -0.5, 0xf8efe2], { scale: [0.9, 0.9, 1.8] }],
  ],
  hedgehog: [
    [['ball', 0.44, 0, 0.36, 0, 0xe9cfa8], { scale: [1, 0.8, 1.1] }],
    [['cone', 0.5, 0, 0.6, -0.08, 0x5b4632], { scale: [1, 1.1, 1] }],
    [['ball', 0.22, 0, 0.36, 0.42, 0xe9cfa8]],
    [['ball', 0.06, 0, 0.36, 0.64, EYE]],
  ],
  bear: [
    [['ball', 0.56, 0, 0.6, 0, 0x8b5a3c], { scale: [1, 1.1, 1] }],
    [['ball', 0.4, 0, 1.34, 0.12, 0x95634a]],
    [['ball', 0.13, -0.3, 1.66, 0.06, 0x7a4c33]],
    [['ball', 0.13, 0.3, 1.66, 0.06, 0x7a4c33]],
    [['ball', 0.18, 0, 1.24, 0.46, 0xd9b38c], { scale: [1.2, 0.8, 1] }],
    [['ball', 0.06, 0, 1.3, 0.62, EYE]],
    [['ball', 0.3, 0, 0.56, 0.4, 0xc59b75], { scale: [1, 1.2, 0.5] }],
  ],
};

/** Eyes sit on the head ball (second part) of every animal except the hedgehog. */
function addEyes(group: Group, kind: AnimalKind): void {
  const head = BODIES[kind][kind === 'hedgehog' ? 2 : 1]?.[0];
  if (!head) return;
  const [, radius, x, y, z] = head;
  for (const side of [-1, 1]) {
    const eye = new Mesh(
      new IcosahedronGeometry(0.045, 0),
      new MeshStandardMaterial({ color: EYE }),
    );
    eye.position.set(x + side * radius * 0.42, y + radius * 0.2, z + radius * 0.86);
    group.add(eye);
  }
}

function partMesh([shape, size, x, y, z, color]: Part, options: PartOptions = {}): Mesh {
  const geometry =
    shape === 'ball' ? new IcosahedronGeometry(size, 1) : new ConeGeometry(size, size * 1.2, 7);
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  if (options.scale) mesh.scale.set(...options.scale);
  if (options.rotX) mesh.rotation.x = options.rotX;
  return mesh;
}

/** One animal friend as a single mesh using the shared vertex-colour `material`. */
export function createAnimalFriend(kind: AnimalKind, material: Material): Mesh {
  const scratch = new Group();
  for (const [part, options] of BODIES[kind]) scratch.add(partMesh(part, options));
  addEyes(scratch, kind);
  const mesh = new Mesh(bakeVertexColoredGeometry(scratch), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = `forest-${kind}`;
  return mesh;
}

export const createAnimalMaterial = (): MeshStandardMaterial =>
  new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true });
