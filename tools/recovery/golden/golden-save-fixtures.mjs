// 40 localStorage save blobs fed to the original save parser Ym() (inventory §4).
// Covers: valid, version mismatch, garbage, clamping, quest flags, >30 stats, bad keys, bridge 7.

const stat = (correct, wrong, extra = {}) => ({
  attempts: 999,
  correct,
  wrong,
  responseTime: 1500,
  lastAnsweredAt: '2026-10-01T10:00:00.000Z',
  ...extra,
});

const base = () => ({
  version: 1,
  xp: 120,
  coins: 35,
  bridge: 3,
  questAccepted: true,
  questComplete: false,
  avatar: 'girl',
  table: 4,
  sound: true,
  music: false,
  combo: 2,
  questionStats: { m4_3: stat(2, 1), m7_8: stat(0, 2) },
  review: ['m7_8'],
  started: true,
});

const allIds = [];
for (let a = 2; a <= 10; a++) for (let b = 1; b <= 10; b++) allIds.push(`m${a}_${b}`);

const json = (patch) => JSON.stringify({ ...base(), ...patch });

export function buildSaveFixtures() {
  const manyStats = Object.fromEntries(
    allIds.slice(0, 45).map((id, i) => [id, stat(i % 4, i % 3)]),
  );
  const fixtures = [
    ['null', null],
    ['empty-string', ''],
    ['valid-base', json({})],
    ['valid-defaults-only', JSON.stringify({ version: 1 })],
    ['version-2', json({ version: 2 })],
    ['version-string-1', json({ version: '1' })],
    ['version-missing', JSON.stringify({ xp: 50 })],
    ['garbage-text', 'not json at all {'],
    ['json-number', '42'],
    ['json-array', '[1,2,3]'],
    ['json-null', 'null'],
    ['json-string', '"hello"'],
    ['xp-negative', json({ xp: -50 })],
    ['xp-float', json({ xp: 99.9 })],
    ['xp-huge', json({ xp: 1e12 })],
    ['xp-string', json({ xp: '100' })],
    ['xp-nan-as-null', json({ xp: null })],
    ['coins-infinity-as-string', json({ coins: 'Infinity' })],
    ['bridge-7', json({ bridge: 7 })],
    ['bridge-6-complete', json({ bridge: 6, questComplete: true })],
    ['bridge-5-complete-flag', json({ bridge: 5, questComplete: true })],
    ['bridge-0-accepted-false', json({ bridge: 0, questAccepted: false })],
    ['bridge-2-accepted-false', json({ bridge: 2, questAccepted: false })],
    ['avatar-unknown', json({ avatar: 'robot' })],
    ['table-1', json({ table: 1 })],
    ['table-10', json({ table: 10 })],
    ['table-string', json({ table: '5' })],
    ['sound-false-music-true', json({ sound: false, music: true })],
    ['sound-0-music-1', json({ sound: 0, music: 1 })],
    ['combo-over-cap', json({ combo: 50000 })],
    ['stats-45-entries', json({ questionStats: manyStats })],
    [
      'stats-bad-keys',
      json({
        questionStats: {
          m1_3: stat(1, 0),
          m11_2: stat(1, 0),
          x: stat(1, 0),
          m2_0: stat(1, 0),
          m10_10: stat(3, 1),
        },
      }),
    ],
    [
      'stats-bad-values',
      json({
        questionStats: {
          m3_3: null,
          m3_4: 'x',
          m3_5: stat(-2, 2.7),
          m3_6: stat(1, 1, { lastAnsweredAt: 7 }),
        },
      }),
    ],
    [
      'stats-long-date',
      json({ questionStats: { m5_5: stat(1, 0, { lastAnsweredAt: 'x'.repeat(80) }) } }),
    ],
    ['stats-not-object', json({ questionStats: 'nope' })],
    ['review-dupes-and-bad', json({ review: ['m2_2', 'm2_2', 'm1_1', 5, 'm10_10', 'bad'] })],
    ['review-45-ids', json({ review: allIds.slice(10, 55) })],
    ['review-not-array', json({ review: 'm2_2' })],
    ['started-string', json({ started: 'true' })],
    ['extra-unknown-keys', json({ cloud: { token: 'x' }, owned_cosmetics: ['hat'] })],
  ];
  if (fixtures.length !== 40) throw new Error(`expected 40 save fixtures, got ${fixtures.length}`);
  return fixtures.map(([name, input]) => ({ name, input }));
}
