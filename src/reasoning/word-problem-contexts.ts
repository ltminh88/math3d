// Story contexts for the word-problem skills (phase 02). A context is one visible sentence
// frame plus the nouns that fit it — packs of pencils, rows of chairs, boxes of cakes,
// teams carrying stones, the book's own settings (SGK Toán 3 KNTT B24–B28, B39). The
// generator draws the context by the seeded rng, so the same seed still reproduces the
// same item. `lesson` is the SGK lesson the context follows, in the catalog's format.
// The step prompts are shared across a skill's contexts, except the compare frames,
// which name their own container in the ask prompts too.
import { GENERIC_NOUNS } from './reasoning-distractors';

export interface WpContext {
  readonly key: string;
  /** Nouns that fit the frame, as `i:` params. */
  readonly nouns: readonly string[];
  readonly lesson: string;
  /** The frame names a single child (e.g. "Bạn Mai xếp …"), so the story carries a `who`. */
  readonly who?: true;
}

export interface MoreLessContext extends WpContext {
  readonly more: boolean;
}

export interface CompareContext extends WpContext {
  /** Ask prompts for this frame's container ("gấp mấy lần" / "hơn bao nhiêu"). */
  readonly askTimes: string;
  readonly askMore: string;
}

export const WP_TIMES_THEN_ADD: readonly WpContext[] = [
  { key: 'wpTimesThenAdd', nouns: GENERIC_NOUNS, lesson: 'T1 B24, B28' },
  { key: 'wpTimesThenAddChairs', nouns: ['i:chair'], lesson: 'T1 B24' },
  { key: 'wpTimesThenAddCakes', nouns: ['i:cake', 'i:candy'], lesson: 'T1 B24' },
  {
    key: 'wpTimesThenAddHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B24',
  },
];

export const WP_DIVIDE_THEN_ADD: readonly WpContext[] = [
  { key: 'wpDivideThenAdd', nouns: GENERIC_NOUNS, lesson: 'T1 B27, B28' },
  {
    key: 'wpDivideThenAddHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B27',
  },
  { key: 'wpDivideThenAddMake', nouns: ['i:cake', 'i:candy'], lesson: 'T1 B27' },
  {
    key: 'wpDivideThenAddPack',
    nouns: ['i:pencil', 'i:notebook', 'i:book'],
    lesson: 'T1 B27',
  },
];

/** R8: the same a·n as wp-times-then-add, but B uses a (as many as A has): a·n − a. */
export const WP_TIMES_THEN_SUB: readonly WpContext[] = [
  { key: 'wpTimesThenSub', nouns: GENERIC_NOUNS, lesson: 'T1 B24, B28' },
  { key: 'wpTimesThenSubChairs', nouns: ['i:chair'], lesson: 'T1 B24' },
  { key: 'wpTimesThenSubCakes', nouns: ['i:cake', 'i:candy'], lesson: 'T1 B24' },
  {
    key: 'wpTimesThenSubHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B24',
  },
];

/** R8: the same a + a:n as wp-divide-then-add, but A uses as many as B has: a − a:n. */
export const WP_DIVIDE_THEN_SUB: readonly WpContext[] = [
  { key: 'wpDivideThenSub', nouns: GENERIC_NOUNS, lesson: 'T1 B27, B28' },
  {
    key: 'wpDivideThenSubHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B27',
  },
  { key: 'wpDivideThenSubMake', nouns: ['i:cake', 'i:candy'], lesson: 'T1 B27' },
  {
    key: 'wpDivideThenSubPack',
    nouns: ['i:pencil', 'i:notebook', 'i:book'],
    lesson: 'T1 B27',
  },
];

export const WP_MORE_LESS_THEN_TOTAL: readonly MoreLessContext[] = [
  { key: 'wpMoreThenTotal', nouns: GENERIC_NOUNS, lesson: 'T1 B28', more: true },
  { key: 'wpLessThenTotal', nouns: GENERIC_NOUNS, lesson: 'T1 B28', more: false },
  {
    key: 'wpMoreThenTotalHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B28',
    more: true,
  },
  {
    key: 'wpLessThenTotalHarvest',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B28',
    more: false,
  },
  {
    key: 'wpMoreThenTotalMake',
    nouns: ['i:cake', 'i:candy'],
    lesson: 'T1 B28',
    more: true,
  },
  {
    key: 'wpLessThenTotalMake',
    nouns: ['i:cake', 'i:candy'],
    lesson: 'T1 B28',
    more: false,
  },
];

/** Shared by both compare skills: the same big/small pair in three more settings. */
export const COMPARE_CONTEXTS: readonly CompareContext[] = [
  {
    key: 'wpCompareCrates',
    nouns: ['i:apple', 'i:orange', 'i:ball'],
    lesson: 'T1 B39',
    askTimes: 'askTimesCrate',
    askMore: 'askMoreCrate',
  },
  {
    key: 'wpCompareClasses',
    nouns: ['i:book', 'i:notebook', 'i:pencil'],
    lesson: 'T1 B39',
    askTimes: 'askTimesClass',
    askMore: 'askMoreClass',
  },
  {
    key: 'wpCompareGardens',
    nouns: ['i:apple', 'i:orange', 'i:flower'],
    lesson: 'T1 B39',
    askTimes: 'askTimesGarden',
    askMore: 'askMoreGarden',
  },
];

const BASKETS: CompareContext = {
  key: '',
  nouns: GENERIC_NOUNS,
  lesson: 'T1 B39',
  askTimes: 'askTimes',
  askMore: 'askMore',
};

export const WP_TIMES_COMPARE: readonly CompareContext[] = [
  { ...BASKETS, key: 'wpTimesCompare' },
  ...COMPARE_CONTEXTS,
];

export const WP_DIFFERENCE_COMPARE: readonly CompareContext[] = [
  { ...BASKETS, key: 'wpDifferenceCompare' },
  ...COMPARE_CONTEXTS,
];

export const WP_UNIT_THEN_TIMES: readonly WpContext[] = [
  { key: 'wpUnitThenTimes', nouns: GENERIC_NOUNS, lesson: 'T1 B28' },
  {
    key: 'wpUnitThenTimesPack',
    nouns: ['i:pencil', 'i:notebook', 'i:book', 'i:cake'],
    lesson: 'T1 B28',
    who: true,
  },
  { key: 'wpUnitThenTimesShop', nouns: GENERIC_NOUNS, lesson: 'T1 B28' },
  { key: 'wpUnitThenTimesStore', nouns: GENERIC_NOUNS, lesson: 'T1 B28' },
];

/** Story keys per word-problem skill, for the counter and the vi/en render test. */
export const WP_CONTEXT_KEYS: Readonly<Record<string, readonly string[]>> = {
  'wp-times-then-add': WP_TIMES_THEN_ADD.map((c) => c.key),
  'wp-divide-then-add': WP_DIVIDE_THEN_ADD.map((c) => c.key),
  'wp-times-then-sub': WP_TIMES_THEN_SUB.map((c) => c.key),
  'wp-divide-then-sub': WP_DIVIDE_THEN_SUB.map((c) => c.key),
  'wp-more-less-then-total': WP_MORE_LESS_THEN_TOTAL.map((c) => c.key),
  'wp-unit-then-times': WP_UNIT_THEN_TIMES.map((c) => c.key),
  'wp-times-compare': WP_TIMES_COMPARE.map((c) => c.key),
  'wp-difference-compare': WP_DIFFERENCE_COMPARE.map((c) => c.key),
};
