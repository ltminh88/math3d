// Tiny namespaced i18n. Each module registers its own strings with defineStrings(ns, {vi, en}),
// so no shared locale file ever becomes a merge hotspot. `vi` is the source of truth; `en` must
// carry exactly the same keys (enforced by the type of defineStrings).

export type Language = 'vi' | 'en';
export const LANGUAGES: readonly Language[] = ['vi', 'en'];
export const DEFAULT_LANGUAGE: Language = 'vi';
const STORAGE_KEY = 'nsq.language';

export type Params = Record<string, string | number>;

export interface StringTable<V extends Record<string, string>> {
  vi: V;
  en: Record<keyof V, string>;
}

/** Minimal shapes so the module is testable without a DOM. */
export interface LangTarget {
  documentElement: { lang: string };
}
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const registry = new Map<string, StringTable<Record<string, string>>>();
const listeners = new Set<(lang: Language) => void>();
let current: Language = DEFAULT_LANGUAGE;

function isLanguage(value: unknown): value is Language {
  return value === 'vi' || value === 'en';
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

function warnMissing(key: string): void {
  if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
}

/** Register a namespace; returns a translator bound to it with typed keys. */
export function defineStrings<const V extends Record<string, string>>(
  ns: string,
  table: StringTable<V>,
): (key: keyof V & string, params?: Params) => string {
  if (registry.has(ns) && import.meta.env?.DEV) console.warn(`[i18n] namespace redefined: ${ns}`);
  registry.set(ns, table as StringTable<Record<string, string>>);
  return (key, params) => t(`${ns}.${key}`, params);
}

/** Look up "ns.key" in the current language, falling back to vi, then to the key itself. */
export function t(fullKey: string, params?: Params): string {
  const dot = fullKey.indexOf('.');
  const table = dot > 0 ? registry.get(fullKey.slice(0, dot)) : undefined;
  const key = fullKey.slice(dot + 1);
  const text = table?.[current][key] ?? table?.vi[key];
  if (text === undefined) {
    warnMissing(fullKey);
    return fullKey;
  }
  return interpolate(text, params);
}

/** Stored setting > navigator language starting with "vi" > en for other known langs > vi. */
export function detectLanguage(
  stored: string | null | undefined,
  navigatorLanguage?: string,
): Language {
  if (isLanguage(stored)) return stored;
  const nav = navigatorLanguage?.toLowerCase();
  if (!nav || nav.startsWith('vi')) return DEFAULT_LANGUAGE;
  return nav.startsWith('en') ? 'en' : DEFAULT_LANGUAGE;
}

export function getLanguage(): Language {
  return current;
}

export function setLanguage(lang: Language, target?: LangTarget, storage?: KeyValueStorage): void {
  current = lang;
  if (target) target.documentElement.lang = lang;
  try {
    storage?.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be blocked (private mode); the language still applies for this session.
  }
  for (const listener of listeners) listener(lang);
}

export function onLanguageChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Resolve and apply the starting language from storage + navigator. */
export function initLanguage(
  target?: LangTarget,
  storage?: KeyValueStorage,
  navigatorLanguage?: string,
): Language {
  let stored: string | null = null;
  try {
    stored = storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    stored = null;
  }
  const lang = detectLanguage(stored, navigatorLanguage);
  setLanguage(lang, target);
  return lang;
}
