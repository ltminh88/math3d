// Legacy chunk "quiz" (recovered, mechanically split). Do not hand-edit; swap via shims/quiz.js.
import { Ha } from './shims/config.js';

function jm(i, e = Math.random) {
  const t = [...i];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(e() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
function ll(i, e, t, n = Math.random) {
  const r = i * e;
  const s = [e > 1 ? e - 1 : e + 2, e < 10 ? e + 1 : e - 2];
  const a = [e, ...s].map((o) => ({
    value: i * o,
    label: t === 'bridge' ? `${i} × ${o}` : `${i * o}`,
  }));
  return {
    id: `m${i}_${e}`,
    a: i,
    b: e,
    answer: r,
    options: jm(a, n),
    review: false,
  };
}
function Jm(i, e, t = '', n = Math.random) {
  const r = i.table ? [i.table] : [...Ha];
  const s = i.review.filter((l) => l !== t && r.includes(Number(l.split('_')[0].slice(1))));
  if (s.length && n() < 0.7) {
    const l = s[Math.floor(n() * s.length)];
    const [c, u] = l.slice(1).split('_').map(Number);
    return {
      ...ll(c, u, e, n),
      review: true,
    };
  }
  const a = r
    .flatMap((l) =>
      Array.from(
        {
          length: 10,
        },
        (c, u) => ({
          a: l,
          b: u + 1,
        }),
      ),
    )
    .filter(({ a: l, b: c }) => `m${l}_${c}` !== t);
  const o = a[Math.floor(n() * a.length)];
  return ll(o.a, o.b, e, n);
}
const Qm = (i, e) => e === i.answer;
function eg(i, e, t, n) {
  const r = i.questionStats[e.id] ?? {
    attempts: 0,
    correct: 0,
    wrong: 0,
    lastAnsweredAt: '',
    responseTime: 0,
  };
  r.attempts++;
  r[t ? 'correct' : 'wrong']++;
  r.lastAnsweredAt = new Date().toISOString();
  r.responseTime = Math.round(n);
  i.questionStats[e.id] = r;
  if (!t && !i.review.includes(e.id)) {
    i.review.push(e.id);
  }
  i.combo = t ? i.combo + 1 : 0;
}
function tg(i, e) {
  switch (e) {
    case 1:
      return `Có ${i.a} nhóm, mỗi nhóm ${i.b} viên đá. Hãy đếm từng nhóm nhé!`;
    case 2:
      return `Cộng các nhóm lại: ${Array(i.a).fill(i.b).join(' + ')} = ?`;
    default:
      return `${i.a} nhóm, mỗi nhóm ${i.b} viên đá: ${i.a} × ${i.b} = ${i.answer}. Mình cùng thử lại nhé!`;
  }
}

export { Jm, Qm, eg, tg };
