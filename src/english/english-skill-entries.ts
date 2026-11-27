// English Island skill entries (Phase 0): the 41 `en-*` ids.
// Catalog order: letter blocks A–D … Y–Z (letters, sounds, words per block),
// alphabet order, the 12 topics, the 7 sentence patterns.
// English skills follow no SGK lesson, so `lessons: []` — they never enter
// "Ôn theo bài" (skillsOfLesson only picks skills with lessons) and the
// kntt-lesson-index orphan check exempts the family.
// Phase 4 appends the 29 `en-look-*` ids (pinned order in look-skill-ids.ts)
// after the 41 CEC ids, same family, same empty lessons.
import { entry, type SkillEntry } from '../learning/skill-entry';
import {
  ENGLISH_LETTER_BLOCKS,
  ENGLISH_PATTERNS,
  ENGLISH_TOPICS,
  type EnglishSkillId,
} from './english-types';
import { LOOK_SKILL_IDS } from './look-skill-ids';

/** The 41 English skill ids, in catalog order. */
export const ENGLISH_SKILL_IDS: readonly EnglishSkillId[] = Object.freeze([
  ...ENGLISH_LETTER_BLOCKS.map((b) => `en-letters-${b}` as const),
  ...ENGLISH_LETTER_BLOCKS.map((b) => `en-sounds-${b}` as const),
  ...ENGLISH_LETTER_BLOCKS.map((b) => `en-words-${b}` as const),
  'en-alphabet-order',
  ...ENGLISH_TOPICS.map((t) => `en-topic-${t}` as const),
  ...ENGLISH_PATTERNS.map((p) => `en-pattern-${p}` as const),
]);

/** English skills, in catalog order: the 41 CEC ids, then the 29 Look ids. */
export const ENGLISH_ENTRIES: readonly SkillEntry[] = Object.freeze([
  ...ENGLISH_SKILL_IDS.map((id) => entry(id, 'english', [])),
  ...LOOK_SKILL_IDS.map((id) => entry(id, 'english', [])),
]);
