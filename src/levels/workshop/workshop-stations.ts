// The workshop's stations and the skill plan of a run (pure). A run tells one story: measure with
// the ruler, fence a garden (chu vi), tile the same floor (diện tích), one more fence or tiling
// order, then two instruments. Inside a slot the weakest skill goes first (lowest Leitner box,
// then the one not seen for longest), ties broken by the run's rng.
//
// A stage re-weights which skill fills a slot, never the slot order. Stage 1 is today's run.
// Stage 2 drills the perimeter pair in the two fence slots (one in the fence slot, the other in
// the flex slot, so both appear). Stage 3 drills the area trio in the two tiling slots. Stage 4
// drills cm↔mm at the ruler and the three instruments; the fence, tiles and flex slots keep
// today's skills because no conversion skill fits those stations. Stage 5 keeps today's slots
// but guarantees the fence word problem in the flex slot. Unknown stages play stage 1.
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { type Rng, shuffle } from '../../learning/seeded-rng';

export type WorkshopStation = 'ruler' | 'fence' | 'tiles' | 'balance' | 'jug' | 'thermometer';

export const STATION_OF: Readonly<Record<string, WorkshopStation>> = {
  'meas-ruler-read': 'ruler',
  'meas-mm-convert': 'ruler',
  'meas-gram': 'balance',
  'meas-gram-calc': 'balance',
  'meas-ml': 'jug',
  'meas-ml-calc': 'jug',
  'meas-temperature': 'thermometer',
  'meas-temperature-compare': 'thermometer',
  'meas-perimeter-polygon': 'fence',
  'meas-perimeter-rect': 'fence',
  'meas-perimeter-square': 'fence',
  'meas-area-count': 'tiles',
  'meas-area-rect': 'tiles',
  'meas-area-square': 'tiles',
  'meas-area-equal': 'tiles',
  'meas-wp-fence': 'fence',
};

export const WORKSHOP_ROUNDS = 6;

const INSTRUMENTS = [
  'meas-gram',
  'meas-ml',
  'meas-temperature',
  'meas-gram-calc',
  'meas-ml-calc',
  'meas-temperature-compare',
];

/** Stations in the workshop's story order: balance, jug, thermometer. */
const STATION_ORDER: readonly WorkshopStation[] = ['balance', 'jug', 'thermometer'];

/** Candidates per round, in story order (the two instrument rounds take different skills). */
const SLOTS: readonly (readonly string[])[] = [
  ['meas-ruler-read', 'meas-mm-convert'],
  ['meas-perimeter-rect'],
  ['meas-area-rect'],
  [
    'meas-perimeter-polygon',
    'meas-perimeter-square',
    'meas-wp-fence',
    'meas-area-count',
    'meas-area-square',
    'meas-area-equal',
  ],
  INSTRUMENTS,
  INSTRUMENTS,
];

/** Slot candidates per stage; stage 1 is SLOTS (today's run). */
const STAGE_SLOTS: Readonly<Record<number, readonly (readonly string[])[]>> = {
  1: SLOTS,
  2: [
    ['meas-ruler-read', 'meas-mm-convert'],
    ['meas-perimeter-rect', 'meas-perimeter-square'],
    ['meas-area-rect'],
    ['meas-perimeter-square', 'meas-perimeter-rect'],
    INSTRUMENTS,
    INSTRUMENTS,
  ],
  3: [
    ['meas-ruler-read', 'meas-mm-convert'],
    ['meas-perimeter-rect'],
    ['meas-area-rect', 'meas-area-square', 'meas-area-count'],
    ['meas-area-square', 'meas-area-count'],
    INSTRUMENTS,
    INSTRUMENTS,
  ],
  4: [
    ['meas-mm-convert'],
    ['meas-perimeter-rect'],
    ['meas-area-rect'],
    [
      'meas-perimeter-polygon',
      'meas-perimeter-square',
      'meas-wp-fence',
      'meas-area-count',
      'meas-area-square',
      'meas-area-equal',
    ],
    INSTRUMENTS,
    INSTRUMENTS,
  ],
  5: [
    ['meas-ruler-read', 'meas-mm-convert'],
    ['meas-perimeter-rect'],
    ['meas-area-rect'],
    ['meas-wp-fence'],
    INSTRUMENTS,
    INSTRUMENTS,
  ],
};

type Stats = Readonly<Record<string, FactStat | undefined>>;

/** Weakest first: lowest box, then least recently seen; the shuffle breaks ties. */
function weakestFirst(ids: readonly string[], stats: Stats, rng: Rng): string[] {
  const of = (id: string) => stats[skillKey(id)];
  return shuffle(rng, ids).sort(
    (a, b) =>
      (of(a)?.box ?? 1) - (of(b)?.box ?? 1) ||
      (of(a)?.lastSeenSession ?? 0) - (of(b)?.lastSeenSession ?? 0),
  );
}

/** Skill ids for `rounds` rounds (at most six), in story order. Stage 1 is today's run. */
export function planWorkshopSkills(stats: Stats, rng: Rng, rounds: number, stage = 1): string[] {
  const slots = STAGE_SLOTS[stage] ?? SLOTS;
  const chosen: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i] as readonly string[];
    let free = slot.filter((id) => !chosen.includes(id));
    // The two instrument rounds are two different instruments: the second one never
    // repeats the first one's station (six instrument skills, three stations — R8).
    if (i === 5 && chosen[4]) {
      const firstStation = STATION_OF[chosen[4] as string];
      free = free.filter((id) => STATION_OF[id] !== firstStation);
    }
    chosen.push(weakestFirst(free, stats, rng)[0] as string);
  }
  // Instruments in the workshop's order: balance, jug, thermometer.
  const tail = chosen.splice(4).sort(
    (a, b) =>
      STATION_ORDER.indexOf(STATION_OF[a] as WorkshopStation) -
      STATION_ORDER.indexOf(STATION_OF[b] as WorkshopStation),
  );
  return [...chosen, ...tail].slice(0, Math.min(rounds, WORKSHOP_ROUNDS));
}
