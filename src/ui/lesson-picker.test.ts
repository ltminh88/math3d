// Lesson picker (phase 06): 81 rows in 16 topics, "Học tiếp" points at the first
// unfinished lesson, all 81 lessons playable since phase 21 (B7 reviews), stars
// render from the stats.
// The renderable stub is always true here: the real renderability is covered by the
// e2e spec (dialog renderers); this test pins the picker shape and the star math.
import { describe, expect, it } from 'vitest';
import type { FactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { lessonPickerHtml } from './lesson-picker';

const stat = (box: number, attempts = 1): FactStat => ({
  attempts,
  correct: attempts,
  totalMs: 1000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1000,
  streak: 0,
  fluent: false,
  errs: [],
});

/** One lesson row's HTML (up to its closing tag); the continue button shares the
 * data-lesson value, so the search anchors on the row's class. */
const rowOf = (html: string, n: number): string => {
  const at = html.indexOf(`class="lesson-row" data-lesson="${n}"`);
  if (at === -1) throw new Error(`no row for lesson ${n}`);
  return html.slice(at, html.indexOf('</button>', at));
};

const B1_SKILLS: readonly FactKey[] = [
  'sk:num-read-write-1000',
  'sk:num-place-value-1000',
  'sk:num-neighbors-1000',
  'sk:num-compare-1000',
  'sk:num-order-1000',
  'sk:num-sequence-1000',
];

describe('lessonPickerHtml', () => {
  it('empty stats: continue is B1, 81 rows, 16 topics, topic 1 open at 0/8', () => {
    const html = lessonPickerHtml({}, () => true);
    expect(html).toContain('id="lesson-continue"');
    expect(html).toContain('Học tiếp: Bài 1');
    expect(html).toContain('data-lesson="1"');
    expect((html.match(/<button type="button" class="lesson-row"/g) ?? []).length).toBe(81);
    expect((html.match(/<details class="lesson-topic"/g) ?? []).length).toBe(16);
    expect(html).toContain('data-topic="1" open');
    expect(html).toContain('>0/8<');
    expect(rowOf(html, 1)).toContain('data-stars="0"');
    expect(rowOf(html, 1)).not.toContain('disabled');
  });

  it('all 81 lessons are playable: no row disabled, no "Sắp có" (phase 21)', () => {
    const html = lessonPickerHtml({}, () => true);
    // B7 reviews now (geometry/measurement skills tagged in phase 21); every row
    // is enabled and nothing says "Sắp có" any more.
    expect(rowOf(html, 2)).not.toContain('disabled');
    expect(rowOf(html, 2)).toContain('Cộng, trừ trong phạm vi 1 000');
    expect(rowOf(html, 7)).not.toContain('disabled');
    expect(rowOf(html, 7)).toContain('Ôn tập hình học và đo lường');
    expect(rowOf(html, 7)).not.toContain('Sắp có');
    expect(html).not.toContain('disabled');
    expect(html).not.toContain('Sắp có');
    // B25 (division with remainder) is playable.
    expect(rowOf(html, 25)).not.toContain('disabled');
    expect(rowOf(html, 25)).toContain('Phép chia hết, phép chia có dư');
  });

  it('B1 at box 4: 3 stars, continue moves on to B2 (its arithmetic skills landed in phase 09)', () => {
    const stats: Record<FactKey, FactStat> = {};
    for (const key of B1_SKILLS) stats[key] = stat(4);
    const html = lessonPickerHtml(stats, () => true);
    expect(rowOf(html, 1)).toContain('data-stars="3"');
    expect(html).toContain('Học tiếp: Bài 2');
    expect(html).toContain('>1/8<');
  });
});
