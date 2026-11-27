// English books (two-modes Phase 1): one descriptor per book, so the engine
// reads its stages, rounds, skills, units and pack key from the book instead
// of CEC literals. CEC becomes book `cec`, no behaviour change — the
// descriptor mirrors today's constants (see the test). Look 1 (Phase 4) reads
// its real units from `content/look/look-units.ts`.
import { lookUnitForStage } from './content/look/look-units';
import { unitForStage } from './content/units';
import { ENGLISH_SKILL_IDS } from './english-skill-entries';
import type { EnglishBookId, EnglishSkillId, EnglishUnit } from './english-types';
import { ENGLISH_LETTER_BLOCKS } from './english-types';
import { LOOK_SKILL_IDS } from './look-skill-ids';

/**
 * One English book: the id the pack contract and storage use, the level that
 * hosts it, how many stages/rounds a run has, the stage names the level
 * shows, the skills the run may drill, how a stage finds its unit, the
 * IndexedDB key the pack lives under, and the spelling the speaker uses.
 */
export interface EnglishBook {
  readonly id: EnglishBookId;
  readonly levelId: 'island' | 'look';
  readonly stages: number;
  readonly rounds: number;
  readonly stageNames: readonly string[];
  readonly skillIds: readonly EnglishSkillId[];
  readonly unitForStage: (stage: number) => EnglishUnit;
  readonly packKey: string;
  readonly spelling: 'en-GB' | 'en-US';
}

/** CEC stage names, derived from the letter blocks ('a-d' → 'A–D', …, 'A–Z' review). */
const CEC_STAGE_NAMES: readonly string[] = Object.freeze([
  ...ENGLISH_LETTER_BLOCKS.map((b) => b.toUpperCase().replace('-', '–')),
  'A–Z',
]);

/** Look 1 stage names (Phase 4 stage plan: Starter, U1–2 … U11–12, review). */
const LOOK_STAGE_NAMES: readonly string[] = Object.freeze([
  'Starter',
  'U1–2',
  'U3–4',
  'U5–6',
  'U7–8',
  'U9–10',
  'U11–12',
  'Review',
]);

/** The books, by id. CEC keeps the `'current'` pack key (back-compat with already-unlocked devices). */
export const ENGLISH_BOOKS: Readonly<Record<EnglishBookId, EnglishBook>> = Object.freeze({
  cec: Object.freeze({
    id: 'cec',
    levelId: 'island',
    stages: 8,
    rounds: 8,
    stageNames: CEC_STAGE_NAMES,
    skillIds: ENGLISH_SKILL_IDS,
    unitForStage,
    packKey: 'current',
    // The speaker reads with an en-US voice (english-speaker.ts).
    spelling: 'en-US',
  }),
  look: Object.freeze({
    id: 'look',
    levelId: 'look',
    stages: 8,
    rounds: 8,
    stageNames: LOOK_STAGE_NAMES,
    skillIds: LOOK_SKILL_IDS,
    unitForStage: lookUnitForStage,
    packKey: 'look',
    // Look 1 uses American spelling (Phase 4, Q2: color, favorite, mom …).
    spelling: 'en-US',
  }),
});
