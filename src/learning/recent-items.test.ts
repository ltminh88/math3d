import { describe, expect, it } from 'vitest';
import { newFactStat } from './leitner-box';
import { RECENT_ITEMS_KEPT, rememberSeen } from './recent-items';

describe('rememberSeen', () => {
  it('appends newest-last and keeps the other fields', () => {
    const stat = { ...newFactStat(), box: 3, attempts: 2 };
    const next = rememberSeen(rememberSeen(stat, 11), 22);
    expect(next.seen).toEqual([11, 22]);
    expect(next.box).toBe(3);
    expect(next.attempts).toBe(2);
    expect(stat.seen).toBeUndefined();
  });

  it('de-duplicates by moving the fingerprint to the end', () => {
    const stat = rememberSeen(rememberSeen(rememberSeen(newFactStat(), 11), 22), 11);
    expect(stat.seen).toEqual([22, 11]);
  });

  it('caps at RECENT_ITEMS_KEPT, dropping the oldest', () => {
    expect(RECENT_ITEMS_KEPT).toBe(24);
    let stat = newFactStat();
    for (let i = 0; i < 30; i++) stat = rememberSeen(stat, i);
    expect(stat.seen).toHaveLength(24);
    expect(stat.seen).toEqual(Array.from({ length: 24 }, (_, i) => i + 6));
  });
});
