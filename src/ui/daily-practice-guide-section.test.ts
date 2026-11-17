// Daily guide section tests (phase 11): the Milo dialog's entry and the quest card's
// reminder line. Locked → the locked line only; unlocked → the button, plus the streak once
// the child has one; the quest line is silent while locked.
import { describe, expect, it } from 'vitest';
import { dailyGuideSectionHtml, dailyQuestReminderText } from './daily-practice-guide-section';

describe('dailyGuideSectionHtml', () => {
  it('shows the locked line only, before field stage 1', () => {
    const html = dailyGuideSectionHtml({ unlocked: false, streak: 0 });
    expect(html).toContain('Luyện tập hôm nay sẽ mở sau khi con qua Cánh Đồng Phép Tính.');
    expect(html).not.toContain('daily-guide-button');
    // Own class: the dialog's main copy is `.dialog-copy`, and a second match breaks
    // selectors (strict mode) that expect exactly one (PR #6 CI: quest-chain + full-chain).
    expect(html).not.toContain('dialog-copy');
  });

  it('shows the entry button once unlocked, without a streak line at 0', () => {
    const html = dailyGuideSectionHtml({ unlocked: true, streak: 0 });
    expect(html).toContain('id="daily-guide-button"');
    expect(html).toContain('Luyện tập hôm nay');
    expect(html).not.toContain('ngày liên tiếp');
  });

  it('shows the streak once the child has one', () => {
    const html = dailyGuideSectionHtml({ unlocked: true, streak: 3 });
    expect(html).toContain('id="daily-guide-button"');
    expect(html).toContain('Bạn đã luyện 3 ngày liên tiếp!');
  });
});

describe('dailyQuestReminderText', () => {
  it('is silent while locked', () => {
    expect(dailyQuestReminderText({ unlocked: false, countedToday: false })).toBeNull();
  });

  it('says chưa luyện before today’s run and đã luyện after it', () => {
    expect(dailyQuestReminderText({ unlocked: true, countedToday: false })).toBe(
      'Hôm nay: chưa luyện',
    );
    expect(dailyQuestReminderText({ unlocked: true, countedToday: true })).toBe(
      'Hôm nay: đã luyện ✓',
    );
  });
});
