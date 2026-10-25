// Tiny namespaced i18n. Each module registers its own strings with defineStrings(ns, {vi, en}),
// so no shared locale file ever becomes a merge hotspot. `vi` is the source of truth; `en` must
// carry exactly the same keys (enforced by the type of defineStrings). The language is the one
// in the app settings store (shared with the legacy translator).
import { appSettings } from '../store/app-settings';
import type { SettingsStore } from '../store/settings-store';
import { applyEnglishTermOverrides } from './english-term-overrides';

export type Language = 'vi' | 'en';
export const LANGUAGES: readonly Language[] = ['vi', 'en'];
export const DEFAULT_LANGUAGE: Language = 'vi';

export type Params = Record<string, string | number>;

export interface StringTable<V extends Record<string, string>> {
  vi: V;
  en: Record<keyof V, string>;
}

/** Minimal shapes so the module is testable without a DOM. */
export interface LangTarget {
  documentElement: { lang: string };
}

const registry = new Map<string, StringTable<Record<string, string>>>();
const listeners = new Set<(lang: Language) => void>();
let current: Language = appSettings.get().lang;

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
  const shown = interpolate(text, params);
  return current === 'en' ? applyEnglishTermOverrides(shown) : shown;
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

/** Applies and persists the language in `settings` (default: the app settings store). */
export function setLanguage(
  lang: Language,
  target?: LangTarget,
  settings: SettingsStore = appSettings,
): void {
  current = lang;
  if (target) target.documentElement.lang = lang;
  settings.update({ lang });
  for (const listener of listeners) listener(lang);
}

export function onLanguageChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies the stored language from `settings` to `target` (no write). */
export function initLanguage(target?: LangTarget, settings: SettingsStore = appSettings): Language {
  current = settings.get().lang;
  if (target) target.documentElement.lang = current;
  return current;
}
