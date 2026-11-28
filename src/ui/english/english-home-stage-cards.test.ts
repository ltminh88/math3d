// English home stage cards (two-modes Phase 2): one card per CEC stage, from the book's
// stage names and the island's saved stage stars. Pure: status/next/stars, no DOM.
import { describe, expect, it } from 'vitest';
import { englishHomeCards } from './english-home-stage-cards';

describe('english home stage cards', () => {
  it('lists all 8 CEC stages with stage 1 open and the rest locked', () => {
    const cards = englishHomeCards([]);
    expect(cards).toHaveLength(8);
    expect(cards.map((c) => c.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(cards.map((c) => c.name)).toEqual([
      'A–D',
      'E–H',
      'I–L',
      'M–P',
      'Q–T',
      'U–X',
      'Y–Z',
      'A–Z',
    ]);
    expect(cards[0]).toMatchObject({ name: 'A–D', status: 'open', next: true, enterable: true });
    for (const card of cards.slice(1)) {
      expect(card).toMatchObject({ status: 'locked', next: false, enterable: false });
    }
    expect(cards.map((c) => c.stars)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('marks completed stages and opens the next one', () => {
    const cards = englishHomeCards([3, 1]);
    expect(cards[0]).toMatchObject({
      status: 'completed',
      stars: 3,
      starsText: '★★★',
      next: false,
    });
    expect(cards[1]).toMatchObject({
      status: 'completed',
      stars: 1,
      starsText: '★☆☆',
      next: false,
    });
    expect(cards[2]).toMatchObject({
      status: 'open',
      stars: 0,
      starsText: '☆☆☆',
      next: true,
      enterable: true,
    });
    expect(cards[3]).toMatchObject({ status: 'locked', next: false });
  });

  it('all done replays the last stage', () => {
    const cards = englishHomeCards([2, 2, 2, 2, 2, 2, 2, 2]);
    expect(cards.every((c) => c.status === 'completed')).toBe(true);
    expect(cards.map((c) => c.next)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(cards.map((c) => c.enterable)).toEqual([true, true, true, true, true, true, true, true]);
    expect(cards.map((c) => c.starsText)).toEqual([
      '★★☆',
      '★★☆',
      '★★☆',
      '★★☆',
      '★★☆',
      '★★☆',
      '★★☆',
      '★★☆',
    ]);
  });

  it('clamps out-of-range star counts', () => {
    const cards = englishHomeCards([9, -1]);
    expect(cards.map((c) => c.stars).slice(0, 2)).toEqual([3, 0]);
  });
});
