// VI->EN translator of the recovered UI (original bundle lines 1435-1436, 1624-1673).
// Source text is Vietnamese; in 'en' the UI rewrites strings/DOM after rendering. Behavior is
// frozen for parity (decision 8): language switch writes the key and the caller reloads.
// Original names: Zl=LEGACY_LANGUAGE_KEY, lr=currentLanguage, ig=readStoredLanguage,
// Va=getLegacyLanguage, rg=setLegacyLanguage, Cn=translateText, Ln=translateLongText,
// Wa=translateDomTree, jl=LEGACY_TRANSLATIONS_EN.
import { LEGACY_TRANSLATIONS_EN } from './legacy-translations-en';

export type LegacyLanguage = 'vi' | 'en';

export const LEGACY_LANGUAGE_KEY = 'aigame3d_language';

function readStoredLanguage(): LegacyLanguage {
  try {
    return localStorage.getItem(LEGACY_LANGUAGE_KEY) === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
}

// Read once at module evaluation, like the original top-level `let lr = ig()`.
let currentLanguage: LegacyLanguage = readStoredLanguage();

// Longest key first. Array#sort is stable, so equal lengths keep table order — identical to
// the original, which re-sorted the same entries on every call.
const ENTRIES_LONGEST_FIRST = Object.entries(LEGACY_TRANSLATIONS_EN).sort(
  ([a], [b]) => b.length - a.length,
);

// Hint sentence patterns. Note: they run AFTER the substring pass, which has already turned
// 'viên đá' into 'stones', so the three "viên đá" patterns never match (original quirk, kept).
const SENTENCE_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /Có (\d+) nhóm, mỗi nhóm (\d+) viên đá\. Hãy đếm từng nhóm nhé!/g,
    'There are $1 groups with $2 stones each. Count each group!',
  ],
  [/Cộng các nhóm lại: ([\d +]+) = \?/g, 'Add the groups: $1 = ?'],
  [
    /(\d+) nhóm, mỗi nhóm (\d+) viên đá: (\d+) × (\d+) = (\d+)\. Mình cùng thử lại nhé!/g,
    "$1 groups with $2 stones each: $3 × $4 = $5. Let's try again!",
  ],
  [/(\d+) nhóm, mỗi nhóm có (\d+) viên đá/g, '$1 groups with $2 stones each'],
];

export function getLegacyLanguage(): LegacyLanguage {
  return currentLanguage;
}

/** Sets the language and persists it; the caller reloads the page to re-render. */
export function setLegacyLanguage(language: LegacyLanguage): void {
  currentLanguage = language;
  try {
    localStorage.setItem(LEGACY_LANGUAGE_KEY, language);
  } catch {}
}

/** Whole-string lookup; unknown text is returned unchanged. */
export function translateText(text: string): string {
  if (currentLanguage === 'vi') return text;
  return LEGACY_TRANSLATIONS_EN[text] ?? text;
}

/** Substring replacement (longest key first) plus hint-sentence patterns, for HTML/long text. */
export function translateLongText(text: string): string {
  if (currentLanguage === 'vi') return text;
  let out = ENTRIES_LONGEST_FIRST.reduce((acc, [vi, en]) => acc.split(vi).join(en), text);
  for (const [pattern, replacement] of SENTENCE_RULES) out = out.replace(pattern, replacement);
  return out;
}

/** Translates text nodes (exact match) and aria-label/title attributes. Never sets innerHTML. */
export function translateDomTree(root: ParentNode & Node = document): void {
  if (currentLanguage === 'vi') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    node.nodeValue = translateText(node.nodeValue ?? '');
  }
  for (const element of root.querySelectorAll('[aria-label], [title]')) {
    for (const name of ['aria-label', 'title']) {
      const value = element.getAttribute(name);
      if (value) element.setAttribute(name, translateText(value));
    }
  }
}
