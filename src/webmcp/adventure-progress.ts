// Read-only progress summary exposed to WebMCP: store field names, counters only (no PII).
import { levelForXp } from '../game/xp-levels';
import { BRIDGE_LEVEL_ID } from '../store/legacy-save-import';
import type { GameSnapshot } from '../store/progress-repository';

export interface AdventureProgress {
  app: 'math3d';
  xp: number;
  coins: number;
  level: number;
  bridgeProgress: number;
  avatarId: string;
}

export function adventureProgressFromSnapshot(snapshot: GameSnapshot): AdventureProgress {
  return {
    app: 'math3d',
    xp: snapshot.wallet.xp,
    coins: snapshot.wallet.coins,
    level: levelForXp(snapshot.wallet.xp),
    bridgeProgress: snapshot.levelProgress[BRIDGE_LEVEL_ID]?.progress ?? 0,
    avatarId: snapshot.profile.avatarId,
  };
}
