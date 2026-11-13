// A shipped M3D3 code (written by the M3D3 exporter before M3D4 existed) and what it
// imports. Frozen: M3D3 decoding must keep returning exactly this, whatever later
// versions add. (Phase 01 added the derived `stageStars: [stars]` per level on import;
// the code string itself is unchanged.)
export const SHIPPED_M3D3_CODE = [
  'M3D3-eyJ4IjoxMCwiYyI6NSwiZyI6WzAsMCwxXSwicyI6WzEsMF0sIm4iOjMsImwiOnsiYnJpZGd',
  'lIjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTVdLCJ0b3dlciI6WzIsMjAwLDE3OTM0MzU',
  '0MTUsMCwxNzkzNDM1NDE1XSwiZ2FyZGVuIjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTV',
  'dfSwiZiI6W1siM3g3Iiw5LDcsNDEwMDAsMywwLDE3OTM0MzU0MTUsMCwwLFsyMCwyNF1dXSwiayI',
  '6W1siZGl2LXJlbS1jZWlsIiw0LDMsNTIwMDAsNCwwLDE3OTM0MzU0MTUsMl0sWyJleHByLWJyYWN',
  'rZXRzIiwxLDEsOTAwMCwyLDAsMTc5MzQzNTQxNSwwLDFdXX0-ba2b11f9',
].join('');

export const SHIPPED_M3D3_IMPORT = {
  records: {
    avatarId: 'default',
    wallet: {
      xp: 10,
      coins: 5,
    },
    levels: {
      bridge: {
        stars: 2,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [2],
      },
      tower: {
        stars: 2,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [2],
      },
      garden: {
        stars: 2,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [2],
      },
    },
    facts: {
      'mul:3x7': {
        attempts: 9,
        correct: 7,
        totalMs: 41000,
        box: 3,
        lastSeenSession: 0,
        lastSeenAt: 1793435415000,
        streak: 0,
        fluent: false,
        errs: [20, 24],
      },
      'sk:div-rem-ceil': {
        attempts: 4,
        correct: 3,
        totalMs: 52000,
        box: 4,
        lastSeenSession: 0,
        lastSeenAt: 1793435415000,
        streak: 2,
        fluent: false,
        errs: [],
      },
      'sk:expr-brackets': {
        attempts: 1,
        correct: 1,
        totalMs: 9000,
        box: 2,
        lastSeenSession: 0,
        lastSeenAt: 1793435415000,
        streak: 0,
        fluent: true,
        errs: [],
      },
    },
    gameMeta: {
      table: 0,
      combo: 0,
      started: true,
    },
    cosmetics: {
      owned: [],
      equipped: {},
    },
    sessionCount: 3,
  },
  audio: {
    sound: true,
    music: false,
  },
} as const;
