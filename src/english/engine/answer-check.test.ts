import { describe, expect, it } from 'vitest';
import { SEED_UNIT_1 } from '../content/seed-unit-1';
import { checkAnswer, expectedOf } from './answer-check';

const listen = SEED_UNIT_1.items[1];
const pairs = SEED_UNIT_1.items[2];
const order = SEED_UNIT_1.items[3];
const fill = SEED_UNIT_1.items[4];
const letter = SEED_UNIT_1.items[0];

describe('checkAnswer', () => {
  it('accepts the right picture choice and rejects the others', () => {
    if (listen?.kind !== 'listen-pick-picture') throw new Error('seed item shape changed');
    const right = listen.choices.findIndex((c) => c.word === listen.word);
    expect(checkAnswer(listen, { kind: 'listen-pick-picture', index: right })).toEqual({
      correct: true,
      wrongPickIndex: null,
    });
    const wrong = (right + 1) % listen.choices.length;
    expect(checkAnswer(listen, { kind: 'listen-pick-picture', index: wrong })).toEqual({
      correct: false,
      wrongPickIndex: wrong,
    });
  });

  it('accepts the right letter and fill option', () => {
    if (letter?.kind !== 'letter-pick') throw new Error('seed item shape changed');
    const right = letter.choices.indexOf(letter.answer);
    expect(checkAnswer(letter, { kind: 'letter-pick', index: right }).correct).toBe(true);
    expect(checkAnswer(letter, { kind: 'letter-pick', index: (right + 1) % 3 }).correct).toBe(
      false,
    );
    if (fill?.kind !== 'fill-pattern') throw new Error('seed item shape changed');
    const fillRight = fill.options.indexOf(fill.sentence[fill.blankIndex] as string);
    expect(checkAnswer(fill, { kind: 'fill-pattern', index: fillRight }).correct).toBe(true);
    expect(
      checkAnswer(fill, { kind: 'fill-pattern', index: (fillRight + 1) % fill.options.length })
        .correct,
    ).toBe(false);
  });

  it('checks one pair at a time and reports the word index when wrong', () => {
    if (pairs?.kind !== 'match-pairs') throw new Error('seed item shape changed');
    const [first] = pairs.pairs;
    if (!first) throw new Error('seed item shape changed');
    expect(
      checkAnswer(pairs, { kind: 'match-pairs', word: first.word, picture: first.picture }),
    ).toEqual({ correct: true, wrongPickIndex: null });
    const other = pairs.pairs[1];
    if (!other) throw new Error('seed item shape changed');
    expect(
      checkAnswer(pairs, { kind: 'match-pairs', word: first.word, picture: other.picture }),
    ).toEqual({ correct: false, wrongPickIndex: 0 });
  });

  it('checks the word order and reports the first misplaced position', () => {
    if (order?.kind !== 'order-words') throw new Error('seed item shape changed');
    expect(checkAnswer(order, { kind: 'order-words', words: ['I', 'like', 'cats'] })).toEqual({
      correct: true,
      wrongPickIndex: null,
    });
    expect(checkAnswer(order, { kind: 'order-words', words: ['cats', 'like', 'I'] })).toEqual({
      correct: false,
      wrongPickIndex: 0,
    });
    expect(checkAnswer(order, { kind: 'order-words', words: ['I', 'cats', 'like'] })).toEqual({
      correct: false,
      wrongPickIndex: 1,
    });
  });

  it('throws on a kind mismatch', () => {
    if (letter?.kind !== 'letter-pick') throw new Error('seed item shape changed');
    expect(() => checkAnswer(letter, { kind: 'listen-pick-picture', index: 0 })).toThrow(
      'kind mismatch',
    );
  });
});

describe('expectedOf', () => {
  it('returns the tappable answer for every seed item', () => {
    for (const item of SEED_UNIT_1.items) {
      const expected = expectedOf(item);
      expect(expected.kind).toBe(item.kind);
      if (expected.kind === 'listen-pick-picture' && item.kind === 'listen-pick-picture') {
        expect(item.choices[expected.index]?.word).toBe(item.word);
      }
      if (expected.kind === 'letter-pick' && item.kind === 'letter-pick') {
        expect(item.choices[expected.index]).toBe(item.answer);
      }
      if (expected.kind === 'fill-pattern' && item.kind === 'fill-pattern') {
        expect(item.options[expected.index]).toBe(item.sentence[item.blankIndex]);
      }
      if (expected.kind === 'match-pairs' && item.kind === 'match-pairs') {
        expect(expected.pairs).toEqual(item.pairs);
      }
      if (expected.kind === 'order-words' && item.kind === 'order-words') {
        expect(expected.words).toEqual(item.words);
      }
    }
  });
});
