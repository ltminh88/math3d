import { defineStrings } from './i18n';

// The game and guide names live only here (plus the static PWA manifest in vite.config.ts).
export const tc = defineStrings('common', {
  vi: {
    appName: 'Math AI Game 3D - Vương Quốc Cửu Chương',
    guideName: 'Milo',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Đang tải…',
  },
  en: {
    appName: 'Math AI Game 3D - The Multiplication Kingdom',
    guideName: 'Milo',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Loading…',
  },
});
