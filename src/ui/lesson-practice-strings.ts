import { defineStrings } from '../i18n/i18n';

/** Lesson-mode ("Ôn theo bài") strings: vi is the source, written for kids aged 7-9. */
export const tl = defineStrings('lesson', {
  vi: {
    button: 'Ôn theo bài',
    title: 'Ôn theo bài',
    pickerTitle: 'Chọn bài để luyện',
    continue: 'Học tiếp: Bài {n}',
    allDone: 'Bạn đã luyện xong hết các bài rồi!',
    topic: 'Chủ đề {n}',
    lesson: 'Bài {n}',
    comingSoon: 'Sắp có',
    runTitle: 'Bài {n} · {title} · Câu {i}/{total}',
    finishTitle: 'Xong bài {n}!',
    finishStars: 'Sao của bài này: {before} → {after}',
    finishCoins: 'Bài này bạn được +{coins} xu.',
    backToPicker: 'Về danh sách bài',
    replay: 'Luyện lại bài này',
  },
  en: {
    button: 'Practice by lesson',
    title: 'Practice by lesson',
    pickerTitle: 'Choose a lesson to practice',
    continue: 'Continue: Lesson {n}',
    allDone: 'You have practiced all the lessons!',
    topic: 'Topic {n}',
    lesson: 'Lesson {n}',
    comingSoon: 'Coming soon',
    runTitle: 'Lesson {n} · {title} · Question {i} of {total}',
    finishTitle: 'Lesson {n} done!',
    finishStars: 'Stars for this lesson: {before} → {after}',
    finishCoins: 'You earned +{coins} coins for this lesson.',
    backToPicker: 'Back to the lesson list',
    replay: 'Practice this lesson again',
  },
});
