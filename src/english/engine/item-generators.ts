// Item generators (Phase 1B, pure; 2A banks): build one `EnglishItem` from a
// stage unit's own words. Tier rules: tier 1 = 3 choices, tier 2 = 4 choices
// with a confusable letter (b/d, p/q) on letter-pick, tier 3 = listen-only on
// listen-pick-picture. Pattern sentences come from the 2A bank in
// `content/patterns.ts` (all 7 patterns); word pools are filtered by skill so
// a topic skill only serves its own topic and a block skill only serves words
// starting in its block.

import { pick, type Rng, shuffle } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { ENGLISH_PATTERN_SENTENCES } from '../content/patterns';
import { ENGLISH_TOPIC_WORDS } from '../content/topics';
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

function blockRange(skillId: EnglishSkillId): [string, string] | null {
  const match = /en-(?:letters|sounds|words)-([a-z])-([a-z])$/.exec(skillId);
  if (!match) return null;
  return [match[1] as string, match[2] as string];
}

function blockLetters(skillId: EnglishSkillId): string[] {
  const range = blockRange(skillId);
  if (!range) return ALPHABET.split('');
  const start = ALPHABET.indexOf(range[0]);
  const end = ALPHABET.indexOf(range[1]);
  return ALPHABET.slice(start, end + 1).split('');
}

/**
 * The words a skill may serve: a topic skill serves only its topic's words;
 * a block skill serves only words starting in its block. The schema test
 * checks every pool has enough words; an empty pool is a content bug.
 */
export function poolFor(skillId: EnglishSkillId, unit: EnglishUnit): EnglishWord[] {
  if (skillId.startsWith('en-topic-')) {
    const topic = skillId.slice('en-topic-'.length);
    const names = new Set(ENGLISH_TOPIC_WORDS[topic as keyof typeof ENGLISH_TOPIC_WORDS] ?? []);
    return unit.words.filter((w) => names.has(w.word));
  }
  const range = blockRange(skillId);
  if (!range) return [...unit.words];
  const [start, end] = range;
  return unit.words.filter((w) => (w.word[0] as string) >= start && (w.word[0] as string) <= end);
}

function pickWord(skillId: EnglishSkillId, unit: EnglishUnit, rng: Rng): EnglishWord {
  const pool = poolFor(skillId, unit);
  if (pool.length === 0) throw new Error(`generateItem: empty word pool for ${skillId}`);
  return pick(rng, pool);
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
  pool: EnglishWord[],
  rng: Rng,
): EnglishWord[] {
  const others = pool.filter((w) => w.word !== answer.word);
  if (others.length < count) {
    throw new Error(`generateItem: need ${count + 1} words, pool has ${pool.length}`);
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
  const word = pickWord(skillId, unit, rng);
  const answer = word.word[0] as string;
  return {
    kind: 'letter-pick',
    skillId,
    source: 'own',
    prompt: word.word,
    choices: letterChoices(answer, tier, blockLetters(skillId), rng),
    answer,
    // R146: the widget shows this picture instead of the word.
    picture: word.picture ?? null,
  };
}

function listenPickPicture(
  skillId: EnglishSkillId,
  tier: SkillTier,
  unit: EnglishUnit,
  rng: Rng,
): EnglishItem {
  const pool = poolFor(skillId, unit);
  const word = pickWord(skillId, unit, rng);
  const count = tier === 1 ? 2 : 3;
  const choices = choiceWords(word, count, pool, rng).map((w) => ({
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
  const pool = poolFor(skillId, unit);
  if (pool.length < 3) {
    throw new Error(`generateItem: need 3 words for match-pairs, pool has ${pool.length}`);
  }
  const pairs = shuffle(rng, pool)
    .slice(0, 3)
    .map((w) => ({ word: w.word, picture: w.picture ?? '🖼️' }));
  return { kind: 'match-pairs', skillId, source: 'own', pairs };
}

/**
 * A pattern sentence from the 2A bank: the sentence itself is the item, its
 * last word is the fill-pattern blank. Distractors are the last words of the
 * pattern's other sentences (same slot, same kind of word). what-is pairs its
 * answer sentence with the displayed question ("What is this?" on even
 * sentences, "What is that?" on odd ones); other patterns have no question.
 */
function patternWords(
  skillId: EnglishSkillId,
  rng: Rng,
): { words: string[]; keyWord: string; siblings: string[]; question?: string } {
  const pattern = skillId.slice('en-pattern-'.length);
  const sentences = ENGLISH_PATTERN_SENTENCES[pattern as keyof typeof ENGLISH_PATTERN_SENTENCES];
  if (!sentences || sentences.length === 0) {
    throw new Error(`generateItem: no sentence bank for ${skillId}`);
  }
  const picked = pick(rng, [...sentences]);
  const words = [...(picked as readonly string[])];
  const keyWord = words[words.length - 1] as string;
  const siblings = sentences.map((s) => s[s.length - 1] as string).filter((w) => w !== keyWord);
  if (pattern !== 'what-is') return { words, keyWord, siblings: [...new Set(siblings)] };
  const index = sentences.indexOf(picked);
  const question = index % 2 === 0 ? 'What is this?' : 'What is that?';
  return { words, keyWord, siblings: [...new Set(siblings)], question };
}

function orderWords(skillId: EnglishSkillId, rng: Rng): EnglishItem {
  const { words, question } = patternWords(skillId, rng);
  return { kind: 'order-words', skillId, source: 'own', words, ...(question ? { question } : {}) };
}

function fillPattern(skillId: EnglishSkillId, tier: SkillTier, rng: Rng): EnglishItem {
  const { words, keyWord, siblings, question } = patternWords(skillId, rng);
  const blankIndex = words.length - 1;
  const count = tier === 1 ? 1 : tier === 2 ? 2 : 3;
  if (siblings.length < count) {
    throw new Error(
      `generateItem: need ${count + 1} sibling words for ${skillId}, bank has ${siblings.length + 1}`,
    );
  }
  const options = shuffle(rng, [keyWord, ...shuffle(rng, siblings).slice(0, count)]);
  return {
    kind: 'fill-pattern',
    skillId,
    source: 'own',
    sentence: words,
    blankIndex,
    options,
    ...(question ? { question } : {}),
  };
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
      return orderWords(skillId, rng);
    case 'fill-pattern':
      return fillPattern(skillId, tier, rng);
  }
}
