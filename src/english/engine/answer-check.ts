// Answer check (Phase 1B, pure): one user action against one item.
// A "wrong pick index" is returned for the recorder's `wrongAnswers` (the
// Leitner box drops once per wrong attempt; `errs` keeps the index of the
// wrong choice, or the first misplaced position for order-words).
import type { EnglishItem } from '../english-types';

export type EnglishAttempt =
  | { kind: 'listen-pick-picture'; index: number }
  | { kind: 'letter-pick'; index: number }
  | { kind: 'fill-pattern'; index: number }
  | { kind: 'match-pairs'; word: string; picture: string }
  | { kind: 'order-words'; words: readonly string[] };

export interface CheckedAnswer {
  readonly correct: boolean;
  /** 0-based index of the wrong pick, or the first misplaced position; null when right. */
  readonly wrongPickIndex: number | null;
}

export function checkAnswer(item: EnglishItem, attempt: EnglishAttempt): CheckedAnswer {
  switch (item.kind) {
    case 'listen-pick-picture': {
      if (attempt.kind !== 'listen-pick-picture') throw new Error('checkAnswer: kind mismatch');
      const correct = item.choices[attempt.index]?.word === item.word;
      return { correct, wrongPickIndex: correct ? null : attempt.index };
    }
    case 'letter-pick': {
      if (attempt.kind !== 'letter-pick') throw new Error('checkAnswer: kind mismatch');
      const correct = item.choices[attempt.index] === item.answer;
      return { correct, wrongPickIndex: correct ? null : attempt.index };
    }
    case 'fill-pattern': {
      if (attempt.kind !== 'fill-pattern') throw new Error('checkAnswer: kind mismatch');
      const correct = item.options[attempt.index] === item.sentence[item.blankIndex];
      return { correct, wrongPickIndex: correct ? null : attempt.index };
    }
    case 'match-pairs': {
      if (attempt.kind !== 'match-pairs') throw new Error('checkAnswer: kind mismatch');
      const pair = item.pairs.find((p) => p.word === attempt.word);
      const correct = pair?.picture === attempt.picture;
      const idx = item.pairs.findIndex((p) => p.word === attempt.word);
      return { correct, wrongPickIndex: correct ? null : idx < 0 ? 0 : idx };
    }
    case 'order-words': {
      if (attempt.kind !== 'order-words') throw new Error('checkAnswer: kind mismatch');
      let firstWrong: number | null = null;
      for (let i = 0; i < item.words.length; i++) {
        if (attempt.words[i] !== item.words[i]) {
          firstWrong = i;
          break;
        }
      }
      if (firstWrong === null && attempt.words.length !== item.words.length) {
        firstWrong = attempt.words.length;
      }
      return { correct: firstWrong === null, wrongPickIndex: firstWrong };
    }
  }
}

/** What the current item expects, in the terms a spec taps (test hook). */
export type EnglishExpected =
  | { kind: 'listen-pick-picture'; index: number }
  | { kind: 'letter-pick'; index: number }
  | { kind: 'fill-pattern'; index: number }
  | { kind: 'match-pairs'; pairs: readonly { word: string; picture: string }[] }
  | { kind: 'order-words'; words: readonly string[] };

export function expectedOf(item: EnglishItem): EnglishExpected {
  switch (item.kind) {
    case 'listen-pick-picture':
      return {
        kind: 'listen-pick-picture',
        index: item.choices.findIndex((c) => c.word === item.word),
      };
    case 'letter-pick':
      return { kind: 'letter-pick', index: item.choices.indexOf(item.answer) };
    case 'fill-pattern':
      return {
        kind: 'fill-pattern',
        index: item.options.indexOf(item.sentence[item.blankIndex] as string),
      };
    case 'match-pairs':
      return { kind: 'match-pairs', pairs: item.pairs };
    case 'order-words':
      return { kind: 'order-words', words: item.words };
  }
}
