// A shipped M3D2 code (written by the M3D2 exporter before M3D3 existed) and what it imports.
// Frozen: M3D2 decoding must keep returning exactly this, whatever later versions add.
export const SHIPPED_M3D2_CODE = [
  'M3D2-eyJ4IjoxMjMwLCJjIjo0MTUsImEiOiJnaXJsIiwiZyI6WzcsNCwxXSwicyI6WzAsMV0sIm4iOjEyLCJsIjp7I',
  'mJyaWRnZSI6WzEsMTAwLDE3OTI0ODUwMTUsNiwxNzkyNDg1MDE1XSwiZmllbGQiOlsyLDIwMCwxNzkyNDg1MDE1LDA',
  'sMTc5MjQ4NTAxNV0sImZvcmVzdCI6WzEsMTAwLDE3OTI0ODUwMTUsMCwxNzkyNDg1MDE1XSwiY2l0eSI6WzMsMzAwL',
  'DE3OTI0ODUwMTUsMCwxNzkyNDg1MDE1XSwidG93ZXIiOlsxLDEwMCwxNzkyNDg1MDE1LDAsMTc5MjQ4NTAxNV19LCJ',
  'vIjpbImF2YXRhci1nb2xkLWNyb3duIl0sImUiOnsiYXZhdGFyLW91dGZpdCI6ImF2YXRhci1nb2xkLWNyb3duIn0sI',
  'mYiOltbIjN4NyIsOSw3LDQxMDAwLDMsMTEsMTc5MjQ4NTAxNSwyLDEsWzIwLDI0XV0sWyIyMS8zIiwyLDEsOTAwMCw',
  'xLDAsMTc5MjQ4NTAxNV1dfQ-78c5a422',
].join('');

export const SHIPPED_M3D2_IMPORT = {
  records: {
    avatarId: 'girl',
    wallet: {
      xp: 1230,
      coins: 415,
    },
    levels: {
      bridge: {
        stars: 1,
        bestScore: 100,
        completedAt: 1792485015000,
        progress: 6,
        acceptedAt: 1792485015000,
      },
      field: {
        stars: 2,
        bestScore: 200,
        completedAt: 1792485015000,
        progress: 0,
        acceptedAt: 1792485015000,
      },
      forest: {
        stars: 1,
        bestScore: 100,
        completedAt: 1792485015000,
        progress: 0,
        acceptedAt: 1792485015000,
      },
      city: {
        stars: 3,
        bestScore: 300,
        completedAt: 1792485015000,
        progress: 0,
        acceptedAt: 1792485015000,
      },
      tower: {
        stars: 1,
        bestScore: 100,
        completedAt: 1792485015000,
        progress: 0,
        acceptedAt: 1792485015000,
      },
    },
    facts: {
      'mul:3x7': {
        attempts: 9,
        correct: 7,
        totalMs: 41000,
        box: 3,
        lastSeenSession: 11,
        lastSeenAt: 1792485015000,
        streak: 2,
        fluent: true,
        errs: [20, 24],
      },
      'div:21/3': {
        attempts: 2,
        correct: 1,
        totalMs: 9000,
        box: 1,
        lastSeenSession: 0,
        lastSeenAt: 1792485015000,
        streak: 0,
        fluent: false,
        errs: [],
      },
    },
    gameMeta: {
      table: 7,
      combo: 4,
      started: true,
    },
    cosmetics: {
      owned: ['avatar-gold-crown'],
      equipped: {
        'avatar-outfit': 'avatar-gold-crown',
      },
    },
    sessionCount: 12,
  },
  audio: {
    sound: false,
    music: true,
  },
} as const;
