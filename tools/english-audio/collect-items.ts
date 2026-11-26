// Collects every text the English run can speak, from the Phase 2A content
// data. Order is deterministic: bank words (bank order), letters a–z,
// pattern sentences (pattern order), then what-is Q+A combos (the question
// the item shows + the answer sentence, as `speakTextFor` joins them).
// Run with tsx to emit items.json — the clip generator's input list.
//
// The seed list (R74 step 1) lives in seed.json, the single source the
// generator script reads too; items.json marks seed items so `--seed` runs
// only them.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGLISH_PATTERN_SENTENCES } from '../../src/english/content/patterns';
import { ENGLISH_WORD_BANK } from '../../src/english/content/word-bank';
import type { EnglishPattern } from '../../src/english/english-types';

export type ClipKind = 'word' | 'letter' | 'sentence';

export interface ClipText {
  readonly text: string;
  readonly kind: ClipKind;
  readonly seed: boolean;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const PATTERN_ORDER: readonly EnglishPattern[] = [
  'this-is',
  'i-like',
  'i-have',
  'i-can',
  'i-see',
  'what-is',
  'my-favourite',
];

/** The fixed step-1 seed list (12 words + 5 letters + 4 sentences). */
export const SEED_TEXTS: readonly string[] = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'seed.json'), 'utf8'),
) as readonly string[];

/** Every speakable text, in deterministic order. */
export function collectClipTexts(): ClipText[] {
  const seed = new Set(SEED_TEXTS);
  const texts: ClipText[] = [];
  for (const word of ENGLISH_WORD_BANK) {
    texts.push({ text: word.word, kind: 'word', seed: seed.has(word.word) });
  }
  for (const letter of ALPHABET) {
    texts.push({ text: letter, kind: 'letter', seed: seed.has(letter) });
  }
  for (const pattern of PATTERN_ORDER) {
    for (const words of ENGLISH_PATTERN_SENTENCES[pattern]) {
      const text = words.join(' ');
      texts.push({ text, kind: 'sentence', seed: seed.has(text) });
    }
  }
  // what-is items speak "question + answer" (see speakTextFor): the question
  // is "What is this?" for even answers, "What is that?" for odd ones.
  ENGLISH_PATTERN_SENTENCES['what-is'].forEach((words, index) => {
    const question = index % 2 === 0 ? 'What is this?' : 'What is that?';
    const text = `${question} ${words.join(' ')}`;
    texts.push({ text, kind: 'sentence', seed: seed.has(text) });
  });
  return texts;
}

/** Emit items.json next to this file (the generator's input list). */
function main(): void {
  const dir = dirname(fileURLToPath(import.meta.url));
  const items = collectClipTexts();
  writeFileSync(join(dir, 'items.json'), `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  const seeds = items.filter((i) => i.seed).length;
  console.log(`wrote items.json: ${items.length} texts (${seeds} seed)`);
}

if (process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
