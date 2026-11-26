// Book-pack contract (Phase 0): the `POST /api/english-pack` shape and the pure
// `isEnglishPack()` validator. The function itself lands in Phase 4 (reviewer);
// this file only pins the shapes both sides agree on, so 1B/2A/3B can build
// against them now. No passphrase or secret lives here — only the env var name.
import { ENGLISH_SKILL_IDS } from './english-skill-entries';
import type { EnglishItem, EnglishPack } from './english-types';

/** The pack endpoint (Vercel function, Phase 4). */
export const ENGLISH_PACK_ENDPOINT = '/api/english-pack';
/** Env var holding the family passphrase (the author sets it; never in the repo). */
export const ENGLISH_PACK_PASSPHRASE_ENV = 'ENGLISH_PACK_PASSPHRASE';
/** Every pack response is `Cache-Control: no-store` (a pack must never be cached). */
export const ENGLISH_PACK_CACHE_CONTROL = 'no-store';
/** Stages the pack can be asked for (1–8; omitted = the whole pack). */
export const ENGLISH_PACK_STAGES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type EnglishPackPart = 'items' | 'images';

export interface EnglishPackRequest {
  readonly passphrase: string;
  readonly part: EnglishPackPart;
  readonly stage?: number;
}

export type EnglishPackErrorCode = 'bad-passphrase' | 'pack-unavailable';

export type EnglishPackResponse =
  | { readonly ok: true; readonly pack: EnglishPack }
  | { readonly ok: false; readonly error: EnglishPackErrorCode };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isStringArray = (v: unknown): v is readonly string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function isPictureChoice(v: unknown): boolean {
  return isRecord(v) && isNonEmptyString(v.word) && isNonEmptyString(v.picture);
}

function isEnglishItem(v: unknown): v is EnglishItem {
  if (!isRecord(v)) return false;
  if (
    typeof v.skillId !== 'string' ||
    !(ENGLISH_SKILL_IDS as readonly string[]).includes(v.skillId)
  )
    return false;
  if (v.source !== 'own' && v.source !== 'pack') return false;
  switch (v.kind) {
    case 'listen-pick-picture': {
      if (!isNonEmptyString(v.word) || !Array.isArray(v.choices) || v.choices.length < 2)
        return false;
      if (!v.choices.every(isPictureChoice)) return false;
      if (v.listenOnly !== undefined && typeof v.listenOnly !== 'boolean') return false;
      return v.choices.some((c) => isRecord(c) && c.word === v.word);
    }
    case 'match-pairs': {
      if (!Array.isArray(v.pairs) || v.pairs.length < 2) return false;
      if (!v.pairs.every(isPictureChoice)) return false;
      const words = v.pairs.map((p) => (isRecord(p) ? p.word : undefined));
      return new Set(words).size === words.length;
    }
    case 'order-words': {
      if (!isStringArray(v.words) || v.words.length < 2) return false;
      if (!v.words.every(isNonEmptyString)) return false;
      if (v.question !== undefined && typeof v.question !== 'string') return false;
      return true;
    }
    case 'fill-pattern': {
      if (!isStringArray(v.sentence) || v.sentence.length < 2) return false;
      if (!v.sentence.every(isNonEmptyString)) return false;
      if (typeof v.blankIndex !== 'number' || !Number.isInteger(v.blankIndex)) return false;
      if (v.blankIndex < 0 || v.blankIndex >= v.sentence.length) return false;
      if (!isStringArray(v.options) || v.options.length < 2 || v.options.length > 4) return false;
      if (!v.options.every(isNonEmptyString)) return false;
      if (v.question !== undefined && typeof v.question !== 'string') return false;
      return v.options.includes(v.sentence[v.blankIndex] as string);
    }
    case 'letter-pick':
      return (
        isNonEmptyString(v.prompt) &&
        isStringArray(v.choices) &&
        v.choices.length >= 2 &&
        v.choices.every(isNonEmptyString) &&
        typeof v.answer === 'string' &&
        v.choices.includes(v.answer)
      );
    default:
      return false;
  }
}

/**
 * Pure pack validator: version 1, an items array of well-formed items whose
 * skill ids exist, an optional stage 1–8, and optional image data (string map).
 * It checks shape only — never the passphrase, never the content's origin.
 */
export function isEnglishPack(value: unknown): value is EnglishPack {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (!Array.isArray(value.items) || !value.items.every(isEnglishItem)) return false;
  if (value.stage !== undefined) {
    if (typeof value.stage !== 'number' || !Number.isInteger(value.stage)) return false;
    if (value.stage < 1 || value.stage > 8) return false;
  }
  if (value.images !== undefined) {
    if (!isRecord(value.images)) return false;
    if (!Object.values(value.images).every((v) => typeof v === 'string')) return false;
  }
  return true;
}
