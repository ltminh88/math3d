// Finished sessions (quiz answer batches, level runs) waiting for their commit to the game store.
// A transient failure keeps a session for the next flush, retried with the same batchId; one the
// store refuses for good is dropped so it cannot block every later session.
import type { SessionDelta } from '../learning/learning-types';
import type { SessionResult } from '../learning/session-recorder';
import { InvalidDeltaError } from '../store/delta-validation';
import type { GameStore } from '../store/game-store-api';

/** XP/coins added from the store's state right before a commit (a level's first-completion bonus). */
export type CommitBonus = (s: GameStore) => { xp: number; coins: number };

export interface PendingCommit {
  readonly session: SessionResult;
  readonly bonus?: CommitBonus;
  /** The commit landed with `delta` (bonus included). */
  readonly onCommitted?: (delta: SessionDelta) => void;
}

export class PendingSessionCommits {
  private readonly items: PendingCommit[] = [];

  push(item: PendingCommit): void {
    this.items.push(item);
  }

  clear(): void {
    this.items.length = 0;
  }

  /** Deltas not committed yet, oldest first (book/settings counts include them). */
  deltas(): SessionDelta[] {
    return this.items.map((item) => item.session.delta);
  }

  /**
   * Commits every pending session in order. Throws on a transient failure (that session and the
   * ones after it stay); returns the store's refusal of a dropped session, if any.
   */
  async commitAll(s: GameStore): Promise<unknown> {
    let refused: unknown;
    while (this.items.length > 0) {
      const next = this.items[0] as PendingCommit;
      const { delta: base, local } = next.session;
      const bonus = next.bonus?.(s);
      const delta = bonus
        ? { ...base, xp: base.xp + bonus.xp, coins: base.coins + bonus.coins }
        : base;
      let landed = true;
      try {
        await s.commitSession(delta, local);
      } catch (err) {
        if (!(err instanceof InvalidDeltaError)) throw err;
        refused = err;
        landed = false;
      }
      this.items.shift();
      if (landed) next.onCommitted?.(delta);
    }
    return refused;
  }
}
