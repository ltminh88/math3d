// A shipped M3D4 code (written by the M3D4 exporter before M3D5 existed) and what it
// imports. Frozen: M3D4 decoding must keep returning exactly this, whatever later
// versions add. (The M3D5 exporter writes the same fields, so the same snapshot encodes
// to the same payload with only the version prefix changed.)
export const SHIPPED_M3D4_CODE = [
  'M3D4-eyJ4IjoxMCwiYyI6NSwiZyI6WzAsMCwxXSwicyI6WzEsMF0sIm4iOjMsImwiOnsiYnJpZGd',
  'lIjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTVdLCJmaWVsZCI6WzMsMjAwLDE3OTM0MzU',
  '0MTUsMCwxNzkzNDM1NDE1XSwidG93ZXIiOlsxLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0',
  'sImdhcmRlbiI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XX0sImYiOltbIjN4NyIsOSw',
  '3LDQxMDAwLDMsMCwxNzkzNDM1NDE1LDAsMCxbMjAsMjRdXV0sImsiOltbImRpdi1yZW0tY2VpbCI',
  'sNCwzLDUyMDAwLDQsMCwxNzkzNDM1NDE1LDJdLFsiZXhwci1icmFja2V0cyIsMSwxLDkwMDAsMiw',
  'wLDE3OTM0MzU0MTUsMCwxXV0sInQiOnsiZmllbGQiOlszLDIsMV0sImdhcmRlbiI6WzIsMCwzXX0',
  'sImQiOlsyMDM0NSw3XX0-3ee317cd',
].join('');

export const SHIPPED_M3D4_IMPORT = {
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
      field: {
        stars: 3,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [3, 2, 1],
      },
      tower: {
        stars: 1,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [1],
      },
      garden: {
        stars: 2,
        bestScore: 200,
        completedAt: 1793435415000,
        progress: 0,
        acceptedAt: 1793435415000,
        stageStars: [2, 0, 3],
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
      equipped: { vlm: {}, avatar: {}, decor: [] },
    },
    sessionCount: 3,
    daily: {
      lastDailyDay: 20345,
      dailyStreak: 7,
    },
  },
  audio: {
    sound: true,
    music: false,
  },
} as const;
