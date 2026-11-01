// Hint ladder of a workshop step (pure): rung 1 encourages, rung 2 says the rule in words ("đi
// một vòng quanh viền", "đếm ô vuông phủ kín"), rung 3 gives a partial step as an expression the
// child still works out. No rung states an answer; three misses reveal it (round flow). Keys live
// in workshop-hint-strings.ts.
import type { GeoItem } from '../../geometry/geo-scene-types';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef } from '../../reasoning/reasoning-types';

const PERIMETER = new Set([
  'askPerim',
  'askMissing',
  'askHalfPerim',
  'askWidth',
  'askPerimRect',
  'askSide',
  'askPerimSquare',
  'askFence',
  'askPerimM',
]);

const RULE: Readonly<Record<string, string>> = {
  askLenCm: 'h2Ruler',
  askLenMm: 'h2Ruler',
  askNumber: 'h2Mm',
  askToMm: 'h2Mm',
  askLonger: 'h2Compare',
  askDiffMm: 'h2Compare',
  askItemG: 'h2Gram',
  askWeightsTotal: 'h2Gram',
  askHeavier: 'h2Heavier',
  askHowMuchHeavier: 'h2Heavier',
  askEachG: 'h2Share',
  askPerMark: 'h2PerMark',
  askWaterMl: 'h2Ml',
  askPoured: 'h2Poured',
  askLeftMl: 'h2Poured',
  askTemp: 'h2Temp',
  askHottest: 'h2TempCompare',
  askColdest: 'h2TempCompare',
  askDrop: 'h2TempCompare',
  pickUnit: 'h2Unit',
};

const ref = (key: string, params?: PromptRef['params']): PromptRef =>
  params ? { key, params } : { key };

function rule(item: GeoItem, promptKey: string): PromptRef {
  if (PERIMETER.has(promptKey)) return ref('h2Perim');
  if (/Area|CellCount|YellowSide/.test(promptKey))
    return ref(item.scene.kind === 'cells' ? 'h2AreaCount' : 'h2AreaRect');
  return ref(RULE[promptKey] ?? 'h2Look');
}

/** Rung 3: a partial step built from numbers the child can already see. */
function partial(item: GeoItem, promptKey: string): PromptRef {
  const s = item.scene;
  const story = item.story.params ?? {};
  const join = (ns: readonly number[]) => ns.join(' + ');
  const rect = s.kind === 'rect' ? { a: s.width, b: s.height } : { a: 0, b: 0 };
  switch (promptKey) {
    case 'askLenCm':
    case 'askLenMm':
      if (s.kind !== 'ruler') break;
      return promptKey === 'askLenCm'
        ? ref('h3RulerStart', { start: s.fromMm / 10, u: 'cm' })
        : ref('h3RulerStart', { start: s.fromMm, u: 'mm' });
    case 'askNumber':
      return 'n' in story ? ref('h3CmToMm', { n: story.n as number }) : ref('h3MmToCm', story);
    case 'askLonger':
    case 'askToMm':
      return ref('h3ToMm', { a: story.a as number });
    case 'askDiffMm':
      return ref('h3DiffMm', { b: story.b as number });
    case 'askItemG':
    case 'askWeightsTotal':
      return s.kind === 'balance' ? ref('h3Weights', { expr: join(s.weights) }) : ref('h3Look');
    case 'askHeavier':
      return ref('h3Heavier', { a: story.a as number, b: story.b as number });
    case 'askHowMuchHeavier': {
      const [x, y] = [story.a as number, story.b as number];
      return ref('h3Minus', { big: Math.max(x, y), small: Math.min(x, y) });
    }
    case 'askEachG':
      return ref('h3Share', { count: story.count as number });
    case 'askPerMark':
    case 'askWaterMl':
      if (s.kind !== 'jug') break;
      return ref(promptKey === 'askPerMark' ? 'h3PerMark' : 'h3JugCount', {
        capacity: s.capacity,
        marks: s.marks,
      });
    case 'askPoured':
      return ref('h3Poured', { cups: story.cups as number, per: story.per as number });
    case 'askLeftMl':
      return ref('h3LeftMl', { total: story.total as number });
    case 'askTemp':
      return s.kind === 'thermometers' ? ref('h3Temp', { step: s.minorStep }) : ref('h3Look');
    case 'askHottest':
    case 'askColdest':
      return ref('h3TempCompare');
    case 'askDrop':
      return ref('h3Minus', { big: story.noon as number, small: story.night as number });
    case 'askPerim':
      return s.kind === 'side-polygon' ? ref('h3Sum', { expr: join(s.sides) }) : ref('h3Look');
    case 'askMissing': {
      if (s.kind !== 'side-polygon') break;
      const known = s.sides.filter((_, i) => !s.hidden.includes(i));
      return ref('h3Missing', { p: story.p as number, expr: join(known) });
    }
    case 'askHalfPerim':
      return item.story.key === 'rectPerimBack'
        ? ref('h3HalfBack', { p: story.p as number })
        : ref('h3Plus', rect);
    case 'askWidth':
      return ref('h3Width', { a: story.a as number });
    case 'askPerimRect':
    case 'askPerimM':
      return ref('h3Rect', rect);
    case 'askPerimSquare':
      return ref('h3Square', { s: rect.a });
    case 'askSide':
      return ref('h3SquareBack', { p: story.p as number });
    case 'askFence':
      if (item.story.key === 'fenceGate') return ref('h3Gate', { g: story.g as number });
      return ref(item.story.key === 'fenceWall' ? 'h3Wall' : 'h3Rect', rect);
    case 'askAreaMore':
      return ref('h3AreaMore');
    case 'askAreaRect':
    case 'askAreaRectNum':
    case 'askRectArea':
    case 'askRedArea':
      return ref('h3AreaRect', rect);
    case 'askCutArea':
      return ref('h3Square2', { s: s.kind === 'rect' ? (s.cut ?? 0) : 0 });
    case 'askLeftArea':
      return ref('h3LeftArea');
    case 'askAreaSquare':
    case 'askAreaSquareNum':
      return ref('h3Square2', { s: rect.a });
    case 'askYellowArea':
      return ref('h3Double');
    case 'askYellowSide':
      return ref('h3SideFromArea');
    case 'pickUnit':
      return ref('h3Unit');
  }
  if (s.kind === 'cells') return ref('h3Rows');
  return ref('h3Look');
}

/** The hint for `rung` (1-3) on playable step `stepIndex` of `item`. */
export function workshopHint(item: GeoItem, rung: number, stepIndex: number): PromptRef {
  const step = playableSteps(item)[stepIndex];
  if (rung <= 1 || !step) return ref('h1');
  return rung === 2 ? rule(item, step.prompt.key) : partial(item, step.prompt.key);
}

const NOTES: Partial<Record<Misconception, string>> = {
  'perimeter-not-area': 'mPerimNotArea',
  'area-not-perimeter': 'mAreaNotPerim',
  'read-end-not-length': 'mReadEnd',
  'count-marks': 'mCountMarks',
};

/** A short note after a wrong choice that mixes up two ideas (chu vi / diện tích...), else null. */
export function misconceptionNote(m: Misconception | undefined): PromptRef | null {
  const key = m ? NOTES[m] : undefined;
  return key ? ref(key) : null;
}
