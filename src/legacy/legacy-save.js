// Legacy chunk "save" (recovered, mechanically split). Do not hand-edit; swap via shims/save.js.
import { Ha, Kl, yt } from './shims/config.js';

const Ga = () => ({
  version: 1,
  xp: 0,
  coins: 0,
  bridge: 0,
  questAccepted: false,
  questComplete: false,
  avatar: 'boy',
  table: 0,
  sound: true,
  music: false,
  combo: 0,
  questionStats: {},
  review: [],
  started: false,
});
const Gn = (i, e = 10000000) => {
  if (typeof i === 'number' && Number.isFinite(i)) {
    return Math.max(0, Math.min(e, Math.floor(i)));
  }
  return 0;
};
function Ym(i) {
  const e = Ga();
  if (!i) {
    return e;
  }
  try {
    const t = JSON.parse(i);
    if (!t || typeof t !== 'object' || !('version' in t) || t.version !== 1) {
      return e;
    }
    const n = t;
    e.xp = Gn(n.xp);
    e.coins = Gn(n.coins);
    e.bridge = Gn(n.bridge, yt);
    e.questAccepted = n.questAccepted === true || e.bridge > 0;
    e.questComplete = n.questComplete === true && e.bridge === yt;
    e.avatar = n.avatar === 'girl' ? 'girl' : 'boy';
    e.table = Ha.includes(n.table) ? n.table : 0;
    e.sound = n.sound !== false;
    e.music = n.music === true;
    e.started = n.started === true;
    e.combo = Gn(n.combo, 10000);
    if (n.questionStats && typeof n.questionStats === 'object') {
      for (const [r, s] of Object.entries(n.questionStats).slice(0, 30)) {
        if (!/^m([2-9]|10)_([1-9]|10)$/.test(r) || !s || typeof s !== 'object') {
          continue;
        }
        const a = s;
        const o = Gn(a.correct);
        const l = Gn(a.wrong);
        e.questionStats[r] = {
          attempts: o + l,
          correct: o,
          wrong: l,
          responseTime: Gn(a.responseTime),
          lastAnsweredAt: typeof a.lastAnsweredAt === 'string' ? a.lastAnsweredAt.slice(0, 40) : '',
        };
      }
    }
    if (Array.isArray(n.review)) {
      e.review = [
        ...new Set(
          n.review.filter((r) => typeof r === 'string' && /^m([2-9]|10)_([1-9]|10)$/.test(r)),
        ),
      ].slice(0, 30);
    }
    return e;
  } catch {
    return e;
  }
}
function Km() {
  try {
    return Ym(localStorage.getItem(Kl));
  } catch {
    return Ga();
  }
}
function Zm(i) {
  try {
    localStorage.setItem(Kl, JSON.stringify(i));
    return true;
  } catch {
    return false;
  }
}

export { Ga, Km, Zm };
