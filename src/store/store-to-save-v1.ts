// Store snapshot -> legacy v1 save shape: the UI's progress view, and the input of save-code
// export (one codec serves both directions, so an exported code imports through the same path).
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { type FactKey, parseFactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { defaultSave } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import { STAT_KEY_PATTERN } from '../save/save-types';
import { BRIDGE_LEVEL_ID } from './legacy-save-import';
import type { GameSnapshot } from './progress-repository';
import type { Settings } from './settings-store';

/** What the recovered UI renders from progress (the v1 save fields minus stats and audio). */
export type ProgressView = Pick<
  SaveV1,
  | 'xp'
  | 'coins'
  | 'bridge'
  | 'questAccepted'
  | 'questComplete'
  | 'avatar'
  | 'table'
  | 'combo'
  | 'started'
>;

export function progressViewFromSnapshot(snapshot: GameSnapshot): ProgressView {
  const bridgeLevel = snapshot.levelProgress[BRIDGE_LEVEL_ID];
  const bridge = Math.min(BRIDGE_SEGMENTS, bridgeLevel?.progress ?? 0);
  return {
    xp: snapshot.wallet.xp,
    coins: snapshot.wallet.coins,
    bridge,
    questAccepted: (bridgeLevel?.acceptedAt ?? 0) > 0 || bridge > 0,
    questComplete: (bridgeLevel?.completedAt ?? 0) > 0 && bridge === BRIDGE_SEGMENTS,
    avatar: snapshot.profile.avatarId === 'girl' ? 'girl' : 'boy',
    table: snapshot.gameMeta.table,
    combo: snapshot.gameMeta.combo,
    started: snapshot.gameMeta.started,
  };
}

/** `mul:3x7` -> `m3_7`, `mul:1x6` -> `m6_1`; null for facts the v1 format cannot express. */
function statIdOf(key: FactKey): string | null {
  const parsed = parseFactKey(key);
  if (parsed?.op !== 'mul') return null;
  const id = parsed.min === 1 ? `m${parsed.max}_1` : `m${parsed.min}_${parsed.max}`;
  return STAT_KEY_PATTERN.test(id) ? id : null;
}

/** Most practised facts first (a v1 save holds at most one entry per stat id anyway). */
const byAttempts = ([, a]: [FactKey, FactStat], [, b]: [FactKey, FactStat]) =>
  b.attempts - a.attempts;

export function snapshotToSaveV1(
  snapshot: GameSnapshot,
  settings: Pick<Settings, 'sound' | 'music'>,
): { save: SaveV1; boxes: Record<FactKey, number> } {
  const save: SaveV1 = {
    ...defaultSave(),
    ...progressViewFromSnapshot(snapshot),
    sound: settings.sound,
    music: settings.music,
  };
  const boxes: Record<FactKey, number> = {};
  for (const [key, stat] of Object.entries(snapshot.factStats).sort(byAttempts)) {
    const id = statIdOf(key);
    if (!id || stat.attempts === 0) continue;
    save.questionStats[id] = {
      attempts: stat.attempts,
      correct: stat.correct,
      wrong: stat.attempts - stat.correct,
      responseTime: Math.round(stat.totalMs / stat.attempts),
      lastAnsweredAt: stat.lastSeenAt > 0 ? new Date(stat.lastSeenAt).toISOString() : '',
    };
    boxes[key] = stat.box;
    if (stat.box === 1 && stat.correct < stat.attempts) save.review.push(id);
  }
  return { save, boxes };
}
