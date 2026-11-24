import { defineStrings } from '../i18n/i18n';

/** Service-worker update prompt: vi is the source, written for kids aged 7-9. */
export const sw = defineStrings('swUpdate', {
  vi: {
    message: 'Có bản mới – tải lại?',
    reload: 'Tải lại',
    later: 'Để sau',
  },
  en: {
    message: 'A new version is ready – reload?',
    reload: 'Reload',
    later: 'Later',
  },
});
