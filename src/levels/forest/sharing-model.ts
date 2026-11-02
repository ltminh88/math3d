// Pure model of the forest's sharing table: where every fruit is (the pile or a group), dealing,
// moving and the equality check. Two stories use it: sharing N fruit among friends (partitive,
// groups = divisor, uncapped so uneven dealing is allowed) and packing N fruit into baskets of k
// (quotative, groups = quotient, capacity = k, baskets appear one after another).

/** Where a fruit is: the pile, or the index of a friend / basket. */
export type Spot = number | 'pile';

export interface SharingState {
  readonly total: number;
  readonly groups: number;
  /** Basket size when packing; null when sharing among friends. */
  readonly capacity: number | null;
  /** Spot of every fruit, by fruit index. */
  readonly spots: readonly Spot[];
}

export type ShareMark = 'ok' | 'tooMany' | 'tooFew';

export interface SharingCheck {
  /** Pile empty. */
  complete: boolean;
  /** Pile empty and every group holds `target`. */
  equal: boolean;
  /** Fruit each group must end with. */
  target: number;
  /** Per visible group: has the right amount, too many or too few. */
  marks: ShareMark[];
  pile: number;
}

export const isExactDivision = (dividend: number, divisor: number): boolean =>
  Number.isInteger(dividend) &&
  Number.isInteger(divisor) &&
  divisor > 0 &&
  dividend > 0 &&
  dividend % divisor === 0;

export function createSharing(options: {
  total: number;
  groups: number;
  capacity?: number;
}): SharingState {
  const { total, groups } = options;
  const capacity = options.capacity ?? null;
  const exact = capacity === null ? isExactDivision(total, groups) : total === capacity * groups;
  if (!exact) throw new Error(`createSharing: ${total} fruit must share exactly (${groups})`);
  return { total, groups, capacity, spots: Array.from({ length: total }, () => 'pile' as Spot) };
}

export function countsOf(state: SharingState): number[] {
  const counts = new Array<number>(state.groups).fill(0);
  for (const spot of state.spots) if (spot !== 'pile') counts[spot] = (counts[spot] ?? 0) + 1;
  return counts;
}

export const pileCount = (state: SharingState): number =>
  state.spots.filter((spot) => spot === 'pile').length;

const target = (state: SharingState): number => state.capacity ?? state.total / state.groups;

/** Groups on the table: all friends; for baskets, the filled ones plus the next empty one. */
export function visibleGroups(state: SharingState): number {
  if (state.capacity === null) return state.groups;
  const counts = countsOf(state);
  const full = counts.filter((count) => count >= target(state)).length;
  let lastUsed = -1;
  counts.forEach((count, i) => {
    if (count > 0) lastUsed = i;
  });
  return Math.min(state.groups, Math.max(full + 1, lastUsed + 1));
}

export function canMove(state: SharingState, fruit: number, to: Spot): boolean {
  const from = state.spots[fruit];
  if (from === undefined || from === to) return false;
  if (to === 'pile') return true;
  if (!Number.isInteger(to) || to < 0 || to >= visibleGroups(state)) return false;
  return state.capacity === null || (countsOf(state)[to] ?? 0) < state.capacity;
}

export function moveFruit(state: SharingState, fruit: number, to: Spot): SharingState {
  if (!canMove(state, fruit, to)) return state;
  const spots = state.spots.slice();
  spots[fruit] = to;
  return { ...state, spots };
}

/**
 * One "deal" press: sharing gives one fruit to each friend (round robin, stops when the pile is
 * empty); packing fills the next basket that is not full yet.
 */
export function dealStep(state: SharingState): SharingState {
  if (pileCount(state) === 0) return state;
  const spots = state.spots.slice();
  const nextInPile = () => spots.indexOf('pile');
  if (state.capacity === null) {
    for (let group = 0; group < state.groups; group++) {
      const fruit = nextInPile();
      if (fruit < 0) break;
      spots[fruit] = group;
    }
  } else {
    const counts = countsOf(state);
    const basket = counts.findIndex((count) => count < (state.capacity as number));
    if (basket < 0) return state;
    for (let n = counts[basket] ?? 0; n < state.capacity; n++) {
      const fruit = nextInPile();
      if (fruit < 0) break;
      spots[fruit] = basket;
    }
  }
  return { ...state, spots };
}

export function checkSharing(state: SharingState): SharingCheck {
  const goal = target(state);
  const pile = pileCount(state);
  const counts = countsOf(state).slice(0, visibleGroups(state));
  const marks = counts.map<ShareMark>((count) =>
    count === goal ? 'ok' : count > goal ? 'tooMany' : 'tooFew',
  );
  const complete = pile === 0;
  return { complete, equal: complete && marks.every((m) => m === 'ok'), target: goal, marks, pile };
}

/** One tick of the rung 2 auto-deal; with `all` (reduced motion) the whole pile at once. */
export function autoDealStep(state: SharingState, all: boolean): SharingState {
  let next = dealStep(state);
  while (all && pileCount(next) > 0) next = dealStep(next);
  return next;
}
