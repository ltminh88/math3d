// Legacy chunk "config" (recovered, mechanically split). Do not hand-edit; swap via shims/config.js.

const Ha = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const Kl = 'aigame3d_multiplication_save';
const yt = 6;
const Sa = [0, 100, 250, 450, 700];
const Qe = {
  riverMin: 4,
  riverMax: 10,
  bridgeWidth: 3.4,
};
const kr = (i) => 1 + Sa.slice(1).filter((e) => i >= e).length;
const fe = {
  west: {
    minX: -50,
    maxX: Qe.riverMin,
  },
  east: {
    minX: Qe.riverMax,
    maxX: 70,
  },
  minZ: -44,
  maxZ: 44,
  margin: 2.2,
};
const Dt = [
  {
    id: 'village',
    blurb: 'Nơi Milo và bạn bắt đầu hành trình.',
    name: 'Làng Khởi Đầu',
    subtitle: 'KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH',
    world: 1,
    center: [-13, 0],
    size: [34, 40],
    labelHeight: 6,
    color: '#8ec963',
    icon: '🏡',
    unlock: 'start',
  },
  {
    id: 'garden',
    blurb: 'Khu vườn bên kia Cây cầu tình bạn.',
    name: 'Khu Vườn Bên Sông',
    subtitle: 'ĐÍCH ĐẾN CỦA CÂY CẦU',
    world: 1,
    center: [17, -2],
    size: [12, 16],
    labelHeight: 5,
    color: '#c9dd7c',
    icon: '🌻',
    unlock: 'start',
  },
  {
    id: 'meadow',
    blurb: 'Ruộng phép tính và cổng vào thế giới thứ hai.',
    name: 'Cánh Đồng Phép Tính',
    subtitle: 'THẾ GIỚI 02',
    world: 2,
    center: [36, -20],
    size: [18, 14],
    labelHeight: 5,
    color: '#e4c46f',
    icon: '🌾',
    unlock: 'bridge',
  },
  {
    id: 'forest',
    blurb: 'Khu rừng rậm của phép nhân và phép chia.',
    name: 'Rừng Nhân Chia',
    subtitle: 'THẾ GIỚI 03',
    world: 3,
    center: [34, 22],
    size: [20, 16],
    labelHeight: 6,
    color: '#4f9a62',
    icon: '🌲',
    unlock: 'bridge',
  },
  {
    id: 'city',
    blurb: 'Những tòa nhà mang số và quảng trường đài phun nước.',
    name: 'Thành Phố Con Số',
    subtitle: 'THẾ GIỚI 04',
    world: 4,
    center: [57, 20],
    size: [18, 18],
    labelHeight: 8,
    color: '#8fb3c9',
    icon: '🏙️',
    unlock: 'bridge',
  },
  {
    id: 'tower',
    blurb: 'Ngọn tháp cao nhất, nơi những viên đá số lơ lửng.',
    name: 'Tháp Toán Học',
    subtitle: 'THẾ GIỚI 05',
    world: 5,
    center: [57, -22],
    size: [14, 14],
    labelHeight: 13,
    color: '#9b92cf',
    icon: '🗼',
    unlock: 'bridge',
  },
];
const Wr = [
  [
    [-17.5, 1],
    [3.5, 1],
  ],
  [
    [-10, -14],
    [-10, 6],
  ],
  [
    [10, 0],
    [22, 0],
    [46, 0],
  ],
  [
    [46, 0],
    [57, -15],
  ],
  [
    [46, 0],
    [57, 11],
  ],
  [
    [30, 0],
    [36, -13],
  ],
  [
    [30, 0],
    [34, 14],
  ],
  [
    [-17.5, 1],
    [-33, -1],
    [-36, -7],
  ],
  [
    [-33, -1],
    [-40, 14],
  ],
];
const Xm = (i, e) => {
  for (const t of Dt) {
    if (
      t.id !== 'village' &&
      Math.abs(i - t.center[0]) <= t.size[0] / 2 + 1 &&
      Math.abs(e - t.center[1]) <= t.size[1] / 2 + 1
    ) {
      return t;
    }
  }
  if (i < Qe.riverMin) {
    return Dt[0];
  }
  return Dt.slice(1).reduce((t, n) => {
    if (
      Math.hypot(i - n.center[0], e - n.center[1]) < Math.hypot(i - t.center[0], e - t.center[1])
    ) {
      return n;
    }
    return t;
  });
};
const Di = (i, e) => i.unlock === 'start' || e;
const qm = 7651302;
const Cs = 13954796;
const Ps = (i) => Dt.find((e) => e.id === i);

export { Cs, Di, Dt, Ha, Kl, Ps, Qe, Sa, Wr, Xm, fe, kr, qm, yt };
