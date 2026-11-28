import { defineStrings } from '../../i18n/i18n';

/** English home strings (vi source; en with the same keys). */
export const th = defineStrings('englishHome', {
  vi: {
    title: 'Tiếng Anh lớp 1',
    subtitle: 'Chọn một chặng để chơi trên Đảo Tiếng Anh.',
    backToMenu: 'Về menu',
    stage: 'Chặng {n}',
    stageName: 'Chữ {name}',
    cardLabel: '{stageName}, {stars} sao',
    lockedNote: 'Chơi chặng trước để mở chặng này',
    cardsGroup: 'Các chặng trên Đảo Tiếng Anh',
  },
  en: {
    title: 'English Grade 1',
    subtitle: 'Pick a stage to play on English Island.',
    backToMenu: 'Back to menu',
    stage: 'Stage {n}',
    stageName: 'Letters {name}',
    cardLabel: '{stageName}, {stars} stars',
    lockedNote: 'Finish the previous stage to open this one',
    cardsGroup: 'Stages on English Island',
  },
});
