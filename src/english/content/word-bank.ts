// Whole word bank (Phase 2A): the seven letter-block files joined, plus a
// by-name lookup for topics and units. Words are unique by name.
import type { EnglishWord } from '../english-types';
import { WORD_BANK_A_D } from './word-bank-a-d';
import { WORD_BANK_E_H } from './word-bank-e-h';
import { WORD_BANK_I_L } from './word-bank-i-l';
import { WORD_BANK_M_P } from './word-bank-m-p';
import { WORD_BANK_Q_T } from './word-bank-q-t';
import { WORD_BANK_U_X } from './word-bank-u-x';
import { WORD_BANK_Y_Z } from './word-bank-y-z';

/** All bank words, in letter-block order (A–D … Y–Z). */
export const ENGLISH_WORD_BANK: readonly EnglishWord[] = [
  ...WORD_BANK_A_D,
  ...WORD_BANK_E_H,
  ...WORD_BANK_I_L,
  ...WORD_BANK_M_P,
  ...WORD_BANK_Q_T,
  ...WORD_BANK_U_X,
  ...WORD_BANK_Y_Z,
];

/** Bank word by name (`undefined` when the name is not in the bank). */
export const wordByName = (name: string): EnglishWord | undefined =>
  ENGLISH_WORD_BANK.find((w) => w.word === name);
