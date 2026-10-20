import type { FactKey } from '../learning/fact-key';
import type { FactLocalState, SessionDelta } from '../learning/learning-types';
import type { PurchaseResult } from './cosmetic-purchase-transaction';
import type { OpenDbOrMemoryOptions } from './open-game-db-with-memory-fallback';
import type { ProgressRecords, ReplaceOptions } from './profile-replacement';
import type { GameSnapshot } from './progress-repository';
import type { GameMeta } from './save-schema';

/** Fired after the outbox gained an item (session finished or cosmetic bought). Phase 09 flushes on it. */
export interface SessionCommittedEvent {
  delta: SessionDelta;
}

export interface GameStore {
  /** false: IndexedDB was unavailable, progress lives in memory only (phase 04 shows a toast). */
  readonly persistent: boolean;
  getSnapshot(): GameSnapshot;
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void;
  on(event: 'session-committed', listener: (e: SessionCommittedEvent) => void): () => void;
  /**
   * Number to stamp on the next session (for the planner and recorder). A hint from the snapshot:
   * the committed counter is re-derived inside the commit transaction, so tabs never collide.
   */
  nextSessionNo(): number;
  /**
   * Atomic: facts + levels + wallet + session counter + one outbox record, or nothing.
   * Idempotent per batchId: a retry of an already committed delta is a no-op success.
   */
  commitSession(delta: SessionDelta, local?: Record<FactKey, FactLocalState>): Promise<void>;
  /** Atomic debit + ownership + outbox record. Price semantics live in src/shop. */
  purchaseCosmetic(cosmeticId: string, price: number): Promise<PurchaseResult>;
  /** Stored in profile settings; ownership is the shop's concern (default items are never "purchased"). */
  equipCosmetic(slot: string, cosmeticId: string): Promise<void>;
  setAvatar(avatarId: string): Promise<void>;
  updateGameMeta(patch: Partial<GameMeta>): Promise<void>;
  /** Marks a level's quest as accepted (first call wins). */
  acceptLevel(levelId: string): Promise<void>;
  /**
   * Atomically replaces all progress with `records` under a new active guest profile (import,
   * reset). With `legacyImport` it is a no-op once a legacy import marker exists.
   */
  replaceProgress(
    records: ProgressRecords,
    options?: ReplaceOptions,
  ): Promise<'replaced' | 'already-imported'>;
  close(): void;
}

export interface OpenStoreOptions extends OpenDbOrMemoryOptions {
  now?: () => number;
  newId?: () => string;
}
