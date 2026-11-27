import { describe, expect, it } from 'vitest';
import { ENGLISH_ENTRIES, ENGLISH_SKILL_IDS } from './english-skill-entries';
import { LOOK_SKILL_IDS } from './look-skill-ids';

describe('english skill entries', () => {
  it('has exactly the 41 en-* ids: 21 block skills + alphabet order + 12 topics + 7 patterns', () => {
    expect(ENGLISH_SKILL_IDS).toHaveLength(41);
    expect(new Set(ENGLISH_SKILL_IDS).size).toBe(41);
    for (const id of ENGLISH_SKILL_IDS) expect(id.startsWith('en-')).toBe(true);
    expect(ENGLISH_SKILL_IDS.filter((id) => id.startsWith('en-letters-'))).toHaveLength(7);
    expect(ENGLISH_SKILL_IDS.filter((id) => id.startsWith('en-sounds-'))).toHaveLength(7);
    expect(ENGLISH_SKILL_IDS.filter((id) => id.startsWith('en-words-'))).toHaveLength(7);
    expect(ENGLISH_SKILL_IDS).toContain('en-alphabet-order');
    expect(ENGLISH_SKILL_IDS.filter((id) => id.startsWith('en-topic-'))).toHaveLength(12);
    expect(ENGLISH_SKILL_IDS.filter((id) => id.startsWith('en-pattern-'))).toHaveLength(7);
  });

  it('entries are family english with no SGK lesson: 41 CEC + 29 Look', () => {
    expect(ENGLISH_ENTRIES).toHaveLength(70);
    expect(ENGLISH_ENTRIES.map((e) => e.id)).toEqual([...ENGLISH_SKILL_IDS, ...LOOK_SKILL_IDS]);
    for (const e of ENGLISH_ENTRIES) {
      expect(e.family).toBe('english');
      expect(e.lessons).toEqual([]);
      expect(e.lesson).toBe('');
    }
  });
});
