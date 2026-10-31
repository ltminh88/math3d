// KNTT T1 B21: khối lập phương, khối hộp chữ nhật (both: 6 mặt, 12 cạnh, 8 đỉnh). A cube is told
// from a box by its edges (all equal). Choose-all asks for cubes only, so no item has to decide
// whether a cube "is also" a box. Tier 3 multiplies a part count (the book's 3 × 8 = 24 flowers).
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberStep, optionsFrom, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoGenerator } from './geo-scene-types';
import { geoItem, LETTERS, letterOptions, qtyChoiceStep, scene } from './geometry-distractors';
import { DECOR_PER_MAX, SOLID_EDGE_MAX } from './geometry-ranges';

const edge = (rng: Rng) => randInt(rng, 1, SOLID_EDGE_MAX);

const cube = (rng: Rng): number[] => {
  const a = edge(rng);
  return [a, a, a];
};

/** Box edges: all different, or (tier 3 trap) two equal and one different. */
function box(rng: Rng, twoEqual: boolean): number[] {
  const [a, b, c] = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]) as [number, number, number];
  return twoEqual ? shuffle(rng, [a, a, b]) : [a, b, c];
}

export const geoSolidIdentify: GeoGenerator = (rng, tier) => {
  if (tier === 1) {
    const isCube = rng() < 0.5;
    const dims = isCube ? cube(rng) : box(rng, false);
    const right = isCube ? 'nameCube' : 'nameBox';
    const candidates = [
      { value: isCube ? 'nameBox' : 'nameCube', misconception: 'two-equal-is-cube' as const },
      { value: 'nameSquare', misconception: 'flat-not-solid' as const },
      { value: 'nameRect', misconception: 'flat-not-solid' as const },
    ];
    const options = optionsFrom(rng, right, candidates, (k) => ref(k));
    const step: ReasoningStep = { kind: 'choice', prompt: ref('askSolidName'), options };
    const s = scene({ kind: 'solids', solids: [{ label: 'A', dims }] });
    return geoItem('geo-solid-identify', tier, ref('solidName'), [step], s, null);
  }
  const cubes = randInt(rng, 1, 3);
  const solids = shuffle(
    rng,
    Array.from({ length: 4 }, (_, i) => (i < cubes ? cube(rng) : box(rng, tier === 3))),
  );
  const isCube = (d: readonly number[]) => new Set(d).size === 1;
  const options = letterOptions(
    solids.map((d) => ({
      correct: isCube(d),
      misconception: tier === 3 ? 'two-equal-is-cube' : 'wrong-shape',
    })),
  );
  const step: ReasoningStep = { kind: 'multi', prompt: ref('pickAllCubes'), options };
  const s = scene({
    kind: 'solids',
    solids: solids.map((dims, i) => ({ label: LETTERS[i] as string, dims })),
  });
  return geoItem('geo-solid-identify', tier, ref('pickCubes'), [step], s, null);
};

type Part = 'face' | 'edge' | 'vertex';
const PART_COUNT: Readonly<Record<Part, number>> = { face: 6, edge: 12, vertex: 8 };
const ASK: Readonly<Record<Part, string>> = {
  face: 'askFaces',
  edge: 'askEdges',
  vertex: 'askVertices',
};
/** What a child counts when only the 3 front faces are seen. */
const VISIBLE: Readonly<Record<Part, number>> = { face: 3, edge: 9, vertex: 7 };

function partsStep(rng: Rng, tier: SkillTier, part: Part): ReasoningStep {
  const answer = PART_COUNT[part];
  if (tier !== 2) return numberStep(ref(ASK[part]), answer);
  const others = (Object.keys(PART_COUNT) as Part[]).filter((p) => p !== part);
  return qtyChoiceStep(rng, ref(ASK[part]), answer, null, [
    { value: VISIBLE[part], misconception: 'visible-only' },
    ...others.map((p) => ({ value: PART_COUNT[p], misconception: 'wrong-step' as const })),
  ]);
}

export const geoSolidParts: GeoGenerator = (rng, tier) => {
  const part = pick(rng, ['face', 'edge', 'vertex'] as const);
  const isCube = tier !== 2;
  const dims = isCube ? cube(rng) : box(rng, false);
  const s = scene({ kind: 'solids', solids: [{ label: 'A', dims }] });
  const first = partsStep(rng, tier, part);
  if (tier !== 3) {
    const story = ref(isCube ? 'partsCube' : 'partsBox');
    return geoItem('geo-solid-parts', tier, story, [first], s, null);
  }
  const per = randInt(rng, 2, DECOR_PER_MAX[part]);
  const parts = PART_COUNT[part];
  const total = parts * per;
  const second = qtyChoiceStep(rng, ref('askDecorTotal'), total, null, [
    { value: parts + per, misconception: 'add-instead-of-times' },
    { value: VISIBLE[part] * per, misconception: 'visible-only' },
    { value: per, misconception: 'one-step-only' },
  ]);
  const story = ref('decor', { per, part: `i:${part}` });
  return geoItem('geo-solid-parts', tier, story, [first, second], s, null, [parts, total]);
};
