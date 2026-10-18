(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) n(r);
  new MutationObserver((r) => {
    for (const s of r)
      if (s.type === 'childList')
        for (const a of s.addedNodes) a.tagName === 'LINK' && a.rel === 'modulepreload' && n(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(r) {
    const s = {};
    return (
      r.integrity && (s.integrity = r.integrity),
      r.referrerPolicy && (s.referrerPolicy = r.referrerPolicy),
      r.crossOrigin === 'use-credentials'
        ? (s.credentials = 'include')
        : r.crossOrigin === 'anonymous'
          ? (s.credentials = 'omit')
          : (s.credentials = 'same-origin'),
      s
    );
  }
  function n(r) {
    if (r.ep) return;
    r.ep = !0;
    const s = t(r);
    fetch(r.href, s);
  }
})();
const Ea = '180',
  _c = 0,
  io = 1,
  vc = 2,
  gl = 1,
  _l = 2,
  pn = 3,
  Pn = 0,
  Lt = 1,
  tn = 2,
  wn = 0,
  Si = 1,
  ro = 2,
  so = 3,
  ao = 4,
  xc = 5,
  Wn = 100,
  Mc = 101,
  Sc = 102,
  yc = 103,
  bc = 104,
  Ec = 200,
  Tc = 201,
  Ac = 202,
  wc = 203,
  Ds = 204,
  Is = 205,
  Rc = 206,
  Cc = 207,
  Pc = 208,
  Lc = 209,
  Dc = 210,
  Ic = 211,
  Uc = 212,
  Nc = 213,
  Fc = 214,
  Us = 0,
  Ns = 1,
  Fs = 2,
  Ai = 3,
  Os = 4,
  Bs = 5,
  zs = 6,
  ks = 7,
  vl = 0,
  Oc = 1,
  Bc = 2,
  Rn = 0,
  zc = 1,
  kc = 2,
  Hc = 3,
  xl = 4,
  Gc = 5,
  Vc = 6,
  Wc = 7,
  Ml = 300,
  wi = 301,
  Ri = 302,
  Hs = 303,
  Gs = 304,
  qr = 306,
  Vs = 1e3,
  qn = 1001,
  Ws = 1002,
  zt = 1003,
  Xc = 1004,
  dr = 1005,
  nn = 1006,
  Jr = 1007,
  $n = 1008,
  an = 1009,
  Sl = 1010,
  yl = 1011,
  Ki = 1012,
  Ta = 1013,
  Kn = 1014,
  rn = 1015,
  ir = 1016,
  Aa = 1017,
  wa = 1018,
  Zi = 1020,
  bl = 35902,
  El = 35899,
  Tl = 1021,
  Al = 1022,
  jt = 1023,
  ji = 1026,
  Ji = 1027,
  Ra = 1028,
  Ca = 1029,
  wl = 1030,
  Pa = 1031,
  La = 1033,
  Nr = 33776,
  Fr = 33777,
  Or = 33778,
  Br = 33779,
  Xs = 35840,
  qs = 35841,
  $s = 35842,
  Ys = 35843,
  Ks = 36196,
  Zs = 37492,
  js = 37496,
  Js = 37808,
  Qs = 37809,
  ea = 37810,
  ta = 37811,
  na = 37812,
  ia = 37813,
  ra = 37814,
  sa = 37815,
  aa = 37816,
  oa = 37817,
  la = 37818,
  ca = 37819,
  ha = 37820,
  ua = 37821,
  da = 36492,
  fa = 36494,
  pa = 36495,
  ma = 36283,
  ga = 36284,
  _a = 36285,
  va = 36286,
  qc = 3200,
  $c = 3201,
  Rl = 0,
  Yc = 1,
  An = '',
  Ut = 'srgb',
  Ci = 'srgb-linear',
  Hr = 'linear',
  Je = 'srgb',
  ti = 7680,
  oo = 519,
  Kc = 512,
  Zc = 513,
  jc = 514,
  Cl = 515,
  Jc = 516,
  Qc = 517,
  eh = 518,
  th = 519,
  lo = 35044,
  co = '300 es',
  sn = 2e3,
  Gr = 2001;
class Ii {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0) return;
    const r = n[e];
    if (r !== void 0) {
      const s = r.indexOf(t);
      s !== -1 && r.splice(s, 1);
    }
  }
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0) return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const r = n.slice(0);
      for (let s = 0, a = r.length; s < a; s++) r[s].call(this, e);
      e.target = null;
    }
  }
}
const Et = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '0a',
  '0b',
  '0c',
  '0d',
  '0e',
  '0f',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '1a',
  '1b',
  '1c',
  '1d',
  '1e',
  '1f',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '2a',
  '2b',
  '2c',
  '2d',
  '2e',
  '2f',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '3a',
  '3b',
  '3c',
  '3d',
  '3e',
  '3f',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '4a',
  '4b',
  '4c',
  '4d',
  '4e',
  '4f',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '5a',
  '5b',
  '5c',
  '5d',
  '5e',
  '5f',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '6a',
  '6b',
  '6c',
  '6d',
  '6e',
  '6f',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '7a',
  '7b',
  '7c',
  '7d',
  '7e',
  '7f',
  '80',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '8a',
  '8b',
  '8c',
  '8d',
  '8e',
  '8f',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
  '9a',
  '9b',
  '9c',
  '9d',
  '9e',
  '9f',
  'a0',
  'a1',
  'a2',
  'a3',
  'a4',
  'a5',
  'a6',
  'a7',
  'a8',
  'a9',
  'aa',
  'ab',
  'ac',
  'ad',
  'ae',
  'af',
  'b0',
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'ba',
  'bb',
  'bc',
  'bd',
  'be',
  'bf',
  'c0',
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'c7',
  'c8',
  'c9',
  'ca',
  'cb',
  'cc',
  'cd',
  'ce',
  'cf',
  'd0',
  'd1',
  'd2',
  'd3',
  'd4',
  'd5',
  'd6',
  'd7',
  'd8',
  'd9',
  'da',
  'db',
  'dc',
  'dd',
  'de',
  'df',
  'e0',
  'e1',
  'e2',
  'e3',
  'e4',
  'e5',
  'e6',
  'e7',
  'e8',
  'e9',
  'ea',
  'eb',
  'ec',
  'ed',
  'ee',
  'ef',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'fa',
  'fb',
  'fc',
  'fd',
  'fe',
  'ff',
];
let ho = 1234567;
const Xi = Math.PI / 180,
  Qi = 180 / Math.PI;
function Ui() {
  const i = (Math.random() * 4294967295) | 0,
    e = (Math.random() * 4294967295) | 0,
    t = (Math.random() * 4294967295) | 0,
    n = (Math.random() * 4294967295) | 0;
  return (
    Et[i & 255] +
    Et[(i >> 8) & 255] +
    Et[(i >> 16) & 255] +
    Et[(i >> 24) & 255] +
    '-' +
    Et[e & 255] +
    Et[(e >> 8) & 255] +
    '-' +
    Et[((e >> 16) & 15) | 64] +
    Et[(e >> 24) & 255] +
    '-' +
    Et[(t & 63) | 128] +
    Et[(t >> 8) & 255] +
    '-' +
    Et[(t >> 16) & 255] +
    Et[(t >> 24) & 255] +
    Et[n & 255] +
    Et[(n >> 8) & 255] +
    Et[(n >> 16) & 255] +
    Et[(n >> 24) & 255]
  ).toLowerCase();
}
function Ve(i, e, t) {
  return Math.max(e, Math.min(t, i));
}
function Da(i, e) {
  return ((i % e) + e) % e;
}
function nh(i, e, t, n, r) {
  return n + ((i - e) * (r - n)) / (t - e);
}
function ih(i, e, t) {
  return i !== e ? (t - i) / (e - i) : 0;
}
function qi(i, e, t) {
  return (1 - t) * i + t * e;
}
function rh(i, e, t, n) {
  return qi(i, e, 1 - Math.exp(-t * n));
}
function sh(i, e = 1) {
  return e - Math.abs(Da(i, e * 2) - e);
}
function ah(i, e, t) {
  return i <= e ? 0 : i >= t ? 1 : ((i = (i - e) / (t - e)), i * i * (3 - 2 * i));
}
function oh(i, e, t) {
  return i <= e ? 0 : i >= t ? 1 : ((i = (i - e) / (t - e)), i * i * i * (i * (i * 6 - 15) + 10));
}
function lh(i, e) {
  return i + Math.floor(Math.random() * (e - i + 1));
}
function ch(i, e) {
  return i + Math.random() * (e - i);
}
function hh(i) {
  return i * (0.5 - Math.random());
}
function uh(i) {
  i !== void 0 && (ho = i);
  let e = (ho += 1831565813);
  return (
    (e = Math.imul(e ^ (e >>> 15), e | 1)),
    (e ^= e + Math.imul(e ^ (e >>> 7), e | 61)),
    ((e ^ (e >>> 14)) >>> 0) / 4294967296
  );
}
function dh(i) {
  return i * Xi;
}
function fh(i) {
  return i * Qi;
}
function ph(i) {
  return (i & (i - 1)) === 0 && i !== 0;
}
function mh(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function gh(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function _h(i, e, t, n, r) {
  const s = Math.cos,
    a = Math.sin,
    o = s(t / 2),
    l = a(t / 2),
    c = s((e + n) / 2),
    u = a((e + n) / 2),
    h = s((e - n) / 2),
    f = a((e - n) / 2),
    m = s((n - e) / 2),
    g = a((n - e) / 2);
  switch (r) {
    case 'XYX':
      i.set(o * u, l * h, l * f, o * c);
      break;
    case 'YZY':
      i.set(l * f, o * u, l * h, o * c);
      break;
    case 'ZXZ':
      i.set(l * h, l * f, o * u, o * c);
      break;
    case 'XZX':
      i.set(o * u, l * g, l * m, o * c);
      break;
    case 'YXY':
      i.set(l * m, o * u, l * g, o * c);
      break;
    case 'ZYZ':
      i.set(l * g, l * m, o * u, o * c);
      break;
    default:
      console.warn(
        'THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + r,
      );
  }
}
function xi(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error('Invalid component type.');
  }
}
function Ct(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error('Invalid component type.');
  }
}
const fr = {
  DEG2RAD: Xi,
  RAD2DEG: Qi,
  generateUUID: Ui,
  clamp: Ve,
  euclideanModulo: Da,
  mapLinear: nh,
  inverseLerp: ih,
  lerp: qi,
  damp: rh,
  pingpong: sh,
  smoothstep: ah,
  smootherstep: oh,
  randInt: lh,
  randFloat: ch,
  randFloatSpread: hh,
  seededRandom: uh,
  degToRad: dh,
  radToDeg: fh,
  isPowerOfTwo: ph,
  ceilPowerOfTwo: mh,
  floorPowerOfTwo: gh,
  setQuaternionFromProperEuler: _h,
  normalize: Ct,
  denormalize: xi,
};
class We {
  constructor(e = 0, t = 0) {
    (We.prototype.isVector2 = !0), (this.x = e), (this.y = t);
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, t) {
    return (this.x = e), (this.y = t), this;
  }
  setScalar(e) {
    return (this.x = e), (this.y = e), this;
  }
  setX(e) {
    return (this.x = e), this;
  }
  setY(e) {
    return (this.y = e), this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error('index is out of range: ' + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error('index is out of range: ' + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return (this.x = e.x), (this.y = e.y), this;
  }
  add(e) {
    return (this.x += e.x), (this.y += e.y), this;
  }
  addScalar(e) {
    return (this.x += e), (this.y += e), this;
  }
  addVectors(e, t) {
    return (this.x = e.x + t.x), (this.y = e.y + t.y), this;
  }
  addScaledVector(e, t) {
    return (this.x += e.x * t), (this.y += e.y * t), this;
  }
  sub(e) {
    return (this.x -= e.x), (this.y -= e.y), this;
  }
  subScalar(e) {
    return (this.x -= e), (this.y -= e), this;
  }
  subVectors(e, t) {
    return (this.x = e.x - t.x), (this.y = e.y - t.y), this;
  }
  multiply(e) {
    return (this.x *= e.x), (this.y *= e.y), this;
  }
  multiplyScalar(e) {
    return (this.x *= e), (this.y *= e), this;
  }
  divide(e) {
    return (this.x /= e.x), (this.y /= e.y), this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const t = this.x,
      n = this.y,
      r = e.elements;
    return (this.x = r[0] * t + r[3] * n + r[6]), (this.y = r[1] * t + r[4] * n + r[7]), this;
  }
  min(e) {
    return (this.x = Math.min(this.x, e.x)), (this.y = Math.min(this.y, e.y)), this;
  }
  max(e) {
    return (this.x = Math.max(this.x, e.x)), (this.y = Math.max(this.y, e.y)), this;
  }
  clamp(e, t) {
    return (this.x = Ve(this.x, e.x, t.x)), (this.y = Ve(this.y, e.y, t.y)), this;
  }
  clampScalar(e, t) {
    return (this.x = Ve(this.x, e, t)), (this.y = Ve(this.y, e, t)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ve(n, e, t));
  }
  floor() {
    return (this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this;
  }
  ceil() {
    return (this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this;
  }
  round() {
    return (this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this;
  }
  roundToZero() {
    return (this.x = Math.trunc(this.x)), (this.y = Math.trunc(this.y)), this;
  }
  negate() {
    return (this.x = -this.x), (this.y = -this.y), this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Ve(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x,
      n = this.y - e.y;
    return t * t + n * n;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return (this.x += (e.x - this.x) * t), (this.y += (e.y - this.y) * t), this;
  }
  lerpVectors(e, t, n) {
    return (this.x = e.x + (t.x - e.x) * n), (this.y = e.y + (t.y - e.y) * n), this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, t = 0) {
    return (this.x = e[t]), (this.y = e[t + 1]), this;
  }
  toArray(e = [], t = 0) {
    return (e[t] = this.x), (e[t + 1] = this.y), e;
  }
  fromBufferAttribute(e, t) {
    return (this.x = e.getX(t)), (this.y = e.getY(t)), this;
  }
  rotateAround(e, t) {
    const n = Math.cos(t),
      r = Math.sin(t),
      s = this.x - e.x,
      a = this.y - e.y;
    return (this.x = s * n - a * r + e.x), (this.y = s * r + a * n + e.y), this;
  }
  random() {
    return (this.x = Math.random()), (this.y = Math.random()), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class rr {
  constructor(e = 0, t = 0, n = 0, r = 1) {
    (this.isQuaternion = !0), (this._x = e), (this._y = t), (this._z = n), (this._w = r);
  }
  static slerpFlat(e, t, n, r, s, a, o) {
    let l = n[r + 0],
      c = n[r + 1],
      u = n[r + 2],
      h = n[r + 3];
    const f = s[a + 0],
      m = s[a + 1],
      g = s[a + 2],
      S = s[a + 3];
    if (o === 0) {
      (e[t + 0] = l), (e[t + 1] = c), (e[t + 2] = u), (e[t + 3] = h);
      return;
    }
    if (o === 1) {
      (e[t + 0] = f), (e[t + 1] = m), (e[t + 2] = g), (e[t + 3] = S);
      return;
    }
    if (h !== S || l !== f || c !== m || u !== g) {
      let p = 1 - o;
      const d = l * f + c * m + u * g + h * S,
        E = d >= 0 ? 1 : -1,
        b = 1 - d * d;
      if (b > Number.EPSILON) {
        const P = Math.sqrt(b),
          R = Math.atan2(P, d * E);
        (p = Math.sin(p * R) / P), (o = Math.sin(o * R) / P);
      }
      const y = o * E;
      if (
        ((l = l * p + f * y),
        (c = c * p + m * y),
        (u = u * p + g * y),
        (h = h * p + S * y),
        p === 1 - o)
      ) {
        const P = 1 / Math.sqrt(l * l + c * c + u * u + h * h);
        (l *= P), (c *= P), (u *= P), (h *= P);
      }
    }
    (e[t] = l), (e[t + 1] = c), (e[t + 2] = u), (e[t + 3] = h);
  }
  static multiplyQuaternionsFlat(e, t, n, r, s, a) {
    const o = n[r],
      l = n[r + 1],
      c = n[r + 2],
      u = n[r + 3],
      h = s[a],
      f = s[a + 1],
      m = s[a + 2],
      g = s[a + 3];
    return (
      (e[t] = o * g + u * h + l * m - c * f),
      (e[t + 1] = l * g + u * f + c * h - o * m),
      (e[t + 2] = c * g + u * m + o * f - l * h),
      (e[t + 3] = u * g - o * h - l * f - c * m),
      e
    );
  }
  get x() {
    return this._x;
  }
  set x(e) {
    (this._x = e), this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    (this._y = e), this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    (this._z = e), this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    (this._w = e), this._onChangeCallback();
  }
  set(e, t, n, r) {
    return (
      (this._x = e), (this._y = t), (this._z = n), (this._w = r), this._onChangeCallback(), this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return (
      (this._x = e.x),
      (this._y = e.y),
      (this._z = e.z),
      (this._w = e.w),
      this._onChangeCallback(),
      this
    );
  }
  setFromEuler(e, t = !0) {
    const n = e._x,
      r = e._y,
      s = e._z,
      a = e._order,
      o = Math.cos,
      l = Math.sin,
      c = o(n / 2),
      u = o(r / 2),
      h = o(s / 2),
      f = l(n / 2),
      m = l(r / 2),
      g = l(s / 2);
    switch (a) {
      case 'XYZ':
        (this._x = f * u * h + c * m * g),
          (this._y = c * m * h - f * u * g),
          (this._z = c * u * g + f * m * h),
          (this._w = c * u * h - f * m * g);
        break;
      case 'YXZ':
        (this._x = f * u * h + c * m * g),
          (this._y = c * m * h - f * u * g),
          (this._z = c * u * g - f * m * h),
          (this._w = c * u * h + f * m * g);
        break;
      case 'ZXY':
        (this._x = f * u * h - c * m * g),
          (this._y = c * m * h + f * u * g),
          (this._z = c * u * g + f * m * h),
          (this._w = c * u * h - f * m * g);
        break;
      case 'ZYX':
        (this._x = f * u * h - c * m * g),
          (this._y = c * m * h + f * u * g),
          (this._z = c * u * g - f * m * h),
          (this._w = c * u * h + f * m * g);
        break;
      case 'YZX':
        (this._x = f * u * h + c * m * g),
          (this._y = c * m * h + f * u * g),
          (this._z = c * u * g - f * m * h),
          (this._w = c * u * h - f * m * g);
        break;
      case 'XZY':
        (this._x = f * u * h - c * m * g),
          (this._y = c * m * h - f * u * g),
          (this._z = c * u * g + f * m * h),
          (this._w = c * u * h + f * m * g);
        break;
      default:
        console.warn('THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + a);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2,
      r = Math.sin(n);
    return (
      (this._x = e.x * r),
      (this._y = e.y * r),
      (this._z = e.z * r),
      (this._w = Math.cos(n)),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(e) {
    const t = e.elements,
      n = t[0],
      r = t[4],
      s = t[8],
      a = t[1],
      o = t[5],
      l = t[9],
      c = t[2],
      u = t[6],
      h = t[10],
      f = n + o + h;
    if (f > 0) {
      const m = 0.5 / Math.sqrt(f + 1);
      (this._w = 0.25 / m),
        (this._x = (u - l) * m),
        (this._y = (s - c) * m),
        (this._z = (a - r) * m);
    } else if (n > o && n > h) {
      const m = 2 * Math.sqrt(1 + n - o - h);
      (this._w = (u - l) / m),
        (this._x = 0.25 * m),
        (this._y = (r + a) / m),
        (this._z = (s + c) / m);
    } else if (o > h) {
      const m = 2 * Math.sqrt(1 + o - n - h);
      (this._w = (s - c) / m),
        (this._x = (r + a) / m),
        (this._y = 0.25 * m),
        (this._z = (l + u) / m);
    } else {
      const m = 2 * Math.sqrt(1 + h - n - o);
      (this._w = (a - r) / m),
        (this._x = (s + c) / m),
        (this._y = (l + u) / m),
        (this._z = 0.25 * m);
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return (
      n < 1e-8
        ? ((n = 0),
          Math.abs(e.x) > Math.abs(e.z)
            ? ((this._x = -e.y), (this._y = e.x), (this._z = 0), (this._w = n))
            : ((this._x = 0), (this._y = -e.z), (this._z = e.y), (this._w = n)))
        : ((this._x = e.y * t.z - e.z * t.y),
          (this._y = e.z * t.x - e.x * t.z),
          (this._z = e.x * t.y - e.y * t.x),
          (this._w = n)),
      this.normalize()
    );
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Ve(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const r = Math.min(1, t / n);
    return this.slerp(e, r), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return (this._x *= -1), (this._y *= -1), (this._z *= -1), this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return (
      e === 0
        ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
        : ((e = 1 / e),
          (this._x = this._x * e),
          (this._y = this._y * e),
          (this._z = this._z * e),
          (this._w = this._w * e)),
      this._onChangeCallback(),
      this
    );
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x,
      r = e._y,
      s = e._z,
      a = e._w,
      o = t._x,
      l = t._y,
      c = t._z,
      u = t._w;
    return (
      (this._x = n * u + a * o + r * c - s * l),
      (this._y = r * u + a * l + s * o - n * c),
      (this._z = s * u + a * c + n * l - r * o),
      (this._w = a * u - n * o - r * l - s * c),
      this._onChangeCallback(),
      this
    );
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x,
      r = this._y,
      s = this._z,
      a = this._w;
    let o = a * e._w + n * e._x + r * e._y + s * e._z;
    if (
      (o < 0
        ? ((this._w = -e._w), (this._x = -e._x), (this._y = -e._y), (this._z = -e._z), (o = -o))
        : this.copy(e),
      o >= 1)
    )
      return (this._w = a), (this._x = n), (this._y = r), (this._z = s), this;
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const m = 1 - t;
      return (
        (this._w = m * a + t * this._w),
        (this._x = m * n + t * this._x),
        (this._y = m * r + t * this._y),
        (this._z = m * s + t * this._z),
        this.normalize(),
        this
      );
    }
    const c = Math.sqrt(l),
      u = Math.atan2(c, o),
      h = Math.sin((1 - t) * u) / c,
      f = Math.sin(t * u) / c;
    return (
      (this._w = a * h + this._w * f),
      (this._x = n * h + this._x * f),
      (this._y = r * h + this._y * f),
      (this._z = s * h + this._z * f),
      this._onChangeCallback(),
      this
    );
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(),
      t = 2 * Math.PI * Math.random(),
      n = Math.random(),
      r = Math.sqrt(1 - n),
      s = Math.sqrt(n);
    return this.set(r * Math.sin(e), r * Math.cos(e), s * Math.sin(t), s * Math.cos(t));
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return (
      (this._x = e[t]),
      (this._y = e[t + 1]),
      (this._z = e[t + 2]),
      (this._w = e[t + 3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(e = [], t = 0) {
    return (e[t] = this._x), (e[t + 1] = this._y), (e[t + 2] = this._z), (e[t + 3] = this._w), e;
  }
  fromBufferAttribute(e, t) {
    return (
      (this._x = e.getX(t)),
      (this._y = e.getY(t)),
      (this._z = e.getZ(t)),
      (this._w = e.getW(t)),
      this._onChangeCallback(),
      this
    );
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return (this._onChangeCallback = e), this;
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class F {
  constructor(e = 0, t = 0, n = 0) {
    (F.prototype.isVector3 = !0), (this.x = e), (this.y = t), (this.z = n);
  }
  set(e, t, n) {
    return n === void 0 && (n = this.z), (this.x = e), (this.y = t), (this.z = n), this;
  }
  setScalar(e) {
    return (this.x = e), (this.y = e), (this.z = e), this;
  }
  setX(e) {
    return (this.x = e), this;
  }
  setY(e) {
    return (this.y = e), this;
  }
  setZ(e) {
    return (this.z = e), this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error('index is out of range: ' + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error('index is out of range: ' + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return (this.x = e.x), (this.y = e.y), (this.z = e.z), this;
  }
  add(e) {
    return (this.x += e.x), (this.y += e.y), (this.z += e.z), this;
  }
  addScalar(e) {
    return (this.x += e), (this.y += e), (this.z += e), this;
  }
  addVectors(e, t) {
    return (this.x = e.x + t.x), (this.y = e.y + t.y), (this.z = e.z + t.z), this;
  }
  addScaledVector(e, t) {
    return (this.x += e.x * t), (this.y += e.y * t), (this.z += e.z * t), this;
  }
  sub(e) {
    return (this.x -= e.x), (this.y -= e.y), (this.z -= e.z), this;
  }
  subScalar(e) {
    return (this.x -= e), (this.y -= e), (this.z -= e), this;
  }
  subVectors(e, t) {
    return (this.x = e.x - t.x), (this.y = e.y - t.y), (this.z = e.z - t.z), this;
  }
  multiply(e) {
    return (this.x *= e.x), (this.y *= e.y), (this.z *= e.z), this;
  }
  multiplyScalar(e) {
    return (this.x *= e), (this.y *= e), (this.z *= e), this;
  }
  multiplyVectors(e, t) {
    return (this.x = e.x * t.x), (this.y = e.y * t.y), (this.z = e.z * t.z), this;
  }
  applyEuler(e) {
    return this.applyQuaternion(uo.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(uo.setFromAxisAngle(e, t));
  }
  applyMatrix3(e) {
    const t = this.x,
      n = this.y,
      r = this.z,
      s = e.elements;
    return (
      (this.x = s[0] * t + s[3] * n + s[6] * r),
      (this.y = s[1] * t + s[4] * n + s[7] * r),
      (this.z = s[2] * t + s[5] * n + s[8] * r),
      this
    );
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const t = this.x,
      n = this.y,
      r = this.z,
      s = e.elements,
      a = 1 / (s[3] * t + s[7] * n + s[11] * r + s[15]);
    return (
      (this.x = (s[0] * t + s[4] * n + s[8] * r + s[12]) * a),
      (this.y = (s[1] * t + s[5] * n + s[9] * r + s[13]) * a),
      (this.z = (s[2] * t + s[6] * n + s[10] * r + s[14]) * a),
      this
    );
  }
  applyQuaternion(e) {
    const t = this.x,
      n = this.y,
      r = this.z,
      s = e.x,
      a = e.y,
      o = e.z,
      l = e.w,
      c = 2 * (a * r - o * n),
      u = 2 * (o * t - s * r),
      h = 2 * (s * n - a * t);
    return (
      (this.x = t + l * c + a * h - o * u),
      (this.y = n + l * u + o * c - s * h),
      (this.z = r + l * h + s * u - a * c),
      this
    );
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const t = this.x,
      n = this.y,
      r = this.z,
      s = e.elements;
    return (
      (this.x = s[0] * t + s[4] * n + s[8] * r),
      (this.y = s[1] * t + s[5] * n + s[9] * r),
      (this.z = s[2] * t + s[6] * n + s[10] * r),
      this.normalize()
    );
  }
  divide(e) {
    return (this.x /= e.x), (this.y /= e.y), (this.z /= e.z), this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return (
      (this.x = Math.min(this.x, e.x)),
      (this.y = Math.min(this.y, e.y)),
      (this.z = Math.min(this.z, e.z)),
      this
    );
  }
  max(e) {
    return (
      (this.x = Math.max(this.x, e.x)),
      (this.y = Math.max(this.y, e.y)),
      (this.z = Math.max(this.z, e.z)),
      this
    );
  }
  clamp(e, t) {
    return (
      (this.x = Ve(this.x, e.x, t.x)),
      (this.y = Ve(this.y, e.y, t.y)),
      (this.z = Ve(this.z, e.z, t.z)),
      this
    );
  }
  clampScalar(e, t) {
    return (
      (this.x = Ve(this.x, e, t)), (this.y = Ve(this.y, e, t)), (this.z = Ve(this.z, e, t)), this
    );
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ve(n, e, t));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), (this.z = Math.ceil(this.z)), this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      this
    );
  }
  negate() {
    return (this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return (
      (this.x += (e.x - this.x) * t),
      (this.y += (e.y - this.y) * t),
      (this.z += (e.z - this.z) * t),
      this
    );
  }
  lerpVectors(e, t, n) {
    return (
      (this.x = e.x + (t.x - e.x) * n),
      (this.y = e.y + (t.y - e.y) * n),
      (this.z = e.z + (t.z - e.z) * n),
      this
    );
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, t) {
    const n = e.x,
      r = e.y,
      s = e.z,
      a = t.x,
      o = t.y,
      l = t.z;
    return (this.x = r * l - s * o), (this.y = s * a - n * l), (this.z = n * o - r * a), this;
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n);
  }
  projectOnPlane(e) {
    return Qr.copy(this).projectOnVector(e), this.sub(Qr);
  }
  reflect(e) {
    return this.sub(Qr.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Ve(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x,
      n = this.y - e.y,
      r = this.z - e.z;
    return t * t + n * n + r * r;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, t, n) {
    const r = Math.sin(t) * e;
    return (this.x = r * Math.sin(n)), (this.y = Math.cos(t) * e), (this.z = r * Math.cos(n)), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, t, n) {
    return (this.x = e * Math.sin(t)), (this.y = n), (this.z = e * Math.cos(t)), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return (this.x = t[12]), (this.y = t[13]), (this.z = t[14]), this;
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(),
      n = this.setFromMatrixColumn(e, 1).length(),
      r = this.setFromMatrixColumn(e, 2).length();
    return (this.x = t), (this.y = n), (this.z = r), this;
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  setFromEuler(e) {
    return (this.x = e._x), (this.y = e._y), (this.z = e._z), this;
  }
  setFromColor(e) {
    return (this.x = e.r), (this.y = e.g), (this.z = e.b), this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, t = 0) {
    return (this.x = e[t]), (this.y = e[t + 1]), (this.z = e[t + 2]), this;
  }
  toArray(e = [], t = 0) {
    return (e[t] = this.x), (e[t + 1] = this.y), (e[t + 2] = this.z), e;
  }
  fromBufferAttribute(e, t) {
    return (this.x = e.getX(t)), (this.y = e.getY(t)), (this.z = e.getZ(t)), this;
  }
  random() {
    return (this.x = Math.random()), (this.y = Math.random()), (this.z = Math.random()), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2,
      t = Math.random() * 2 - 1,
      n = Math.sqrt(1 - t * t);
    return (this.x = n * Math.cos(e)), (this.y = t), (this.z = n * Math.sin(e)), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const Qr = new F(),
  uo = new rr();
class Oe {
  constructor(e, t, n, r, s, a, o, l, c) {
    (Oe.prototype.isMatrix3 = !0),
      (this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
      e !== void 0 && this.set(e, t, n, r, s, a, o, l, c);
  }
  set(e, t, n, r, s, a, o, l, c) {
    const u = this.elements;
    return (
      (u[0] = e),
      (u[1] = r),
      (u[2] = o),
      (u[3] = t),
      (u[4] = s),
      (u[5] = l),
      (u[6] = n),
      (u[7] = a),
      (u[8] = c),
      this
    );
  }
  identity() {
    return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
  }
  copy(e) {
    const t = this.elements,
      n = e.elements;
    return (
      (t[0] = n[0]),
      (t[1] = n[1]),
      (t[2] = n[2]),
      (t[3] = n[3]),
      (t[4] = n[4]),
      (t[5] = n[5]),
      (t[6] = n[6]),
      (t[7] = n[7]),
      (t[8] = n[8]),
      this
    );
  }
  extractBasis(e, t, n) {
    return (
      e.setFromMatrix3Column(this, 0),
      t.setFromMatrix3Column(this, 1),
      n.setFromMatrix3Column(this, 2),
      this
    );
  }
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements,
      r = t.elements,
      s = this.elements,
      a = n[0],
      o = n[3],
      l = n[6],
      c = n[1],
      u = n[4],
      h = n[7],
      f = n[2],
      m = n[5],
      g = n[8],
      S = r[0],
      p = r[3],
      d = r[6],
      E = r[1],
      b = r[4],
      y = r[7],
      P = r[2],
      R = r[5],
      L = r[8];
    return (
      (s[0] = a * S + o * E + l * P),
      (s[3] = a * p + o * b + l * R),
      (s[6] = a * d + o * y + l * L),
      (s[1] = c * S + u * E + h * P),
      (s[4] = c * p + u * b + h * R),
      (s[7] = c * d + u * y + h * L),
      (s[2] = f * S + m * E + g * P),
      (s[5] = f * p + m * b + g * R),
      (s[8] = f * d + m * y + g * L),
      this
    );
  }
  multiplyScalar(e) {
    const t = this.elements;
    return (
      (t[0] *= e),
      (t[3] *= e),
      (t[6] *= e),
      (t[1] *= e),
      (t[4] *= e),
      (t[7] *= e),
      (t[2] *= e),
      (t[5] *= e),
      (t[8] *= e),
      this
    );
  }
  determinant() {
    const e = this.elements,
      t = e[0],
      n = e[1],
      r = e[2],
      s = e[3],
      a = e[4],
      o = e[5],
      l = e[6],
      c = e[7],
      u = e[8];
    return t * a * u - t * o * c - n * s * u + n * o * l + r * s * c - r * a * l;
  }
  invert() {
    const e = this.elements,
      t = e[0],
      n = e[1],
      r = e[2],
      s = e[3],
      a = e[4],
      o = e[5],
      l = e[6],
      c = e[7],
      u = e[8],
      h = u * a - o * c,
      f = o * l - u * s,
      m = c * s - a * l,
      g = t * h + n * f + r * m;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const S = 1 / g;
    return (
      (e[0] = h * S),
      (e[1] = (r * c - u * n) * S),
      (e[2] = (o * n - r * a) * S),
      (e[3] = f * S),
      (e[4] = (u * t - r * l) * S),
      (e[5] = (r * s - o * t) * S),
      (e[6] = m * S),
      (e[7] = (n * l - c * t) * S),
      (e[8] = (a * t - n * s) * S),
      this
    );
  }
  transpose() {
    let e;
    const t = this.elements;
    return (
      (e = t[1]),
      (t[1] = t[3]),
      (t[3] = e),
      (e = t[2]),
      (t[2] = t[6]),
      (t[6] = e),
      (e = t[5]),
      (t[5] = t[7]),
      (t[7] = e),
      this
    );
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const t = this.elements;
    return (
      (e[0] = t[0]),
      (e[1] = t[3]),
      (e[2] = t[6]),
      (e[3] = t[1]),
      (e[4] = t[4]),
      (e[5] = t[7]),
      (e[6] = t[2]),
      (e[7] = t[5]),
      (e[8] = t[8]),
      this
    );
  }
  setUvTransform(e, t, n, r, s, a, o) {
    const l = Math.cos(s),
      c = Math.sin(s);
    return (
      this.set(
        n * l,
        n * c,
        -n * (l * a + c * o) + a + e,
        -r * c,
        r * l,
        -r * (-c * a + l * o) + o + t,
        0,
        0,
        1,
      ),
      this
    );
  }
  scale(e, t) {
    return this.premultiply(es.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(es.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(es.makeTranslation(e, t)), this;
  }
  makeTranslation(e, t) {
    return (
      e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1),
      this
    );
  }
  makeRotation(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this;
  }
  makeScale(e, t) {
    return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this;
  }
  equals(e) {
    const t = this.elements,
      n = e.elements;
    for (let r = 0; r < 9; r++) if (t[r] !== n[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return (
      (e[t] = n[0]),
      (e[t + 1] = n[1]),
      (e[t + 2] = n[2]),
      (e[t + 3] = n[3]),
      (e[t + 4] = n[4]),
      (e[t + 5] = n[5]),
      (e[t + 6] = n[6]),
      (e[t + 7] = n[7]),
      (e[t + 8] = n[8]),
      e
    );
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const es = new Oe();
function Pl(i) {
  for (let e = i.length - 1; e >= 0; --e) if (i[e] >= 65535) return !0;
  return !1;
}
function Vr(i) {
  return document.createElementNS('http://www.w3.org/1999/xhtml', i);
}
function vh() {
  const i = Vr('canvas');
  return (i.style.display = 'block'), i;
}
const fo = {};
function er(i) {
  i in fo || ((fo[i] = !0), console.warn(i));
}
function xh(i, e, t) {
  return new Promise(function (n, r) {
    function s() {
      switch (i.clientWaitSync(e, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          r();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(s, t);
          break;
        default:
          n();
      }
    }
    setTimeout(s, t);
  });
}
const po = new Oe().set(
    0.4123908,
    0.3575843,
    0.1804808,
    0.212639,
    0.7151687,
    0.0721923,
    0.0193308,
    0.1191948,
    0.9505322,
  ),
  mo = new Oe().set(
    3.2409699,
    -1.5373832,
    -0.4986108,
    -0.9692436,
    1.8759675,
    0.0415551,
    0.0556301,
    -0.203977,
    1.0569715,
  );
function Mh() {
  const i = {
      enabled: !0,
      workingColorSpace: Ci,
      spaces: {},
      convert: function (r, s, a) {
        return (
          this.enabled === !1 ||
            s === a ||
            !s ||
            !a ||
            (this.spaces[s].transfer === Je && ((r.r = mn(r.r)), (r.g = mn(r.g)), (r.b = mn(r.b))),
            this.spaces[s].primaries !== this.spaces[a].primaries &&
              (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)),
            this.spaces[a].transfer === Je && ((r.r = yi(r.r)), (r.g = yi(r.g)), (r.b = yi(r.b)))),
          r
        );
      },
      workingToColorSpace: function (r, s) {
        return this.convert(r, this.workingColorSpace, s);
      },
      colorSpaceToWorking: function (r, s) {
        return this.convert(r, s, this.workingColorSpace);
      },
      getPrimaries: function (r) {
        return this.spaces[r].primaries;
      },
      getTransfer: function (r) {
        return r === An ? Hr : this.spaces[r].transfer;
      },
      getToneMappingMode: function (r) {
        return this.spaces[r].outputColorSpaceConfig.toneMappingMode || 'standard';
      },
      getLuminanceCoefficients: function (r, s = this.workingColorSpace) {
        return r.fromArray(this.spaces[s].luminanceCoefficients);
      },
      define: function (r) {
        Object.assign(this.spaces, r);
      },
      _getMatrix: function (r, s, a) {
        return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ);
      },
      _getDrawingBufferColorSpace: function (r) {
        return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace;
      },
      _getUnpackColorSpace: function (r = this.workingColorSpace) {
        return this.spaces[r].workingColorSpaceConfig.unpackColorSpace;
      },
      fromWorkingColorSpace: function (r, s) {
        return (
          er(
            'THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().',
          ),
          i.workingToColorSpace(r, s)
        );
      },
      toWorkingColorSpace: function (r, s) {
        return (
          er(
            'THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().',
          ),
          i.colorSpaceToWorking(r, s)
        );
      },
    },
    e = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06],
    t = [0.2126, 0.7152, 0.0722],
    n = [0.3127, 0.329];
  return (
    i.define({
      [Ci]: {
        primaries: e,
        whitePoint: n,
        transfer: Hr,
        toXYZ: po,
        fromXYZ: mo,
        luminanceCoefficients: t,
        workingColorSpaceConfig: { unpackColorSpace: Ut },
        outputColorSpaceConfig: { drawingBufferColorSpace: Ut },
      },
      [Ut]: {
        primaries: e,
        whitePoint: n,
        transfer: Je,
        toXYZ: po,
        fromXYZ: mo,
        luminanceCoefficients: t,
        outputColorSpaceConfig: { drawingBufferColorSpace: Ut },
      },
    }),
    i
  );
}
const Ye = Mh();
function mn(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function yi(i) {
  return i < 0.0031308 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let ni;
class Sh {
  static getDataURL(e, t = 'image/png') {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > 'u') return e.src;
    let n;
    if (e instanceof HTMLCanvasElement) n = e;
    else {
      ni === void 0 && (ni = Vr('canvas')), (ni.width = e.width), (ni.height = e.height);
      const r = ni.getContext('2d');
      e instanceof ImageData ? r.putImageData(e, 0, 0) : r.drawImage(e, 0, 0, e.width, e.height),
        (n = ni);
    }
    return n.toDataURL(t);
  }
  static sRGBToLinear(e) {
    if (
      (typeof HTMLImageElement < 'u' && e instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement < 'u' && e instanceof HTMLCanvasElement) ||
      (typeof ImageBitmap < 'u' && e instanceof ImageBitmap)
    ) {
      const t = Vr('canvas');
      (t.width = e.width), (t.height = e.height);
      const n = t.getContext('2d');
      n.drawImage(e, 0, 0, e.width, e.height);
      const r = n.getImageData(0, 0, e.width, e.height),
        s = r.data;
      for (let a = 0; a < s.length; a++) s[a] = mn(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray
          ? (t[n] = Math.floor(mn(t[n] / 255) * 255))
          : (t[n] = mn(t[n]));
      return { data: t, width: e.width, height: e.height };
    } else
      return (
        console.warn(
          'THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.',
        ),
        e
      );
  }
}
let yh = 0;
class Ia {
  constructor(e = null) {
    (this.isSource = !0),
      Object.defineProperty(this, 'id', { value: yh++ }),
      (this.uuid = Ui()),
      (this.data = e),
      (this.dataReady = !0),
      (this.version = 0);
  }
  getSize(e) {
    const t = this.data;
    return (
      typeof HTMLVideoElement < 'u' && t instanceof HTMLVideoElement
        ? e.set(t.videoWidth, t.videoHeight, 0)
        : t instanceof VideoFrame
          ? e.set(t.displayHeight, t.displayWidth, 0)
          : t !== null
            ? e.set(t.width, t.height, t.depth || 0)
            : e.set(0, 0, 0),
      e
    );
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == 'string';
    if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
    const n = { uuid: this.uuid, url: '' },
      r = this.data;
    if (r !== null) {
      let s;
      if (Array.isArray(r)) {
        s = [];
        for (let a = 0, o = r.length; a < o; a++)
          r[a].isDataTexture ? s.push(ts(r[a].image)) : s.push(ts(r[a]));
      } else s = ts(r);
      n.url = s;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function ts(i) {
  return (typeof HTMLImageElement < 'u' && i instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement < 'u' && i instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap < 'u' && i instanceof ImageBitmap)
    ? Sh.getDataURL(i)
    : i.data
      ? {
          data: Array.from(i.data),
          width: i.width,
          height: i.height,
          type: i.data.constructor.name,
        }
      : (console.warn('THREE.Texture: Unable to serialize Texture.'), {});
}
let bh = 0;
const ns = new F();
class At extends Ii {
  constructor(
    e = At.DEFAULT_IMAGE,
    t = At.DEFAULT_MAPPING,
    n = qn,
    r = qn,
    s = nn,
    a = $n,
    o = jt,
    l = an,
    c = At.DEFAULT_ANISOTROPY,
    u = An,
  ) {
    super(),
      (this.isTexture = !0),
      Object.defineProperty(this, 'id', { value: bh++ }),
      (this.uuid = Ui()),
      (this.name = ''),
      (this.source = new Ia(e)),
      (this.mipmaps = []),
      (this.mapping = t),
      (this.channel = 0),
      (this.wrapS = n),
      (this.wrapT = r),
      (this.magFilter = s),
      (this.minFilter = a),
      (this.anisotropy = c),
      (this.format = o),
      (this.internalFormat = null),
      (this.type = l),
      (this.offset = new We(0, 0)),
      (this.repeat = new We(1, 1)),
      (this.center = new We(0, 0)),
      (this.rotation = 0),
      (this.matrixAutoUpdate = !0),
      (this.matrix = new Oe()),
      (this.generateMipmaps = !0),
      (this.premultiplyAlpha = !1),
      (this.flipY = !0),
      (this.unpackAlignment = 4),
      (this.colorSpace = u),
      (this.userData = {}),
      (this.updateRanges = []),
      (this.version = 0),
      (this.onUpdate = null),
      (this.renderTarget = null),
      (this.isRenderTargetTexture = !1),
      (this.isArrayTexture = !!(e && e.depth && e.depth > 1)),
      (this.pmremVersion = 0);
  }
  get width() {
    return this.source.getSize(ns).x;
  }
  get height() {
    return this.source.getSize(ns).y;
  }
  get depth() {
    return this.source.getSize(ns).z;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y,
    );
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return (
      (this.name = e.name),
      (this.source = e.source),
      (this.mipmaps = e.mipmaps.slice(0)),
      (this.mapping = e.mapping),
      (this.channel = e.channel),
      (this.wrapS = e.wrapS),
      (this.wrapT = e.wrapT),
      (this.magFilter = e.magFilter),
      (this.minFilter = e.minFilter),
      (this.anisotropy = e.anisotropy),
      (this.format = e.format),
      (this.internalFormat = e.internalFormat),
      (this.type = e.type),
      this.offset.copy(e.offset),
      this.repeat.copy(e.repeat),
      this.center.copy(e.center),
      (this.rotation = e.rotation),
      (this.matrixAutoUpdate = e.matrixAutoUpdate),
      this.matrix.copy(e.matrix),
      (this.generateMipmaps = e.generateMipmaps),
      (this.premultiplyAlpha = e.premultiplyAlpha),
      (this.flipY = e.flipY),
      (this.unpackAlignment = e.unpackAlignment),
      (this.colorSpace = e.colorSpace),
      (this.renderTarget = e.renderTarget),
      (this.isRenderTargetTexture = e.isRenderTargetTexture),
      (this.isArrayTexture = e.isArrayTexture),
      (this.userData = JSON.parse(JSON.stringify(e.userData))),
      (this.needsUpdate = !0),
      this
    );
  }
  setValues(e) {
    for (const t in e) {
      const n = e[t];
      if (n === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);
        continue;
      }
      const r = this[t];
      if (r === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);
        continue;
      }
      (r && n && r.isVector2 && n.isVector2) ||
      (r && n && r.isVector3 && n.isVector3) ||
      (r && n && r.isMatrix3 && n.isMatrix3)
        ? r.copy(n)
        : (this[t] = n);
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == 'string';
    if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
    const n = {
      metadata: { version: 4.7, type: 'Texture', generator: 'Texture.toJSON' },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment,
    };
    return (
      Object.keys(this.userData).length > 0 && (n.userData = this.userData),
      t || (e.textures[this.uuid] = n),
      n
    );
  }
  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
  transformUv(e) {
    if (this.mapping !== Ml) return e;
    if ((e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1))
      switch (this.wrapS) {
        case Vs:
          e.x = e.x - Math.floor(e.x);
          break;
        case qn:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case Ws:
          Math.abs(Math.floor(e.x) % 2) === 1
            ? (e.x = Math.ceil(e.x) - e.x)
            : (e.x = e.x - Math.floor(e.x));
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case Vs:
          e.y = e.y - Math.floor(e.y);
          break;
        case qn:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case Ws:
          Math.abs(Math.floor(e.y) % 2) === 1
            ? (e.y = Math.ceil(e.y) - e.y)
            : (e.y = e.y - Math.floor(e.y));
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, (this.source.needsUpdate = !0));
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
At.DEFAULT_IMAGE = null;
At.DEFAULT_MAPPING = Ml;
At.DEFAULT_ANISOTROPY = 1;
class dt {
  constructor(e = 0, t = 0, n = 0, r = 1) {
    (dt.prototype.isVector4 = !0), (this.x = e), (this.y = t), (this.z = n), (this.w = r);
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, t, n, r) {
    return (this.x = e), (this.y = t), (this.z = n), (this.w = r), this;
  }
  setScalar(e) {
    return (this.x = e), (this.y = e), (this.z = e), (this.w = e), this;
  }
  setX(e) {
    return (this.x = e), this;
  }
  setY(e) {
    return (this.y = e), this;
  }
  setZ(e) {
    return (this.z = e), this;
  }
  setW(e) {
    return (this.w = e), this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error('index is out of range: ' + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error('index is out of range: ' + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return (
      (this.x = e.x), (this.y = e.y), (this.z = e.z), (this.w = e.w !== void 0 ? e.w : 1), this
    );
  }
  add(e) {
    return (this.x += e.x), (this.y += e.y), (this.z += e.z), (this.w += e.w), this;
  }
  addScalar(e) {
    return (this.x += e), (this.y += e), (this.z += e), (this.w += e), this;
  }
  addVectors(e, t) {
    return (
      (this.x = e.x + t.x), (this.y = e.y + t.y), (this.z = e.z + t.z), (this.w = e.w + t.w), this
    );
  }
  addScaledVector(e, t) {
    return (this.x += e.x * t), (this.y += e.y * t), (this.z += e.z * t), (this.w += e.w * t), this;
  }
  sub(e) {
    return (this.x -= e.x), (this.y -= e.y), (this.z -= e.z), (this.w -= e.w), this;
  }
  subScalar(e) {
    return (this.x -= e), (this.y -= e), (this.z -= e), (this.w -= e), this;
  }
  subVectors(e, t) {
    return (
      (this.x = e.x - t.x), (this.y = e.y - t.y), (this.z = e.z - t.z), (this.w = e.w - t.w), this
    );
  }
  multiply(e) {
    return (this.x *= e.x), (this.y *= e.y), (this.z *= e.z), (this.w *= e.w), this;
  }
  multiplyScalar(e) {
    return (this.x *= e), (this.y *= e), (this.z *= e), (this.w *= e), this;
  }
  applyMatrix4(e) {
    const t = this.x,
      n = this.y,
      r = this.z,
      s = this.w,
      a = e.elements;
    return (
      (this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * s),
      (this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * s),
      (this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * s),
      (this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * s),
      this
    );
  }
  divide(e) {
    return (this.x /= e.x), (this.y /= e.y), (this.z /= e.z), (this.w /= e.w), this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return (
      t < 1e-4
        ? ((this.x = 1), (this.y = 0), (this.z = 0))
        : ((this.x = e.x / t), (this.y = e.y / t), (this.z = e.z / t)),
      this
    );
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, n, r, s;
    const l = e.elements,
      c = l[0],
      u = l[4],
      h = l[8],
      f = l[1],
      m = l[5],
      g = l[9],
      S = l[2],
      p = l[6],
      d = l[10];
    if (Math.abs(u - f) < 0.01 && Math.abs(h - S) < 0.01 && Math.abs(g - p) < 0.01) {
      if (
        Math.abs(u + f) < 0.1 &&
        Math.abs(h + S) < 0.1 &&
        Math.abs(g + p) < 0.1 &&
        Math.abs(c + m + d - 3) < 0.1
      )
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const b = (c + 1) / 2,
        y = (m + 1) / 2,
        P = (d + 1) / 2,
        R = (u + f) / 4,
        L = (h + S) / 4,
        A = (g + p) / 4;
      return (
        b > y && b > P
          ? b < 0.01
            ? ((n = 0), (r = 0.707106781), (s = 0.707106781))
            : ((n = Math.sqrt(b)), (r = R / n), (s = L / n))
          : y > P
            ? y < 0.01
              ? ((n = 0.707106781), (r = 0), (s = 0.707106781))
              : ((r = Math.sqrt(y)), (n = R / r), (s = A / r))
            : P < 0.01
              ? ((n = 0.707106781), (r = 0.707106781), (s = 0))
              : ((s = Math.sqrt(P)), (n = L / s), (r = A / s)),
        this.set(n, r, s, t),
        this
      );
    }
    let E = Math.sqrt((p - g) * (p - g) + (h - S) * (h - S) + (f - u) * (f - u));
    return (
      Math.abs(E) < 0.001 && (E = 1),
      (this.x = (p - g) / E),
      (this.y = (h - S) / E),
      (this.z = (f - u) / E),
      (this.w = Math.acos((c + m + d - 1) / 2)),
      this
    );
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return (this.x = t[12]), (this.y = t[13]), (this.z = t[14]), (this.w = t[15]), this;
  }
  min(e) {
    return (
      (this.x = Math.min(this.x, e.x)),
      (this.y = Math.min(this.y, e.y)),
      (this.z = Math.min(this.z, e.z)),
      (this.w = Math.min(this.w, e.w)),
      this
    );
  }
  max(e) {
    return (
      (this.x = Math.max(this.x, e.x)),
      (this.y = Math.max(this.y, e.y)),
      (this.z = Math.max(this.z, e.z)),
      (this.w = Math.max(this.w, e.w)),
      this
    );
  }
  clamp(e, t) {
    return (
      (this.x = Ve(this.x, e.x, t.x)),
      (this.y = Ve(this.y, e.y, t.y)),
      (this.z = Ve(this.z, e.z, t.z)),
      (this.w = Ve(this.w, e.w, t.w)),
      this
    );
  }
  clampScalar(e, t) {
    return (
      (this.x = Ve(this.x, e, t)),
      (this.y = Ve(this.y, e, t)),
      (this.z = Ve(this.z, e, t)),
      (this.w = Ve(this.w, e, t)),
      this
    );
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ve(n, e, t));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      (this.w = Math.floor(this.w)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      (this.w = Math.ceil(this.w)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      (this.w = Math.round(this.w)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      (this.w = Math.trunc(this.w)),
      this
    );
  }
  negate() {
    return (this.x = -this.x), (this.y = -this.y), (this.z = -this.z), (this.w = -this.w), this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return (
      (this.x += (e.x - this.x) * t),
      (this.y += (e.y - this.y) * t),
      (this.z += (e.z - this.z) * t),
      (this.w += (e.w - this.w) * t),
      this
    );
  }
  lerpVectors(e, t, n) {
    return (
      (this.x = e.x + (t.x - e.x) * n),
      (this.y = e.y + (t.y - e.y) * n),
      (this.z = e.z + (t.z - e.z) * n),
      (this.w = e.w + (t.w - e.w) * n),
      this
    );
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, t = 0) {
    return (this.x = e[t]), (this.y = e[t + 1]), (this.z = e[t + 2]), (this.w = e[t + 3]), this;
  }
  toArray(e = [], t = 0) {
    return (e[t] = this.x), (e[t + 1] = this.y), (e[t + 2] = this.z), (e[t + 3] = this.w), e;
  }
  fromBufferAttribute(e, t) {
    return (
      (this.x = e.getX(t)), (this.y = e.getY(t)), (this.z = e.getZ(t)), (this.w = e.getW(t)), this
    );
  }
  random() {
    return (
      (this.x = Math.random()),
      (this.y = Math.random()),
      (this.z = Math.random()),
      (this.w = Math.random()),
      this
    );
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class Eh extends Ii {
  constructor(e = 1, t = 1, n = {}) {
    super(),
      (n = Object.assign(
        {
          generateMipmaps: !1,
          internalFormat: null,
          minFilter: nn,
          depthBuffer: !0,
          stencilBuffer: !1,
          resolveDepthBuffer: !0,
          resolveStencilBuffer: !0,
          depthTexture: null,
          samples: 0,
          count: 1,
          depth: 1,
          multiview: !1,
        },
        n,
      )),
      (this.isRenderTarget = !0),
      (this.width = e),
      (this.height = t),
      (this.depth = n.depth),
      (this.scissor = new dt(0, 0, e, t)),
      (this.scissorTest = !1),
      (this.viewport = new dt(0, 0, e, t));
    const r = { width: e, height: t, depth: n.depth },
      s = new At(r);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      (this.textures[o] = s.clone()),
        (this.textures[o].isRenderTargetTexture = !0),
        (this.textures[o].renderTarget = this);
    this._setTextureOptions(n),
      (this.depthBuffer = n.depthBuffer),
      (this.stencilBuffer = n.stencilBuffer),
      (this.resolveDepthBuffer = n.resolveDepthBuffer),
      (this.resolveStencilBuffer = n.resolveStencilBuffer),
      (this._depthTexture = null),
      (this.depthTexture = n.depthTexture),
      (this.samples = n.samples),
      (this.multiview = n.multiview);
  }
  _setTextureOptions(e = {}) {
    const t = { minFilter: nn, generateMipmaps: !1, flipY: !1, internalFormat: null };
    e.mapping !== void 0 && (t.mapping = e.mapping),
      e.wrapS !== void 0 && (t.wrapS = e.wrapS),
      e.wrapT !== void 0 && (t.wrapT = e.wrapT),
      e.wrapR !== void 0 && (t.wrapR = e.wrapR),
      e.magFilter !== void 0 && (t.magFilter = e.magFilter),
      e.minFilter !== void 0 && (t.minFilter = e.minFilter),
      e.format !== void 0 && (t.format = e.format),
      e.type !== void 0 && (t.type = e.type),
      e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy),
      e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace),
      e.flipY !== void 0 && (t.flipY = e.flipY),
      e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps),
      e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
    for (let n = 0; n < this.textures.length; n++) this.textures[n].setValues(t);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null),
      e !== null && (e.renderTarget = this),
      (this._depthTexture = e);
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      (this.width = e), (this.height = t), (this.depth = n);
      for (let r = 0, s = this.textures.length; r < s; r++)
        (this.textures[r].image.width = e),
          (this.textures[r].image.height = t),
          (this.textures[r].image.depth = n),
          (this.textures[r].isArrayTexture = this.textures[r].image.depth > 1);
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    (this.width = e.width),
      (this.height = e.height),
      (this.depth = e.depth),
      this.scissor.copy(e.scissor),
      (this.scissorTest = e.scissorTest),
      this.viewport.copy(e.viewport),
      (this.textures.length = 0);
    for (let t = 0, n = e.textures.length; t < n; t++) {
      (this.textures[t] = e.textures[t].clone()),
        (this.textures[t].isRenderTargetTexture = !0),
        (this.textures[t].renderTarget = this);
      const r = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new Ia(r);
    }
    return (
      (this.depthBuffer = e.depthBuffer),
      (this.stencilBuffer = e.stencilBuffer),
      (this.resolveDepthBuffer = e.resolveDepthBuffer),
      (this.resolveStencilBuffer = e.resolveStencilBuffer),
      e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()),
      (this.samples = e.samples),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}
class Zn extends Eh {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), (this.isWebGLRenderTarget = !0);
  }
}
class Ll extends At {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null),
      (this.isDataArrayTexture = !0),
      (this.image = { data: e, width: t, height: n, depth: r }),
      (this.magFilter = zt),
      (this.minFilter = zt),
      (this.wrapR = qn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1),
      (this.layerUpdates = new Set());
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Th extends At {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null),
      (this.isData3DTexture = !0),
      (this.image = { data: e, width: t, height: n, depth: r }),
      (this.magFilter = zt),
      (this.minFilter = zt),
      (this.wrapR = qn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1);
  }
}
class Qn {
  constructor(e = new F(1 / 0, 1 / 0, 1 / 0), t = new F(-1 / 0, -1 / 0, -1 / 0)) {
    (this.isBox3 = !0), (this.min = e), (this.max = t);
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(qt.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(qt.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = qt.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return (
      (this.min.x = this.min.y = this.min.z = 1 / 0),
      (this.max.x = this.max.y = this.max.z = -1 / 0),
      this
    );
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const s = n.getAttribute('position');
      if (t === !0 && s !== void 0 && e.isInstancedMesh !== !0)
        for (let a = 0, o = s.count; a < o; a++)
          e.isMesh === !0 ? e.getVertexPosition(a, qt) : qt.fromBufferAttribute(s, a),
            qt.applyMatrix4(e.matrixWorld),
            this.expandByPoint(qt);
      else
        e.boundingBox !== void 0
          ? (e.boundingBox === null && e.computeBoundingBox(), pr.copy(e.boundingBox))
          : (n.boundingBox === null && n.computeBoundingBox(), pr.copy(n.boundingBox)),
          pr.applyMatrix4(e.matrixWorld),
          this.union(pr);
    }
    const r = e.children;
    for (let s = 0, a = r.length; s < a; s++) this.expandByObject(r[s], t);
    return this;
  }
  containsPoint(e) {
    return (
      e.x >= this.min.x &&
      e.x <= this.max.x &&
      e.y >= this.min.y &&
      e.y <= this.max.y &&
      e.z >= this.min.z &&
      e.z <= this.max.z
    );
  }
  containsBox(e) {
    return (
      this.min.x <= e.min.x &&
      e.max.x <= this.max.x &&
      this.min.y <= e.min.y &&
      e.max.y <= this.max.y &&
      this.min.z <= e.min.z &&
      e.max.z <= this.max.z
    );
  }
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z),
    );
  }
  intersectsBox(e) {
    return (
      e.max.x >= this.min.x &&
      e.min.x <= this.max.x &&
      e.max.y >= this.min.y &&
      e.min.y <= this.max.y &&
      e.max.z >= this.min.z &&
      e.min.z <= this.max.z
    );
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, qt), qt.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return (
      e.normal.x > 0
        ? ((t = e.normal.x * this.min.x), (n = e.normal.x * this.max.x))
        : ((t = e.normal.x * this.max.x), (n = e.normal.x * this.min.x)),
      e.normal.y > 0
        ? ((t += e.normal.y * this.min.y), (n += e.normal.y * this.max.y))
        : ((t += e.normal.y * this.max.y), (n += e.normal.y * this.min.y)),
      e.normal.z > 0
        ? ((t += e.normal.z * this.min.z), (n += e.normal.z * this.max.z))
        : ((t += e.normal.z * this.max.z), (n += e.normal.z * this.min.z)),
      t <= -e.constant && n >= -e.constant
    );
  }
  intersectsTriangle(e) {
    if (this.isEmpty()) return !1;
    this.getCenter(Bi),
      mr.subVectors(this.max, Bi),
      ii.subVectors(e.a, Bi),
      ri.subVectors(e.b, Bi),
      si.subVectors(e.c, Bi),
      vn.subVectors(ri, ii),
      xn.subVectors(si, ri),
      Fn.subVectors(ii, si);
    let t = [
      0,
      -vn.z,
      vn.y,
      0,
      -xn.z,
      xn.y,
      0,
      -Fn.z,
      Fn.y,
      vn.z,
      0,
      -vn.x,
      xn.z,
      0,
      -xn.x,
      Fn.z,
      0,
      -Fn.x,
      -vn.y,
      vn.x,
      0,
      -xn.y,
      xn.x,
      0,
      -Fn.y,
      Fn.x,
      0,
    ];
    return !is(t, ii, ri, si, mr) || ((t = [1, 0, 0, 0, 1, 0, 0, 0, 1]), !is(t, ii, ri, si, mr))
      ? !1
      : (gr.crossVectors(vn, xn), (t = [gr.x, gr.y, gr.z]), is(t, ii, ri, si, mr));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, qt).distanceTo(e);
  }
  getBoundingSphere(e) {
    return (
      this.isEmpty()
        ? e.makeEmpty()
        : (this.getCenter(e.center), (e.radius = this.getSize(qt).length() * 0.5)),
      e
    );
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty()
      ? this
      : (cn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e),
        cn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e),
        cn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e),
        cn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e),
        cn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e),
        cn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e),
        cn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e),
        cn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e),
        this.setFromPoints(cn),
        this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
  toJSON() {
    return { min: this.min.toArray(), max: this.max.toArray() };
  }
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
  }
}
const cn = [new F(), new F(), new F(), new F(), new F(), new F(), new F(), new F()],
  qt = new F(),
  pr = new Qn(),
  ii = new F(),
  ri = new F(),
  si = new F(),
  vn = new F(),
  xn = new F(),
  Fn = new F(),
  Bi = new F(),
  mr = new F(),
  gr = new F(),
  On = new F();
function is(i, e, t, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    On.fromArray(i, s);
    const o = r.x * Math.abs(On.x) + r.y * Math.abs(On.y) + r.z * Math.abs(On.z),
      l = e.dot(On),
      c = t.dot(On),
      u = n.dot(On);
    if (Math.max(-Math.max(l, c, u), Math.min(l, c, u)) > o) return !1;
  }
  return !0;
}
const Ah = new Qn(),
  zi = new F(),
  rs = new F();
class sr {
  constructor(e = new F(), t = -1) {
    (this.isSphere = !0), (this.center = e), (this.radius = t);
  }
  set(e, t) {
    return this.center.copy(e), (this.radius = t), this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Ah.setFromPoints(e).getCenter(n);
    let r = 0;
    for (let s = 0, a = e.length; s < a; s++) r = Math.max(r, n.distanceToSquared(e[s]));
    return (this.radius = Math.sqrt(r)), this;
  }
  copy(e) {
    return this.center.copy(e.center), (this.radius = e.radius), this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), (this.radius = -1), this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return (
      t.copy(e),
      n > this.radius * this.radius &&
        (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)),
      t
    );
  }
  getBoundingBox(e) {
    return this.isEmpty()
      ? (e.makeEmpty(), e)
      : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), (this.radius = this.radius * e.getMaxScaleOnAxis()), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty()) return this.center.copy(e), (this.radius = 0), this;
    zi.subVectors(e, this.center);
    const t = zi.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t),
        r = (n - this.radius) * 0.5;
      this.center.addScaledVector(zi, r / n), (this.radius += r);
    }
    return this;
  }
  union(e) {
    return e.isEmpty()
      ? this
      : this.isEmpty()
        ? (this.copy(e), this)
        : (this.center.equals(e.center) === !0
            ? (this.radius = Math.max(this.radius, e.radius))
            : (rs.subVectors(e.center, this.center).setLength(e.radius),
              this.expandByPoint(zi.copy(e.center).add(rs)),
              this.expandByPoint(zi.copy(e.center).sub(rs))),
          this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return { radius: this.radius, center: this.center.toArray() };
  }
  fromJSON(e) {
    return (this.radius = e.radius), this.center.fromArray(e.center), this;
  }
}
const hn = new F(),
  ss = new F(),
  _r = new F(),
  Mn = new F(),
  as = new F(),
  vr = new F(),
  os = new F();
class Dl {
  constructor(e = new F(), t = new F(0, 0, -1)) {
    (this.origin = e), (this.direction = t);
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, hn)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = hn.subVectors(e, this.origin).dot(this.direction);
    return t < 0
      ? this.origin.distanceToSquared(e)
      : (hn.copy(this.origin).addScaledVector(this.direction, t), hn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, r) {
    ss.copy(e).add(t).multiplyScalar(0.5),
      _r.copy(t).sub(e).normalize(),
      Mn.copy(this.origin).sub(ss);
    const s = e.distanceTo(t) * 0.5,
      a = -this.direction.dot(_r),
      o = Mn.dot(this.direction),
      l = -Mn.dot(_r),
      c = Mn.lengthSq(),
      u = Math.abs(1 - a * a);
    let h, f, m, g;
    if (u > 0)
      if (((h = a * l - o), (f = a * o - l), (g = s * u), h >= 0))
        if (f >= -g)
          if (f <= g) {
            const S = 1 / u;
            (h *= S), (f *= S), (m = h * (h + a * f + 2 * o) + f * (a * h + f + 2 * l) + c);
          } else (f = s), (h = Math.max(0, -(a * f + o))), (m = -h * h + f * (f + 2 * l) + c);
        else (f = -s), (h = Math.max(0, -(a * f + o))), (m = -h * h + f * (f + 2 * l) + c);
      else
        f <= -g
          ? ((h = Math.max(0, -(-a * s + o))),
            (f = h > 0 ? -s : Math.min(Math.max(-s, -l), s)),
            (m = -h * h + f * (f + 2 * l) + c))
          : f <= g
            ? ((h = 0), (f = Math.min(Math.max(-s, -l), s)), (m = f * (f + 2 * l) + c))
            : ((h = Math.max(0, -(a * s + o))),
              (f = h > 0 ? s : Math.min(Math.max(-s, -l), s)),
              (m = -h * h + f * (f + 2 * l) + c));
    else (f = a > 0 ? -s : s), (h = Math.max(0, -(a * f + o))), (m = -h * h + f * (f + 2 * l) + c);
    return (
      n && n.copy(this.origin).addScaledVector(this.direction, h),
      r && r.copy(ss).addScaledVector(_r, f),
      m
    );
  }
  intersectSphere(e, t) {
    hn.subVectors(e.center, this.origin);
    const n = hn.dot(this.direction),
      r = hn.dot(hn) - n * n,
      s = e.radius * e.radius;
    if (r > s) return null;
    const a = Math.sqrt(s - r),
      o = n - a,
      l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t);
  }
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, r, s, a, o, l;
    const c = 1 / this.direction.x,
      u = 1 / this.direction.y,
      h = 1 / this.direction.z,
      f = this.origin;
    return (
      c >= 0
        ? ((n = (e.min.x - f.x) * c), (r = (e.max.x - f.x) * c))
        : ((n = (e.max.x - f.x) * c), (r = (e.min.x - f.x) * c)),
      u >= 0
        ? ((s = (e.min.y - f.y) * u), (a = (e.max.y - f.y) * u))
        : ((s = (e.max.y - f.y) * u), (a = (e.min.y - f.y) * u)),
      n > a ||
      s > r ||
      ((s > n || isNaN(n)) && (n = s),
      (a < r || isNaN(r)) && (r = a),
      h >= 0
        ? ((o = (e.min.z - f.z) * h), (l = (e.max.z - f.z) * h))
        : ((o = (e.max.z - f.z) * h), (l = (e.min.z - f.z) * h)),
      n > l || o > r) ||
      ((o > n || n !== n) && (n = o), (l < r || r !== r) && (r = l), r < 0)
        ? null
        : this.at(n >= 0 ? n : r, t)
    );
  }
  intersectsBox(e) {
    return this.intersectBox(e, hn) !== null;
  }
  intersectTriangle(e, t, n, r, s) {
    as.subVectors(t, e), vr.subVectors(n, e), os.crossVectors(as, vr);
    let a = this.direction.dot(os),
      o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0) (o = -1), (a = -a);
    else return null;
    Mn.subVectors(this.origin, e);
    const l = o * this.direction.dot(vr.crossVectors(Mn, vr));
    if (l < 0) return null;
    const c = o * this.direction.dot(as.cross(Mn));
    if (c < 0 || l + c > a) return null;
    const u = -o * Mn.dot(os);
    return u < 0 ? null : this.at(u / a, s);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class rt {
  constructor(e, t, n, r, s, a, o, l, c, u, h, f, m, g, S, p) {
    (rt.prototype.isMatrix4 = !0),
      (this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      e !== void 0 && this.set(e, t, n, r, s, a, o, l, c, u, h, f, m, g, S, p);
  }
  set(e, t, n, r, s, a, o, l, c, u, h, f, m, g, S, p) {
    const d = this.elements;
    return (
      (d[0] = e),
      (d[4] = t),
      (d[8] = n),
      (d[12] = r),
      (d[1] = s),
      (d[5] = a),
      (d[9] = o),
      (d[13] = l),
      (d[2] = c),
      (d[6] = u),
      (d[10] = h),
      (d[14] = f),
      (d[3] = m),
      (d[7] = g),
      (d[11] = S),
      (d[15] = p),
      this
    );
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new rt().fromArray(this.elements);
  }
  copy(e) {
    const t = this.elements,
      n = e.elements;
    return (
      (t[0] = n[0]),
      (t[1] = n[1]),
      (t[2] = n[2]),
      (t[3] = n[3]),
      (t[4] = n[4]),
      (t[5] = n[5]),
      (t[6] = n[6]),
      (t[7] = n[7]),
      (t[8] = n[8]),
      (t[9] = n[9]),
      (t[10] = n[10]),
      (t[11] = n[11]),
      (t[12] = n[12]),
      (t[13] = n[13]),
      (t[14] = n[14]),
      (t[15] = n[15]),
      this
    );
  }
  copyPosition(e) {
    const t = this.elements,
      n = e.elements;
    return (t[12] = n[12]), (t[13] = n[13]), (t[14] = n[14]), this;
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return (
      this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this
    );
  }
  extractBasis(e, t, n) {
    return (
      e.setFromMatrixColumn(this, 0),
      t.setFromMatrixColumn(this, 1),
      n.setFromMatrixColumn(this, 2),
      this
    );
  }
  makeBasis(e, t, n) {
    return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this;
  }
  extractRotation(e) {
    const t = this.elements,
      n = e.elements,
      r = 1 / ai.setFromMatrixColumn(e, 0).length(),
      s = 1 / ai.setFromMatrixColumn(e, 1).length(),
      a = 1 / ai.setFromMatrixColumn(e, 2).length();
    return (
      (t[0] = n[0] * r),
      (t[1] = n[1] * r),
      (t[2] = n[2] * r),
      (t[3] = 0),
      (t[4] = n[4] * s),
      (t[5] = n[5] * s),
      (t[6] = n[6] * s),
      (t[7] = 0),
      (t[8] = n[8] * a),
      (t[9] = n[9] * a),
      (t[10] = n[10] * a),
      (t[11] = 0),
      (t[12] = 0),
      (t[13] = 0),
      (t[14] = 0),
      (t[15] = 1),
      this
    );
  }
  makeRotationFromEuler(e) {
    const t = this.elements,
      n = e.x,
      r = e.y,
      s = e.z,
      a = Math.cos(n),
      o = Math.sin(n),
      l = Math.cos(r),
      c = Math.sin(r),
      u = Math.cos(s),
      h = Math.sin(s);
    if (e.order === 'XYZ') {
      const f = a * u,
        m = a * h,
        g = o * u,
        S = o * h;
      (t[0] = l * u),
        (t[4] = -l * h),
        (t[8] = c),
        (t[1] = m + g * c),
        (t[5] = f - S * c),
        (t[9] = -o * l),
        (t[2] = S - f * c),
        (t[6] = g + m * c),
        (t[10] = a * l);
    } else if (e.order === 'YXZ') {
      const f = l * u,
        m = l * h,
        g = c * u,
        S = c * h;
      (t[0] = f + S * o),
        (t[4] = g * o - m),
        (t[8] = a * c),
        (t[1] = a * h),
        (t[5] = a * u),
        (t[9] = -o),
        (t[2] = m * o - g),
        (t[6] = S + f * o),
        (t[10] = a * l);
    } else if (e.order === 'ZXY') {
      const f = l * u,
        m = l * h,
        g = c * u,
        S = c * h;
      (t[0] = f - S * o),
        (t[4] = -a * h),
        (t[8] = g + m * o),
        (t[1] = m + g * o),
        (t[5] = a * u),
        (t[9] = S - f * o),
        (t[2] = -a * c),
        (t[6] = o),
        (t[10] = a * l);
    } else if (e.order === 'ZYX') {
      const f = a * u,
        m = a * h,
        g = o * u,
        S = o * h;
      (t[0] = l * u),
        (t[4] = g * c - m),
        (t[8] = f * c + S),
        (t[1] = l * h),
        (t[5] = S * c + f),
        (t[9] = m * c - g),
        (t[2] = -c),
        (t[6] = o * l),
        (t[10] = a * l);
    } else if (e.order === 'YZX') {
      const f = a * l,
        m = a * c,
        g = o * l,
        S = o * c;
      (t[0] = l * u),
        (t[4] = S - f * h),
        (t[8] = g * h + m),
        (t[1] = h),
        (t[5] = a * u),
        (t[9] = -o * u),
        (t[2] = -c * u),
        (t[6] = m * h + g),
        (t[10] = f - S * h);
    } else if (e.order === 'XZY') {
      const f = a * l,
        m = a * c,
        g = o * l,
        S = o * c;
      (t[0] = l * u),
        (t[4] = -h),
        (t[8] = c * u),
        (t[1] = f * h + S),
        (t[5] = a * u),
        (t[9] = m * h - g),
        (t[2] = g * h - m),
        (t[6] = o * u),
        (t[10] = S * h + f);
    }
    return (
      (t[3] = 0), (t[7] = 0), (t[11] = 0), (t[12] = 0), (t[13] = 0), (t[14] = 0), (t[15] = 1), this
    );
  }
  makeRotationFromQuaternion(e) {
    return this.compose(wh, e, Rh);
  }
  lookAt(e, t, n) {
    const r = this.elements;
    return (
      Ot.subVectors(e, t),
      Ot.lengthSq() === 0 && (Ot.z = 1),
      Ot.normalize(),
      Sn.crossVectors(n, Ot),
      Sn.lengthSq() === 0 &&
        (Math.abs(n.z) === 1 ? (Ot.x += 1e-4) : (Ot.z += 1e-4),
        Ot.normalize(),
        Sn.crossVectors(n, Ot)),
      Sn.normalize(),
      xr.crossVectors(Ot, Sn),
      (r[0] = Sn.x),
      (r[4] = xr.x),
      (r[8] = Ot.x),
      (r[1] = Sn.y),
      (r[5] = xr.y),
      (r[9] = Ot.y),
      (r[2] = Sn.z),
      (r[6] = xr.z),
      (r[10] = Ot.z),
      this
    );
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements,
      r = t.elements,
      s = this.elements,
      a = n[0],
      o = n[4],
      l = n[8],
      c = n[12],
      u = n[1],
      h = n[5],
      f = n[9],
      m = n[13],
      g = n[2],
      S = n[6],
      p = n[10],
      d = n[14],
      E = n[3],
      b = n[7],
      y = n[11],
      P = n[15],
      R = r[0],
      L = r[4],
      A = r[8],
      x = r[12],
      _ = r[1],
      w = r[5],
      U = r[9],
      z = r[13],
      G = r[2],
      V = r[6],
      X = r[10],
      Z = r[14],
      H = r[3],
      se = r[7],
      ue = r[11],
      Ae = r[15];
    return (
      (s[0] = a * R + o * _ + l * G + c * H),
      (s[4] = a * L + o * w + l * V + c * se),
      (s[8] = a * A + o * U + l * X + c * ue),
      (s[12] = a * x + o * z + l * Z + c * Ae),
      (s[1] = u * R + h * _ + f * G + m * H),
      (s[5] = u * L + h * w + f * V + m * se),
      (s[9] = u * A + h * U + f * X + m * ue),
      (s[13] = u * x + h * z + f * Z + m * Ae),
      (s[2] = g * R + S * _ + p * G + d * H),
      (s[6] = g * L + S * w + p * V + d * se),
      (s[10] = g * A + S * U + p * X + d * ue),
      (s[14] = g * x + S * z + p * Z + d * Ae),
      (s[3] = E * R + b * _ + y * G + P * H),
      (s[7] = E * L + b * w + y * V + P * se),
      (s[11] = E * A + b * U + y * X + P * ue),
      (s[15] = E * x + b * z + y * Z + P * Ae),
      this
    );
  }
  multiplyScalar(e) {
    const t = this.elements;
    return (
      (t[0] *= e),
      (t[4] *= e),
      (t[8] *= e),
      (t[12] *= e),
      (t[1] *= e),
      (t[5] *= e),
      (t[9] *= e),
      (t[13] *= e),
      (t[2] *= e),
      (t[6] *= e),
      (t[10] *= e),
      (t[14] *= e),
      (t[3] *= e),
      (t[7] *= e),
      (t[11] *= e),
      (t[15] *= e),
      this
    );
  }
  determinant() {
    const e = this.elements,
      t = e[0],
      n = e[4],
      r = e[8],
      s = e[12],
      a = e[1],
      o = e[5],
      l = e[9],
      c = e[13],
      u = e[2],
      h = e[6],
      f = e[10],
      m = e[14],
      g = e[3],
      S = e[7],
      p = e[11],
      d = e[15];
    return (
      g * (+s * l * h - r * c * h - s * o * f + n * c * f + r * o * m - n * l * m) +
      S * (+t * l * m - t * c * f + s * a * f - r * a * m + r * c * u - s * l * u) +
      p * (+t * c * h - t * o * m - s * a * h + n * a * m + s * o * u - n * c * u) +
      d * (-r * o * u - t * l * h + t * o * f + r * a * h - n * a * f + n * l * u)
    );
  }
  transpose() {
    const e = this.elements;
    let t;
    return (
      (t = e[1]),
      (e[1] = e[4]),
      (e[4] = t),
      (t = e[2]),
      (e[2] = e[8]),
      (e[8] = t),
      (t = e[6]),
      (e[6] = e[9]),
      (e[9] = t),
      (t = e[3]),
      (e[3] = e[12]),
      (e[12] = t),
      (t = e[7]),
      (e[7] = e[13]),
      (e[13] = t),
      (t = e[11]),
      (e[11] = e[14]),
      (e[14] = t),
      this
    );
  }
  setPosition(e, t, n) {
    const r = this.elements;
    return (
      e.isVector3
        ? ((r[12] = e.x), (r[13] = e.y), (r[14] = e.z))
        : ((r[12] = e), (r[13] = t), (r[14] = n)),
      this
    );
  }
  invert() {
    const e = this.elements,
      t = e[0],
      n = e[1],
      r = e[2],
      s = e[3],
      a = e[4],
      o = e[5],
      l = e[6],
      c = e[7],
      u = e[8],
      h = e[9],
      f = e[10],
      m = e[11],
      g = e[12],
      S = e[13],
      p = e[14],
      d = e[15],
      E = h * p * c - S * f * c + S * l * m - o * p * m - h * l * d + o * f * d,
      b = g * f * c - u * p * c - g * l * m + a * p * m + u * l * d - a * f * d,
      y = u * S * c - g * h * c + g * o * m - a * S * m - u * o * d + a * h * d,
      P = g * h * l - u * S * l - g * o * f + a * S * f + u * o * p - a * h * p,
      R = t * E + n * b + r * y + s * P;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const L = 1 / R;
    return (
      (e[0] = E * L),
      (e[1] = (S * f * s - h * p * s - S * r * m + n * p * m + h * r * d - n * f * d) * L),
      (e[2] = (o * p * s - S * l * s + S * r * c - n * p * c - o * r * d + n * l * d) * L),
      (e[3] = (h * l * s - o * f * s - h * r * c + n * f * c + o * r * m - n * l * m) * L),
      (e[4] = b * L),
      (e[5] = (u * p * s - g * f * s + g * r * m - t * p * m - u * r * d + t * f * d) * L),
      (e[6] = (g * l * s - a * p * s - g * r * c + t * p * c + a * r * d - t * l * d) * L),
      (e[7] = (a * f * s - u * l * s + u * r * c - t * f * c - a * r * m + t * l * m) * L),
      (e[8] = y * L),
      (e[9] = (g * h * s - u * S * s - g * n * m + t * S * m + u * n * d - t * h * d) * L),
      (e[10] = (a * S * s - g * o * s + g * n * c - t * S * c - a * n * d + t * o * d) * L),
      (e[11] = (u * o * s - a * h * s - u * n * c + t * h * c + a * n * m - t * o * m) * L),
      (e[12] = P * L),
      (e[13] = (u * S * r - g * h * r + g * n * f - t * S * f - u * n * p + t * h * p) * L),
      (e[14] = (g * o * r - a * S * r - g * n * l + t * S * l + a * n * p - t * o * p) * L),
      (e[15] = (a * h * r - u * o * r + u * n * l - t * h * l - a * n * f + t * o * f) * L),
      this
    );
  }
  scale(e) {
    const t = this.elements,
      n = e.x,
      r = e.y,
      s = e.z;
    return (
      (t[0] *= n),
      (t[4] *= r),
      (t[8] *= s),
      (t[1] *= n),
      (t[5] *= r),
      (t[9] *= s),
      (t[2] *= n),
      (t[6] *= r),
      (t[10] *= s),
      (t[3] *= n),
      (t[7] *= r),
      (t[11] *= s),
      this
    );
  }
  getMaxScaleOnAxis() {
    const e = this.elements,
      t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
      n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
      r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, r));
  }
  makeTranslation(e, t, n) {
    return (
      e.isVector3
        ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1)
        : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1),
      this
    );
  }
  makeRotationX(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this;
  }
  makeRotationY(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this;
  }
  makeRotationZ(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  makeRotationAxis(e, t) {
    const n = Math.cos(t),
      r = Math.sin(t),
      s = 1 - n,
      a = e.x,
      o = e.y,
      l = e.z,
      c = s * a,
      u = s * o;
    return (
      this.set(
        c * a + n,
        c * o - r * l,
        c * l + r * o,
        0,
        c * o + r * l,
        u * o + n,
        u * l - r * a,
        0,
        c * l - r * o,
        u * l + r * a,
        s * l * l + n,
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  makeScale(e, t, n) {
    return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
  }
  makeShear(e, t, n, r, s, a) {
    return this.set(1, n, s, 0, e, 1, a, 0, t, r, 1, 0, 0, 0, 0, 1), this;
  }
  compose(e, t, n) {
    const r = this.elements,
      s = t._x,
      a = t._y,
      o = t._z,
      l = t._w,
      c = s + s,
      u = a + a,
      h = o + o,
      f = s * c,
      m = s * u,
      g = s * h,
      S = a * u,
      p = a * h,
      d = o * h,
      E = l * c,
      b = l * u,
      y = l * h,
      P = n.x,
      R = n.y,
      L = n.z;
    return (
      (r[0] = (1 - (S + d)) * P),
      (r[1] = (m + y) * P),
      (r[2] = (g - b) * P),
      (r[3] = 0),
      (r[4] = (m - y) * R),
      (r[5] = (1 - (f + d)) * R),
      (r[6] = (p + E) * R),
      (r[7] = 0),
      (r[8] = (g + b) * L),
      (r[9] = (p - E) * L),
      (r[10] = (1 - (f + S)) * L),
      (r[11] = 0),
      (r[12] = e.x),
      (r[13] = e.y),
      (r[14] = e.z),
      (r[15] = 1),
      this
    );
  }
  decompose(e, t, n) {
    const r = this.elements;
    let s = ai.set(r[0], r[1], r[2]).length();
    const a = ai.set(r[4], r[5], r[6]).length(),
      o = ai.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), (e.x = r[12]), (e.y = r[13]), (e.z = r[14]), $t.copy(this);
    const c = 1 / s,
      u = 1 / a,
      h = 1 / o;
    return (
      ($t.elements[0] *= c),
      ($t.elements[1] *= c),
      ($t.elements[2] *= c),
      ($t.elements[4] *= u),
      ($t.elements[5] *= u),
      ($t.elements[6] *= u),
      ($t.elements[8] *= h),
      ($t.elements[9] *= h),
      ($t.elements[10] *= h),
      t.setFromRotationMatrix($t),
      (n.x = s),
      (n.y = a),
      (n.z = o),
      this
    );
  }
  makePerspective(e, t, n, r, s, a, o = sn, l = !1) {
    const c = this.elements,
      u = (2 * s) / (t - e),
      h = (2 * s) / (n - r),
      f = (t + e) / (t - e),
      m = (n + r) / (n - r);
    let g, S;
    if (l) (g = s / (a - s)), (S = (a * s) / (a - s));
    else if (o === sn) (g = -(a + s) / (a - s)), (S = (-2 * a * s) / (a - s));
    else if (o === Gr) (g = -a / (a - s)), (S = (-a * s) / (a - s));
    else throw new Error('THREE.Matrix4.makePerspective(): Invalid coordinate system: ' + o);
    return (
      (c[0] = u),
      (c[4] = 0),
      (c[8] = f),
      (c[12] = 0),
      (c[1] = 0),
      (c[5] = h),
      (c[9] = m),
      (c[13] = 0),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = g),
      (c[14] = S),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = -1),
      (c[15] = 0),
      this
    );
  }
  makeOrthographic(e, t, n, r, s, a, o = sn, l = !1) {
    const c = this.elements,
      u = 2 / (t - e),
      h = 2 / (n - r),
      f = -(t + e) / (t - e),
      m = -(n + r) / (n - r);
    let g, S;
    if (l) (g = 1 / (a - s)), (S = a / (a - s));
    else if (o === sn) (g = -2 / (a - s)), (S = -(a + s) / (a - s));
    else if (o === Gr) (g = -1 / (a - s)), (S = -s / (a - s));
    else throw new Error('THREE.Matrix4.makeOrthographic(): Invalid coordinate system: ' + o);
    return (
      (c[0] = u),
      (c[4] = 0),
      (c[8] = 0),
      (c[12] = f),
      (c[1] = 0),
      (c[5] = h),
      (c[9] = 0),
      (c[13] = m),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = g),
      (c[14] = S),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = 0),
      (c[15] = 1),
      this
    );
  }
  equals(e) {
    const t = this.elements,
      n = e.elements;
    for (let r = 0; r < 16; r++) if (t[r] !== n[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return (
      (e[t] = n[0]),
      (e[t + 1] = n[1]),
      (e[t + 2] = n[2]),
      (e[t + 3] = n[3]),
      (e[t + 4] = n[4]),
      (e[t + 5] = n[5]),
      (e[t + 6] = n[6]),
      (e[t + 7] = n[7]),
      (e[t + 8] = n[8]),
      (e[t + 9] = n[9]),
      (e[t + 10] = n[10]),
      (e[t + 11] = n[11]),
      (e[t + 12] = n[12]),
      (e[t + 13] = n[13]),
      (e[t + 14] = n[14]),
      (e[t + 15] = n[15]),
      e
    );
  }
}
const ai = new F(),
  $t = new rt(),
  wh = new F(0, 0, 0),
  Rh = new F(1, 1, 1),
  Sn = new F(),
  xr = new F(),
  Ot = new F(),
  go = new rt(),
  _o = new rr();
class on {
  constructor(e = 0, t = 0, n = 0, r = on.DEFAULT_ORDER) {
    (this.isEuler = !0), (this._x = e), (this._y = t), (this._z = n), (this._order = r);
  }
  get x() {
    return this._x;
  }
  set x(e) {
    (this._x = e), this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    (this._y = e), this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    (this._z = e), this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(e) {
    (this._order = e), this._onChangeCallback();
  }
  set(e, t, n, r = this._order) {
    return (
      (this._x = e), (this._y = t), (this._z = n), (this._order = r), this._onChangeCallback(), this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return (
      (this._x = e._x),
      (this._y = e._y),
      (this._z = e._z),
      (this._order = e._order),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const r = e.elements,
      s = r[0],
      a = r[4],
      o = r[8],
      l = r[1],
      c = r[5],
      u = r[9],
      h = r[2],
      f = r[6],
      m = r[10];
    switch (t) {
      case 'XYZ':
        (this._y = Math.asin(Ve(o, -1, 1))),
          Math.abs(o) < 0.9999999
            ? ((this._x = Math.atan2(-u, m)), (this._z = Math.atan2(-a, s)))
            : ((this._x = Math.atan2(f, c)), (this._z = 0));
        break;
      case 'YXZ':
        (this._x = Math.asin(-Ve(u, -1, 1))),
          Math.abs(u) < 0.9999999
            ? ((this._y = Math.atan2(o, m)), (this._z = Math.atan2(l, c)))
            : ((this._y = Math.atan2(-h, s)), (this._z = 0));
        break;
      case 'ZXY':
        (this._x = Math.asin(Ve(f, -1, 1))),
          Math.abs(f) < 0.9999999
            ? ((this._y = Math.atan2(-h, m)), (this._z = Math.atan2(-a, c)))
            : ((this._y = 0), (this._z = Math.atan2(l, s)));
        break;
      case 'ZYX':
        (this._y = Math.asin(-Ve(h, -1, 1))),
          Math.abs(h) < 0.9999999
            ? ((this._x = Math.atan2(f, m)), (this._z = Math.atan2(l, s)))
            : ((this._x = 0), (this._z = Math.atan2(-a, c)));
        break;
      case 'YZX':
        (this._z = Math.asin(Ve(l, -1, 1))),
          Math.abs(l) < 0.9999999
            ? ((this._x = Math.atan2(-u, c)), (this._y = Math.atan2(-h, s)))
            : ((this._x = 0), (this._y = Math.atan2(o, m)));
        break;
      case 'XZY':
        (this._z = Math.asin(-Ve(a, -1, 1))),
          Math.abs(a) < 0.9999999
            ? ((this._x = Math.atan2(f, c)), (this._y = Math.atan2(o, s)))
            : ((this._x = Math.atan2(-u, m)), (this._y = 0));
        break;
      default:
        console.warn('THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + t);
    }
    return (this._order = t), n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return go.makeRotationFromQuaternion(e), this.setFromRotationMatrix(go, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return _o.setFromEuler(this), this.setFromQuaternion(_o, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return (
      (this._x = e[0]),
      (this._y = e[1]),
      (this._z = e[2]),
      e[3] !== void 0 && (this._order = e[3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(e = [], t = 0) {
    return (
      (e[t] = this._x), (e[t + 1] = this._y), (e[t + 2] = this._z), (e[t + 3] = this._order), e
    );
  }
  _onChange(e) {
    return (this._onChangeCallback = e), this;
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
on.DEFAULT_ORDER = 'XYZ';
class Ua {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = ((1 << e) | 0) >>> 0;
  }
  enable(e) {
    this.mask |= (1 << e) | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= (1 << e) | 0;
  }
  disable(e) {
    this.mask &= ~((1 << e) | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & ((1 << e) | 0)) !== 0;
  }
}
let Ch = 0;
const vo = new F(),
  oi = new rr(),
  un = new rt(),
  Mr = new F(),
  ki = new F(),
  Ph = new F(),
  Lh = new rr(),
  xo = new F(1, 0, 0),
  Mo = new F(0, 1, 0),
  So = new F(0, 0, 1),
  yo = { type: 'added' },
  Dh = { type: 'removed' },
  li = { type: 'childadded', child: null },
  ls = { type: 'childremoved', child: null };
class Mt extends Ii {
  constructor() {
    super(),
      (this.isObject3D = !0),
      Object.defineProperty(this, 'id', { value: Ch++ }),
      (this.uuid = Ui()),
      (this.name = ''),
      (this.type = 'Object3D'),
      (this.parent = null),
      (this.children = []),
      (this.up = Mt.DEFAULT_UP.clone());
    const e = new F(),
      t = new on(),
      n = new rr(),
      r = new F(1, 1, 1);
    function s() {
      n.setFromEuler(t, !1);
    }
    function a() {
      t.setFromQuaternion(n, void 0, !1);
    }
    t._onChange(s),
      n._onChange(a),
      Object.defineProperties(this, {
        position: { configurable: !0, enumerable: !0, value: e },
        rotation: { configurable: !0, enumerable: !0, value: t },
        quaternion: { configurable: !0, enumerable: !0, value: n },
        scale: { configurable: !0, enumerable: !0, value: r },
        modelViewMatrix: { value: new rt() },
        normalMatrix: { value: new Oe() },
      }),
      (this.matrix = new rt()),
      (this.matrixWorld = new rt()),
      (this.matrixAutoUpdate = Mt.DEFAULT_MATRIX_AUTO_UPDATE),
      (this.matrixWorldAutoUpdate = Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE),
      (this.matrixWorldNeedsUpdate = !1),
      (this.layers = new Ua()),
      (this.visible = !0),
      (this.castShadow = !1),
      (this.receiveShadow = !1),
      (this.frustumCulled = !0),
      (this.renderOrder = 0),
      (this.animations = []),
      (this.customDepthMaterial = void 0),
      (this.customDistanceMaterial = void 0),
      (this.userData = {});
  }
  onBeforeShadow() {}
  onAfterShadow() {}
  onBeforeRender() {}
  onAfterRender() {}
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(),
      this.matrix.premultiply(e),
      this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, t) {
    return oi.setFromAxisAngle(e, t), this.quaternion.multiply(oi), this;
  }
  rotateOnWorldAxis(e, t) {
    return oi.setFromAxisAngle(e, t), this.quaternion.premultiply(oi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(xo, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Mo, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(So, e);
  }
  translateOnAxis(e, t) {
    return (
      vo.copy(e).applyQuaternion(this.quaternion), this.position.add(vo.multiplyScalar(t)), this
    );
  }
  translateX(e) {
    return this.translateOnAxis(xo, e);
  }
  translateY(e) {
    return this.translateOnAxis(Mo, e);
  }
  translateZ(e) {
    return this.translateOnAxis(So, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(un.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? Mr.copy(e) : Mr.set(e, t, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1),
      ki.setFromMatrixPosition(this.matrixWorld),
      this.isCamera || this.isLight ? un.lookAt(ki, Mr, this.up) : un.lookAt(Mr, ki, this.up),
      this.quaternion.setFromRotationMatrix(un),
      r &&
        (un.extractRotation(r.matrixWorld),
        oi.setFromRotationMatrix(un),
        this.quaternion.premultiply(oi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
      return this;
    }
    return e === this
      ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this)
      : (e && e.isObject3D
          ? (e.removeFromParent(),
            (e.parent = this),
            this.children.push(e),
            e.dispatchEvent(yo),
            (li.child = e),
            this.dispatchEvent(li),
            (li.child = null))
          : console.error('THREE.Object3D.add: object not an instance of THREE.Object3D.', e),
        this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return (
      t !== -1 &&
        ((e.parent = null),
        this.children.splice(t, 1),
        e.dispatchEvent(Dh),
        (ls.child = e),
        this.dispatchEvent(ls),
        (ls.child = null)),
      this
    );
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return (
      this.updateWorldMatrix(!0, !1),
      un.copy(this.matrixWorld).invert(),
      e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), un.multiply(e.parent.matrixWorld)),
      e.applyMatrix4(un),
      e.removeFromParent(),
      (e.parent = this),
      this.children.push(e),
      e.updateWorldMatrix(!1, !0),
      e.dispatchEvent(yo),
      (li.child = e),
      this.dispatchEvent(li),
      (li.child = null),
      this
    );
  }
  getObjectById(e) {
    return this.getObjectByProperty('id', e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty('name', e);
  }
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let n = 0, r = this.children.length; n < r; n++) {
      const a = this.children[n].getObjectByProperty(e, t);
      if (a !== void 0) return a;
    }
  }
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++) r[s].getObjectsByProperty(e, t, n);
    return n;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ki, e, Ph), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ki, Lh, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  raycast() {}
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++) t[n].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++) t[n].traverseVisible(e);
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale),
      (this.matrixWorldNeedsUpdate = !0);
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(),
      (this.matrixWorldNeedsUpdate || e) &&
        (this.matrixWorldAutoUpdate === !0 &&
          (this.parent === null
            ? this.matrixWorld.copy(this.matrix)
            : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)),
        (this.matrixWorldNeedsUpdate = !1),
        (e = !0));
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++) t[n].updateMatrixWorld(e);
  }
  updateWorldMatrix(e, t) {
    const n = this.parent;
    if (
      (e === !0 && n !== null && n.updateWorldMatrix(!0, !1),
      this.matrixAutoUpdate && this.updateMatrix(),
      this.matrixWorldAutoUpdate === !0 &&
        (this.parent === null
          ? this.matrixWorld.copy(this.matrix)
          : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)),
      t === !0)
    ) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++) r[s].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == 'string',
      n = {};
    t &&
      ((e = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {},
      }),
      (n.metadata = { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' }));
    const r = {};
    (r.uuid = this.uuid),
      (r.type = this.type),
      this.name !== '' && (r.name = this.name),
      this.castShadow === !0 && (r.castShadow = !0),
      this.receiveShadow === !0 && (r.receiveShadow = !0),
      this.visible === !1 && (r.visible = !1),
      this.frustumCulled === !1 && (r.frustumCulled = !1),
      this.renderOrder !== 0 && (r.renderOrder = this.renderOrder),
      Object.keys(this.userData).length > 0 && (r.userData = this.userData),
      (r.layers = this.layers.mask),
      (r.matrix = this.matrix.toArray()),
      (r.up = this.up.toArray()),
      this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1),
      this.isInstancedMesh &&
        ((r.type = 'InstancedMesh'),
        (r.count = this.count),
        (r.instanceMatrix = this.instanceMatrix.toJSON()),
        this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())),
      this.isBatchedMesh &&
        ((r.type = 'BatchedMesh'),
        (r.perObjectFrustumCulled = this.perObjectFrustumCulled),
        (r.sortObjects = this.sortObjects),
        (r.drawRanges = this._drawRanges),
        (r.reservedRanges = this._reservedRanges),
        (r.geometryInfo = this._geometryInfo.map((o) => ({
          ...o,
          boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
          boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0,
        }))),
        (r.instanceInfo = this._instanceInfo.map((o) => ({ ...o }))),
        (r.availableInstanceIds = this._availableInstanceIds.slice()),
        (r.availableGeometryIds = this._availableGeometryIds.slice()),
        (r.nextIndexStart = this._nextIndexStart),
        (r.nextVertexStart = this._nextVertexStart),
        (r.geometryCount = this._geometryCount),
        (r.maxInstanceCount = this._maxInstanceCount),
        (r.maxVertexCount = this._maxVertexCount),
        (r.maxIndexCount = this._maxIndexCount),
        (r.geometryInitialized = this._geometryInitialized),
        (r.matricesTexture = this._matricesTexture.toJSON(e)),
        (r.indirectTexture = this._indirectTexture.toJSON(e)),
        this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)),
        this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()),
        this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid;
    }
    if (this.isScene)
      this.background &&
        (this.background.isColor
          ? (r.background = this.background.toJSON())
          : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)),
        this.environment &&
          this.environment.isTexture &&
          this.environment.isRenderTargetTexture !== !0 &&
          (r.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, u = l.length; c < u; c++) {
            const h = l[c];
            s(e.shapes, h);
          }
        else s(e.shapes, l);
      }
    }
    if (
      (this.isSkinnedMesh &&
        ((r.bindMode = this.bindMode),
        (r.bindMatrix = this.bindMatrix.toArray()),
        this.skeleton !== void 0 &&
          (s(e.skeletons, this.skeleton), (r.skeleton = this.skeleton.uuid))),
      this.material !== void 0)
    )
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(s(e.materials, this.material[l]));
        r.material = o;
      } else r.material = s(e.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++)
        r.children.push(this.children[o].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(e.animations, l));
      }
    }
    if (t) {
      const o = a(e.geometries),
        l = a(e.materials),
        c = a(e.textures),
        u = a(e.images),
        h = a(e.shapes),
        f = a(e.skeletons),
        m = a(e.animations),
        g = a(e.nodes);
      o.length > 0 && (n.geometries = o),
        l.length > 0 && (n.materials = l),
        c.length > 0 && (n.textures = c),
        u.length > 0 && (n.images = u),
        h.length > 0 && (n.shapes = h),
        f.length > 0 && (n.skeletons = f),
        m.length > 0 && (n.animations = m),
        g.length > 0 && (n.nodes = g);
    }
    return (n.object = r), n;
    function a(o) {
      const l = [];
      for (const c in o) {
        const u = o[c];
        delete u.metadata, l.push(u);
      }
      return l;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, t = !0) {
    if (
      ((this.name = e.name),
      this.up.copy(e.up),
      this.position.copy(e.position),
      (this.rotation.order = e.rotation.order),
      this.quaternion.copy(e.quaternion),
      this.scale.copy(e.scale),
      this.matrix.copy(e.matrix),
      this.matrixWorld.copy(e.matrixWorld),
      (this.matrixAutoUpdate = e.matrixAutoUpdate),
      (this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate),
      (this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate),
      (this.layers.mask = e.layers.mask),
      (this.visible = e.visible),
      (this.castShadow = e.castShadow),
      (this.receiveShadow = e.receiveShadow),
      (this.frustumCulled = e.frustumCulled),
      (this.renderOrder = e.renderOrder),
      (this.animations = e.animations.slice()),
      (this.userData = JSON.parse(JSON.stringify(e.userData))),
      t === !0)
    )
      for (let n = 0; n < e.children.length; n++) {
        const r = e.children[n];
        this.add(r.clone());
      }
    return this;
  }
}
Mt.DEFAULT_UP = new F(0, 1, 0);
Mt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Yt = new F(),
  dn = new F(),
  cs = new F(),
  fn = new F(),
  ci = new F(),
  hi = new F(),
  bo = new F(),
  hs = new F(),
  us = new F(),
  ds = new F(),
  fs = new dt(),
  ps = new dt(),
  ms = new dt();
class Zt {
  constructor(e = new F(), t = new F(), n = new F()) {
    (this.a = e), (this.b = t), (this.c = n);
  }
  static getNormal(e, t, n, r) {
    r.subVectors(n, t), Yt.subVectors(e, t), r.cross(Yt);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  static getBarycoord(e, t, n, r, s) {
    Yt.subVectors(r, t), dn.subVectors(n, t), cs.subVectors(e, t);
    const a = Yt.dot(Yt),
      o = Yt.dot(dn),
      l = Yt.dot(cs),
      c = dn.dot(dn),
      u = dn.dot(cs),
      h = a * c - o * o;
    if (h === 0) return s.set(0, 0, 0), null;
    const f = 1 / h,
      m = (c * l - o * u) * f,
      g = (a * u - o * l) * f;
    return s.set(1 - m - g, g, m);
  }
  static containsPoint(e, t, n, r) {
    return this.getBarycoord(e, t, n, r, fn) === null
      ? !1
      : fn.x >= 0 && fn.y >= 0 && fn.x + fn.y <= 1;
  }
  static getInterpolation(e, t, n, r, s, a, o, l) {
    return this.getBarycoord(e, t, n, r, fn) === null
      ? ((l.x = 0), (l.y = 0), 'z' in l && (l.z = 0), 'w' in l && (l.w = 0), null)
      : (l.setScalar(0),
        l.addScaledVector(s, fn.x),
        l.addScaledVector(a, fn.y),
        l.addScaledVector(o, fn.z),
        l);
  }
  static getInterpolatedAttribute(e, t, n, r, s, a) {
    return (
      fs.setScalar(0),
      ps.setScalar(0),
      ms.setScalar(0),
      fs.fromBufferAttribute(e, t),
      ps.fromBufferAttribute(e, n),
      ms.fromBufferAttribute(e, r),
      a.setScalar(0),
      a.addScaledVector(fs, s.x),
      a.addScaledVector(ps, s.y),
      a.addScaledVector(ms, s.z),
      a
    );
  }
  static isFrontFacing(e, t, n, r) {
    return Yt.subVectors(n, t), dn.subVectors(e, t), Yt.cross(dn).dot(r) < 0;
  }
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
  }
  setFromPointsAndIndices(e, t, n, r) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
  }
  setFromAttributeAndIndices(e, t, n, r) {
    return (
      this.a.fromBufferAttribute(e, t),
      this.b.fromBufferAttribute(e, n),
      this.c.fromBufferAttribute(e, r),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return (
      Yt.subVectors(this.c, this.b), dn.subVectors(this.a, this.b), Yt.cross(dn).length() * 0.5
    );
  }
  getMidpoint(e) {
    return e
      .addVectors(this.a, this.b)
      .add(this.c)
      .multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return Zt.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return Zt.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, r, s) {
    return Zt.getInterpolation(e, this.a, this.b, this.c, t, n, r, s);
  }
  containsPoint(e) {
    return Zt.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return Zt.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a,
      r = this.b,
      s = this.c;
    let a, o;
    ci.subVectors(r, n), hi.subVectors(s, n), hs.subVectors(e, n);
    const l = ci.dot(hs),
      c = hi.dot(hs);
    if (l <= 0 && c <= 0) return t.copy(n);
    us.subVectors(e, r);
    const u = ci.dot(us),
      h = hi.dot(us);
    if (u >= 0 && h <= u) return t.copy(r);
    const f = l * h - u * c;
    if (f <= 0 && l >= 0 && u <= 0) return (a = l / (l - u)), t.copy(n).addScaledVector(ci, a);
    ds.subVectors(e, s);
    const m = ci.dot(ds),
      g = hi.dot(ds);
    if (g >= 0 && m <= g) return t.copy(s);
    const S = m * c - l * g;
    if (S <= 0 && c >= 0 && g <= 0) return (o = c / (c - g)), t.copy(n).addScaledVector(hi, o);
    const p = u * g - m * h;
    if (p <= 0 && h - u >= 0 && m - g >= 0)
      return (
        bo.subVectors(s, r), (o = (h - u) / (h - u + (m - g))), t.copy(r).addScaledVector(bo, o)
      );
    const d = 1 / (p + S + f);
    return (a = S * d), (o = f * d), t.copy(n).addScaledVector(ci, a).addScaledVector(hi, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const Il = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074,
  },
  yn = { h: 0, s: 0, l: 0 },
  Sr = { h: 0, s: 0, l: 0 };
function gs(i, e, t) {
  return (
    t < 0 && (t += 1),
    t > 1 && (t -= 1),
    t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i
  );
}
class ke {
  constructor(e, t, n) {
    return (this.isColor = !0), (this.r = 1), (this.g = 1), (this.b = 1), this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const r = e;
      r && r.isColor
        ? this.copy(r)
        : typeof r == 'number'
          ? this.setHex(r)
          : typeof r == 'string' && this.setStyle(r);
    } else this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return (this.r = e), (this.g = e), (this.b = e), this;
  }
  setHex(e, t = Ut) {
    return (
      (e = Math.floor(e)),
      (this.r = ((e >> 16) & 255) / 255),
      (this.g = ((e >> 8) & 255) / 255),
      (this.b = (e & 255) / 255),
      Ye.colorSpaceToWorking(this, t),
      this
    );
  }
  setRGB(e, t, n, r = Ye.workingColorSpace) {
    return (this.r = e), (this.g = t), (this.b = n), Ye.colorSpaceToWorking(this, r), this;
  }
  setHSL(e, t, n, r = Ye.workingColorSpace) {
    if (((e = Da(e, 1)), (t = Ve(t, 0, 1)), (n = Ve(n, 0, 1)), t === 0))
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + t) : n + t - n * t,
        a = 2 * n - s;
      (this.r = gs(a, s, e + 1 / 3)), (this.g = gs(a, s, e)), (this.b = gs(a, s, e - 1 / 3));
    }
    return Ye.colorSpaceToWorking(this, r), this;
  }
  setStyle(e, t = Ut) {
    function n(s) {
      s !== void 0 &&
        parseFloat(s) < 1 &&
        console.warn('THREE.Color: Alpha component of ' + e + ' will be ignored.');
    }
    let r;
    if ((r = /^(\w+)\(([^\)]*)\)/.exec(e))) {
      let s;
      const a = r[1],
        o = r[2];
      switch (a) {
        case 'rgb':
        case 'rgba':
          if ((s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)))
            return (
              n(s[4]),
              this.setRGB(
                Math.min(255, parseInt(s[1], 10)) / 255,
                Math.min(255, parseInt(s[2], 10)) / 255,
                Math.min(255, parseInt(s[3], 10)) / 255,
                t,
              )
            );
          if ((s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)))
            return (
              n(s[4]),
              this.setRGB(
                Math.min(100, parseInt(s[1], 10)) / 100,
                Math.min(100, parseInt(s[2], 10)) / 100,
                Math.min(100, parseInt(s[3], 10)) / 100,
                t,
              )
            );
          break;
        case 'hsl':
        case 'hsla':
          if (
            (s =
              /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(s[4]),
              this.setHSL(parseFloat(s[1]) / 360, parseFloat(s[2]) / 100, parseFloat(s[3]) / 100, t)
            );
          break;
        default:
          console.warn('THREE.Color: Unknown color model ' + e);
      }
    } else if ((r = /^\#([A-Fa-f\d]+)$/.exec(e))) {
      const s = r[1],
        a = s.length;
      if (a === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          t,
        );
      if (a === 6) return this.setHex(parseInt(s, 16), t);
      console.warn('THREE.Color: Invalid hex color ' + e);
    } else if (e && e.length > 0) return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = Ut) {
    const n = Il[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn('THREE.Color: Unknown color ' + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return (this.r = e.r), (this.g = e.g), (this.b = e.b), this;
  }
  copySRGBToLinear(e) {
    return (this.r = mn(e.r)), (this.g = mn(e.g)), (this.b = mn(e.b)), this;
  }
  copyLinearToSRGB(e) {
    return (this.r = yi(e.r)), (this.g = yi(e.g)), (this.b = yi(e.b)), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Ut) {
    return (
      Ye.workingToColorSpace(Tt.copy(this), e),
      Math.round(Ve(Tt.r * 255, 0, 255)) * 65536 +
        Math.round(Ve(Tt.g * 255, 0, 255)) * 256 +
        Math.round(Ve(Tt.b * 255, 0, 255))
    );
  }
  getHexString(e = Ut) {
    return ('000000' + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = Ye.workingColorSpace) {
    Ye.workingToColorSpace(Tt.copy(this), t);
    const n = Tt.r,
      r = Tt.g,
      s = Tt.b,
      a = Math.max(n, r, s),
      o = Math.min(n, r, s);
    let l, c;
    const u = (o + a) / 2;
    if (o === a) (l = 0), (c = 0);
    else {
      const h = a - o;
      switch (((c = u <= 0.5 ? h / (a + o) : h / (2 - a - o)), a)) {
        case n:
          l = (r - s) / h + (r < s ? 6 : 0);
          break;
        case r:
          l = (s - n) / h + 2;
          break;
        case s:
          l = (n - r) / h + 4;
          break;
      }
      l /= 6;
    }
    return (e.h = l), (e.s = c), (e.l = u), e;
  }
  getRGB(e, t = Ye.workingColorSpace) {
    return Ye.workingToColorSpace(Tt.copy(this), t), (e.r = Tt.r), (e.g = Tt.g), (e.b = Tt.b), e;
  }
  getStyle(e = Ut) {
    Ye.workingToColorSpace(Tt.copy(this), e);
    const t = Tt.r,
      n = Tt.g,
      r = Tt.b;
    return e !== Ut
      ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`
      : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(yn), this.setHSL(yn.h + e, yn.s + t, yn.l + n);
  }
  add(e) {
    return (this.r += e.r), (this.g += e.g), (this.b += e.b), this;
  }
  addColors(e, t) {
    return (this.r = e.r + t.r), (this.g = e.g + t.g), (this.b = e.b + t.b), this;
  }
  addScalar(e) {
    return (this.r += e), (this.g += e), (this.b += e), this;
  }
  sub(e) {
    return (
      (this.r = Math.max(0, this.r - e.r)),
      (this.g = Math.max(0, this.g - e.g)),
      (this.b = Math.max(0, this.b - e.b)),
      this
    );
  }
  multiply(e) {
    return (this.r *= e.r), (this.g *= e.g), (this.b *= e.b), this;
  }
  multiplyScalar(e) {
    return (this.r *= e), (this.g *= e), (this.b *= e), this;
  }
  lerp(e, t) {
    return (
      (this.r += (e.r - this.r) * t),
      (this.g += (e.g - this.g) * t),
      (this.b += (e.b - this.b) * t),
      this
    );
  }
  lerpColors(e, t, n) {
    return (
      (this.r = e.r + (t.r - e.r) * n),
      (this.g = e.g + (t.g - e.g) * n),
      (this.b = e.b + (t.b - e.b) * n),
      this
    );
  }
  lerpHSL(e, t) {
    this.getHSL(yn), e.getHSL(Sr);
    const n = qi(yn.h, Sr.h, t),
      r = qi(yn.s, Sr.s, t),
      s = qi(yn.l, Sr.l, t);
    return this.setHSL(n, r, s), this;
  }
  setFromVector3(e) {
    return (this.r = e.x), (this.g = e.y), (this.b = e.z), this;
  }
  applyMatrix3(e) {
    const t = this.r,
      n = this.g,
      r = this.b,
      s = e.elements;
    return (
      (this.r = s[0] * t + s[3] * n + s[6] * r),
      (this.g = s[1] * t + s[4] * n + s[7] * r),
      (this.b = s[2] * t + s[5] * n + s[8] * r),
      this
    );
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return (this.r = e[t]), (this.g = e[t + 1]), (this.b = e[t + 2]), this;
  }
  toArray(e = [], t = 0) {
    return (e[t] = this.r), (e[t + 1] = this.g), (e[t + 2] = this.b), e;
  }
  fromBufferAttribute(e, t) {
    return (this.r = e.getX(t)), (this.g = e.getY(t)), (this.b = e.getZ(t)), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const Tt = new ke();
ke.NAMES = Il;
let Ih = 0;
class ar extends Ii {
  constructor() {
    super(),
      (this.isMaterial = !0),
      Object.defineProperty(this, 'id', { value: Ih++ }),
      (this.uuid = Ui()),
      (this.name = ''),
      (this.type = 'Material'),
      (this.blending = Si),
      (this.side = Pn),
      (this.vertexColors = !1),
      (this.opacity = 1),
      (this.transparent = !1),
      (this.alphaHash = !1),
      (this.blendSrc = Ds),
      (this.blendDst = Is),
      (this.blendEquation = Wn),
      (this.blendSrcAlpha = null),
      (this.blendDstAlpha = null),
      (this.blendEquationAlpha = null),
      (this.blendColor = new ke(0, 0, 0)),
      (this.blendAlpha = 0),
      (this.depthFunc = Ai),
      (this.depthTest = !0),
      (this.depthWrite = !0),
      (this.stencilWriteMask = 255),
      (this.stencilFunc = oo),
      (this.stencilRef = 0),
      (this.stencilFuncMask = 255),
      (this.stencilFail = ti),
      (this.stencilZFail = ti),
      (this.stencilZPass = ti),
      (this.stencilWrite = !1),
      (this.clippingPlanes = null),
      (this.clipIntersection = !1),
      (this.clipShadows = !1),
      (this.shadowSide = null),
      (this.colorWrite = !0),
      (this.precision = null),
      (this.polygonOffset = !1),
      (this.polygonOffsetFactor = 0),
      (this.polygonOffsetUnits = 0),
      (this.dithering = !1),
      (this.alphaToCoverage = !1),
      (this.premultipliedAlpha = !1),
      (this.forceSinglePass = !1),
      (this.allowOverride = !0),
      (this.visible = !0),
      (this.toneMapped = !0),
      (this.userData = {}),
      (this.version = 0),
      (this._alphaTest = 0);
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, (this._alphaTest = e);
  }
  onBeforeRender() {}
  onBeforeCompile() {}
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const r = this[t];
        if (r === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        r && r.isColor
          ? r.set(n)
          : r && r.isVector3 && n && n.isVector3
            ? r.copy(n)
            : (this[t] = n);
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == 'string';
    t && (e = { textures: {}, images: {} });
    const n = { metadata: { version: 4.7, type: 'Material', generator: 'Material.toJSON' } };
    (n.uuid = this.uuid),
      (n.type = this.type),
      this.name !== '' && (n.name = this.name),
      this.color && this.color.isColor && (n.color = this.color.getHex()),
      this.roughness !== void 0 && (n.roughness = this.roughness),
      this.metalness !== void 0 && (n.metalness = this.metalness),
      this.sheen !== void 0 && (n.sheen = this.sheen),
      this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()),
      this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness),
      this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()),
      this.emissiveIntensity !== void 0 &&
        this.emissiveIntensity !== 1 &&
        (n.emissiveIntensity = this.emissiveIntensity),
      this.specular && this.specular.isColor && (n.specular = this.specular.getHex()),
      this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity),
      this.specularColor &&
        this.specularColor.isColor &&
        (n.specularColor = this.specularColor.getHex()),
      this.shininess !== void 0 && (n.shininess = this.shininess),
      this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat),
      this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness),
      this.clearcoatMap &&
        this.clearcoatMap.isTexture &&
        (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid),
      this.clearcoatRoughnessMap &&
        this.clearcoatRoughnessMap.isTexture &&
        (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid),
      this.clearcoatNormalMap &&
        this.clearcoatNormalMap.isTexture &&
        ((n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid),
        (n.clearcoatNormalScale = this.clearcoatNormalScale.toArray())),
      this.sheenColorMap &&
        this.sheenColorMap.isTexture &&
        (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid),
      this.sheenRoughnessMap &&
        this.sheenRoughnessMap.isTexture &&
        (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid),
      this.dispersion !== void 0 && (n.dispersion = this.dispersion),
      this.iridescence !== void 0 && (n.iridescence = this.iridescence),
      this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR),
      this.iridescenceThicknessRange !== void 0 &&
        (n.iridescenceThicknessRange = this.iridescenceThicknessRange),
      this.iridescenceMap &&
        this.iridescenceMap.isTexture &&
        (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid),
      this.iridescenceThicknessMap &&
        this.iridescenceThicknessMap.isTexture &&
        (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid),
      this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy),
      this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation),
      this.anisotropyMap &&
        this.anisotropyMap.isTexture &&
        (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid),
      this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid),
      this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid),
      this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid),
      this.lightMap &&
        this.lightMap.isTexture &&
        ((n.lightMap = this.lightMap.toJSON(e).uuid),
        (n.lightMapIntensity = this.lightMapIntensity)),
      this.aoMap &&
        this.aoMap.isTexture &&
        ((n.aoMap = this.aoMap.toJSON(e).uuid), (n.aoMapIntensity = this.aoMapIntensity)),
      this.bumpMap &&
        this.bumpMap.isTexture &&
        ((n.bumpMap = this.bumpMap.toJSON(e).uuid), (n.bumpScale = this.bumpScale)),
      this.normalMap &&
        this.normalMap.isTexture &&
        ((n.normalMap = this.normalMap.toJSON(e).uuid),
        (n.normalMapType = this.normalMapType),
        (n.normalScale = this.normalScale.toArray())),
      this.displacementMap &&
        this.displacementMap.isTexture &&
        ((n.displacementMap = this.displacementMap.toJSON(e).uuid),
        (n.displacementScale = this.displacementScale),
        (n.displacementBias = this.displacementBias)),
      this.roughnessMap &&
        this.roughnessMap.isTexture &&
        (n.roughnessMap = this.roughnessMap.toJSON(e).uuid),
      this.metalnessMap &&
        this.metalnessMap.isTexture &&
        (n.metalnessMap = this.metalnessMap.toJSON(e).uuid),
      this.emissiveMap &&
        this.emissiveMap.isTexture &&
        (n.emissiveMap = this.emissiveMap.toJSON(e).uuid),
      this.specularMap &&
        this.specularMap.isTexture &&
        (n.specularMap = this.specularMap.toJSON(e).uuid),
      this.specularIntensityMap &&
        this.specularIntensityMap.isTexture &&
        (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid),
      this.specularColorMap &&
        this.specularColorMap.isTexture &&
        (n.specularColorMap = this.specularColorMap.toJSON(e).uuid),
      this.envMap &&
        this.envMap.isTexture &&
        ((n.envMap = this.envMap.toJSON(e).uuid),
        this.combine !== void 0 && (n.combine = this.combine)),
      this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()),
      this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity),
      this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity),
      this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio),
      this.gradientMap &&
        this.gradientMap.isTexture &&
        (n.gradientMap = this.gradientMap.toJSON(e).uuid),
      this.transmission !== void 0 && (n.transmission = this.transmission),
      this.transmissionMap &&
        this.transmissionMap.isTexture &&
        (n.transmissionMap = this.transmissionMap.toJSON(e).uuid),
      this.thickness !== void 0 && (n.thickness = this.thickness),
      this.thicknessMap &&
        this.thicknessMap.isTexture &&
        (n.thicknessMap = this.thicknessMap.toJSON(e).uuid),
      this.attenuationDistance !== void 0 &&
        this.attenuationDistance !== 1 / 0 &&
        (n.attenuationDistance = this.attenuationDistance),
      this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()),
      this.size !== void 0 && (n.size = this.size),
      this.shadowSide !== null && (n.shadowSide = this.shadowSide),
      this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation),
      this.blending !== Si && (n.blending = this.blending),
      this.side !== Pn && (n.side = this.side),
      this.vertexColors === !0 && (n.vertexColors = !0),
      this.opacity < 1 && (n.opacity = this.opacity),
      this.transparent === !0 && (n.transparent = !0),
      this.blendSrc !== Ds && (n.blendSrc = this.blendSrc),
      this.blendDst !== Is && (n.blendDst = this.blendDst),
      this.blendEquation !== Wn && (n.blendEquation = this.blendEquation),
      this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha),
      this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha),
      this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha),
      this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()),
      this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha),
      this.depthFunc !== Ai && (n.depthFunc = this.depthFunc),
      this.depthTest === !1 && (n.depthTest = this.depthTest),
      this.depthWrite === !1 && (n.depthWrite = this.depthWrite),
      this.colorWrite === !1 && (n.colorWrite = this.colorWrite),
      this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask),
      this.stencilFunc !== oo && (n.stencilFunc = this.stencilFunc),
      this.stencilRef !== 0 && (n.stencilRef = this.stencilRef),
      this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask),
      this.stencilFail !== ti && (n.stencilFail = this.stencilFail),
      this.stencilZFail !== ti && (n.stencilZFail = this.stencilZFail),
      this.stencilZPass !== ti && (n.stencilZPass = this.stencilZPass),
      this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite),
      this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation),
      this.polygonOffset === !0 && (n.polygonOffset = !0),
      this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor),
      this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits),
      this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth),
      this.dashSize !== void 0 && (n.dashSize = this.dashSize),
      this.gapSize !== void 0 && (n.gapSize = this.gapSize),
      this.scale !== void 0 && (n.scale = this.scale),
      this.dithering === !0 && (n.dithering = !0),
      this.alphaTest > 0 && (n.alphaTest = this.alphaTest),
      this.alphaHash === !0 && (n.alphaHash = !0),
      this.alphaToCoverage === !0 && (n.alphaToCoverage = !0),
      this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0),
      this.forceSinglePass === !0 && (n.forceSinglePass = !0),
      this.wireframe === !0 && (n.wireframe = !0),
      this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth),
      this.wireframeLinecap !== 'round' && (n.wireframeLinecap = this.wireframeLinecap),
      this.wireframeLinejoin !== 'round' && (n.wireframeLinejoin = this.wireframeLinejoin),
      this.flatShading === !0 && (n.flatShading = !0),
      this.visible === !1 && (n.visible = !1),
      this.toneMapped === !1 && (n.toneMapped = !1),
      this.fog === !1 && (n.fog = !1),
      Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function r(s) {
      const a = [];
      for (const o in s) {
        const l = s[o];
        delete l.metadata, a.push(l);
      }
      return a;
    }
    if (t) {
      const s = r(e.textures),
        a = r(e.images);
      s.length > 0 && (n.textures = s), a.length > 0 && (n.images = a);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    (this.name = e.name),
      (this.blending = e.blending),
      (this.side = e.side),
      (this.vertexColors = e.vertexColors),
      (this.opacity = e.opacity),
      (this.transparent = e.transparent),
      (this.blendSrc = e.blendSrc),
      (this.blendDst = e.blendDst),
      (this.blendEquation = e.blendEquation),
      (this.blendSrcAlpha = e.blendSrcAlpha),
      (this.blendDstAlpha = e.blendDstAlpha),
      (this.blendEquationAlpha = e.blendEquationAlpha),
      this.blendColor.copy(e.blendColor),
      (this.blendAlpha = e.blendAlpha),
      (this.depthFunc = e.depthFunc),
      (this.depthTest = e.depthTest),
      (this.depthWrite = e.depthWrite),
      (this.stencilWriteMask = e.stencilWriteMask),
      (this.stencilFunc = e.stencilFunc),
      (this.stencilRef = e.stencilRef),
      (this.stencilFuncMask = e.stencilFuncMask),
      (this.stencilFail = e.stencilFail),
      (this.stencilZFail = e.stencilZFail),
      (this.stencilZPass = e.stencilZPass),
      (this.stencilWrite = e.stencilWrite);
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const r = t.length;
      n = new Array(r);
      for (let s = 0; s !== r; ++s) n[s] = t[s].clone();
    }
    return (
      (this.clippingPlanes = n),
      (this.clipIntersection = e.clipIntersection),
      (this.clipShadows = e.clipShadows),
      (this.shadowSide = e.shadowSide),
      (this.colorWrite = e.colorWrite),
      (this.precision = e.precision),
      (this.polygonOffset = e.polygonOffset),
      (this.polygonOffsetFactor = e.polygonOffsetFactor),
      (this.polygonOffsetUnits = e.polygonOffsetUnits),
      (this.dithering = e.dithering),
      (this.alphaTest = e.alphaTest),
      (this.alphaHash = e.alphaHash),
      (this.alphaToCoverage = e.alphaToCoverage),
      (this.premultipliedAlpha = e.premultipliedAlpha),
      (this.forceSinglePass = e.forceSinglePass),
      (this.visible = e.visible),
      (this.toneMapped = e.toneMapped),
      (this.userData = JSON.parse(JSON.stringify(e.userData))),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}
class Ul extends ar {
  constructor(e) {
    super(),
      (this.isMeshBasicMaterial = !0),
      (this.type = 'MeshBasicMaterial'),
      (this.color = new ke(16777215)),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.specularMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new on()),
      (this.combine = vl),
      (this.reflectivity = 1),
      (this.refractionRatio = 0.98),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = 'round'),
      (this.wireframeLinejoin = 'round'),
      (this.fog = !0),
      this.setValues(e);
  }
  copy(e) {
    return (
      super.copy(e),
      this.color.copy(e.color),
      (this.map = e.map),
      (this.lightMap = e.lightMap),
      (this.lightMapIntensity = e.lightMapIntensity),
      (this.aoMap = e.aoMap),
      (this.aoMapIntensity = e.aoMapIntensity),
      (this.specularMap = e.specularMap),
      (this.alphaMap = e.alphaMap),
      (this.envMap = e.envMap),
      this.envMapRotation.copy(e.envMapRotation),
      (this.combine = e.combine),
      (this.reflectivity = e.reflectivity),
      (this.refractionRatio = e.refractionRatio),
      (this.wireframe = e.wireframe),
      (this.wireframeLinewidth = e.wireframeLinewidth),
      (this.wireframeLinecap = e.wireframeLinecap),
      (this.wireframeLinejoin = e.wireframeLinejoin),
      (this.fog = e.fog),
      this
    );
  }
}
const pt = new F(),
  yr = new We();
let Uh = 0;
class kt {
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
    (this.isBufferAttribute = !0),
      Object.defineProperty(this, 'id', { value: Uh++ }),
      (this.name = ''),
      (this.array = e),
      (this.itemSize = t),
      (this.count = e !== void 0 ? e.length / t : 0),
      (this.normalized = n),
      (this.usage = lo),
      (this.updateRanges = []),
      (this.gpuType = rn),
      (this.version = 0);
  }
  onUploadCallback() {}
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return (this.usage = e), this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return (
      (this.name = e.name),
      (this.array = new e.array.constructor(e.array)),
      (this.itemSize = e.itemSize),
      (this.count = e.count),
      (this.normalized = e.normalized),
      (this.usage = e.usage),
      (this.gpuType = e.gpuType),
      this
    );
  }
  copyAt(e, t, n) {
    (e *= this.itemSize), (n *= t.itemSize);
    for (let r = 0, s = this.itemSize; r < s; r++) this.array[e + r] = t.array[n + r];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++)
        yr.fromBufferAttribute(this, t), yr.applyMatrix3(e), this.setXY(t, yr.x, yr.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        pt.fromBufferAttribute(this, t), pt.applyMatrix3(e), this.setXYZ(t, pt.x, pt.y, pt.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      pt.fromBufferAttribute(this, t), pt.applyMatrix4(e), this.setXYZ(t, pt.x, pt.y, pt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      pt.fromBufferAttribute(this, t), pt.applyNormalMatrix(e), this.setXYZ(t, pt.x, pt.y, pt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      pt.fromBufferAttribute(this, t), pt.transformDirection(e), this.setXYZ(t, pt.x, pt.y, pt.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = xi(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return (
      this.normalized && (n = Ct(n, this.array)), (this.array[e * this.itemSize + t] = n), this
    );
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = xi(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize] = t), this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = xi(t, this.array)), t;
  }
  setY(e, t) {
    return (
      this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 1] = t), this
    );
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = xi(t, this.array)), t;
  }
  setZ(e, t) {
    return (
      this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 2] = t), this
    );
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = xi(t, this.array)), t;
  }
  setW(e, t) {
    return (
      this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 3] = t), this
    );
  }
  setXY(e, t, n) {
    return (
      (e *= this.itemSize),
      this.normalized && ((t = Ct(t, this.array)), (n = Ct(n, this.array))),
      (this.array[e + 0] = t),
      (this.array[e + 1] = n),
      this
    );
  }
  setXYZ(e, t, n, r) {
    return (
      (e *= this.itemSize),
      this.normalized &&
        ((t = Ct(t, this.array)), (n = Ct(n, this.array)), (r = Ct(r, this.array))),
      (this.array[e + 0] = t),
      (this.array[e + 1] = n),
      (this.array[e + 2] = r),
      this
    );
  }
  setXYZW(e, t, n, r, s) {
    return (
      (e *= this.itemSize),
      this.normalized &&
        ((t = Ct(t, this.array)),
        (n = Ct(n, this.array)),
        (r = Ct(r, this.array)),
        (s = Ct(s, this.array))),
      (this.array[e + 0] = t),
      (this.array[e + 1] = n),
      (this.array[e + 2] = r),
      (this.array[e + 3] = s),
      this
    );
  }
  onUpload(e) {
    return (this.onUploadCallback = e), this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized,
    };
    return this.name !== '' && (e.name = this.name), this.usage !== lo && (e.usage = this.usage), e;
  }
}
class Nl extends kt {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Fl extends kt {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class wt extends kt {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let Nh = 0;
const Vt = new rt(),
  _s = new Mt(),
  ui = new F(),
  Bt = new Qn(),
  Hi = new Qn(),
  vt = new F();
class Jt extends Ii {
  constructor() {
    super(),
      (this.isBufferGeometry = !0),
      Object.defineProperty(this, 'id', { value: Nh++ }),
      (this.uuid = Ui()),
      (this.name = ''),
      (this.type = 'BufferGeometry'),
      (this.index = null),
      (this.indirect = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.morphTargetsRelative = !1),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null),
      (this.drawRange = { start: 0, count: 1 / 0 }),
      (this.userData = {});
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? (this.index = new (Pl(e) ? Fl : Nl)(e, 1)) : (this.index = e), this;
  }
  setIndirect(e) {
    return (this.indirect = e), this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, t) {
    return (this.attributes[e] = t), this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, t, n = 0) {
    this.groups.push({ start: e, count: t, materialIndex: n });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, t) {
    (this.drawRange.start = e), (this.drawRange.count = t);
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), (t.needsUpdate = !0));
    const n = this.attributes.normal;
    if (n !== void 0) {
      const s = new Oe().getNormalMatrix(e);
      n.applyNormalMatrix(s), (n.needsUpdate = !0);
    }
    const r = this.attributes.tangent;
    return (
      r !== void 0 && (r.transformDirection(e), (r.needsUpdate = !0)),
      this.boundingBox !== null && this.computeBoundingBox(),
      this.boundingSphere !== null && this.computeBoundingSphere(),
      this
    );
  }
  applyQuaternion(e) {
    return Vt.makeRotationFromQuaternion(e), this.applyMatrix4(Vt), this;
  }
  rotateX(e) {
    return Vt.makeRotationX(e), this.applyMatrix4(Vt), this;
  }
  rotateY(e) {
    return Vt.makeRotationY(e), this.applyMatrix4(Vt), this;
  }
  rotateZ(e) {
    return Vt.makeRotationZ(e), this.applyMatrix4(Vt), this;
  }
  translate(e, t, n) {
    return Vt.makeTranslation(e, t, n), this.applyMatrix4(Vt), this;
  }
  scale(e, t, n) {
    return Vt.makeScale(e, t, n), this.applyMatrix4(Vt), this;
  }
  lookAt(e) {
    return _s.lookAt(e), _s.updateMatrix(), this.applyMatrix4(_s.matrix), this;
  }
  center() {
    return (
      this.computeBoundingBox(),
      this.boundingBox.getCenter(ui).negate(),
      this.translate(ui.x, ui.y, ui.z),
      this
    );
  }
  setFromPoints(e) {
    const t = this.getAttribute('position');
    if (t === void 0) {
      const n = [];
      for (let r = 0, s = e.length; r < s; r++) {
        const a = e[r];
        n.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute('position', new wt(n, 3));
    } else {
      const n = Math.min(e.length, t.count);
      for (let r = 0; r < n; r++) {
        const s = e[r];
        t.setXYZ(r, s.x, s.y, s.z || 0);
      }
      e.length > t.count &&
        console.warn(
          'THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.',
        ),
        (t.needsUpdate = !0);
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Qn());
    const e = this.attributes.position,
      t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error(
        'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.',
        this,
      ),
        this.boundingBox.set(new F(-1 / 0, -1 / 0, -1 / 0), new F(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (e !== void 0) {
      if ((this.boundingBox.setFromBufferAttribute(e), t))
        for (let n = 0, r = t.length; n < r; n++) {
          const s = t[n];
          Bt.setFromBufferAttribute(s),
            this.morphTargetsRelative
              ? (vt.addVectors(this.boundingBox.min, Bt.min),
                this.boundingBox.expandByPoint(vt),
                vt.addVectors(this.boundingBox.max, Bt.max),
                this.boundingBox.expandByPoint(vt))
              : (this.boundingBox.expandByPoint(Bt.min), this.boundingBox.expandByPoint(Bt.max));
        }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) ||
      isNaN(this.boundingBox.min.y) ||
      isNaN(this.boundingBox.min.z)) &&
      console.error(
        'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
        this,
      );
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new sr());
    const e = this.attributes.position,
      t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error(
        'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.',
        this,
      ),
        this.boundingSphere.set(new F(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if ((Bt.setFromBufferAttribute(e), t))
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s];
          Hi.setFromBufferAttribute(o),
            this.morphTargetsRelative
              ? (vt.addVectors(Bt.min, Hi.min),
                Bt.expandByPoint(vt),
                vt.addVectors(Bt.max, Hi.max),
                Bt.expandByPoint(vt))
              : (Bt.expandByPoint(Hi.min), Bt.expandByPoint(Hi.max));
        }
      Bt.getCenter(n);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        vt.fromBufferAttribute(e, s), (r = Math.max(r, n.distanceToSquared(vt)));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s],
            l = this.morphTargetsRelative;
          for (let c = 0, u = o.count; c < u; c++)
            vt.fromBufferAttribute(o, c),
              l && (ui.fromBufferAttribute(e, c), vt.add(ui)),
              (r = Math.max(r, n.distanceToSquared(vt)));
        }
      (this.boundingSphere.radius = Math.sqrt(r)),
        isNaN(this.boundingSphere.radius) &&
          console.error(
            'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
            this,
          );
    }
  }
  computeTangents() {
    const e = this.index,
      t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error(
        'THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)',
      );
      return;
    }
    const n = t.position,
      r = t.normal,
      s = t.uv;
    this.hasAttribute('tangent') === !1 &&
      this.setAttribute('tangent', new kt(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute('tangent'),
      o = [],
      l = [];
    for (let A = 0; A < n.count; A++) (o[A] = new F()), (l[A] = new F());
    const c = new F(),
      u = new F(),
      h = new F(),
      f = new We(),
      m = new We(),
      g = new We(),
      S = new F(),
      p = new F();
    function d(A, x, _) {
      c.fromBufferAttribute(n, A),
        u.fromBufferAttribute(n, x),
        h.fromBufferAttribute(n, _),
        f.fromBufferAttribute(s, A),
        m.fromBufferAttribute(s, x),
        g.fromBufferAttribute(s, _),
        u.sub(c),
        h.sub(c),
        m.sub(f),
        g.sub(f);
      const w = 1 / (m.x * g.y - g.x * m.y);
      isFinite(w) &&
        (S.copy(u).multiplyScalar(g.y).addScaledVector(h, -m.y).multiplyScalar(w),
        p.copy(h).multiplyScalar(m.x).addScaledVector(u, -g.x).multiplyScalar(w),
        o[A].add(S),
        o[x].add(S),
        o[_].add(S),
        l[A].add(p),
        l[x].add(p),
        l[_].add(p));
    }
    let E = this.groups;
    E.length === 0 && (E = [{ start: 0, count: e.count }]);
    for (let A = 0, x = E.length; A < x; ++A) {
      const _ = E[A],
        w = _.start,
        U = _.count;
      for (let z = w, G = w + U; z < G; z += 3) d(e.getX(z + 0), e.getX(z + 1), e.getX(z + 2));
    }
    const b = new F(),
      y = new F(),
      P = new F(),
      R = new F();
    function L(A) {
      P.fromBufferAttribute(r, A), R.copy(P);
      const x = o[A];
      b.copy(x), b.sub(P.multiplyScalar(P.dot(x))).normalize(), y.crossVectors(R, x);
      const w = y.dot(l[A]) < 0 ? -1 : 1;
      a.setXYZW(A, b.x, b.y, b.z, w);
    }
    for (let A = 0, x = E.length; A < x; ++A) {
      const _ = E[A],
        w = _.start,
        U = _.count;
      for (let z = w, G = w + U; z < G; z += 3)
        L(e.getX(z + 0)), L(e.getX(z + 1)), L(e.getX(z + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index,
      t = this.getAttribute('position');
    if (t !== void 0) {
      let n = this.getAttribute('normal');
      if (n === void 0)
        (n = new kt(new Float32Array(t.count * 3), 3)), this.setAttribute('normal', n);
      else for (let f = 0, m = n.count; f < m; f++) n.setXYZ(f, 0, 0, 0);
      const r = new F(),
        s = new F(),
        a = new F(),
        o = new F(),
        l = new F(),
        c = new F(),
        u = new F(),
        h = new F();
      if (e)
        for (let f = 0, m = e.count; f < m; f += 3) {
          const g = e.getX(f + 0),
            S = e.getX(f + 1),
            p = e.getX(f + 2);
          r.fromBufferAttribute(t, g),
            s.fromBufferAttribute(t, S),
            a.fromBufferAttribute(t, p),
            u.subVectors(a, s),
            h.subVectors(r, s),
            u.cross(h),
            o.fromBufferAttribute(n, g),
            l.fromBufferAttribute(n, S),
            c.fromBufferAttribute(n, p),
            o.add(u),
            l.add(u),
            c.add(u),
            n.setXYZ(g, o.x, o.y, o.z),
            n.setXYZ(S, l.x, l.y, l.z),
            n.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let f = 0, m = t.count; f < m; f += 3)
          r.fromBufferAttribute(t, f + 0),
            s.fromBufferAttribute(t, f + 1),
            a.fromBufferAttribute(t, f + 2),
            u.subVectors(a, s),
            h.subVectors(r, s),
            u.cross(h),
            n.setXYZ(f + 0, u.x, u.y, u.z),
            n.setXYZ(f + 1, u.x, u.y, u.z),
            n.setXYZ(f + 2, u.x, u.y, u.z);
      this.normalizeNormals(), (n.needsUpdate = !0);
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      vt.fromBufferAttribute(e, t), vt.normalize(), e.setXYZ(t, vt.x, vt.y, vt.z);
  }
  toNonIndexed() {
    function e(o, l) {
      const c = o.array,
        u = o.itemSize,
        h = o.normalized,
        f = new c.constructor(l.length * u);
      let m = 0,
        g = 0;
      for (let S = 0, p = l.length; S < p; S++) {
        o.isInterleavedBufferAttribute ? (m = l[S] * o.data.stride + o.offset) : (m = l[S] * u);
        for (let d = 0; d < u; d++) f[g++] = c[m++];
      }
      return new kt(f, u, h);
    }
    if (this.index === null)
      return (
        console.warn('THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.'),
        this
      );
    const t = new Jt(),
      n = this.index.array,
      r = this.attributes;
    for (const o in r) {
      const l = r[o],
        c = e(l, n);
      t.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [],
        c = s[o];
      for (let u = 0, h = c.length; u < h; u++) {
        const f = c[u],
          m = e(f, n);
        l.push(m);
      }
      t.morphAttributes[o] = l;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      t.addGroup(c.start, c.count, c.materialIndex);
    }
    return t;
  }
  toJSON() {
    const e = {
      metadata: { version: 4.7, type: 'BufferGeometry', generator: 'BufferGeometry.toJSON' },
    };
    if (
      ((e.uuid = this.uuid),
      (e.type = this.type),
      this.name !== '' && (e.name = this.name),
      Object.keys(this.userData).length > 0 && (e.userData = this.userData),
      this.parameters !== void 0)
    ) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (e[c] = l[c]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null &&
      (e.data.index = {
        type: t.array.constructor.name,
        array: Array.prototype.slice.call(t.array),
      });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      e.data.attributes[l] = c.toJSON(e.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l],
        u = [];
      for (let h = 0, f = c.length; h < f; h++) {
        const m = c[h];
        u.push(m.toJSON(e.data));
      }
      u.length > 0 && ((r[l] = u), (s = !0));
    }
    s && ((e.data.morphAttributes = r), (e.data.morphTargetsRelative = this.morphTargetsRelative));
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = o.toJSON()), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    (this.index = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null);
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone());
    const r = e.attributes;
    for (const c in r) {
      const u = r[c];
      this.setAttribute(c, u.clone(t));
    }
    const s = e.morphAttributes;
    for (const c in s) {
      const u = [],
        h = s[c];
      for (let f = 0, m = h.length; f < m; f++) u.push(h[f].clone(t));
      this.morphAttributes[c] = u;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let c = 0, u = a.length; c < u; c++) {
      const h = a[c];
      this.addGroup(h.start, h.count, h.materialIndex);
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = e.boundingSphere;
    return (
      l !== null && (this.boundingSphere = l.clone()),
      (this.drawRange.start = e.drawRange.start),
      (this.drawRange.count = e.drawRange.count),
      (this.userData = e.userData),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}
const Eo = new rt(),
  Bn = new Dl(),
  br = new sr(),
  To = new F(),
  Er = new F(),
  Tr = new F(),
  Ar = new F(),
  vs = new F(),
  wr = new F(),
  Ao = new F(),
  Rr = new F();
class St extends Mt {
  constructor(e = new Jt(), t = new Ul()) {
    super(),
      (this.isMesh = !0),
      (this.type = 'Mesh'),
      (this.geometry = e),
      (this.material = t),
      (this.morphTargetDictionary = void 0),
      (this.morphTargetInfluences = void 0),
      (this.count = 1),
      this.updateMorphTargets();
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      e.morphTargetInfluences !== void 0 &&
        (this.morphTargetInfluences = e.morphTargetInfluences.slice()),
      e.morphTargetDictionary !== void 0 &&
        (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)),
      (this.material = Array.isArray(e.material) ? e.material.slice() : e.material),
      (this.geometry = e.geometry),
      this
    );
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes,
      n = Object.keys(t);
    if (n.length > 0) {
      const r = t[n[0]];
      if (r !== void 0) {
        (this.morphTargetInfluences = []), (this.morphTargetDictionary = {});
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), (this.morphTargetDictionary[o] = s);
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry,
      r = n.attributes.position,
      s = n.morphAttributes.position,
      a = n.morphTargetsRelative;
    t.fromBufferAttribute(r, e);
    const o = this.morphTargetInfluences;
    if (s && o) {
      wr.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const u = o[l],
          h = s[l];
        u !== 0 &&
          (vs.fromBufferAttribute(h, e),
          a ? wr.addScaledVector(vs, u) : wr.addScaledVector(vs.sub(t), u));
      }
      t.add(wr);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry,
      r = this.material,
      s = this.matrixWorld;
    r !== void 0 &&
      (n.boundingSphere === null && n.computeBoundingSphere(),
      br.copy(n.boundingSphere),
      br.applyMatrix4(s),
      Bn.copy(e.ray).recast(e.near),
      !(
        br.containsPoint(Bn.origin) === !1 &&
        (Bn.intersectSphere(br, To) === null ||
          Bn.origin.distanceToSquared(To) > (e.far - e.near) ** 2)
      ) &&
        (Eo.copy(s).invert(),
        Bn.copy(e.ray).applyMatrix4(Eo),
        !(n.boundingBox !== null && Bn.intersectsBox(n.boundingBox) === !1) &&
          this._computeIntersections(e, t, Bn)));
  }
  _computeIntersections(e, t, n) {
    let r;
    const s = this.geometry,
      a = this.material,
      o = s.index,
      l = s.attributes.position,
      c = s.attributes.uv,
      u = s.attributes.uv1,
      h = s.attributes.normal,
      f = s.groups,
      m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, S = f.length; g < S; g++) {
          const p = f[g],
            d = a[p.materialIndex],
            E = Math.max(p.start, m.start),
            b = Math.min(o.count, Math.min(p.start + p.count, m.start + m.count));
          for (let y = E, P = b; y < P; y += 3) {
            const R = o.getX(y),
              L = o.getX(y + 1),
              A = o.getX(y + 2);
            (r = Cr(this, d, e, n, c, u, h, R, L, A)),
              r &&
                ((r.faceIndex = Math.floor(y / 3)),
                (r.face.materialIndex = p.materialIndex),
                t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start),
          S = Math.min(o.count, m.start + m.count);
        for (let p = g, d = S; p < d; p += 3) {
          const E = o.getX(p),
            b = o.getX(p + 1),
            y = o.getX(p + 2);
          (r = Cr(this, a, e, n, c, u, h, E, b, y)),
            r && ((r.faceIndex = Math.floor(p / 3)), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let g = 0, S = f.length; g < S; g++) {
          const p = f[g],
            d = a[p.materialIndex],
            E = Math.max(p.start, m.start),
            b = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
          for (let y = E, P = b; y < P; y += 3) {
            const R = y,
              L = y + 1,
              A = y + 2;
            (r = Cr(this, d, e, n, c, u, h, R, L, A)),
              r &&
                ((r.faceIndex = Math.floor(y / 3)),
                (r.face.materialIndex = p.materialIndex),
                t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start),
          S = Math.min(l.count, m.start + m.count);
        for (let p = g, d = S; p < d; p += 3) {
          const E = p,
            b = p + 1,
            y = p + 2;
          (r = Cr(this, a, e, n, c, u, h, E, b, y)),
            r && ((r.faceIndex = Math.floor(p / 3)), t.push(r));
        }
      }
  }
}
function Fh(i, e, t, n, r, s, a, o) {
  let l;
  if (
    (e.side === Lt
      ? (l = n.intersectTriangle(a, s, r, !0, o))
      : (l = n.intersectTriangle(r, s, a, e.side === Pn, o)),
    l === null)
  )
    return null;
  Rr.copy(o), Rr.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(Rr);
  return c < t.near || c > t.far ? null : { distance: c, point: Rr.clone(), object: i };
}
function Cr(i, e, t, n, r, s, a, o, l, c) {
  i.getVertexPosition(o, Er), i.getVertexPosition(l, Tr), i.getVertexPosition(c, Ar);
  const u = Fh(i, e, t, n, Er, Tr, Ar, Ao);
  if (u) {
    const h = new F();
    Zt.getBarycoord(Ao, Er, Tr, Ar, h),
      r && (u.uv = Zt.getInterpolatedAttribute(r, o, l, c, h, new We())),
      s && (u.uv1 = Zt.getInterpolatedAttribute(s, o, l, c, h, new We())),
      a &&
        ((u.normal = Zt.getInterpolatedAttribute(a, o, l, c, h, new F())),
        u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const f = { a: o, b: l, c, normal: new F(), materialIndex: 0 };
    Zt.getNormal(Er, Tr, Ar, f.normal), (u.face = f), (u.barycoord = h);
  }
  return u;
}
class Ni extends Jt {
  constructor(e = 1, t = 1, n = 1, r = 1, s = 1, a = 1) {
    super(),
      (this.type = 'BoxGeometry'),
      (this.parameters = {
        width: e,
        height: t,
        depth: n,
        widthSegments: r,
        heightSegments: s,
        depthSegments: a,
      });
    const o = this;
    (r = Math.floor(r)), (s = Math.floor(s)), (a = Math.floor(a));
    const l = [],
      c = [],
      u = [],
      h = [];
    let f = 0,
      m = 0;
    g('z', 'y', 'x', -1, -1, n, t, e, a, s, 0),
      g('z', 'y', 'x', 1, -1, n, t, -e, a, s, 1),
      g('x', 'z', 'y', 1, 1, e, n, t, r, a, 2),
      g('x', 'z', 'y', 1, -1, e, n, -t, r, a, 3),
      g('x', 'y', 'z', 1, -1, e, t, n, r, s, 4),
      g('x', 'y', 'z', -1, -1, e, t, -n, r, s, 5),
      this.setIndex(l),
      this.setAttribute('position', new wt(c, 3)),
      this.setAttribute('normal', new wt(u, 3)),
      this.setAttribute('uv', new wt(h, 2));
    function g(S, p, d, E, b, y, P, R, L, A, x) {
      const _ = y / L,
        w = P / A,
        U = y / 2,
        z = P / 2,
        G = R / 2,
        V = L + 1,
        X = A + 1;
      let Z = 0,
        H = 0;
      const se = new F();
      for (let ue = 0; ue < X; ue++) {
        const Ae = ue * w - z;
        for (let He = 0; He < V; He++) {
          const tt = He * _ - U;
          (se[S] = tt * E),
            (se[p] = Ae * b),
            (se[d] = G),
            c.push(se.x, se.y, se.z),
            (se[S] = 0),
            (se[p] = 0),
            (se[d] = R > 0 ? 1 : -1),
            u.push(se.x, se.y, se.z),
            h.push(He / L),
            h.push(1 - ue / A),
            (Z += 1);
        }
      }
      for (let ue = 0; ue < A; ue++)
        for (let Ae = 0; Ae < L; Ae++) {
          const He = f + Ae + V * ue,
            tt = f + Ae + V * (ue + 1),
            st = f + (Ae + 1) + V * (ue + 1),
            Ke = f + (Ae + 1) + V * ue;
          l.push(He, tt, Ke), l.push(tt, st, Ke), (H += 6);
        }
      o.addGroup(m, H, x), (m += H), (f += Z);
    }
  }
  copy(e) {
    return super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this;
  }
  static fromJSON(e) {
    return new Ni(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Pi(i) {
  const e = {};
  for (const t in i) {
    e[t] = {};
    for (const n in i[t]) {
      const r = i[t][n];
      r &&
      (r.isColor ||
        r.isMatrix3 ||
        r.isMatrix4 ||
        r.isVector2 ||
        r.isVector3 ||
        r.isVector4 ||
        r.isTexture ||
        r.isQuaternion)
        ? r.isRenderTargetTexture
          ? (console.warn(
              'UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().',
            ),
            (e[t][n] = null))
          : (e[t][n] = r.clone())
        : Array.isArray(r)
          ? (e[t][n] = r.slice())
          : (e[t][n] = r);
    }
  }
  return e;
}
function Pt(i) {
  const e = {};
  for (let t = 0; t < i.length; t++) {
    const n = Pi(i[t]);
    for (const r in n) e[r] = n[r];
  }
  return e;
}
function Oh(i) {
  const e = [];
  for (let t = 0; t < i.length; t++) e.push(i[t].clone());
  return e;
}
function Ol(i) {
  const e = i.getRenderTarget();
  return e === null
    ? i.outputColorSpace
    : e.isXRRenderTarget === !0
      ? e.texture.colorSpace
      : Ye.workingColorSpace;
}
const Bh = { clone: Pi, merge: Pt };
var zh = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  kh = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class gn extends ar {
  constructor(e) {
    super(),
      (this.isShaderMaterial = !0),
      (this.type = 'ShaderMaterial'),
      (this.defines = {}),
      (this.uniforms = {}),
      (this.uniformsGroups = []),
      (this.vertexShader = zh),
      (this.fragmentShader = kh),
      (this.linewidth = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.fog = !1),
      (this.lights = !1),
      (this.clipping = !1),
      (this.forceSinglePass = !0),
      (this.extensions = { clipCullDistance: !1, multiDraw: !1 }),
      (this.defaultAttributeValues = { color: [1, 1, 1], uv: [0, 0], uv1: [0, 0] }),
      (this.index0AttributeName = void 0),
      (this.uniformsNeedUpdate = !1),
      (this.glslVersion = null),
      e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return (
      super.copy(e),
      (this.fragmentShader = e.fragmentShader),
      (this.vertexShader = e.vertexShader),
      (this.uniforms = Pi(e.uniforms)),
      (this.uniformsGroups = Oh(e.uniformsGroups)),
      (this.defines = Object.assign({}, e.defines)),
      (this.wireframe = e.wireframe),
      (this.wireframeLinewidth = e.wireframeLinewidth),
      (this.fog = e.fog),
      (this.lights = e.lights),
      (this.clipping = e.clipping),
      (this.extensions = Object.assign({}, e.extensions)),
      (this.glslVersion = e.glslVersion),
      this
    );
  }
  toJSON(e) {
    const t = super.toJSON(e);
    (t.glslVersion = this.glslVersion), (t.uniforms = {});
    for (const r in this.uniforms) {
      const a = this.uniforms[r].value;
      a && a.isTexture
        ? (t.uniforms[r] = { type: 't', value: a.toJSON(e).uuid })
        : a && a.isColor
          ? (t.uniforms[r] = { type: 'c', value: a.getHex() })
          : a && a.isVector2
            ? (t.uniforms[r] = { type: 'v2', value: a.toArray() })
            : a && a.isVector3
              ? (t.uniforms[r] = { type: 'v3', value: a.toArray() })
              : a && a.isVector4
                ? (t.uniforms[r] = { type: 'v4', value: a.toArray() })
                : a && a.isMatrix3
                  ? (t.uniforms[r] = { type: 'm3', value: a.toArray() })
                  : a && a.isMatrix4
                    ? (t.uniforms[r] = { type: 'm4', value: a.toArray() })
                    : (t.uniforms[r] = { value: a });
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines),
      (t.vertexShader = this.vertexShader),
      (t.fragmentShader = this.fragmentShader),
      (t.lights = this.lights),
      (t.clipping = this.clipping);
    const n = {};
    for (const r in this.extensions) this.extensions[r] === !0 && (n[r] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}
class Bl extends Mt {
  constructor() {
    super(),
      (this.isCamera = !0),
      (this.type = 'Camera'),
      (this.matrixWorldInverse = new rt()),
      (this.projectionMatrix = new rt()),
      (this.projectionMatrixInverse = new rt()),
      (this.coordinateSystem = sn),
      (this._reversedDepth = !1);
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      this.matrixWorldInverse.copy(e.matrixWorldInverse),
      this.projectionMatrix.copy(e.projectionMatrix),
      this.projectionMatrixInverse.copy(e.projectionMatrixInverse),
      (this.coordinateSystem = e.coordinateSystem),
      this
    );
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const bn = new F(),
  wo = new We(),
  Ro = new We();
class Wt extends Bl {
  constructor(e = 50, t = 1, n = 0.1, r = 2e3) {
    super(),
      (this.isPerspectiveCamera = !0),
      (this.type = 'PerspectiveCamera'),
      (this.fov = e),
      (this.zoom = 1),
      (this.near = n),
      (this.far = r),
      (this.focus = 10),
      (this.aspect = t),
      (this.view = null),
      (this.filmGauge = 35),
      (this.filmOffset = 0),
      this.updateProjectionMatrix();
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      (this.fov = e.fov),
      (this.zoom = e.zoom),
      (this.near = e.near),
      (this.far = e.far),
      (this.focus = e.focus),
      (this.aspect = e.aspect),
      (this.view = e.view === null ? null : Object.assign({}, e.view)),
      (this.filmGauge = e.filmGauge),
      (this.filmOffset = e.filmOffset),
      this
    );
  }
  setFocalLength(e) {
    const t = (0.5 * this.getFilmHeight()) / e;
    (this.fov = Qi * 2 * Math.atan(t)), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const e = Math.tan(Xi * 0.5 * this.fov);
    return (0.5 * this.getFilmHeight()) / e;
  }
  getEffectiveFOV() {
    return Qi * 2 * Math.atan(Math.tan(Xi * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(e, t, n) {
    bn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      t.set(bn.x, bn.y).multiplyScalar(-e / bn.z),
      bn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      n.set(bn.x, bn.y).multiplyScalar(-e / bn.z);
  }
  getViewSize(e, t) {
    return this.getViewBounds(e, wo, Ro), t.subVectors(Ro, wo);
  }
  setViewOffset(e, t, n, r, s, a) {
    (this.aspect = e / t),
      this.view === null &&
        (this.view = {
          enabled: !0,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        }),
      (this.view.enabled = !0),
      (this.view.fullWidth = e),
      (this.view.fullHeight = t),
      (this.view.offsetX = n),
      (this.view.offsetY = r),
      (this.view.width = s),
      (this.view.height = a),
      this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = (e * Math.tan(Xi * 0.5 * this.fov)) / this.zoom,
      n = 2 * t,
      r = this.aspect * n,
      s = -0.5 * r;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth,
        c = a.fullHeight;
      (s += (a.offsetX * r) / l),
        (t -= (a.offsetY * n) / c),
        (r *= a.width / l),
        (n *= a.height / c);
    }
    const o = this.filmOffset;
    o !== 0 && (s += (e * o) / this.getFilmWidth()),
      this.projectionMatrix.makePerspective(
        s,
        s + r,
        t,
        t - n,
        e,
        this.far,
        this.coordinateSystem,
        this.reversedDepth,
      ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return (
      (t.object.fov = this.fov),
      (t.object.zoom = this.zoom),
      (t.object.near = this.near),
      (t.object.far = this.far),
      (t.object.focus = this.focus),
      (t.object.aspect = this.aspect),
      this.view !== null && (t.object.view = Object.assign({}, this.view)),
      (t.object.filmGauge = this.filmGauge),
      (t.object.filmOffset = this.filmOffset),
      t
    );
  }
}
const di = -90,
  fi = 1;
class Hh extends Mt {
  constructor(e, t, n) {
    super(),
      (this.type = 'CubeCamera'),
      (this.renderTarget = n),
      (this.coordinateSystem = null),
      (this.activeMipmapLevel = 0);
    const r = new Wt(di, fi, e, t);
    (r.layers = this.layers), this.add(r);
    const s = new Wt(di, fi, e, t);
    (s.layers = this.layers), this.add(s);
    const a = new Wt(di, fi, e, t);
    (a.layers = this.layers), this.add(a);
    const o = new Wt(di, fi, e, t);
    (o.layers = this.layers), this.add(o);
    const l = new Wt(di, fi, e, t);
    (l.layers = this.layers), this.add(l);
    const c = new Wt(di, fi, e, t);
    (c.layers = this.layers), this.add(c);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem,
      t = this.children.concat(),
      [n, r, s, a, o, l] = t;
    for (const c of t) this.remove(c);
    if (e === sn)
      n.up.set(0, 1, 0),
        n.lookAt(1, 0, 0),
        r.up.set(0, 1, 0),
        r.lookAt(-1, 0, 0),
        s.up.set(0, 0, -1),
        s.lookAt(0, 1, 0),
        a.up.set(0, 0, 1),
        a.lookAt(0, -1, 0),
        o.up.set(0, 1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, 1, 0),
        l.lookAt(0, 0, -1);
    else if (e === Gr)
      n.up.set(0, -1, 0),
        n.lookAt(-1, 0, 0),
        r.up.set(0, -1, 0),
        r.lookAt(1, 0, 0),
        s.up.set(0, 0, 1),
        s.lookAt(0, 1, 0),
        a.up.set(0, 0, -1),
        a.lookAt(0, -1, 0),
        o.up.set(0, -1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, -1, 0),
        l.lookAt(0, 0, -1);
    else
      throw new Error('THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: ' + e);
    for (const c of t) this.add(c), c.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: r } = this;
    this.coordinateSystem !== e.coordinateSystem &&
      ((this.coordinateSystem = e.coordinateSystem), this.updateCoordinateSystem());
    const [s, a, o, l, c, u] = this.children,
      h = e.getRenderTarget(),
      f = e.getActiveCubeFace(),
      m = e.getActiveMipmapLevel(),
      g = e.xr.enabled;
    e.xr.enabled = !1;
    const S = n.texture.generateMipmaps;
    (n.texture.generateMipmaps = !1),
      e.setRenderTarget(n, 0, r),
      e.render(t, s),
      e.setRenderTarget(n, 1, r),
      e.render(t, a),
      e.setRenderTarget(n, 2, r),
      e.render(t, o),
      e.setRenderTarget(n, 3, r),
      e.render(t, l),
      e.setRenderTarget(n, 4, r),
      e.render(t, c),
      (n.texture.generateMipmaps = S),
      e.setRenderTarget(n, 5, r),
      e.render(t, u),
      e.setRenderTarget(h, f, m),
      (e.xr.enabled = g),
      (n.texture.needsPMREMUpdate = !0);
  }
}
class zl extends At {
  constructor(e = [], t = wi, n, r, s, a, o, l, c, u) {
    super(e, t, n, r, s, a, o, l, c, u), (this.isCubeTexture = !0), (this.flipY = !1);
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Gh extends Zn {
  constructor(e = 1, t = {}) {
    super(e, e, t), (this.isWebGLCubeRenderTarget = !0);
    const n = { width: e, height: e, depth: 1 },
      r = [n, n, n, n, n, n];
    (this.texture = new zl(r)),
      this._setTextureOptions(t),
      (this.texture.isRenderTargetTexture = !0);
  }
  fromEquirectangularTexture(e, t) {
    (this.texture.type = t.type),
      (this.texture.colorSpace = t.colorSpace),
      (this.texture.generateMipmaps = t.generateMipmaps),
      (this.texture.minFilter = t.minFilter),
      (this.texture.magFilter = t.magFilter);
    const n = {
        uniforms: { tEquirect: { value: null } },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`,
      },
      r = new Ni(5, 5, 5),
      s = new gn({
        name: 'CubemapFromEquirect',
        uniforms: Pi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Lt,
        blending: wn,
      });
    s.uniforms.tEquirect.value = t;
    const a = new St(r, s),
      o = t.minFilter;
    return (
      t.minFilter === $n && (t.minFilter = nn),
      new Hh(1, 10, this).update(e, a),
      (t.minFilter = o),
      a.geometry.dispose(),
      a.material.dispose(),
      this
    );
  }
  clear(e, t = !0, n = !0, r = !0) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++) e.setRenderTarget(this, a), e.clear(t, n, r);
    e.setRenderTarget(s);
  }
}
class ut extends Mt {
  constructor() {
    super(), (this.isGroup = !0), (this.type = 'Group');
  }
}
const Vh = { type: 'move' };
class xs {
  constructor() {
    (this._targetRay = null), (this._grip = null), (this._hand = null);
  }
  getHandSpace() {
    return (
      this._hand === null &&
        ((this._hand = new ut()),
        (this._hand.matrixAutoUpdate = !1),
        (this._hand.visible = !1),
        (this._hand.joints = {}),
        (this._hand.inputState = { pinching: !1 })),
      this._hand
    );
  }
  getTargetRaySpace() {
    return (
      this._targetRay === null &&
        ((this._targetRay = new ut()),
        (this._targetRay.matrixAutoUpdate = !1),
        (this._targetRay.visible = !1),
        (this._targetRay.hasLinearVelocity = !1),
        (this._targetRay.linearVelocity = new F()),
        (this._targetRay.hasAngularVelocity = !1),
        (this._targetRay.angularVelocity = new F())),
      this._targetRay
    );
  }
  getGripSpace() {
    return (
      this._grip === null &&
        ((this._grip = new ut()),
        (this._grip.matrixAutoUpdate = !1),
        (this._grip.visible = !1),
        (this._grip.hasLinearVelocity = !1),
        (this._grip.linearVelocity = new F()),
        (this._grip.hasAngularVelocity = !1),
        (this._grip.angularVelocity = new F())),
      this._grip
    );
  }
  dispatchEvent(e) {
    return (
      this._targetRay !== null && this._targetRay.dispatchEvent(e),
      this._grip !== null && this._grip.dispatchEvent(e),
      this._hand !== null && this._hand.dispatchEvent(e),
      this
    );
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t) for (const n of e.hand.values()) this._getHandJoint(t, n);
    }
    return this.dispatchEvent({ type: 'connected', data: e }), this;
  }
  disconnect(e) {
    return (
      this.dispatchEvent({ type: 'disconnected', data: e }),
      this._targetRay !== null && (this._targetRay.visible = !1),
      this._grip !== null && (this._grip.visible = !1),
      this._hand !== null && (this._hand.visible = !1),
      this
    );
  }
  update(e, t, n) {
    let r = null,
      s = null,
      a = null;
    const o = this._targetRay,
      l = this._grip,
      c = this._hand;
    if (e && t.session.visibilityState !== 'visible-blurred') {
      if (c && e.hand) {
        a = !0;
        for (const S of e.hand.values()) {
          const p = t.getJointPose(S, n),
            d = this._getHandJoint(c, S);
          p !== null &&
            (d.matrix.fromArray(p.transform.matrix),
            d.matrix.decompose(d.position, d.rotation, d.scale),
            (d.matrixWorldNeedsUpdate = !0),
            (d.jointRadius = p.radius)),
            (d.visible = p !== null);
        }
        const u = c.joints['index-finger-tip'],
          h = c.joints['thumb-tip'],
          f = u.position.distanceTo(h.position),
          m = 0.02,
          g = 0.005;
        c.inputState.pinching && f > m + g
          ? ((c.inputState.pinching = !1),
            this.dispatchEvent({ type: 'pinchend', handedness: e.handedness, target: this }))
          : !c.inputState.pinching &&
            f <= m - g &&
            ((c.inputState.pinching = !0),
            this.dispatchEvent({ type: 'pinchstart', handedness: e.handedness, target: this }));
      } else
        l !== null &&
          e.gripSpace &&
          ((s = t.getPose(e.gripSpace, n)),
          s !== null &&
            (l.matrix.fromArray(s.transform.matrix),
            l.matrix.decompose(l.position, l.rotation, l.scale),
            (l.matrixWorldNeedsUpdate = !0),
            s.linearVelocity
              ? ((l.hasLinearVelocity = !0), l.linearVelocity.copy(s.linearVelocity))
              : (l.hasLinearVelocity = !1),
            s.angularVelocity
              ? ((l.hasAngularVelocity = !0), l.angularVelocity.copy(s.angularVelocity))
              : (l.hasAngularVelocity = !1)));
      o !== null &&
        ((r = t.getPose(e.targetRaySpace, n)),
        r === null && s !== null && (r = s),
        r !== null &&
          (o.matrix.fromArray(r.transform.matrix),
          o.matrix.decompose(o.position, o.rotation, o.scale),
          (o.matrixWorldNeedsUpdate = !0),
          r.linearVelocity
            ? ((o.hasLinearVelocity = !0), o.linearVelocity.copy(r.linearVelocity))
            : (o.hasLinearVelocity = !1),
          r.angularVelocity
            ? ((o.hasAngularVelocity = !0), o.angularVelocity.copy(r.angularVelocity))
            : (o.hasAngularVelocity = !1),
          this.dispatchEvent(Vh)));
    }
    return (
      o !== null && (o.visible = r !== null),
      l !== null && (l.visible = s !== null),
      c !== null && (c.visible = a !== null),
      this
    );
  }
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new ut();
      (n.matrixAutoUpdate = !1), (n.visible = !1), (e.joints[t.jointName] = n), e.add(n);
    }
    return e.joints[t.jointName];
  }
}
class Na {
  constructor(e, t = 1, n = 1e3) {
    (this.isFog = !0), (this.name = ''), (this.color = new ke(e)), (this.near = t), (this.far = n);
  }
  clone() {
    return new Na(this.color, this.near, this.far);
  }
  toJSON() {
    return {
      type: 'Fog',
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far,
    };
  }
}
class Wh extends Mt {
  constructor() {
    super(),
      (this.isScene = !0),
      (this.type = 'Scene'),
      (this.background = null),
      (this.environment = null),
      (this.fog = null),
      (this.backgroundBlurriness = 0),
      (this.backgroundIntensity = 1),
      (this.backgroundRotation = new on()),
      (this.environmentIntensity = 1),
      (this.environmentRotation = new on()),
      (this.overrideMaterial = null),
      typeof __THREE_DEVTOOLS__ < 'u' &&
        __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this }));
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      e.background !== null && (this.background = e.background.clone()),
      e.environment !== null && (this.environment = e.environment.clone()),
      e.fog !== null && (this.fog = e.fog.clone()),
      (this.backgroundBlurriness = e.backgroundBlurriness),
      (this.backgroundIntensity = e.backgroundIntensity),
      this.backgroundRotation.copy(e.backgroundRotation),
      (this.environmentIntensity = e.environmentIntensity),
      this.environmentRotation.copy(e.environmentRotation),
      e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()),
      (this.matrixAutoUpdate = e.matrixAutoUpdate),
      this
    );
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return (
      this.fog !== null && (t.object.fog = this.fog.toJSON()),
      this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness),
      this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity),
      (t.object.backgroundRotation = this.backgroundRotation.toArray()),
      this.environmentIntensity !== 1 &&
        (t.object.environmentIntensity = this.environmentIntensity),
      (t.object.environmentRotation = this.environmentRotation.toArray()),
      t
    );
  }
}
class Xh extends At {
  constructor(e = null, t = 1, n = 1, r, s, a, o, l, c = zt, u = zt, h, f) {
    super(null, a, o, l, c, u, r, s, h, f),
      (this.isDataTexture = !0),
      (this.image = { data: e, width: t, height: n }),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1);
  }
}
class Co extends kt {
  constructor(e, t, n, r = 1) {
    super(e, t, n), (this.isInstancedBufferAttribute = !0), (this.meshPerAttribute = r);
  }
  copy(e) {
    return super.copy(e), (this.meshPerAttribute = e.meshPerAttribute), this;
  }
  toJSON() {
    const e = super.toJSON();
    return (e.meshPerAttribute = this.meshPerAttribute), (e.isInstancedBufferAttribute = !0), e;
  }
}
const pi = new rt(),
  Po = new rt(),
  Pr = [],
  Lo = new Qn(),
  qh = new rt(),
  Gi = new St(),
  Vi = new sr();
class En extends St {
  constructor(e, t, n) {
    super(e, t),
      (this.isInstancedMesh = !0),
      (this.instanceMatrix = new Co(new Float32Array(n * 16), 16)),
      (this.instanceColor = null),
      (this.morphTexture = null),
      (this.count = n),
      (this.boundingBox = null),
      (this.boundingSphere = null);
    for (let r = 0; r < n; r++) this.setMatrixAt(r, qh);
  }
  computeBoundingBox() {
    const e = this.geometry,
      t = this.count;
    this.boundingBox === null && (this.boundingBox = new Qn()),
      e.boundingBox === null && e.computeBoundingBox(),
      this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, pi), Lo.copy(e.boundingBox).applyMatrix4(pi), this.boundingBox.union(Lo);
  }
  computeBoundingSphere() {
    const e = this.geometry,
      t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new sr()),
      e.boundingSphere === null && e.computeBoundingSphere(),
      this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, pi),
        Vi.copy(e.boundingSphere).applyMatrix4(pi),
        this.boundingSphere.union(Vi);
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      this.instanceMatrix.copy(e.instanceMatrix),
      e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()),
      e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()),
      (this.count = e.count),
      e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()),
      e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()),
      this
    );
  }
  getColorAt(e, t) {
    t.fromArray(this.instanceColor.array, e * 3);
  }
  getMatrixAt(e, t) {
    t.fromArray(this.instanceMatrix.array, e * 16);
  }
  getMorphAt(e, t) {
    const n = t.morphTargetInfluences,
      r = this.morphTexture.source.data.data,
      s = n.length + 1,
      a = e * s + 1;
    for (let o = 0; o < n.length; o++) n[o] = r[a + o];
  }
  raycast(e, t) {
    const n = this.matrixWorld,
      r = this.count;
    if (
      ((Gi.geometry = this.geometry),
      (Gi.material = this.material),
      Gi.material !== void 0 &&
        (this.boundingSphere === null && this.computeBoundingSphere(),
        Vi.copy(this.boundingSphere),
        Vi.applyMatrix4(n),
        e.ray.intersectsSphere(Vi) !== !1))
    )
      for (let s = 0; s < r; s++) {
        this.getMatrixAt(s, pi),
          Po.multiplyMatrices(n, pi),
          (Gi.matrixWorld = Po),
          Gi.raycast(e, Pr);
        for (let a = 0, o = Pr.length; a < o; a++) {
          const l = Pr[a];
          (l.instanceId = s), (l.object = this), t.push(l);
        }
        Pr.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null &&
      (this.instanceColor = new Co(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)),
      t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences,
      r = n.length + 1;
    this.morphTexture === null &&
      (this.morphTexture = new Xh(new Float32Array(r * this.count), r, this.count, Ra, rn));
    const s = this.morphTexture.source.data.data;
    let a = 0;
    for (let c = 0; c < n.length; c++) a += n[c];
    const o = this.geometry.morphTargetsRelative ? 1 : 1 - a,
      l = r * e;
    (s[l] = o), s.set(n, l + 1);
  }
  updateMorphTargets() {}
  dispose() {
    this.dispatchEvent({ type: 'dispose' }),
      this.morphTexture !== null && (this.morphTexture.dispose(), (this.morphTexture = null));
  }
}
const Ms = new F(),
  $h = new F(),
  Yh = new Oe();
class Tn {
  constructor(e = new F(1, 0, 0), t = 0) {
    (this.isPlane = !0), (this.normal = e), (this.constant = t);
  }
  set(e, t) {
    return this.normal.copy(e), (this.constant = t), this;
  }
  setComponents(e, t, n, r) {
    return this.normal.set(e, t, n), (this.constant = r), this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), (this.constant = -t.dot(this.normal)), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const r = Ms.subVectors(n, t).cross($h.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(r, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), (this.constant = e.constant), this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), (this.constant *= e), this;
  }
  negate() {
    return (this.constant *= -1), this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta(Ms),
      r = this.normal.dot(n);
    if (r === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const s = -(e.start.dot(this.normal) + this.constant) / r;
    return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(n, s);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start),
      n = this.distanceToPoint(e.end);
    return (t < 0 && n > 0) || (n < 0 && t > 0);
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || Yh.getNormalMatrix(e),
      r = this.coplanarPoint(Ms).applyMatrix4(e),
      s = this.normal.applyMatrix3(n).normalize();
    return (this.constant = -r.dot(s)), this;
  }
  translate(e) {
    return (this.constant -= e.dot(this.normal)), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const zn = new sr(),
  Kh = new We(0.5, 0.5),
  Lr = new F();
class Fa {
  constructor(e = new Tn(), t = new Tn(), n = new Tn(), r = new Tn(), s = new Tn(), a = new Tn()) {
    this.planes = [e, t, n, r, s, a];
  }
  set(e, t, n, r, s, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(s), o[5].copy(a), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = sn, n = !1) {
    const r = this.planes,
      s = e.elements,
      a = s[0],
      o = s[1],
      l = s[2],
      c = s[3],
      u = s[4],
      h = s[5],
      f = s[6],
      m = s[7],
      g = s[8],
      S = s[9],
      p = s[10],
      d = s[11],
      E = s[12],
      b = s[13],
      y = s[14],
      P = s[15];
    if (
      (r[0].setComponents(c - a, m - u, d - g, P - E).normalize(),
      r[1].setComponents(c + a, m + u, d + g, P + E).normalize(),
      r[2].setComponents(c + o, m + h, d + S, P + b).normalize(),
      r[3].setComponents(c - o, m - h, d - S, P - b).normalize(),
      n)
    )
      r[4].setComponents(l, f, p, y).normalize(),
        r[5].setComponents(c - l, m - f, d - p, P - y).normalize();
    else if ((r[4].setComponents(c - l, m - f, d - p, P - y).normalize(), t === sn))
      r[5].setComponents(c + l, m + f, d + p, P + y).normalize();
    else if (t === Gr) r[5].setComponents(l, f, p, y).normalize();
    else
      throw new Error('THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: ' + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(),
        zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(),
        zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(zn);
  }
  intersectsSprite(e) {
    zn.center.set(0, 0, 0);
    const t = Kh.distanceTo(e.center);
    return (
      (zn.radius = 0.7071067811865476 + t),
      zn.applyMatrix4(e.matrixWorld),
      this.intersectsSphere(zn)
    );
  }
  intersectsSphere(e) {
    const t = this.planes,
      n = e.center,
      r = -e.radius;
    for (let s = 0; s < 6; s++) if (t[s].distanceToPoint(n) < r) return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const r = t[n];
      if (
        ((Lr.x = r.normal.x > 0 ? e.max.x : e.min.x),
        (Lr.y = r.normal.y > 0 ? e.max.y : e.min.y),
        (Lr.z = r.normal.z > 0 ? e.max.z : e.min.z),
        r.distanceToPoint(Lr) < 0)
      )
        return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Zh extends At {
  constructor(e, t, n, r, s, a, o, l, c) {
    super(e, t, n, r, s, a, o, l, c), (this.isCanvasTexture = !0), (this.needsUpdate = !0);
  }
}
class kl extends At {
  constructor(e, t, n = Kn, r, s, a, o = zt, l = zt, c, u = ji, h = 1) {
    if (u !== ji && u !== Ji)
      throw new Error(
        'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat',
      );
    const f = { width: e, height: t, depth: h };
    super(f, r, s, a, o, l, u, n, c),
      (this.isDepthTexture = !0),
      (this.flipY = !1),
      (this.generateMipmaps = !1),
      (this.compareFunction = null);
  }
  copy(e) {
    return (
      super.copy(e),
      (this.source = new Ia(Object.assign({}, e.image))),
      (this.compareFunction = e.compareFunction),
      this
    );
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
class Hl extends At {
  constructor(e = null) {
    super(), (this.sourceTexture = e), (this.isExternalTexture = !0);
  }
  copy(e) {
    return super.copy(e), (this.sourceTexture = e.sourceTexture), this;
  }
}
class tr extends Jt {
  constructor(e = 1, t = 1, n = 1, r = 32, s = 1, a = !1, o = 0, l = Math.PI * 2) {
    super(),
      (this.type = 'CylinderGeometry'),
      (this.parameters = {
        radiusTop: e,
        radiusBottom: t,
        height: n,
        radialSegments: r,
        heightSegments: s,
        openEnded: a,
        thetaStart: o,
        thetaLength: l,
      });
    const c = this;
    (r = Math.floor(r)), (s = Math.floor(s));
    const u = [],
      h = [],
      f = [],
      m = [];
    let g = 0;
    const S = [],
      p = n / 2;
    let d = 0;
    E(),
      a === !1 && (e > 0 && b(!0), t > 0 && b(!1)),
      this.setIndex(u),
      this.setAttribute('position', new wt(h, 3)),
      this.setAttribute('normal', new wt(f, 3)),
      this.setAttribute('uv', new wt(m, 2));
    function E() {
      const y = new F(),
        P = new F();
      let R = 0;
      const L = (t - e) / n;
      for (let A = 0; A <= s; A++) {
        const x = [],
          _ = A / s,
          w = _ * (t - e) + e;
        for (let U = 0; U <= r; U++) {
          const z = U / r,
            G = z * l + o,
            V = Math.sin(G),
            X = Math.cos(G);
          (P.x = w * V),
            (P.y = -_ * n + p),
            (P.z = w * X),
            h.push(P.x, P.y, P.z),
            y.set(V, L, X).normalize(),
            f.push(y.x, y.y, y.z),
            m.push(z, 1 - _),
            x.push(g++);
        }
        S.push(x);
      }
      for (let A = 0; A < r; A++)
        for (let x = 0; x < s; x++) {
          const _ = S[x][A],
            w = S[x + 1][A],
            U = S[x + 1][A + 1],
            z = S[x][A + 1];
          (e > 0 || x !== 0) && (u.push(_, w, z), (R += 3)),
            (t > 0 || x !== s - 1) && (u.push(w, U, z), (R += 3));
        }
      c.addGroup(d, R, 0), (d += R);
    }
    function b(y) {
      const P = g,
        R = new We(),
        L = new F();
      let A = 0;
      const x = y === !0 ? e : t,
        _ = y === !0 ? 1 : -1;
      for (let U = 1; U <= r; U++) h.push(0, p * _, 0), f.push(0, _, 0), m.push(0.5, 0.5), g++;
      const w = g;
      for (let U = 0; U <= r; U++) {
        const G = (U / r) * l + o,
          V = Math.cos(G),
          X = Math.sin(G);
        (L.x = x * X),
          (L.y = p * _),
          (L.z = x * V),
          h.push(L.x, L.y, L.z),
          f.push(0, _, 0),
          (R.x = V * 0.5 + 0.5),
          (R.y = X * 0.5 * _ + 0.5),
          m.push(R.x, R.y),
          g++;
      }
      for (let U = 0; U < r; U++) {
        const z = P + U,
          G = w + U;
        y === !0 ? u.push(G, G + 1, z) : u.push(G + 1, G, z), (A += 3);
      }
      c.addGroup(d, A, y === !0 ? 1 : 2), (d += A);
    }
  }
  copy(e) {
    return super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this;
  }
  static fromJSON(e) {
    return new tr(
      e.radiusTop,
      e.radiusBottom,
      e.height,
      e.radialSegments,
      e.heightSegments,
      e.openEnded,
      e.thetaStart,
      e.thetaLength,
    );
  }
}
class $i extends tr {
  constructor(e = 1, t = 1, n = 32, r = 1, s = !1, a = 0, o = Math.PI * 2) {
    super(0, e, t, n, r, s, a, o),
      (this.type = 'ConeGeometry'),
      (this.parameters = {
        radius: e,
        height: t,
        radialSegments: n,
        heightSegments: r,
        openEnded: s,
        thetaStart: a,
        thetaLength: o,
      });
  }
  static fromJSON(e) {
    return new $i(
      e.radius,
      e.height,
      e.radialSegments,
      e.heightSegments,
      e.openEnded,
      e.thetaStart,
      e.thetaLength,
    );
  }
}
class or extends Jt {
  constructor(e = [], t = [], n = 1, r = 0) {
    super(),
      (this.type = 'PolyhedronGeometry'),
      (this.parameters = { vertices: e, indices: t, radius: n, detail: r });
    const s = [],
      a = [];
    o(r),
      c(n),
      u(),
      this.setAttribute('position', new wt(s, 3)),
      this.setAttribute('normal', new wt(s.slice(), 3)),
      this.setAttribute('uv', new wt(a, 2)),
      r === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(E) {
      const b = new F(),
        y = new F(),
        P = new F();
      for (let R = 0; R < t.length; R += 3)
        m(t[R + 0], b), m(t[R + 1], y), m(t[R + 2], P), l(b, y, P, E);
    }
    function l(E, b, y, P) {
      const R = P + 1,
        L = [];
      for (let A = 0; A <= R; A++) {
        L[A] = [];
        const x = E.clone().lerp(y, A / R),
          _ = b.clone().lerp(y, A / R),
          w = R - A;
        for (let U = 0; U <= w; U++)
          U === 0 && A === R ? (L[A][U] = x) : (L[A][U] = x.clone().lerp(_, U / w));
      }
      for (let A = 0; A < R; A++)
        for (let x = 0; x < 2 * (R - A) - 1; x++) {
          const _ = Math.floor(x / 2);
          x % 2 === 0
            ? (f(L[A][_ + 1]), f(L[A + 1][_]), f(L[A][_]))
            : (f(L[A][_ + 1]), f(L[A + 1][_ + 1]), f(L[A + 1][_]));
        }
    }
    function c(E) {
      const b = new F();
      for (let y = 0; y < s.length; y += 3)
        (b.x = s[y + 0]),
          (b.y = s[y + 1]),
          (b.z = s[y + 2]),
          b.normalize().multiplyScalar(E),
          (s[y + 0] = b.x),
          (s[y + 1] = b.y),
          (s[y + 2] = b.z);
    }
    function u() {
      const E = new F();
      for (let b = 0; b < s.length; b += 3) {
        (E.x = s[b + 0]), (E.y = s[b + 1]), (E.z = s[b + 2]);
        const y = p(E) / 2 / Math.PI + 0.5,
          P = d(E) / Math.PI + 0.5;
        a.push(y, 1 - P);
      }
      g(), h();
    }
    function h() {
      for (let E = 0; E < a.length; E += 6) {
        const b = a[E + 0],
          y = a[E + 2],
          P = a[E + 4],
          R = Math.max(b, y, P),
          L = Math.min(b, y, P);
        R > 0.9 &&
          L < 0.1 &&
          (b < 0.2 && (a[E + 0] += 1), y < 0.2 && (a[E + 2] += 1), P < 0.2 && (a[E + 4] += 1));
      }
    }
    function f(E) {
      s.push(E.x, E.y, E.z);
    }
    function m(E, b) {
      const y = E * 3;
      (b.x = e[y + 0]), (b.y = e[y + 1]), (b.z = e[y + 2]);
    }
    function g() {
      const E = new F(),
        b = new F(),
        y = new F(),
        P = new F(),
        R = new We(),
        L = new We(),
        A = new We();
      for (let x = 0, _ = 0; x < s.length; x += 9, _ += 6) {
        E.set(s[x + 0], s[x + 1], s[x + 2]),
          b.set(s[x + 3], s[x + 4], s[x + 5]),
          y.set(s[x + 6], s[x + 7], s[x + 8]),
          R.set(a[_ + 0], a[_ + 1]),
          L.set(a[_ + 2], a[_ + 3]),
          A.set(a[_ + 4], a[_ + 5]),
          P.copy(E).add(b).add(y).divideScalar(3);
        const w = p(P);
        S(R, _ + 0, E, w), S(L, _ + 2, b, w), S(A, _ + 4, y, w);
      }
    }
    function S(E, b, y, P) {
      P < 0 && E.x === 1 && (a[b] = E.x - 1),
        y.x === 0 && y.z === 0 && (a[b] = P / 2 / Math.PI + 0.5);
    }
    function p(E) {
      return Math.atan2(E.z, -E.x);
    }
    function d(E) {
      return Math.atan2(-E.y, Math.sqrt(E.x * E.x + E.z * E.z));
    }
  }
  copy(e) {
    return super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this;
  }
  static fromJSON(e) {
    return new or(e.vertices, e.indices, e.radius, e.details);
  }
}
class Oa extends or {
  constructor(e = 1, t = 0) {
    const n = (1 + Math.sqrt(5)) / 2,
      r = 1 / n,
      s = [
        -1,
        -1,
        -1,
        -1,
        -1,
        1,
        -1,
        1,
        -1,
        -1,
        1,
        1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        1,
        -1,
        1,
        1,
        1,
        0,
        -r,
        -n,
        0,
        -r,
        n,
        0,
        r,
        -n,
        0,
        r,
        n,
        -r,
        -n,
        0,
        -r,
        n,
        0,
        r,
        -n,
        0,
        r,
        n,
        0,
        -n,
        0,
        -r,
        n,
        0,
        -r,
        -n,
        0,
        r,
        n,
        0,
        r,
      ],
      a = [
        3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10,
        6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13,
        15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4,
        0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5,
        1, 5, 9,
      ];
    super(s, a, e, t),
      (this.type = 'DodecahedronGeometry'),
      (this.parameters = { radius: e, detail: t });
  }
  static fromJSON(e) {
    return new Oa(e.radius, e.detail);
  }
}
class Yi extends or {
  constructor(e = 1, t = 0) {
    const n = (1 + Math.sqrt(5)) / 2,
      r = [
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        0,
        0,
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        n,
        0,
        -1,
        n,
        0,
        1,
        -n,
        0,
        -1,
        -n,
        0,
        1,
      ],
      s = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7,
        1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9,
        8, 1,
      ];
    super(r, s, e, t),
      (this.type = 'IcosahedronGeometry'),
      (this.parameters = { radius: e, detail: t });
  }
  static fromJSON(e) {
    return new Yi(e.radius, e.detail);
  }
}
class Ba extends or {
  constructor(e = 1, t = 0) {
    const n = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1],
      r = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];
    super(n, r, e, t),
      (this.type = 'OctahedronGeometry'),
      (this.parameters = { radius: e, detail: t });
  }
  static fromJSON(e) {
    return new Ba(e.radius, e.detail);
  }
}
class Li extends Jt {
  constructor(e = 1, t = 1, n = 1, r = 1) {
    super(),
      (this.type = 'PlaneGeometry'),
      (this.parameters = { width: e, height: t, widthSegments: n, heightSegments: r });
    const s = e / 2,
      a = t / 2,
      o = Math.floor(n),
      l = Math.floor(r),
      c = o + 1,
      u = l + 1,
      h = e / o,
      f = t / l,
      m = [],
      g = [],
      S = [],
      p = [];
    for (let d = 0; d < u; d++) {
      const E = d * f - a;
      for (let b = 0; b < c; b++) {
        const y = b * h - s;
        g.push(y, -E, 0), S.push(0, 0, 1), p.push(b / o), p.push(1 - d / l);
      }
    }
    for (let d = 0; d < l; d++)
      for (let E = 0; E < o; E++) {
        const b = E + c * d,
          y = E + c * (d + 1),
          P = E + 1 + c * (d + 1),
          R = E + 1 + c * d;
        m.push(b, y, R), m.push(y, P, R);
      }
    this.setIndex(m),
      this.setAttribute('position', new wt(g, 3)),
      this.setAttribute('normal', new wt(S, 3)),
      this.setAttribute('uv', new wt(p, 2));
  }
  copy(e) {
    return super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this;
  }
  static fromJSON(e) {
    return new Li(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
class za extends Jt {
  constructor(e = 1, t = 32, n = 16, r = 0, s = Math.PI * 2, a = 0, o = Math.PI) {
    super(),
      (this.type = 'SphereGeometry'),
      (this.parameters = {
        radius: e,
        widthSegments: t,
        heightSegments: n,
        phiStart: r,
        phiLength: s,
        thetaStart: a,
        thetaLength: o,
      }),
      (t = Math.max(3, Math.floor(t))),
      (n = Math.max(2, Math.floor(n)));
    const l = Math.min(a + o, Math.PI);
    let c = 0;
    const u = [],
      h = new F(),
      f = new F(),
      m = [],
      g = [],
      S = [],
      p = [];
    for (let d = 0; d <= n; d++) {
      const E = [],
        b = d / n;
      let y = 0;
      d === 0 && a === 0 ? (y = 0.5 / t) : d === n && l === Math.PI && (y = -0.5 / t);
      for (let P = 0; P <= t; P++) {
        const R = P / t;
        (h.x = -e * Math.cos(r + R * s) * Math.sin(a + b * o)),
          (h.y = e * Math.cos(a + b * o)),
          (h.z = e * Math.sin(r + R * s) * Math.sin(a + b * o)),
          g.push(h.x, h.y, h.z),
          f.copy(h).normalize(),
          S.push(f.x, f.y, f.z),
          p.push(R + y, 1 - b),
          E.push(c++);
      }
      u.push(E);
    }
    for (let d = 0; d < n; d++)
      for (let E = 0; E < t; E++) {
        const b = u[d][E + 1],
          y = u[d][E],
          P = u[d + 1][E],
          R = u[d + 1][E + 1];
        (d !== 0 || a > 0) && m.push(b, y, R), (d !== n - 1 || l < Math.PI) && m.push(y, P, R);
      }
    this.setIndex(m),
      this.setAttribute('position', new wt(g, 3)),
      this.setAttribute('normal', new wt(S, 3)),
      this.setAttribute('uv', new wt(p, 2));
  }
  copy(e) {
    return super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this;
  }
  static fromJSON(e) {
    return new za(
      e.radius,
      e.widthSegments,
      e.heightSegments,
      e.phiStart,
      e.phiLength,
      e.thetaStart,
      e.thetaLength,
    );
  }
}
class Ss extends ar {
  constructor(e) {
    super(),
      (this.isMeshStandardMaterial = !0),
      (this.type = 'MeshStandardMaterial'),
      (this.defines = { STANDARD: '' }),
      (this.color = new ke(16777215)),
      (this.roughness = 1),
      (this.metalness = 0),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.emissive = new ke(0)),
      (this.emissiveIntensity = 1),
      (this.emissiveMap = null),
      (this.bumpMap = null),
      (this.bumpScale = 1),
      (this.normalMap = null),
      (this.normalMapType = Rl),
      (this.normalScale = new We(1, 1)),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.roughnessMap = null),
      (this.metalnessMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new on()),
      (this.envMapIntensity = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = 'round'),
      (this.wireframeLinejoin = 'round'),
      (this.flatShading = !1),
      (this.fog = !0),
      this.setValues(e);
  }
  copy(e) {
    return (
      super.copy(e),
      (this.defines = { STANDARD: '' }),
      this.color.copy(e.color),
      (this.roughness = e.roughness),
      (this.metalness = e.metalness),
      (this.map = e.map),
      (this.lightMap = e.lightMap),
      (this.lightMapIntensity = e.lightMapIntensity),
      (this.aoMap = e.aoMap),
      (this.aoMapIntensity = e.aoMapIntensity),
      this.emissive.copy(e.emissive),
      (this.emissiveMap = e.emissiveMap),
      (this.emissiveIntensity = e.emissiveIntensity),
      (this.bumpMap = e.bumpMap),
      (this.bumpScale = e.bumpScale),
      (this.normalMap = e.normalMap),
      (this.normalMapType = e.normalMapType),
      this.normalScale.copy(e.normalScale),
      (this.displacementMap = e.displacementMap),
      (this.displacementScale = e.displacementScale),
      (this.displacementBias = e.displacementBias),
      (this.roughnessMap = e.roughnessMap),
      (this.metalnessMap = e.metalnessMap),
      (this.alphaMap = e.alphaMap),
      (this.envMap = e.envMap),
      this.envMapRotation.copy(e.envMapRotation),
      (this.envMapIntensity = e.envMapIntensity),
      (this.wireframe = e.wireframe),
      (this.wireframeLinewidth = e.wireframeLinewidth),
      (this.wireframeLinecap = e.wireframeLinecap),
      (this.wireframeLinejoin = e.wireframeLinejoin),
      (this.flatShading = e.flatShading),
      (this.fog = e.fog),
      this
    );
  }
}
class jh extends ar {
  constructor(e) {
    super(),
      (this.isMeshDepthMaterial = !0),
      (this.type = 'MeshDepthMaterial'),
      (this.depthPacking = qc),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      this.setValues(e);
  }
  copy(e) {
    return (
      super.copy(e),
      (this.depthPacking = e.depthPacking),
      (this.map = e.map),
      (this.alphaMap = e.alphaMap),
      (this.displacementMap = e.displacementMap),
      (this.displacementScale = e.displacementScale),
      (this.displacementBias = e.displacementBias),
      (this.wireframe = e.wireframe),
      (this.wireframeLinewidth = e.wireframeLinewidth),
      this
    );
  }
}
class Jh extends ar {
  constructor(e) {
    super(),
      (this.isMeshDistanceMaterial = !0),
      (this.type = 'MeshDistanceMaterial'),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      this.setValues(e);
  }
  copy(e) {
    return (
      super.copy(e),
      (this.map = e.map),
      (this.alphaMap = e.alphaMap),
      (this.displacementMap = e.displacementMap),
      (this.displacementScale = e.displacementScale),
      (this.displacementBias = e.displacementBias),
      this
    );
  }
}
class Gl extends Mt {
  constructor(e, t = 1) {
    super(),
      (this.isLight = !0),
      (this.type = 'Light'),
      (this.color = new ke(e)),
      (this.intensity = t);
  }
  dispose() {}
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), (this.intensity = e.intensity), this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return (
      (t.object.color = this.color.getHex()),
      (t.object.intensity = this.intensity),
      this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()),
      this.distance !== void 0 && (t.object.distance = this.distance),
      this.angle !== void 0 && (t.object.angle = this.angle),
      this.decay !== void 0 && (t.object.decay = this.decay),
      this.penumbra !== void 0 && (t.object.penumbra = this.penumbra),
      this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()),
      this.target !== void 0 && (t.object.target = this.target.uuid),
      t
    );
  }
}
class Qh extends Gl {
  constructor(e, t, n) {
    super(e, n),
      (this.isHemisphereLight = !0),
      (this.type = 'HemisphereLight'),
      this.position.copy(Mt.DEFAULT_UP),
      this.updateMatrix(),
      (this.groundColor = new ke(t));
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const ys = new rt(),
  Do = new F(),
  Io = new F();
class eu {
  constructor(e) {
    (this.camera = e),
      (this.intensity = 1),
      (this.bias = 0),
      (this.normalBias = 0),
      (this.radius = 1),
      (this.blurSamples = 8),
      (this.mapSize = new We(512, 512)),
      (this.mapType = an),
      (this.map = null),
      (this.mapPass = null),
      (this.matrix = new rt()),
      (this.autoUpdate = !0),
      (this.needsUpdate = !1),
      (this._frustum = new Fa()),
      (this._frameExtents = new We(1, 1)),
      (this._viewportCount = 1),
      (this._viewports = [new dt(0, 0, 1, 1)]);
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera,
      n = this.matrix;
    Do.setFromMatrixPosition(e.matrixWorld),
      t.position.copy(Do),
      Io.setFromMatrixPosition(e.target.matrixWorld),
      t.lookAt(Io),
      t.updateMatrixWorld(),
      ys.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse),
      this._frustum.setFromProjectionMatrix(ys, t.coordinateSystem, t.reversedDepth),
      t.reversedDepth
        ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1)
        : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
      n.multiply(ys);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return (
      (this.camera = e.camera.clone()),
      (this.intensity = e.intensity),
      (this.bias = e.bias),
      (this.radius = e.radius),
      (this.autoUpdate = e.autoUpdate),
      (this.needsUpdate = e.needsUpdate),
      (this.normalBias = e.normalBias),
      (this.blurSamples = e.blurSamples),
      this.mapSize.copy(e.mapSize),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return (
      this.intensity !== 1 && (e.intensity = this.intensity),
      this.bias !== 0 && (e.bias = this.bias),
      this.normalBias !== 0 && (e.normalBias = this.normalBias),
      this.radius !== 1 && (e.radius = this.radius),
      (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()),
      (e.camera = this.camera.toJSON(!1).object),
      delete e.camera.matrix,
      e
    );
  }
}
class Vl extends Bl {
  constructor(e = -1, t = 1, n = 1, r = -1, s = 0.1, a = 2e3) {
    super(),
      (this.isOrthographicCamera = !0),
      (this.type = 'OrthographicCamera'),
      (this.zoom = 1),
      (this.view = null),
      (this.left = e),
      (this.right = t),
      (this.top = n),
      (this.bottom = r),
      (this.near = s),
      (this.far = a),
      this.updateProjectionMatrix();
  }
  copy(e, t) {
    return (
      super.copy(e, t),
      (this.left = e.left),
      (this.right = e.right),
      (this.top = e.top),
      (this.bottom = e.bottom),
      (this.near = e.near),
      (this.far = e.far),
      (this.zoom = e.zoom),
      (this.view = e.view === null ? null : Object.assign({}, e.view)),
      this
    );
  }
  setViewOffset(e, t, n, r, s, a) {
    this.view === null &&
      (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      }),
      (this.view.enabled = !0),
      (this.view.fullWidth = e),
      (this.view.fullHeight = t),
      (this.view.offsetX = n),
      (this.view.offsetY = r),
      (this.view.width = s),
      (this.view.height = a),
      this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom),
      t = (this.top - this.bottom) / (2 * this.zoom),
      n = (this.right + this.left) / 2,
      r = (this.top + this.bottom) / 2;
    let s = n - e,
      a = n + e,
      o = r + t,
      l = r - t;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom,
        u = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      (s += c * this.view.offsetX),
        (a = s + c * this.view.width),
        (o -= u * this.view.offsetY),
        (l = o - u * this.view.height);
    }
    this.projectionMatrix.makeOrthographic(
      s,
      a,
      o,
      l,
      this.near,
      this.far,
      this.coordinateSystem,
      this.reversedDepth,
    ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return (
      (t.object.zoom = this.zoom),
      (t.object.left = this.left),
      (t.object.right = this.right),
      (t.object.top = this.top),
      (t.object.bottom = this.bottom),
      (t.object.near = this.near),
      (t.object.far = this.far),
      this.view !== null && (t.object.view = Object.assign({}, this.view)),
      t
    );
  }
}
class tu extends eu {
  constructor() {
    super(new Vl(-5, 5, 5, -5, 0.5, 500)), (this.isDirectionalLightShadow = !0);
  }
}
class nu extends Gl {
  constructor(e, t) {
    super(e, t),
      (this.isDirectionalLight = !0),
      (this.type = 'DirectionalLight'),
      this.position.copy(Mt.DEFAULT_UP),
      this.updateMatrix(),
      (this.target = new Mt()),
      (this.shadow = new tu());
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), (this.target = e.target.clone()), (this.shadow = e.shadow.clone()), this;
  }
}
class iu extends Wt {
  constructor(e = []) {
    super(), (this.isArrayCamera = !0), (this.isMultiViewCamera = !1), (this.cameras = e);
  }
}
class ru {
  constructor(e = !0) {
    (this.autoStart = e),
      (this.startTime = 0),
      (this.oldTime = 0),
      (this.elapsedTime = 0),
      (this.running = !1);
  }
  start() {
    (this.startTime = performance.now()),
      (this.oldTime = this.startTime),
      (this.elapsedTime = 0),
      (this.running = !0);
  }
  stop() {
    this.getElapsedTime(), (this.running = !1), (this.autoStart = !1);
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let e = 0;
    if (this.autoStart && !this.running) return this.start(), 0;
    if (this.running) {
      const t = performance.now();
      (e = (t - this.oldTime) / 1e3), (this.oldTime = t), (this.elapsedTime += e);
    }
    return e;
  }
}
const Uo = new rt();
class su {
  constructor(e, t, n = 0, r = 1 / 0) {
    (this.ray = new Dl(e, t)),
      (this.near = n),
      (this.far = r),
      (this.camera = null),
      (this.layers = new Ua()),
      (this.params = {
        Mesh: {},
        Line: { threshold: 1 },
        LOD: {},
        Points: { threshold: 1 },
        Sprite: {},
      });
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera
      ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld),
        this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(),
        (this.camera = t))
      : t.isOrthographicCamera
        ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t),
          this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld),
          (this.camera = t))
        : console.error('THREE.Raycaster: Unsupported camera type: ' + t.type);
  }
  setFromXRController(e) {
    return (
      Uo.identity().extractRotation(e.matrixWorld),
      this.ray.origin.setFromMatrixPosition(e.matrixWorld),
      this.ray.direction.set(0, 0, -1).applyMatrix4(Uo),
      this
    );
  }
  intersectObject(e, t = !0, n = []) {
    return xa(e, this, n, t), n.sort(No), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let r = 0, s = e.length; r < s; r++) xa(e[r], this, n, t);
    return n.sort(No), n;
  }
}
function No(i, e) {
  return i.distance - e.distance;
}
function xa(i, e, t, n) {
  let r = !0;
  if ((i.layers.test(e.layers) && i.raycast(e, t) === !1 && (r = !1), r === !0 && n === !0)) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++) xa(s[a], e, t, !0);
  }
}
function Fo(i, e, t, n) {
  const r = au(n);
  switch (t) {
    case Tl:
      return i * e;
    case Ra:
      return ((i * e) / r.components) * r.byteLength;
    case Ca:
      return ((i * e) / r.components) * r.byteLength;
    case wl:
      return ((i * e * 2) / r.components) * r.byteLength;
    case Pa:
      return ((i * e * 2) / r.components) * r.byteLength;
    case Al:
      return ((i * e * 3) / r.components) * r.byteLength;
    case jt:
      return ((i * e * 4) / r.components) * r.byteLength;
    case La:
      return ((i * e * 4) / r.components) * r.byteLength;
    case Nr:
    case Fr:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case Or:
    case Br:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case qs:
    case Ys:
      return (Math.max(i, 16) * Math.max(e, 8)) / 4;
    case Xs:
    case $s:
      return (Math.max(i, 8) * Math.max(e, 8)) / 2;
    case Ks:
    case Zs:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case js:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Js:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Qs:
      return Math.floor((i + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case ea:
      return Math.floor((i + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case ta:
      return Math.floor((i + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case na:
      return Math.floor((i + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case ia:
      return Math.floor((i + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case ra:
      return Math.floor((i + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case sa:
      return Math.floor((i + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case aa:
      return Math.floor((i + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case oa:
      return Math.floor((i + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case la:
      return Math.floor((i + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case ca:
      return Math.floor((i + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case ha:
      return Math.floor((i + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case ua:
      return Math.floor((i + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case da:
    case fa:
    case pa:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
    case ma:
    case ga:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 8;
    case _a:
    case va:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${t} format.`);
}
function au(i) {
  switch (i) {
    case an:
    case Sl:
      return { byteLength: 1, components: 1 };
    case Ki:
    case yl:
    case ir:
      return { byteLength: 2, components: 1 };
    case Aa:
    case wa:
      return { byteLength: 2, components: 4 };
    case Kn:
    case Ta:
    case rn:
      return { byteLength: 4, components: 1 };
    case bl:
    case El:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < 'u' &&
  __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('register', { detail: { revision: Ea } }));
typeof window < 'u' &&
  (window.__THREE__
    ? console.warn('WARNING: Multiple instances of Three.js being imported.')
    : (window.__THREE__ = Ea));
function Wl() {
  let i = null,
    e = !1,
    t = null,
    n = null;
  function r(s, a) {
    t(s, a), (n = i.requestAnimationFrame(r));
  }
  return {
    start: function () {
      e !== !0 && t !== null && ((n = i.requestAnimationFrame(r)), (e = !0));
    },
    stop: function () {
      i.cancelAnimationFrame(n), (e = !1);
    },
    setAnimationLoop: function (s) {
      t = s;
    },
    setContext: function (s) {
      i = s;
    },
  };
}
function ou(i) {
  const e = new WeakMap();
  function t(o, l) {
    const c = o.array,
      u = o.usage,
      h = c.byteLength,
      f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, c, u), o.onUploadCallback();
    let m;
    if (c instanceof Float32Array) m = i.FLOAT;
    else if (typeof Float16Array < 'u' && c instanceof Float16Array) m = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? (m = i.HALF_FLOAT) : (m = i.UNSIGNED_SHORT);
    else if (c instanceof Int16Array) m = i.SHORT;
    else if (c instanceof Uint32Array) m = i.UNSIGNED_INT;
    else if (c instanceof Int32Array) m = i.INT;
    else if (c instanceof Int8Array) m = i.BYTE;
    else if (c instanceof Uint8Array) m = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) m = i.UNSIGNED_BYTE;
    else throw new Error('THREE.WebGLAttributes: Unsupported buffer data format: ' + c);
    return {
      buffer: f,
      type: m,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: h,
    };
  }
  function n(o, l, c) {
    const u = l.array,
      h = l.updateRanges;
    if ((i.bindBuffer(c, o), h.length === 0)) i.bufferSubData(c, 0, u);
    else {
      h.sort((m, g) => m.start - g.start);
      let f = 0;
      for (let m = 1; m < h.length; m++) {
        const g = h[f],
          S = h[m];
        S.start <= g.start + g.count + 1
          ? (g.count = Math.max(g.count, S.start + S.count - g.start))
          : (++f, (h[f] = S));
      }
      h.length = f + 1;
      for (let m = 0, g = h.length; m < g; m++) {
        const S = h[m];
        i.bufferSubData(c, S.start * u.BYTES_PER_ELEMENT, u, S.start, S.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = e.get(o);
    l && (i.deleteBuffer(l.buffer), e.delete(o));
  }
  function a(o, l) {
    if ((o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute)) {
      const u = e.get(o);
      (!u || u.version < o.version) &&
        e.set(o, {
          buffer: o.buffer,
          type: o.type,
          bytesPerElement: o.elementSize,
          version: o.version,
        });
      return;
    }
    const c = e.get(o);
    if (c === void 0) e.set(o, t(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength)
        throw new Error(
          "THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.",
        );
      n(c.buffer, o, l), (c.version = o.version);
    }
  }
  return { get: r, remove: s, update: a };
}
var lu = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  cu = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  hu = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  uu = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  du = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  fu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  pu = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  mu = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  gu = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  _u = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  vu = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  xu = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  Mu = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  Su = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  yu = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  bu = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  Eu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  Tu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  Au = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  wu = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  Ru = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  Cu = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  Pu = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  Lu = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  Du = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  Iu = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  Uu = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  Nu = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  Fu = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  Ou = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  Bu = 'gl_FragColor = linearToOutputTexel( gl_FragColor );',
  zu = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  ku = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  Hu = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  Gu = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  Vu = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  Wu = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  Xu = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  qu = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  $u = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  Yu = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  Ku = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  Zu = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  ju = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  Ju = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  Qu = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  ed = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  td = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  nd = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  id = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  rd = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  sd = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  ad = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  od = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  ld = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  cd = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  hd = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  ud = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  dd = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  fd = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  pd = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  md = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  gd = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  _d = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  vd = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  xd = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  Md = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  Sd = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  yd = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  bd = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  Ed = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Td = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  Ad = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  wd = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Rd = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Cd = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  Pd = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  Ld = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  Dd = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  Id = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  Ud = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  Nd = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  Fd = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  Od = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  Bd = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  zd = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  kd = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  Hd = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  Gd = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  Vd = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  Wd = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  Xd = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  qd = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  $d = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  Yd = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  Kd = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  Zd = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  jd = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  Jd = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  Qd = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  ef = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  tf = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  nf = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  rf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  sf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  af = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  of = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const lf = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  cf = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  hf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  uf = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  df = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  ff = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  pf = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  mf = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  gf = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  _f = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  vf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  xf = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Mf = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Sf = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  yf = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  bf = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Ef = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Tf = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Af = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  wf = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Rf = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  Cf = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  Pf = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Lf = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Df = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  If = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Uf = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Nf = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Ff = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  Of = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Bf = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  zf = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  kf = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Hf = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  ze = {
    alphahash_fragment: lu,
    alphahash_pars_fragment: cu,
    alphamap_fragment: hu,
    alphamap_pars_fragment: uu,
    alphatest_fragment: du,
    alphatest_pars_fragment: fu,
    aomap_fragment: pu,
    aomap_pars_fragment: mu,
    batching_pars_vertex: gu,
    batching_vertex: _u,
    begin_vertex: vu,
    beginnormal_vertex: xu,
    bsdfs: Mu,
    iridescence_fragment: Su,
    bumpmap_pars_fragment: yu,
    clipping_planes_fragment: bu,
    clipping_planes_pars_fragment: Eu,
    clipping_planes_pars_vertex: Tu,
    clipping_planes_vertex: Au,
    color_fragment: wu,
    color_pars_fragment: Ru,
    color_pars_vertex: Cu,
    color_vertex: Pu,
    common: Lu,
    cube_uv_reflection_fragment: Du,
    defaultnormal_vertex: Iu,
    displacementmap_pars_vertex: Uu,
    displacementmap_vertex: Nu,
    emissivemap_fragment: Fu,
    emissivemap_pars_fragment: Ou,
    colorspace_fragment: Bu,
    colorspace_pars_fragment: zu,
    envmap_fragment: ku,
    envmap_common_pars_fragment: Hu,
    envmap_pars_fragment: Gu,
    envmap_pars_vertex: Vu,
    envmap_physical_pars_fragment: ed,
    envmap_vertex: Wu,
    fog_vertex: Xu,
    fog_pars_vertex: qu,
    fog_fragment: $u,
    fog_pars_fragment: Yu,
    gradientmap_pars_fragment: Ku,
    lightmap_pars_fragment: Zu,
    lights_lambert_fragment: ju,
    lights_lambert_pars_fragment: Ju,
    lights_pars_begin: Qu,
    lights_toon_fragment: td,
    lights_toon_pars_fragment: nd,
    lights_phong_fragment: id,
    lights_phong_pars_fragment: rd,
    lights_physical_fragment: sd,
    lights_physical_pars_fragment: ad,
    lights_fragment_begin: od,
    lights_fragment_maps: ld,
    lights_fragment_end: cd,
    logdepthbuf_fragment: hd,
    logdepthbuf_pars_fragment: ud,
    logdepthbuf_pars_vertex: dd,
    logdepthbuf_vertex: fd,
    map_fragment: pd,
    map_pars_fragment: md,
    map_particle_fragment: gd,
    map_particle_pars_fragment: _d,
    metalnessmap_fragment: vd,
    metalnessmap_pars_fragment: xd,
    morphinstance_vertex: Md,
    morphcolor_vertex: Sd,
    morphnormal_vertex: yd,
    morphtarget_pars_vertex: bd,
    morphtarget_vertex: Ed,
    normal_fragment_begin: Td,
    normal_fragment_maps: Ad,
    normal_pars_fragment: wd,
    normal_pars_vertex: Rd,
    normal_vertex: Cd,
    normalmap_pars_fragment: Pd,
    clearcoat_normal_fragment_begin: Ld,
    clearcoat_normal_fragment_maps: Dd,
    clearcoat_pars_fragment: Id,
    iridescence_pars_fragment: Ud,
    opaque_fragment: Nd,
    packing: Fd,
    premultiplied_alpha_fragment: Od,
    project_vertex: Bd,
    dithering_fragment: zd,
    dithering_pars_fragment: kd,
    roughnessmap_fragment: Hd,
    roughnessmap_pars_fragment: Gd,
    shadowmap_pars_fragment: Vd,
    shadowmap_pars_vertex: Wd,
    shadowmap_vertex: Xd,
    shadowmask_pars_fragment: qd,
    skinbase_vertex: $d,
    skinning_pars_vertex: Yd,
    skinning_vertex: Kd,
    skinnormal_vertex: Zd,
    specularmap_fragment: jd,
    specularmap_pars_fragment: Jd,
    tonemapping_fragment: Qd,
    tonemapping_pars_fragment: ef,
    transmission_fragment: tf,
    transmission_pars_fragment: nf,
    uv_pars_fragment: rf,
    uv_pars_vertex: sf,
    uv_vertex: af,
    worldpos_vertex: of,
    background_vert: lf,
    background_frag: cf,
    backgroundCube_vert: hf,
    backgroundCube_frag: uf,
    cube_vert: df,
    cube_frag: ff,
    depth_vert: pf,
    depth_frag: mf,
    distanceRGBA_vert: gf,
    distanceRGBA_frag: _f,
    equirect_vert: vf,
    equirect_frag: xf,
    linedashed_vert: Mf,
    linedashed_frag: Sf,
    meshbasic_vert: yf,
    meshbasic_frag: bf,
    meshlambert_vert: Ef,
    meshlambert_frag: Tf,
    meshmatcap_vert: Af,
    meshmatcap_frag: wf,
    meshnormal_vert: Rf,
    meshnormal_frag: Cf,
    meshphong_vert: Pf,
    meshphong_frag: Lf,
    meshphysical_vert: Df,
    meshphysical_frag: If,
    meshtoon_vert: Uf,
    meshtoon_frag: Nf,
    points_vert: Ff,
    points_frag: Of,
    shadow_vert: Bf,
    shadow_frag: zf,
    sprite_vert: kf,
    sprite_frag: Hf,
  },
  oe = {
    common: {
      diffuse: { value: new ke(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: new Oe() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Oe() },
      alphaTest: { value: 0 },
    },
    specularmap: { specularMap: { value: null }, specularMapTransform: { value: new Oe() } },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: new Oe() },
      flipEnvMap: { value: -1 },
      reflectivity: { value: 1 },
      ior: { value: 1.5 },
      refractionRatio: { value: 0.98 },
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: new Oe() },
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: new Oe() },
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: new Oe() },
      bumpScale: { value: 1 },
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: new Oe() },
      normalScale: { value: new We(1, 1) },
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: new Oe() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 },
    },
    emissivemap: { emissiveMap: { value: null }, emissiveMapTransform: { value: new Oe() } },
    metalnessmap: { metalnessMap: { value: null }, metalnessMapTransform: { value: new Oe() } },
    roughnessmap: { roughnessMap: { value: null }, roughnessMapTransform: { value: new Oe() } },
    gradientmap: { gradientMap: { value: null } },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: new ke(16777215) },
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: { value: [], properties: { direction: {}, color: {} } },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      directionalShadowMap: { value: [] },
      directionalShadowMatrix: { value: [] },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {},
        },
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      spotLightMap: { value: [] },
      spotShadowMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: { value: [], properties: { color: {}, position: {}, decay: {}, distance: {} } },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {},
        },
      },
      pointShadowMap: { value: [] },
      pointShadowMatrix: { value: [] },
      hemisphereLights: { value: [], properties: { direction: {}, skyColor: {}, groundColor: {} } },
      rectAreaLights: { value: [], properties: { color: {}, position: {}, width: {}, height: {} } },
      ltc_1: { value: null },
      ltc_2: { value: null },
    },
    points: {
      diffuse: { value: new ke(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Oe() },
      alphaTest: { value: 0 },
      uvTransform: { value: new Oe() },
    },
    sprite: {
      diffuse: { value: new ke(16777215) },
      opacity: { value: 1 },
      center: { value: new We(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: new Oe() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Oe() },
      alphaTest: { value: 0 },
    },
  },
  en = {
    basic: {
      uniforms: Pt([oe.common, oe.specularmap, oe.envmap, oe.aomap, oe.lightmap, oe.fog]),
      vertexShader: ze.meshbasic_vert,
      fragmentShader: ze.meshbasic_frag,
    },
    lambert: {
      uniforms: Pt([
        oe.common,
        oe.specularmap,
        oe.envmap,
        oe.aomap,
        oe.lightmap,
        oe.emissivemap,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        oe.fog,
        oe.lights,
        { emissive: { value: new ke(0) } },
      ]),
      vertexShader: ze.meshlambert_vert,
      fragmentShader: ze.meshlambert_frag,
    },
    phong: {
      uniforms: Pt([
        oe.common,
        oe.specularmap,
        oe.envmap,
        oe.aomap,
        oe.lightmap,
        oe.emissivemap,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        oe.fog,
        oe.lights,
        {
          emissive: { value: new ke(0) },
          specular: { value: new ke(1118481) },
          shininess: { value: 30 },
        },
      ]),
      vertexShader: ze.meshphong_vert,
      fragmentShader: ze.meshphong_frag,
    },
    standard: {
      uniforms: Pt([
        oe.common,
        oe.envmap,
        oe.aomap,
        oe.lightmap,
        oe.emissivemap,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        oe.roughnessmap,
        oe.metalnessmap,
        oe.fog,
        oe.lights,
        {
          emissive: { value: new ke(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 },
        },
      ]),
      vertexShader: ze.meshphysical_vert,
      fragmentShader: ze.meshphysical_frag,
    },
    toon: {
      uniforms: Pt([
        oe.common,
        oe.aomap,
        oe.lightmap,
        oe.emissivemap,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        oe.gradientmap,
        oe.fog,
        oe.lights,
        { emissive: { value: new ke(0) } },
      ]),
      vertexShader: ze.meshtoon_vert,
      fragmentShader: ze.meshtoon_frag,
    },
    matcap: {
      uniforms: Pt([
        oe.common,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        oe.fog,
        { matcap: { value: null } },
      ]),
      vertexShader: ze.meshmatcap_vert,
      fragmentShader: ze.meshmatcap_frag,
    },
    points: {
      uniforms: Pt([oe.points, oe.fog]),
      vertexShader: ze.points_vert,
      fragmentShader: ze.points_frag,
    },
    dashed: {
      uniforms: Pt([
        oe.common,
        oe.fog,
        { scale: { value: 1 }, dashSize: { value: 1 }, totalSize: { value: 2 } },
      ]),
      vertexShader: ze.linedashed_vert,
      fragmentShader: ze.linedashed_frag,
    },
    depth: {
      uniforms: Pt([oe.common, oe.displacementmap]),
      vertexShader: ze.depth_vert,
      fragmentShader: ze.depth_frag,
    },
    normal: {
      uniforms: Pt([
        oe.common,
        oe.bumpmap,
        oe.normalmap,
        oe.displacementmap,
        { opacity: { value: 1 } },
      ]),
      vertexShader: ze.meshnormal_vert,
      fragmentShader: ze.meshnormal_frag,
    },
    sprite: {
      uniforms: Pt([oe.sprite, oe.fog]),
      vertexShader: ze.sprite_vert,
      fragmentShader: ze.sprite_frag,
    },
    background: {
      uniforms: {
        uvTransform: { value: new Oe() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 },
      },
      vertexShader: ze.background_vert,
      fragmentShader: ze.background_frag,
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: new Oe() },
      },
      vertexShader: ze.backgroundCube_vert,
      fragmentShader: ze.backgroundCube_frag,
    },
    cube: {
      uniforms: { tCube: { value: null }, tFlip: { value: -1 }, opacity: { value: 1 } },
      vertexShader: ze.cube_vert,
      fragmentShader: ze.cube_frag,
    },
    equirect: {
      uniforms: { tEquirect: { value: null } },
      vertexShader: ze.equirect_vert,
      fragmentShader: ze.equirect_frag,
    },
    distanceRGBA: {
      uniforms: Pt([
        oe.common,
        oe.displacementmap,
        {
          referencePosition: { value: new F() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 },
        },
      ]),
      vertexShader: ze.distanceRGBA_vert,
      fragmentShader: ze.distanceRGBA_frag,
    },
    shadow: {
      uniforms: Pt([oe.lights, oe.fog, { color: { value: new ke(0) }, opacity: { value: 1 } }]),
      vertexShader: ze.shadow_vert,
      fragmentShader: ze.shadow_frag,
    },
  };
en.physical = {
  uniforms: Pt([
    en.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: new Oe() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: new Oe() },
      clearcoatNormalScale: { value: new We(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: new Oe() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: new Oe() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: new Oe() },
      sheen: { value: 0 },
      sheenColor: { value: new ke(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: new Oe() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: new Oe() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: new Oe() },
      transmissionSamplerSize: { value: new We() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: new Oe() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: new ke(0) },
      specularColor: { value: new ke(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: new Oe() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: new Oe() },
      anisotropyVector: { value: new We() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: new Oe() },
    },
  ]),
  vertexShader: ze.meshphysical_vert,
  fragmentShader: ze.meshphysical_frag,
};
const Dr = { r: 0, b: 0, g: 0 },
  kn = new on(),
  Gf = new rt();
function Vf(i, e, t, n, r, s, a) {
  const o = new ke(0);
  let l = s === !0 ? 0 : 1,
    c,
    u,
    h = null,
    f = 0,
    m = null;
  function g(b) {
    let y = b.isScene === !0 ? b.background : null;
    return y && y.isTexture && (y = (b.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function S(b) {
    let y = !1;
    const P = g(b);
    P === null ? d(o, l) : P && P.isColor && (d(P, 1), (y = !0));
    const R = i.xr.getEnvironmentBlendMode();
    R === 'additive'
      ? n.buffers.color.setClear(0, 0, 0, 1, a)
      : R === 'alpha-blend' && n.buffers.color.setClear(0, 0, 0, 0, a),
      (i.autoClear || y) &&
        (n.buffers.depth.setTest(!0),
        n.buffers.depth.setMask(!0),
        n.buffers.color.setMask(!0),
        i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function p(b, y) {
    const P = g(y);
    P && (P.isCubeTexture || P.mapping === qr)
      ? (u === void 0 &&
          ((u = new St(
            new Ni(1, 1, 1),
            new gn({
              name: 'BackgroundCubeMaterial',
              uniforms: Pi(en.backgroundCube.uniforms),
              vertexShader: en.backgroundCube.vertexShader,
              fragmentShader: en.backgroundCube.fragmentShader,
              side: Lt,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          u.geometry.deleteAttribute('normal'),
          u.geometry.deleteAttribute('uv'),
          (u.onBeforeRender = function (R, L, A) {
            this.matrixWorld.copyPosition(A.matrixWorld);
          }),
          Object.defineProperty(u.material, 'envMap', {
            get: function () {
              return this.uniforms.envMap.value;
            },
          }),
          r.update(u)),
        kn.copy(y.backgroundRotation),
        (kn.x *= -1),
        (kn.y *= -1),
        (kn.z *= -1),
        P.isCubeTexture && P.isRenderTargetTexture === !1 && ((kn.y *= -1), (kn.z *= -1)),
        (u.material.uniforms.envMap.value = P),
        (u.material.uniforms.flipEnvMap.value =
          P.isCubeTexture && P.isRenderTargetTexture === !1 ? -1 : 1),
        (u.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness),
        (u.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        u.material.uniforms.backgroundRotation.value.setFromMatrix4(Gf.makeRotationFromEuler(kn)),
        (u.material.toneMapped = Ye.getTransfer(P.colorSpace) !== Je),
        (h !== P || f !== P.version || m !== i.toneMapping) &&
          ((u.material.needsUpdate = !0), (h = P), (f = P.version), (m = i.toneMapping)),
        u.layers.enableAll(),
        b.unshift(u, u.geometry, u.material, 0, 0, null))
      : P &&
        P.isTexture &&
        (c === void 0 &&
          ((c = new St(
            new Li(2, 2),
            new gn({
              name: 'BackgroundMaterial',
              uniforms: Pi(en.background.uniforms),
              vertexShader: en.background.vertexShader,
              fragmentShader: en.background.fragmentShader,
              side: Pn,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          c.geometry.deleteAttribute('normal'),
          Object.defineProperty(c.material, 'map', {
            get: function () {
              return this.uniforms.t2D.value;
            },
          }),
          r.update(c)),
        (c.material.uniforms.t2D.value = P),
        (c.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        (c.material.toneMapped = Ye.getTransfer(P.colorSpace) !== Je),
        P.matrixAutoUpdate === !0 && P.updateMatrix(),
        c.material.uniforms.uvTransform.value.copy(P.matrix),
        (h !== P || f !== P.version || m !== i.toneMapping) &&
          ((c.material.needsUpdate = !0), (h = P), (f = P.version), (m = i.toneMapping)),
        c.layers.enableAll(),
        b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function d(b, y) {
    b.getRGB(Dr, Ol(i)), n.buffers.color.setClear(Dr.r, Dr.g, Dr.b, y, a);
  }
  function E() {
    u !== void 0 && (u.geometry.dispose(), u.material.dispose(), (u = void 0)),
      c !== void 0 && (c.geometry.dispose(), c.material.dispose(), (c = void 0));
  }
  return {
    getClearColor: function () {
      return o;
    },
    setClearColor: function (b, y = 1) {
      o.set(b), (l = y), d(o, l);
    },
    getClearAlpha: function () {
      return l;
    },
    setClearAlpha: function (b) {
      (l = b), d(o, l);
    },
    render: S,
    addToRenderList: p,
    dispose: E,
  };
}
function Wf(i, e) {
  const t = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    n = {},
    r = f(null);
  let s = r,
    a = !1;
  function o(_, w, U, z, G) {
    let V = !1;
    const X = h(z, U, w);
    s !== X && ((s = X), c(s.object)),
      (V = m(_, z, U, G)),
      V && g(_, z, U, G),
      G !== null && e.update(G, i.ELEMENT_ARRAY_BUFFER),
      (V || a) &&
        ((a = !1),
        y(_, w, U, z),
        G !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.get(G).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(_) {
    return i.bindVertexArray(_);
  }
  function u(_) {
    return i.deleteVertexArray(_);
  }
  function h(_, w, U) {
    const z = U.wireframe === !0;
    let G = n[_.id];
    G === void 0 && ((G = {}), (n[_.id] = G));
    let V = G[w.id];
    V === void 0 && ((V = {}), (G[w.id] = V));
    let X = V[z];
    return X === void 0 && ((X = f(l())), (V[z] = X)), X;
  }
  function f(_) {
    const w = [],
      U = [],
      z = [];
    for (let G = 0; G < t; G++) (w[G] = 0), (U[G] = 0), (z[G] = 0);
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: w,
      enabledAttributes: U,
      attributeDivisors: z,
      object: _,
      attributes: {},
      index: null,
    };
  }
  function m(_, w, U, z) {
    const G = s.attributes,
      V = w.attributes;
    let X = 0;
    const Z = U.getAttributes();
    for (const H in Z)
      if (Z[H].location >= 0) {
        const ue = G[H];
        let Ae = V[H];
        if (
          (Ae === void 0 &&
            (H === 'instanceMatrix' && _.instanceMatrix && (Ae = _.instanceMatrix),
            H === 'instanceColor' && _.instanceColor && (Ae = _.instanceColor)),
          ue === void 0 || ue.attribute !== Ae || (Ae && ue.data !== Ae.data))
        )
          return !0;
        X++;
      }
    return s.attributesNum !== X || s.index !== z;
  }
  function g(_, w, U, z) {
    const G = {},
      V = w.attributes;
    let X = 0;
    const Z = U.getAttributes();
    for (const H in Z)
      if (Z[H].location >= 0) {
        let ue = V[H];
        ue === void 0 &&
          (H === 'instanceMatrix' && _.instanceMatrix && (ue = _.instanceMatrix),
          H === 'instanceColor' && _.instanceColor && (ue = _.instanceColor));
        const Ae = {};
        (Ae.attribute = ue), ue && ue.data && (Ae.data = ue.data), (G[H] = Ae), X++;
      }
    (s.attributes = G), (s.attributesNum = X), (s.index = z);
  }
  function S() {
    const _ = s.newAttributes;
    for (let w = 0, U = _.length; w < U; w++) _[w] = 0;
  }
  function p(_) {
    d(_, 0);
  }
  function d(_, w) {
    const U = s.newAttributes,
      z = s.enabledAttributes,
      G = s.attributeDivisors;
    (U[_] = 1),
      z[_] === 0 && (i.enableVertexAttribArray(_), (z[_] = 1)),
      G[_] !== w && (i.vertexAttribDivisor(_, w), (G[_] = w));
  }
  function E() {
    const _ = s.newAttributes,
      w = s.enabledAttributes;
    for (let U = 0, z = w.length; U < z; U++)
      w[U] !== _[U] && (i.disableVertexAttribArray(U), (w[U] = 0));
  }
  function b(_, w, U, z, G, V, X) {
    X === !0 ? i.vertexAttribIPointer(_, w, U, G, V) : i.vertexAttribPointer(_, w, U, z, G, V);
  }
  function y(_, w, U, z) {
    S();
    const G = z.attributes,
      V = U.getAttributes(),
      X = w.defaultAttributeValues;
    for (const Z in V) {
      const H = V[Z];
      if (H.location >= 0) {
        let se = G[Z];
        if (
          (se === void 0 &&
            (Z === 'instanceMatrix' && _.instanceMatrix && (se = _.instanceMatrix),
            Z === 'instanceColor' && _.instanceColor && (se = _.instanceColor)),
          se !== void 0)
        ) {
          const ue = se.normalized,
            Ae = se.itemSize,
            He = e.get(se);
          if (He === void 0) continue;
          const tt = He.buffer,
            st = He.type,
            Ke = He.bytesPerElement,
            $ = st === i.INT || st === i.UNSIGNED_INT || se.gpuType === Ta;
          if (se.isInterleavedBufferAttribute) {
            const J = se.data,
              me = J.stride,
              Ie = se.offset;
            if (J.isInstancedInterleavedBuffer) {
              for (let Te = 0; Te < H.locationSize; Te++) d(H.location + Te, J.meshPerAttribute);
              _.isInstancedMesh !== !0 &&
                z._maxInstanceCount === void 0 &&
                (z._maxInstanceCount = J.meshPerAttribute * J.count);
            } else for (let Te = 0; Te < H.locationSize; Te++) p(H.location + Te);
            i.bindBuffer(i.ARRAY_BUFFER, tt);
            for (let Te = 0; Te < H.locationSize; Te++)
              b(
                H.location + Te,
                Ae / H.locationSize,
                st,
                ue,
                me * Ke,
                (Ie + (Ae / H.locationSize) * Te) * Ke,
                $,
              );
          } else {
            if (se.isInstancedBufferAttribute) {
              for (let J = 0; J < H.locationSize; J++) d(H.location + J, se.meshPerAttribute);
              _.isInstancedMesh !== !0 &&
                z._maxInstanceCount === void 0 &&
                (z._maxInstanceCount = se.meshPerAttribute * se.count);
            } else for (let J = 0; J < H.locationSize; J++) p(H.location + J);
            i.bindBuffer(i.ARRAY_BUFFER, tt);
            for (let J = 0; J < H.locationSize; J++)
              b(
                H.location + J,
                Ae / H.locationSize,
                st,
                ue,
                Ae * Ke,
                (Ae / H.locationSize) * J * Ke,
                $,
              );
          }
        } else if (X !== void 0) {
          const ue = X[Z];
          if (ue !== void 0)
            switch (ue.length) {
              case 2:
                i.vertexAttrib2fv(H.location, ue);
                break;
              case 3:
                i.vertexAttrib3fv(H.location, ue);
                break;
              case 4:
                i.vertexAttrib4fv(H.location, ue);
                break;
              default:
                i.vertexAttrib1fv(H.location, ue);
            }
        }
      }
    }
    E();
  }
  function P() {
    A();
    for (const _ in n) {
      const w = n[_];
      for (const U in w) {
        const z = w[U];
        for (const G in z) u(z[G].object), delete z[G];
        delete w[U];
      }
      delete n[_];
    }
  }
  function R(_) {
    if (n[_.id] === void 0) return;
    const w = n[_.id];
    for (const U in w) {
      const z = w[U];
      for (const G in z) u(z[G].object), delete z[G];
      delete w[U];
    }
    delete n[_.id];
  }
  function L(_) {
    for (const w in n) {
      const U = n[w];
      if (U[_.id] === void 0) continue;
      const z = U[_.id];
      for (const G in z) u(z[G].object), delete z[G];
      delete U[_.id];
    }
  }
  function A() {
    x(), (a = !0), s !== r && ((s = r), c(s.object));
  }
  function x() {
    (r.geometry = null), (r.program = null), (r.wireframe = !1);
  }
  return {
    setup: o,
    reset: A,
    resetDefaultState: x,
    dispose: P,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: L,
    initAttributes: S,
    enableAttribute: p,
    disableUnusedAttributes: E,
  };
}
function Xf(i, e, t) {
  let n;
  function r(c) {
    n = c;
  }
  function s(c, u) {
    i.drawArrays(n, c, u), t.update(u, n, 1);
  }
  function a(c, u, h) {
    h !== 0 && (i.drawArraysInstanced(n, c, u, h), t.update(u, n, h));
  }
  function o(c, u, h) {
    if (h === 0) return;
    e.get('WEBGL_multi_draw').multiDrawArraysWEBGL(n, c, 0, u, 0, h);
    let m = 0;
    for (let g = 0; g < h; g++) m += u[g];
    t.update(m, n, 1);
  }
  function l(c, u, h, f) {
    if (h === 0) return;
    const m = e.get('WEBGL_multi_draw');
    if (m === null) for (let g = 0; g < c.length; g++) a(c[g], u[g], f[g]);
    else {
      m.multiDrawArraysInstancedWEBGL(n, c, 0, u, 0, f, 0, h);
      let g = 0;
      for (let S = 0; S < h; S++) g += u[S] * f[S];
      t.update(g, n, 1);
    }
  }
  (this.setMode = r),
    (this.render = s),
    (this.renderInstances = a),
    (this.renderMultiDraw = o),
    (this.renderMultiDrawInstances = l);
}
function qf(i, e, t, n) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (e.has('EXT_texture_filter_anisotropic') === !0) {
      const L = e.get('EXT_texture_filter_anisotropic');
      r = i.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else r = 0;
    return r;
  }
  function a(L) {
    return !(L !== jt && n.convert(L) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(L) {
    const A = L === ir && (e.has('EXT_color_buffer_half_float') || e.has('EXT_color_buffer_float'));
    return !(
      L !== an &&
      n.convert(L) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) &&
      L !== rn &&
      !A
    );
  }
  function l(L) {
    if (L === 'highp') {
      if (
        i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 &&
        i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0
      )
        return 'highp';
      L = 'mediump';
    }
    return L === 'mediump' &&
      i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 &&
      i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0
      ? 'mediump'
      : 'lowp';
  }
  let c = t.precision !== void 0 ? t.precision : 'highp';
  const u = l(c);
  u !== c &&
    (console.warn('THREE.WebGLRenderer:', c, 'not supported, using', u, 'instead.'), (c = u));
  const h = t.logarithmicDepthBuffer === !0,
    f = t.reversedDepthBuffer === !0 && e.has('EXT_clip_control'),
    m = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),
    g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    S = i.getParameter(i.MAX_TEXTURE_SIZE),
    p = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),
    d = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    E = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),
    b = i.getParameter(i.MAX_VARYING_VECTORS),
    y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),
    P = g > 0,
    R = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: h,
    reversedDepthBuffer: f,
    maxTextures: m,
    maxVertexTextures: g,
    maxTextureSize: S,
    maxCubemapSize: p,
    maxAttributes: d,
    maxVertexUniforms: E,
    maxVaryings: b,
    maxFragmentUniforms: y,
    vertexTextures: P,
    maxSamples: R,
  };
}
function $f(i) {
  const e = this;
  let t = null,
    n = 0,
    r = !1,
    s = !1;
  const a = new Tn(),
    o = new Oe(),
    l = { value: null, needsUpdate: !1 };
  (this.uniform = l),
    (this.numPlanes = 0),
    (this.numIntersection = 0),
    (this.init = function (h, f) {
      const m = h.length !== 0 || f || n !== 0 || r;
      return (r = f), (n = h.length), m;
    }),
    (this.beginShadows = function () {
      (s = !0), u(null);
    }),
    (this.endShadows = function () {
      s = !1;
    }),
    (this.setGlobalState = function (h, f) {
      t = u(h, f, 0);
    }),
    (this.setState = function (h, f, m) {
      const g = h.clippingPlanes,
        S = h.clipIntersection,
        p = h.clipShadows,
        d = i.get(h);
      if (!r || g === null || g.length === 0 || (s && !p)) s ? u(null) : c();
      else {
        const E = s ? 0 : n,
          b = E * 4;
        let y = d.clippingState || null;
        (l.value = y), (y = u(g, f, b, m));
        for (let P = 0; P !== b; ++P) y[P] = t[P];
        (d.clippingState = y),
          (this.numIntersection = S ? this.numPlanes : 0),
          (this.numPlanes += E);
      }
    });
  function c() {
    l.value !== t && ((l.value = t), (l.needsUpdate = n > 0)),
      (e.numPlanes = n),
      (e.numIntersection = 0);
  }
  function u(h, f, m, g) {
    const S = h !== null ? h.length : 0;
    let p = null;
    if (S !== 0) {
      if (((p = l.value), g !== !0 || p === null)) {
        const d = m + S * 4,
          E = f.matrixWorldInverse;
        o.getNormalMatrix(E), (p === null || p.length < d) && (p = new Float32Array(d));
        for (let b = 0, y = m; b !== S; ++b, y += 4)
          a.copy(h[b]).applyMatrix4(E, o), a.normal.toArray(p, y), (p[y + 3] = a.constant);
      }
      (l.value = p), (l.needsUpdate = !0);
    }
    return (e.numPlanes = S), (e.numIntersection = 0), p;
  }
}
function Yf(i) {
  let e = new WeakMap();
  function t(a, o) {
    return o === Hs ? (a.mapping = wi) : o === Gs && (a.mapping = Ri), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === Hs || o === Gs)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Gh(l.height);
            return (
              c.fromEquirectangularTexture(i, a),
              e.set(a, c),
              a.addEventListener('dispose', r),
              t(c.texture, a.mapping)
            );
          } else return null;
        }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener('dispose', r);
    const l = e.get(o);
    l !== void 0 && (e.delete(o), l.dispose());
  }
  function s() {
    e = new WeakMap();
  }
  return { get: n, dispose: s };
}
const Mi = 4,
  Oo = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  Xn = 20,
  bs = new Vl(),
  Bo = new ke();
let Es = null,
  Ts = 0,
  As = 0,
  ws = !1;
const Vn = (1 + Math.sqrt(5)) / 2,
  mi = 1 / Vn,
  zo = [
    new F(-Vn, mi, 0),
    new F(Vn, mi, 0),
    new F(-mi, 0, Vn),
    new F(mi, 0, Vn),
    new F(0, Vn, -mi),
    new F(0, Vn, mi),
    new F(-1, 1, -1),
    new F(1, 1, -1),
    new F(-1, 1, 1),
    new F(1, 1, 1),
  ],
  Kf = new F();
class ko {
  constructor(e) {
    (this._renderer = e),
      (this._pingPongRenderTarget = null),
      (this._lodMax = 0),
      (this._cubeSize = 0),
      (this._lodPlanes = []),
      (this._sizeLods = []),
      (this._sigmas = []),
      (this._blurMaterial = null),
      (this._cubemapMaterial = null),
      (this._equirectMaterial = null),
      this._compileMaterial(this._blurMaterial);
  }
  fromScene(e, t = 0, n = 0.1, r = 100, s = {}) {
    const { size: a = 256, position: o = Kf } = s;
    (Es = this._renderer.getRenderTarget()),
      (Ts = this._renderer.getActiveCubeFace()),
      (As = this._renderer.getActiveMipmapLevel()),
      (ws = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1),
      this._setSize(a);
    const l = this._allocateTargets();
    return (
      (l.depthBuffer = !0),
      this._sceneToCubeUV(e, n, r, l, o),
      t > 0 && this._blur(l, 0, 0, t),
      this._applyPMREM(l),
      this._cleanup(l),
      l
    );
  }
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null &&
      ((this._cubemapMaterial = Vo()), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null &&
      ((this._equirectMaterial = Go()), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(),
      this._cubemapMaterial !== null && this._cubemapMaterial.dispose(),
      this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(e) {
    (this._lodMax = Math.floor(Math.log2(e))), (this._cubeSize = Math.pow(2, this._lodMax));
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(),
      this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Es, Ts, As),
      (this._renderer.xr.enabled = ws),
      (e.scissorTest = !1),
      Ir(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === wi || e.mapping === Ri
      ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width)
      : this._setSize(e.image.width / 4),
      (Es = this._renderer.getRenderTarget()),
      (Ts = this._renderer.getActiveCubeFace()),
      (As = this._renderer.getActiveMipmapLevel()),
      (ws = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1);
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112),
      t = 4 * this._cubeSize,
      n = {
        magFilter: nn,
        minFilter: nn,
        generateMipmaps: !1,
        type: ir,
        format: jt,
        colorSpace: Ci,
        depthBuffer: !1,
      },
      r = Ho(e, t, n);
    if (
      this._pingPongRenderTarget === null ||
      this._pingPongRenderTarget.width !== e ||
      this._pingPongRenderTarget.height !== t
    ) {
      this._pingPongRenderTarget !== null && this._dispose(),
        (this._pingPongRenderTarget = Ho(e, t, n));
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Zf(s)),
        (this._blurMaterial = jf(s, e, t));
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new St(this._lodPlanes[0], e);
    this._renderer.compile(t, bs);
  }
  _sceneToCubeUV(e, t, n, r, s) {
    const l = new Wt(90, 1, t, n),
      c = [1, -1, 1, 1, 1, 1],
      u = [1, 1, 1, -1, -1, -1],
      h = this._renderer,
      f = h.autoClear,
      m = h.toneMapping;
    h.getClearColor(Bo),
      (h.toneMapping = Rn),
      (h.autoClear = !1),
      h.state.buffers.depth.getReversed() &&
        (h.setRenderTarget(r), h.clearDepth(), h.setRenderTarget(null));
    const S = new Ul({ name: 'PMREM.Background', side: Lt, depthWrite: !1, depthTest: !1 }),
      p = new St(new Ni(), S);
    let d = !1;
    const E = e.background;
    E
      ? E.isColor && (S.color.copy(E), (e.background = null), (d = !0))
      : (S.color.copy(Bo), (d = !0));
    for (let b = 0; b < 6; b++) {
      const y = b % 3;
      y === 0
        ? (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x + u[b], s.y, s.z))
        : y === 1
          ? (l.up.set(0, 0, c[b]), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y + u[b], s.z))
          : (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y, s.z + u[b]));
      const P = this._cubeSize;
      Ir(r, y * P, b > 2 ? P : 0, P, P), h.setRenderTarget(r), d && h.render(p, l), h.render(e, l);
    }
    p.geometry.dispose(),
      p.material.dispose(),
      (h.toneMapping = m),
      (h.autoClear = f),
      (e.background = E);
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer,
      r = e.mapping === wi || e.mapping === Ri;
    r
      ? (this._cubemapMaterial === null && (this._cubemapMaterial = Vo()),
        (this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1))
      : this._equirectMaterial === null && (this._equirectMaterial = Go());
    const s = r ? this._cubemapMaterial : this._equirectMaterial,
      a = new St(this._lodPlanes[0], s),
      o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    Ir(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, bs);
  }
  _applyPMREM(e) {
    const t = this._renderer,
      n = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(
          this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1],
        ),
        o = zo[(r - s - 1) % zo.length];
      this._blur(e, s - 1, s, a, o);
    }
    t.autoClear = n;
  }
  _blur(e, t, n, r, s) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(e, a, t, n, r, 'latitudinal', s),
      this._halfBlur(a, e, n, n, r, 'longitudinal', s);
  }
  _halfBlur(e, t, n, r, s, a, o) {
    const l = this._renderer,
      c = this._blurMaterial;
    a !== 'latitudinal' &&
      a !== 'longitudinal' &&
      console.error('blur direction must be either latitudinal or longitudinal!');
    const u = 3,
      h = new St(this._lodPlanes[r], c),
      f = c.uniforms,
      m = this._sizeLods[n] - 1,
      g = isFinite(s) ? Math.PI / (2 * m) : (2 * Math.PI) / (2 * Xn - 1),
      S = s / g,
      p = isFinite(s) ? 1 + Math.floor(u * S) : Xn;
    p > Xn &&
      console.warn(
        `sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Xn}`,
      );
    const d = [];
    let E = 0;
    for (let L = 0; L < Xn; ++L) {
      const A = L / S,
        x = Math.exp((-A * A) / 2);
      d.push(x), L === 0 ? (E += x) : L < p && (E += 2 * x);
    }
    for (let L = 0; L < d.length; L++) d[L] = d[L] / E;
    (f.envMap.value = e.texture),
      (f.samples.value = p),
      (f.weights.value = d),
      (f.latitudinal.value = a === 'latitudinal'),
      o && (f.poleAxis.value = o);
    const { _lodMax: b } = this;
    (f.dTheta.value = g), (f.mipInt.value = b - n);
    const y = this._sizeLods[r],
      P = 3 * y * (r > b - Mi ? r - b + Mi : 0),
      R = 4 * (this._cubeSize - y);
    Ir(t, P, R, 3 * y, 2 * y), l.setRenderTarget(t), l.render(h, bs);
  }
}
function Zf(i) {
  const e = [],
    t = [],
    n = [];
  let r = i;
  const s = i - Mi + 1 + Oo.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > i - Mi ? (l = Oo[a - i + Mi - 1]) : a === 0 && (l = 0), n.push(l);
    const c = 1 / (o - 2),
      u = -c,
      h = 1 + c,
      f = [u, u, h, u, h, h, u, u, h, h, u, h],
      m = 6,
      g = 6,
      S = 3,
      p = 2,
      d = 1,
      E = new Float32Array(S * g * m),
      b = new Float32Array(p * g * m),
      y = new Float32Array(d * g * m);
    for (let R = 0; R < m; R++) {
      const L = ((R % 3) * 2) / 3 - 1,
        A = R > 2 ? 0 : -1,
        x = [
          L,
          A,
          0,
          L + 2 / 3,
          A,
          0,
          L + 2 / 3,
          A + 1,
          0,
          L,
          A,
          0,
          L + 2 / 3,
          A + 1,
          0,
          L,
          A + 1,
          0,
        ];
      E.set(x, S * g * R), b.set(f, p * g * R);
      const _ = [R, R, R, R, R, R];
      y.set(_, d * g * R);
    }
    const P = new Jt();
    P.setAttribute('position', new kt(E, S)),
      P.setAttribute('uv', new kt(b, p)),
      P.setAttribute('faceIndex', new kt(y, d)),
      e.push(P),
      r > Mi && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Ho(i, e, t) {
  const n = new Zn(i, e, t);
  return (n.texture.mapping = qr), (n.texture.name = 'PMREM.cubeUv'), (n.scissorTest = !0), n;
}
function Ir(i, e, t, n, r) {
  i.viewport.set(e, t, n, r), i.scissor.set(e, t, n, r);
}
function jf(i, e, t) {
  const n = new Float32Array(Xn),
    r = new F(0, 1, 0);
  return new gn({
    name: 'SphericalGaussianBlur',
    defines: {
      n: Xn,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${i}.0`,
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r },
    },
    vertexShader: ka(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: wn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function Go() {
  return new gn({
    name: 'EquirectangularToCubeUV',
    uniforms: { envMap: { value: null } },
    vertexShader: ka(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: wn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function Vo() {
  return new gn({
    name: 'CubemapToCubeUV',
    uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } },
    vertexShader: ka(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: wn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function ka() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function Jf(i) {
  let e = new WeakMap(),
    t = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping,
        c = l === Hs || l === Gs,
        u = l === wi || l === Ri;
      if (c || u) {
        let h = e.get(o);
        const f = h !== void 0 ? h.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return (
            t === null && (t = new ko(i)),
            (h = c ? t.fromEquirectangular(o, h) : t.fromCubemap(o, h)),
            (h.texture.pmremVersion = o.pmremVersion),
            e.set(o, h),
            h.texture
          );
        if (h !== void 0) return h.texture;
        {
          const m = o.image;
          return (c && m && m.height > 0) || (u && m && r(m))
            ? (t === null && (t = new ko(i)),
              (h = c ? t.fromEquirectangular(o) : t.fromCubemap(o)),
              (h.texture.pmremVersion = o.pmremVersion),
              e.set(o, h),
              o.addEventListener('dispose', s),
              h.texture)
            : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let u = 0; u < c; u++) o[u] !== void 0 && l++;
    return l === c;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener('dispose', s);
    const c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function a() {
    (e = new WeakMap()), t !== null && (t.dispose(), (t = null));
  }
  return { get: n, dispose: a };
}
function Qf(i) {
  const e = {};
  function t(n) {
    if (e[n] !== void 0) return e[n];
    let r;
    switch (n) {
      case 'WEBGL_depth_texture':
        r =
          i.getExtension('WEBGL_depth_texture') ||
          i.getExtension('MOZ_WEBGL_depth_texture') ||
          i.getExtension('WEBKIT_WEBGL_depth_texture');
        break;
      case 'EXT_texture_filter_anisotropic':
        r =
          i.getExtension('EXT_texture_filter_anisotropic') ||
          i.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
          i.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        break;
      case 'WEBGL_compressed_texture_s3tc':
        r =
          i.getExtension('WEBGL_compressed_texture_s3tc') ||
          i.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
          i.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
        break;
      case 'WEBGL_compressed_texture_pvrtc':
        r =
          i.getExtension('WEBGL_compressed_texture_pvrtc') ||
          i.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        break;
      default:
        r = i.getExtension(n);
    }
    return (e[n] = r), r;
  }
  return {
    has: function (n) {
      return t(n) !== null;
    },
    init: function () {
      t('EXT_color_buffer_float'),
        t('WEBGL_clip_cull_distance'),
        t('OES_texture_float_linear'),
        t('EXT_color_buffer_half_float'),
        t('WEBGL_multisampled_render_to_texture'),
        t('WEBGL_render_shared_exponent');
    },
    get: function (n) {
      const r = t(n);
      return r === null && er('THREE.WebGLRenderer: ' + n + ' extension not supported.'), r;
    },
  };
}
function ep(i, e, t, n) {
  const r = {},
    s = new WeakMap();
  function a(h) {
    const f = h.target;
    f.index !== null && e.remove(f.index);
    for (const g in f.attributes) e.remove(f.attributes[g]);
    f.removeEventListener('dispose', a), delete r[f.id];
    const m = s.get(f);
    m && (e.remove(m), s.delete(f)),
      n.releaseStatesOfGeometry(f),
      f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount,
      t.memory.geometries--;
  }
  function o(h, f) {
    return (
      r[f.id] === !0 || (f.addEventListener('dispose', a), (r[f.id] = !0), t.memory.geometries++), f
    );
  }
  function l(h) {
    const f = h.attributes;
    for (const m in f) e.update(f[m], i.ARRAY_BUFFER);
  }
  function c(h) {
    const f = [],
      m = h.index,
      g = h.attributes.position;
    let S = 0;
    if (m !== null) {
      const E = m.array;
      S = m.version;
      for (let b = 0, y = E.length; b < y; b += 3) {
        const P = E[b + 0],
          R = E[b + 1],
          L = E[b + 2];
        f.push(P, R, R, L, L, P);
      }
    } else if (g !== void 0) {
      const E = g.array;
      S = g.version;
      for (let b = 0, y = E.length / 3 - 1; b < y; b += 3) {
        const P = b + 0,
          R = b + 1,
          L = b + 2;
        f.push(P, R, R, L, L, P);
      }
    } else return;
    const p = new (Pl(f) ? Fl : Nl)(f, 1);
    p.version = S;
    const d = s.get(h);
    d && e.remove(d), s.set(h, p);
  }
  function u(h) {
    const f = s.get(h);
    if (f) {
      const m = h.index;
      m !== null && f.version < m.version && c(h);
    } else c(h);
    return s.get(h);
  }
  return { get: o, update: l, getWireframeAttribute: u };
}
function tp(i, e, t) {
  let n;
  function r(f) {
    n = f;
  }
  let s, a;
  function o(f) {
    (s = f.type), (a = f.bytesPerElement);
  }
  function l(f, m) {
    i.drawElements(n, m, s, f * a), t.update(m, n, 1);
  }
  function c(f, m, g) {
    g !== 0 && (i.drawElementsInstanced(n, m, s, f * a, g), t.update(m, n, g));
  }
  function u(f, m, g) {
    if (g === 0) return;
    e.get('WEBGL_multi_draw').multiDrawElementsWEBGL(n, m, 0, s, f, 0, g);
    let p = 0;
    for (let d = 0; d < g; d++) p += m[d];
    t.update(p, n, 1);
  }
  function h(f, m, g, S) {
    if (g === 0) return;
    const p = e.get('WEBGL_multi_draw');
    if (p === null) for (let d = 0; d < f.length; d++) c(f[d] / a, m[d], S[d]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, m, 0, s, f, 0, S, 0, g);
      let d = 0;
      for (let E = 0; E < g; E++) d += m[E] * S[E];
      t.update(d, n, 1);
    }
  }
  (this.setMode = r),
    (this.setIndex = o),
    (this.render = l),
    (this.renderInstances = c),
    (this.renderMultiDraw = u),
    (this.renderMultiDrawInstances = h);
}
function np(i) {
  const e = { geometries: 0, textures: 0 },
    t = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function n(s, a, o) {
    switch ((t.calls++, a)) {
      case i.TRIANGLES:
        t.triangles += o * (s / 3);
        break;
      case i.LINES:
        t.lines += o * (s / 2);
        break;
      case i.LINE_STRIP:
        t.lines += o * (s - 1);
        break;
      case i.LINE_LOOP:
        t.lines += o * s;
        break;
      case i.POINTS:
        t.points += o * s;
        break;
      default:
        console.error('THREE.WebGLInfo: Unknown draw mode:', a);
        break;
    }
  }
  function r() {
    (t.calls = 0), (t.triangles = 0), (t.points = 0), (t.lines = 0);
  }
  return { memory: e, render: t, programs: null, autoReset: !0, reset: r, update: n };
}
function ip(i, e, t) {
  const n = new WeakMap(),
    r = new dt();
  function s(a, o, l) {
    const c = a.morphTargetInfluences,
      u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color,
      h = u !== void 0 ? u.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== h) {
      let _ = function () {
        A.dispose(), n.delete(o), o.removeEventListener('dispose', _);
      };
      var m = _;
      f !== void 0 && f.texture.dispose();
      const g = o.morphAttributes.position !== void 0,
        S = o.morphAttributes.normal !== void 0,
        p = o.morphAttributes.color !== void 0,
        d = o.morphAttributes.position || [],
        E = o.morphAttributes.normal || [],
        b = o.morphAttributes.color || [];
      let y = 0;
      g === !0 && (y = 1), S === !0 && (y = 2), p === !0 && (y = 3);
      let P = o.attributes.position.count * y,
        R = 1;
      P > e.maxTextureSize && ((R = Math.ceil(P / e.maxTextureSize)), (P = e.maxTextureSize));
      const L = new Float32Array(P * R * 4 * h),
        A = new Ll(L, P, R, h);
      (A.type = rn), (A.needsUpdate = !0);
      const x = y * 4;
      for (let w = 0; w < h; w++) {
        const U = d[w],
          z = E[w],
          G = b[w],
          V = P * R * 4 * w;
        for (let X = 0; X < U.count; X++) {
          const Z = X * x;
          g === !0 &&
            (r.fromBufferAttribute(U, X),
            (L[V + Z + 0] = r.x),
            (L[V + Z + 1] = r.y),
            (L[V + Z + 2] = r.z),
            (L[V + Z + 3] = 0)),
            S === !0 &&
              (r.fromBufferAttribute(z, X),
              (L[V + Z + 4] = r.x),
              (L[V + Z + 5] = r.y),
              (L[V + Z + 6] = r.z),
              (L[V + Z + 7] = 0)),
            p === !0 &&
              (r.fromBufferAttribute(G, X),
              (L[V + Z + 8] = r.x),
              (L[V + Z + 9] = r.y),
              (L[V + Z + 10] = r.z),
              (L[V + Z + 11] = G.itemSize === 4 ? r.w : 1));
        }
      }
      (f = { count: h, texture: A, size: new We(P, R) }),
        n.set(o, f),
        o.addEventListener('dispose', _);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, 'morphTexture', a.morphTexture, t);
    else {
      let g = 0;
      for (let p = 0; p < c.length; p++) g += c[p];
      const S = o.morphTargetsRelative ? 1 : 1 - g;
      l.getUniforms().setValue(i, 'morphTargetBaseInfluence', S),
        l.getUniforms().setValue(i, 'morphTargetInfluences', c);
    }
    l.getUniforms().setValue(i, 'morphTargetsTexture', f.texture, t),
      l.getUniforms().setValue(i, 'morphTargetsTextureSize', f.size);
  }
  return { update: s };
}
function rp(i, e, t, n) {
  let r = new WeakMap();
  function s(l) {
    const c = n.render.frame,
      u = l.geometry,
      h = e.get(l, u);
    if (
      (r.get(h) !== c && (e.update(h), r.set(h, c)),
      l.isInstancedMesh &&
        (l.hasEventListener('dispose', o) === !1 && l.addEventListener('dispose', o),
        r.get(l) !== c &&
          (t.update(l.instanceMatrix, i.ARRAY_BUFFER),
          l.instanceColor !== null && t.update(l.instanceColor, i.ARRAY_BUFFER),
          r.set(l, c))),
      l.isSkinnedMesh)
    ) {
      const f = l.skeleton;
      r.get(f) !== c && (f.update(), r.set(f, c));
    }
    return h;
  }
  function a() {
    r = new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener('dispose', o),
      t.remove(c.instanceMatrix),
      c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return { update: s, dispose: a };
}
const Xl = new At(),
  Wo = new kl(1, 1),
  ql = new Ll(),
  $l = new Th(),
  Yl = new zl(),
  Xo = [],
  qo = [],
  $o = new Float32Array(16),
  Yo = new Float32Array(9),
  Ko = new Float32Array(4);
function Fi(i, e, t) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = e * t;
  let s = Xo[r];
  if ((s === void 0 && ((s = new Float32Array(r)), (Xo[r] = s)), e !== 0)) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== e; ++a) (o += t), i[a].toArray(s, o);
  }
  return s;
}
function mt(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, n = i.length; t < n; t++) if (i[t] !== e[t]) return !1;
  return !0;
}
function gt(i, e) {
  for (let t = 0, n = e.length; t < n; t++) i[t] = e[t];
}
function $r(i, e) {
  let t = qo[e];
  t === void 0 && ((t = new Int32Array(e)), (qo[e] = t));
  for (let n = 0; n !== e; ++n) t[n] = i.allocateTextureUnit();
  return t;
}
function sp(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), (t[0] = e));
}
function ap(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2f(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (mt(t, e)) return;
    i.uniform2fv(this.addr, e), gt(t, e);
  }
}
function op(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3f(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) &&
      (i.uniform3f(this.addr, e.r, e.g, e.b), (t[0] = e.r), (t[1] = e.g), (t[2] = e.b));
  else {
    if (mt(t, e)) return;
    i.uniform3fv(this.addr, e), gt(t, e);
  }
}
function lp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4f(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (mt(t, e)) return;
    i.uniform4fv(this.addr, e), gt(t, e);
  }
}
function cp(i, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (mt(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n)) return;
    Ko.set(n), i.uniformMatrix2fv(this.addr, !1, Ko), gt(t, n);
  }
}
function hp(i, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (mt(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n)) return;
    Yo.set(n), i.uniformMatrix3fv(this.addr, !1, Yo), gt(t, n);
  }
}
function up(i, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (mt(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n)) return;
    $o.set(n), i.uniformMatrix4fv(this.addr, !1, $o), gt(t, n);
  }
}
function dp(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), (t[0] = e));
}
function fp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2i(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (mt(t, e)) return;
    i.uniform2iv(this.addr, e), gt(t, e);
  }
}
function pp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3i(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else {
    if (mt(t, e)) return;
    i.uniform3iv(this.addr, e), gt(t, e);
  }
}
function mp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4i(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (mt(t, e)) return;
    i.uniform4iv(this.addr, e), gt(t, e);
  }
}
function gp(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), (t[0] = e));
}
function _p(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2ui(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (mt(t, e)) return;
    i.uniform2uiv(this.addr, e), gt(t, e);
  }
}
function vp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3ui(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else {
    if (mt(t, e)) return;
    i.uniform3uiv(this.addr, e), gt(t, e);
  }
}
function xp(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (mt(t, e)) return;
    i.uniform4uiv(this.addr, e), gt(t, e);
  }
}
function Mp(i, e, t) {
  const n = this.cache,
    r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), (n[0] = r));
  let s;
  this.type === i.SAMPLER_2D_SHADOW ? ((Wo.compareFunction = Cl), (s = Wo)) : (s = Xl),
    t.setTexture2D(e || s, r);
}
function Sp(i, e, t) {
  const n = this.cache,
    r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), (n[0] = r)), t.setTexture3D(e || $l, r);
}
function yp(i, e, t) {
  const n = this.cache,
    r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), (n[0] = r)), t.setTextureCube(e || Yl, r);
}
function bp(i, e, t) {
  const n = this.cache,
    r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), (n[0] = r)), t.setTexture2DArray(e || ql, r);
}
function Ep(i) {
  switch (i) {
    case 5126:
      return sp;
    case 35664:
      return ap;
    case 35665:
      return op;
    case 35666:
      return lp;
    case 35674:
      return cp;
    case 35675:
      return hp;
    case 35676:
      return up;
    case 5124:
    case 35670:
      return dp;
    case 35667:
    case 35671:
      return fp;
    case 35668:
    case 35672:
      return pp;
    case 35669:
    case 35673:
      return mp;
    case 5125:
      return gp;
    case 36294:
      return _p;
    case 36295:
      return vp;
    case 36296:
      return xp;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Mp;
    case 35679:
    case 36299:
    case 36307:
      return Sp;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return yp;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return bp;
  }
}
function Tp(i, e) {
  i.uniform1fv(this.addr, e);
}
function Ap(i, e) {
  const t = Fi(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function wp(i, e) {
  const t = Fi(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function Rp(i, e) {
  const t = Fi(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function Cp(i, e) {
  const t = Fi(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function Pp(i, e) {
  const t = Fi(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function Lp(i, e) {
  const t = Fi(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function Dp(i, e) {
  i.uniform1iv(this.addr, e);
}
function Ip(i, e) {
  i.uniform2iv(this.addr, e);
}
function Up(i, e) {
  i.uniform3iv(this.addr, e);
}
function Np(i, e) {
  i.uniform4iv(this.addr, e);
}
function Fp(i, e) {
  i.uniform1uiv(this.addr, e);
}
function Op(i, e) {
  i.uniform2uiv(this.addr, e);
}
function Bp(i, e) {
  i.uniform3uiv(this.addr, e);
}
function zp(i, e) {
  i.uniform4uiv(this.addr, e);
}
function kp(i, e, t) {
  const n = this.cache,
    r = e.length,
    s = $r(t, r);
  mt(n, s) || (i.uniform1iv(this.addr, s), gt(n, s));
  for (let a = 0; a !== r; ++a) t.setTexture2D(e[a] || Xl, s[a]);
}
function Hp(i, e, t) {
  const n = this.cache,
    r = e.length,
    s = $r(t, r);
  mt(n, s) || (i.uniform1iv(this.addr, s), gt(n, s));
  for (let a = 0; a !== r; ++a) t.setTexture3D(e[a] || $l, s[a]);
}
function Gp(i, e, t) {
  const n = this.cache,
    r = e.length,
    s = $r(t, r);
  mt(n, s) || (i.uniform1iv(this.addr, s), gt(n, s));
  for (let a = 0; a !== r; ++a) t.setTextureCube(e[a] || Yl, s[a]);
}
function Vp(i, e, t) {
  const n = this.cache,
    r = e.length,
    s = $r(t, r);
  mt(n, s) || (i.uniform1iv(this.addr, s), gt(n, s));
  for (let a = 0; a !== r; ++a) t.setTexture2DArray(e[a] || ql, s[a]);
}
function Wp(i) {
  switch (i) {
    case 5126:
      return Tp;
    case 35664:
      return Ap;
    case 35665:
      return wp;
    case 35666:
      return Rp;
    case 35674:
      return Cp;
    case 35675:
      return Pp;
    case 35676:
      return Lp;
    case 5124:
    case 35670:
      return Dp;
    case 35667:
    case 35671:
      return Ip;
    case 35668:
    case 35672:
      return Up;
    case 35669:
    case 35673:
      return Np;
    case 5125:
      return Fp;
    case 36294:
      return Op;
    case 36295:
      return Bp;
    case 36296:
      return zp;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return kp;
    case 35679:
    case 36299:
    case 36307:
      return Hp;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Gp;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Vp;
  }
}
class Xp {
  constructor(e, t, n) {
    (this.id = e),
      (this.addr = n),
      (this.cache = []),
      (this.type = t.type),
      (this.setValue = Ep(t.type));
  }
}
class qp {
  constructor(e, t, n) {
    (this.id = e),
      (this.addr = n),
      (this.cache = []),
      (this.type = t.type),
      (this.size = t.size),
      (this.setValue = Wp(t.type));
  }
}
class $p {
  constructor(e) {
    (this.id = e), (this.seq = []), (this.map = {});
  }
  setValue(e, t, n) {
    const r = this.seq;
    for (let s = 0, a = r.length; s !== a; ++s) {
      const o = r[s];
      o.setValue(e, t[o.id], n);
    }
  }
}
const Rs = /(\w+)(\])?(\[|\.)?/g;
function Zo(i, e) {
  i.seq.push(e), (i.map[e.id] = e);
}
function Yp(i, e, t) {
  const n = i.name,
    r = n.length;
  for (Rs.lastIndex = 0; ; ) {
    const s = Rs.exec(n),
      a = Rs.lastIndex;
    let o = s[1];
    const l = s[2] === ']',
      c = s[3];
    if ((l && (o = o | 0), c === void 0 || (c === '[' && a + 2 === r))) {
      Zo(t, c === void 0 ? new Xp(o, i, e) : new qp(o, i, e));
      break;
    } else {
      let h = t.map[o];
      h === void 0 && ((h = new $p(o)), Zo(t, h)), (t = h);
    }
  }
}
class zr {
  constructor(e, t) {
    (this.seq = []), (this.map = {});
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = e.getActiveUniform(t, r),
        a = e.getUniformLocation(t, s.name);
      Yp(s, a, this);
    }
  }
  setValue(e, t, n, r) {
    const s = this.map[t];
    s !== void 0 && s.setValue(e, n, r);
  }
  setOptional(e, t, n) {
    const r = t[n];
    r !== void 0 && this.setValue(e, n, r);
  }
  static upload(e, t, n, r) {
    for (let s = 0, a = t.length; s !== a; ++s) {
      const o = t[s],
        l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(e, l.value, r);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let r = 0, s = e.length; r !== s; ++r) {
      const a = e[r];
      a.id in t && n.push(a);
    }
    return n;
  }
}
function jo(i, e, t) {
  const n = i.createShader(e);
  return i.shaderSource(n, t), i.compileShader(n), n;
}
const Kp = 37297;
let Zp = 0;
function jp(i, e) {
  const t = i.split(`
`),
    n = [],
    r = Math.max(e - 6, 0),
    s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === e ? '>' : ' '} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
const Jo = new Oe();
function Jp(i) {
  Ye._getMatrix(Jo, Ye.workingColorSpace, i);
  const e = `mat3( ${Jo.elements.map((t) => t.toFixed(4))} )`;
  switch (Ye.getTransfer(i)) {
    case Hr:
      return [e, 'LinearTransferOETF'];
    case Je:
      return [e, 'sRGBTransferOETF'];
    default:
      return (
        console.warn('THREE.WebGLProgram: Unsupported color space: ', i), [e, 'LinearTransferOETF']
      );
  }
}
function Qo(i, e, t) {
  const n = i.getShaderParameter(e, i.COMPILE_STATUS),
    s = (i.getShaderInfoLog(e) || '').trim();
  if (n && s === '') return '';
  const a = /ERROR: 0:(\d+)/.exec(s);
  if (a) {
    const o = parseInt(a[1]);
    return (
      t.toUpperCase() +
      `

` +
      s +
      `

` +
      jp(i.getShaderSource(e), o)
    );
  } else return s;
}
function Qp(i, e) {
  const t = Jp(e);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,
    '}',
  ].join(`
`);
}
function em(i, e) {
  let t;
  switch (e) {
    case zc:
      t = 'Linear';
      break;
    case kc:
      t = 'Reinhard';
      break;
    case Hc:
      t = 'Cineon';
      break;
    case xl:
      t = 'ACESFilmic';
      break;
    case Vc:
      t = 'AgX';
      break;
    case Wc:
      t = 'Neutral';
      break;
    case Gc:
      t = 'Custom';
      break;
    default:
      console.warn('THREE.WebGLProgram: Unsupported toneMapping:', e), (t = 'Linear');
  }
  return 'vec3 ' + i + '( vec3 color ) { return ' + t + 'ToneMapping( color ); }';
}
const Ur = new F();
function tm() {
  Ye.getLuminanceCoefficients(Ur);
  const i = Ur.x.toFixed(4),
    e = Ur.y.toFixed(4),
    t = Ur.z.toFixed(4);
  return [
    'float luminance( const in vec3 rgb ) {',
    `	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,
    '	return dot( weights, rgb );',
    '}',
  ].join(`
`);
}
function nm(i) {
  return [
    i.extensionClipCullDistance ? '#extension GL_ANGLE_clip_cull_distance : require' : '',
    i.extensionMultiDraw ? '#extension GL_ANGLE_multi_draw : require' : '',
  ]
    .filter(Wi)
    .join(`
`);
}
function im(i) {
  const e = [];
  for (const t in i) {
    const n = i[t];
    n !== !1 && e.push('#define ' + t + ' ' + n);
  }
  return e.join(`
`);
}
function rm(i, e) {
  const t = {},
    n = i.getProgramParameter(e, i.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < n; r++) {
    const s = i.getActiveAttrib(e, r),
      a = s.name;
    let o = 1;
    s.type === i.FLOAT_MAT2 && (o = 2),
      s.type === i.FLOAT_MAT3 && (o = 3),
      s.type === i.FLOAT_MAT4 && (o = 4),
      (t[a] = { type: s.type, location: i.getAttribLocation(e, a), locationSize: o });
  }
  return t;
}
function Wi(i) {
  return i !== '';
}
function el(i, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i
    .replace(/NUM_DIR_LIGHTS/g, e.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, t)
    .replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, e.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function tl(i, e) {
  return i
    .replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes)
    .replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const sm = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Ma(i) {
  return i.replace(sm, om);
}
const am = new Map();
function om(i, e) {
  let t = ze[e];
  if (t === void 0) {
    const n = am.get(e);
    if (n !== void 0)
      (t = ze[n]),
        console.warn(
          'THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',
          e,
          n,
        );
    else throw new Error('Can not resolve #include <' + e + '>');
  }
  return Ma(t);
}
const lm =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function nl(i) {
  return i.replace(lm, cm);
}
function cm(i, e, t, n) {
  let r = '';
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += n.replace(/\[\s*i\s*\]/g, '[ ' + s + ' ]').replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function il(i) {
  let e = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return (
    i.precision === 'highp'
      ? (e += `
#define HIGH_PRECISION`)
      : i.precision === 'mediump'
        ? (e += `
#define MEDIUM_PRECISION`)
        : i.precision === 'lowp' &&
          (e += `
#define LOW_PRECISION`),
    e
  );
}
function hm(i) {
  let e = 'SHADOWMAP_TYPE_BASIC';
  return (
    i.shadowMapType === gl
      ? (e = 'SHADOWMAP_TYPE_PCF')
      : i.shadowMapType === _l
        ? (e = 'SHADOWMAP_TYPE_PCF_SOFT')
        : i.shadowMapType === pn && (e = 'SHADOWMAP_TYPE_VSM'),
    e
  );
}
function um(i) {
  let e = 'ENVMAP_TYPE_CUBE';
  if (i.envMap)
    switch (i.envMapMode) {
      case wi:
      case Ri:
        e = 'ENVMAP_TYPE_CUBE';
        break;
      case qr:
        e = 'ENVMAP_TYPE_CUBE_UV';
        break;
    }
  return e;
}
function dm(i) {
  let e = 'ENVMAP_MODE_REFLECTION';
  return i.envMap && i.envMapMode === Ri && (e = 'ENVMAP_MODE_REFRACTION'), e;
}
function fm(i) {
  let e = 'ENVMAP_BLENDING_NONE';
  if (i.envMap)
    switch (i.combine) {
      case vl:
        e = 'ENVMAP_BLENDING_MULTIPLY';
        break;
      case Oc:
        e = 'ENVMAP_BLENDING_MIX';
        break;
      case Bc:
        e = 'ENVMAP_BLENDING_ADD';
        break;
    }
  return e;
}
function pm(i) {
  const e = i.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2,
    n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 112)), texelHeight: n, maxMip: t };
}
function mm(i, e, t, n) {
  const r = i.getContext(),
    s = t.defines;
  let a = t.vertexShader,
    o = t.fragmentShader;
  const l = hm(t),
    c = um(t),
    u = dm(t),
    h = fm(t),
    f = pm(t),
    m = nm(t),
    g = im(s),
    S = r.createProgram();
  let p,
    d,
    E = t.glslVersion
      ? '#version ' +
        t.glslVersion +
        `
`
      : '';
  t.isRawShaderMaterial
    ? ((p = ['#define SHADER_TYPE ' + t.shaderType, '#define SHADER_NAME ' + t.shaderName, g]
        .filter(Wi)
        .join(`
`)),
      p.length > 0 &&
        (p += `
`),
      (d = ['#define SHADER_TYPE ' + t.shaderType, '#define SHADER_NAME ' + t.shaderName, g]
        .filter(Wi)
        .join(`
`)),
      d.length > 0 &&
        (d += `
`))
    : ((p = [
        il(t),
        '#define SHADER_TYPE ' + t.shaderType,
        '#define SHADER_NAME ' + t.shaderName,
        g,
        t.extensionClipCullDistance ? '#define USE_CLIP_DISTANCE' : '',
        t.batching ? '#define USE_BATCHING' : '',
        t.batchingColor ? '#define USE_BATCHING_COLOR' : '',
        t.instancing ? '#define USE_INSTANCING' : '',
        t.instancingColor ? '#define USE_INSTANCING_COLOR' : '',
        t.instancingMorph ? '#define USE_INSTANCING_MORPH' : '',
        t.useFog && t.fog ? '#define USE_FOG' : '',
        t.useFog && t.fogExp2 ? '#define FOG_EXP2' : '',
        t.map ? '#define USE_MAP' : '',
        t.envMap ? '#define USE_ENVMAP' : '',
        t.envMap ? '#define ' + u : '',
        t.lightMap ? '#define USE_LIGHTMAP' : '',
        t.aoMap ? '#define USE_AOMAP' : '',
        t.bumpMap ? '#define USE_BUMPMAP' : '',
        t.normalMap ? '#define USE_NORMALMAP' : '',
        t.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        t.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        t.displacementMap ? '#define USE_DISPLACEMENTMAP' : '',
        t.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        t.anisotropy ? '#define USE_ANISOTROPY' : '',
        t.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',
        t.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        t.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        t.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
        t.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        t.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',
        t.specularMap ? '#define USE_SPECULARMAP' : '',
        t.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        t.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',
        t.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        t.metalnessMap ? '#define USE_METALNESSMAP' : '',
        t.alphaMap ? '#define USE_ALPHAMAP' : '',
        t.alphaHash ? '#define USE_ALPHAHASH' : '',
        t.transmission ? '#define USE_TRANSMISSION' : '',
        t.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        t.thicknessMap ? '#define USE_THICKNESSMAP' : '',
        t.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        t.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',
        t.mapUv ? '#define MAP_UV ' + t.mapUv : '',
        t.alphaMapUv ? '#define ALPHAMAP_UV ' + t.alphaMapUv : '',
        t.lightMapUv ? '#define LIGHTMAP_UV ' + t.lightMapUv : '',
        t.aoMapUv ? '#define AOMAP_UV ' + t.aoMapUv : '',
        t.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + t.emissiveMapUv : '',
        t.bumpMapUv ? '#define BUMPMAP_UV ' + t.bumpMapUv : '',
        t.normalMapUv ? '#define NORMALMAP_UV ' + t.normalMapUv : '',
        t.displacementMapUv ? '#define DISPLACEMENTMAP_UV ' + t.displacementMapUv : '',
        t.metalnessMapUv ? '#define METALNESSMAP_UV ' + t.metalnessMapUv : '',
        t.roughnessMapUv ? '#define ROUGHNESSMAP_UV ' + t.roughnessMapUv : '',
        t.anisotropyMapUv ? '#define ANISOTROPYMAP_UV ' + t.anisotropyMapUv : '',
        t.clearcoatMapUv ? '#define CLEARCOATMAP_UV ' + t.clearcoatMapUv : '',
        t.clearcoatNormalMapUv ? '#define CLEARCOAT_NORMALMAP_UV ' + t.clearcoatNormalMapUv : '',
        t.clearcoatRoughnessMapUv
          ? '#define CLEARCOAT_ROUGHNESSMAP_UV ' + t.clearcoatRoughnessMapUv
          : '',
        t.iridescenceMapUv ? '#define IRIDESCENCEMAP_UV ' + t.iridescenceMapUv : '',
        t.iridescenceThicknessMapUv
          ? '#define IRIDESCENCE_THICKNESSMAP_UV ' + t.iridescenceThicknessMapUv
          : '',
        t.sheenColorMapUv ? '#define SHEEN_COLORMAP_UV ' + t.sheenColorMapUv : '',
        t.sheenRoughnessMapUv ? '#define SHEEN_ROUGHNESSMAP_UV ' + t.sheenRoughnessMapUv : '',
        t.specularMapUv ? '#define SPECULARMAP_UV ' + t.specularMapUv : '',
        t.specularColorMapUv ? '#define SPECULAR_COLORMAP_UV ' + t.specularColorMapUv : '',
        t.specularIntensityMapUv
          ? '#define SPECULAR_INTENSITYMAP_UV ' + t.specularIntensityMapUv
          : '',
        t.transmissionMapUv ? '#define TRANSMISSIONMAP_UV ' + t.transmissionMapUv : '',
        t.thicknessMapUv ? '#define THICKNESSMAP_UV ' + t.thicknessMapUv : '',
        t.vertexTangents && t.flatShading === !1 ? '#define USE_TANGENT' : '',
        t.vertexColors ? '#define USE_COLOR' : '',
        t.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        t.vertexUv1s ? '#define USE_UV1' : '',
        t.vertexUv2s ? '#define USE_UV2' : '',
        t.vertexUv3s ? '#define USE_UV3' : '',
        t.pointsUvs ? '#define USE_POINTS_UV' : '',
        t.flatShading ? '#define FLAT_SHADED' : '',
        t.skinning ? '#define USE_SKINNING' : '',
        t.morphTargets ? '#define USE_MORPHTARGETS' : '',
        t.morphNormals && t.flatShading === !1 ? '#define USE_MORPHNORMALS' : '',
        t.morphColors ? '#define USE_MORPHCOLORS' : '',
        t.morphTargetsCount > 0
          ? '#define MORPHTARGETS_TEXTURE_STRIDE ' + t.morphTextureStride
          : '',
        t.morphTargetsCount > 0 ? '#define MORPHTARGETS_COUNT ' + t.morphTargetsCount : '',
        t.doubleSided ? '#define DOUBLE_SIDED' : '',
        t.flipSided ? '#define FLIP_SIDED' : '',
        t.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        t.shadowMapEnabled ? '#define ' + l : '',
        t.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',
        t.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',
        t.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        t.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',
        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',
        '#ifdef USE_INSTANCING',
        '	attribute mat4 instanceMatrix;',
        '#endif',
        '#ifdef USE_INSTANCING_COLOR',
        '	attribute vec3 instanceColor;',
        '#endif',
        '#ifdef USE_INSTANCING_MORPH',
        '	uniform sampler2D morphTexture;',
        '#endif',
        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        '#ifdef USE_UV1',
        '	attribute vec2 uv1;',
        '#endif',
        '#ifdef USE_UV2',
        '	attribute vec2 uv2;',
        '#endif',
        '#ifdef USE_UV3',
        '	attribute vec2 uv3;',
        '#endif',
        '#ifdef USE_TANGENT',
        '	attribute vec4 tangent;',
        '#endif',
        '#if defined( USE_COLOR_ALPHA )',
        '	attribute vec4 color;',
        '#elif defined( USE_COLOR )',
        '	attribute vec3 color;',
        '#endif',
        '#ifdef USE_SKINNING',
        '	attribute vec4 skinIndex;',
        '	attribute vec4 skinWeight;',
        '#endif',
        `
`,
      ]
        .filter(Wi)
        .join(`
`)),
      (d = [
        il(t),
        '#define SHADER_TYPE ' + t.shaderType,
        '#define SHADER_NAME ' + t.shaderName,
        g,
        t.useFog && t.fog ? '#define USE_FOG' : '',
        t.useFog && t.fogExp2 ? '#define FOG_EXP2' : '',
        t.alphaToCoverage ? '#define ALPHA_TO_COVERAGE' : '',
        t.map ? '#define USE_MAP' : '',
        t.matcap ? '#define USE_MATCAP' : '',
        t.envMap ? '#define USE_ENVMAP' : '',
        t.envMap ? '#define ' + c : '',
        t.envMap ? '#define ' + u : '',
        t.envMap ? '#define ' + h : '',
        f ? '#define CUBEUV_TEXEL_WIDTH ' + f.texelWidth : '',
        f ? '#define CUBEUV_TEXEL_HEIGHT ' + f.texelHeight : '',
        f ? '#define CUBEUV_MAX_MIP ' + f.maxMip + '.0' : '',
        t.lightMap ? '#define USE_LIGHTMAP' : '',
        t.aoMap ? '#define USE_AOMAP' : '',
        t.bumpMap ? '#define USE_BUMPMAP' : '',
        t.normalMap ? '#define USE_NORMALMAP' : '',
        t.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        t.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        t.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        t.anisotropy ? '#define USE_ANISOTROPY' : '',
        t.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',
        t.clearcoat ? '#define USE_CLEARCOAT' : '',
        t.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        t.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        t.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
        t.dispersion ? '#define USE_DISPERSION' : '',
        t.iridescence ? '#define USE_IRIDESCENCE' : '',
        t.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        t.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',
        t.specularMap ? '#define USE_SPECULARMAP' : '',
        t.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        t.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',
        t.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        t.metalnessMap ? '#define USE_METALNESSMAP' : '',
        t.alphaMap ? '#define USE_ALPHAMAP' : '',
        t.alphaTest ? '#define USE_ALPHATEST' : '',
        t.alphaHash ? '#define USE_ALPHAHASH' : '',
        t.sheen ? '#define USE_SHEEN' : '',
        t.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        t.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',
        t.transmission ? '#define USE_TRANSMISSION' : '',
        t.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        t.thicknessMap ? '#define USE_THICKNESSMAP' : '',
        t.vertexTangents && t.flatShading === !1 ? '#define USE_TANGENT' : '',
        t.vertexColors || t.instancingColor || t.batchingColor ? '#define USE_COLOR' : '',
        t.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        t.vertexUv1s ? '#define USE_UV1' : '',
        t.vertexUv2s ? '#define USE_UV2' : '',
        t.vertexUv3s ? '#define USE_UV3' : '',
        t.pointsUvs ? '#define USE_POINTS_UV' : '',
        t.gradientMap ? '#define USE_GRADIENTMAP' : '',
        t.flatShading ? '#define FLAT_SHADED' : '',
        t.doubleSided ? '#define DOUBLE_SIDED' : '',
        t.flipSided ? '#define FLIP_SIDED' : '',
        t.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        t.shadowMapEnabled ? '#define ' + l : '',
        t.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',
        t.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',
        t.decodeVideoTexture ? '#define DECODE_VIDEO_TEXTURE' : '',
        t.decodeVideoTextureEmissive ? '#define DECODE_VIDEO_TEXTURE_EMISSIVE' : '',
        t.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        t.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',
        'uniform mat4 viewMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',
        t.toneMapping !== Rn ? '#define TONE_MAPPING' : '',
        t.toneMapping !== Rn ? ze.tonemapping_pars_fragment : '',
        t.toneMapping !== Rn ? em('toneMapping', t.toneMapping) : '',
        t.dithering ? '#define DITHERING' : '',
        t.opaque ? '#define OPAQUE' : '',
        ze.colorspace_pars_fragment,
        Qp('linearToOutputTexel', t.outputColorSpace),
        tm(),
        t.useDepthPacking ? '#define DEPTH_PACKING ' + t.depthPacking : '',
        `
`,
      ]
        .filter(Wi)
        .join(`
`))),
    (a = Ma(a)),
    (a = el(a, t)),
    (a = tl(a, t)),
    (o = Ma(o)),
    (o = el(o, t)),
    (o = tl(o, t)),
    (a = nl(a)),
    (o = nl(o)),
    t.isRawShaderMaterial !== !0 &&
      ((E = `#version 300 es
`),
      (p =
        [m, '#define attribute in', '#define varying out', '#define texture2D texture'].join(`
`) +
        `
` +
        p),
      (d =
        [
          '#define varying in',
          t.glslVersion === co ? '' : 'layout(location = 0) out highp vec4 pc_fragColor;',
          t.glslVersion === co ? '' : '#define gl_FragColor pc_fragColor',
          '#define gl_FragDepthEXT gl_FragDepth',
          '#define texture2D texture',
          '#define textureCube texture',
          '#define texture2DProj textureProj',
          '#define texture2DLodEXT textureLod',
          '#define texture2DProjLodEXT textureProjLod',
          '#define textureCubeLodEXT textureLod',
          '#define texture2DGradEXT textureGrad',
          '#define texture2DProjGradEXT textureProjGrad',
          '#define textureCubeGradEXT textureGrad',
        ].join(`
`) +
        `
` +
        d));
  const b = E + p + a,
    y = E + d + o,
    P = jo(r, r.VERTEX_SHADER, b),
    R = jo(r, r.FRAGMENT_SHADER, y);
  r.attachShader(S, P),
    r.attachShader(S, R),
    t.index0AttributeName !== void 0
      ? r.bindAttribLocation(S, 0, t.index0AttributeName)
      : t.morphTargets === !0 && r.bindAttribLocation(S, 0, 'position'),
    r.linkProgram(S);
  function L(w) {
    if (i.debug.checkShaderErrors) {
      const U = r.getProgramInfoLog(S) || '',
        z = r.getShaderInfoLog(P) || '',
        G = r.getShaderInfoLog(R) || '',
        V = U.trim(),
        X = z.trim(),
        Z = G.trim();
      let H = !0,
        se = !0;
      if (r.getProgramParameter(S, r.LINK_STATUS) === !1)
        if (((H = !1), typeof i.debug.onShaderError == 'function'))
          i.debug.onShaderError(r, S, P, R);
        else {
          const ue = Qo(r, P, 'vertex'),
            Ae = Qo(r, R, 'fragment');
          console.error(
            'THREE.WebGLProgram: Shader Error ' +
              r.getError() +
              ' - VALIDATE_STATUS ' +
              r.getProgramParameter(S, r.VALIDATE_STATUS) +
              `

Material Name: ` +
              w.name +
              `
Material Type: ` +
              w.type +
              `

Program Info Log: ` +
              V +
              `
` +
              ue +
              `
` +
              Ae,
          );
        }
      else
        V !== ''
          ? console.warn('THREE.WebGLProgram: Program Info Log:', V)
          : (X === '' || Z === '') && (se = !1);
      se &&
        (w.diagnostics = {
          runnable: H,
          programLog: V,
          vertexShader: { log: X, prefix: p },
          fragmentShader: { log: Z, prefix: d },
        });
    }
    r.deleteShader(P), r.deleteShader(R), (A = new zr(r, S)), (x = rm(r, S));
  }
  let A;
  this.getUniforms = function () {
    return A === void 0 && L(this), A;
  };
  let x;
  this.getAttributes = function () {
    return x === void 0 && L(this), x;
  };
  let _ = t.rendererExtensionParallelShaderCompile === !1;
  return (
    (this.isReady = function () {
      return _ === !1 && (_ = r.getProgramParameter(S, Kp)), _;
    }),
    (this.destroy = function () {
      n.releaseStatesOfProgram(this), r.deleteProgram(S), (this.program = void 0);
    }),
    (this.type = t.shaderType),
    (this.name = t.shaderName),
    (this.id = Zp++),
    (this.cacheKey = e),
    (this.usedTimes = 1),
    (this.program = S),
    (this.vertexShader = P),
    (this.fragmentShader = R),
    this
  );
}
let gm = 0;
class _m {
  constructor() {
    (this.shaderCache = new Map()), (this.materialCache = new Map());
  }
  update(e) {
    const t = e.vertexShader,
      n = e.fragmentShader,
      r = this._getShaderStage(t),
      s = this._getShaderStage(n),
      a = this._getShaderCacheForMaterial(e);
    return (
      a.has(r) === !1 && (a.add(r), r.usedTimes++),
      a.has(s) === !1 && (a.add(s), s.usedTimes++),
      this
    );
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && ((n = new Set()), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && ((n = new vm(e)), t.set(e, n)), n;
  }
}
class vm {
  constructor(e) {
    (this.id = gm++), (this.code = e), (this.usedTimes = 0);
  }
}
function xm(i, e, t, n, r, s, a) {
  const o = new Ua(),
    l = new _m(),
    c = new Set(),
    u = [],
    h = r.logarithmicDepthBuffer,
    f = r.vertexTextures;
  let m = r.precision;
  const g = {
    MeshDepthMaterial: 'depth',
    MeshDistanceMaterial: 'distanceRGBA',
    MeshNormalMaterial: 'normal',
    MeshBasicMaterial: 'basic',
    MeshLambertMaterial: 'lambert',
    MeshPhongMaterial: 'phong',
    MeshToonMaterial: 'toon',
    MeshStandardMaterial: 'physical',
    MeshPhysicalMaterial: 'physical',
    MeshMatcapMaterial: 'matcap',
    LineBasicMaterial: 'basic',
    LineDashedMaterial: 'dashed',
    PointsMaterial: 'points',
    ShadowMaterial: 'shadow',
    SpriteMaterial: 'sprite',
  };
  function S(x) {
    return c.add(x), x === 0 ? 'uv' : `uv${x}`;
  }
  function p(x, _, w, U, z) {
    const G = U.fog,
      V = z.geometry,
      X = x.isMeshStandardMaterial ? U.environment : null,
      Z = (x.isMeshStandardMaterial ? t : e).get(x.envMap || X),
      H = Z && Z.mapping === qr ? Z.image.height : null,
      se = g[x.type];
    x.precision !== null &&
      ((m = r.getMaxPrecision(x.precision)),
      m !== x.precision &&
        console.warn(
          'THREE.WebGLProgram.getParameters:',
          x.precision,
          'not supported, using',
          m,
          'instead.',
        ));
    const ue = V.morphAttributes.position || V.morphAttributes.normal || V.morphAttributes.color,
      Ae = ue !== void 0 ? ue.length : 0;
    let He = 0;
    V.morphAttributes.position !== void 0 && (He = 1),
      V.morphAttributes.normal !== void 0 && (He = 2),
      V.morphAttributes.color !== void 0 && (He = 3);
    let tt, st, Ke, $;
    if (se) {
      const Ze = en[se];
      (tt = Ze.vertexShader), (st = Ze.fragmentShader);
    } else
      (tt = x.vertexShader),
        (st = x.fragmentShader),
        l.update(x),
        (Ke = l.getVertexShaderID(x)),
        ($ = l.getFragmentShaderID(x));
    const J = i.getRenderTarget(),
      me = i.state.buffers.depth.getReversed(),
      Ie = z.isInstancedMesh === !0,
      Te = z.isBatchedMesh === !0,
      qe = !!x.map,
      bt = !!x.matcap,
      C = !!Z,
      at = !!x.aoMap,
      Ne = !!x.lightMap,
      Le = !!x.bumpMap,
      xe = !!x.normalMap,
      ot = !!x.displacementMap,
      Me = !!x.emissiveMap,
      Be = !!x.metalnessMap,
      _t = !!x.roughnessMap,
      ft = x.anisotropy > 0,
      T = x.clearcoat > 0,
      v = x.dispersion > 0,
      O = x.iridescence > 0,
      q = x.sheen > 0,
      j = x.transmission > 0,
      W = ft && !!x.anisotropyMap,
      Ee = T && !!x.clearcoatMap,
      re = T && !!x.clearcoatNormalMap,
      Se = T && !!x.clearcoatRoughnessMap,
      ye = O && !!x.iridescenceMap,
      te = O && !!x.iridescenceThicknessMap,
      he = q && !!x.sheenColorMap,
      Pe = q && !!x.sheenRoughnessMap,
      be = !!x.specularMap,
      le = !!x.specularColorMap,
      Fe = !!x.specularIntensityMap,
      D = j && !!x.transmissionMap,
      ne = j && !!x.thicknessMap,
      ae = !!x.gradientMap,
      pe = !!x.alphaMap,
      Q = x.alphaTest > 0,
      K = !!x.alphaHash,
      ve = !!x.extensions;
    let Ue = Rn;
    x.toneMapped && (J === null || J.isXRRenderTarget === !0) && (Ue = i.toneMapping);
    const nt = {
      shaderID: se,
      shaderType: x.type,
      shaderName: x.name,
      vertexShader: tt,
      fragmentShader: st,
      defines: x.defines,
      customVertexShaderID: Ke,
      customFragmentShaderID: $,
      isRawShaderMaterial: x.isRawShaderMaterial === !0,
      glslVersion: x.glslVersion,
      precision: m,
      batching: Te,
      batchingColor: Te && z._colorsTexture !== null,
      instancing: Ie,
      instancingColor: Ie && z.instanceColor !== null,
      instancingMorph: Ie && z.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace:
        J === null ? i.outputColorSpace : J.isXRRenderTarget === !0 ? J.texture.colorSpace : Ci,
      alphaToCoverage: !!x.alphaToCoverage,
      map: qe,
      matcap: bt,
      envMap: C,
      envMapMode: C && Z.mapping,
      envMapCubeUVHeight: H,
      aoMap: at,
      lightMap: Ne,
      bumpMap: Le,
      normalMap: xe,
      displacementMap: f && ot,
      emissiveMap: Me,
      normalMapObjectSpace: xe && x.normalMapType === Yc,
      normalMapTangentSpace: xe && x.normalMapType === Rl,
      metalnessMap: Be,
      roughnessMap: _t,
      anisotropy: ft,
      anisotropyMap: W,
      clearcoat: T,
      clearcoatMap: Ee,
      clearcoatNormalMap: re,
      clearcoatRoughnessMap: Se,
      dispersion: v,
      iridescence: O,
      iridescenceMap: ye,
      iridescenceThicknessMap: te,
      sheen: q,
      sheenColorMap: he,
      sheenRoughnessMap: Pe,
      specularMap: be,
      specularColorMap: le,
      specularIntensityMap: Fe,
      transmission: j,
      transmissionMap: D,
      thicknessMap: ne,
      gradientMap: ae,
      opaque: x.transparent === !1 && x.blending === Si && x.alphaToCoverage === !1,
      alphaMap: pe,
      alphaTest: Q,
      alphaHash: K,
      combine: x.combine,
      mapUv: qe && S(x.map.channel),
      aoMapUv: at && S(x.aoMap.channel),
      lightMapUv: Ne && S(x.lightMap.channel),
      bumpMapUv: Le && S(x.bumpMap.channel),
      normalMapUv: xe && S(x.normalMap.channel),
      displacementMapUv: ot && S(x.displacementMap.channel),
      emissiveMapUv: Me && S(x.emissiveMap.channel),
      metalnessMapUv: Be && S(x.metalnessMap.channel),
      roughnessMapUv: _t && S(x.roughnessMap.channel),
      anisotropyMapUv: W && S(x.anisotropyMap.channel),
      clearcoatMapUv: Ee && S(x.clearcoatMap.channel),
      clearcoatNormalMapUv: re && S(x.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Se && S(x.clearcoatRoughnessMap.channel),
      iridescenceMapUv: ye && S(x.iridescenceMap.channel),
      iridescenceThicknessMapUv: te && S(x.iridescenceThicknessMap.channel),
      sheenColorMapUv: he && S(x.sheenColorMap.channel),
      sheenRoughnessMapUv: Pe && S(x.sheenRoughnessMap.channel),
      specularMapUv: be && S(x.specularMap.channel),
      specularColorMapUv: le && S(x.specularColorMap.channel),
      specularIntensityMapUv: Fe && S(x.specularIntensityMap.channel),
      transmissionMapUv: D && S(x.transmissionMap.channel),
      thicknessMapUv: ne && S(x.thicknessMap.channel),
      alphaMapUv: pe && S(x.alphaMap.channel),
      vertexTangents: !!V.attributes.tangent && (xe || ft),
      vertexColors: x.vertexColors,
      vertexAlphas:
        x.vertexColors === !0 && !!V.attributes.color && V.attributes.color.itemSize === 4,
      pointsUvs: z.isPoints === !0 && !!V.attributes.uv && (qe || pe),
      fog: !!G,
      useFog: x.fog === !0,
      fogExp2: !!G && G.isFogExp2,
      flatShading: x.flatShading === !0 && x.wireframe === !1,
      sizeAttenuation: x.sizeAttenuation === !0,
      logarithmicDepthBuffer: h,
      reversedDepthBuffer: me,
      skinning: z.isSkinnedMesh === !0,
      morphTargets: V.morphAttributes.position !== void 0,
      morphNormals: V.morphAttributes.normal !== void 0,
      morphColors: V.morphAttributes.color !== void 0,
      morphTargetsCount: Ae,
      morphTextureStride: He,
      numDirLights: _.directional.length,
      numPointLights: _.point.length,
      numSpotLights: _.spot.length,
      numSpotLightMaps: _.spotLightMap.length,
      numRectAreaLights: _.rectArea.length,
      numHemiLights: _.hemi.length,
      numDirLightShadows: _.directionalShadowMap.length,
      numPointLightShadows: _.pointShadowMap.length,
      numSpotLightShadows: _.spotShadowMap.length,
      numSpotLightShadowsWithMaps: _.numSpotLightShadowsWithMaps,
      numLightProbes: _.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: x.dithering,
      shadowMapEnabled: i.shadowMap.enabled && w.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Ue,
      decodeVideoTexture:
        qe && x.map.isVideoTexture === !0 && Ye.getTransfer(x.map.colorSpace) === Je,
      decodeVideoTextureEmissive:
        Me &&
        x.emissiveMap.isVideoTexture === !0 &&
        Ye.getTransfer(x.emissiveMap.colorSpace) === Je,
      premultipliedAlpha: x.premultipliedAlpha,
      doubleSided: x.side === tn,
      flipSided: x.side === Lt,
      useDepthPacking: x.depthPacking >= 0,
      depthPacking: x.depthPacking || 0,
      index0AttributeName: x.index0AttributeName,
      extensionClipCullDistance:
        ve && x.extensions.clipCullDistance === !0 && n.has('WEBGL_clip_cull_distance'),
      extensionMultiDraw:
        ((ve && x.extensions.multiDraw === !0) || Te) && n.has('WEBGL_multi_draw'),
      rendererExtensionParallelShaderCompile: n.has('KHR_parallel_shader_compile'),
      customProgramCacheKey: x.customProgramCacheKey(),
    };
    return (
      (nt.vertexUv1s = c.has(1)),
      (nt.vertexUv2s = c.has(2)),
      (nt.vertexUv3s = c.has(3)),
      c.clear(),
      nt
    );
  }
  function d(x) {
    const _ = [];
    if (
      (x.shaderID
        ? _.push(x.shaderID)
        : (_.push(x.customVertexShaderID), _.push(x.customFragmentShaderID)),
      x.defines !== void 0)
    )
      for (const w in x.defines) _.push(w), _.push(x.defines[w]);
    return (
      x.isRawShaderMaterial === !1 && (E(_, x), b(_, x), _.push(i.outputColorSpace)),
      _.push(x.customProgramCacheKey),
      _.join()
    );
  }
  function E(x, _) {
    x.push(_.precision),
      x.push(_.outputColorSpace),
      x.push(_.envMapMode),
      x.push(_.envMapCubeUVHeight),
      x.push(_.mapUv),
      x.push(_.alphaMapUv),
      x.push(_.lightMapUv),
      x.push(_.aoMapUv),
      x.push(_.bumpMapUv),
      x.push(_.normalMapUv),
      x.push(_.displacementMapUv),
      x.push(_.emissiveMapUv),
      x.push(_.metalnessMapUv),
      x.push(_.roughnessMapUv),
      x.push(_.anisotropyMapUv),
      x.push(_.clearcoatMapUv),
      x.push(_.clearcoatNormalMapUv),
      x.push(_.clearcoatRoughnessMapUv),
      x.push(_.iridescenceMapUv),
      x.push(_.iridescenceThicknessMapUv),
      x.push(_.sheenColorMapUv),
      x.push(_.sheenRoughnessMapUv),
      x.push(_.specularMapUv),
      x.push(_.specularColorMapUv),
      x.push(_.specularIntensityMapUv),
      x.push(_.transmissionMapUv),
      x.push(_.thicknessMapUv),
      x.push(_.combine),
      x.push(_.fogExp2),
      x.push(_.sizeAttenuation),
      x.push(_.morphTargetsCount),
      x.push(_.morphAttributeCount),
      x.push(_.numDirLights),
      x.push(_.numPointLights),
      x.push(_.numSpotLights),
      x.push(_.numSpotLightMaps),
      x.push(_.numHemiLights),
      x.push(_.numRectAreaLights),
      x.push(_.numDirLightShadows),
      x.push(_.numPointLightShadows),
      x.push(_.numSpotLightShadows),
      x.push(_.numSpotLightShadowsWithMaps),
      x.push(_.numLightProbes),
      x.push(_.shadowMapType),
      x.push(_.toneMapping),
      x.push(_.numClippingPlanes),
      x.push(_.numClipIntersection),
      x.push(_.depthPacking);
  }
  function b(x, _) {
    o.disableAll(),
      _.supportsVertexTextures && o.enable(0),
      _.instancing && o.enable(1),
      _.instancingColor && o.enable(2),
      _.instancingMorph && o.enable(3),
      _.matcap && o.enable(4),
      _.envMap && o.enable(5),
      _.normalMapObjectSpace && o.enable(6),
      _.normalMapTangentSpace && o.enable(7),
      _.clearcoat && o.enable(8),
      _.iridescence && o.enable(9),
      _.alphaTest && o.enable(10),
      _.vertexColors && o.enable(11),
      _.vertexAlphas && o.enable(12),
      _.vertexUv1s && o.enable(13),
      _.vertexUv2s && o.enable(14),
      _.vertexUv3s && o.enable(15),
      _.vertexTangents && o.enable(16),
      _.anisotropy && o.enable(17),
      _.alphaHash && o.enable(18),
      _.batching && o.enable(19),
      _.dispersion && o.enable(20),
      _.batchingColor && o.enable(21),
      _.gradientMap && o.enable(22),
      x.push(o.mask),
      o.disableAll(),
      _.fog && o.enable(0),
      _.useFog && o.enable(1),
      _.flatShading && o.enable(2),
      _.logarithmicDepthBuffer && o.enable(3),
      _.reversedDepthBuffer && o.enable(4),
      _.skinning && o.enable(5),
      _.morphTargets && o.enable(6),
      _.morphNormals && o.enable(7),
      _.morphColors && o.enable(8),
      _.premultipliedAlpha && o.enable(9),
      _.shadowMapEnabled && o.enable(10),
      _.doubleSided && o.enable(11),
      _.flipSided && o.enable(12),
      _.useDepthPacking && o.enable(13),
      _.dithering && o.enable(14),
      _.transmission && o.enable(15),
      _.sheen && o.enable(16),
      _.opaque && o.enable(17),
      _.pointsUvs && o.enable(18),
      _.decodeVideoTexture && o.enable(19),
      _.decodeVideoTextureEmissive && o.enable(20),
      _.alphaToCoverage && o.enable(21),
      x.push(o.mask);
  }
  function y(x) {
    const _ = g[x.type];
    let w;
    if (_) {
      const U = en[_];
      w = Bh.clone(U.uniforms);
    } else w = x.uniforms;
    return w;
  }
  function P(x, _) {
    let w;
    for (let U = 0, z = u.length; U < z; U++) {
      const G = u[U];
      if (G.cacheKey === _) {
        (w = G), ++w.usedTimes;
        break;
      }
    }
    return w === void 0 && ((w = new mm(i, _, x, s)), u.push(w)), w;
  }
  function R(x) {
    if (--x.usedTimes === 0) {
      const _ = u.indexOf(x);
      (u[_] = u[u.length - 1]), u.pop(), x.destroy();
    }
  }
  function L(x) {
    l.remove(x);
  }
  function A() {
    l.dispose();
  }
  return {
    getParameters: p,
    getProgramCacheKey: d,
    getUniforms: y,
    acquireProgram: P,
    releaseProgram: R,
    releaseShaderCache: L,
    programs: u,
    dispose: A,
  };
}
function Mm() {
  let i = new WeakMap();
  function e(a) {
    return i.has(a);
  }
  function t(a) {
    let o = i.get(a);
    return o === void 0 && ((o = {}), i.set(a, o)), o;
  }
  function n(a) {
    i.delete(a);
  }
  function r(a, o, l) {
    i.get(a)[o] = l;
  }
  function s() {
    i = new WeakMap();
  }
  return { has: e, get: t, remove: n, update: r, dispose: s };
}
function Sm(i, e) {
  return i.groupOrder !== e.groupOrder
    ? i.groupOrder - e.groupOrder
    : i.renderOrder !== e.renderOrder
      ? i.renderOrder - e.renderOrder
      : i.material.id !== e.material.id
        ? i.material.id - e.material.id
        : i.z !== e.z
          ? i.z - e.z
          : i.id - e.id;
}
function rl(i, e) {
  return i.groupOrder !== e.groupOrder
    ? i.groupOrder - e.groupOrder
    : i.renderOrder !== e.renderOrder
      ? i.renderOrder - e.renderOrder
      : i.z !== e.z
        ? e.z - i.z
        : i.id - e.id;
}
function sl() {
  const i = [];
  let e = 0;
  const t = [],
    n = [],
    r = [];
  function s() {
    (e = 0), (t.length = 0), (n.length = 0), (r.length = 0);
  }
  function a(h, f, m, g, S, p) {
    let d = i[e];
    return (
      d === void 0
        ? ((d = {
            id: h.id,
            object: h,
            geometry: f,
            material: m,
            groupOrder: g,
            renderOrder: h.renderOrder,
            z: S,
            group: p,
          }),
          (i[e] = d))
        : ((d.id = h.id),
          (d.object = h),
          (d.geometry = f),
          (d.material = m),
          (d.groupOrder = g),
          (d.renderOrder = h.renderOrder),
          (d.z = S),
          (d.group = p)),
      e++,
      d
    );
  }
  function o(h, f, m, g, S, p) {
    const d = a(h, f, m, g, S, p);
    m.transmission > 0 ? n.push(d) : m.transparent === !0 ? r.push(d) : t.push(d);
  }
  function l(h, f, m, g, S, p) {
    const d = a(h, f, m, g, S, p);
    m.transmission > 0 ? n.unshift(d) : m.transparent === !0 ? r.unshift(d) : t.unshift(d);
  }
  function c(h, f) {
    t.length > 1 && t.sort(h || Sm),
      n.length > 1 && n.sort(f || rl),
      r.length > 1 && r.sort(f || rl);
  }
  function u() {
    for (let h = e, f = i.length; h < f; h++) {
      const m = i[h];
      if (m.id === null) break;
      (m.id = null), (m.object = null), (m.geometry = null), (m.material = null), (m.group = null);
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: u,
    sort: c,
  };
}
function ym() {
  let i = new WeakMap();
  function e(n, r) {
    const s = i.get(n);
    let a;
    return (
      s === void 0
        ? ((a = new sl()), i.set(n, [a]))
        : r >= s.length
          ? ((a = new sl()), s.push(a))
          : (a = s[r]),
      a
    );
  }
  function t() {
    i = new WeakMap();
  }
  return { get: e, dispose: t };
}
function bm() {
  const i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case 'DirectionalLight':
          t = { direction: new F(), color: new ke() };
          break;
        case 'SpotLight':
          t = {
            position: new F(),
            direction: new F(),
            color: new ke(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0,
          };
          break;
        case 'PointLight':
          t = { position: new F(), color: new ke(), distance: 0, decay: 0 };
          break;
        case 'HemisphereLight':
          t = { direction: new F(), skyColor: new ke(), groundColor: new ke() };
          break;
        case 'RectAreaLight':
          t = { color: new ke(), position: new F(), halfWidth: new F(), halfHeight: new F() };
          break;
      }
      return (i[e.id] = t), t;
    },
  };
}
function Em() {
  const i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case 'DirectionalLight':
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new We(),
          };
          break;
        case 'SpotLight':
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new We(),
          };
          break;
        case 'PointLight':
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new We(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3,
          };
          break;
      }
      return (i[e.id] = t), t;
    },
  };
}
let Tm = 0;
function Am(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function wm(i) {
  const e = new bm(),
    t = Em(),
    n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1,
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0,
    };
  for (let c = 0; c < 9; c++) n.probe.push(new F());
  const r = new F(),
    s = new rt(),
    a = new rt();
  function o(c) {
    let u = 0,
      h = 0,
      f = 0;
    for (let x = 0; x < 9; x++) n.probe[x].set(0, 0, 0);
    let m = 0,
      g = 0,
      S = 0,
      p = 0,
      d = 0,
      E = 0,
      b = 0,
      y = 0,
      P = 0,
      R = 0,
      L = 0;
    c.sort(Am);
    for (let x = 0, _ = c.length; x < _; x++) {
      const w = c[x],
        U = w.color,
        z = w.intensity,
        G = w.distance,
        V = w.shadow && w.shadow.map ? w.shadow.map.texture : null;
      if (w.isAmbientLight) (u += U.r * z), (h += U.g * z), (f += U.b * z);
      else if (w.isLightProbe) {
        for (let X = 0; X < 9; X++) n.probe[X].addScaledVector(w.sh.coefficients[X], z);
        L++;
      } else if (w.isDirectionalLight) {
        const X = e.get(w);
        if ((X.color.copy(w.color).multiplyScalar(w.intensity), w.castShadow)) {
          const Z = w.shadow,
            H = t.get(w);
          (H.shadowIntensity = Z.intensity),
            (H.shadowBias = Z.bias),
            (H.shadowNormalBias = Z.normalBias),
            (H.shadowRadius = Z.radius),
            (H.shadowMapSize = Z.mapSize),
            (n.directionalShadow[m] = H),
            (n.directionalShadowMap[m] = V),
            (n.directionalShadowMatrix[m] = w.shadow.matrix),
            E++;
        }
        (n.directional[m] = X), m++;
      } else if (w.isSpotLight) {
        const X = e.get(w);
        X.position.setFromMatrixPosition(w.matrixWorld),
          X.color.copy(U).multiplyScalar(z),
          (X.distance = G),
          (X.coneCos = Math.cos(w.angle)),
          (X.penumbraCos = Math.cos(w.angle * (1 - w.penumbra))),
          (X.decay = w.decay),
          (n.spot[S] = X);
        const Z = w.shadow;
        if (
          (w.map && ((n.spotLightMap[P] = w.map), P++, Z.updateMatrices(w), w.castShadow && R++),
          (n.spotLightMatrix[S] = Z.matrix),
          w.castShadow)
        ) {
          const H = t.get(w);
          (H.shadowIntensity = Z.intensity),
            (H.shadowBias = Z.bias),
            (H.shadowNormalBias = Z.normalBias),
            (H.shadowRadius = Z.radius),
            (H.shadowMapSize = Z.mapSize),
            (n.spotShadow[S] = H),
            (n.spotShadowMap[S] = V),
            y++;
        }
        S++;
      } else if (w.isRectAreaLight) {
        const X = e.get(w);
        X.color.copy(U).multiplyScalar(z),
          X.halfWidth.set(w.width * 0.5, 0, 0),
          X.halfHeight.set(0, w.height * 0.5, 0),
          (n.rectArea[p] = X),
          p++;
      } else if (w.isPointLight) {
        const X = e.get(w);
        if (
          (X.color.copy(w.color).multiplyScalar(w.intensity),
          (X.distance = w.distance),
          (X.decay = w.decay),
          w.castShadow)
        ) {
          const Z = w.shadow,
            H = t.get(w);
          (H.shadowIntensity = Z.intensity),
            (H.shadowBias = Z.bias),
            (H.shadowNormalBias = Z.normalBias),
            (H.shadowRadius = Z.radius),
            (H.shadowMapSize = Z.mapSize),
            (H.shadowCameraNear = Z.camera.near),
            (H.shadowCameraFar = Z.camera.far),
            (n.pointShadow[g] = H),
            (n.pointShadowMap[g] = V),
            (n.pointShadowMatrix[g] = w.shadow.matrix),
            b++;
        }
        (n.point[g] = X), g++;
      } else if (w.isHemisphereLight) {
        const X = e.get(w);
        X.skyColor.copy(w.color).multiplyScalar(z),
          X.groundColor.copy(w.groundColor).multiplyScalar(z),
          (n.hemi[d] = X),
          d++;
      }
    }
    p > 0 &&
      (i.has('OES_texture_float_linear') === !0
        ? ((n.rectAreaLTC1 = oe.LTC_FLOAT_1), (n.rectAreaLTC2 = oe.LTC_FLOAT_2))
        : ((n.rectAreaLTC1 = oe.LTC_HALF_1), (n.rectAreaLTC2 = oe.LTC_HALF_2))),
      (n.ambient[0] = u),
      (n.ambient[1] = h),
      (n.ambient[2] = f);
    const A = n.hash;
    (A.directionalLength !== m ||
      A.pointLength !== g ||
      A.spotLength !== S ||
      A.rectAreaLength !== p ||
      A.hemiLength !== d ||
      A.numDirectionalShadows !== E ||
      A.numPointShadows !== b ||
      A.numSpotShadows !== y ||
      A.numSpotMaps !== P ||
      A.numLightProbes !== L) &&
      ((n.directional.length = m),
      (n.spot.length = S),
      (n.rectArea.length = p),
      (n.point.length = g),
      (n.hemi.length = d),
      (n.directionalShadow.length = E),
      (n.directionalShadowMap.length = E),
      (n.pointShadow.length = b),
      (n.pointShadowMap.length = b),
      (n.spotShadow.length = y),
      (n.spotShadowMap.length = y),
      (n.directionalShadowMatrix.length = E),
      (n.pointShadowMatrix.length = b),
      (n.spotLightMatrix.length = y + P - R),
      (n.spotLightMap.length = P),
      (n.numSpotLightShadowsWithMaps = R),
      (n.numLightProbes = L),
      (A.directionalLength = m),
      (A.pointLength = g),
      (A.spotLength = S),
      (A.rectAreaLength = p),
      (A.hemiLength = d),
      (A.numDirectionalShadows = E),
      (A.numPointShadows = b),
      (A.numSpotShadows = y),
      (A.numSpotMaps = P),
      (A.numLightProbes = L),
      (n.version = Tm++));
  }
  function l(c, u) {
    let h = 0,
      f = 0,
      m = 0,
      g = 0,
      S = 0;
    const p = u.matrixWorldInverse;
    for (let d = 0, E = c.length; d < E; d++) {
      const b = c[d];
      if (b.isDirectionalLight) {
        const y = n.directional[h];
        y.direction.setFromMatrixPosition(b.matrixWorld),
          r.setFromMatrixPosition(b.target.matrixWorld),
          y.direction.sub(r),
          y.direction.transformDirection(p),
          h++;
      } else if (b.isSpotLight) {
        const y = n.spot[m];
        y.position.setFromMatrixPosition(b.matrixWorld),
          y.position.applyMatrix4(p),
          y.direction.setFromMatrixPosition(b.matrixWorld),
          r.setFromMatrixPosition(b.target.matrixWorld),
          y.direction.sub(r),
          y.direction.transformDirection(p),
          m++;
      } else if (b.isRectAreaLight) {
        const y = n.rectArea[g];
        y.position.setFromMatrixPosition(b.matrixWorld),
          y.position.applyMatrix4(p),
          a.identity(),
          s.copy(b.matrixWorld),
          s.premultiply(p),
          a.extractRotation(s),
          y.halfWidth.set(b.width * 0.5, 0, 0),
          y.halfHeight.set(0, b.height * 0.5, 0),
          y.halfWidth.applyMatrix4(a),
          y.halfHeight.applyMatrix4(a),
          g++;
      } else if (b.isPointLight) {
        const y = n.point[f];
        y.position.setFromMatrixPosition(b.matrixWorld), y.position.applyMatrix4(p), f++;
      } else if (b.isHemisphereLight) {
        const y = n.hemi[S];
        y.direction.setFromMatrixPosition(b.matrixWorld), y.direction.transformDirection(p), S++;
      }
    }
  }
  return { setup: o, setupView: l, state: n };
}
function al(i) {
  const e = new wm(i),
    t = [],
    n = [];
  function r(u) {
    (c.camera = u), (t.length = 0), (n.length = 0);
  }
  function s(u) {
    t.push(u);
  }
  function a(u) {
    n.push(u);
  }
  function o() {
    e.setup(t);
  }
  function l(u) {
    e.setupView(t, u);
  }
  const c = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {},
  };
  return { init: r, state: c, setupLights: o, setupLightsView: l, pushLight: s, pushShadow: a };
}
function Rm(i) {
  let e = new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return (
      a === void 0
        ? ((o = new al(i)), e.set(r, [o]))
        : s >= a.length
          ? ((o = new al(i)), a.push(o))
          : (o = a[s]),
      o
    );
  }
  function n() {
    e = new WeakMap();
  }
  return { get: t, dispose: n };
}
const Cm = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  Pm = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Lm(i, e, t) {
  let n = new Fa();
  const r = new We(),
    s = new We(),
    a = new dt(),
    o = new jh({ depthPacking: $c }),
    l = new Jh(),
    c = {},
    u = t.maxTextureSize,
    h = { [Pn]: Lt, [Lt]: Pn, [tn]: tn },
    f = new gn({
      defines: { VSM_SAMPLES: 8 },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new We() },
        radius: { value: 4 },
      },
      vertexShader: Cm,
      fragmentShader: Pm,
    }),
    m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const g = new Jt();
  g.setAttribute('position', new kt(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  const S = new St(g, f),
    p = this;
  (this.enabled = !1), (this.autoUpdate = !0), (this.needsUpdate = !1), (this.type = gl);
  let d = this.type;
  this.render = function (R, L, A) {
    if (p.enabled === !1 || (p.autoUpdate === !1 && p.needsUpdate === !1) || R.length === 0) return;
    const x = i.getRenderTarget(),
      _ = i.getActiveCubeFace(),
      w = i.getActiveMipmapLevel(),
      U = i.state;
    U.setBlending(wn),
      U.buffers.depth.getReversed() === !0
        ? U.buffers.color.setClear(0, 0, 0, 0)
        : U.buffers.color.setClear(1, 1, 1, 1),
      U.buffers.depth.setTest(!0),
      U.setScissorTest(!1);
    const z = d !== pn && this.type === pn,
      G = d === pn && this.type !== pn;
    for (let V = 0, X = R.length; V < X; V++) {
      const Z = R[V],
        H = Z.shadow;
      if (H === void 0) {
        console.warn('THREE.WebGLShadowMap:', Z, 'has no shadow.');
        continue;
      }
      if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
      r.copy(H.mapSize);
      const se = H.getFrameExtents();
      if (
        (r.multiply(se),
        s.copy(H.mapSize),
        (r.x > u || r.y > u) &&
          (r.x > u && ((s.x = Math.floor(u / se.x)), (r.x = s.x * se.x), (H.mapSize.x = s.x)),
          r.y > u && ((s.y = Math.floor(u / se.y)), (r.y = s.y * se.y), (H.mapSize.y = s.y))),
        H.map === null || z === !0 || G === !0)
      ) {
        const Ae = this.type !== pn ? { minFilter: zt, magFilter: zt } : {};
        H.map !== null && H.map.dispose(),
          (H.map = new Zn(r.x, r.y, Ae)),
          (H.map.texture.name = Z.name + '.shadowMap'),
          H.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(H.map), i.clear();
      const ue = H.getViewportCount();
      for (let Ae = 0; Ae < ue; Ae++) {
        const He = H.getViewport(Ae);
        a.set(s.x * He.x, s.y * He.y, s.x * He.z, s.y * He.w),
          U.viewport(a),
          H.updateMatrices(Z, Ae),
          (n = H.getFrustum()),
          y(L, A, H.camera, Z, this.type);
      }
      H.isPointLightShadow !== !0 && this.type === pn && E(H, A), (H.needsUpdate = !1);
    }
    (d = this.type), (p.needsUpdate = !1), i.setRenderTarget(x, _, w);
  };
  function E(R, L) {
    const A = e.update(S);
    f.defines.VSM_SAMPLES !== R.blurSamples &&
      ((f.defines.VSM_SAMPLES = R.blurSamples),
      (m.defines.VSM_SAMPLES = R.blurSamples),
      (f.needsUpdate = !0),
      (m.needsUpdate = !0)),
      R.mapPass === null && (R.mapPass = new Zn(r.x, r.y)),
      (f.uniforms.shadow_pass.value = R.map.texture),
      (f.uniforms.resolution.value = R.mapSize),
      (f.uniforms.radius.value = R.radius),
      i.setRenderTarget(R.mapPass),
      i.clear(),
      i.renderBufferDirect(L, null, A, f, S, null),
      (m.uniforms.shadow_pass.value = R.mapPass.texture),
      (m.uniforms.resolution.value = R.mapSize),
      (m.uniforms.radius.value = R.radius),
      i.setRenderTarget(R.map),
      i.clear(),
      i.renderBufferDirect(L, null, A, m, S, null);
  }
  function b(R, L, A, x) {
    let _ = null;
    const w = A.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (w !== void 0) _ = w;
    else if (
      ((_ = A.isPointLight === !0 ? l : o),
      (i.localClippingEnabled &&
        L.clipShadows === !0 &&
        Array.isArray(L.clippingPlanes) &&
        L.clippingPlanes.length !== 0) ||
        (L.displacementMap && L.displacementScale !== 0) ||
        (L.alphaMap && L.alphaTest > 0) ||
        (L.map && L.alphaTest > 0) ||
        L.alphaToCoverage === !0)
    ) {
      const U = _.uuid,
        z = L.uuid;
      let G = c[U];
      G === void 0 && ((G = {}), (c[U] = G));
      let V = G[z];
      V === void 0 && ((V = _.clone()), (G[z] = V), L.addEventListener('dispose', P)), (_ = V);
    }
    if (
      ((_.visible = L.visible),
      (_.wireframe = L.wireframe),
      x === pn
        ? (_.side = L.shadowSide !== null ? L.shadowSide : L.side)
        : (_.side = L.shadowSide !== null ? L.shadowSide : h[L.side]),
      (_.alphaMap = L.alphaMap),
      (_.alphaTest = L.alphaToCoverage === !0 ? 0.5 : L.alphaTest),
      (_.map = L.map),
      (_.clipShadows = L.clipShadows),
      (_.clippingPlanes = L.clippingPlanes),
      (_.clipIntersection = L.clipIntersection),
      (_.displacementMap = L.displacementMap),
      (_.displacementScale = L.displacementScale),
      (_.displacementBias = L.displacementBias),
      (_.wireframeLinewidth = L.wireframeLinewidth),
      (_.linewidth = L.linewidth),
      A.isPointLight === !0 && _.isMeshDistanceMaterial === !0)
    ) {
      const U = i.properties.get(_);
      U.light = A;
    }
    return _;
  }
  function y(R, L, A, x, _) {
    if (R.visible === !1) return;
    if (
      R.layers.test(L.layers) &&
      (R.isMesh || R.isLine || R.isPoints) &&
      (R.castShadow || (R.receiveShadow && _ === pn)) &&
      (!R.frustumCulled || n.intersectsObject(R))
    ) {
      R.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse, R.matrixWorld);
      const z = e.update(R),
        G = R.material;
      if (Array.isArray(G)) {
        const V = z.groups;
        for (let X = 0, Z = V.length; X < Z; X++) {
          const H = V[X],
            se = G[H.materialIndex];
          if (se && se.visible) {
            const ue = b(R, se, x, _);
            R.onBeforeShadow(i, R, L, A, z, ue, H),
              i.renderBufferDirect(A, null, z, ue, R, H),
              R.onAfterShadow(i, R, L, A, z, ue, H);
          }
        }
      } else if (G.visible) {
        const V = b(R, G, x, _);
        R.onBeforeShadow(i, R, L, A, z, V, null),
          i.renderBufferDirect(A, null, z, V, R, null),
          R.onAfterShadow(i, R, L, A, z, V, null);
      }
    }
    const U = R.children;
    for (let z = 0, G = U.length; z < G; z++) y(U[z], L, A, x, _);
  }
  function P(R) {
    R.target.removeEventListener('dispose', P);
    for (const A in c) {
      const x = c[A],
        _ = R.target.uuid;
      _ in x && (x[_].dispose(), delete x[_]);
    }
  }
}
const Dm = { [Us]: Ns, [Fs]: zs, [Os]: ks, [Ai]: Bs, [Ns]: Us, [zs]: Fs, [ks]: Os, [Bs]: Ai };
function Im(i, e) {
  function t() {
    let D = !1;
    const ne = new dt();
    let ae = null;
    const pe = new dt(0, 0, 0, 0);
    return {
      setMask: function (Q) {
        ae !== Q && !D && (i.colorMask(Q, Q, Q, Q), (ae = Q));
      },
      setLocked: function (Q) {
        D = Q;
      },
      setClear: function (Q, K, ve, Ue, nt) {
        nt === !0 && ((Q *= Ue), (K *= Ue), (ve *= Ue)),
          ne.set(Q, K, ve, Ue),
          pe.equals(ne) === !1 && (i.clearColor(Q, K, ve, Ue), pe.copy(ne));
      },
      reset: function () {
        (D = !1), (ae = null), pe.set(-1, 0, 0, 0);
      },
    };
  }
  function n() {
    let D = !1,
      ne = !1,
      ae = null,
      pe = null,
      Q = null;
    return {
      setReversed: function (K) {
        if (ne !== K) {
          const ve = e.get('EXT_clip_control');
          K
            ? ve.clipControlEXT(ve.LOWER_LEFT_EXT, ve.ZERO_TO_ONE_EXT)
            : ve.clipControlEXT(ve.LOWER_LEFT_EXT, ve.NEGATIVE_ONE_TO_ONE_EXT),
            (ne = K);
          const Ue = Q;
          (Q = null), this.setClear(Ue);
        }
      },
      getReversed: function () {
        return ne;
      },
      setTest: function (K) {
        K ? J(i.DEPTH_TEST) : me(i.DEPTH_TEST);
      },
      setMask: function (K) {
        ae !== K && !D && (i.depthMask(K), (ae = K));
      },
      setFunc: function (K) {
        if ((ne && (K = Dm[K]), pe !== K)) {
          switch (K) {
            case Us:
              i.depthFunc(i.NEVER);
              break;
            case Ns:
              i.depthFunc(i.ALWAYS);
              break;
            case Fs:
              i.depthFunc(i.LESS);
              break;
            case Ai:
              i.depthFunc(i.LEQUAL);
              break;
            case Os:
              i.depthFunc(i.EQUAL);
              break;
            case Bs:
              i.depthFunc(i.GEQUAL);
              break;
            case zs:
              i.depthFunc(i.GREATER);
              break;
            case ks:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          pe = K;
        }
      },
      setLocked: function (K) {
        D = K;
      },
      setClear: function (K) {
        Q !== K && (ne && (K = 1 - K), i.clearDepth(K), (Q = K));
      },
      reset: function () {
        (D = !1), (ae = null), (pe = null), (Q = null), (ne = !1);
      },
    };
  }
  function r() {
    let D = !1,
      ne = null,
      ae = null,
      pe = null,
      Q = null,
      K = null,
      ve = null,
      Ue = null,
      nt = null;
    return {
      setTest: function (Ze) {
        D || (Ze ? J(i.STENCIL_TEST) : me(i.STENCIL_TEST));
      },
      setMask: function (Ze) {
        ne !== Ze && !D && (i.stencilMask(Ze), (ne = Ze));
      },
      setFunc: function (Ze, ln, Qt) {
        (ae !== Ze || pe !== ln || Q !== Qt) &&
          (i.stencilFunc(Ze, ln, Qt), (ae = Ze), (pe = ln), (Q = Qt));
      },
      setOp: function (Ze, ln, Qt) {
        (K !== Ze || ve !== ln || Ue !== Qt) &&
          (i.stencilOp(Ze, ln, Qt), (K = Ze), (ve = ln), (Ue = Qt));
      },
      setLocked: function (Ze) {
        D = Ze;
      },
      setClear: function (Ze) {
        nt !== Ze && (i.clearStencil(Ze), (nt = Ze));
      },
      reset: function () {
        (D = !1),
          (ne = null),
          (ae = null),
          (pe = null),
          (Q = null),
          (K = null),
          (ve = null),
          (Ue = null),
          (nt = null);
      },
    };
  }
  const s = new t(),
    a = new n(),
    o = new r(),
    l = new WeakMap(),
    c = new WeakMap();
  let u = {},
    h = {},
    f = new WeakMap(),
    m = [],
    g = null,
    S = !1,
    p = null,
    d = null,
    E = null,
    b = null,
    y = null,
    P = null,
    R = null,
    L = new ke(0, 0, 0),
    A = 0,
    x = !1,
    _ = null,
    w = null,
    U = null,
    z = null,
    G = null;
  const V = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let X = !1,
    Z = 0;
  const H = i.getParameter(i.VERSION);
  H.indexOf('WebGL') !== -1
    ? ((Z = parseFloat(/^WebGL (\d)/.exec(H)[1])), (X = Z >= 1))
    : H.indexOf('OpenGL ES') !== -1 &&
      ((Z = parseFloat(/^OpenGL ES (\d)/.exec(H)[1])), (X = Z >= 2));
  let se = null,
    ue = {};
  const Ae = i.getParameter(i.SCISSOR_BOX),
    He = i.getParameter(i.VIEWPORT),
    tt = new dt().fromArray(Ae),
    st = new dt().fromArray(He);
  function Ke(D, ne, ae, pe) {
    const Q = new Uint8Array(4),
      K = i.createTexture();
    i.bindTexture(D, K),
      i.texParameteri(D, i.TEXTURE_MIN_FILTER, i.NEAREST),
      i.texParameteri(D, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let ve = 0; ve < ae; ve++)
      D === i.TEXTURE_3D || D === i.TEXTURE_2D_ARRAY
        ? i.texImage3D(ne, 0, i.RGBA, 1, 1, pe, 0, i.RGBA, i.UNSIGNED_BYTE, Q)
        : i.texImage2D(ne + ve, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, Q);
    return K;
  }
  const $ = {};
  ($[i.TEXTURE_2D] = Ke(i.TEXTURE_2D, i.TEXTURE_2D, 1)),
    ($[i.TEXTURE_CUBE_MAP] = Ke(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6)),
    ($[i.TEXTURE_2D_ARRAY] = Ke(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1)),
    ($[i.TEXTURE_3D] = Ke(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1)),
    s.setClear(0, 0, 0, 1),
    a.setClear(1),
    o.setClear(0),
    J(i.DEPTH_TEST),
    a.setFunc(Ai),
    Le(!1),
    xe(io),
    J(i.CULL_FACE),
    at(wn);
  function J(D) {
    u[D] !== !0 && (i.enable(D), (u[D] = !0));
  }
  function me(D) {
    u[D] !== !1 && (i.disable(D), (u[D] = !1));
  }
  function Ie(D, ne) {
    return h[D] !== ne
      ? (i.bindFramebuffer(D, ne),
        (h[D] = ne),
        D === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = ne),
        D === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = ne),
        !0)
      : !1;
  }
  function Te(D, ne) {
    let ae = m,
      pe = !1;
    if (D) {
      (ae = f.get(ne)), ae === void 0 && ((ae = []), f.set(ne, ae));
      const Q = D.textures;
      if (ae.length !== Q.length || ae[0] !== i.COLOR_ATTACHMENT0) {
        for (let K = 0, ve = Q.length; K < ve; K++) ae[K] = i.COLOR_ATTACHMENT0 + K;
        (ae.length = Q.length), (pe = !0);
      }
    } else ae[0] !== i.BACK && ((ae[0] = i.BACK), (pe = !0));
    pe && i.drawBuffers(ae);
  }
  function qe(D) {
    return g !== D ? (i.useProgram(D), (g = D), !0) : !1;
  }
  const bt = { [Wn]: i.FUNC_ADD, [Mc]: i.FUNC_SUBTRACT, [Sc]: i.FUNC_REVERSE_SUBTRACT };
  (bt[yc] = i.MIN), (bt[bc] = i.MAX);
  const C = {
    [Ec]: i.ZERO,
    [Tc]: i.ONE,
    [Ac]: i.SRC_COLOR,
    [Ds]: i.SRC_ALPHA,
    [Dc]: i.SRC_ALPHA_SATURATE,
    [Pc]: i.DST_COLOR,
    [Rc]: i.DST_ALPHA,
    [wc]: i.ONE_MINUS_SRC_COLOR,
    [Is]: i.ONE_MINUS_SRC_ALPHA,
    [Lc]: i.ONE_MINUS_DST_COLOR,
    [Cc]: i.ONE_MINUS_DST_ALPHA,
    [Ic]: i.CONSTANT_COLOR,
    [Uc]: i.ONE_MINUS_CONSTANT_COLOR,
    [Nc]: i.CONSTANT_ALPHA,
    [Fc]: i.ONE_MINUS_CONSTANT_ALPHA,
  };
  function at(D, ne, ae, pe, Q, K, ve, Ue, nt, Ze) {
    if (D === wn) {
      S === !0 && (me(i.BLEND), (S = !1));
      return;
    }
    if ((S === !1 && (J(i.BLEND), (S = !0)), D !== xc)) {
      if (D !== p || Ze !== x) {
        if (((d !== Wn || y !== Wn) && (i.blendEquation(i.FUNC_ADD), (d = Wn), (y = Wn)), Ze))
          switch (D) {
            case Si:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case ro:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case so:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case ao:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error('THREE.WebGLState: Invalid blending: ', D);
              break;
          }
        else
          switch (D) {
            case Si:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case ro:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case so:
              console.error(
                'THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true',
              );
              break;
            case ao:
              console.error(
                'THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true',
              );
              break;
            default:
              console.error('THREE.WebGLState: Invalid blending: ', D);
              break;
          }
        (E = null), (b = null), (P = null), (R = null), L.set(0, 0, 0), (A = 0), (p = D), (x = Ze);
      }
      return;
    }
    (Q = Q || ne),
      (K = K || ae),
      (ve = ve || pe),
      (ne !== d || Q !== y) && (i.blendEquationSeparate(bt[ne], bt[Q]), (d = ne), (y = Q)),
      (ae !== E || pe !== b || K !== P || ve !== R) &&
        (i.blendFuncSeparate(C[ae], C[pe], C[K], C[ve]), (E = ae), (b = pe), (P = K), (R = ve)),
      (Ue.equals(L) === !1 || nt !== A) &&
        (i.blendColor(Ue.r, Ue.g, Ue.b, nt), L.copy(Ue), (A = nt)),
      (p = D),
      (x = !1);
  }
  function Ne(D, ne) {
    D.side === tn ? me(i.CULL_FACE) : J(i.CULL_FACE);
    let ae = D.side === Lt;
    ne && (ae = !ae),
      Le(ae),
      D.blending === Si && D.transparent === !1
        ? at(wn)
        : at(
            D.blending,
            D.blendEquation,
            D.blendSrc,
            D.blendDst,
            D.blendEquationAlpha,
            D.blendSrcAlpha,
            D.blendDstAlpha,
            D.blendColor,
            D.blendAlpha,
            D.premultipliedAlpha,
          ),
      a.setFunc(D.depthFunc),
      a.setTest(D.depthTest),
      a.setMask(D.depthWrite),
      s.setMask(D.colorWrite);
    const pe = D.stencilWrite;
    o.setTest(pe),
      pe &&
        (o.setMask(D.stencilWriteMask),
        o.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask),
        o.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)),
      Me(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits),
      D.alphaToCoverage === !0 ? J(i.SAMPLE_ALPHA_TO_COVERAGE) : me(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Le(D) {
    _ !== D && (D ? i.frontFace(i.CW) : i.frontFace(i.CCW), (_ = D));
  }
  function xe(D) {
    D !== _c
      ? (J(i.CULL_FACE),
        D !== w &&
          (D === io
            ? i.cullFace(i.BACK)
            : D === vc
              ? i.cullFace(i.FRONT)
              : i.cullFace(i.FRONT_AND_BACK)))
      : me(i.CULL_FACE),
      (w = D);
  }
  function ot(D) {
    D !== U && (X && i.lineWidth(D), (U = D));
  }
  function Me(D, ne, ae) {
    D
      ? (J(i.POLYGON_OFFSET_FILL),
        (z !== ne || G !== ae) && (i.polygonOffset(ne, ae), (z = ne), (G = ae)))
      : me(i.POLYGON_OFFSET_FILL);
  }
  function Be(D) {
    D ? J(i.SCISSOR_TEST) : me(i.SCISSOR_TEST);
  }
  function _t(D) {
    D === void 0 && (D = i.TEXTURE0 + V - 1), se !== D && (i.activeTexture(D), (se = D));
  }
  function ft(D, ne, ae) {
    ae === void 0 && (se === null ? (ae = i.TEXTURE0 + V - 1) : (ae = se));
    let pe = ue[ae];
    pe === void 0 && ((pe = { type: void 0, texture: void 0 }), (ue[ae] = pe)),
      (pe.type !== D || pe.texture !== ne) &&
        (se !== ae && (i.activeTexture(ae), (se = ae)),
        i.bindTexture(D, ne || $[D]),
        (pe.type = D),
        (pe.texture = ne));
  }
  function T() {
    const D = ue[se];
    D !== void 0 &&
      D.type !== void 0 &&
      (i.bindTexture(D.type, null), (D.type = void 0), (D.texture = void 0));
  }
  function v() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function O() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function q() {
    try {
      i.texSubImage2D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function j() {
    try {
      i.texSubImage3D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function W() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function Ee() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function re() {
    try {
      i.texStorage2D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function Se() {
    try {
      i.texStorage3D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function ye() {
    try {
      i.texImage2D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function te() {
    try {
      i.texImage3D(...arguments);
    } catch (D) {
      console.error('THREE.WebGLState:', D);
    }
  }
  function he(D) {
    tt.equals(D) === !1 && (i.scissor(D.x, D.y, D.z, D.w), tt.copy(D));
  }
  function Pe(D) {
    st.equals(D) === !1 && (i.viewport(D.x, D.y, D.z, D.w), st.copy(D));
  }
  function be(D, ne) {
    let ae = c.get(ne);
    ae === void 0 && ((ae = new WeakMap()), c.set(ne, ae));
    let pe = ae.get(D);
    pe === void 0 && ((pe = i.getUniformBlockIndex(ne, D.name)), ae.set(D, pe));
  }
  function le(D, ne) {
    const pe = c.get(ne).get(D);
    l.get(ne) !== pe && (i.uniformBlockBinding(ne, pe, D.__bindingPointIndex), l.set(ne, pe));
  }
  function Fe() {
    i.disable(i.BLEND),
      i.disable(i.CULL_FACE),
      i.disable(i.DEPTH_TEST),
      i.disable(i.POLYGON_OFFSET_FILL),
      i.disable(i.SCISSOR_TEST),
      i.disable(i.STENCIL_TEST),
      i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),
      i.blendEquation(i.FUNC_ADD),
      i.blendFunc(i.ONE, i.ZERO),
      i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO),
      i.blendColor(0, 0, 0, 0),
      i.colorMask(!0, !0, !0, !0),
      i.clearColor(0, 0, 0, 0),
      i.depthMask(!0),
      i.depthFunc(i.LESS),
      a.setReversed(!1),
      i.clearDepth(1),
      i.stencilMask(4294967295),
      i.stencilFunc(i.ALWAYS, 0, 4294967295),
      i.stencilOp(i.KEEP, i.KEEP, i.KEEP),
      i.clearStencil(0),
      i.cullFace(i.BACK),
      i.frontFace(i.CCW),
      i.polygonOffset(0, 0),
      i.activeTexture(i.TEXTURE0),
      i.bindFramebuffer(i.FRAMEBUFFER, null),
      i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
      i.bindFramebuffer(i.READ_FRAMEBUFFER, null),
      i.useProgram(null),
      i.lineWidth(1),
      i.scissor(0, 0, i.canvas.width, i.canvas.height),
      i.viewport(0, 0, i.canvas.width, i.canvas.height),
      (u = {}),
      (se = null),
      (ue = {}),
      (h = {}),
      (f = new WeakMap()),
      (m = []),
      (g = null),
      (S = !1),
      (p = null),
      (d = null),
      (E = null),
      (b = null),
      (y = null),
      (P = null),
      (R = null),
      (L = new ke(0, 0, 0)),
      (A = 0),
      (x = !1),
      (_ = null),
      (w = null),
      (U = null),
      (z = null),
      (G = null),
      tt.set(0, 0, i.canvas.width, i.canvas.height),
      st.set(0, 0, i.canvas.width, i.canvas.height),
      s.reset(),
      a.reset(),
      o.reset();
  }
  return {
    buffers: { color: s, depth: a, stencil: o },
    enable: J,
    disable: me,
    bindFramebuffer: Ie,
    drawBuffers: Te,
    useProgram: qe,
    setBlending: at,
    setMaterial: Ne,
    setFlipSided: Le,
    setCullFace: xe,
    setLineWidth: ot,
    setPolygonOffset: Me,
    setScissorTest: Be,
    activeTexture: _t,
    bindTexture: ft,
    unbindTexture: T,
    compressedTexImage2D: v,
    compressedTexImage3D: O,
    texImage2D: ye,
    texImage3D: te,
    updateUBOMapping: be,
    uniformBlockBinding: le,
    texStorage2D: re,
    texStorage3D: Se,
    texSubImage2D: q,
    texSubImage3D: j,
    compressedTexSubImage2D: W,
    compressedTexSubImage3D: Ee,
    scissor: he,
    viewport: Pe,
    reset: Fe,
  };
}
function Um(i, e, t, n, r, s, a) {
  const o = e.has('WEBGL_multisampled_render_to_texture')
      ? e.get('WEBGL_multisampled_render_to_texture')
      : null,
    l = typeof navigator > 'u' ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    c = new We(),
    u = new WeakMap();
  let h;
  const f = new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < 'u' && new OffscreenCanvas(1, 1).getContext('2d') !== null;
  } catch {}
  function g(T, v) {
    return m ? new OffscreenCanvas(T, v) : Vr('canvas');
  }
  function S(T, v, O) {
    let q = 1;
    const j = ft(T);
    if (((j.width > O || j.height > O) && (q = O / Math.max(j.width, j.height)), q < 1))
      if (
        (typeof HTMLImageElement < 'u' && T instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < 'u' && T instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < 'u' && T instanceof ImageBitmap) ||
        (typeof VideoFrame < 'u' && T instanceof VideoFrame)
      ) {
        const W = Math.floor(q * j.width),
          Ee = Math.floor(q * j.height);
        h === void 0 && (h = g(W, Ee));
        const re = v ? g(W, Ee) : h;
        return (
          (re.width = W),
          (re.height = Ee),
          re.getContext('2d').drawImage(T, 0, 0, W, Ee),
          console.warn(
            'THREE.WebGLRenderer: Texture has been resized from (' +
              j.width +
              'x' +
              j.height +
              ') to (' +
              W +
              'x' +
              Ee +
              ').',
          ),
          re
        );
      } else
        return (
          'data' in T &&
            console.warn(
              'THREE.WebGLRenderer: Image in DataTexture is too big (' +
                j.width +
                'x' +
                j.height +
                ').',
            ),
          T
        );
    return T;
  }
  function p(T) {
    return T.generateMipmaps;
  }
  function d(T) {
    i.generateMipmap(T);
  }
  function E(T) {
    return T.isWebGLCubeRenderTarget
      ? i.TEXTURE_CUBE_MAP
      : T.isWebGL3DRenderTarget
        ? i.TEXTURE_3D
        : T.isWebGLArrayRenderTarget || T.isCompressedArrayTexture
          ? i.TEXTURE_2D_ARRAY
          : i.TEXTURE_2D;
  }
  function b(T, v, O, q, j = !1) {
    if (T !== null) {
      if (i[T] !== void 0) return i[T];
      console.warn(
        "THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + T + "'",
      );
    }
    let W = v;
    if (
      (v === i.RED &&
        (O === i.FLOAT && (W = i.R32F),
        O === i.HALF_FLOAT && (W = i.R16F),
        O === i.UNSIGNED_BYTE && (W = i.R8)),
      v === i.RED_INTEGER &&
        (O === i.UNSIGNED_BYTE && (W = i.R8UI),
        O === i.UNSIGNED_SHORT && (W = i.R16UI),
        O === i.UNSIGNED_INT && (W = i.R32UI),
        O === i.BYTE && (W = i.R8I),
        O === i.SHORT && (W = i.R16I),
        O === i.INT && (W = i.R32I)),
      v === i.RG &&
        (O === i.FLOAT && (W = i.RG32F),
        O === i.HALF_FLOAT && (W = i.RG16F),
        O === i.UNSIGNED_BYTE && (W = i.RG8)),
      v === i.RG_INTEGER &&
        (O === i.UNSIGNED_BYTE && (W = i.RG8UI),
        O === i.UNSIGNED_SHORT && (W = i.RG16UI),
        O === i.UNSIGNED_INT && (W = i.RG32UI),
        O === i.BYTE && (W = i.RG8I),
        O === i.SHORT && (W = i.RG16I),
        O === i.INT && (W = i.RG32I)),
      v === i.RGB_INTEGER &&
        (O === i.UNSIGNED_BYTE && (W = i.RGB8UI),
        O === i.UNSIGNED_SHORT && (W = i.RGB16UI),
        O === i.UNSIGNED_INT && (W = i.RGB32UI),
        O === i.BYTE && (W = i.RGB8I),
        O === i.SHORT && (W = i.RGB16I),
        O === i.INT && (W = i.RGB32I)),
      v === i.RGBA_INTEGER &&
        (O === i.UNSIGNED_BYTE && (W = i.RGBA8UI),
        O === i.UNSIGNED_SHORT && (W = i.RGBA16UI),
        O === i.UNSIGNED_INT && (W = i.RGBA32UI),
        O === i.BYTE && (W = i.RGBA8I),
        O === i.SHORT && (W = i.RGBA16I),
        O === i.INT && (W = i.RGBA32I)),
      v === i.RGB &&
        (O === i.UNSIGNED_INT_5_9_9_9_REV && (W = i.RGB9_E5),
        O === i.UNSIGNED_INT_10F_11F_11F_REV && (W = i.R11F_G11F_B10F)),
      v === i.RGBA)
    ) {
      const Ee = j ? Hr : Ye.getTransfer(q);
      O === i.FLOAT && (W = i.RGBA32F),
        O === i.HALF_FLOAT && (W = i.RGBA16F),
        O === i.UNSIGNED_BYTE && (W = Ee === Je ? i.SRGB8_ALPHA8 : i.RGBA8),
        O === i.UNSIGNED_SHORT_4_4_4_4 && (W = i.RGBA4),
        O === i.UNSIGNED_SHORT_5_5_5_1 && (W = i.RGB5_A1);
    }
    return (
      (W === i.R16F ||
        W === i.R32F ||
        W === i.RG16F ||
        W === i.RG32F ||
        W === i.RGBA16F ||
        W === i.RGBA32F) &&
        e.get('EXT_color_buffer_float'),
      W
    );
  }
  function y(T, v) {
    let O;
    return (
      T
        ? v === null || v === Kn || v === Zi
          ? (O = i.DEPTH24_STENCIL8)
          : v === rn
            ? (O = i.DEPTH32F_STENCIL8)
            : v === Ki &&
              ((O = i.DEPTH24_STENCIL8),
              console.warn(
                'DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.',
              ))
        : v === null || v === Kn || v === Zi
          ? (O = i.DEPTH_COMPONENT24)
          : v === rn
            ? (O = i.DEPTH_COMPONENT32F)
            : v === Ki && (O = i.DEPTH_COMPONENT16),
      O
    );
  }
  function P(T, v) {
    return p(T) === !0 || (T.isFramebufferTexture && T.minFilter !== zt && T.minFilter !== nn)
      ? Math.log2(Math.max(v.width, v.height)) + 1
      : T.mipmaps !== void 0 && T.mipmaps.length > 0
        ? T.mipmaps.length
        : T.isCompressedTexture && Array.isArray(T.image)
          ? v.mipmaps.length
          : 1;
  }
  function R(T) {
    const v = T.target;
    v.removeEventListener('dispose', R), A(v), v.isVideoTexture && u.delete(v);
  }
  function L(T) {
    const v = T.target;
    v.removeEventListener('dispose', L), _(v);
  }
  function A(T) {
    const v = n.get(T);
    if (v.__webglInit === void 0) return;
    const O = T.source,
      q = f.get(O);
    if (q) {
      const j = q[v.__cacheKey];
      j.usedTimes--, j.usedTimes === 0 && x(T), Object.keys(q).length === 0 && f.delete(O);
    }
    n.remove(T);
  }
  function x(T) {
    const v = n.get(T);
    i.deleteTexture(v.__webglTexture);
    const O = T.source,
      q = f.get(O);
    delete q[v.__cacheKey], a.memory.textures--;
  }
  function _(T) {
    const v = n.get(T);
    if (
      (T.depthTexture && (T.depthTexture.dispose(), n.remove(T.depthTexture)),
      T.isWebGLCubeRenderTarget)
    )
      for (let q = 0; q < 6; q++) {
        if (Array.isArray(v.__webglFramebuffer[q]))
          for (let j = 0; j < v.__webglFramebuffer[q].length; j++)
            i.deleteFramebuffer(v.__webglFramebuffer[q][j]);
        else i.deleteFramebuffer(v.__webglFramebuffer[q]);
        v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer[q]);
      }
    else {
      if (Array.isArray(v.__webglFramebuffer))
        for (let q = 0; q < v.__webglFramebuffer.length; q++)
          i.deleteFramebuffer(v.__webglFramebuffer[q]);
      else i.deleteFramebuffer(v.__webglFramebuffer);
      if (
        (v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer),
        v.__webglMultisampledFramebuffer && i.deleteFramebuffer(v.__webglMultisampledFramebuffer),
        v.__webglColorRenderbuffer)
      )
        for (let q = 0; q < v.__webglColorRenderbuffer.length; q++)
          v.__webglColorRenderbuffer[q] && i.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);
      v.__webglDepthRenderbuffer && i.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const O = T.textures;
    for (let q = 0, j = O.length; q < j; q++) {
      const W = n.get(O[q]);
      W.__webglTexture && (i.deleteTexture(W.__webglTexture), a.memory.textures--), n.remove(O[q]);
    }
    n.remove(T);
  }
  let w = 0;
  function U() {
    w = 0;
  }
  function z() {
    const T = w;
    return (
      T >= r.maxTextures &&
        console.warn(
          'THREE.WebGLTextures: Trying to use ' +
            T +
            ' texture units while this GPU supports only ' +
            r.maxTextures,
        ),
      (w += 1),
      T
    );
  }
  function G(T) {
    const v = [];
    return (
      v.push(T.wrapS),
      v.push(T.wrapT),
      v.push(T.wrapR || 0),
      v.push(T.magFilter),
      v.push(T.minFilter),
      v.push(T.anisotropy),
      v.push(T.internalFormat),
      v.push(T.format),
      v.push(T.type),
      v.push(T.generateMipmaps),
      v.push(T.premultiplyAlpha),
      v.push(T.flipY),
      v.push(T.unpackAlignment),
      v.push(T.colorSpace),
      v.join()
    );
  }
  function V(T, v) {
    const O = n.get(T);
    if (
      (T.isVideoTexture && Be(T),
      T.isRenderTargetTexture === !1 &&
        T.isExternalTexture !== !0 &&
        T.version > 0 &&
        O.__version !== T.version)
    ) {
      const q = T.image;
      if (q === null)
        console.warn('THREE.WebGLRenderer: Texture marked for update but no image data found.');
      else if (q.complete === !1)
        console.warn('THREE.WebGLRenderer: Texture marked for update but image is incomplete');
      else {
        $(O, T, v);
        return;
      }
    } else T.isExternalTexture && (O.__webglTexture = T.sourceTexture ? T.sourceTexture : null);
    t.bindTexture(i.TEXTURE_2D, O.__webglTexture, i.TEXTURE0 + v);
  }
  function X(T, v) {
    const O = n.get(T);
    if (T.isRenderTargetTexture === !1 && T.version > 0 && O.__version !== T.version) {
      $(O, T, v);
      return;
    }
    t.bindTexture(i.TEXTURE_2D_ARRAY, O.__webglTexture, i.TEXTURE0 + v);
  }
  function Z(T, v) {
    const O = n.get(T);
    if (T.isRenderTargetTexture === !1 && T.version > 0 && O.__version !== T.version) {
      $(O, T, v);
      return;
    }
    t.bindTexture(i.TEXTURE_3D, O.__webglTexture, i.TEXTURE0 + v);
  }
  function H(T, v) {
    const O = n.get(T);
    if (T.version > 0 && O.__version !== T.version) {
      J(O, T, v);
      return;
    }
    t.bindTexture(i.TEXTURE_CUBE_MAP, O.__webglTexture, i.TEXTURE0 + v);
  }
  const se = { [Vs]: i.REPEAT, [qn]: i.CLAMP_TO_EDGE, [Ws]: i.MIRRORED_REPEAT },
    ue = {
      [zt]: i.NEAREST,
      [Xc]: i.NEAREST_MIPMAP_NEAREST,
      [dr]: i.NEAREST_MIPMAP_LINEAR,
      [nn]: i.LINEAR,
      [Jr]: i.LINEAR_MIPMAP_NEAREST,
      [$n]: i.LINEAR_MIPMAP_LINEAR,
    },
    Ae = {
      [Kc]: i.NEVER,
      [th]: i.ALWAYS,
      [Zc]: i.LESS,
      [Cl]: i.LEQUAL,
      [jc]: i.EQUAL,
      [eh]: i.GEQUAL,
      [Jc]: i.GREATER,
      [Qc]: i.NOTEQUAL,
    };
  function He(T, v) {
    if (
      (v.type === rn &&
        e.has('OES_texture_float_linear') === !1 &&
        (v.magFilter === nn ||
          v.magFilter === Jr ||
          v.magFilter === dr ||
          v.magFilter === $n ||
          v.minFilter === nn ||
          v.minFilter === Jr ||
          v.minFilter === dr ||
          v.minFilter === $n) &&
        console.warn(
          'THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.',
        ),
      i.texParameteri(T, i.TEXTURE_WRAP_S, se[v.wrapS]),
      i.texParameteri(T, i.TEXTURE_WRAP_T, se[v.wrapT]),
      (T === i.TEXTURE_3D || T === i.TEXTURE_2D_ARRAY) &&
        i.texParameteri(T, i.TEXTURE_WRAP_R, se[v.wrapR]),
      i.texParameteri(T, i.TEXTURE_MAG_FILTER, ue[v.magFilter]),
      i.texParameteri(T, i.TEXTURE_MIN_FILTER, ue[v.minFilter]),
      v.compareFunction &&
        (i.texParameteri(T, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE),
        i.texParameteri(T, i.TEXTURE_COMPARE_FUNC, Ae[v.compareFunction])),
      e.has('EXT_texture_filter_anisotropic') === !0)
    ) {
      if (
        v.magFilter === zt ||
        (v.minFilter !== dr && v.minFilter !== $n) ||
        (v.type === rn && e.has('OES_texture_float_linear') === !1)
      )
        return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const O = e.get('EXT_texture_filter_anisotropic');
        i.texParameterf(
          T,
          O.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(v.anisotropy, r.getMaxAnisotropy()),
        ),
          (n.get(v).__currentAnisotropy = v.anisotropy);
      }
    }
  }
  function tt(T, v) {
    let O = !1;
    T.__webglInit === void 0 && ((T.__webglInit = !0), v.addEventListener('dispose', R));
    const q = v.source;
    let j = f.get(q);
    j === void 0 && ((j = {}), f.set(q, j));
    const W = G(v);
    if (W !== T.__cacheKey) {
      j[W] === void 0 &&
        ((j[W] = { texture: i.createTexture(), usedTimes: 0 }), a.memory.textures++, (O = !0)),
        j[W].usedTimes++;
      const Ee = j[T.__cacheKey];
      Ee !== void 0 && (j[T.__cacheKey].usedTimes--, Ee.usedTimes === 0 && x(v)),
        (T.__cacheKey = W),
        (T.__webglTexture = j[W].texture);
    }
    return O;
  }
  function st(T, v, O) {
    return Math.floor(Math.floor(T / O) / v);
  }
  function Ke(T, v, O, q) {
    const W = T.updateRanges;
    if (W.length === 0) t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, v.width, v.height, O, q, v.data);
    else {
      W.sort((te, he) => te.start - he.start);
      let Ee = 0;
      for (let te = 1; te < W.length; te++) {
        const he = W[Ee],
          Pe = W[te],
          be = he.start + he.count,
          le = st(Pe.start, v.width, 4),
          Fe = st(he.start, v.width, 4);
        Pe.start <= be + 1 && le === Fe && st(Pe.start + Pe.count - 1, v.width, 4) === le
          ? (he.count = Math.max(he.count, Pe.start + Pe.count - he.start))
          : (++Ee, (W[Ee] = Pe));
      }
      W.length = Ee + 1;
      const re = i.getParameter(i.UNPACK_ROW_LENGTH),
        Se = i.getParameter(i.UNPACK_SKIP_PIXELS),
        ye = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, v.width);
      for (let te = 0, he = W.length; te < he; te++) {
        const Pe = W[te],
          be = Math.floor(Pe.start / 4),
          le = Math.ceil(Pe.count / 4),
          Fe = be % v.width,
          D = Math.floor(be / v.width),
          ne = le,
          ae = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Fe),
          i.pixelStorei(i.UNPACK_SKIP_ROWS, D),
          t.texSubImage2D(i.TEXTURE_2D, 0, Fe, D, ne, ae, O, q, v.data);
      }
      T.clearUpdateRanges(),
        i.pixelStorei(i.UNPACK_ROW_LENGTH, re),
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Se),
        i.pixelStorei(i.UNPACK_SKIP_ROWS, ye);
    }
  }
  function $(T, v, O) {
    let q = i.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (q = i.TEXTURE_2D_ARRAY),
      v.isData3DTexture && (q = i.TEXTURE_3D);
    const j = tt(T, v),
      W = v.source;
    t.bindTexture(q, T.__webglTexture, i.TEXTURE0 + O);
    const Ee = n.get(W);
    if (W.version !== Ee.__version || j === !0) {
      t.activeTexture(i.TEXTURE0 + O);
      const re = Ye.getPrimaries(Ye.workingColorSpace),
        Se = v.colorSpace === An ? null : Ye.getPrimaries(v.colorSpace),
        ye = v.colorSpace === An || re === Se ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, ye);
      let te = S(v.image, !1, r.maxTextureSize);
      te = _t(v, te);
      const he = s.convert(v.format, v.colorSpace),
        Pe = s.convert(v.type);
      let be = b(v.internalFormat, he, Pe, v.colorSpace, v.isVideoTexture);
      He(q, v);
      let le;
      const Fe = v.mipmaps,
        D = v.isVideoTexture !== !0,
        ne = Ee.__version === void 0 || j === !0,
        ae = W.dataReady,
        pe = P(v, te);
      if (v.isDepthTexture)
        (be = y(v.format === Ji, v.type)),
          ne &&
            (D
              ? t.texStorage2D(i.TEXTURE_2D, 1, be, te.width, te.height)
              : t.texImage2D(i.TEXTURE_2D, 0, be, te.width, te.height, 0, he, Pe, null));
      else if (v.isDataTexture)
        if (Fe.length > 0) {
          D && ne && t.texStorage2D(i.TEXTURE_2D, pe, be, Fe[0].width, Fe[0].height);
          for (let Q = 0, K = Fe.length; Q < K; Q++)
            (le = Fe[Q]),
              D
                ? ae && t.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, le.width, le.height, he, Pe, le.data)
                : t.texImage2D(i.TEXTURE_2D, Q, be, le.width, le.height, 0, he, Pe, le.data);
          v.generateMipmaps = !1;
        } else
          D
            ? (ne && t.texStorage2D(i.TEXTURE_2D, pe, be, te.width, te.height),
              ae && Ke(v, te, he, Pe))
            : t.texImage2D(i.TEXTURE_2D, 0, be, te.width, te.height, 0, he, Pe, te.data);
      else if (v.isCompressedTexture)
        if (v.isCompressedArrayTexture) {
          D &&
            ne &&
            t.texStorage3D(i.TEXTURE_2D_ARRAY, pe, be, Fe[0].width, Fe[0].height, te.depth);
          for (let Q = 0, K = Fe.length; Q < K; Q++)
            if (((le = Fe[Q]), v.format !== jt))
              if (he !== null)
                if (D) {
                  if (ae)
                    if (v.layerUpdates.size > 0) {
                      const ve = Fo(le.width, le.height, v.format, v.type);
                      for (const Ue of v.layerUpdates) {
                        const nt = le.data.subarray(
                          (Ue * ve) / le.data.BYTES_PER_ELEMENT,
                          ((Ue + 1) * ve) / le.data.BYTES_PER_ELEMENT,
                        );
                        t.compressedTexSubImage3D(
                          i.TEXTURE_2D_ARRAY,
                          Q,
                          0,
                          0,
                          Ue,
                          le.width,
                          le.height,
                          1,
                          he,
                          nt,
                        );
                      }
                      v.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(
                        i.TEXTURE_2D_ARRAY,
                        Q,
                        0,
                        0,
                        0,
                        le.width,
                        le.height,
                        te.depth,
                        he,
                        le.data,
                      );
                } else
                  t.compressedTexImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    be,
                    le.width,
                    le.height,
                    te.depth,
                    0,
                    le.data,
                    0,
                    0,
                  );
              else
                console.warn(
                  'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()',
                );
            else
              D
                ? ae &&
                  t.texSubImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    0,
                    0,
                    0,
                    le.width,
                    le.height,
                    te.depth,
                    he,
                    Pe,
                    le.data,
                  )
                : t.texImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    be,
                    le.width,
                    le.height,
                    te.depth,
                    0,
                    he,
                    Pe,
                    le.data,
                  );
        } else {
          D && ne && t.texStorage2D(i.TEXTURE_2D, pe, be, Fe[0].width, Fe[0].height);
          for (let Q = 0, K = Fe.length; Q < K; Q++)
            (le = Fe[Q]),
              v.format !== jt
                ? he !== null
                  ? D
                    ? ae &&
                      t.compressedTexSubImage2D(
                        i.TEXTURE_2D,
                        Q,
                        0,
                        0,
                        le.width,
                        le.height,
                        he,
                        le.data,
                      )
                    : t.compressedTexImage2D(i.TEXTURE_2D, Q, be, le.width, le.height, 0, le.data)
                  : console.warn(
                      'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()',
                    )
                : D
                  ? ae &&
                    t.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, le.width, le.height, he, Pe, le.data)
                  : t.texImage2D(i.TEXTURE_2D, Q, be, le.width, le.height, 0, he, Pe, le.data);
        }
      else if (v.isDataArrayTexture)
        if (D) {
          if ((ne && t.texStorage3D(i.TEXTURE_2D_ARRAY, pe, be, te.width, te.height, te.depth), ae))
            if (v.layerUpdates.size > 0) {
              const Q = Fo(te.width, te.height, v.format, v.type);
              for (const K of v.layerUpdates) {
                const ve = te.data.subarray(
                  (K * Q) / te.data.BYTES_PER_ELEMENT,
                  ((K + 1) * Q) / te.data.BYTES_PER_ELEMENT,
                );
                t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, K, te.width, te.height, 1, he, Pe, ve);
              }
              v.clearLayerUpdates();
            } else
              t.texSubImage3D(
                i.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                0,
                te.width,
                te.height,
                te.depth,
                he,
                Pe,
                te.data,
              );
        } else
          t.texImage3D(
            i.TEXTURE_2D_ARRAY,
            0,
            be,
            te.width,
            te.height,
            te.depth,
            0,
            he,
            Pe,
            te.data,
          );
      else if (v.isData3DTexture)
        D
          ? (ne && t.texStorage3D(i.TEXTURE_3D, pe, be, te.width, te.height, te.depth),
            ae &&
              t.texSubImage3D(
                i.TEXTURE_3D,
                0,
                0,
                0,
                0,
                te.width,
                te.height,
                te.depth,
                he,
                Pe,
                te.data,
              ))
          : t.texImage3D(i.TEXTURE_3D, 0, be, te.width, te.height, te.depth, 0, he, Pe, te.data);
      else if (v.isFramebufferTexture) {
        if (ne)
          if (D) t.texStorage2D(i.TEXTURE_2D, pe, be, te.width, te.height);
          else {
            let Q = te.width,
              K = te.height;
            for (let ve = 0; ve < pe; ve++)
              t.texImage2D(i.TEXTURE_2D, ve, be, Q, K, 0, he, Pe, null), (Q >>= 1), (K >>= 1);
          }
      } else if (Fe.length > 0) {
        if (D && ne) {
          const Q = ft(Fe[0]);
          t.texStorage2D(i.TEXTURE_2D, pe, be, Q.width, Q.height);
        }
        for (let Q = 0, K = Fe.length; Q < K; Q++)
          (le = Fe[Q]),
            D
              ? ae && t.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, he, Pe, le)
              : t.texImage2D(i.TEXTURE_2D, Q, be, he, Pe, le);
        v.generateMipmaps = !1;
      } else if (D) {
        if (ne) {
          const Q = ft(te);
          t.texStorage2D(i.TEXTURE_2D, pe, be, Q.width, Q.height);
        }
        ae && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, he, Pe, te);
      } else t.texImage2D(i.TEXTURE_2D, 0, be, he, Pe, te);
      p(v) && d(q), (Ee.__version = W.version), v.onUpdate && v.onUpdate(v);
    }
    T.__version = v.version;
  }
  function J(T, v, O) {
    if (v.image.length !== 6) return;
    const q = tt(T, v),
      j = v.source;
    t.bindTexture(i.TEXTURE_CUBE_MAP, T.__webglTexture, i.TEXTURE0 + O);
    const W = n.get(j);
    if (j.version !== W.__version || q === !0) {
      t.activeTexture(i.TEXTURE0 + O);
      const Ee = Ye.getPrimaries(Ye.workingColorSpace),
        re = v.colorSpace === An ? null : Ye.getPrimaries(v.colorSpace),
        Se = v.colorSpace === An || Ee === re ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Se);
      const ye = v.isCompressedTexture || v.image[0].isCompressedTexture,
        te = v.image[0] && v.image[0].isDataTexture,
        he = [];
      for (let K = 0; K < 6; K++)
        !ye && !te
          ? (he[K] = S(v.image[K], !0, r.maxCubemapSize))
          : (he[K] = te ? v.image[K].image : v.image[K]),
          (he[K] = _t(v, he[K]));
      const Pe = he[0],
        be = s.convert(v.format, v.colorSpace),
        le = s.convert(v.type),
        Fe = b(v.internalFormat, be, le, v.colorSpace),
        D = v.isVideoTexture !== !0,
        ne = W.__version === void 0 || q === !0,
        ae = j.dataReady;
      let pe = P(v, Pe);
      He(i.TEXTURE_CUBE_MAP, v);
      let Q;
      if (ye) {
        D && ne && t.texStorage2D(i.TEXTURE_CUBE_MAP, pe, Fe, Pe.width, Pe.height);
        for (let K = 0; K < 6; K++) {
          Q = he[K].mipmaps;
          for (let ve = 0; ve < Q.length; ve++) {
            const Ue = Q[ve];
            v.format !== jt
              ? be !== null
                ? D
                  ? ae &&
                    t.compressedTexSubImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                      ve,
                      0,
                      0,
                      Ue.width,
                      Ue.height,
                      be,
                      Ue.data,
                    )
                  : t.compressedTexImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                      ve,
                      Fe,
                      Ue.width,
                      Ue.height,
                      0,
                      Ue.data,
                    )
                : console.warn(
                    'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()',
                  )
              : D
                ? ae &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                    ve,
                    0,
                    0,
                    Ue.width,
                    Ue.height,
                    be,
                    le,
                    Ue.data,
                  )
                : t.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                    ve,
                    Fe,
                    Ue.width,
                    Ue.height,
                    0,
                    be,
                    le,
                    Ue.data,
                  );
          }
        }
      } else {
        if (((Q = v.mipmaps), D && ne)) {
          Q.length > 0 && pe++;
          const K = ft(he[0]);
          t.texStorage2D(i.TEXTURE_CUBE_MAP, pe, Fe, K.width, K.height);
        }
        for (let K = 0; K < 6; K++)
          if (te) {
            D
              ? ae &&
                t.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                  0,
                  0,
                  0,
                  he[K].width,
                  he[K].height,
                  be,
                  le,
                  he[K].data,
                )
              : t.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                  0,
                  Fe,
                  he[K].width,
                  he[K].height,
                  0,
                  be,
                  le,
                  he[K].data,
                );
            for (let ve = 0; ve < Q.length; ve++) {
              const nt = Q[ve].image[K].image;
              D
                ? ae &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                    ve + 1,
                    0,
                    0,
                    nt.width,
                    nt.height,
                    be,
                    le,
                    nt.data,
                  )
                : t.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                    ve + 1,
                    Fe,
                    nt.width,
                    nt.height,
                    0,
                    be,
                    le,
                    nt.data,
                  );
            }
          } else {
            D
              ? ae && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, 0, 0, be, le, he[K])
              : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, Fe, be, le, he[K]);
            for (let ve = 0; ve < Q.length; ve++) {
              const Ue = Q[ve];
              D
                ? ae &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + K,
                    ve + 1,
                    0,
                    0,
                    be,
                    le,
                    Ue.image[K],
                  )
                : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ve + 1, Fe, be, le, Ue.image[K]);
            }
          }
      }
      p(v) && d(i.TEXTURE_CUBE_MAP), (W.__version = j.version), v.onUpdate && v.onUpdate(v);
    }
    T.__version = v.version;
  }
  function me(T, v, O, q, j, W) {
    const Ee = s.convert(O.format, O.colorSpace),
      re = s.convert(O.type),
      Se = b(O.internalFormat, Ee, re, O.colorSpace),
      ye = n.get(v),
      te = n.get(O);
    if (((te.__renderTarget = v), !ye.__hasExternalTextures)) {
      const he = Math.max(1, v.width >> W),
        Pe = Math.max(1, v.height >> W);
      j === i.TEXTURE_3D || j === i.TEXTURE_2D_ARRAY
        ? t.texImage3D(j, W, Se, he, Pe, v.depth, 0, Ee, re, null)
        : t.texImage2D(j, W, Se, he, Pe, 0, Ee, re, null);
    }
    t.bindFramebuffer(i.FRAMEBUFFER, T),
      Me(v)
        ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, q, j, te.__webglTexture, 0, ot(v))
        : (j === i.TEXTURE_2D ||
            (j >= i.TEXTURE_CUBE_MAP_POSITIVE_X && j <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z)) &&
          i.framebufferTexture2D(i.FRAMEBUFFER, q, j, te.__webglTexture, W),
      t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Ie(T, v, O) {
    if ((i.bindRenderbuffer(i.RENDERBUFFER, T), v.depthBuffer)) {
      const q = v.depthTexture,
        j = q && q.isDepthTexture ? q.type : null,
        W = y(v.stencilBuffer, j),
        Ee = v.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
        re = ot(v);
      Me(v)
        ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, re, W, v.width, v.height)
        : O
          ? i.renderbufferStorageMultisample(i.RENDERBUFFER, re, W, v.width, v.height)
          : i.renderbufferStorage(i.RENDERBUFFER, W, v.width, v.height),
        i.framebufferRenderbuffer(i.FRAMEBUFFER, Ee, i.RENDERBUFFER, T);
    } else {
      const q = v.textures;
      for (let j = 0; j < q.length; j++) {
        const W = q[j],
          Ee = s.convert(W.format, W.colorSpace),
          re = s.convert(W.type),
          Se = b(W.internalFormat, Ee, re, W.colorSpace),
          ye = ot(v);
        O && Me(v) === !1
          ? i.renderbufferStorageMultisample(i.RENDERBUFFER, ye, Se, v.width, v.height)
          : Me(v)
            ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, ye, Se, v.width, v.height)
            : i.renderbufferStorage(i.RENDERBUFFER, Se, v.width, v.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function Te(T, v) {
    if (v && v.isWebGLCubeRenderTarget)
      throw new Error('Depth Texture with cube render targets is not supported');
    if ((t.bindFramebuffer(i.FRAMEBUFFER, T), !(v.depthTexture && v.depthTexture.isDepthTexture)))
      throw new Error('renderTarget.depthTexture must be an instance of THREE.DepthTexture');
    const q = n.get(v.depthTexture);
    (q.__renderTarget = v),
      (!q.__webglTexture ||
        v.depthTexture.image.width !== v.width ||
        v.depthTexture.image.height !== v.height) &&
        ((v.depthTexture.image.width = v.width),
        (v.depthTexture.image.height = v.height),
        (v.depthTexture.needsUpdate = !0)),
      V(v.depthTexture, 0);
    const j = q.__webglTexture,
      W = ot(v);
    if (v.depthTexture.format === ji)
      Me(v)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            j,
            0,
            W,
          )
        : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, j, 0);
    else if (v.depthTexture.format === Ji)
      Me(v)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            j,
            0,
            W,
          )
        : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, j, 0);
    else throw new Error('Unknown depthTexture format');
  }
  function qe(T) {
    const v = n.get(T),
      O = T.isWebGLCubeRenderTarget === !0;
    if (v.__boundDepthTexture !== T.depthTexture) {
      const q = T.depthTexture;
      if ((v.__depthDisposeCallback && v.__depthDisposeCallback(), q)) {
        const j = () => {
          delete v.__boundDepthTexture,
            delete v.__depthDisposeCallback,
            q.removeEventListener('dispose', j);
        };
        q.addEventListener('dispose', j), (v.__depthDisposeCallback = j);
      }
      v.__boundDepthTexture = q;
    }
    if (T.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (O) throw new Error('target.depthTexture not supported in Cube render targets');
      const q = T.texture.mipmaps;
      q && q.length > 0 ? Te(v.__webglFramebuffer[0], T) : Te(v.__webglFramebuffer, T);
    } else if (O) {
      v.__webglDepthbuffer = [];
      for (let q = 0; q < 6; q++)
        if (
          (t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[q]),
          v.__webglDepthbuffer[q] === void 0)
        )
          (v.__webglDepthbuffer[q] = i.createRenderbuffer()), Ie(v.__webglDepthbuffer[q], T, !1);
        else {
          const j = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
            W = v.__webglDepthbuffer[q];
          i.bindRenderbuffer(i.RENDERBUFFER, W),
            i.framebufferRenderbuffer(i.FRAMEBUFFER, j, i.RENDERBUFFER, W);
        }
    } else {
      const q = T.texture.mipmaps;
      if (
        (q && q.length > 0
          ? t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[0])
          : t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer),
        v.__webglDepthbuffer === void 0)
      )
        (v.__webglDepthbuffer = i.createRenderbuffer()), Ie(v.__webglDepthbuffer, T, !1);
      else {
        const j = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
          W = v.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, W),
          i.framebufferRenderbuffer(i.FRAMEBUFFER, j, i.RENDERBUFFER, W);
      }
    }
    t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function bt(T, v, O) {
    const q = n.get(T);
    v !== void 0 && me(q.__webglFramebuffer, T, T.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0),
      O !== void 0 && qe(T);
  }
  function C(T) {
    const v = T.texture,
      O = n.get(T),
      q = n.get(v);
    T.addEventListener('dispose', L);
    const j = T.textures,
      W = T.isWebGLCubeRenderTarget === !0,
      Ee = j.length > 1;
    if (
      (Ee ||
        (q.__webglTexture === void 0 && (q.__webglTexture = i.createTexture()),
        (q.__version = v.version),
        a.memory.textures++),
      W)
    ) {
      O.__webglFramebuffer = [];
      for (let re = 0; re < 6; re++)
        if (v.mipmaps && v.mipmaps.length > 0) {
          O.__webglFramebuffer[re] = [];
          for (let Se = 0; Se < v.mipmaps.length; Se++)
            O.__webglFramebuffer[re][Se] = i.createFramebuffer();
        } else O.__webglFramebuffer[re] = i.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        O.__webglFramebuffer = [];
        for (let re = 0; re < v.mipmaps.length; re++)
          O.__webglFramebuffer[re] = i.createFramebuffer();
      } else O.__webglFramebuffer = i.createFramebuffer();
      if (Ee)
        for (let re = 0, Se = j.length; re < Se; re++) {
          const ye = n.get(j[re]);
          ye.__webglTexture === void 0 &&
            ((ye.__webglTexture = i.createTexture()), a.memory.textures++);
        }
      if (T.samples > 0 && Me(T) === !1) {
        (O.__webglMultisampledFramebuffer = i.createFramebuffer()),
          (O.__webglColorRenderbuffer = []),
          t.bindFramebuffer(i.FRAMEBUFFER, O.__webglMultisampledFramebuffer);
        for (let re = 0; re < j.length; re++) {
          const Se = j[re];
          (O.__webglColorRenderbuffer[re] = i.createRenderbuffer()),
            i.bindRenderbuffer(i.RENDERBUFFER, O.__webglColorRenderbuffer[re]);
          const ye = s.convert(Se.format, Se.colorSpace),
            te = s.convert(Se.type),
            he = b(Se.internalFormat, ye, te, Se.colorSpace, T.isXRRenderTarget === !0),
            Pe = ot(T);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, Pe, he, T.width, T.height),
            i.framebufferRenderbuffer(
              i.FRAMEBUFFER,
              i.COLOR_ATTACHMENT0 + re,
              i.RENDERBUFFER,
              O.__webglColorRenderbuffer[re],
            );
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null),
          T.depthBuffer &&
            ((O.__webglDepthRenderbuffer = i.createRenderbuffer()),
            Ie(O.__webglDepthRenderbuffer, T, !0)),
          t.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (W) {
      t.bindTexture(i.TEXTURE_CUBE_MAP, q.__webglTexture), He(i.TEXTURE_CUBE_MAP, v);
      for (let re = 0; re < 6; re++)
        if (v.mipmaps && v.mipmaps.length > 0)
          for (let Se = 0; Se < v.mipmaps.length; Se++)
            me(
              O.__webglFramebuffer[re][Se],
              T,
              v,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_CUBE_MAP_POSITIVE_X + re,
              Se,
            );
        else
          me(
            O.__webglFramebuffer[re],
            T,
            v,
            i.COLOR_ATTACHMENT0,
            i.TEXTURE_CUBE_MAP_POSITIVE_X + re,
            0,
          );
      p(v) && d(i.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (Ee) {
      for (let re = 0, Se = j.length; re < Se; re++) {
        const ye = j[re],
          te = n.get(ye);
        let he = i.TEXTURE_2D;
        (T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) &&
          (he = T.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
          t.bindTexture(he, te.__webglTexture),
          He(he, ye),
          me(O.__webglFramebuffer, T, ye, i.COLOR_ATTACHMENT0 + re, he, 0),
          p(ye) && d(he);
      }
      t.unbindTexture();
    } else {
      let re = i.TEXTURE_2D;
      if (
        ((T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) &&
          (re = T.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
        t.bindTexture(re, q.__webglTexture),
        He(re, v),
        v.mipmaps && v.mipmaps.length > 0)
      )
        for (let Se = 0; Se < v.mipmaps.length; Se++)
          me(O.__webglFramebuffer[Se], T, v, i.COLOR_ATTACHMENT0, re, Se);
      else me(O.__webglFramebuffer, T, v, i.COLOR_ATTACHMENT0, re, 0);
      p(v) && d(re), t.unbindTexture();
    }
    T.depthBuffer && qe(T);
  }
  function at(T) {
    const v = T.textures;
    for (let O = 0, q = v.length; O < q; O++) {
      const j = v[O];
      if (p(j)) {
        const W = E(T),
          Ee = n.get(j).__webglTexture;
        t.bindTexture(W, Ee), d(W), t.unbindTexture();
      }
    }
  }
  const Ne = [],
    Le = [];
  function xe(T) {
    if (T.samples > 0) {
      if (Me(T) === !1) {
        const v = T.textures,
          O = T.width,
          q = T.height;
        let j = i.COLOR_BUFFER_BIT;
        const W = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
          Ee = n.get(T),
          re = v.length > 1;
        if (re)
          for (let ye = 0; ye < v.length; ye++)
            t.bindFramebuffer(i.FRAMEBUFFER, Ee.__webglMultisampledFramebuffer),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + ye,
                i.RENDERBUFFER,
                null,
              ),
              t.bindFramebuffer(i.FRAMEBUFFER, Ee.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + ye,
                i.TEXTURE_2D,
                null,
                0,
              );
        t.bindFramebuffer(i.READ_FRAMEBUFFER, Ee.__webglMultisampledFramebuffer);
        const Se = T.texture.mipmaps;
        Se && Se.length > 0
          ? t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Ee.__webglFramebuffer[0])
          : t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Ee.__webglFramebuffer);
        for (let ye = 0; ye < v.length; ye++) {
          if (
            (T.resolveDepthBuffer &&
              (T.depthBuffer && (j |= i.DEPTH_BUFFER_BIT),
              T.stencilBuffer && T.resolveStencilBuffer && (j |= i.STENCIL_BUFFER_BIT)),
            re)
          ) {
            i.framebufferRenderbuffer(
              i.READ_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.RENDERBUFFER,
              Ee.__webglColorRenderbuffer[ye],
            );
            const te = n.get(v[ye]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, te, 0);
          }
          i.blitFramebuffer(0, 0, O, q, 0, 0, O, q, j, i.NEAREST),
            l === !0 &&
              ((Ne.length = 0),
              (Le.length = 0),
              Ne.push(i.COLOR_ATTACHMENT0 + ye),
              T.depthBuffer &&
                T.resolveDepthBuffer === !1 &&
                (Ne.push(W), Le.push(W), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Le)),
              i.invalidateFramebuffer(i.READ_FRAMEBUFFER, Ne));
        }
        if (
          (t.bindFramebuffer(i.READ_FRAMEBUFFER, null),
          t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
          re)
        )
          for (let ye = 0; ye < v.length; ye++) {
            t.bindFramebuffer(i.FRAMEBUFFER, Ee.__webglMultisampledFramebuffer),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + ye,
                i.RENDERBUFFER,
                Ee.__webglColorRenderbuffer[ye],
              );
            const te = n.get(v[ye]).__webglTexture;
            t.bindFramebuffer(i.FRAMEBUFFER, Ee.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + ye,
                i.TEXTURE_2D,
                te,
                0,
              );
          }
        t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Ee.__webglMultisampledFramebuffer);
      } else if (T.depthBuffer && T.resolveDepthBuffer === !1 && l) {
        const v = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function ot(T) {
    return Math.min(r.maxSamples, T.samples);
  }
  function Me(T) {
    const v = n.get(T);
    return (
      T.samples > 0 &&
      e.has('WEBGL_multisampled_render_to_texture') === !0 &&
      v.__useRenderToTexture !== !1
    );
  }
  function Be(T) {
    const v = a.render.frame;
    u.get(T) !== v && (u.set(T, v), T.update());
  }
  function _t(T, v) {
    const O = T.colorSpace,
      q = T.format,
      j = T.type;
    return (
      T.isCompressedTexture === !0 ||
        T.isVideoTexture === !0 ||
        (O !== Ci &&
          O !== An &&
          (Ye.getTransfer(O) === Je
            ? (q !== jt || j !== an) &&
              console.warn(
                'THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.',
              )
            : console.error('THREE.WebGLTextures: Unsupported texture color space:', O))),
      v
    );
  }
  function ft(T) {
    return (
      typeof HTMLImageElement < 'u' && T instanceof HTMLImageElement
        ? ((c.width = T.naturalWidth || T.width), (c.height = T.naturalHeight || T.height))
        : typeof VideoFrame < 'u' && T instanceof VideoFrame
          ? ((c.width = T.displayWidth), (c.height = T.displayHeight))
          : ((c.width = T.width), (c.height = T.height)),
      c
    );
  }
  (this.allocateTextureUnit = z),
    (this.resetTextureUnits = U),
    (this.setTexture2D = V),
    (this.setTexture2DArray = X),
    (this.setTexture3D = Z),
    (this.setTextureCube = H),
    (this.rebindTextures = bt),
    (this.setupRenderTarget = C),
    (this.updateRenderTargetMipmap = at),
    (this.updateMultisampleRenderTarget = xe),
    (this.setupDepthRenderbuffer = qe),
    (this.setupFrameBufferTexture = me),
    (this.useMultisampledRTT = Me);
}
function Nm(i, e) {
  function t(n, r = An) {
    let s;
    const a = Ye.getTransfer(r);
    if (n === an) return i.UNSIGNED_BYTE;
    if (n === Aa) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === wa) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === bl) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === El) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === Sl) return i.BYTE;
    if (n === yl) return i.SHORT;
    if (n === Ki) return i.UNSIGNED_SHORT;
    if (n === Ta) return i.INT;
    if (n === Kn) return i.UNSIGNED_INT;
    if (n === rn) return i.FLOAT;
    if (n === ir) return i.HALF_FLOAT;
    if (n === Tl) return i.ALPHA;
    if (n === Al) return i.RGB;
    if (n === jt) return i.RGBA;
    if (n === ji) return i.DEPTH_COMPONENT;
    if (n === Ji) return i.DEPTH_STENCIL;
    if (n === Ra) return i.RED;
    if (n === Ca) return i.RED_INTEGER;
    if (n === wl) return i.RG;
    if (n === Pa) return i.RG_INTEGER;
    if (n === La) return i.RGBA_INTEGER;
    if (n === Nr || n === Fr || n === Or || n === Br)
      if (a === Je)
        if (((s = e.get('WEBGL_compressed_texture_s3tc_srgb')), s !== null)) {
          if (n === Nr) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Fr) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Or) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Br) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else return null;
      else if (((s = e.get('WEBGL_compressed_texture_s3tc')), s !== null)) {
        if (n === Nr) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Fr) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Or) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Br) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
    if (n === Xs || n === qs || n === $s || n === Ys)
      if (((s = e.get('WEBGL_compressed_texture_pvrtc')), s !== null)) {
        if (n === Xs) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === qs) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === $s) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Ys) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (n === Ks || n === Zs || n === js)
      if (((s = e.get('WEBGL_compressed_texture_etc')), s !== null)) {
        if (n === Ks || n === Zs)
          return a === Je ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === js)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (
      n === Js ||
      n === Qs ||
      n === ea ||
      n === ta ||
      n === na ||
      n === ia ||
      n === ra ||
      n === sa ||
      n === aa ||
      n === oa ||
      n === la ||
      n === ca ||
      n === ha ||
      n === ua
    )
      if (((s = e.get('WEBGL_compressed_texture_astc')), s !== null)) {
        if (n === Js)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Qs)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === ea)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === ta)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === na)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === ia)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === ra)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === sa)
          return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === aa)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR
            : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === oa)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR
            : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === la)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR
            : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === ca)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR
            : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === ha)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR
            : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === ua)
          return a === Je
            ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR
            : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (n === da || n === fa || n === pa)
      if (((s = e.get('EXT_texture_compression_bptc')), s !== null)) {
        if (n === da)
          return a === Je
            ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT
            : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === fa) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === pa) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (n === ma || n === ga || n === _a || n === va)
      if (((s = e.get('EXT_texture_compression_rgtc')), s !== null)) {
        if (n === ma) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === ga) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === _a) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === va) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return n === Zi ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: t };
}
const Fm = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
  Om = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Bm {
  constructor() {
    (this.texture = null), (this.mesh = null), (this.depthNear = 0), (this.depthFar = 0);
  }
  init(e, t) {
    if (this.texture === null) {
      const n = new Hl(e.texture);
      (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) &&
        ((this.depthNear = e.depthNear), (this.depthFar = e.depthFar)),
        (this.texture = n);
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport,
        n = new gn({
          vertexShader: Fm,
          fragmentShader: Om,
          uniforms: {
            depthColor: { value: this.texture },
            depthWidth: { value: t.z },
            depthHeight: { value: t.w },
          },
        });
      this.mesh = new St(new Li(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    (this.texture = null), (this.mesh = null);
  }
  getDepthTexture() {
    return this.texture;
  }
}
class zm extends Ii {
  constructor(e, t) {
    super();
    const n = this;
    let r = null,
      s = 1,
      a = null,
      o = 'local-floor',
      l = 1,
      c = null,
      u = null,
      h = null,
      f = null,
      m = null,
      g = null;
    const S = typeof XRWebGLBinding < 'u',
      p = new Bm(),
      d = {},
      E = t.getContextAttributes();
    let b = null,
      y = null;
    const P = [],
      R = [],
      L = new We();
    let A = null;
    const x = new Wt();
    x.viewport = new dt();
    const _ = new Wt();
    _.viewport = new dt();
    const w = [x, _],
      U = new iu();
    let z = null,
      G = null;
    (this.cameraAutoUpdate = !0),
      (this.enabled = !1),
      (this.isPresenting = !1),
      (this.getController = function ($) {
        let J = P[$];
        return J === void 0 && ((J = new xs()), (P[$] = J)), J.getTargetRaySpace();
      }),
      (this.getControllerGrip = function ($) {
        let J = P[$];
        return J === void 0 && ((J = new xs()), (P[$] = J)), J.getGripSpace();
      }),
      (this.getHand = function ($) {
        let J = P[$];
        return J === void 0 && ((J = new xs()), (P[$] = J)), J.getHandSpace();
      });
    function V($) {
      const J = R.indexOf($.inputSource);
      if (J === -1) return;
      const me = P[J];
      me !== void 0 &&
        (me.update($.inputSource, $.frame, c || a),
        me.dispatchEvent({ type: $.type, data: $.inputSource }));
    }
    function X() {
      r.removeEventListener('select', V),
        r.removeEventListener('selectstart', V),
        r.removeEventListener('selectend', V),
        r.removeEventListener('squeeze', V),
        r.removeEventListener('squeezestart', V),
        r.removeEventListener('squeezeend', V),
        r.removeEventListener('end', X),
        r.removeEventListener('inputsourceschange', Z);
      for (let $ = 0; $ < P.length; $++) {
        const J = R[$];
        J !== null && ((R[$] = null), P[$].disconnect(J));
      }
      (z = null), (G = null), p.reset();
      for (const $ in d) delete d[$];
      e.setRenderTarget(b),
        (m = null),
        (f = null),
        (h = null),
        (r = null),
        (y = null),
        Ke.stop(),
        (n.isPresenting = !1),
        e.setPixelRatio(A),
        e.setSize(L.width, L.height, !1),
        n.dispatchEvent({ type: 'sessionend' });
    }
    (this.setFramebufferScaleFactor = function ($) {
      (s = $),
        n.isPresenting === !0 &&
          console.warn('THREE.WebXRManager: Cannot change framebuffer scale while presenting.');
    }),
      (this.setReferenceSpaceType = function ($) {
        (o = $),
          n.isPresenting === !0 &&
            console.warn(
              'THREE.WebXRManager: Cannot change reference space type while presenting.',
            );
      }),
      (this.getReferenceSpace = function () {
        return c || a;
      }),
      (this.setReferenceSpace = function ($) {
        c = $;
      }),
      (this.getBaseLayer = function () {
        return f !== null ? f : m;
      }),
      (this.getBinding = function () {
        return h === null && S && (h = new XRWebGLBinding(r, t)), h;
      }),
      (this.getFrame = function () {
        return g;
      }),
      (this.getSession = function () {
        return r;
      }),
      (this.setSession = async function ($) {
        if (((r = $), r !== null)) {
          if (
            ((b = e.getRenderTarget()),
            r.addEventListener('select', V),
            r.addEventListener('selectstart', V),
            r.addEventListener('selectend', V),
            r.addEventListener('squeeze', V),
            r.addEventListener('squeezestart', V),
            r.addEventListener('squeezeend', V),
            r.addEventListener('end', X),
            r.addEventListener('inputsourceschange', Z),
            E.xrCompatible !== !0 && (await t.makeXRCompatible()),
            (A = e.getPixelRatio()),
            e.getSize(L),
            S && 'createProjectionLayer' in XRWebGLBinding.prototype)
          ) {
            let me = null,
              Ie = null,
              Te = null;
            E.depth &&
              ((Te = E.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24),
              (me = E.stencil ? Ji : ji),
              (Ie = E.stencil ? Zi : Kn));
            const qe = { colorFormat: t.RGBA8, depthFormat: Te, scaleFactor: s };
            (h = this.getBinding()),
              (f = h.createProjectionLayer(qe)),
              r.updateRenderState({ layers: [f] }),
              e.setPixelRatio(1),
              e.setSize(f.textureWidth, f.textureHeight, !1),
              (y = new Zn(f.textureWidth, f.textureHeight, {
                format: jt,
                type: an,
                depthTexture: new kl(
                  f.textureWidth,
                  f.textureHeight,
                  Ie,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  me,
                ),
                stencilBuffer: E.stencil,
                colorSpace: e.outputColorSpace,
                samples: E.antialias ? 4 : 0,
                resolveDepthBuffer: f.ignoreDepthValues === !1,
                resolveStencilBuffer: f.ignoreDepthValues === !1,
              }));
          } else {
            const me = {
              antialias: E.antialias,
              alpha: !0,
              depth: E.depth,
              stencil: E.stencil,
              framebufferScaleFactor: s,
            };
            (m = new XRWebGLLayer(r, t, me)),
              r.updateRenderState({ baseLayer: m }),
              e.setPixelRatio(1),
              e.setSize(m.framebufferWidth, m.framebufferHeight, !1),
              (y = new Zn(m.framebufferWidth, m.framebufferHeight, {
                format: jt,
                type: an,
                colorSpace: e.outputColorSpace,
                stencilBuffer: E.stencil,
                resolveDepthBuffer: m.ignoreDepthValues === !1,
                resolveStencilBuffer: m.ignoreDepthValues === !1,
              }));
          }
          (y.isXRRenderTarget = !0),
            this.setFoveation(l),
            (c = null),
            (a = await r.requestReferenceSpace(o)),
            Ke.setContext(r),
            Ke.start(),
            (n.isPresenting = !0),
            n.dispatchEvent({ type: 'sessionstart' });
        }
      }),
      (this.getEnvironmentBlendMode = function () {
        if (r !== null) return r.environmentBlendMode;
      }),
      (this.getDepthTexture = function () {
        return p.getDepthTexture();
      });
    function Z($) {
      for (let J = 0; J < $.removed.length; J++) {
        const me = $.removed[J],
          Ie = R.indexOf(me);
        Ie >= 0 && ((R[Ie] = null), P[Ie].disconnect(me));
      }
      for (let J = 0; J < $.added.length; J++) {
        const me = $.added[J];
        let Ie = R.indexOf(me);
        if (Ie === -1) {
          for (let qe = 0; qe < P.length; qe++)
            if (qe >= R.length) {
              R.push(me), (Ie = qe);
              break;
            } else if (R[qe] === null) {
              (R[qe] = me), (Ie = qe);
              break;
            }
          if (Ie === -1) break;
        }
        const Te = P[Ie];
        Te && Te.connect(me);
      }
    }
    const H = new F(),
      se = new F();
    function ue($, J, me) {
      H.setFromMatrixPosition(J.matrixWorld), se.setFromMatrixPosition(me.matrixWorld);
      const Ie = H.distanceTo(se),
        Te = J.projectionMatrix.elements,
        qe = me.projectionMatrix.elements,
        bt = Te[14] / (Te[10] - 1),
        C = Te[14] / (Te[10] + 1),
        at = (Te[9] + 1) / Te[5],
        Ne = (Te[9] - 1) / Te[5],
        Le = (Te[8] - 1) / Te[0],
        xe = (qe[8] + 1) / qe[0],
        ot = bt * Le,
        Me = bt * xe,
        Be = Ie / (-Le + xe),
        _t = Be * -Le;
      if (
        (J.matrixWorld.decompose($.position, $.quaternion, $.scale),
        $.translateX(_t),
        $.translateZ(Be),
        $.matrixWorld.compose($.position, $.quaternion, $.scale),
        $.matrixWorldInverse.copy($.matrixWorld).invert(),
        Te[10] === -1)
      )
        $.projectionMatrix.copy(J.projectionMatrix),
          $.projectionMatrixInverse.copy(J.projectionMatrixInverse);
      else {
        const ft = bt + Be,
          T = C + Be,
          v = ot - _t,
          O = Me + (Ie - _t),
          q = ((at * C) / T) * ft,
          j = ((Ne * C) / T) * ft;
        $.projectionMatrix.makePerspective(v, O, q, j, ft, T),
          $.projectionMatrixInverse.copy($.projectionMatrix).invert();
      }
    }
    function Ae($, J) {
      J === null
        ? $.matrixWorld.copy($.matrix)
        : $.matrixWorld.multiplyMatrices(J.matrixWorld, $.matrix),
        $.matrixWorldInverse.copy($.matrixWorld).invert();
    }
    this.updateCamera = function ($) {
      if (r === null) return;
      let J = $.near,
        me = $.far;
      p.texture !== null &&
        (p.depthNear > 0 && (J = p.depthNear), p.depthFar > 0 && (me = p.depthFar)),
        (U.near = _.near = x.near = J),
        (U.far = _.far = x.far = me),
        (z !== U.near || G !== U.far) &&
          (r.updateRenderState({ depthNear: U.near, depthFar: U.far }), (z = U.near), (G = U.far)),
        (U.layers.mask = $.layers.mask | 6),
        (x.layers.mask = U.layers.mask & 3),
        (_.layers.mask = U.layers.mask & 5);
      const Ie = $.parent,
        Te = U.cameras;
      Ae(U, Ie);
      for (let qe = 0; qe < Te.length; qe++) Ae(Te[qe], Ie);
      Te.length === 2 ? ue(U, x, _) : U.projectionMatrix.copy(x.projectionMatrix), He($, U, Ie);
    };
    function He($, J, me) {
      me === null
        ? $.matrix.copy(J.matrixWorld)
        : ($.matrix.copy(me.matrixWorld), $.matrix.invert(), $.matrix.multiply(J.matrixWorld)),
        $.matrix.decompose($.position, $.quaternion, $.scale),
        $.updateMatrixWorld(!0),
        $.projectionMatrix.copy(J.projectionMatrix),
        $.projectionMatrixInverse.copy(J.projectionMatrixInverse),
        $.isPerspectiveCamera &&
          (($.fov = Qi * 2 * Math.atan(1 / $.projectionMatrix.elements[5])), ($.zoom = 1));
    }
    (this.getCamera = function () {
      return U;
    }),
      (this.getFoveation = function () {
        if (!(f === null && m === null)) return l;
      }),
      (this.setFoveation = function ($) {
        (l = $),
          f !== null && (f.fixedFoveation = $),
          m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = $);
      }),
      (this.hasDepthSensing = function () {
        return p.texture !== null;
      }),
      (this.getDepthSensingMesh = function () {
        return p.getMesh(U);
      }),
      (this.getCameraTexture = function ($) {
        return d[$];
      });
    let tt = null;
    function st($, J) {
      if (((u = J.getViewerPose(c || a)), (g = J), u !== null)) {
        const me = u.views;
        m !== null && (e.setRenderTargetFramebuffer(y, m.framebuffer), e.setRenderTarget(y));
        let Ie = !1;
        me.length !== U.cameras.length && ((U.cameras.length = 0), (Ie = !0));
        for (let C = 0; C < me.length; C++) {
          const at = me[C];
          let Ne = null;
          if (m !== null) Ne = m.getViewport(at);
          else {
            const xe = h.getViewSubImage(f, at);
            (Ne = xe.viewport),
              C === 0 &&
                (e.setRenderTargetTextures(y, xe.colorTexture, xe.depthStencilTexture),
                e.setRenderTarget(y));
          }
          let Le = w[C];
          Le === void 0 &&
            ((Le = new Wt()), Le.layers.enable(C), (Le.viewport = new dt()), (w[C] = Le)),
            Le.matrix.fromArray(at.transform.matrix),
            Le.matrix.decompose(Le.position, Le.quaternion, Le.scale),
            Le.projectionMatrix.fromArray(at.projectionMatrix),
            Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),
            Le.viewport.set(Ne.x, Ne.y, Ne.width, Ne.height),
            C === 0 &&
              (U.matrix.copy(Le.matrix), U.matrix.decompose(U.position, U.quaternion, U.scale)),
            Ie === !0 && U.cameras.push(Le);
        }
        const Te = r.enabledFeatures;
        if (Te && Te.includes('depth-sensing') && r.depthUsage == 'gpu-optimized' && S) {
          h = n.getBinding();
          const C = h.getDepthInformation(me[0]);
          C && C.isValid && C.texture && p.init(C, r.renderState);
        }
        if (Te && Te.includes('camera-access') && S) {
          e.state.unbindTexture(), (h = n.getBinding());
          for (let C = 0; C < me.length; C++) {
            const at = me[C].camera;
            if (at) {
              let Ne = d[at];
              Ne || ((Ne = new Hl()), (d[at] = Ne));
              const Le = h.getCameraImage(at);
              Ne.sourceTexture = Le;
            }
          }
        }
      }
      for (let me = 0; me < P.length; me++) {
        const Ie = R[me],
          Te = P[me];
        Ie !== null && Te !== void 0 && Te.update(Ie, J, c || a);
      }
      tt && tt($, J),
        J.detectedPlanes && n.dispatchEvent({ type: 'planesdetected', data: J }),
        (g = null);
    }
    const Ke = new Wl();
    Ke.setAnimationLoop(st),
      (this.setAnimationLoop = function ($) {
        tt = $;
      }),
      (this.dispose = function () {});
  }
}
const Hn = new on(),
  km = new rt();
function Hm(i, e) {
  function t(p, d) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), d.value.copy(p.matrix);
  }
  function n(p, d) {
    d.color.getRGB(p.fogColor.value, Ol(i)),
      d.isFog
        ? ((p.fogNear.value = d.near), (p.fogFar.value = d.far))
        : d.isFogExp2 && (p.fogDensity.value = d.density);
  }
  function r(p, d, E, b, y) {
    d.isMeshBasicMaterial || d.isMeshLambertMaterial
      ? s(p, d)
      : d.isMeshToonMaterial
        ? (s(p, d), h(p, d))
        : d.isMeshPhongMaterial
          ? (s(p, d), u(p, d))
          : d.isMeshStandardMaterial
            ? (s(p, d), f(p, d), d.isMeshPhysicalMaterial && m(p, d, y))
            : d.isMeshMatcapMaterial
              ? (s(p, d), g(p, d))
              : d.isMeshDepthMaterial
                ? s(p, d)
                : d.isMeshDistanceMaterial
                  ? (s(p, d), S(p, d))
                  : d.isMeshNormalMaterial
                    ? s(p, d)
                    : d.isLineBasicMaterial
                      ? (a(p, d), d.isLineDashedMaterial && o(p, d))
                      : d.isPointsMaterial
                        ? l(p, d, E, b)
                        : d.isSpriteMaterial
                          ? c(p, d)
                          : d.isShadowMaterial
                            ? (p.color.value.copy(d.color), (p.opacity.value = d.opacity))
                            : d.isShaderMaterial && (d.uniformsNeedUpdate = !1);
  }
  function s(p, d) {
    (p.opacity.value = d.opacity),
      d.color && p.diffuse.value.copy(d.color),
      d.emissive && p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),
      d.map && ((p.map.value = d.map), t(d.map, p.mapTransform)),
      d.alphaMap && ((p.alphaMap.value = d.alphaMap), t(d.alphaMap, p.alphaMapTransform)),
      d.bumpMap &&
        ((p.bumpMap.value = d.bumpMap),
        t(d.bumpMap, p.bumpMapTransform),
        (p.bumpScale.value = d.bumpScale),
        d.side === Lt && (p.bumpScale.value *= -1)),
      d.normalMap &&
        ((p.normalMap.value = d.normalMap),
        t(d.normalMap, p.normalMapTransform),
        p.normalScale.value.copy(d.normalScale),
        d.side === Lt && p.normalScale.value.negate()),
      d.displacementMap &&
        ((p.displacementMap.value = d.displacementMap),
        t(d.displacementMap, p.displacementMapTransform),
        (p.displacementScale.value = d.displacementScale),
        (p.displacementBias.value = d.displacementBias)),
      d.emissiveMap &&
        ((p.emissiveMap.value = d.emissiveMap), t(d.emissiveMap, p.emissiveMapTransform)),
      d.specularMap &&
        ((p.specularMap.value = d.specularMap), t(d.specularMap, p.specularMapTransform)),
      d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
    const E = e.get(d),
      b = E.envMap,
      y = E.envMapRotation;
    b &&
      ((p.envMap.value = b),
      Hn.copy(y),
      (Hn.x *= -1),
      (Hn.y *= -1),
      (Hn.z *= -1),
      b.isCubeTexture && b.isRenderTargetTexture === !1 && ((Hn.y *= -1), (Hn.z *= -1)),
      p.envMapRotation.value.setFromMatrix4(km.makeRotationFromEuler(Hn)),
      (p.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1),
      (p.reflectivity.value = d.reflectivity),
      (p.ior.value = d.ior),
      (p.refractionRatio.value = d.refractionRatio)),
      d.lightMap &&
        ((p.lightMap.value = d.lightMap),
        (p.lightMapIntensity.value = d.lightMapIntensity),
        t(d.lightMap, p.lightMapTransform)),
      d.aoMap &&
        ((p.aoMap.value = d.aoMap),
        (p.aoMapIntensity.value = d.aoMapIntensity),
        t(d.aoMap, p.aoMapTransform));
  }
  function a(p, d) {
    p.diffuse.value.copy(d.color),
      (p.opacity.value = d.opacity),
      d.map && ((p.map.value = d.map), t(d.map, p.mapTransform));
  }
  function o(p, d) {
    (p.dashSize.value = d.dashSize),
      (p.totalSize.value = d.dashSize + d.gapSize),
      (p.scale.value = d.scale);
  }
  function l(p, d, E, b) {
    p.diffuse.value.copy(d.color),
      (p.opacity.value = d.opacity),
      (p.size.value = d.size * E),
      (p.scale.value = b * 0.5),
      d.map && ((p.map.value = d.map), t(d.map, p.uvTransform)),
      d.alphaMap && ((p.alphaMap.value = d.alphaMap), t(d.alphaMap, p.alphaMapTransform)),
      d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
  }
  function c(p, d) {
    p.diffuse.value.copy(d.color),
      (p.opacity.value = d.opacity),
      (p.rotation.value = d.rotation),
      d.map && ((p.map.value = d.map), t(d.map, p.mapTransform)),
      d.alphaMap && ((p.alphaMap.value = d.alphaMap), t(d.alphaMap, p.alphaMapTransform)),
      d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
  }
  function u(p, d) {
    p.specular.value.copy(d.specular), (p.shininess.value = Math.max(d.shininess, 1e-4));
  }
  function h(p, d) {
    d.gradientMap && (p.gradientMap.value = d.gradientMap);
  }
  function f(p, d) {
    (p.metalness.value = d.metalness),
      d.metalnessMap &&
        ((p.metalnessMap.value = d.metalnessMap), t(d.metalnessMap, p.metalnessMapTransform)),
      (p.roughness.value = d.roughness),
      d.roughnessMap &&
        ((p.roughnessMap.value = d.roughnessMap), t(d.roughnessMap, p.roughnessMapTransform)),
      d.envMap && (p.envMapIntensity.value = d.envMapIntensity);
  }
  function m(p, d, E) {
    (p.ior.value = d.ior),
      d.sheen > 0 &&
        (p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),
        (p.sheenRoughness.value = d.sheenRoughness),
        d.sheenColorMap &&
          ((p.sheenColorMap.value = d.sheenColorMap), t(d.sheenColorMap, p.sheenColorMapTransform)),
        d.sheenRoughnessMap &&
          ((p.sheenRoughnessMap.value = d.sheenRoughnessMap),
          t(d.sheenRoughnessMap, p.sheenRoughnessMapTransform))),
      d.clearcoat > 0 &&
        ((p.clearcoat.value = d.clearcoat),
        (p.clearcoatRoughness.value = d.clearcoatRoughness),
        d.clearcoatMap &&
          ((p.clearcoatMap.value = d.clearcoatMap), t(d.clearcoatMap, p.clearcoatMapTransform)),
        d.clearcoatRoughnessMap &&
          ((p.clearcoatRoughnessMap.value = d.clearcoatRoughnessMap),
          t(d.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)),
        d.clearcoatNormalMap &&
          ((p.clearcoatNormalMap.value = d.clearcoatNormalMap),
          t(d.clearcoatNormalMap, p.clearcoatNormalMapTransform),
          p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),
          d.side === Lt && p.clearcoatNormalScale.value.negate())),
      d.dispersion > 0 && (p.dispersion.value = d.dispersion),
      d.iridescence > 0 &&
        ((p.iridescence.value = d.iridescence),
        (p.iridescenceIOR.value = d.iridescenceIOR),
        (p.iridescenceThicknessMinimum.value = d.iridescenceThicknessRange[0]),
        (p.iridescenceThicknessMaximum.value = d.iridescenceThicknessRange[1]),
        d.iridescenceMap &&
          ((p.iridescenceMap.value = d.iridescenceMap),
          t(d.iridescenceMap, p.iridescenceMapTransform)),
        d.iridescenceThicknessMap &&
          ((p.iridescenceThicknessMap.value = d.iridescenceThicknessMap),
          t(d.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))),
      d.transmission > 0 &&
        ((p.transmission.value = d.transmission),
        (p.transmissionSamplerMap.value = E.texture),
        p.transmissionSamplerSize.value.set(E.width, E.height),
        d.transmissionMap &&
          ((p.transmissionMap.value = d.transmissionMap),
          t(d.transmissionMap, p.transmissionMapTransform)),
        (p.thickness.value = d.thickness),
        d.thicknessMap &&
          ((p.thicknessMap.value = d.thicknessMap), t(d.thicknessMap, p.thicknessMapTransform)),
        (p.attenuationDistance.value = d.attenuationDistance),
        p.attenuationColor.value.copy(d.attenuationColor)),
      d.anisotropy > 0 &&
        (p.anisotropyVector.value.set(
          d.anisotropy * Math.cos(d.anisotropyRotation),
          d.anisotropy * Math.sin(d.anisotropyRotation),
        ),
        d.anisotropyMap &&
          ((p.anisotropyMap.value = d.anisotropyMap),
          t(d.anisotropyMap, p.anisotropyMapTransform))),
      (p.specularIntensity.value = d.specularIntensity),
      p.specularColor.value.copy(d.specularColor),
      d.specularColorMap &&
        ((p.specularColorMap.value = d.specularColorMap),
        t(d.specularColorMap, p.specularColorMapTransform)),
      d.specularIntensityMap &&
        ((p.specularIntensityMap.value = d.specularIntensityMap),
        t(d.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function g(p, d) {
    d.matcap && (p.matcap.value = d.matcap);
  }
  function S(p, d) {
    const E = e.get(d).light;
    p.referencePosition.value.setFromMatrixPosition(E.matrixWorld),
      (p.nearDistance.value = E.shadow.camera.near),
      (p.farDistance.value = E.shadow.camera.far);
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: r };
}
function Gm(i, e, t, n) {
  let r = {},
    s = {},
    a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(E, b) {
    const y = b.program;
    n.uniformBlockBinding(E, y);
  }
  function c(E, b) {
    let y = r[E.id];
    y === void 0 && (g(E), (y = u(E)), (r[E.id] = y), E.addEventListener('dispose', p));
    const P = b.program;
    n.updateUBOMapping(E, P);
    const R = e.render.frame;
    s[E.id] !== R && (f(E), (s[E.id] = R));
  }
  function u(E) {
    const b = h();
    E.__bindingPointIndex = b;
    const y = i.createBuffer(),
      P = E.__size,
      R = E.usage;
    return (
      i.bindBuffer(i.UNIFORM_BUFFER, y),
      i.bufferData(i.UNIFORM_BUFFER, P, R),
      i.bindBuffer(i.UNIFORM_BUFFER, null),
      i.bindBufferBase(i.UNIFORM_BUFFER, b, y),
      y
    );
  }
  function h() {
    for (let E = 0; E < o; E++) if (a.indexOf(E) === -1) return a.push(E), E;
    return (
      console.error(
        'THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.',
      ),
      0
    );
  }
  function f(E) {
    const b = r[E.id],
      y = E.uniforms,
      P = E.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, b);
    for (let R = 0, L = y.length; R < L; R++) {
      const A = Array.isArray(y[R]) ? y[R] : [y[R]];
      for (let x = 0, _ = A.length; x < _; x++) {
        const w = A[x];
        if (m(w, R, x, P) === !0) {
          const U = w.__offset,
            z = Array.isArray(w.value) ? w.value : [w.value];
          let G = 0;
          for (let V = 0; V < z.length; V++) {
            const X = z[V],
              Z = S(X);
            typeof X == 'number' || typeof X == 'boolean'
              ? ((w.__data[0] = X), i.bufferSubData(i.UNIFORM_BUFFER, U + G, w.__data))
              : X.isMatrix3
                ? ((w.__data[0] = X.elements[0]),
                  (w.__data[1] = X.elements[1]),
                  (w.__data[2] = X.elements[2]),
                  (w.__data[3] = 0),
                  (w.__data[4] = X.elements[3]),
                  (w.__data[5] = X.elements[4]),
                  (w.__data[6] = X.elements[5]),
                  (w.__data[7] = 0),
                  (w.__data[8] = X.elements[6]),
                  (w.__data[9] = X.elements[7]),
                  (w.__data[10] = X.elements[8]),
                  (w.__data[11] = 0))
                : (X.toArray(w.__data, G), (G += Z.storage / Float32Array.BYTES_PER_ELEMENT));
          }
          i.bufferSubData(i.UNIFORM_BUFFER, U, w.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function m(E, b, y, P) {
    const R = E.value,
      L = b + '_' + y;
    if (P[L] === void 0)
      return typeof R == 'number' || typeof R == 'boolean' ? (P[L] = R) : (P[L] = R.clone()), !0;
    {
      const A = P[L];
      if (typeof R == 'number' || typeof R == 'boolean') {
        if (A !== R) return (P[L] = R), !0;
      } else if (A.equals(R) === !1) return A.copy(R), !0;
    }
    return !1;
  }
  function g(E) {
    const b = E.uniforms;
    let y = 0;
    const P = 16;
    for (let L = 0, A = b.length; L < A; L++) {
      const x = Array.isArray(b[L]) ? b[L] : [b[L]];
      for (let _ = 0, w = x.length; _ < w; _++) {
        const U = x[_],
          z = Array.isArray(U.value) ? U.value : [U.value];
        for (let G = 0, V = z.length; G < V; G++) {
          const X = z[G],
            Z = S(X),
            H = y % P,
            se = H % Z.boundary,
            ue = H + se;
          (y += se),
            ue !== 0 && P - ue < Z.storage && (y += P - ue),
            (U.__data = new Float32Array(Z.storage / Float32Array.BYTES_PER_ELEMENT)),
            (U.__offset = y),
            (y += Z.storage);
        }
      }
    }
    const R = y % P;
    return R > 0 && (y += P - R), (E.__size = y), (E.__cache = {}), this;
  }
  function S(E) {
    const b = { boundary: 0, storage: 0 };
    return (
      typeof E == 'number' || typeof E == 'boolean'
        ? ((b.boundary = 4), (b.storage = 4))
        : E.isVector2
          ? ((b.boundary = 8), (b.storage = 8))
          : E.isVector3 || E.isColor
            ? ((b.boundary = 16), (b.storage = 12))
            : E.isVector4
              ? ((b.boundary = 16), (b.storage = 16))
              : E.isMatrix3
                ? ((b.boundary = 48), (b.storage = 48))
                : E.isMatrix4
                  ? ((b.boundary = 64), (b.storage = 64))
                  : E.isTexture
                    ? console.warn(
                        'THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.',
                      )
                    : console.warn('THREE.WebGLRenderer: Unsupported uniform value type.', E),
      b
    );
  }
  function p(E) {
    const b = E.target;
    b.removeEventListener('dispose', p);
    const y = a.indexOf(b.__bindingPointIndex);
    a.splice(y, 1), i.deleteBuffer(r[b.id]), delete r[b.id], delete s[b.id];
  }
  function d() {
    for (const E in r) i.deleteBuffer(r[E]);
    (a = []), (r = {}), (s = {});
  }
  return { bind: l, update: c, dispose: d };
}
class Vm {
  constructor(e = {}) {
    const {
      canvas: t = vh(),
      context: n = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: u = 'default',
      failIfMajorPerformanceCaveat: h = !1,
      reversedDepthBuffer: f = !1,
    } = e;
    this.isWebGLRenderer = !0;
    let m;
    if (n !== null) {
      if (typeof WebGLRenderingContext < 'u' && n instanceof WebGLRenderingContext)
        throw new Error('THREE.WebGLRenderer: WebGL 1 is not supported since r163.');
      m = n.getContextAttributes().alpha;
    } else m = a;
    const g = new Uint32Array(4),
      S = new Int32Array(4);
    let p = null,
      d = null;
    const E = [],
      b = [];
    (this.domElement = t),
      (this.debug = { checkShaderErrors: !0, onShaderError: null }),
      (this.autoClear = !0),
      (this.autoClearColor = !0),
      (this.autoClearDepth = !0),
      (this.autoClearStencil = !0),
      (this.sortObjects = !0),
      (this.clippingPlanes = []),
      (this.localClippingEnabled = !1),
      (this.toneMapping = Rn),
      (this.toneMappingExposure = 1),
      (this.transmissionResolutionScale = 1);
    const y = this;
    let P = !1;
    this._outputColorSpace = Ut;
    let R = 0,
      L = 0,
      A = null,
      x = -1,
      _ = null;
    const w = new dt(),
      U = new dt();
    let z = null;
    const G = new ke(0);
    let V = 0,
      X = t.width,
      Z = t.height,
      H = 1,
      se = null,
      ue = null;
    const Ae = new dt(0, 0, X, Z),
      He = new dt(0, 0, X, Z);
    let tt = !1;
    const st = new Fa();
    let Ke = !1,
      $ = !1;
    const J = new rt(),
      me = new F(),
      Ie = new dt(),
      Te = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let qe = !1;
    function bt() {
      return A === null ? H : 1;
    }
    let C = n;
    function at(M, I) {
      return t.getContext(M, I);
    }
    try {
      const M = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: u,
        failIfMajorPerformanceCaveat: h,
      };
      if (
        ('setAttribute' in t && t.setAttribute('data-engine', `three.js r${Ea}`),
        t.addEventListener('webglcontextlost', ae, !1),
        t.addEventListener('webglcontextrestored', pe, !1),
        t.addEventListener('webglcontextcreationerror', Q, !1),
        C === null)
      ) {
        const I = 'webgl2';
        if (((C = at(I, M)), C === null))
          throw at(I)
            ? new Error('Error creating WebGL context with your selected attributes.')
            : new Error('Error creating WebGL context.');
      }
    } catch (M) {
      throw (console.error('THREE.WebGLRenderer: ' + M.message), M);
    }
    let Ne, Le, xe, ot, Me, Be, _t, ft, T, v, O, q, j, W, Ee, re, Se, ye, te, he, Pe, be, le, Fe;
    function D() {
      (Ne = new Qf(C)),
        Ne.init(),
        (be = new Nm(C, Ne)),
        (Le = new qf(C, Ne, e, be)),
        (xe = new Im(C, Ne)),
        Le.reversedDepthBuffer && f && xe.buffers.depth.setReversed(!0),
        (ot = new np(C)),
        (Me = new Mm()),
        (Be = new Um(C, Ne, xe, Me, Le, be, ot)),
        (_t = new Yf(y)),
        (ft = new Jf(y)),
        (T = new ou(C)),
        (le = new Wf(C, T)),
        (v = new ep(C, T, ot, le)),
        (O = new rp(C, v, T, ot)),
        (te = new ip(C, Le, Be)),
        (re = new $f(Me)),
        (q = new xm(y, _t, ft, Ne, Le, le, re)),
        (j = new Hm(y, Me)),
        (W = new ym()),
        (Ee = new Rm(Ne)),
        (ye = new Vf(y, _t, ft, xe, O, m, l)),
        (Se = new Lm(y, O, Le)),
        (Fe = new Gm(C, ot, Le, xe)),
        (he = new Xf(C, Ne, ot)),
        (Pe = new tp(C, Ne, ot)),
        (ot.programs = q.programs),
        (y.capabilities = Le),
        (y.extensions = Ne),
        (y.properties = Me),
        (y.renderLists = W),
        (y.shadowMap = Se),
        (y.state = xe),
        (y.info = ot);
    }
    D();
    const ne = new zm(y, C);
    (this.xr = ne),
      (this.getContext = function () {
        return C;
      }),
      (this.getContextAttributes = function () {
        return C.getContextAttributes();
      }),
      (this.forceContextLoss = function () {
        const M = Ne.get('WEBGL_lose_context');
        M && M.loseContext();
      }),
      (this.forceContextRestore = function () {
        const M = Ne.get('WEBGL_lose_context');
        M && M.restoreContext();
      }),
      (this.getPixelRatio = function () {
        return H;
      }),
      (this.setPixelRatio = function (M) {
        M !== void 0 && ((H = M), this.setSize(X, Z, !1));
      }),
      (this.getSize = function (M) {
        return M.set(X, Z);
      }),
      (this.setSize = function (M, I, B = !0) {
        if (ne.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        (X = M),
          (Z = I),
          (t.width = Math.floor(M * H)),
          (t.height = Math.floor(I * H)),
          B === !0 && ((t.style.width = M + 'px'), (t.style.height = I + 'px')),
          this.setViewport(0, 0, M, I);
      }),
      (this.getDrawingBufferSize = function (M) {
        return M.set(X * H, Z * H).floor();
      }),
      (this.setDrawingBufferSize = function (M, I, B) {
        (X = M),
          (Z = I),
          (H = B),
          (t.width = Math.floor(M * B)),
          (t.height = Math.floor(I * B)),
          this.setViewport(0, 0, M, I);
      }),
      (this.getCurrentViewport = function (M) {
        return M.copy(w);
      }),
      (this.getViewport = function (M) {
        return M.copy(Ae);
      }),
      (this.setViewport = function (M, I, B, k) {
        M.isVector4 ? Ae.set(M.x, M.y, M.z, M.w) : Ae.set(M, I, B, k),
          xe.viewport(w.copy(Ae).multiplyScalar(H).round());
      }),
      (this.getScissor = function (M) {
        return M.copy(He);
      }),
      (this.setScissor = function (M, I, B, k) {
        M.isVector4 ? He.set(M.x, M.y, M.z, M.w) : He.set(M, I, B, k),
          xe.scissor(U.copy(He).multiplyScalar(H).round());
      }),
      (this.getScissorTest = function () {
        return tt;
      }),
      (this.setScissorTest = function (M) {
        xe.setScissorTest((tt = M));
      }),
      (this.setOpaqueSort = function (M) {
        se = M;
      }),
      (this.setTransparentSort = function (M) {
        ue = M;
      }),
      (this.getClearColor = function (M) {
        return M.copy(ye.getClearColor());
      }),
      (this.setClearColor = function () {
        ye.setClearColor(...arguments);
      }),
      (this.getClearAlpha = function () {
        return ye.getClearAlpha();
      }),
      (this.setClearAlpha = function () {
        ye.setClearAlpha(...arguments);
      }),
      (this.clear = function (M = !0, I = !0, B = !0) {
        let k = 0;
        if (M) {
          let N = !1;
          if (A !== null) {
            const ee = A.texture.format;
            N = ee === La || ee === Pa || ee === Ca;
          }
          if (N) {
            const ee = A.texture.type,
              ce = ee === an || ee === Kn || ee === Ki || ee === Zi || ee === Aa || ee === wa,
              ge = ye.getClearColor(),
              de = ye.getClearAlpha(),
              Ce = ge.r,
              De = ge.g,
              we = ge.b;
            ce
              ? ((g[0] = Ce),
                (g[1] = De),
                (g[2] = we),
                (g[3] = de),
                C.clearBufferuiv(C.COLOR, 0, g))
              : ((S[0] = Ce),
                (S[1] = De),
                (S[2] = we),
                (S[3] = de),
                C.clearBufferiv(C.COLOR, 0, S));
          } else k |= C.COLOR_BUFFER_BIT;
        }
        I && (k |= C.DEPTH_BUFFER_BIT),
          B && ((k |= C.STENCIL_BUFFER_BIT), this.state.buffers.stencil.setMask(4294967295)),
          C.clear(k);
      }),
      (this.clearColor = function () {
        this.clear(!0, !1, !1);
      }),
      (this.clearDepth = function () {
        this.clear(!1, !0, !1);
      }),
      (this.clearStencil = function () {
        this.clear(!1, !1, !0);
      }),
      (this.dispose = function () {
        t.removeEventListener('webglcontextlost', ae, !1),
          t.removeEventListener('webglcontextrestored', pe, !1),
          t.removeEventListener('webglcontextcreationerror', Q, !1),
          ye.dispose(),
          W.dispose(),
          Ee.dispose(),
          Me.dispose(),
          _t.dispose(),
          ft.dispose(),
          O.dispose(),
          le.dispose(),
          Fe.dispose(),
          q.dispose(),
          ne.dispose(),
          ne.removeEventListener('sessionstart', Qt),
          ne.removeEventListener('sessionend', ja),
          Un.stop();
      });
    function ae(M) {
      M.preventDefault(), console.log('THREE.WebGLRenderer: Context Lost.'), (P = !0);
    }
    function pe() {
      console.log('THREE.WebGLRenderer: Context Restored.'), (P = !1);
      const M = ot.autoReset,
        I = Se.enabled,
        B = Se.autoUpdate,
        k = Se.needsUpdate,
        N = Se.type;
      D(),
        (ot.autoReset = M),
        (Se.enabled = I),
        (Se.autoUpdate = B),
        (Se.needsUpdate = k),
        (Se.type = N);
    }
    function Q(M) {
      console.error(
        'THREE.WebGLRenderer: A WebGL context could not be created. Reason: ',
        M.statusMessage,
      );
    }
    function K(M) {
      const I = M.target;
      I.removeEventListener('dispose', K), ve(I);
    }
    function ve(M) {
      Ue(M), Me.remove(M);
    }
    function Ue(M) {
      const I = Me.get(M).programs;
      I !== void 0 &&
        (I.forEach(function (B) {
          q.releaseProgram(B);
        }),
        M.isShaderMaterial && q.releaseShaderCache(M));
    }
    this.renderBufferDirect = function (M, I, B, k, N, ee) {
      I === null && (I = Te);
      const ce = N.isMesh && N.matrixWorld.determinant() < 0,
        ge = uc(M, I, B, k, N);
      xe.setMaterial(k, ce);
      let de = B.index,
        Ce = 1;
      if (k.wireframe === !0) {
        if (((de = v.getWireframeAttribute(B)), de === void 0)) return;
        Ce = 2;
      }
      const De = B.drawRange,
        we = B.attributes.position;
      let Ge = De.start * Ce,
        je = (De.start + De.count) * Ce;
      ee !== null &&
        ((Ge = Math.max(Ge, ee.start * Ce)), (je = Math.min(je, (ee.start + ee.count) * Ce))),
        de !== null
          ? ((Ge = Math.max(Ge, 0)), (je = Math.min(je, de.count)))
          : we != null && ((Ge = Math.max(Ge, 0)), (je = Math.min(je, we.count)));
      const ht = je - Ge;
      if (ht < 0 || ht === 1 / 0) return;
      le.setup(N, k, ge, B, de);
      let it,
        et = he;
      if ((de !== null && ((it = T.get(de)), (et = Pe), et.setIndex(it)), N.isMesh))
        k.wireframe === !0
          ? (xe.setLineWidth(k.wireframeLinewidth * bt()), et.setMode(C.LINES))
          : et.setMode(C.TRIANGLES);
      else if (N.isLine) {
        let Re = k.linewidth;
        Re === void 0 && (Re = 1),
          xe.setLineWidth(Re * bt()),
          N.isLineSegments
            ? et.setMode(C.LINES)
            : N.isLineLoop
              ? et.setMode(C.LINE_LOOP)
              : et.setMode(C.LINE_STRIP);
      } else N.isPoints ? et.setMode(C.POINTS) : N.isSprite && et.setMode(C.TRIANGLES);
      if (N.isBatchedMesh)
        if (N._multiDrawInstances !== null)
          er(
            'THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.',
          ),
            et.renderMultiDrawInstances(
              N._multiDrawStarts,
              N._multiDrawCounts,
              N._multiDrawCount,
              N._multiDrawInstances,
            );
        else if (Ne.get('WEBGL_multi_draw'))
          et.renderMultiDraw(N._multiDrawStarts, N._multiDrawCounts, N._multiDrawCount);
        else {
          const Re = N._multiDrawStarts,
            lt = N._multiDrawCounts,
            $e = N._multiDrawCount,
            Nt = de ? T.get(de).bytesPerElement : 1,
            ei = Me.get(k).currentProgram.getUniforms();
          for (let Ft = 0; Ft < $e; Ft++)
            ei.setValue(C, '_gl_DrawID', Ft), et.render(Re[Ft] / Nt, lt[Ft]);
        }
      else if (N.isInstancedMesh) et.renderInstances(Ge, ht, N.count);
      else if (B.isInstancedBufferGeometry) {
        const Re = B._maxInstanceCount !== void 0 ? B._maxInstanceCount : 1 / 0,
          lt = Math.min(B.instanceCount, Re);
        et.renderInstances(Ge, ht, lt);
      } else et.render(Ge, ht);
    };
    function nt(M, I, B) {
      M.transparent === !0 && M.side === tn && M.forceSinglePass === !1
        ? ((M.side = Lt),
          (M.needsUpdate = !0),
          ur(M, I, B),
          (M.side = Pn),
          (M.needsUpdate = !0),
          ur(M, I, B),
          (M.side = tn))
        : ur(M, I, B);
    }
    (this.compile = function (M, I, B = null) {
      B === null && (B = M),
        (d = Ee.get(B)),
        d.init(I),
        b.push(d),
        B.traverseVisible(function (N) {
          N.isLight && N.layers.test(I.layers) && (d.pushLight(N), N.castShadow && d.pushShadow(N));
        }),
        M !== B &&
          M.traverseVisible(function (N) {
            N.isLight &&
              N.layers.test(I.layers) &&
              (d.pushLight(N), N.castShadow && d.pushShadow(N));
          }),
        d.setupLights();
      const k = new Set();
      return (
        M.traverse(function (N) {
          if (!(N.isMesh || N.isPoints || N.isLine || N.isSprite)) return;
          const ee = N.material;
          if (ee)
            if (Array.isArray(ee))
              for (let ce = 0; ce < ee.length; ce++) {
                const ge = ee[ce];
                nt(ge, B, N), k.add(ge);
              }
            else nt(ee, B, N), k.add(ee);
        }),
        (d = b.pop()),
        k
      );
    }),
      (this.compileAsync = function (M, I, B = null) {
        const k = this.compile(M, I, B);
        return new Promise((N) => {
          function ee() {
            if (
              (k.forEach(function (ce) {
                Me.get(ce).currentProgram.isReady() && k.delete(ce);
              }),
              k.size === 0)
            ) {
              N(M);
              return;
            }
            setTimeout(ee, 10);
          }
          Ne.get('KHR_parallel_shader_compile') !== null ? ee() : setTimeout(ee, 10);
        });
      });
    let Ze = null;
    function ln(M) {
      Ze && Ze(M);
    }
    function Qt() {
      Un.stop();
    }
    function ja() {
      Un.start();
    }
    const Un = new Wl();
    Un.setAnimationLoop(ln),
      typeof self < 'u' && Un.setContext(self),
      (this.setAnimationLoop = function (M) {
        (Ze = M), ne.setAnimationLoop(M), M === null ? Un.stop() : Un.start();
      }),
      ne.addEventListener('sessionstart', Qt),
      ne.addEventListener('sessionend', ja),
      (this.render = function (M, I) {
        if (I !== void 0 && I.isCamera !== !0) {
          console.error('THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.');
          return;
        }
        if (P === !0) return;
        if (
          (M.matrixWorldAutoUpdate === !0 && M.updateMatrixWorld(),
          I.parent === null && I.matrixWorldAutoUpdate === !0 && I.updateMatrixWorld(),
          ne.enabled === !0 &&
            ne.isPresenting === !0 &&
            (ne.cameraAutoUpdate === !0 && ne.updateCamera(I), (I = ne.getCamera())),
          M.isScene === !0 && M.onBeforeRender(y, M, I, A),
          (d = Ee.get(M, b.length)),
          d.init(I),
          b.push(d),
          J.multiplyMatrices(I.projectionMatrix, I.matrixWorldInverse),
          st.setFromProjectionMatrix(J, sn, I.reversedDepth),
          ($ = this.localClippingEnabled),
          (Ke = re.init(this.clippingPlanes, $)),
          (p = W.get(M, E.length)),
          p.init(),
          E.push(p),
          ne.enabled === !0 && ne.isPresenting === !0)
        ) {
          const ee = y.xr.getDepthSensingMesh();
          ee !== null && Zr(ee, I, -1 / 0, y.sortObjects);
        }
        Zr(M, I, 0, y.sortObjects),
          p.finish(),
          y.sortObjects === !0 && p.sort(se, ue),
          (qe = ne.enabled === !1 || ne.isPresenting === !1 || ne.hasDepthSensing() === !1),
          qe && ye.addToRenderList(p, M),
          this.info.render.frame++,
          Ke === !0 && re.beginShadows();
        const B = d.state.shadowsArray;
        Se.render(B, M, I),
          Ke === !0 && re.endShadows(),
          this.info.autoReset === !0 && this.info.reset();
        const k = p.opaque,
          N = p.transmissive;
        if ((d.setupLights(), I.isArrayCamera)) {
          const ee = I.cameras;
          if (N.length > 0)
            for (let ce = 0, ge = ee.length; ce < ge; ce++) {
              const de = ee[ce];
              Qa(k, N, M, de);
            }
          qe && ye.render(M);
          for (let ce = 0, ge = ee.length; ce < ge; ce++) {
            const de = ee[ce];
            Ja(p, M, de, de.viewport);
          }
        } else N.length > 0 && Qa(k, N, M, I), qe && ye.render(M), Ja(p, M, I);
        A !== null &&
          L === 0 &&
          (Be.updateMultisampleRenderTarget(A), Be.updateRenderTargetMipmap(A)),
          M.isScene === !0 && M.onAfterRender(y, M, I),
          le.resetDefaultState(),
          (x = -1),
          (_ = null),
          b.pop(),
          b.length > 0
            ? ((d = b[b.length - 1]),
              Ke === !0 && re.setGlobalState(y.clippingPlanes, d.state.camera))
            : (d = null),
          E.pop(),
          E.length > 0 ? (p = E[E.length - 1]) : (p = null);
      });
    function Zr(M, I, B, k) {
      if (M.visible === !1) return;
      if (M.layers.test(I.layers)) {
        if (M.isGroup) B = M.renderOrder;
        else if (M.isLOD) M.autoUpdate === !0 && M.update(I);
        else if (M.isLight) d.pushLight(M), M.castShadow && d.pushShadow(M);
        else if (M.isSprite) {
          if (!M.frustumCulled || st.intersectsSprite(M)) {
            k && Ie.setFromMatrixPosition(M.matrixWorld).applyMatrix4(J);
            const ce = O.update(M),
              ge = M.material;
            ge.visible && p.push(M, ce, ge, B, Ie.z, null);
          }
        } else if (
          (M.isMesh || M.isLine || M.isPoints) &&
          (!M.frustumCulled || st.intersectsObject(M))
        ) {
          const ce = O.update(M),
            ge = M.material;
          if (
            (k &&
              (M.boundingSphere !== void 0
                ? (M.boundingSphere === null && M.computeBoundingSphere(),
                  Ie.copy(M.boundingSphere.center))
                : (ce.boundingSphere === null && ce.computeBoundingSphere(),
                  Ie.copy(ce.boundingSphere.center)),
              Ie.applyMatrix4(M.matrixWorld).applyMatrix4(J)),
            Array.isArray(ge))
          ) {
            const de = ce.groups;
            for (let Ce = 0, De = de.length; Ce < De; Ce++) {
              const we = de[Ce],
                Ge = ge[we.materialIndex];
              Ge && Ge.visible && p.push(M, ce, Ge, B, Ie.z, we);
            }
          } else ge.visible && p.push(M, ce, ge, B, Ie.z, null);
        }
      }
      const ee = M.children;
      for (let ce = 0, ge = ee.length; ce < ge; ce++) Zr(ee[ce], I, B, k);
    }
    function Ja(M, I, B, k) {
      const N = M.opaque,
        ee = M.transmissive,
        ce = M.transparent;
      d.setupLightsView(B),
        Ke === !0 && re.setGlobalState(y.clippingPlanes, B),
        k && xe.viewport(w.copy(k)),
        N.length > 0 && hr(N, I, B),
        ee.length > 0 && hr(ee, I, B),
        ce.length > 0 && hr(ce, I, B),
        xe.buffers.depth.setTest(!0),
        xe.buffers.depth.setMask(!0),
        xe.buffers.color.setMask(!0),
        xe.setPolygonOffset(!1);
    }
    function Qa(M, I, B, k) {
      if ((B.isScene === !0 ? B.overrideMaterial : null) !== null) return;
      d.state.transmissionRenderTarget[k.id] === void 0 &&
        (d.state.transmissionRenderTarget[k.id] = new Zn(1, 1, {
          generateMipmaps: !0,
          type: Ne.has('EXT_color_buffer_half_float') || Ne.has('EXT_color_buffer_float') ? ir : an,
          minFilter: $n,
          samples: 4,
          stencilBuffer: s,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: Ye.workingColorSpace,
        }));
      const ee = d.state.transmissionRenderTarget[k.id],
        ce = k.viewport || w;
      ee.setSize(ce.z * y.transmissionResolutionScale, ce.w * y.transmissionResolutionScale);
      const ge = y.getRenderTarget(),
        de = y.getActiveCubeFace(),
        Ce = y.getActiveMipmapLevel();
      y.setRenderTarget(ee),
        y.getClearColor(G),
        (V = y.getClearAlpha()),
        V < 1 && y.setClearColor(16777215, 0.5),
        y.clear(),
        qe && ye.render(B);
      const De = y.toneMapping;
      y.toneMapping = Rn;
      const we = k.viewport;
      if (
        (k.viewport !== void 0 && (k.viewport = void 0),
        d.setupLightsView(k),
        Ke === !0 && re.setGlobalState(y.clippingPlanes, k),
        hr(M, B, k),
        Be.updateMultisampleRenderTarget(ee),
        Be.updateRenderTargetMipmap(ee),
        Ne.has('WEBGL_multisampled_render_to_texture') === !1)
      ) {
        let Ge = !1;
        for (let je = 0, ht = I.length; je < ht; je++) {
          const it = I[je],
            et = it.object,
            Re = it.geometry,
            lt = it.material,
            $e = it.group;
          if (lt.side === tn && et.layers.test(k.layers)) {
            const Nt = lt.side;
            (lt.side = Lt),
              (lt.needsUpdate = !0),
              eo(et, B, k, Re, lt, $e),
              (lt.side = Nt),
              (lt.needsUpdate = !0),
              (Ge = !0);
          }
        }
        Ge === !0 && (Be.updateMultisampleRenderTarget(ee), Be.updateRenderTargetMipmap(ee));
      }
      y.setRenderTarget(ge, de, Ce),
        y.setClearColor(G, V),
        we !== void 0 && (k.viewport = we),
        (y.toneMapping = De);
    }
    function hr(M, I, B) {
      const k = I.isScene === !0 ? I.overrideMaterial : null;
      for (let N = 0, ee = M.length; N < ee; N++) {
        const ce = M[N],
          ge = ce.object,
          de = ce.geometry,
          Ce = ce.group;
        let De = ce.material;
        De.allowOverride === !0 && k !== null && (De = k),
          ge.layers.test(B.layers) && eo(ge, I, B, de, De, Ce);
      }
    }
    function eo(M, I, B, k, N, ee) {
      M.onBeforeRender(y, I, B, k, N, ee),
        M.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse, M.matrixWorld),
        M.normalMatrix.getNormalMatrix(M.modelViewMatrix),
        N.onBeforeRender(y, I, B, k, M, ee),
        N.transparent === !0 && N.side === tn && N.forceSinglePass === !1
          ? ((N.side = Lt),
            (N.needsUpdate = !0),
            y.renderBufferDirect(B, I, k, N, M, ee),
            (N.side = Pn),
            (N.needsUpdate = !0),
            y.renderBufferDirect(B, I, k, N, M, ee),
            (N.side = tn))
          : y.renderBufferDirect(B, I, k, N, M, ee),
        M.onAfterRender(y, I, B, k, N, ee);
    }
    function ur(M, I, B) {
      I.isScene !== !0 && (I = Te);
      const k = Me.get(M),
        N = d.state.lights,
        ee = d.state.shadowsArray,
        ce = N.state.version,
        ge = q.getParameters(M, N.state, ee, I, B),
        de = q.getProgramCacheKey(ge);
      let Ce = k.programs;
      (k.environment = M.isMeshStandardMaterial ? I.environment : null),
        (k.fog = I.fog),
        (k.envMap = (M.isMeshStandardMaterial ? ft : _t).get(M.envMap || k.environment)),
        (k.envMapRotation =
          k.environment !== null && M.envMap === null ? I.environmentRotation : M.envMapRotation),
        Ce === void 0 && (M.addEventListener('dispose', K), (Ce = new Map()), (k.programs = Ce));
      let De = Ce.get(de);
      if (De !== void 0) {
        if (k.currentProgram === De && k.lightsStateVersion === ce) return no(M, ge), De;
      } else
        (ge.uniforms = q.getUniforms(M)),
          M.onBeforeCompile(ge, y),
          (De = q.acquireProgram(ge, de)),
          Ce.set(de, De),
          (k.uniforms = ge.uniforms);
      const we = k.uniforms;
      return (
        ((!M.isShaderMaterial && !M.isRawShaderMaterial) || M.clipping === !0) &&
          (we.clippingPlanes = re.uniform),
        no(M, ge),
        (k.needsLights = fc(M)),
        (k.lightsStateVersion = ce),
        k.needsLights &&
          ((we.ambientLightColor.value = N.state.ambient),
          (we.lightProbe.value = N.state.probe),
          (we.directionalLights.value = N.state.directional),
          (we.directionalLightShadows.value = N.state.directionalShadow),
          (we.spotLights.value = N.state.spot),
          (we.spotLightShadows.value = N.state.spotShadow),
          (we.rectAreaLights.value = N.state.rectArea),
          (we.ltc_1.value = N.state.rectAreaLTC1),
          (we.ltc_2.value = N.state.rectAreaLTC2),
          (we.pointLights.value = N.state.point),
          (we.pointLightShadows.value = N.state.pointShadow),
          (we.hemisphereLights.value = N.state.hemi),
          (we.directionalShadowMap.value = N.state.directionalShadowMap),
          (we.directionalShadowMatrix.value = N.state.directionalShadowMatrix),
          (we.spotShadowMap.value = N.state.spotShadowMap),
          (we.spotLightMatrix.value = N.state.spotLightMatrix),
          (we.spotLightMap.value = N.state.spotLightMap),
          (we.pointShadowMap.value = N.state.pointShadowMap),
          (we.pointShadowMatrix.value = N.state.pointShadowMatrix)),
        (k.currentProgram = De),
        (k.uniformsList = null),
        De
      );
    }
    function to(M) {
      if (M.uniformsList === null) {
        const I = M.currentProgram.getUniforms();
        M.uniformsList = zr.seqWithValue(I.seq, M.uniforms);
      }
      return M.uniformsList;
    }
    function no(M, I) {
      const B = Me.get(M);
      (B.outputColorSpace = I.outputColorSpace),
        (B.batching = I.batching),
        (B.batchingColor = I.batchingColor),
        (B.instancing = I.instancing),
        (B.instancingColor = I.instancingColor),
        (B.instancingMorph = I.instancingMorph),
        (B.skinning = I.skinning),
        (B.morphTargets = I.morphTargets),
        (B.morphNormals = I.morphNormals),
        (B.morphColors = I.morphColors),
        (B.morphTargetsCount = I.morphTargetsCount),
        (B.numClippingPlanes = I.numClippingPlanes),
        (B.numIntersection = I.numClipIntersection),
        (B.vertexAlphas = I.vertexAlphas),
        (B.vertexTangents = I.vertexTangents),
        (B.toneMapping = I.toneMapping);
    }
    function uc(M, I, B, k, N) {
      I.isScene !== !0 && (I = Te), Be.resetTextureUnits();
      const ee = I.fog,
        ce = k.isMeshStandardMaterial ? I.environment : null,
        ge =
          A === null ? y.outputColorSpace : A.isXRRenderTarget === !0 ? A.texture.colorSpace : Ci,
        de = (k.isMeshStandardMaterial ? ft : _t).get(k.envMap || ce),
        Ce = k.vertexColors === !0 && !!B.attributes.color && B.attributes.color.itemSize === 4,
        De = !!B.attributes.tangent && (!!k.normalMap || k.anisotropy > 0),
        we = !!B.morphAttributes.position,
        Ge = !!B.morphAttributes.normal,
        je = !!B.morphAttributes.color;
      let ht = Rn;
      k.toneMapped && (A === null || A.isXRRenderTarget === !0) && (ht = y.toneMapping);
      const it = B.morphAttributes.position || B.morphAttributes.normal || B.morphAttributes.color,
        et = it !== void 0 ? it.length : 0,
        Re = Me.get(k),
        lt = d.state.lights;
      if (Ke === !0 && ($ === !0 || M !== _)) {
        const Rt = M === _ && k.id === x;
        re.setState(k, M, Rt);
      }
      let $e = !1;
      k.version === Re.__version
        ? ((Re.needsLights && Re.lightsStateVersion !== lt.state.version) ||
            Re.outputColorSpace !== ge ||
            (N.isBatchedMesh && Re.batching === !1) ||
            (!N.isBatchedMesh && Re.batching === !0) ||
            (N.isBatchedMesh && Re.batchingColor === !0 && N.colorTexture === null) ||
            (N.isBatchedMesh && Re.batchingColor === !1 && N.colorTexture !== null) ||
            (N.isInstancedMesh && Re.instancing === !1) ||
            (!N.isInstancedMesh && Re.instancing === !0) ||
            (N.isSkinnedMesh && Re.skinning === !1) ||
            (!N.isSkinnedMesh && Re.skinning === !0) ||
            (N.isInstancedMesh && Re.instancingColor === !0 && N.instanceColor === null) ||
            (N.isInstancedMesh && Re.instancingColor === !1 && N.instanceColor !== null) ||
            (N.isInstancedMesh && Re.instancingMorph === !0 && N.morphTexture === null) ||
            (N.isInstancedMesh && Re.instancingMorph === !1 && N.morphTexture !== null) ||
            Re.envMap !== de ||
            (k.fog === !0 && Re.fog !== ee) ||
            (Re.numClippingPlanes !== void 0 &&
              (Re.numClippingPlanes !== re.numPlanes ||
                Re.numIntersection !== re.numIntersection)) ||
            Re.vertexAlphas !== Ce ||
            Re.vertexTangents !== De ||
            Re.morphTargets !== we ||
            Re.morphNormals !== Ge ||
            Re.morphColors !== je ||
            Re.toneMapping !== ht ||
            Re.morphTargetsCount !== et) &&
          ($e = !0)
        : (($e = !0), (Re.__version = k.version));
      let Nt = Re.currentProgram;
      $e === !0 && (Nt = ur(k, I, N));
      let ei = !1,
        Ft = !1,
        Oi = !1;
      const ct = Nt.getUniforms(),
        Ht = Re.uniforms;
      if (
        (xe.useProgram(Nt.program) && ((ei = !0), (Ft = !0), (Oi = !0)),
        k.id !== x && ((x = k.id), (Ft = !0)),
        ei || _ !== M)
      ) {
        xe.buffers.depth.getReversed() &&
          M.reversedDepth !== !0 &&
          ((M._reversedDepth = !0), M.updateProjectionMatrix()),
          ct.setValue(C, 'projectionMatrix', M.projectionMatrix),
          ct.setValue(C, 'viewMatrix', M.matrixWorldInverse);
        const It = ct.map.cameraPosition;
        It !== void 0 && It.setValue(C, me.setFromMatrixPosition(M.matrixWorld)),
          Le.logarithmicDepthBuffer &&
            ct.setValue(C, 'logDepthBufFC', 2 / (Math.log(M.far + 1) / Math.LN2)),
          (k.isMeshPhongMaterial ||
            k.isMeshToonMaterial ||
            k.isMeshLambertMaterial ||
            k.isMeshBasicMaterial ||
            k.isMeshStandardMaterial ||
            k.isShaderMaterial) &&
            ct.setValue(C, 'isOrthographic', M.isOrthographicCamera === !0),
          _ !== M && ((_ = M), (Ft = !0), (Oi = !0));
      }
      if (N.isSkinnedMesh) {
        ct.setOptional(C, N, 'bindMatrix'), ct.setOptional(C, N, 'bindMatrixInverse');
        const Rt = N.skeleton;
        Rt &&
          (Rt.boneTexture === null && Rt.computeBoneTexture(),
          ct.setValue(C, 'boneTexture', Rt.boneTexture, Be));
      }
      N.isBatchedMesh &&
        (ct.setOptional(C, N, 'batchingTexture'),
        ct.setValue(C, 'batchingTexture', N._matricesTexture, Be),
        ct.setOptional(C, N, 'batchingIdTexture'),
        ct.setValue(C, 'batchingIdTexture', N._indirectTexture, Be),
        ct.setOptional(C, N, 'batchingColorTexture'),
        N._colorsTexture !== null && ct.setValue(C, 'batchingColorTexture', N._colorsTexture, Be));
      const Gt = B.morphAttributes;
      if (
        ((Gt.position !== void 0 || Gt.normal !== void 0 || Gt.color !== void 0) &&
          te.update(N, B, Nt),
        (Ft || Re.receiveShadow !== N.receiveShadow) &&
          ((Re.receiveShadow = N.receiveShadow), ct.setValue(C, 'receiveShadow', N.receiveShadow)),
        k.isMeshGouraudMaterial &&
          k.envMap !== null &&
          ((Ht.envMap.value = de),
          (Ht.flipEnvMap.value = de.isCubeTexture && de.isRenderTargetTexture === !1 ? -1 : 1)),
        k.isMeshStandardMaterial &&
          k.envMap === null &&
          I.environment !== null &&
          (Ht.envMapIntensity.value = I.environmentIntensity),
        Ft &&
          (ct.setValue(C, 'toneMappingExposure', y.toneMappingExposure),
          Re.needsLights && dc(Ht, Oi),
          ee && k.fog === !0 && j.refreshFogUniforms(Ht, ee),
          j.refreshMaterialUniforms(Ht, k, H, Z, d.state.transmissionRenderTarget[M.id]),
          zr.upload(C, to(Re), Ht, Be)),
        k.isShaderMaterial &&
          k.uniformsNeedUpdate === !0 &&
          (zr.upload(C, to(Re), Ht, Be), (k.uniformsNeedUpdate = !1)),
        k.isSpriteMaterial && ct.setValue(C, 'center', N.center),
        ct.setValue(C, 'modelViewMatrix', N.modelViewMatrix),
        ct.setValue(C, 'normalMatrix', N.normalMatrix),
        ct.setValue(C, 'modelMatrix', N.matrixWorld),
        k.isShaderMaterial || k.isRawShaderMaterial)
      ) {
        const Rt = k.uniformsGroups;
        for (let It = 0, jr = Rt.length; It < jr; It++) {
          const Nn = Rt[It];
          Fe.update(Nn, Nt), Fe.bind(Nn, Nt);
        }
      }
      return Nt;
    }
    function dc(M, I) {
      (M.ambientLightColor.needsUpdate = I),
        (M.lightProbe.needsUpdate = I),
        (M.directionalLights.needsUpdate = I),
        (M.directionalLightShadows.needsUpdate = I),
        (M.pointLights.needsUpdate = I),
        (M.pointLightShadows.needsUpdate = I),
        (M.spotLights.needsUpdate = I),
        (M.spotLightShadows.needsUpdate = I),
        (M.rectAreaLights.needsUpdate = I),
        (M.hemisphereLights.needsUpdate = I);
    }
    function fc(M) {
      return (
        M.isMeshLambertMaterial ||
        M.isMeshToonMaterial ||
        M.isMeshPhongMaterial ||
        M.isMeshStandardMaterial ||
        M.isShadowMaterial ||
        (M.isShaderMaterial && M.lights === !0)
      );
    }
    (this.getActiveCubeFace = function () {
      return R;
    }),
      (this.getActiveMipmapLevel = function () {
        return L;
      }),
      (this.getRenderTarget = function () {
        return A;
      }),
      (this.setRenderTargetTextures = function (M, I, B) {
        const k = Me.get(M);
        (k.__autoAllocateDepthBuffer = M.resolveDepthBuffer === !1),
          k.__autoAllocateDepthBuffer === !1 && (k.__useRenderToTexture = !1),
          (Me.get(M.texture).__webglTexture = I),
          (Me.get(M.depthTexture).__webglTexture = k.__autoAllocateDepthBuffer ? void 0 : B),
          (k.__hasExternalTextures = !0);
      }),
      (this.setRenderTargetFramebuffer = function (M, I) {
        const B = Me.get(M);
        (B.__webglFramebuffer = I), (B.__useDefaultFramebuffer = I === void 0);
      });
    const pc = C.createFramebuffer();
    (this.setRenderTarget = function (M, I = 0, B = 0) {
      (A = M), (R = I), (L = B);
      let k = !0,
        N = null,
        ee = !1,
        ce = !1;
      if (M) {
        const de = Me.get(M);
        if (de.__useDefaultFramebuffer !== void 0)
          xe.bindFramebuffer(C.FRAMEBUFFER, null), (k = !1);
        else if (de.__webglFramebuffer === void 0) Be.setupRenderTarget(M);
        else if (de.__hasExternalTextures)
          Be.rebindTextures(
            M,
            Me.get(M.texture).__webglTexture,
            Me.get(M.depthTexture).__webglTexture,
          );
        else if (M.depthBuffer) {
          const we = M.depthTexture;
          if (de.__boundDepthTexture !== we) {
            if (
              we !== null &&
              Me.has(we) &&
              (M.width !== we.image.width || M.height !== we.image.height)
            )
              throw new Error(
                'WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.',
              );
            Be.setupDepthRenderbuffer(M);
          }
        }
        const Ce = M.texture;
        (Ce.isData3DTexture || Ce.isDataArrayTexture || Ce.isCompressedArrayTexture) && (ce = !0);
        const De = Me.get(M).__webglFramebuffer;
        M.isWebGLCubeRenderTarget
          ? (Array.isArray(De[I]) ? (N = De[I][B]) : (N = De[I]), (ee = !0))
          : M.samples > 0 && Be.useMultisampledRTT(M) === !1
            ? (N = Me.get(M).__webglMultisampledFramebuffer)
            : Array.isArray(De)
              ? (N = De[B])
              : (N = De),
          w.copy(M.viewport),
          U.copy(M.scissor),
          (z = M.scissorTest);
      } else w.copy(Ae).multiplyScalar(H).floor(), U.copy(He).multiplyScalar(H).floor(), (z = tt);
      if (
        (B !== 0 && (N = pc),
        xe.bindFramebuffer(C.FRAMEBUFFER, N) && k && xe.drawBuffers(M, N),
        xe.viewport(w),
        xe.scissor(U),
        xe.setScissorTest(z),
        ee)
      ) {
        const de = Me.get(M.texture);
        C.framebufferTexture2D(
          C.FRAMEBUFFER,
          C.COLOR_ATTACHMENT0,
          C.TEXTURE_CUBE_MAP_POSITIVE_X + I,
          de.__webglTexture,
          B,
        );
      } else if (ce) {
        const de = I;
        for (let Ce = 0; Ce < M.textures.length; Ce++) {
          const De = Me.get(M.textures[Ce]);
          C.framebufferTextureLayer(
            C.FRAMEBUFFER,
            C.COLOR_ATTACHMENT0 + Ce,
            De.__webglTexture,
            B,
            de,
          );
        }
      } else if (M !== null && B !== 0) {
        const de = Me.get(M.texture);
        C.framebufferTexture2D(
          C.FRAMEBUFFER,
          C.COLOR_ATTACHMENT0,
          C.TEXTURE_2D,
          de.__webglTexture,
          B,
        );
      }
      x = -1;
    }),
      (this.readRenderTargetPixels = function (M, I, B, k, N, ee, ce, ge = 0) {
        if (!(M && M.isWebGLRenderTarget)) {
          console.error(
            'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.',
          );
          return;
        }
        let de = Me.get(M).__webglFramebuffer;
        if ((M.isWebGLCubeRenderTarget && ce !== void 0 && (de = de[ce]), de)) {
          xe.bindFramebuffer(C.FRAMEBUFFER, de);
          try {
            const Ce = M.textures[ge],
              De = Ce.format,
              we = Ce.type;
            if (!Le.textureFormatReadable(De)) {
              console.error(
                'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.',
              );
              return;
            }
            if (!Le.textureTypeReadable(we)) {
              console.error(
                'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.',
              );
              return;
            }
            I >= 0 &&
              I <= M.width - k &&
              B >= 0 &&
              B <= M.height - N &&
              (M.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + ge),
              C.readPixels(I, B, k, N, be.convert(De), be.convert(we), ee));
          } finally {
            const Ce = A !== null ? Me.get(A).__webglFramebuffer : null;
            xe.bindFramebuffer(C.FRAMEBUFFER, Ce);
          }
        }
      }),
      (this.readRenderTargetPixelsAsync = async function (M, I, B, k, N, ee, ce, ge = 0) {
        if (!(M && M.isWebGLRenderTarget))
          throw new Error(
            'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.',
          );
        let de = Me.get(M).__webglFramebuffer;
        if ((M.isWebGLCubeRenderTarget && ce !== void 0 && (de = de[ce]), de))
          if (I >= 0 && I <= M.width - k && B >= 0 && B <= M.height - N) {
            xe.bindFramebuffer(C.FRAMEBUFFER, de);
            const Ce = M.textures[ge],
              De = Ce.format,
              we = Ce.type;
            if (!Le.textureFormatReadable(De))
              throw new Error(
                'THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.',
              );
            if (!Le.textureTypeReadable(we))
              throw new Error(
                'THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.',
              );
            const Ge = C.createBuffer();
            C.bindBuffer(C.PIXEL_PACK_BUFFER, Ge),
              C.bufferData(C.PIXEL_PACK_BUFFER, ee.byteLength, C.STREAM_READ),
              M.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + ge),
              C.readPixels(I, B, k, N, be.convert(De), be.convert(we), 0);
            const je = A !== null ? Me.get(A).__webglFramebuffer : null;
            xe.bindFramebuffer(C.FRAMEBUFFER, je);
            const ht = C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return (
              C.flush(),
              await xh(C, ht, 4),
              C.bindBuffer(C.PIXEL_PACK_BUFFER, Ge),
              C.getBufferSubData(C.PIXEL_PACK_BUFFER, 0, ee),
              C.deleteBuffer(Ge),
              C.deleteSync(ht),
              ee
            );
          } else
            throw new Error(
              'THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.',
            );
      }),
      (this.copyFramebufferToTexture = function (M, I = null, B = 0) {
        const k = Math.pow(2, -B),
          N = Math.floor(M.image.width * k),
          ee = Math.floor(M.image.height * k),
          ce = I !== null ? I.x : 0,
          ge = I !== null ? I.y : 0;
        Be.setTexture2D(M, 0),
          C.copyTexSubImage2D(C.TEXTURE_2D, B, 0, 0, ce, ge, N, ee),
          xe.unbindTexture();
      });
    const mc = C.createFramebuffer(),
      gc = C.createFramebuffer();
    (this.copyTextureToTexture = function (M, I, B = null, k = null, N = 0, ee = null) {
      ee === null &&
        (N !== 0
          ? (er(
              'WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.',
            ),
            (ee = N),
            (N = 0))
          : (ee = 0));
      let ce, ge, de, Ce, De, we, Ge, je, ht;
      const it = M.isCompressedTexture ? M.mipmaps[ee] : M.image;
      if (B !== null)
        (ce = B.max.x - B.min.x),
          (ge = B.max.y - B.min.y),
          (de = B.isBox3 ? B.max.z - B.min.z : 1),
          (Ce = B.min.x),
          (De = B.min.y),
          (we = B.isBox3 ? B.min.z : 0);
      else {
        const Gt = Math.pow(2, -N);
        (ce = Math.floor(it.width * Gt)),
          (ge = Math.floor(it.height * Gt)),
          M.isDataArrayTexture
            ? (de = it.depth)
            : M.isData3DTexture
              ? (de = Math.floor(it.depth * Gt))
              : (de = 1),
          (Ce = 0),
          (De = 0),
          (we = 0);
      }
      k !== null ? ((Ge = k.x), (je = k.y), (ht = k.z)) : ((Ge = 0), (je = 0), (ht = 0));
      const et = be.convert(I.format),
        Re = be.convert(I.type);
      let lt;
      I.isData3DTexture
        ? (Be.setTexture3D(I, 0), (lt = C.TEXTURE_3D))
        : I.isDataArrayTexture || I.isCompressedArrayTexture
          ? (Be.setTexture2DArray(I, 0), (lt = C.TEXTURE_2D_ARRAY))
          : (Be.setTexture2D(I, 0), (lt = C.TEXTURE_2D)),
        C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL, I.flipY),
        C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha),
        C.pixelStorei(C.UNPACK_ALIGNMENT, I.unpackAlignment);
      const $e = C.getParameter(C.UNPACK_ROW_LENGTH),
        Nt = C.getParameter(C.UNPACK_IMAGE_HEIGHT),
        ei = C.getParameter(C.UNPACK_SKIP_PIXELS),
        Ft = C.getParameter(C.UNPACK_SKIP_ROWS),
        Oi = C.getParameter(C.UNPACK_SKIP_IMAGES);
      C.pixelStorei(C.UNPACK_ROW_LENGTH, it.width),
        C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, it.height),
        C.pixelStorei(C.UNPACK_SKIP_PIXELS, Ce),
        C.pixelStorei(C.UNPACK_SKIP_ROWS, De),
        C.pixelStorei(C.UNPACK_SKIP_IMAGES, we);
      const ct = M.isDataArrayTexture || M.isData3DTexture,
        Ht = I.isDataArrayTexture || I.isData3DTexture;
      if (M.isDepthTexture) {
        const Gt = Me.get(M),
          Rt = Me.get(I),
          It = Me.get(Gt.__renderTarget),
          jr = Me.get(Rt.__renderTarget);
        xe.bindFramebuffer(C.READ_FRAMEBUFFER, It.__webglFramebuffer),
          xe.bindFramebuffer(C.DRAW_FRAMEBUFFER, jr.__webglFramebuffer);
        for (let Nn = 0; Nn < de; Nn++)
          ct &&
            (C.framebufferTextureLayer(
              C.READ_FRAMEBUFFER,
              C.COLOR_ATTACHMENT0,
              Me.get(M).__webglTexture,
              N,
              we + Nn,
            ),
            C.framebufferTextureLayer(
              C.DRAW_FRAMEBUFFER,
              C.COLOR_ATTACHMENT0,
              Me.get(I).__webglTexture,
              ee,
              ht + Nn,
            )),
            C.blitFramebuffer(Ce, De, ce, ge, Ge, je, ce, ge, C.DEPTH_BUFFER_BIT, C.NEAREST);
        xe.bindFramebuffer(C.READ_FRAMEBUFFER, null), xe.bindFramebuffer(C.DRAW_FRAMEBUFFER, null);
      } else if (N !== 0 || M.isRenderTargetTexture || Me.has(M)) {
        const Gt = Me.get(M),
          Rt = Me.get(I);
        xe.bindFramebuffer(C.READ_FRAMEBUFFER, mc), xe.bindFramebuffer(C.DRAW_FRAMEBUFFER, gc);
        for (let It = 0; It < de; It++)
          ct
            ? C.framebufferTextureLayer(
                C.READ_FRAMEBUFFER,
                C.COLOR_ATTACHMENT0,
                Gt.__webglTexture,
                N,
                we + It,
              )
            : C.framebufferTexture2D(
                C.READ_FRAMEBUFFER,
                C.COLOR_ATTACHMENT0,
                C.TEXTURE_2D,
                Gt.__webglTexture,
                N,
              ),
            Ht
              ? C.framebufferTextureLayer(
                  C.DRAW_FRAMEBUFFER,
                  C.COLOR_ATTACHMENT0,
                  Rt.__webglTexture,
                  ee,
                  ht + It,
                )
              : C.framebufferTexture2D(
                  C.DRAW_FRAMEBUFFER,
                  C.COLOR_ATTACHMENT0,
                  C.TEXTURE_2D,
                  Rt.__webglTexture,
                  ee,
                ),
            N !== 0
              ? C.blitFramebuffer(Ce, De, ce, ge, Ge, je, ce, ge, C.COLOR_BUFFER_BIT, C.NEAREST)
              : Ht
                ? C.copyTexSubImage3D(lt, ee, Ge, je, ht + It, Ce, De, ce, ge)
                : C.copyTexSubImage2D(lt, ee, Ge, je, Ce, De, ce, ge);
        xe.bindFramebuffer(C.READ_FRAMEBUFFER, null), xe.bindFramebuffer(C.DRAW_FRAMEBUFFER, null);
      } else
        Ht
          ? M.isDataTexture || M.isData3DTexture
            ? C.texSubImage3D(lt, ee, Ge, je, ht, ce, ge, de, et, Re, it.data)
            : I.isCompressedArrayTexture
              ? C.compressedTexSubImage3D(lt, ee, Ge, je, ht, ce, ge, de, et, it.data)
              : C.texSubImage3D(lt, ee, Ge, je, ht, ce, ge, de, et, Re, it)
          : M.isDataTexture
            ? C.texSubImage2D(C.TEXTURE_2D, ee, Ge, je, ce, ge, et, Re, it.data)
            : M.isCompressedTexture
              ? C.compressedTexSubImage2D(
                  C.TEXTURE_2D,
                  ee,
                  Ge,
                  je,
                  it.width,
                  it.height,
                  et,
                  it.data,
                )
              : C.texSubImage2D(C.TEXTURE_2D, ee, Ge, je, ce, ge, et, Re, it);
      C.pixelStorei(C.UNPACK_ROW_LENGTH, $e),
        C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, Nt),
        C.pixelStorei(C.UNPACK_SKIP_PIXELS, ei),
        C.pixelStorei(C.UNPACK_SKIP_ROWS, Ft),
        C.pixelStorei(C.UNPACK_SKIP_IMAGES, Oi),
        ee === 0 && I.generateMipmaps && C.generateMipmap(lt),
        xe.unbindTexture();
    }),
      (this.initRenderTarget = function (M) {
        Me.get(M).__webglFramebuffer === void 0 && Be.setupRenderTarget(M);
      }),
      (this.initTexture = function (M) {
        M.isCubeTexture
          ? Be.setTextureCube(M, 0)
          : M.isData3DTexture
            ? Be.setTexture3D(M, 0)
            : M.isDataArrayTexture || M.isCompressedArrayTexture
              ? Be.setTexture2DArray(M, 0)
              : Be.setTexture2D(M, 0),
          xe.unbindTexture();
      }),
      (this.resetState = function () {
        (R = 0), (L = 0), (A = null), xe.reset(), le.reset();
      }),
      typeof __THREE_DEVTOOLS__ < 'u' &&
        __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this }));
  }
  get coordinateSystem() {
    return sn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    (t.drawingBufferColorSpace = Ye._getDrawingBufferColorSpace(e)),
      (t.unpackColorSpace = Ye._getUnpackColorSpace());
  }
}
function Wm(i, e = !1) {
  const t = i[0].index !== null,
    n = new Set(Object.keys(i[0].attributes)),
    r = new Set(Object.keys(i[0].morphAttributes)),
    s = {},
    a = {},
    o = i[0].morphTargetsRelative,
    l = new Jt();
  let c = 0;
  for (let u = 0; u < i.length; ++u) {
    const h = i[u];
    let f = 0;
    if (t !== (h.index !== null))
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            u +
            '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.',
        ),
        null
      );
    for (const m in h.attributes) {
      if (!n.has(m))
        return (
          console.error(
            'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
              u +
              '. All geometries must have compatible attributes; make sure "' +
              m +
              '" attribute exists among all geometries, or in none of them.',
          ),
          null
        );
      s[m] === void 0 && (s[m] = []), s[m].push(h.attributes[m]), f++;
    }
    if (f !== n.size)
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            u +
            '. Make sure all geometries have the same number of attributes.',
        ),
        null
      );
    if (o !== h.morphTargetsRelative)
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            u +
            '. .morphTargetsRelative must be consistent throughout all geometries.',
        ),
        null
      );
    for (const m in h.morphAttributes) {
      if (!r.has(m))
        return (
          console.error(
            'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
              u +
              '.  .morphAttributes must be consistent throughout all geometries.',
          ),
          null
        );
      a[m] === void 0 && (a[m] = []), a[m].push(h.morphAttributes[m]);
    }
    if (e) {
      let m;
      if (t) m = h.index.count;
      else if (h.attributes.position !== void 0) m = h.attributes.position.count;
      else
        return (
          console.error(
            'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
              u +
              '. The geometry must have either an index or a position attribute',
          ),
          null
        );
      l.addGroup(c, m, u), (c += m);
    }
  }
  if (t) {
    let u = 0;
    const h = [];
    for (let f = 0; f < i.length; ++f) {
      const m = i[f].index;
      for (let g = 0; g < m.count; ++g) h.push(m.getX(g) + u);
      u += i[f].attributes.position.count;
    }
    l.setIndex(h);
  }
  for (const u in s) {
    const h = ol(s[u]);
    if (!h)
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ' +
            u +
            ' attribute.',
        ),
        null
      );
    l.setAttribute(u, h);
  }
  for (const u in a) {
    const h = a[u][0].length;
    if (h === 0) break;
    (l.morphAttributes = l.morphAttributes || {}), (l.morphAttributes[u] = []);
    for (let f = 0; f < h; ++f) {
      const m = [];
      for (let S = 0; S < a[u].length; ++S) m.push(a[u][S][f]);
      const g = ol(m);
      if (!g)
        return (
          console.error(
            'THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ' +
              u +
              ' morphAttribute.',
          ),
          null
        );
      l.morphAttributes[u].push(g);
    }
  }
  return l;
}
function ol(i) {
  let e,
    t,
    n,
    r = -1,
    s = 0;
  for (let c = 0; c < i.length; ++c) {
    const u = i[c];
    if ((e === void 0 && (e = u.array.constructor), e !== u.array.constructor))
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.',
        ),
        null
      );
    if ((t === void 0 && (t = u.itemSize), t !== u.itemSize))
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.',
        ),
        null
      );
    if ((n === void 0 && (n = u.normalized), n !== u.normalized))
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.',
        ),
        null
      );
    if ((r === -1 && (r = u.gpuType), r !== u.gpuType))
      return (
        console.error(
          'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.',
        ),
        null
      );
    s += u.count * t;
  }
  const a = new e(s),
    o = new kt(a, t, n);
  let l = 0;
  for (let c = 0; c < i.length; ++c) {
    const u = i[c];
    if (u.isInterleavedBufferAttribute) {
      const h = l / t;
      for (let f = 0, m = u.count; f < m; f++)
        for (let g = 0; g < t; g++) {
          const S = u.getComponent(f, g);
          o.setComponent(f + h, g, S);
        }
    } else a.set(u.array, l);
    l += u.count * t;
  }
  return r !== void 0 && (o.gpuType = r), o;
}
