import { defineStrings } from './i18n';

// The game and guide names live only here (plus the static PWA manifest in vite.config.ts).
export const tc = defineStrings('common', {
  vi: {
    appName: 'Hành Trình Đá Số',
    guideName: 'VLM',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Đang tải…',
  },
  en: {
    appName: 'Number Stone Quest',
    guideName: 'VLM',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    loading: 'Loading…',
  },
});
