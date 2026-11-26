// The 7 sentence patterns (Phase 2A, self-written): each pattern has ≥ 6
// own 3–6-word sentences. Every sentence has all-distinct words, so its one
// correct order is unique; the last word is the fill-pattern blank. The
// generator picks a sentence from the bank for order-words and fill-pattern.
import type { EnglishPattern } from '../english-types';

/** Pattern → its own sentences, each a list of words in order. */
export const ENGLISH_PATTERN_SENTENCES: Readonly<
  Record<EnglishPattern, readonly (readonly string[])[]>
> = {
  'this-is': [
    ['This', 'is', 'a', 'cat'],
    ['This', 'is', 'a', 'dog'],
    ['This', 'is', 'a', 'red', 'ball'],
    ['This', 'is', 'my', 'book'],
    ['This', 'is', 'a', 'big', 'house'],
    ['This', 'is', 'an', 'apple'],
  ],
  'i-like': [
    ['I', 'like', 'cats'],
    ['I', 'like', 'dogs'],
    ['I', 'like', 'birds'],
    ['I', 'like', 'fish'],
    ['I', 'like', 'apples'],
    ['I', 'like', 'red', 'cars'],
  ],
  'i-have': [
    ['I', 'have', 'a', 'cat'],
    ['I', 'have', 'a', 'dog'],
    ['I', 'have', 'a', 'book'],
    ['I', 'have', 'a', 'pen'],
    ['I', 'have', 'a', 'red', 'ball'],
    ['I', 'have', 'two', 'books'],
  ],
  'i-can': [
    ['I', 'can', 'swim'],
    ['I', 'can', 'run'],
    ['I', 'can', 'jump'],
    ['I', 'can', 'sing'],
    ['I', 'can', 'write'],
    ['I', 'can', 'draw'],
  ],
  'i-see': [
    ['I', 'see', 'a', 'cat'],
    ['I', 'see', 'a', 'bird'],
    ['I', 'see', 'the', 'sun'],
    ['I', 'see', 'a', 'star'],
    ['I', 'see', 'a', 'fish'],
    ['I', 'see', 'a', 'big', 'tree'],
  ],
  // Every sentence ends with a bank word (its key word), so the gloss line
  // after the item is never empty — a sentence with no bank word would leave
  // `.english-gloss` hidden and the child with nothing to review.
  // what-is is a question-and-answer pair: the sentence here is the ANSWER
  // ("It is a cat"); the generator pairs it with the displayed question
  // "What is this?" (even sentences) or "What is that?" (odd sentences).
  'what-is': [
    ['It', 'is', 'a', 'cat'],
    ['It', 'is', 'a', 'dog'],
    ['It', 'is', 'a', 'ball'],
    ['It', 'is', 'a', 'bird'],
    ['It', 'is', 'a', 'fish'],
    ['It', 'is', 'an', 'apple'],
  ],
  'my-favourite': [
    ['My', 'favourite', 'colour', 'is', 'red'],
    ['My', 'favourite', 'animal', 'is', 'a', 'cat'],
    ['My', 'favourite', 'food', 'is', 'pizza'],
    ['My', 'favourite', 'toy', 'is', 'a', 'ball'],
    ['My', 'favourite', 'fruit', 'is', 'an', 'apple'],
    ['My', 'favourite', 'drink', 'is', 'milk'],
  ],
};
