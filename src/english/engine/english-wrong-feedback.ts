// Gentle Vietnamese feedback for a wrong English answer (Phase 1B, pure).
// One generic sentence per item kind; it never names the answer, the right
// choice, or the right letter. The caller translates the returned key with
// `tei` (english-island namespace) — the key stays stable for later lanes
// that want mistake-specific feedback (e.g. confusable b/d).
import type { EnglishItem } from '../english-types';

export type EnglishWrongFeedbackKey =
  | 'wrongListen'
  | 'wrongLetter'
  | 'wrongFill'
  | 'wrongPairs'
  | 'wrongOrder';

export function englishWrongFeedback(item: EnglishItem): EnglishWrongFeedbackKey {
  switch (item.kind) {
    case 'listen-pick-picture':
      return 'wrongListen';
    case 'letter-pick':
      return 'wrongLetter';
    case 'fill-pattern':
      return 'wrongFill';
    case 'match-pairs':
      return 'wrongPairs';
    case 'order-words':
      return 'wrongOrder';
  }
}
