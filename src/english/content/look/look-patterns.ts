// The 12 Look sentence patterns (two-modes Phase 4, self-written): one bank
// per unit, on the researcher's templates. Every sentence is 3–4 words with
// all-distinct words (so its one correct order is unique) and ends with the
// fill blank; every sentence carries the question prompt the item shows, and
// the question never contains the blank word. American spelling (color).

/** One pattern sentence: the words in order, and its displayed question. */
export interface LookPatternSentence {
  readonly words: readonly string[];
  readonly question: string;
}

/** Unit number (1–12) → its own sentences. */
export const LOOK_PATTERN_SENTENCES: Readonly<Record<number, readonly LookPatternSentence[]>> = {
  // U1: What's this? — It's a ___.
  1: [
    { words: ["It's", 'a', 'pen'], question: "What's this?" },
    { words: ["It's", 'an', 'eraser'], question: "What's this?" },
    { words: ["It's", 'a', 'book'], question: "What's this?" },
    { words: ["It's", 'a', 'bag'], question: "What's this?" },
    { words: ["It's", 'a', 'pencil'], question: "What's this?" },
    { words: ["It's", 'a', 'ruler'], question: "What's this?" },
  ],
  // U2: This is my ___. — Whose toy is this?
  2: [
    { words: ['This', 'is', 'my', 'ball'], question: 'Whose toy is this?' },
    { words: ['This', 'is', 'my', 'doll'], question: 'Whose toy is this?' },
    { words: ['This', 'is', 'my', 'kite'], question: 'Whose toy is this?' },
    { words: ['This', 'is', 'my', 'robot'], question: 'Whose toy is this?' },
    { words: ['This', 'is', 'my', 'car'], question: 'Whose toy is this?' },
    { words: ['This', 'is', 'my', 'train'], question: 'Whose toy is this?' },
  ],
  // U3: He's / She's a ___. — Who is he? / Who is she?
  3: [
    { words: ["He's", 'a', 'teacher'], question: 'Who is he?' },
    { words: ["She's", 'a', 'doctor'], question: 'Who is she?' },
    { words: ["He's", 'a', 'farmer'], question: 'Who is he?' },
    { words: ["She's", 'a', 'cook'], question: 'Who is she?' },
    { words: ["He's", 'a', 'driver'], question: 'Who is he?' },
    { words: ["She's", 'a', 'singer'], question: 'Who is she?' },
  ],
  // U4: I have a ___. — Who is in your family?
  4: [
    { words: ['I', 'have', 'a', 'brother'], question: 'Who is in your family?' },
    { words: ['I', 'have', 'a', 'sister'], question: 'Who is in your family?' },
    { words: ['I', 'have', 'a', 'baby'], question: 'Who is in your family?' },
    { words: ['I', 'have', 'a', 'grandma'], question: 'Who is in your family?' },
    { words: ['I', 'have', 'a', 'grandpa'], question: 'Who is in your family?' },
    { words: ['I', 'have', 'a', 'dad'], question: 'Who is in your family?' },
  ],
  // U5: This is my ___ / These are my ___s. — What body part is this?
  5: [
    { words: ['This', 'is', 'my', 'hand'], question: 'What body part is this?' },
    { words: ['This', 'is', 'my', 'nose'], question: 'What body part is this?' },
    { words: ['This', 'is', 'my', 'mouth'], question: 'What body part is this?' },
    { words: ['These', 'are', 'my', 'hands'], question: 'What body part is this?' },
    { words: ['These', 'are', 'my', 'feet'], question: 'What body part is this?' },
    { words: ['This', 'is', 'my', 'ear'], question: 'What body part is this?' },
  ],
  // U6: It's in / on / under the ___. — Where is it?
  6: [
    { words: ["It's", 'in', 'the', 'kitchen'], question: 'Where is it?' },
    { words: ["It's", 'in', 'the', 'bedroom'], question: 'Where is it?' },
    { words: ["It's", 'in', 'the', 'bathroom'], question: 'Where is it?' },
    { words: ["It's", 'on', 'the', 'chair'], question: 'Where is it?' },
    { words: ["It's", 'on', 'the', 'table'], question: 'Where is it?' },
    { words: ["It's", 'under', 'the', 'chair'], question: 'Where is it?' },
  ],
  // U7: There's a ___ / There are ___s. — What is in the town?
  7: [
    { words: ["There's", 'a', 'school'], question: 'What is in the town?' },
    { words: ["There's", 'a', 'park'], question: 'What is in the town?' },
    { words: ['There', 'are', 'shops'], question: 'What is in the town?' },
    { words: ["There's", 'a', 'hospital'], question: 'What is in the town?' },
    { words: ["There's", 'a', 'bank'], question: 'What is in the town?' },
    { words: ["There's", 'a', 'store'], question: 'What is in the town?' },
  ],
  // U8: A ___ can / can't ___. — What can/can't a ___ do?
  8: [
    { words: ['A', 'duck', 'can', 'swim'], question: 'What can a duck do?' },
    { words: ['A', 'horse', 'can', 'run'], question: 'What can a horse do?' },
    { words: ['A', 'pig', "can't", 'fly'], question: "What can't a pig do?" },
    { words: ['A', 'sheep', 'can', 'jump'], question: 'What can a sheep do?' },
    { words: ['A', 'chicken', "can't", 'swim'], question: "What can't a chicken do?" },
    { words: ['A', 'goat', 'can', 'climb'], question: 'What can a goat do?' },
  ],
  // U9: My ___ is/are ___. — What color is it? / What color are they?
  9: [
    { words: ['My', 'shirt', 'is', 'red'], question: 'What color is it?' },
    { words: ['My', 'dress', 'is', 'blue'], question: 'What color is it?' },
    { words: ['My', 'shoes', 'are', 'pink'], question: 'What color are they?' },
    { words: ['My', 'pants', 'are', 'black'], question: 'What color are they?' },
    { words: ['My', 'hat', 'is', 'yellow'], question: 'What color is it?' },
    { words: ['My', 'coat', 'is', 'green'], question: 'What color is it?' },
  ],
  // U10: I (don't) like ___. — Do you like it?
  10: [
    { words: ['I', 'like', 'apples'], question: 'Do you like it?' },
    { words: ['I', 'like', 'milk'], question: 'Do you like it?' },
    { words: ['I', "don't", 'like', 'fish'], question: 'Do you like it?' },
    { words: ['I', "don't", 'like', 'eggs'], question: 'Do you like it?' },
    { words: ['I', 'like', 'bread'], question: 'Do you like it?' },
    { words: ['I', 'like', 'juice'], question: 'Do you like it?' },
  ],
  // U11: There isn't / aren't ___. — What is at the beach?
  11: [
    { words: ['There', "isn't", 'a', 'shark'], question: 'What is at the beach?' },
    { words: ['There', "aren't", 'any', 'crabs'], question: 'What is at the beach?' },
    { words: ['There', "isn't", 'a', 'boat'], question: 'What is at the beach?' },
    { words: ['There', "aren't", 'any', 'shells'], question: 'What is at the beach?' },
    { words: ['There', "isn't", 'a', 'whale'], question: 'What is at the beach?' },
    { words: ['There', "aren't", 'any', 'fish'], question: 'What is at the beach?' },
  ],
  // U12: Let's ___! / We're at/in the ___. — What are we doing?
  12: [
    { words: ["Let's", 'play', 'soccer'], question: 'What are we doing?' },
    { words: ["Let's", 'ride', 'a', 'bike'], question: 'What are we doing?' },
    { words: ["Let's", 'fly', 'a', 'kite'], question: 'What are we doing?' },
    { words: ["Let's", 'read', 'a', 'book'], question: 'What are we doing?' },
    { words: ["We're", 'at', 'the', 'beach'], question: 'What are we doing?' },
    { words: ["We're", 'in', 'the', 'park'], question: 'What are we doing?' },
  ],
};

/** All Look pattern sentences, flat (for the schema test's spelling sweep). */
export const LOOK_PATTERN_SENTENCE_LIST: readonly LookPatternSentence[] =
  Object.values(LOOK_PATTERN_SENTENCES).flat();

/** The blank word of a Look sentence (its last word). */
export const lookBlankWord = (sentence: LookPatternSentence): string =>
  sentence.words[sentence.words.length - 1] as string;
