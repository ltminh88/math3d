import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { ReasoningItem } from '../reasoning/reasoning-types';
import { itemFingerprint, itemSignature } from './item-fingerprint';
import { itemForSkill } from './item-for-skill';

const item = (answer: number): ReasoningItem => ({
  skillId: 'mul-tens-mental',
  tier: 1,
  story: { key: 'mentalCalc', params: { expr: '20 × 3' } },
  steps: [{ kind: 'number', prompt: { key: 'askResult' }, answer }],
  work: [],
});

describe('item fingerprint', () => {
  it('keeps the exact signature string (moved from pool-counting)', () => {
    expect(itemSignature(item(60))).toBe(
      'mul-tens-mental|t1|mentalCalc(expr=20 × 3)|n:askResult()=60',
    );
  });

  it('is deterministic and a 32-bit unsigned number', () => {
    const fp = itemFingerprint(item(60));
    expect(itemFingerprint(item(60))).toBe(fp);
    expect(Number.isInteger(fp)).toBe(true);
    expect(fp).toBeGreaterThanOrEqual(0);
    expect(fp).toBeLessThan(2 ** 32);
  });

  it('changes when only the answer changes', () => {
    expect(itemFingerprint(item(60))).not.toBe(itemFingerprint(item(61)));
  });

  it('differs across real generated items', () => {
    const a = itemForSkill('mul-tens-mental', mulberry32(1), 1);
    const b = itemForSkill('mul-tens-mental', mulberry32(2), 1);
    expect(itemSignature(a)).not.toBe(itemSignature(b));
    expect(itemFingerprint(a)).not.toBe(itemFingerprint(b));
  });
});
