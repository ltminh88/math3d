import type { defineStrings } from '../../i18n/i18n';

/**
 * Island strings (vi source, en mirror) for 7-9 year olds: short sentences, VLM named
 * through `tc('guideName')`. The run's own strings live in Phase 1B's `english-strings`.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('island', {
    vi: {
      title: 'Đảo Tiếng Anh',
      intro:
        'Đảo mở rồi! Mỗi câu đúng là một bước chân trên đảo. Đủ tám câu thì bạn đi hết một vòng đảo.',
      stageName: 'Chặng {n}/8 · Chữ {block}',
      doneTitle: 'Bạn đã đi hết một vòng đảo!',
      doneLine: 'Bạn đã nghe, nhìn và chọn đúng các từ tiếng Anh. Giỏi quá!',
      doneScore: 'Đúng {correct}/{total} câu',
      emptyLine: 'Bài tập tiếng Anh đang được chuẩn bị, bạn quay lại sau nhé!',
      bonusLine: 'Thưởng lần đầu hoàn thành: +{xp} XP · +{coins} xu',
      stars: '{n}/3 sao',
      stageLine: 'Chặng {n}/{m} · {stars} sao',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      backToGate: 'Về cổng',
    },
    en: {
      title: 'English Island',
      intro:
        'The island is open! Every right answer is a step on the island. Eight answers and you walk all the way around.',
      stageName: 'Stage {n}/8 · Letters {block}',
      doneTitle: 'You walked all the way around the island!',
      doneLine: 'You listened, looked and picked the right English words. Well done!',
      doneScore: '{correct} of {total} right',
      emptyLine: 'The English exercises are being prepared — come back soon!',
      bonusLine: 'First clear bonus: +{xp} XP · +{coins} coins',
      stars: '{n}/3 stars',
      stageLine: 'Stage {n}/{m} · {stars} stars',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      backToGate: 'Back to the gate',
    },
  });

export type IslandStrings = ReturnType<typeof define>;
let cached: IslandStrings | undefined;

export function islandStrings(defineFn: typeof defineStrings): IslandStrings {
  cached ??= define(defineFn);
  return cached;
}
