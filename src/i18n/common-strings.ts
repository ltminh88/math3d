import { defineStrings } from './i18n';

// The game and guide names live only here (plus the static PWA manifest in vite.config.ts).
export const tc = defineStrings('common', {
  vi: {
    appName: 'math3d - Vương Quốc Cửu Chương',
    guideName: 'VLM',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Đang tải…',
  },
  en: {
    appName: 'math3d - The Multiplication Kingdom',
    guideName: 'VLM',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Loading…',
  },
});
