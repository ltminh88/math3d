// Item generators (Phase 1B, pure): build one `EnglishItem` from a stage unit's
// own words. Tier rules: tier 1 = 3 choices, tier 2 = 4 choices with a confusable
// letter (b/d, p/q) on letter-pick, tier 3 = listen-only on listen-pick-picture.
// 1B has no speech yet (3B), so tier 3 still shows the word — the `listenOnly`
// flag is set on the item and the widget honours it once speech lands.
// Pattern sentences only exist for this-is / i-like in 1B (seed unit 1);
// 2A adds the other patterns' banks.

import { pick, type Rng, shuffle } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import type {
  EnglishItem,
  EnglishItemKind,
  EnglishSkillId,
  EnglishUnit,
  EnglishWord,
} from '../english-types';
import { kindsForSkill } from './item-planner';

/** Letters children mix up: b/d and p/q look alike. */
export const CONFUSABLE_LETTER: Readonly<Record<string, string>> = {
  b: 'd',
  d: 'b',
  p: 'q',
  q: 'p',
};

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const plural = (word: string): string => `${word}s`;

function blockLetters(skillId: EnglishSkillId): string[] {
  const match = /en-(?:letters|sounds)-([a-z])-([a-z])$/.exec(skillId);
  if (!match) return ALPHABET.split('');
  const start = ALPHABET.indexOf(match[1] as string);
  const end = ALPHABET.indexOf(match[2] as string);
  return ALPHABET.slice(start, end + 1).split('');
}

function letterChoices(answer: string, tier: SkillTier, pool: string[], rng: Rng): string[] {
  const count = tier === 1 ? 3 : 4;
  const picked = new Set<string>([answer]);
  if (tier >= 2 && CONFUSABLE_LETTER[answer]) picked.add(CONFUSABLE_LETTER[answer] as string);
  for (const letter of shuffle(rng, pool)) {
    if (picked.size >= count) break;
    picked.add(letter);
  }
  for (const letter of shuffle(rng, ALPHABET.split(''))) {
    if (picked.size >= count) break;
    picked.add(letter);
  }
  return shuffle(rng, [...picked]);
}

function choiceWords(
  answer: EnglishWord,
  count: number,
  unit: EnglishUnit,
  rng: Rng,
): EnglishWord[] {
  const others = unit.words.filter((w) => w.word !== answer.word);
  if (others.length < count) {
    throw new Error(`generateItem: need ${count + 1} words, unit has ${unit.words.length}`);
  }
  return shuffle(rng, [answer, ...shuffle(rng, others).slice(0, count)]);
}

function letterPick(
  skillId: EnglishSkillId,
  tier: SkillTier,
  unit: EnglishUnit,
  rng: Rng,
): EnglishItem {
  if (skillId === 'en-alphabet-order') {
    const prompt = pick(rng, ALPHABET.slice(0, 25).split(''));
    const answer = ALPHABET[ALPHABET.indexOf(prompt) + 1] as string;
    return {
      kind: 'letter-pick',
      skillId,
      source: 'own',
      prompt,
      choices: letterChoices(answer, tier, ALPHABET.split(''), rng),
      answer,
    };
  }
  const word = pick(rng, unit.words);
  const answer = word.word[0] as string;
  return {
    kind: 'letter-pick',
    skillId,
    source: 'own',
    prompt: word.word,
    choices: letterChoices(answer, tier, blockLetters(skillId), rng),
    answer,
  };
}

function listenPickPicture(
  skillId: EnglishSkillId,
  tier: SkillTier,
  unit: EnglishUnit,
  rng: Rng,
): EnglishItem {
  const word = pick(rng, unit.words);
  const count = tier === 1 ? 2 : 3;
  const choices = choiceWords(word, count, unit, rng).map((w) => ({
    word: w.word,
    picture: w.picture ?? '🖼️',
  }));
  return {
    kind: 'listen-pick-picture',
    skillId,
    source: 'own',
    word: word.word,
    choices,
    ...(tier === 3 ? { listenOnly: true } : {}),
  };
}

function matchPairs(skillId: EnglishSkillId, unit: EnglishUnit, rng: Rng): EnglishItem {
  if (unit.words.length < 3) {
    throw new Error(`generateItem: need 3 words for match-pairs, unit has ${unit.words.length}`);
  }
  const pairs = shuffle(rng, unit.words)
    .slice(0, 3)
    .map((w) => ({ word: w.word, picture: w.picture ?? '🖼️' }));
  return { kind: 'match-pairs', skillId, source: 'own', pairs };
}

function patternWords(
  skillId: EnglishSkillId,
  unit: EnglishUnit,
  rng: Rng,
): { words: string[]; keyWord: string } {
  const word = pick(rng, unit.words).word;
  if (skillId === 'en-pattern-i-like') {
    return { words: ['I', 'like', plural(word)], keyWord: plural(word) };
  }
  if (skillId === 'en-pattern-this-is') {
    return { words: ['This', 'is', 'a', word], keyWord: word };
  }
  throw new Error(`generateItem: no 1B sentence template for ${skillId}`);
}

function orderWords(skillId: EnglishSkillId, unit: EnglishUnit, rng: Rng): EnglishItem {
  const { words } = patternWords(skillId, unit, rng);
  return { kind: 'order-words', skillId, source: 'own', words };
}

function fillPattern(
  skillId: EnglishSkillId,
  tier: SkillTier,
  unit: EnglishUnit,
  rng: Rng,
): EnglishItem {
  const { words, keyWord } = patternWords(skillId, unit, rng);
  const blankIndex = words.length - 1;
  const count = tier === 1 ? 1 : tier === 2 ? 2 : 3;
  const others = unit.words
    .map((w) => (skillId === 'en-pattern-i-like' ? plural(w.word) : w.word))
    .filter((w) => w !== keyWord);
  if (others.length < count) {
    throw new Error(`generateItem: need ${count + 1} words, unit has ${unit.words.length}`);
  }
  const options = shuffle(rng, [keyWord, ...shuffle(rng, others).slice(0, count)]);
  return { kind: 'fill-pattern', skillId, source: 'own', sentence: words, blankIndex, options };
}

/** Build one item of `kind` for `skillId` at `tier` from the unit's own words. */
export function generateItem(
  skillId: EnglishSkillId,
  kind: EnglishItemKind,
  tier: SkillTier,
  unit: EnglishUnit,
  rng: Rng,
): EnglishItem {
  if (!kindsForSkill(skillId).includes(kind)) {
    throw new Error(`generateItem: ${skillId} cannot make ${kind}`);
  }
  switch (kind) {
    case 'letter-pick':
      return letterPick(skillId, tier, unit, rng);
    case 'listen-pick-picture':
      return listenPickPicture(skillId, tier, unit, rng);
    case 'match-pairs':
      return matchPairs(skillId, unit, rng);
    case 'order-words':
      return orderWords(skillId, unit, rng);
    case 'fill-pattern':
      return fillPattern(skillId, tier, unit, rng);
  }
}
