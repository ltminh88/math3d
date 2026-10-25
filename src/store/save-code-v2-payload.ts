// M3D2 save-code payload: the whole store snapshot a child's progress consists of, as compact
// JSON with short keys and defaults omitted:
//   x xp · c coins · a avatar id · g [table, combo, started] · s [sound, music]
//   n committed sessions · l {levelId: [stars, bestScore, completedSec, progress, acceptedSec]}
//   o owned cosmetic ids · e {slot: equipped id} · f fact tuples (save-code-v2-facts.ts)
// Decoding is strict (unknown key, wrong type or out-of-range value -> null): a code is pasted
// text, so nothing in it reaches the store unchecked.
import { LEVEL_GATES } from '../config/level-gate-config';
import { BRIDGE_LEVEL_ID } from './legacy-save-import';
import type { ProgressRecords } from './profile-replacement';
import type { GameSnapshot } from './progress-repository';
import {
  factToTuple,
  isIntIn,
  MAX_EPOCH_SEC,
  toEpochSec,
  tuplesToFacts,
} from './save-code-v2-facts';
import { DEFAULT_GAME_META } from './save-schema';

export interface SaveCodeAudio {
  sound: boolean;
  music: boolean;
}

/** What a decoded code imports: store records plus the audio settings it carried. */
export interface SaveCodeImport {
  records: ProgressRecords;
  audio: SaveCodeAudio;
}

type Compact = Record<string, unknown>;

/** Same rule as the shop catalog and the server's owned_cosmetics check. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;
const KNOWN_LEVELS = new Set<string>([BRIDGE_LEVEL_ID, ...LEVEL_GATES.map((g) => g.levelId)]);
const MAX_WALLET = 10_000_000;
const MAX_COMBO = 1_000_000;
const MAX_TABLE = 10;
const MAX_SCORE = 1_000_000;
const MAX_LEVEL_PROGRESS = 1000;
const MAX_SESSIONS = 10_000_000;
const MAX_COSMETICS = 64;
const MAX_SLOTS = 8;
const ALLOWED = new Set(['x', 'c', 'a', 'g', 's', 'n', 'l', 'o', 'e', 'f']);

const bit = (b: boolean): number => (b ? 1 : 0);

export function snapshotToCompactV2(snapshot: GameSnapshot, audio: SaveCodeAudio): Compact {
  const out: Compact = {};
  const { wallet, gameMeta: m, profile } = snapshot;
  if (wallet.xp) out.x = wallet.xp;
  if (wallet.coins) out.c = wallet.coins;
  if (profile.avatarId !== 'default') out.a = profile.avatarId;
  if (m.table || m.combo || m.started) out.g = [m.table, m.combo, bit(m.started)];
  out.s = [bit(audio.sound), bit(audio.music)];
  if (snapshot.sessionCount) out.n = snapshot.sessionCount;
  const levels = Object.values(snapshot.levelProgress).filter((l) => KNOWN_LEVELS.has(l.levelId));
  if (levels.length)
    out.l = Object.fromEntries(
      levels.map((l) => [
        l.levelId,
        [l.stars, l.bestScore, toEpochSec(l.completedAt), l.progress, toEpochSec(l.acceptedAt)],
      ]),
    );
  if (snapshot.ownedCosmetics.length) out.o = [...snapshot.ownedCosmetics];
  const equipped = profile.settings.equipped;
  if (Object.keys(equipped).length) out.e = { ...equipped };
  const facts = Object.entries(snapshot.factStats).filter(([, s]) => s.attempts > 0);
  if (facts.length) out.f = facts.map(([key, stat]) => factToTuple(key, stat));
  return out;
}

const isFlag = (v: unknown): v is 0 | 1 => v === 0 || v === 1;
const isPlainObject = (v: unknown): v is Compact =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function decodeLevels(raw: unknown): ProgressRecords['levels'] | null {
  if (!isPlainObject(raw)) return null;
  const levels: ProgressRecords['levels'] = {};
  for (const [id, t] of Object.entries(raw)) {
    if (!KNOWN_LEVELS.has(id) || !Array.isArray(t) || t.length !== 5) return null;
    const [stars, bestScore, doneSec, progress, acceptedSec] = t as unknown[];
    if (
      !isIntIn(stars, 0, 3) ||
      !isIntIn(bestScore, 0, MAX_SCORE) ||
      !isIntIn(doneSec, 0, MAX_EPOCH_SEC) ||
      !isIntIn(progress, 0, MAX_LEVEL_PROGRESS) ||
      !isIntIn(acceptedSec, 0, MAX_EPOCH_SEC)
    )
      return null;
    const completedAt = doneSec * 1000;
    levels[id] = { stars, bestScore, completedAt, progress, acceptedAt: acceptedSec * 1000 };
  }
  return levels;
}

function decodeCosmetics(owned: unknown, equipped: unknown): ProgressRecords['cosmetics'] | null {
  const o = owned ?? [];
  const e = equipped ?? {};
  if (!Array.isArray(o) || o.length > MAX_COSMETICS) return null;
  if (!o.every((id) => typeof id === 'string' && ID_PATTERN.test(id))) return null;
  if (new Set(o).size !== o.length || !isPlainObject(e)) return null;
  const slots = Object.entries(e);
  if (slots.length > MAX_SLOTS) return null;
  if (!slots.every(([k, v]) => ID_PATTERN.test(k) && typeof v === 'string' && ID_PATTERN.test(v)))
    return null;
  return { owned: [...(o as string[])], equipped: { ...(e as Record<string, string>) } };
}

/** Compact payload -> import, or null for anything malformed. */
export function compactV2ToImport(raw: unknown): SaveCodeImport | null {
  if (!isPlainObject(raw) || !Object.keys(raw).every((k) => ALLOWED.has(k))) return null;
  const { x = 0, c = 0, a = 'default', g, s = [1, 0], n = 0 } = raw;
  if (!isIntIn(x, 0, MAX_WALLET) || !isIntIn(c, 0, MAX_WALLET) || !isIntIn(n, 0, MAX_SESSIONS))
    return null;
  if (typeof a !== 'string' || !ID_PATTERN.test(a)) return null;
  const meta = g ?? [DEFAULT_GAME_META.table, DEFAULT_GAME_META.combo, 0];
  if (!Array.isArray(meta) || meta.length !== 3) return null;
  const [table, combo, started] = meta as unknown[];
  if (!isIntIn(table, 0, MAX_TABLE) || !isIntIn(combo, 0, MAX_COMBO) || !isFlag(started))
    return null;
  if (!Array.isArray(s) || s.length !== 2 || !s.every(isFlag)) return null;
  const levels = decodeLevels(raw.l ?? {});
  const cosmetics = decodeCosmetics(raw.o, raw.e);
  const facts = tuplesToFacts(raw.f ?? []);
  if (!levels || !cosmetics || !facts) return null;
  return {
    records: {
      avatarId: a,
      wallet: { xp: x, coins: c },
      levels,
      facts,
      gameMeta: { table, combo, started: started === 1 },
      cosmetics,
      sessionCount: n,
    },
    audio: { sound: s[0] === 1, music: s[1] === 1 },
  };
}
