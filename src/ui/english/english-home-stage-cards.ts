// English home stage cards (two-modes Phase 2): one card per CEC stage, from the book's
// stage names and the island's saved stage stars. Pure: status, next stage and stars.
import { ENGLISH_BOOKS } from '../../english/english-books';
import { nextStage, type StageStatus, stageStatus } from '../../levels/shared/level-stages';

export interface EnglishHomeCard {
  readonly stage: number;
  /** Book stage name ('A–D' … 'A–Z'); the home renders it as 'Chữ A–D' / 'Letters A–D'. */
  readonly name: string;
  /** Best stars for the stage, clamped to 0–3. */
  readonly stars: number;
  /** Stars as text ('★★☆'). */
  readonly starsText: string;
  readonly status: StageStatus;
  /** The stage the home highlights (first uncompleted, or the last when all done). */
  readonly next: boolean;
  /** A locked card cannot be tapped. */
  readonly enterable: boolean;
}

const starsText = (stars: number): string => '★'.repeat(stars) + '☆'.repeat(3 - stars);

export function englishHomeCards(stageStars: readonly number[]): EnglishHomeCard[] {
  const book = ENGLISH_BOOKS.cec;
  const progress = { stages: book.stages, stageStars };
  const next = nextStage(progress);
  return book.stageNames.map((name, index) => {
    const stage = index + 1;
    const status = stageStatus(progress, stage);
    const stars = Math.min(3, Math.max(0, stageStars[index] ?? 0));
    return {
      stage,
      name,
      stars,
      starsText: starsText(stars),
      status,
      next: stage === next,
      enterable: status !== 'locked',
    };
  });
}
