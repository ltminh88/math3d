// Practice run renderability (Phase 6): English skills render when their
// generator can build an item; unknown ids still drop.
import { describe, expect, it } from 'vitest';
import { unitForSkill } from '../english/content/units';
import { isKeyRenderable } from './practice-run';

describe('isKeyRenderable (English, Phase 6)', () => {
  it('true for English skills of every kind', () => {
    for (const id of [
      'en-letters-a-d',
      'en-words-a-d',
      'en-topic-animals',
      'en-pattern-this-is',
      'en-alphabet-order',
    ]) {
      expect(isKeyRenderable(`sk:${id}`, 1)).toBe(true);
    }
  });

  it('an unknown skill-looking id is not a skill key at all (renders as a quiz key)', () => {
    // isSkillKey validates against the catalog, so 'sk:en-nope' takes the
    // non-skill branch and returns true — unknown ids never reach a generator.
    expect(isKeyRenderable('sk:en-nope', 1)).toBe(true);
  });

  it('unchanged for math keys', () => {
    expect(isKeyRenderable('mul:3x4', 1)).toBe(true);
    expect(isKeyRenderable('sk:wp-times-then-add', 2)).toBe(true);
  });
});

describe('unitForSkill', () => {
  it('returns the earliest unit that teaches the skill', () => {
    expect(unitForSkill('en-letters-a-d').stage).toBe(1);
    expect(unitForSkill('en-topic-animals').stage).toBe(2);
    expect(unitForSkill('en-pattern-i-can').stage).toBe(3);
    expect(unitForSkill('en-letters-y-z').stage).toBe(7);
  });
});
