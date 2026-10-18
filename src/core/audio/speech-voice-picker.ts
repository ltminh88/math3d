/** The subset of SpeechSynthesisVoice we rely on (keeps the picker testable without a browser). */
export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

export type SpeechLanguage = 'vi' | 'en';

// Android reports "vi_VN"; normalize before comparing.
function normalize(lang: string): string {
  return lang.replace('_', '-').toLowerCase();
}

const PREFERRED: Record<SpeechLanguage, readonly string[]> = {
  vi: ['vi-vn'],
  en: ['en-us', 'en-gb'],
};

/**
 * Best voice for the language: exact region match, then any voice of that language, else null.
 * Never falls back to another language (an English voice reading Vietnamese is worse than silence).
 */
export function pickVoice<V extends VoiceLike>(
  voices: readonly V[],
  language: SpeechLanguage,
): V | null {
  const matching = voices.filter((v) => {
    const lang = normalize(v.lang);
    return lang === language || lang.startsWith(`${language}-`);
  });
  if (matching.length === 0) return null;
  for (const preferred of PREFERRED[language]) {
    const exact = matching.filter((v) => normalize(v.lang) === preferred);
    if (exact.length > 0) return exact.find((v) => v.localService) ?? exact[0] ?? null;
  }
  return matching.find((v) => v.localService) ?? matching[0] ?? null;
}
