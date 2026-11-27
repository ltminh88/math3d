// Look 1 skill ids (two-modes Phase 1): the 29 `en-look-*` ids, pinned here
// in this order, never reordered (Phase 4 appends the entries in this order).
// 3 starter skills, 12 unit word skills, 12 unit pattern skills, 2 phonics
// skills. Phase 1 only pins the list and the type — the entries are NOT
// registered yet (that would surface empty stickers early); Phase 4 does it.
import type { EnglishSkillId } from './english-types';

/** The 29 Look 1 skill ids, in pinned order. */
export const LOOK_SKILL_IDS: readonly EnglishSkillId[] = Object.freeze([
  'en-look-starter-numbers',
  'en-look-starter-colors',
  'en-look-starter-greetings',
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((n) => `en-look-u${n}-words` as const),
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map(
    (n) => `en-look-u${n}-pattern` as const,
  ),
  'en-look-phonics-initial',
  'en-look-phonics-short-vowels',
]);
