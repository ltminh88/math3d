// Legacy chunk "map" (recovered, mechanically split). Do not hand-edit; swap via shims/map.js.
import { Di, Dt, Qe, Wr, fe, yt } from './shims/config.js';

const sg = '#194f42';
let gi;
let _i;
function ag() {
  if (_i) {
    return _i;
  }
  let i = 23;
  const e = () => {
    i = (i * 16807) % 2147483647;
    return (i - 1) / 2147483646;
  };
  _i = [];
  for (let t = 0; t < 6000 && _i.length < 1400; t++) {
    const n = -220 + e() * 460;
    const r = -190 + e() * 380;
    const s = Math.max(fe.west.minX - n, n - fe.east.maxX, 0);
    const a = Math.max(fe.minZ - r, r - fe.maxZ, 0);
    if (!(Math.hypot(s, a) < 2.5 || Math.abs(n - 7) < 5.5)) {
      _i.push([n, r, 1.3 + e() * 1.3]);
    }
  }
  return _i;
}
function og() {
  if (gi) {
    return gi;
  }
  let i = 7;
  const e = () => {
    i = (i * 16807) % 2147483647;
    return (i - 1) / 2147483646;
  };
  const t = (n, r) =>
    Wr.some((s) =>
      s.some(([a, o], l) => {
        if (!l) {
          return false;
        }
        const [c, u] = s[l - 1];
        const h = a - c;
        const f = o - u;
        const m = Math.max(0, Math.min(1, ((n - c) * h + (r - u) * f) / (h * h + f * f)));
        return Math.hypot(n - c - h * m, r - u - f * m) < 3;
      }),
    );
  gi = [];
  for (let n = 0; n < 1400 && gi.length < 260; n++) {
    const r = fe.west.minX + 3 + e() * (fe.east.maxX - fe.west.minX - 6);
    const s = fe.minZ + 3 + e() * (fe.maxZ - fe.minZ - 6);
    if (
      !(
        (r > Qe.riverMin - 2 && r < Qe.riverMax + 2) ||
        Dt.some(
          (a) =>
            a.id !== 'village' &&
            Math.abs(r - a.center[0]) < a.size[0] / 2 + 1.5 &&
            Math.abs(s - a.center[1]) < a.size[1] / 2 + 1.5,
        ) ||
        t(r, s) ||
        Math.hypot(r + 38, s + 11) < 6 ||
        (r > -24 && r < 2 && s > -16 && s < 12)
      )
    ) {
      gi.push([r, s, 0.9 + e() * 0.8]);
    }
  }
  return gi;
}
const vi = (i, e, t, n, r, s) => {
  i.beginPath();
  i.roundRect(e, t, n - e, r - t, s);
};
function Jl(i) {
  const e = Math.min(devicePixelRatio || 1, 2);
  const t = i.clientWidth;
  const n = i.clientHeight;
  if (i.width !== Math.round(t * e) || i.height !== Math.round(n * e)) {
    i.width = Math.round(t * e);
    i.height = Math.round(n * e);
  }
  const r = i.getContext('2d');
  r.setTransform(e, 0, 0, e, 0, 0);
  return {
    ctx: r,
    w: t,
    h: n,
  };
}
function lg(i, e, t = 40) {
  const n = fe.east.maxX - fe.west.minX + 12;
  const r = fe.maxZ - fe.minZ + 12;
  return {
    cx: (fe.west.minX + fe.east.maxX) / 2,
    cz: (fe.minZ + fe.maxZ) / 2,
    scale: Math.min((i - t * 2) / n, (e - t * 2) / r),
    rotation: 0,
  };
}
function cg(i, e, t, n, r) {
  return {
    x: i.cx + (n - e / 2) / i.scale,
    z: i.cz + (r - t / 2) / i.scale,
  };
}
function hg(i, e) {
  return (
    Dt.filter((t) => t.id !== 'village').find(
      (t) =>
        Math.abs(i - t.center[0]) <= t.size[0] / 2 && Math.abs(e - t.center[1]) <= t.size[1] / 2,
    ) ?? (i > fe.west.minX && i < fe.west.maxX && e > fe.minZ && e < fe.maxZ ? Dt[0] : undefined)
  );
}
function Ql(i, e, t, n, r) {
  const s = n.scale;
  const a = i.createRadialGradient(e / 2, t / 2, 0, e / 2, t / 2, Math.max(e, t) * 0.75);
  a.addColorStop(0, '#86bf62');
  a.addColorStop(1, '#5f9a4e');
  i.fillStyle = a;
  i.fillRect(0, 0, e, t);
  i.save();
  i.translate(e / 2, t / 2);
  i.rotate(n.rotation);
  i.scale(s, s);
  i.translate(-n.cx, -n.cz);
  for (const [g, S, p] of ag()) {
    i.fillStyle = '#4f8a45';
    i.beginPath();
    i.arc(g + 0.3, S + 0.4, p, 0, Math.PI * 2);
    i.fill();
    i.fillStyle = '#65a353';
    i.beginPath();
    i.arc(g, S, p, 0, Math.PI * 2);
    i.fill();
  }
  i.fillStyle = '#9ed072';
  vi(i, fe.west.minX, fe.minZ, fe.west.maxX, fe.maxZ, 10);
  i.fill();
  vi(i, fe.east.minX, fe.minZ, fe.east.maxX, fe.maxZ, 10);
  i.fill();
  i.fillStyle = '#e3d3a4';
  i.fillRect(
    Qe.riverMin - 0.9,
    fe.minZ - 400,
    Qe.riverMax - Qe.riverMin + 1.8,
    fe.maxZ - fe.minZ + 800,
  );
  i.fillStyle = '#5cc0d3';
  i.fillRect(Qe.riverMin, fe.minZ - 400, Qe.riverMax - Qe.riverMin, fe.maxZ - fe.minZ + 800);
  i.fillStyle = '#6fcbe0';
  i.beginPath();
  i.arc(-38, -11, 4.6, 0, Math.PI * 2);
  i.fill();
  for (const [g, S, p] of og()) {
    i.fillStyle = '#6fae5a';
    i.beginPath();
    i.arc(g + 0.25, S + 0.35, p, 0, Math.PI * 2);
    i.fill();
    i.fillStyle = '#86c46a';
    i.beginPath();
    i.arc(g, S, p, 0, Math.PI * 2);
    i.fill();
  }
  i.lineCap = 'round';
  i.lineJoin = 'round';
  i.strokeStyle = '#f1e2b8';
  i.lineWidth = 2.6;
  for (const g of Wr) {
    i.beginPath();
    g.forEach(([S, p]) => i.lineTo(S, p));
    i.stroke();
  }
  const o = r.bridge / yt;
  i.fillStyle = '#d9c9a0';
  i.fillRect(Qe.riverMin, -1.7, (Qe.riverMax - Qe.riverMin) * o, 3.4);
  if (o < 1) {
    i.setLineDash([0.8, 0.8]);
    i.strokeStyle = '#fffbea';
    i.lineWidth = 0.35;
    i.strokeRect(Qe.riverMin, -1.7, Qe.riverMax - Qe.riverMin, 3.4);
    i.setLineDash([]);
  }
  for (const g of Dt) {
    if (g.id === 'village') {
      continue;
    }
    const S = Di(g, r.questComplete);
    const [p, d] = g.center;
    const [E, b] = g.size;
    i.globalAlpha = S ? 0.85 : 0.45;
    i.fillStyle = S ? g.color : '#c9cfbf';
    vi(i, p - E / 2, d - b / 2, p + E / 2, d + b / 2, 2.5);
    i.fill();
    i.globalAlpha = 1;
    if (!S) {
      i.setLineDash([1, 1]);
      i.strokeStyle = '#7d8a74';
      i.lineWidth = 0.3;
      i.stroke();
      i.setLineDash([]);
    }
    if (r.selected === g.id) {
      i.strokeStyle = '#f3b53d';
      i.lineWidth = 0.9;
      vi(i, p - E / 2 - 0.8, d - b / 2 - 0.8, p + E / 2 + 0.8, d + b / 2 + 0.8, 3);
      i.stroke();
    }
  }
  i.fillStyle = '#e39a67';
  for (const [g, S, p] of [
    [-12, -6, 2.4],
    [-17, 6, 1.8],
    [-4, -11, 2],
    [-15, -14, 1.6],
  ]) {
    vi(i, g - p, S - p, g + p, S + p, 0.6);
    i.fill();
  }
  if (r.selected === 'village') {
    i.strokeStyle = '#f3b53d';
    i.lineWidth = 0.9;
    vi(i, -30, -20, 4, 20, 3);
    i.stroke();
  }
  i.restore();
  const l = (g, S) => {
    const p = (g - n.cx) * s;
    const d = (S - n.cz) * s;
    const E = Math.cos(n.rotation);
    const b = Math.sin(n.rotation);
    return {
      x: e / 2 + p * E - d * b,
      y: t / 2 + p * b + d * E,
    };
  };
  i.textAlign = 'center';
  i.textBaseline = 'middle';
  for (const g of Dt) {
    const S = Di(g, r.questComplete);
    const p = l(g.center[0], g.center[1]);
    const d = r.labels ? 26 : s > 2.2 ? 20 : 15;
    i.globalAlpha = S ? 1 : 0.7;
    i.font = `${d}px sans-serif`;
    i.fillText(S ? g.icon : '🔒', p.x, p.y - (r.labels ? 10 : 0));
    if (r.labels) {
      i.font = '800 14px Nunito, "Trebuchet MS", sans-serif';
      const E = r.translate(g.name);
      const b = i.measureText(E).width + 18;
      i.fillStyle = '#fffbeaee';
      i.beginPath();
      i.roundRect(p.x - b / 2, p.y + 8, b, 24, 12);
      i.fill();
      i.fillStyle = sg;
      i.fillText(E, p.x, p.y + 20.5);
    }
    i.globalAlpha = 1;
  }
  const c = l(r.milo.x, r.milo.z);
  const u = r.labels ? 9 : 6;
  i.fillStyle = '#f4c755';
  i.strokeStyle = '#fff9e6';
  i.lineWidth = 2.5;
  i.beginPath();
  i.arc(c.x, c.y, u, 0, Math.PI * 2);
  i.fill();
  i.stroke();
  i.fillStyle = '#6e531a';
  i.font = `900 ${u * 1.4}px Nunito, sans-serif`;
  i.fillText('!', c.x, c.y + 0.5);
  const h = l(r.player.x, r.player.z);
  const f = r.labels ? 13 : 10;
  const m = 1 + Math.sin(r.time * 3) * 0.15;
  i.fillStyle = '#ffffff55';
  i.beginPath();
  i.arc(h.x, h.y, f * 1.6 * m, 0, Math.PI * 2);
  i.fill();
  i.save();
  i.translate(h.x, h.y);
  i.rotate(n.rotation - r.player.facing + Math.PI);
  i.fillStyle = '#e8562f';
  i.strokeStyle = '#fff';
  i.lineWidth = 2.5;
  i.beginPath();
  i.moveTo(0, -f);
  i.lineTo(f * 0.72, f * 0.75);
  i.lineTo(0, f * 0.38);
  i.lineTo(-f * 0.72, f * 0.75);
  i.closePath();
  i.stroke();
  i.fill();
  i.restore();
}

export { Jl, Ql, cg, hg, lg };
