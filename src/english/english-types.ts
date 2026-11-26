// Shared English Island types (Phase 0): the five item kinds, the 41 skill ids,
// the word/unit/topic/pattern shapes 2A fills in, and the book-pack shape.
// Pure logic: no DOM, no `three`. English words are never translated — they travel
// as plain strings (`lang="en" translate="no"` at the UI layer, never through `t()`).

/** Letter blocks of the 8 stages (stage 8 reviews A–Z, so it has no block of its own). */
export const ENGLISH_LETTER_BLOCKS = ['a-d', 'e-h', 'i-l', 'm-p', 'q-t', 'u-x', 'y-z'] as const;
export type EnglishLetterBlock = (typeof ENGLISH_LETTER_BLOCKS)[number];

/** The 12 word topics (2A owns the sets). */
export const ENGLISH_TOPICS = [
  'animals',
  'colors',
  'family',
  'food',
  'body',
  'school',
  'toys',
  'clothes',
  'home',
  'weather',
  'actions',
  'transport',
] as const;
export type EnglishTopic = (typeof ENGLISH_TOPICS)[number];

/** The 7 sentence patterns (2A owns the sentences: ≥ 6 own 3–6-word sentences each). */
export const ENGLISH_PATTERNS = [
  'this-is',
  'i-like',
  'i-have',
  'i-can',
  'i-see',
  'what-is',
  'my-favourite',
] as const;
export type EnglishPattern = (typeof ENGLISH_PATTERNS)[number];

/**
 * The 41 `en-*` skill ids: 7 letter blocks × (letters + sounds + words),
 * alphabet order, 12 topics, 7 sentence patterns.
 */
export type EnglishSkillId =
  | `en-letters-${EnglishLetterBlock}`
  | `en-sounds-${EnglishLetterBlock}`
  | `en-words-${EnglishLetterBlock}`
  | 'en-alphabet-order'
  | `en-topic-${EnglishTopic}`
  | `en-pattern-${EnglishPattern}`;

export type EnglishItemKind =
  | 'listen-pick-picture'
  | 'match-pairs'
  | 'order-words'
  | 'fill-pattern'
  | 'letter-pick';

/** `'own'`: our content in the repo. `'pack'`: the family-passphrase book pack. */
export type EnglishItemSource = 'own' | 'pack';

/** One word↔picture pair: `picture` is an emoji or an SVG data URI. */
export interface EnglishPictureChoice {
  readonly word: string;
  readonly picture: string;
}

/** Hear the word, tap its picture. `choices` includes the `word` (the answer). */
export interface ListenPickPictureItem {
  readonly kind: 'listen-pick-picture';
  readonly skillId: EnglishSkillId;
  readonly source: EnglishItemSource;
  readonly word: string;
  readonly choices: readonly EnglishPictureChoice[];
}

/** Tap each word, then its picture. */
export interface MatchPairsItem {
  readonly kind: 'match-pairs';
  readonly skillId: EnglishSkillId;
  readonly source: EnglishItemSource;
  readonly pairs: readonly EnglishPictureChoice[];
}

/** Tap the word tiles into the one correct order (`words` is that order). */
export interface OrderWordsItem {
  readonly kind: 'order-words';
  readonly skillId: EnglishSkillId;
  readonly source: EnglishItemSource;
  readonly words: readonly string[];
}

/** One blank in the sentence, 2–4 options; `options` includes the blank's word. */
export interface FillPatternItem {
  readonly kind: 'fill-pattern';
  readonly skillId: EnglishSkillId;
  readonly source: EnglishItemSource;
  readonly sentence: readonly string[];
  readonly blankIndex: number;
  readonly options: readonly string[];
}

/** Pick the letter for the cue (`prompt` is the English word or sound label). */
export interface LetterPickItem {
  readonly kind: 'letter-pick';
  readonly skillId: EnglishSkillId;
  readonly source: EnglishItemSource;
  readonly prompt: string;
  readonly choices: readonly string[];
  readonly answer: string;
}

export type EnglishItem =
  | ListenPickPictureItem
  | MatchPairsItem
  | OrderWordsItem
  | FillPatternItem
  | LetterPickItem;

/** One word in the bank: English word, Vietnamese gloss, emoji/SVG picture or none. */
export interface EnglishWord {
  readonly word: string;
  readonly gloss: string;
  readonly picture: string | null;
}

/** A stage's sample content (2A maps units to stages in `units.ts`). */
export interface EnglishUnit {
  readonly id: string;
  readonly stage: number;
  readonly title: string;
  readonly skillIds: readonly EnglishSkillId[];
  readonly words: readonly EnglishWord[];
  readonly items: readonly EnglishItem[];
}

/**
 * A book pack (or a synthetic fixture): version 1, optional stage, the items,
 * and optional image data by id (the `'images'` part of the pack contract).
 */
export interface EnglishPack {
  readonly version: 1;
  readonly stage?: number;
  readonly items: readonly EnglishItem[];
  readonly images?: Readonly<Record<string, string>>;
}
