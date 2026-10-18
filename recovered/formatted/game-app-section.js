const Ha = [2, 3, 4, 5, 6, 7, 8, 9, 10],
  Kl = 'aigame3d_multiplication_save',
  yt = 6,
  Sa = [0, 100, 250, 450, 700],
  Qe = { riverMin: 4, riverMax: 10, bridgeWidth: 3.4 },
  kr = (i) => 1 + Sa.slice(1).filter((e) => i >= e).length,
  fe = {
    west: { minX: -50, maxX: Qe.riverMin },
    east: { minX: Qe.riverMax, maxX: 70 },
    minZ: -44,
    maxZ: 44,
    margin: 2.2,
  },
  Dt = [
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
  ],
  Wr = [
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
  ],
  Xm = (i, e) => {
    for (const t of Dt)
      if (
        t.id !== 'village' &&
        Math.abs(i - t.center[0]) <= t.size[0] / 2 + 1 &&
        Math.abs(e - t.center[1]) <= t.size[1] / 2 + 1
      )
        return t;
    return i < Qe.riverMin
      ? Dt[0]
      : Dt.slice(1).reduce((t, n) =>
          Math.hypot(i - n.center[0], e - n.center[1]) <
          Math.hypot(i - t.center[0], e - t.center[1])
            ? n
            : t,
        );
  },
  Di = (i, e) => i.unlock === 'start' || e,
  qm = 7651302,
  Cs = 13954796,
  Ps = (i) => Dt.find((e) => e.id === i);
class $m {
  constructor(e) {
    (this.canvas = e),
      (this.renderer = new Vm({
        canvas: e,
        antialias: !0,
        alpha: !1,
        powerPreference: 'high-performance',
      })),
      (this.lowPower = matchMedia('(max-width: 900px), (pointer: coarse)').matches),
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.lowPower ? 1.25 : 1.75)),
      (this.renderer.shadowMap.enabled = !0),
      (this.renderer.shadowMap.type = _l),
      (this.renderer.outputColorSpace = Ut),
      (this.renderer.toneMapping = xl),
      (this.renderer.toneMappingExposure = 1.12),
      this.renderer.setClearColor(Cs),
      (this.scene.fog = new Na(Cs, 150, 560)),
      this.scene.add(new Qh(15924223, 6059612, 2.6)),
      (this.sun = new nu(16773321, 3.2)),
      (this.sun.castShadow = !0);
    const t = this.lowPower ? 1024 : 2048;
    this.sun.shadow.mapSize.set(t, t),
      (this.sun.shadow.normalBias = 0.045),
      (this.sun.shadow.bias = -3e-4),
      this.scene.add(this.sun, this.sun.target),
      (this.sky = this.createSky()),
      this.scene.add(this.sky),
      this.terrain(),
      this.village(),
      this.garden(),
      this.mathMeadow(),
      this.forest(),
      this.city(),
      this.tower(),
      this.westBank(),
      this.createPlayer(),
      this.createMilo(),
      this.createBridge(),
      this.scatter(),
      this.decorate(),
      this.scene.add(this.player, this.milo, this.bridge),
      this.mergeStatic(),
      this.player.position.set(-6, 0, 6),
      this.milo.position.set(-3, 0, 1.5),
      this.obstacles.push({ x: -3, z: 1.5, radius: 0.85 }),
      (this.observer = new ResizeObserver(() => this.resize())),
      this.observer.observe(e.parentElement),
      this.resize();
    let n = { x: 0, y: 0, moved: !1, id: -1 };
    e.addEventListener('pointerdown', (r) => {
      !this.active ||
        this.paused ||
        ((n = { x: r.clientX, y: r.clientY, moved: !1, id: r.pointerId }),
        e.setPointerCapture(r.pointerId));
    }),
      e.addEventListener('pointermove', (r) => {
        if (n.id !== r.pointerId || !this.active || this.paused) return;
        const s = r.clientX - n.x,
          a = r.clientY - n.y;
        Math.abs(s) + Math.abs(a) > 2 && (n.moved = !0),
          (this.yaw -= s * 0.006),
          (this.pitch = fr.clamp(this.pitch + a * 0.003, 0.5, 1.35)),
          (n.x = r.clientX),
          (n.y = r.clientY);
      }),
      e.addEventListener('pointerup', (r) => {
        n.id === r.pointerId &&
          (!n.moved && !this.paused && this.moveToScreen(r.clientX, r.clientY), (n.id = -1));
      }),
      e.addEventListener('pointercancel', () => {
        n.id = -1;
      }),
      e.addEventListener(
        'wheel',
        (r) => {
          !this.active || this.paused || (r.preventDefault(), this.zoom(r.deltaY * 0.045));
        },
        { passive: !1 },
      ),
      this.animate();
  }
  canvas;
  renderer;
  scene = new Wh();
  camera = new Wt(48, 1, 0.5, 1600);
  player = new ut();
  milo = new ut();
  bridge = new ut();
  goal = new F(16, 0, 0);
  keys = new Set();
  materials = new Map();
  obstacles = [];
  sparks = [];
  floaters = [];
  clouds = [];
  ripples = [];
  windmill = new ut();
  sun;
  sky;
  legs = [];
  shirt;
  hair;
  ponytail;
  clock = new ru();
  target = new F(8, 0, 0);
  wanted = new F();
  destination;
  jumpVelocity = 0;
  yaw = 0.57;
  pitch = 0.95;
  distance = 42;
  viewPitch = 0.85;
  viewDistance = 130;
  shadowSize = 0;
  viewShift = 0;
  bridgeCount = 0;
  time = 0;
  observer;
  frame = 0;
  lowPower;
  active = !1;
  paused = !1;
  joystick = { x: 0, y: 0 };
  onFrame;
  onJump;
  onSceneClick;
  material(e) {
    let t = this.materials.get(e);
    return (
      t || ((t = new Ss({ color: e, roughness: 0.9, metalness: 0 })), this.materials.set(e, t)), t
    );
  }
  mesh(e, t, n, r, s, a) {
    const o = new St(t, this.material(n));
    return o.position.set(r, s, a), (o.castShadow = !0), (o.receiveShadow = !0), e.add(o), o;
  }
  box(e, t, n, r, s, a, o, l) {
    return this.mesh(e, new Ni(s, a, o), l, t, n, r);
  }
  sphere(e, t, n, r, s, a) {
    return this.mesh(e, new Yi(s, 1), a, t, n, r);
  }
  cylinder(e, t, n, r, s, a, o, l, c = 8) {
    return this.mesh(e, new tr(s, a, o, c), l, t, n, r);
  }
  block(e, t, n, r) {
    this.obstacles.push({ x: e.position.x + t, z: e.position.z + n, radius: r });
  }
  regionGroup(e) {
    const t = Ps(e),
      n = new ut();
    return n.position.set(t.center[0], 0, t.center[1]), this.scene.add(n), n;
  }
  sign(e, t, n, r, s, a, o = '#fffbea', l = '#194f42', c = 0) {
    const u = document.createElement('canvas');
    (u.width = 256), (u.height = 128);
    const h = u.getContext('2d');
    (h.fillStyle = o),
      h.beginPath(),
      h.roundRect(4, 4, 248, 120, 26),
      h.fill(),
      (h.fillStyle = l),
      (h.font = '900 76px "Baloo 2", "Trebuchet MS", sans-serif'),
      (h.textAlign = 'center'),
      (h.textBaseline = 'middle'),
      h.fillText(t, 128, 70);
    const f = new Zh(u);
    (f.colorSpace = Ut), (f.anisotropy = 4);
    const m = new St(
      new Li(a, a / 2),
      new Ss({ map: f, transparent: !0, roughness: 0.8, side: tn }),
    );
    return m.position.set(n, r, s), (m.rotation.y = c), e.add(m), m;
  }
  createSky() {
    const e = new gn({
        side: Lt,
        depthWrite: !1,
        fog: !1,
        uniforms: { top: { value: new ke(qm) }, horizon: { value: new ke(Cs) } },
        vertexShader:
          'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying vec3 vDir; void main(){ float h = smoothstep(0.0, 0.55, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
      }),
      t = new St(new za(1200, 32, 16), e);
    return (t.renderOrder = -1), (t.frustumCulled = !1), t;
  }
  groundHeight(e, t) {
    const n = Math.max(fe.west.minX - e, e - fe.east.maxX, 0),
      r = Math.max(fe.minZ - t, t - fe.maxZ, 0),
      s = Math.hypot(n, r);
    if (s < 8) return 0;
    const a = fr.clamp((Math.abs(e - 7) - 7) / 24, 0, 1),
      o = (Math.sin(e * 0.045) + Math.sin(t * 0.06 + 1.3) + Math.sin((e + t) * 0.025 + 2) + 3) / 6;
    return Math.min(1, (s - 8) / 70) * a * (3 + o * 20);
  }
  terrain() {
    const e = new Li(2400, 2400, 200, 200);
    e.rotateX(-Math.PI / 2);
    const t = e.attributes.position,
      n = new Float32Array(t.count * 3),
      r = new ke(),
      s = new ke(9357667),
      a = new ke(11128682),
      o = new ke(7319125);
    for (let h = 0; h < t.count; h++) {
      const f = t.getX(h),
        m = t.getZ(h),
        g = this.groundHeight(f, m);
      t.setY(h, g);
      const S = (Math.sin(f * 0.13 + m * 0.07) + Math.sin(m * 0.11 - f * 0.05)) * 0.25 + 0.5;
      r
        .copy(s)
        .lerp(S > 0.5 ? a : o, Math.abs(S - 0.5) * 1.4)
        .lerp(o, Math.min(0.5, g / 30)),
        n.set([r.r, r.g, r.b], h * 3);
    }
    e.setAttribute('color', new kt(n, 3)), e.computeVertexNormals();
    const l = new St(e, new Ss({ vertexColors: !0, roughness: 0.95, flatShading: !0 }));
    (l.receiveShadow = !0), this.scene.add(l);
    const c = 900,
      u = this.box(
        this.scene,
        (Qe.riverMin + Qe.riverMax) / 2,
        -0.33,
        0,
        Qe.riverMax - Qe.riverMin,
        0.74,
        c,
        4765903,
      );
    u.castShadow = !1;
    for (const h of [Qe.riverMin - 0.45, Qe.riverMax + 0.45]) {
      const f = this.box(this.scene, h, 0.012, 0, 0.9, 0.03, c, 14469528);
      f.castShadow = !1;
    }
    for (let h = 0; h < 60; h++) {
      const f = this.box(
        this.scene,
        4.7 + (h % 4) * 1.35,
        0.05,
        -42 + ((h * 2.17) % 84),
        0.35 + (h % 3) * 0.2,
        0.025,
        0.07,
        11924717,
      );
      (f.castShadow = !1), this.ripples.push(f);
    }
    this.box(this.scene, -7, 0.055, 1, 21, 0.08, 3.2, 15390115),
      this.box(this.scene, -10, 0.055, -4, 3.1, 0.08, 20, 15390115),
      this.cylinder(this.scene, -6, 0.07, 5, 4.5, 4.5, 0.1, 15390115, 24);
    for (const h of Wr.slice(2)) for (let f = 1; f < h.length; f++) this.road(h[f - 1], h[f]);
    for (let h = 0; h < 15; h++) {
      const f = this.box(
        this.scene,
        -16 + h * 1.3,
        0.12,
        1 + Math.sin(h) * 0.8,
        0.65,
        0.08,
        0.4,
        16116170,
      );
      f.rotation.y = h;
    }
  }
  road([e, t], [n, r]) {
    const s = n - e,
      a = r - t,
      o = Math.hypot(s, a),
      l = this.box(this.scene, (e + n) / 2, 0.05, (t + r) / 2, 3, 0.07, o, 15390115);
    (l.rotation.y = Math.atan2(s, a)), (l.castShadow = !1);
    for (const [c, u] of [
      [e, t],
      [n, r],
    ]) {
      const h = this.cylinder(this.scene, c, 0.052, u, 1.5, 1.5, 0.07, 15390115, 16);
      h.castShadow = !1;
    }
  }
  house(e, t, n, r = 1, s = 0) {
    const a = new ut();
    a.position.set(e, 0, t),
      a.scale.setScalar(r),
      (a.rotation.y = s),
      this.box(a, 0, 1.5, 0, 3.6, 3, 3, 16773326);
    const o = this.cylinder(a, 0, 3.5, 0, 0, 3.1, 2, n, 4);
    (o.rotation.y = Math.PI / 4),
      (o.scale.z = 0.95),
      this.box(a, -0.85, 4.15, -0.65, 0.5, 1.5, 0.6, 15320736),
      this.box(a, -0.35, 0.95, 1.53, 0.9, 1.9, 0.15, 8608577),
      this.box(a, 1, 1.55, 1.53, 0.8, 0.8, 0.12, 5084579),
      this.box(a, 1, 1.55, 1.61, 0.08, 0.84, 0.07, 16777215),
      this.box(a, 1, 1.55, 1.61, 0.84, 0.08, 0.07, 16777215),
      this.box(a, 1, 1.02, 1.7, 1.1, 0.22, 0.4, 10381892);
    for (let l = 0; l < 4; l++)
      this.sphere(a, 0.63 + l * 0.25, 1.23, 1.7, 0.18, l % 2 ? 16764504 : 15830657);
    this.box(a, 0, 0.12, 1.85, 2.3, 0.25, 0.8, 14075041),
      this.scene.add(a),
      this.obstacles.push({ x: e, z: t, radius: 2.35 * r });
  }
  tree(e, t, n, r = 0) {
    const s = new ut();
    s.position.set(e, 0, t),
      s.scale.setScalar(n),
      this.cylinder(s, 0, 1.1, 0, 0.18, 0.26, 2.2, 9726787);
    const a = [3969888, 5678173, 7779153];
    if (r % 3 === 0)
      this.cylinder(s, 0, 2.35, 0, 0, 1.35, 2.3, a[r % 3]),
        this.cylinder(s, 0, 3.35, 0, 0, 1, 1.9, 6401385);
    else if (
      (this.sphere(s, 0, 2.7, 0, 1.35, a[r % 3]),
      this.sphere(s, -0.7, 2.25, 0.25, 0.9, a[(r + 1) % 3]),
      this.sphere(s, 0.6, 2.7, 0.3, 0.8, 8503138),
      r % 4 === 0)
    )
      for (let o = 0; o < 4; o++)
        this.sphere(s, Math.cos(o * 2) * 0.8, 2.4 + Math.sin(o) * 0.4, 0.85, 0.17, 15967300);
    this.scene.add(s), this.obstacles.push({ x: e, z: t, radius: 0.45 * n });
  }
  village() {
    this.house(-12, -6, 14191701, 1.25),
      this.house(-17, 6, 5410705, 0.9, 0.25),
      this.house(-4, -11, 12415075, 1);
    const e = new ut();
    e.position.set(-15, 0, -14),
      this.cylinder(e, 0, 2, 0, 1.2, 1.6, 4, 15851443),
      this.cylinder(e, 0, 4.7, 0, 0, 1.8, 1.9, 5476749),
      this.windmill.position.set(0, 3.2, 1.65);
    for (let n = 0; n < 4; n++) {
      const r = new ut();
      (r.rotation.z = (n * Math.PI) / 2),
        this.box(r, 0, 1.6, 0, 0.18, 3, 0.18, 9203785),
        this.box(r, 0.4, 1.85, 0, 0.75, 1.7, 0.12, 16773579),
        this.windmill.add(r);
    }
    this.sphere(this.windmill, 0, 0, 0.1, 0.25, 15382107),
      e.add(this.windmill),
      this.scene.add(e),
      this.obstacles.push({ x: -15, z: -14, radius: 1.8 }),
      [
        [-20, -14, 1.3],
        [-20, -8, 1],
        [-20, 0, 1.1],
        [-20, 13, 1.3],
        [-14, 14, 1.1],
        [-7, 16, 1.4],
        [-2, 13, 1.1],
        [1, 17, 1.2],
        [0, -16, 1.5],
        [1, -8, 1],
        [-8, -17, 1.2],
        [13, -14, 1.3],
        [18, -17, 1.5],
        [21, -10, 1.2],
        [21, 7, 1.3],
        [17, 14, 1.5],
        [12, 11, 1.2],
        [12, -7, 0.85],
      ].forEach(([n, r, s], a) => this.tree(n, r, s, a));
    const t = new ut();
    t.position.set(0.4, 0, 3.4),
      this.box(t, 0, 0.7, 0, 0.17, 1.4, 0.17, 9201991),
      this.box(t, 0, 1.45, 0, 1.5, 0.65, 0.2, 12028500),
      this.scene.add(t);
  }
  garden() {
    for (let e = 0; e < 6; e++)
      this.box(this.scene, 12 + e * 1.8, 0.65, 5, 0.15, 1.3, 0.15, 15918525);
    this.box(this.scene, 16.5, 0.8, 5, 9.2, 0.15, 0.15, 15918525);
    for (let e = 0; e < 3; e++) {
      this.box(this.scene, 16 + e * 1.6, 0.09, -7, 1, 0.12, 5.5, 11703138);
      for (let t = 0; t < 6; t++)
        this.sphere(this.scene, 16 + e * 1.6, 0.35, -9 + t * 0.8, 0.32, 5942105),
          this.sphere(this.scene, 16 + e * 1.6, 0.54, -9 + t * 0.8, 0.15, 15579480);
    }
    this.cylinder(this.scene, 17.5, 2.1, 0, 0.08, 0.08, 4.2, 9138249),
      this.box(this.scene, 18.1, 3.6, 0, 1.2, 0.8, 0.06, 16763222),
      this.cylinder(this.scene, 16, 0.12, 0, 1.5, 1.5, 0.2, 15255931, 12);
  }
  mathMeadow() {
    const e = this.regionGroup('meadow');
    this.box(e, 0, 0.04, 0, 18, 0.08, 14, 10144363);
    for (let r = 0; r < 3; r++) {
      const s = -4 + r * 4;
      this.box(e, 0, 0.1, s, 11, 0.14, 2.2, r % 2 ? 11900514 : 13085041);
      for (let a = 0; a < 7; a++) {
        const o = -4.4 + a * 1.45;
        this.sphere(e, o, 0.42, s, 0.28, [15908181, 15304039, 7649703][(r + a) % 3]),
          this.cylinder(e, o, 0.25, s, 0.08, 0.11, 0.35, 6265681, 6);
      }
    }
    for (const r of [-2.4, 2.4])
      this.cylinder(e, r, 1.6, 7, 0.16, 0.2, 3.2, 9201991),
        this.sphere(e, r, 3.35, 7, 0.35, 16765028);
    this.box(e, 0, 3.1, 7, 5.6, 0.22, 0.22, 9201991),
      this.sign(e, '× ÷', 0, 3.9, 7.05, 2.6, '#ffd064', '#6b4a1c'),
      this.block(e, -2.4, 7, 0.3),
      this.block(e, 2.4, 7, 0.3);
    for (let r = 0; r < 7; r++) {
      const s = this.sphere(e, -7.4 + r * 2.4, 0.22, -6.2, 0.45, 15059349);
      s.rotation.y = r * 0.8;
    }
    const t = new ut();
    t.position.set(6.5, 0, -1), this.box(t, 0, 1.4, 0, 3, 2.8, 3.6, 13197903);
    const n = this.cylinder(t, 0, 3.2, 0, 0, 2.5, 1.4, 9062974, 4);
    (n.rotation.y = Math.PI / 4),
      (n.scale.z = 1.3),
      this.box(t, -1.52, 1, 0, 0.1, 1.8, 1.6, 16181188),
      e.add(t),
      this.block(e, 6.5, -1, 2.3),
      this.sign(t, '2 × 3', -1.6, 2.4, 0, 1.8, '#fffbea', '#8a4a3e', -Math.PI / 2);
  }
  forest() {
    const e = this.regionGroup('forest'),
      [t, n] = Ps('forest').center;
    this.box(e, 0, 0.04, 0, 20, 0.08, 16, 7316827),
      this.box(e, 0, 0.08, -2, 1.8, 0.12, 12, 13809533),
      [
        [-8, -6],
        [-5.5, -4],
        [-8, -1],
        [-6, 2],
        [-8, 5],
        [-4.5, 6],
        [-2.5, 2.5],
        [3, -5],
        [5.5, -6.5],
        [8, -4],
        [5, -1],
        [8, 1.5],
        [5.5, 4],
        [8, 6.5],
        [3, 6.5],
        [-2.5, -6.5],
      ].forEach(([o, l], c) => this.tree(t + o, n + l, 0.85 + (c % 3) * 0.2, c + 2));
    for (let o = 0; o < 5; o++) {
      const l = -6 + o * 2.6,
        c = o % 2 ? 2 : -2;
      this.box(e, c, 0.08, l, 0.9, 0.12, 0.9, 9333580), this.sphere(e, c, 0.38, l, 0.3, 15252826);
    }
    for (let o = 0; o < 6; o++) {
      const l = -1 + (o % 3) * 1.1,
        c = 3 + Math.floor(o / 3) * 1.2;
      this.cylinder(e, l, 0.2, c, 0.08, 0.1, 0.4, 16182484, 6),
        (this.sphere(e, l, 0.45, c, 0.24, 14242634).scale.y = 0.6);
    }
    const s = new ut();
    s.position.set(0, 0, 5.5), this.box(s, 0, 1.1, 0, 3.2, 2.2, 2.4, 10120005);
    const a = this.cylinder(s, 0, 2.8, 0, 0, 2.5, 1.4, 4160088, 4);
    (a.rotation.y = Math.PI / 4),
      this.box(s, 0, 0.8, -1.22, 0.8, 1.5, 0.08, 5979176),
      e.add(s),
      this.block(e, 0, 5.5, 2),
      this.sign(e, '÷ 3', 0, 2.2, -1.25, 1.5, '#fff4d8', '#3f7a58');
  }
  city() {
    const e = this.regionGroup('city');
    this.box(e, 0, 0.04, 0, 18, 0.08, 18, 12241078),
      this.box(e, 0, 0.07, 0, 18, 0.06, 2.6, 9278607),
      this.box(e, 0, 0.071, 0, 2.6, 0.06, 18, 9278607);
    const t = [15320702, 8566192, 15047544, 10197968];
    [
      [-5, -5, 4],
      [5, -5, 6],
      [-5, 5, 5],
      [5, 5, 3.4],
    ].forEach(([s, a, o], l) => {
      const c = new ut();
      c.position.set(s, 0, a),
        e.add(c),
        this.box(c, 0, o / 2, 0, 4.2, o, 3.8, t[l]),
        this.box(c, 0, o + 0.3, 0, 4.5, 0.6, 4.1, 15786688);
      for (let u = 1; u < o - 0.6; u += 1.3)
        for (const h of [-1.2, 0, 1.2])
          this.box(c, h, u + 0.3, a < 0 ? 1.92 : -1.92, 0.6, 0.7, 0.06, 16643804);
      this.box(c, 0, 0.7, a < 0 ? 1.93 : -1.93, 0.9, 1.4, 0.08, 6508377),
        this.sign(
          c,
          String((l + 2) * 12),
          0,
          o + 1.4,
          0,
          2.2,
          '#fffbea',
          '#3c4f6b',
          a < 0 ? 0 : Math.PI,
        ),
        this.block(e, s, a, 2.7);
    });
    const n = this.cylinder(e, 0, 0.12, 0, 2.4, 2.4, 0.18, 15192219, 20);
    (n.castShadow = !1), this.cylinder(e, 0, 0.6, 0, 0.5, 0.7, 0.9, 14206880, 12);
    const r = this.sphere(e, 0, 1.3, 0, 0.35, 8376544);
    this.floaters.push({ object: r, baseY: 1.3, speed: 2, spin: 0 }), this.block(e, 0, 0, 1);
    for (let s = 0; s < 8; s++) {
      const a = (s * Math.PI) / 4 + Math.PI / 8;
      this.cylinder(e, Math.cos(a) * 8, 1.2, Math.sin(a) * 8, 0.07, 0.09, 2.4, 4872794),
        this.sphere(e, Math.cos(a) * 8, 2.5, Math.sin(a) * 8, 0.22, 16770976);
    }
  }
  tower() {
    const e = this.regionGroup('tower'),
      t = this.cylinder(e, 0, 0.06, 0, 6.6, 7, 0.12, 10996090, 20);
    (t.castShadow = !1),
      (this.cylinder(e, 0, 0.14, 0, 4.4, 4.6, 0.16, 14206100, 14).castShadow = !1),
      this.cylinder(e, 0, 4.9, 0, 2.3, 2.9, 8, 7828392, 10);
    for (let r = 0; r < 3; r++)
      this.cylinder(e, 0, 2.4 + r * 2.4, 0, 2.95 - r * 0.2, 2.95 - r * 0.2, 0.25, 15786688, 10);
    this.cylinder(e, 0, 9.6, 0, 3.4, 0, 2, 15778909, 10);
    const n = this.sphere(e, 0, 11.6, 0, 0.6, 16768115);
    this.floaters.push({ object: n, baseY: 11.6, speed: 1.4, spin: 1 }),
      this.box(e, 0, 1.6, 2.72, 1.3, 2, 0.2, 4931435),
      this.sign(e, '× ÷ + −', 0, 7.4, 2.62, 3.2, '#fffbea', '#4b3f6b'),
      this.block(e, 0, 0, 3.4),
      ['2', '×', '5', '=', '10'].forEach((r, s) => {
        const a = (s / 5) * Math.PI * 2,
          o = new ut();
        o.position.set(Math.cos(a) * 5.4, 2.2, Math.sin(a) * 5.4);
        const l = this.mesh(o, new Ba(0.45), [10148336, 16167888, 16766836][s % 3], 0, 0, 0);
        (l.scale.y = 1.5),
          this.sign(o, r, 0, 1.2, 0, 1.1, '#ffffffdd', '#4b3f6b'),
          e.add(o),
          this.floaters.push({ object: o, baseY: 2.2, speed: 1.2 + s * 0.15, spin: 0.6 });
      });
  }
  westBank() {
    const e = this.cylinder(this.scene, -38, 0.03, -11, 4.6, 4.6, 0.08, 6080214, 28);
    e.castShadow = !1;
    for (let r = 0; r < 16; r++) {
      const s = (r / 16) * Math.PI * 2,
        a = this.sphere(
          this.scene,
          -38 + Math.cos(s) * 4.9,
          0.15,
          -11 + Math.sin(s) * 4.9,
          0.35 + (r % 3) * 0.1,
          13221280,
        );
      a.scale.y = 0.6;
    }
    this.box(this.scene, -36.5, 0.25, -7.6, 1.4, 0.12, 2.6, 10779730);
    for (let r = 0; r < 4; r++) {
      const s = this.cylinder(
        this.scene,
        -39.5 + (r % 2) * 2.4,
        0.1,
        -12 + r,
        0.45,
        0.45,
        0.04,
        5940826,
        10,
      );
      s.castShadow = !1;
    }
    this.obstacles.push({ x: -38, z: -11, radius: 4.8 });
    const t = this.sphere(this.scene, -40, -1.8, 18, 5.5, 8831582);
    (t.scale.y = 0.45), (t.castShadow = !1);
    const n = new ut();
    n.position.set(-40, 0.6, 18);
    for (let r = 0; r < 6; r++) {
      const s = (r / 6) * Math.PI * 2;
      this.cylinder(n, Math.cos(s) * 1.6, 1.2, Math.sin(s) * 1.6, 0.1, 0.1, 2.4, 15918525);
    }
    this.cylinder(n, 0, 2.8, 0, 0, 2.3, 1.2, 14191701, 6),
      this.cylinder(n, 0, 0.1, 0, 2, 2, 0.2, 15390115, 12),
      this.scene.add(n),
      this.obstacles.push({ x: -40, z: 18, radius: 2.2 });
    for (const [r, s, a] of [
      [-46, -34, 8],
      [-46, 34, 7],
      [66, -38, 7],
      [66, 38, 8],
      [-24, -40, 6],
      [30, 40, 6],
    ]) {
      const o = this.sphere(this.scene, r, -a * 0.55, s, a, 8371548);
      (o.scale.y = 0.55),
        (o.castShadow = !1),
        this.obstacles.push({ x: r, z: s, radius: a * 0.82 });
    }
  }
  scatter() {
    let e = 1337;
    const t = () => ((e = (e * 16807) % 2147483647), (e - 1) / 2147483646),
      n = (A, x, _) =>
        Wr.some((w) =>
          w.some((U, z) => {
            if (!z) return !1;
            const [G, V] = w[z - 1],
              [X, Z] = U,
              H = X - G,
              se = Z - V,
              ue = fr.clamp(((A - G) * H + (x - V) * se) / (H * H + se * se), 0, 1);
            return Math.hypot(A - G - H * ue, x - V - se * ue) < _;
          }),
        ),
      r = (A, x, _) =>
        x > fe.minZ + _ &&
        x < fe.maxZ - _ &&
        ((A > fe.west.minX + _ && A < fe.west.maxX - _) ||
          (A > fe.east.minX + _ && A < fe.east.maxX - _)),
      s = (A, x, _) =>
        Dt.some(
          (w) =>
            w.id !== 'forest' &&
            Math.abs(A - w.center[0]) < w.size[0] / 2 + _ &&
            Math.abs(x - w.center[1]) < w.size[1] / 2 + _,
        ),
      a = (A, x, _) =>
        !r(A, x, _) ||
        s(A, x, _) ||
        n(A, x, _ + 1) ||
        this.obstacles.some((w) => Math.hypot(A - w.x, x - w.z) < w.radius + _),
      o = new Mt(),
      l = new ke(),
      c = [];
    for (let A = 0; c.length < (this.lowPower ? 150 : 230) && A < 6e3; A++) {
      const x = fe.west.minX + t() * (fe.east.maxX - fe.west.minX),
        _ = fe.minZ + t() * (fe.maxZ - fe.minZ),
        w = 0.8 + t() * 0.7,
        U = Ps('forest');
      (Math.abs(x - U.center[0]) < U.size[0] / 2 + 1 &&
        Math.abs(_ - U.center[1]) < U.size[1] / 2 + 1) ||
        a(x, _, 1.4) ||
        c.some(([z, G]) => Math.hypot(x - z, _ - G) < 2.4) ||
        (c.push([x, _, w, 0]), this.obstacles.push({ x, z: _, radius: 0.45 * w }));
    }
    const u = this.lowPower ? 450 : 900;
    for (let A = 0, x = 0; x < u && A < u * 12; A++) {
      const _ = -150 + t() * 310,
        w = -140 + t() * 280,
        U = Math.max(fe.west.minX - _, _ - fe.east.maxX, 0),
        z = Math.max(fe.minZ - w, w - fe.maxZ, 0),
        G = Math.hypot(U, z);
      G < 1.5 ||
        Math.abs(_ - 7) < 6 ||
        t() > (G < 22 ? 0.95 : 0.3) ||
        (c.push([_, w, 0.9 + t() * 0.9, this.groundHeight(_, w) - 0.1]), x++);
    }
    const h = this.material(16777215),
      f = [3969888, 5678173, 7779153, 5216866, 6860888],
      m = new En(new tr(0.18, 0.26, 2.2, 6), this.material(9726787), c.length),
      g = new En(new Yi(1, 1), h, c.length * 2),
      S = new En(new $i(1, 1, 7), h, c.length * 2);
    let p = 0,
      d = 0;
    c.forEach(([A, x, _, w], U) => {
      o.position.set(A, w + 1.1 * _, x),
        o.rotation.set(0, U, 0),
        o.scale.setScalar(_),
        o.updateMatrix(),
        m.setMatrixAt(U, o.matrix);
      const z = f[U % f.length];
      if (U % 3 === 0)
        for (const [G, V, X] of [
          [2.35, 1.35, 2.3],
          [3.35, 1, 1.9],
        ])
          o.position.set(A, w + G * _, x),
            o.scale.set(V * _, X * _, V * _),
            o.updateMatrix(),
            S.setMatrixAt(d, o.matrix),
            S.setColorAt(d++, l.setHex(G > 3 ? 6401385 : z));
      else
        for (const [G, V, X, Z] of [
          [0, 2.7, 0, 1.35],
          [-0.7, 2.25, 0.25, 0.9],
        ])
          o.position.set(A + G * _, w + V * _, x + X * _),
            o.scale.setScalar(Z * _),
            o.updateMatrix(),
            g.setMatrixAt(p, o.matrix),
            g.setColorAt(p++, l.setHex(G ? 8503138 : z));
    }),
      (g.count = p),
      (S.count = d);
    for (const A of [m, g, S]) (A.castShadow = !0), (A.receiveShadow = !0), this.scene.add(A);
    const E = new En(new Oa(1, 0), this.material(12168334), 70);
    let b = 0;
    for (; b < 70; ) {
      const A = fe.west.minX + t() * 120,
        x = fe.minZ + t() * 88;
      if (a(A, x, 0.8)) continue;
      const _ = 0.25 + t() * 0.5;
      o.position.set(A, _ * 0.3, x),
        o.rotation.set(t(), t() * 6, 0),
        o.scale.set(_ * 1.3, _ * 0.7, _),
        o.updateMatrix(),
        E.setMatrixAt(b++, o.matrix);
    }
    (E.castShadow = !0), (E.receiveShadow = !0), this.scene.add(E);
    const y = this.lowPower ? 700 : 1300,
      P = new En(new Yi(0.11, 0), this.material(16777215), y),
      R = new En(new $i(0.1, 0.35, 3), this.material(6399056), y),
      L = new En(new $i(0.16, 0.5, 4), this.material(7320915), y);
    for (b = 0; b < y; ) {
      const A = fe.west.minX + t() * 120,
        x = fe.minZ + t() * 88;
      !r(A, x, 0.6) ||
        (A > -24 && A < 3 && Math.abs(x - 1) < 2) ||
        (Math.abs(A + 10) < 2 && x < 7 && x > -15) ||
        n(A, x, 1.7) ||
        (o.rotation.set(0, t() * 6, 0),
        o.scale.setScalar(1),
        o.position.set(A, 0.19, x),
        o.updateMatrix(),
        R.setMatrixAt(b, o.matrix),
        (o.position.y = 0.39),
        o.updateMatrix(),
        P.setMatrixAt(b, o.matrix),
        P.setColorAt(b, l.setHex([16770211, 16117975, 15313294, 12430304, 16167888][b % 5])),
        o.position.set(A + (t() - 0.5) * 3, 0.22, x + (t() - 0.5) * 3),
        o.scale.setScalar(0.7 + t() * 0.6),
        o.updateMatrix(),
        L.setMatrixAt(b, o.matrix),
        b++);
    }
    for (const A of [P, R, L]) (A.receiveShadow = !0), this.scene.add(A);
  }
  createPlayer() {
    const e = this.player;
    (this.shirt = this.box(e, 0, 0.93, 0, 0.7, 0.8, 0.47, 15445570)),
      this.sphere(e, 0, 1.67, 0, 0.45, 16766382),
      (this.hair = this.sphere(e, 0, 1.93, -0.035, 0.43, 5323826)),
      (this.hair.scale.y = 0.65),
      (this.ponytail = this.sphere(e, 0, 1.66, -0.39, 0.25, 5323826)),
      (this.ponytail.visible = !1);
    for (const t of [-0.16, 0.16]) {
      this.sphere(e, t, 1.72, 0.394, 0.042, 2571317);
      const n = this.box(e, t, 0.3, 0, 0.25, 0.55, 0.28, 4349808);
      this.box(n, 0, -0.19, 0.08, 0.29, 0.16, 0.4, 16446166), this.legs.push(n);
    }
    this.box(e, -0.48, 0.94, 0, 0.2, 0.65, 0.23, 16766382),
      this.box(e, 0.48, 0.94, 0, 0.2, 0.65, 0.23, 16766382),
      this.box(e, 0, 1, -0.36, 0.52, 0.65, 0.3, 5872009),
      this.box(e, 0, 1, -0.54, 0.32, 0.25, 0.1, 15781238);
  }
  createMilo() {
    this.cylinder(this.milo, 0, 0.65, 0, 0.45, 0.7, 1.25, 5471870),
      this.sphere(this.milo, 0, 1.58, 0, 0.48, 16766123),
      this.cylinder(this.milo, 0, 2.15, 0, 0.08, 0.58, 0.95, 4486774),
      this.cylinder(this.milo, 0, 1.82, 0, 0.75, 0.75, 0.12, 4486774);
    for (const t of [-0.16, 0.16]) this.sphere(this.milo, t, 1.6, 0.44, 0.045, 2702648);
    this.sphere(this.milo, 0, 1.28, 0.33, 0.22, 16183513),
      this.box(this.milo, 0.7, 0.9, 0, 0.09, 1.8, 0.09, 10449480),
      this.sphere(this.milo, 0.7, 1.9, 0, 0.19, 16765546);
    const e = this.sphere(this.milo, 0, 3, 0, 0.19, 16764765);
    e.userData.beacon = !0;
  }
  setAvatar(e) {
    (this.shirt.material = this.material(e === 'girl' ? 9925816 : 15445570)),
      (this.ponytail.visible = e === 'girl');
  }
  createBridge() {
    for (let e = 0; e < yt; e++) {
      const t = new ut();
      (t.position.x = Qe.riverMin + e + 0.5),
        this.box(t, 0, 0.12, 0, 0.97, 0.35, Qe.bridgeWidth, 12826773),
        this.box(t, 0, 0.33, 0, 0.86, 0.06, Qe.bridgeWidth - 0.15, 15062702);
      for (const n of [-1.6, 1.6])
        this.box(t, 0, 0.9, n, 0.17, 1.3, 0.17, 11109464),
          this.box(t, 0, 1.35, n, 1.08, 0.12, 0.15, 12559481);
      (t.visible = !1), this.bridge.add(t);
    }
    for (const e of [3.6, 10.4])
      for (const t of [-1.85, 1.85])
        this.cylinder(this.scene, e, 0.65, t, 0.23, 0.3, 1.3, 13287582),
          this.sphere(this.scene, e, 1.4, t, 0.28, 16044924);
  }
  setBridge(e, t = !1) {
    (this.bridgeCount = e),
      this.bridge.children.forEach((n, r) => {
        (n.visible = r < e),
          t && r === e - 1 && ((n.position.y = 3), this.burst(new F(n.position.x, 0.8, 0)));
      });
  }
  decorate() {
    let e = 91;
    const t = () => ((e = (e * 16807) % 2147483647), (e - 1) / 2147483646);
    for (let n = 0; n < 22; n++) {
      const r = new ut(),
        s = t() * Math.PI * 2,
        a = 80 + t() * 110;
      r.position.set(10 + Math.cos(s) * a, 16 + t() * 10, Math.sin(s) * a),
        r.scale.setScalar(1.4 + t() * 1.4);
      for (let o = 0; o < 4; o++) {
        const l = this.sphere(r, o * 1.1, Math.sin(o) * 0.35, 0, 0.95 + (o % 2) * 0.4, 16055541);
        l.scale.set(1.4, 0.65, 1), (l.castShadow = !1), (l.receiveShadow = !1);
      }
      this.scene.add(r), this.clouds.push(r);
    }
    for (let n = 0; n < 18; n++) {
      const r = (n / 18) * Math.PI * 2 + t() * 0.2,
        s = 230 + t() * 140,
        a = new ut(),
        o = 10 + Math.cos(r) * s,
        l = Math.sin(r) * s;
      if (Math.abs(o - 7) < 40) continue;
      a.position.set(o, this.groundHeight(o, l) - 1, l), (a.rotation.y = t() * 6);
      const c = 16 + t() * 20;
      for (let u = 0; u < 3; u++) {
        const h = 10 + t() * 26,
          f = this.cylinder(
            a,
            (t() - 0.5) * c,
            h / 2,
            (t() - 0.5) * c,
            0,
            c * 0.45,
            h,
            u % 2 ? 7315066 : 8300682,
            7,
          );
        (f.castShadow = !1),
          h > 26 &&
            (this.cylinder(
              a,
              f.position.x,
              h * 0.9,
              f.position.z,
              0,
              c * 0.45 * 0.2 + 0.4,
              h * 0.2,
              16054514,
              7,
            ).castShadow = !1);
      }
      this.scene.add(a);
    }
  }
  mergeStatic() {
    const e = new Set([
        this.player,
        this.milo,
        this.bridge,
        this.windmill,
        this.sky,
        ...this.clouds,
        ...this.ripples,
        ...this.floaters.map((s) => s.object),
      ]),
      t = (s) => !!s && (e.has(s) || t(s.parent)),
      n = new Set(this.materials.values()),
      r = new Map();
    this.scene.updateMatrixWorld(!0),
      this.scene.traverse((s) => {
        if (
          !(s instanceof St) ||
          s instanceof En ||
          Array.isArray(s.material) ||
          !n.has(s.material) ||
          t(s)
        )
          return;
        const a = `${s.material.uuid}:${s.castShadow}`;
        let o = r.get(a);
        o ||
          ((o = { material: s.material, cast: s.castShadow, geometries: [], meshes: [] }),
          r.set(a, o));
        const l = (s.geometry.index ? s.geometry.toNonIndexed() : s.geometry.clone()).applyMatrix4(
          s.matrixWorld,
        );
        for (const c of Object.keys(l.attributes))
          ['position', 'normal', 'uv'].includes(c) || l.deleteAttribute(c);
        l.clearGroups(), o.geometries.push(l), o.meshes.push(s);
      });
    for (const { material: s, cast: a, geometries: o, meshes: l } of r.values()) {
      if (l.length < 2) {
        o.forEach((h) => h.dispose());
        continue;
      }
      const c = Wm(o);
      if ((o.forEach((h) => h.dispose()), !c)) continue;
      const u = new St(c, s);
      (u.castShadow = a), (u.receiveShadow = !0), this.scene.add(u);
      for (const h of l) h.removeFromParent(), h.geometry.dispose();
    }
  }
  resize() {
    const { clientWidth: e, clientHeight: t } = this.canvas;
    this.renderer.setSize(e, t, !1),
      (this.camera.aspect = e / t),
      this.camera.updateProjectionMatrix();
  }
  floorHeight() {
    return this.bridgeCount === yt &&
      this.player.position.x >= 4 &&
      this.player.position.x <= 10 &&
      Math.abs(this.player.position.z) < 1.4
      ? 0.36
      : 0;
  }
  jump() {
    this.active &&
      !this.paused &&
      this.player.position.y <= this.floorHeight() + 0.01 &&
      ((this.jumpVelocity = 6.5), this.onJump?.());
  }
  zoom(e) {
    this.distance = fr.clamp(this.distance + e, 16, 110);
  }
  clearInput() {
    this.keys.clear(), (this.joystick = { x: 0, y: 0 }), (this.destination = void 0);
  }
  resetCamera() {
    (this.yaw = 0.57), (this.pitch = 0.95), (this.distance = 42);
  }
  moveToScreen(e, t) {
    const n = this.canvas.getBoundingClientRect(),
      r = new We(((e - n.left) / n.width) * 2 - 1, (-(t - n.top) / n.height) * 2 + 1),
      s = new su();
    s.setFromCamera(r, this.camera);
    const a = new F();
    if (s.ray.intersectPlane(new Tn(new F(0, 1, 0), 0), a)) {
      if (a.distanceTo(this.milo.position) < 2.8 && this.nearMilo()) {
        this.onSceneClick?.(!0);
        return;
      }
      this.destination = a;
    }
  }
  nearMilo() {
    return (
      Math.hypot(
        this.player.position.x - this.milo.position.x,
        this.player.position.z - this.milo.position.z,
      ) < 3.1
    );
  }
  canMove(e, t) {
    const n = fe.margin;
    return e < fe.west.minX + n ||
      e > fe.east.maxX - n ||
      t < fe.minZ + n ||
      t > fe.maxZ - n ||
      (e > Qe.riverMin - 0.3 &&
        e < Qe.riverMax + 0.3 &&
        (this.bridgeCount < yt || Math.abs(t) > 1.25))
      ? !1
      : !this.obstacles.some(
          (r) =>
            Math.abs(e - r.x) < r.radius + 0.35 && Math.hypot(e - r.x, t - r.z) < r.radius + 0.35,
        );
  }
  movement(e) {
    let t =
        (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) -
        (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0) +
        this.joystick.x,
      n =
        (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) -
        (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0) +
        this.joystick.y,
      r = t * Math.cos(this.yaw) + n * Math.sin(this.yaw),
      s = -t * Math.sin(this.yaw) + n * Math.cos(this.yaw);
    t || n
      ? (this.destination = void 0)
      : this.destination &&
        ((r = this.destination.x - this.player.position.x),
        (s = this.destination.z - this.player.position.z),
        Math.hypot(r, s) < 0.2 && ((this.destination = void 0), (r = s = 0)));
    const a = Math.hypot(r, s);
    if (a > 0.05) {
      (r /= a), (s /= a);
      const l = 6.5 * e,
        c = this.player.position.x + r * l,
        u = this.player.position.z + s * l;
      let h = !1;
      this.canMove(c, this.player.position.z) && ((this.player.position.x = c), (h = !0)),
        this.canMove(this.player.position.x, u) && ((this.player.position.z = u), (h = !0)),
        h || (this.destination = void 0),
        (this.player.rotation.y = Math.atan2(r, s)),
        this.legs.forEach((f, m) => (f.rotation.x = Math.sin(this.time * 12 + m * Math.PI) * 0.55));
    } else this.legs.forEach((l) => (l.rotation.x *= 0.8));
    const o = this.floorHeight();
    this.player.position.y > o || this.jumpVelocity > 0
      ? ((this.jumpVelocity -= 18 * e),
        (this.player.position.y = Math.max(o, this.player.position.y + this.jumpVelocity * e)),
        this.player.position.y === o && (this.jumpVelocity = 0))
      : (this.player.position.y = o);
  }
  burst(e) {
    for (let t = 0; t < 20; t++) {
      const n = this.sphere(this.scene, e.x, e.y, e.z, 0.09, [16765284, 16774343, 8246453][t % 3]);
      (n.castShadow = !1),
        this.sparks.push({
          mesh: n,
          life: 1.2,
          velocity: new F(
            (Math.random() - 0.5) * 5,
            3 + Math.random() * 3,
            (Math.random() - 0.5) * 5,
          ),
        });
    }
  }
  project(e) {
    const t = e.clone().project(this.camera),
      n = this.canvas.clientWidth,
      r = this.canvas.clientHeight,
      s = (t.x * 0.5 + 0.5) * n,
      a = (-0.5 * t.y + 0.5) * r;
    return {
      x: s,
      y: a,
      visible: t.z < 1 && s > -80 && s < n + 80 && a > -80 && a < r + 80,
      distance: this.camera.position.distanceTo(e),
    };
  }
  get heading() {
    return this.yaw;
  }
  updateShadows() {
    const e = this.active ? 46 : 95;
    e !== this.shadowSize &&
      ((this.shadowSize = e),
      Object.assign(this.sun.shadow.camera, {
        left: -e,
        right: e,
        top: e,
        bottom: -e,
        near: 1,
        far: e * 3.2,
      }),
      this.sun.shadow.camera.updateProjectionMatrix()),
      this.sun.target.position.copy(this.target),
      this.sun.position.set(this.target.x - 24, 42, this.target.z + 16);
  }
  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    const e = Math.min(this.clock.getDelta(), 0.05);
    (this.time += e),
      this.active && !this.paused && this.movement(e),
      this.active
        ? this.wanted.copy(this.player.position).setY(0)
        : (this.wanted.set(8, 0, 0), (this.yaw += e * 0.03)),
      this.target.lerp(this.wanted, 1 - Math.exp(-e * 3));
    const t = 1 - Math.exp(-e * 2.2);
    (this.viewDistance +=
      ((this.active ? this.distance : this.camera.aspect < 0.85 ? 175 : 120) - this.viewDistance) *
      t),
      (this.viewPitch += ((this.active ? this.pitch : 0.72) - this.viewPitch) * t),
      (this.viewShift +=
        ((!this.active && this.camera.aspect > 1.25 ? 0.16 : 0) - this.viewShift) * t);
    const { clientWidth: n, clientHeight: r } = this.canvas;
    this.viewShift > 0.001
      ? this.camera.setViewOffset(n, r, -this.viewShift * n, 0, n, r)
      : this.camera.view?.enabled && this.camera.clearViewOffset();
    const s = this.viewDistance,
      a = this.viewPitch;
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * Math.cos(a) * s,
      this.target.y + Math.sin(a) * s,
      this.target.z + Math.cos(this.yaw) * Math.cos(a) * s,
    ),
      this.camera.lookAt(this.target),
      this.sky.position.copy(this.camera.position),
      this.updateShadows(),
      (this.windmill.rotation.z -= e * 0.25),
      this.bridge.children.forEach((o) => (o.position.y = Math.max(0, o.position.y - e * 5))),
      this.clouds.forEach((o, l) => {
        (o.position.x += e * 0.35),
          o.position.x > 210 && (o.position.x = -190),
          (o.position.y += Math.sin(this.time * 0.2 + l) * 0.002);
      }),
      this.floaters.forEach((o) => {
        (o.object.position.y = o.baseY + Math.sin(this.time * o.speed) * 0.25),
          (o.object.rotation.y += e * o.spin);
      }),
      this.milo.children.forEach((o) => {
        o.userData.beacon && (o.position.y = 3 + Math.sin(this.time * 2) * 0.15);
      });
    for (let o = this.sparks.length - 1; o >= 0; o--) {
      const l = this.sparks[o];
      (l.life -= e),
        (l.velocity.y -= e * 6),
        l.mesh.position.addScaledVector(l.velocity, e),
        l.mesh.scale.setScalar(Math.max(0, l.life)),
        l.life <= 0 &&
          (this.scene.remove(l.mesh), l.mesh.geometry.dispose(), this.sparks.splice(o, 1));
    }
    this.ripples.forEach((o) => {
      (o.position.z += e * 0.25), o.position.z > 43 && (o.position.z = -43);
    }),
      this.renderer.render(this.scene, this.camera),
      this.onFrame?.(
        this.nearMilo(),
        this.player.position.x > 12 && Math.abs(this.player.position.z) < 4,
        1 / Math.max(e, 0.001),
      );
  };
  dispose() {
    cancelAnimationFrame(this.frame), this.observer.disconnect(), this.renderer.dispose();
  }
}
const Ga = () => ({
    version: 1,
    xp: 0,
    coins: 0,
    bridge: 0,
    questAccepted: !1,
    questComplete: !1,
    avatar: 'boy',
    table: 0,
    sound: !0,
    music: !1,
    combo: 0,
    questionStats: {},
    review: [],
    started: !1,
  }),
  Gn = (i, e = 1e7) =>
    typeof i == 'number' && Number.isFinite(i) ? Math.max(0, Math.min(e, Math.floor(i))) : 0;
function Ym(i) {
  const e = Ga();
  if (!i) return e;
  try {
    const t = JSON.parse(i);
    if (!t || typeof t != 'object' || !('version' in t) || t.version !== 1) return e;
    const n = t;
    if (
      ((e.xp = Gn(n.xp)),
      (e.coins = Gn(n.coins)),
      (e.bridge = Gn(n.bridge, yt)),
      (e.questAccepted = n.questAccepted === !0 || e.bridge > 0),
      (e.questComplete = n.questComplete === !0 && e.bridge === yt),
      (e.avatar = n.avatar === 'girl' ? 'girl' : 'boy'),
      (e.table = Ha.includes(n.table) ? n.table : 0),
      (e.sound = n.sound !== !1),
      (e.music = n.music === !0),
      (e.started = n.started === !0),
      (e.combo = Gn(n.combo, 1e4)),
      n.questionStats && typeof n.questionStats == 'object')
    )
      for (const [r, s] of Object.entries(n.questionStats).slice(0, 30)) {
        if (!/^m([2-9]|10)_([1-9]|10)$/.test(r) || !s || typeof s != 'object') continue;
        const a = s,
          o = Gn(a.correct),
          l = Gn(a.wrong);
        e.questionStats[r] = {
          attempts: o + l,
          correct: o,
          wrong: l,
          responseTime: Gn(a.responseTime),
          lastAnsweredAt: typeof a.lastAnsweredAt == 'string' ? a.lastAnsweredAt.slice(0, 40) : '',
        };
      }
    return (
      Array.isArray(n.review) &&
        (e.review = [
          ...new Set(
            n.review.filter((r) => typeof r == 'string' && /^m([2-9]|10)_([1-9]|10)$/.test(r)),
          ),
        ].slice(0, 30)),
      e
    );
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
    return localStorage.setItem(Kl, JSON.stringify(i)), !0;
  } catch {
    return !1;
  }
}
function jm(i, e = Math.random) {
  const t = [...i];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(e() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
function ll(i, e, t, n = Math.random) {
  const r = i * e,
    s = [e > 1 ? e - 1 : e + 2, e < 10 ? e + 1 : e - 2],
    a = [e, ...s].map((o) => ({
      value: i * o,
      label: t === 'bridge' ? `${i} × ${o}` : `${i * o}`,
    }));
  return { id: `m${i}_${e}`, a: i, b: e, answer: r, options: jm(a, n), review: !1 };
}
function Jm(i, e, t = '', n = Math.random) {
  const r = i.table ? [i.table] : [...Ha],
    s = i.review.filter((l) => l !== t && r.includes(Number(l.split('_')[0].slice(1))));
  if (s.length && n() < 0.7) {
    const l = s[Math.floor(n() * s.length)],
      [c, u] = l.slice(1).split('_').map(Number);
    return { ...ll(c, u, e, n), review: !0 };
  }
  const a = r
      .flatMap((l) => Array.from({ length: 10 }, (c, u) => ({ a: l, b: u + 1 })))
      .filter(({ a: l, b: c }) => `m${l}_${c}` !== t),
    o = a[Math.floor(n() * a.length)];
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
  r.attempts++,
    r[t ? 'correct' : 'wrong']++,
    (r.lastAnsweredAt = new Date().toISOString()),
    (r.responseTime = Math.round(n)),
    (i.questionStats[e.id] = r),
    !t && !i.review.includes(e.id) && i.review.push(e.id),
    (i.combo = t ? i.combo + 1 : 0);
}
function tg(i, e) {
  return e === 1
    ? `Có ${i.a} nhóm, mỗi nhóm ${i.b} viên đá. Hãy đếm từng nhóm nhé!`
    : e === 2
      ? `Cộng các nhóm lại: ${Array(i.a).fill(i.b).join(' + ')} = ?`
      : `${i.a} nhóm, mỗi nhóm ${i.b} viên đá: ${i.a} × ${i.b} = ${i.answer}. Mình cùng thử lại nhé!`;
}
class ng {
  context;
  timer;
  note = 0;
  enabled = !0;
  unlock() {
    (this.context ??= new AudioContext()), this.context.resume();
  }
  tone(e, t = 0.15, n = 0, r = 0.06) {
    if (!this.enabled || !this.context) return;
    const s = this.context.currentTime + n,
      a = this.context.createOscillator(),
      o = this.context.createGain();
    (a.type = 'sine'),
      (a.frequency.value = e),
      o.gain.setValueAtTime(0, s),
      o.gain.linearRampToValueAtTime(r, s + 0.02),
      o.gain.exponentialRampToValueAtTime(0.001, s + t),
      a.connect(o),
      o.connect(this.context.destination),
      a.start(s),
      a.stop(s + t + 0.02);
  }
  correct() {
    [523.25, 659.25, 783.99].forEach((e, t) => this.tone(e, 0.3, t * 0.1));
  }
  hint() {
    this.tone(392, 0.18), this.tone(440, 0.18, 0.14);
  }
  jump() {
    this.tone(480, 0.1);
  }
  celebrate() {
    [523, 659, 784, 1047].forEach((e, t) => this.tone(e, 0.45, t * 0.13));
  }
  music(e) {
    this.timer && clearInterval(this.timer),
      (this.timer = void 0),
      e &&
        (this.timer = window.setInterval(() => {
          const t = [262, 330, 392, 330, 294, 349, 440, 349];
          this.tone(t[this.note++ % t.length], 0.65, 0, 0.018);
        }, 850));
  }
}
const Zl = 'aigame3d_language';
let lr = ig();
const jl = {
  'Vương Quốc Cửu Chương': 'The Multiplication Kingdom',
  'Đang mở cánh cổng…': 'Opening the gate…',
  'Làng Khởi Đầu': 'Starting Village',
  'Bật / tắt âm thanh': 'Toggle sound',
  'Tắt âm thanh': 'Mute sound',
  'Bật âm thanh': 'Enable sound',
  'Cài đặt': 'Settings',
  'MỘT CUỘC PHIÊU LƯU NHỎ': 'A SMALL ADVENTURE',
  'Mỗi phép nhân, một điều kỳ diệu.': 'Every multiplication is a little wonder.',
  'Cùng Milo xây cầu và khám phá ngôi làng!': 'Build a bridge with Milo and explore the village!',
  'Chọn người bạn đồng hành': 'Choose your companion',
  'Nhà thám hiểm': 'Explorer',
  'Nhà khám phá': 'Pathfinder',
  'Bắt đầu phiêu lưu': 'Start adventure',
  'Tiếp tục phiêu lưu': 'Continue adventure',
  'Khám phá bảng cửu chương': 'Explore multiplication tables',
  '✦ Học qua những chuyến đi': '✦ Learn through adventure',
  'Bảng ×2 – ×10': 'Tables ×2 – ×10',
  xu: 'coins',
  'CHUYẾN PHIÊU LƯU ĐẦU TIÊN': 'FIRST ADVENTURE',
  'Một cây cầu, ngàn niềm vui': 'One bridge, a thousand joys',
  'Milo đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!':
    'Milo is waiting by the river. Come closer and say hello!',
  'Gặp người dẫn đường': 'Meet the guide',
  'Cây cầu tình bạn': 'Friendship Bridge',
  'Cánh Đồng Phép Tính': 'Math Meadow',
  'THẾ GIỚI 02': 'WORLD 02',
  'Rừng Nhân Chia': 'Multiplication Forest',
  'Thành Phố Con Số': 'Number City',
  'Tháp Toán Học': 'Math Tower',
  'THẾ GIỚI 03': 'WORLD 03',
  'THẾ GIỚI 04': 'WORLD 04',
  'THẾ GIỚI 05': 'WORLD 05',
  'đoạn cầu': 'bridge segments',
  'đã xây': 'built',
  'chưa xây': 'not built',
  'Bạn đã nối liền hai bờ! Hãy quay lại Milo để luyện tập và khám phá thêm phép nhân.':
    'You connected both shores! Return to Milo to practice and explore more multiplication.',
  'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.':
    'The bridge is ready! Cross it to reach the garden on the other side.',
  'Giúp Milo chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.':
    'Help Milo choose the correct multiplication. Each answer builds another bridge segment.',
  'Cây cầu tình bạn đã hoàn thành!': 'The Friendship Bridge is complete!',
  'Đi qua cầu để hoàn thành': 'Cross the bridge to finish',
  '✓ Hoàn thành': '✓ Complete',
  'Di chuyển': 'Move',
  Nhảy: 'Jump',
  'Kéo chuột để xoay': 'Drag to rotate',
  'Làng Khởi Đầu 3D. Di chuyển bằng WASD, phím mũi tên hoặc chạm xuống đất.':
    'Starting Village 3D. Move with WASD, arrow keys, or tap the ground.',
  'Switch language': 'Switch language',
  'Chọn nhân vật': 'Choose a character',
  'Tiến độ cấp độ': 'Level progress',
  'KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH': 'EXPLORE · LEARN · GROW',
  Đoạn: 'Segment',
  'Mình cần ': 'I need ',
  'Phép nhân nào đúng?': 'Which multiplication is correct?',
  'Không giới hạn thời gian': 'No time limit',
  'Khám phá bên kia cầu!': 'Explore beyond the bridge!',
  'Xây đoạn cầu tiếp theo': 'Build the next bridge segment',
  'Tuyệt vời! Cầu đã xây xong. Cùng đi qua cầu đến khu vườn nhé!':
    "Wonderful! The bridge is complete. Let's cross to the garden!",
  'Bạn đã đạt cấp ': 'You reached level ',
  '. Thật tuyệt vời!': '. That is wonderful!',
  'Chưa đúng rồi. Mình cùng đếm lại nhé!': "Not quite. Let's count again!",
  'Luyện bảng ×': 'Practice table ×',
  'Nhấn WASD / phím mũi tên, hoặc chạm xuống đất để di chuyển. Trên màn hình cảm ứng, dùng cần điều khiển.':
    'Press WASD / arrow keys, or tap the ground to move. On touch screens, use the joystick.',
  'Đến gần chiếc mũ xanh rồi nhấn E hoặc nút “Nói chuyện”.':
    'Come near the blue hat, then press E or the Talk button.',
  'Chọn 1 trong 3 đáp án. Cần giúp đỡ? Nhấn “Gợi ý cho mình”.':
    'Choose 1 of 3 answers. Need help? Press “Give me a hint”.',
  'Kéo trên làng': 'Drag across the village',
  'Lăn chuột': 'Scroll',
  'phóng to / thu nhỏ': 'zoom in / out',
  'tạm dừng': 'pause',
  'Tiến trình tự lưu trên trình duyệt này, không cần tài khoản. Xóa dữ liệu trình duyệt sẽ xóa tiến trình.':
    'Progress is saved in this browser without an account. Clearing browser data will delete it.',
  'XP tích lũy': 'XP earned',
  'Lượt trả lời': 'Answers',
  'Trả lời đúng': 'Correct answers',
  'XP, xu, cây cầu và lịch sử luyện tập trên thiết bị này sẽ bị xóa. Không thể hoàn tác.':
    'XP, coins, the bridge, and practice history on this device will be deleted. This cannot be undone.',
  'Một hành trình mới đang chờ bạn!': 'A new journey is waiting for you!',
  'Nhờ bạn, hai bờ đã được nối liền.': 'Thanks to you, both shores are connected.',
  'đã hoàn thành!': 'is complete!',
  'Chưa mở được thế giới 3D': 'The 3D world could not be opened',
  'Hãy bật tăng tốc đồ họa trong trình duyệt, hoặc thử Chrome / Edge mới hơn.':
    'Enable hardware acceleration in your browser, or try a newer version of Chrome / Edge.',
  'Thử lại': 'Try again',
  'Sổ cửu chương': 'Multiplication book',
  'Hướng dẫn chơi': 'How to play',
  'Nói chuyện với Milo': 'Talk to Milo',
  'Người dẫn đường': 'Your guide',
  'Một thế giới nhỏ. Những khám phá lớn.': 'A small world. Big discoveries.',
  'Lưu trên thiết bị này': 'Saved on this device',
  'Chào bạn! Di chuyển đến Milo, hoặc chạm xuống đất để đi.':
    'Hi! Move to Milo, or tap the ground to walk.',
  'Hãy đến gần Milo — người bạn có chiếc mũ xanh bên bờ sông.':
    'Come closer to Milo, the friend with the blue hat by the river.',
  'Chào bạn, mình là Milo!': "Hi, I'm Milo!",
  'NGƯỜI DẪN ĐƯỜNG CỦA BẠN': 'YOUR GUIDE',
  'Cây cầu của chúng mình thật đẹp! ': 'Our bridge looks wonderful! ',
  'Bạn muốn cùng mình luyện thêm phép nhân không?':
    'Would you like to practice more multiplication with me?',
  'Bạn hãy đi qua cầu đến khu vườn bên kia nhé. Mình cũng luôn sẵn sàng luyện tập cùng bạn!':
    'Cross the bridge to the garden on the other side. I am always ready to practice with you!',
  'Khu vườn bên kia sông đang chờ chúng mình. Hãy giúp mình xây ':
    'The garden across the river is waiting for us. Help me build ',
  ' bằng những viên đá phép thuật nhé!': ' with magic stones!',
  'Cứ thong thả, không cần vội. Mỗi lần thử là một lần bạn tiến bộ!':
    'Take your time. Every try helps you improve!',
  'Chọn phép nhân cho đúng số viên đá. Mỗi câu đúng: ':
    'Choose the multiplication for the right number of stones. Each correct answer: ',
  'Nếu chưa đúng, chúng mình cùng đếm lại!': 'If it is not right, we will count again together!',
  'Cùng xây cầu nào!': "Let's build a bridge!",
  'Cùng luyện tập': "Let's practice",
  'Cùng đi qua cầu nào!': "Let's cross the bridge!",
  'Cùng đi qua cầu': 'Cross the bridge',
  'Cùng xây cây cầu!': "Let's build the bridge!",
  'Mỗi ngày, giỏi hơn một chút': 'A little better every day',
  'ÔN LẠI PHÉP NHÂN': 'REVIEW MULTIPLICATION',
  'LUYỆN TẬP CÙNG MILO': 'PRACTICE WITH MILO',
  'Bạn tìm được kết quả không?': 'Can you find the answer?',
  'viên đá': 'stones',
  'Gợi ý cho mình': 'Give me a hint',
  'Tiếp tục': 'Continue',
  'Thử thêm một câu': 'Try another question',
  'ĐOẠN CẦU': 'BRIDGE SEGMENT',
  'HỌC TỪNG CHÚT, NHỚ THẬT LÂU': 'LEARN A LITTLE, REMEMBER A LOT',
  'Chọn bảng cửu chương': 'Choose a multiplication table',
  Bảng: 'Table',
  'Dấu ✓ là phép nhân bạn đã trả lời đúng. Mình luyện thêm nhé?':
    'A ✓ marks a multiplication you answered correctly. Shall we practice more?',
  'Trộn các bảng ×2 – ×10': 'Mix tables ×2 – ×10',
  'Sẵn sàng phiêu lưu?': 'Ready for an adventure?',
  'Khám phá ngôi làng': 'Explore the village',
  'Làm quen với Milo': 'Meet Milo',
  'Xây cầu bằng phép nhân': 'Build a bridge with multiplication',
  'Mình hiểu rồi!': 'Got it!',
  'Một chút cài đặt': 'A few settings',
  'Hiệu ứng âm thanh': 'Sound effects',
  'Nhạc nền nhẹ nhàng': 'Gentle background music',
  'Lưu tiến trình': 'Save progress',
  'Về màn hình chính': 'Return to main menu',
  'Chơi lại từ đầu': 'Start over',
  'Bắt đầu lại hành trình?': 'Start the journey over?',
  'Xóa tiến trình và chơi lại': 'Delete progress and start over',
  'Giữ lại hành trình': 'Keep the journey',
  'Bạn đã làm được rồi!': 'You did it!',
  'Tiếp tục khám phá': 'Keep exploring',
  'Đã lưu hành trình của bạn trên thiết bị này.': 'Your journey was saved on this device.',
  'Thật tuyệt vời!': 'That is wonderful!',
  '✓ Chính xác!': '✓ Correct!',
  '↻ Chưa đúng rồi. Mình cùng đếm lại nhé!': "↻ Not quite. Let's count again!",
  'Khu Vườn Bên Sông': 'Riverside Garden',
  'ĐÍCH ĐẾN CỦA CÂY CẦU': "THE BRIDGE'S DESTINATION",
  'Nơi Milo và bạn bắt đầu hành trình.': 'Where you and Milo begin the journey.',
  'Khu vườn bên kia Cây cầu tình bạn.': 'The garden across the Friendship Bridge.',
  'Ruộng phép tính và cổng vào thế giới thứ hai.': 'Math fields and the gate to the second world.',
  'Khu rừng rậm của phép nhân và phép chia.': 'A deep forest of multiplication and division.',
  'Những tòa nhà mang số và quảng trường đài phun nước.':
    'Numbered buildings and a fountain square.',
  'Ngọn tháp cao nhất, nơi những viên đá số lơ lửng.':
    'The tallest tower, where number crystals float.',
  'vùng đất': 'lands',
  'BẢN ĐỒ THẾ GIỚI': 'WORLD MAP',
  'Chạm vào một vùng đất để xem thông tin.': 'Tap a land to learn about it.',
  'Bản đồ Vương Quốc Cửu Chương': 'Map of the Multiplication Kingdom',
  'Đóng bản đồ': 'Close map',
  'Bản đồ (M)': 'Map (M)',
  'Bản đồ': 'Map',
  'Bạn ở đây': 'You are here',
  'Mở khóa khi hoàn thành Cây cầu tình bạn': 'Unlocks when the Friendship Bridge is complete',
  'Phóng to': 'Zoom in',
  'Thu nhỏ': 'Zoom out',
  'Cấp độ': 'Level',
  'Mở bản đồ thế giới': 'Open the world map',
  'Nhấn M hoặc chạm vào bản đồ nhỏ ở góc màn hình để xem các vùng đất.':
    'Press M or tap the minimap in the corner to see every land.',
  '4 vùng đất mới đã mở trên bản đồ. Nhấn M để xem!':
    '4 new lands are open on the map. Press M to look!',
  'Bạn đã nối liền hai bờ! Hãy khám phá các vùng đất mới trên bản đồ, hoặc quay lại Milo để luyện tập.':
    'You connected both shores! Explore the new lands on the map, or return to Milo to practice.',
  Đóng: 'Close',
};
function ig() {
  try {
    return localStorage.getItem(Zl) === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
}
function Va() {
  return lr;
}
function rg(i) {
  lr = i;
  try {
    localStorage.setItem(Zl, i);
  } catch {}
}
function Cn(i) {
  return lr === 'vi' ? i : (jl[i] ?? i);
}
function Ln(i) {
  if (lr === 'vi') return i;
  let e = Object.entries(jl)
    .sort(([t], [n]) => n.length - t.length)
    .reduce((t, [n, r]) => t.split(n).join(r), i);
  return (
    (e = e.replace(
      /Có (\d+) nhóm, mỗi nhóm (\d+) viên đá\. Hãy đếm từng nhóm nhé!/g,
      'There are $1 groups with $2 stones each. Count each group!',
    )),
    (e = e.replace(/Cộng các nhóm lại: ([\d +]+) = \?/g, 'Add the groups: $1 = ?')),
    (e = e.replace(
      /(\d+) nhóm, mỗi nhóm (\d+) viên đá: (\d+) × (\d+) = (\d+)\. Mình cùng thử lại nhé!/g,
      "$1 groups with $2 stones each: $3 × $4 = $5. Let's try again!",
    )),
    (e = e.replace(/(\d+) nhóm, mỗi nhóm có (\d+) viên đá/g, '$1 groups with $2 stones each')),
    e
  );
}
function Wa(i = document) {
  if (lr === 'vi') return;
  const e = document.createTreeWalker(i, NodeFilter.SHOW_TEXT);
  let t;
  for (; (t = e.nextNode()); ) t.nodeValue = Cn(t.nodeValue ?? '');
  i.querySelectorAll('[aria-label], [title]').forEach((n) => {
    for (const r of ['aria-label', 'title']) {
      const s = n.getAttribute(r);
      s && n.setAttribute(r, Cn(s));
    }
  });
}
const sg = '#194f42';
let gi, _i;
function ag() {
  if (_i) return _i;
  let i = 23;
  const e = () => ((i = (i * 16807) % 2147483647), (i - 1) / 2147483646);
  _i = [];
  for (let t = 0; t < 6e3 && _i.length < 1400; t++) {
    const n = -220 + e() * 460,
      r = -190 + e() * 380,
      s = Math.max(fe.west.minX - n, n - fe.east.maxX, 0),
      a = Math.max(fe.minZ - r, r - fe.maxZ, 0);
    Math.hypot(s, a) < 2.5 || Math.abs(n - 7) < 5.5 || _i.push([n, r, 1.3 + e() * 1.3]);
  }
  return _i;
}
function og() {
  if (gi) return gi;
  let i = 7;
  const e = () => ((i = (i * 16807) % 2147483647), (i - 1) / 2147483646),
    t = (n, r) =>
      Wr.some((s) =>
        s.some(([a, o], l) => {
          if (!l) return !1;
          const [c, u] = s[l - 1],
            h = a - c,
            f = o - u,
            m = Math.max(0, Math.min(1, ((n - c) * h + (r - u) * f) / (h * h + f * f)));
          return Math.hypot(n - c - h * m, r - u - f * m) < 3;
        }),
      );
  gi = [];
  for (let n = 0; n < 1400 && gi.length < 260; n++) {
    const r = fe.west.minX + 3 + e() * (fe.east.maxX - fe.west.minX - 6),
      s = fe.minZ + 3 + e() * (fe.maxZ - fe.minZ - 6);
    (r > Qe.riverMin - 2 && r < Qe.riverMax + 2) ||
      Dt.some(
        (a) =>
          a.id !== 'village' &&
          Math.abs(r - a.center[0]) < a.size[0] / 2 + 1.5 &&
          Math.abs(s - a.center[1]) < a.size[1] / 2 + 1.5,
      ) ||
      t(r, s) ||
      Math.hypot(r + 38, s + 11) < 6 ||
      (r > -24 && r < 2 && s > -16 && s < 12) ||
      gi.push([r, s, 0.9 + e() * 0.8]);
  }
  return gi;
}
const vi = (i, e, t, n, r, s) => {
  i.beginPath(), i.roundRect(e, t, n - e, r - t, s);
};
function Jl(i) {
  const e = Math.min(devicePixelRatio || 1, 2),
    t = i.clientWidth,
    n = i.clientHeight;
  (i.width !== Math.round(t * e) || i.height !== Math.round(n * e)) &&
    ((i.width = Math.round(t * e)), (i.height = Math.round(n * e)));
  const r = i.getContext('2d');
  return r.setTransform(e, 0, 0, e, 0, 0), { ctx: r, w: t, h: n };
}
function lg(i, e, t = 40) {
  const n = fe.east.maxX - fe.west.minX + 12,
    r = fe.maxZ - fe.minZ + 12;
  return {
    cx: (fe.west.minX + fe.east.maxX) / 2,
    cz: (fe.minZ + fe.maxZ) / 2,
    scale: Math.min((i - t * 2) / n, (e - t * 2) / r),
    rotation: 0,
  };
}
function cg(i, e, t, n, r) {
  return { x: i.cx + (n - e / 2) / i.scale, z: i.cz + (r - t / 2) / i.scale };
}
function hg(i, e) {
  return (
    Dt.filter((t) => t.id !== 'village').find(
      (t) =>
        Math.abs(i - t.center[0]) <= t.size[0] / 2 && Math.abs(e - t.center[1]) <= t.size[1] / 2,
    ) ?? (i > fe.west.minX && i < fe.west.maxX && e > fe.minZ && e < fe.maxZ ? Dt[0] : void 0)
  );
}
function Ql(i, e, t, n, r) {
  const s = n.scale,
    a = i.createRadialGradient(e / 2, t / 2, 0, e / 2, t / 2, Math.max(e, t) * 0.75);
  a.addColorStop(0, '#86bf62'),
    a.addColorStop(1, '#5f9a4e'),
    (i.fillStyle = a),
    i.fillRect(0, 0, e, t),
    i.save(),
    i.translate(e / 2, t / 2),
    i.rotate(n.rotation),
    i.scale(s, s),
    i.translate(-n.cx, -n.cz);
  for (const [g, S, p] of ag())
    (i.fillStyle = '#4f8a45'),
      i.beginPath(),
      i.arc(g + 0.3, S + 0.4, p, 0, Math.PI * 2),
      i.fill(),
      (i.fillStyle = '#65a353'),
      i.beginPath(),
      i.arc(g, S, p, 0, Math.PI * 2),
      i.fill();
  (i.fillStyle = '#9ed072'),
    vi(i, fe.west.minX, fe.minZ, fe.west.maxX, fe.maxZ, 10),
    i.fill(),
    vi(i, fe.east.minX, fe.minZ, fe.east.maxX, fe.maxZ, 10),
    i.fill(),
    (i.fillStyle = '#e3d3a4'),
    i.fillRect(
      Qe.riverMin - 0.9,
      fe.minZ - 400,
      Qe.riverMax - Qe.riverMin + 1.8,
      fe.maxZ - fe.minZ + 800,
    ),
    (i.fillStyle = '#5cc0d3'),
    i.fillRect(Qe.riverMin, fe.minZ - 400, Qe.riverMax - Qe.riverMin, fe.maxZ - fe.minZ + 800),
    (i.fillStyle = '#6fcbe0'),
    i.beginPath(),
    i.arc(-38, -11, 4.6, 0, Math.PI * 2),
    i.fill();
  for (const [g, S, p] of og())
    (i.fillStyle = '#6fae5a'),
      i.beginPath(),
      i.arc(g + 0.25, S + 0.35, p, 0, Math.PI * 2),
      i.fill(),
      (i.fillStyle = '#86c46a'),
      i.beginPath(),
      i.arc(g, S, p, 0, Math.PI * 2),
      i.fill();
  (i.lineCap = 'round'), (i.lineJoin = 'round'), (i.strokeStyle = '#f1e2b8'), (i.lineWidth = 2.6);
  for (const g of Wr) i.beginPath(), g.forEach(([S, p]) => i.lineTo(S, p)), i.stroke();
  const o = r.bridge / yt;
  (i.fillStyle = '#d9c9a0'),
    i.fillRect(Qe.riverMin, -1.7, (Qe.riverMax - Qe.riverMin) * o, 3.4),
    o < 1 &&
      (i.setLineDash([0.8, 0.8]),
      (i.strokeStyle = '#fffbea'),
      (i.lineWidth = 0.35),
      i.strokeRect(Qe.riverMin, -1.7, Qe.riverMax - Qe.riverMin, 3.4),
      i.setLineDash([]));
  for (const g of Dt) {
    if (g.id === 'village') continue;
    const S = Di(g, r.questComplete),
      [p, d] = g.center,
      [E, b] = g.size;
    (i.globalAlpha = S ? 0.85 : 0.45),
      (i.fillStyle = S ? g.color : '#c9cfbf'),
      vi(i, p - E / 2, d - b / 2, p + E / 2, d + b / 2, 2.5),
      i.fill(),
      (i.globalAlpha = 1),
      S ||
        (i.setLineDash([1, 1]),
        (i.strokeStyle = '#7d8a74'),
        (i.lineWidth = 0.3),
        i.stroke(),
        i.setLineDash([])),
      r.selected === g.id &&
        ((i.strokeStyle = '#f3b53d'),
        (i.lineWidth = 0.9),
        vi(i, p - E / 2 - 0.8, d - b / 2 - 0.8, p + E / 2 + 0.8, d + b / 2 + 0.8, 3),
        i.stroke());
  }
  i.fillStyle = '#e39a67';
  for (const [g, S, p] of [
    [-12, -6, 2.4],
    [-17, 6, 1.8],
    [-4, -11, 2],
    [-15, -14, 1.6],
  ])
    vi(i, g - p, S - p, g + p, S + p, 0.6), i.fill();
  r.selected === 'village' &&
    ((i.strokeStyle = '#f3b53d'), (i.lineWidth = 0.9), vi(i, -30, -20, 4, 20, 3), i.stroke()),
    i.restore();
  const l = (g, S) => {
    const p = (g - n.cx) * s,
      d = (S - n.cz) * s,
      E = Math.cos(n.rotation),
      b = Math.sin(n.rotation);
    return { x: e / 2 + p * E - d * b, y: t / 2 + p * b + d * E };
  };
  (i.textAlign = 'center'), (i.textBaseline = 'middle');
  for (const g of Dt) {
    const S = Di(g, r.questComplete),
      p = l(g.center[0], g.center[1]),
      d = r.labels ? 26 : s > 2.2 ? 20 : 15;
    if (
      ((i.globalAlpha = S ? 1 : 0.7),
      (i.font = `${d}px sans-serif`),
      i.fillText(S ? g.icon : '🔒', p.x, p.y - (r.labels ? 10 : 0)),
      r.labels)
    ) {
      i.font = '800 14px Nunito, "Trebuchet MS", sans-serif';
      const E = r.translate(g.name),
        b = i.measureText(E).width + 18;
      (i.fillStyle = '#fffbeaee'),
        i.beginPath(),
        i.roundRect(p.x - b / 2, p.y + 8, b, 24, 12),
        i.fill(),
        (i.fillStyle = sg),
        i.fillText(E, p.x, p.y + 20.5);
    }
    i.globalAlpha = 1;
  }
  const c = l(r.milo.x, r.milo.z),
    u = r.labels ? 9 : 6;
  (i.fillStyle = '#f4c755'),
    (i.strokeStyle = '#fff9e6'),
    (i.lineWidth = 2.5),
    i.beginPath(),
    i.arc(c.x, c.y, u, 0, Math.PI * 2),
    i.fill(),
    i.stroke(),
    (i.fillStyle = '#6e531a'),
    (i.font = `900 ${u * 1.4}px Nunito, sans-serif`),
    i.fillText('!', c.x, c.y + 0.5);
  const h = l(r.player.x, r.player.z),
    f = r.labels ? 13 : 10,
    m = 1 + Math.sin(r.time * 3) * 0.15;
  (i.fillStyle = '#ffffff55'),
    i.beginPath(),
    i.arc(h.x, h.y, f * 1.6 * m, 0, Math.PI * 2),
    i.fill(),
    i.save(),
    i.translate(h.x, h.y),
    i.rotate(n.rotation - r.player.facing + Math.PI),
    (i.fillStyle = '#e8562f'),
    (i.strokeStyle = '#fff'),
    (i.lineWidth = 2.5),
    i.beginPath(),
    i.moveTo(0, -f),
    i.lineTo(f * 0.72, f * 0.75),
    i.lineTo(0, f * 0.38),
    i.lineTo(-f * 0.72, f * 0.75),
    i.closePath(),
    i.stroke(),
    i.fill(),
    i.restore();
}
const cl = {
    crown: '<path d="m3 6 5 4 4-7 4 7 5-4-2 13H5Z"/><path d="M8 15h8"/>',
    book: '<path d="M12 6c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v15"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
    settings:
      '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v1"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6v12m3-9c-5-3-7 2-3 3s3 5-3 3"/>',
    flag: '<path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    reset: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
    jump: '<path d="M12 21V3m-6 6 6-6 6 6"/>',
    save: '<path d="M5 3h12l4 4v14H3V3h2Zm2 0v7h10V3M7 21v-7h10v7"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
  },
  Xe = (i) =>
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cl[i] ?? cl.star}</svg>`,
  Y = (i) => document.getElementById(i);
let ie = Km();
const xt = new ng();
let _e,
  jn,
  Kt = 'bridge',
  Yn = 0,
  ya = !1,
  ba = 0,
  Xa = '',
  hl = 0,
  ec = !1,
  ul = 0,
  dl = !1,
  bi = '',
  Dn = !1,
  Ei;
const qa = Dt.filter((i) => i.id !== 'village'),
  tc = Y('app');
tc.innerHTML = `
  <main class="game-shell">
    <canvas id="world" aria-label="Làng Khởi Đầu 3D. Di chuyển bằng WASD, phím mũi tên hoặc chạm xuống đất."></canvas>
    <div id="loading" class="loading"><span class="loading-crown">${Xe('crown')}</span><strong>Đang mở cánh cổng…</strong></div>
    <header class="topbar">
      <a class="brand" href="/" aria-label="Math AI Game 3D"><span class="brand-mark">${Xe('crown')}</span><span class="brand-text">MATH AI<small>GAME <b>3D</b></small></span></a>
      <div id="area-label" class="area-label" hidden><span id="area-icon" class="area-icon">🏡</span><span><strong id="area-name">Làng Khởi Đầu</strong><small id="area-sub">KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH</small></span></div>
      <div class="top-right"><span class="village-status"><i></i>Làng Khởi Đầu</span><button id="language" class="icon-button language-button" title="Switch language" aria-label="Switch language">${Va() === 'vi' ? 'EN' : 'VI'}</button><button id="sound" class="icon-button" title="Bật / tắt âm thanh" aria-label="Tắt âm thanh">${Xe('sound')}</button><button id="settings" class="icon-button" title="Cài đặt" aria-label="Cài đặt">${Xe('settings')}</button></div>
    </header>
    <section id="welcome" class="welcome">
      <div class="chapter"><span></span> MỘT CUỘC PHIÊU LƯU NHỎ</div>
      <h1>Math AI <br><span>Game</span><sup>3D</sup></h1>
      <p><strong>Vương Quốc Cửu Chương</strong><br>Mỗi phép nhân, một điều kỳ diệu.<br>Cùng Milo xây cầu và khám phá ngôi làng!</p>
      <div class="choose-label">Chọn người bạn đồng hành</div>
      <div class="avatar-options" role="group" aria-label="Chọn nhân vật"><button id="boy" class="avatar-option" aria-pressed="true"><span>👦</span>Nhà thám hiểm</button><button id="girl" class="avatar-option" aria-pressed="false"><span>👧</span>Nhà khám phá</button></div>
      <button id="play" class="primary play-button">Bắt đầu phiêu lưu ${Xe('arrow')}</button>
      <button id="learn-welcome" class="text-button">${Xe('book')} Khám phá bảng cửu chương</button>
      <div class="welcome-notes"><span>✦ Học qua những chuyến đi</span><span>Không giới hạn thời gian</span></div>
    </section>
    <div id="world-caption" class="world-caption"><span>0${Dt.at(-1).world}</span><div>Vương Quốc Cửu Chương<small>${Dt.length} vùng đất · Bảng ×2 – ×10</small></div></div>
    <div id="hud" class="hud" hidden>
      <div class="hud-left">
        <div class="player-card"><span id="avatar-face" class="avatar-face">👦</span><div class="player-info"><strong><span id="player-name">Nhà thám hiểm</span> <span class="level-badge" title="Cấp độ"><span id="level">1</span></span></strong><div class="xp-track" role="progressbar" aria-label="Tiến độ cấp độ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="xp-fill"></i></div><small id="xp-text">0 / 100 XP</small></div><div id="wallet" class="wallet" title="xu">${Xe('coin')}<strong id="coins">0</strong></div></div>
        <aside id="quest-card" class="quest-card"><button id="quest-toggle" class="quest-head" aria-expanded="true" aria-controls="quest-body"><span class="eyebrow">${Xe('flag')} CHUYẾN PHIÊU LƯU ĐẦU TIÊN</span><span class="chevron">${Xe('chevron')}</span></button><h2 id="quest-title">Một cây cầu, ngàn niềm vui</h2><div id="quest-body" class="quest-body"><p id="quest-copy">Milo đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!</p><div id="quest-steps" class="quest-steps"></div></div><div class="quest-bottom"><span id="quest-progress">Gặp người dẫn đường</span><span class="reward">${Xe('star')} +10 XP / câu</span></div></aside>
      </div>
      <button id="minimap" class="minimap" aria-label="Mở bản đồ thế giới" title="Bản đồ (M)"><canvas id="minimap-canvas"></canvas><span class="minimap-ring"></span><span class="minimap-key"><kbd>M</kbd></span></button>
      <button id="milo-label" class="world-label" aria-label="Nói chuyện với Milo"><span class="milo-dot">!</span><strong>Milo</strong><small>Người dẫn đường</small></button>
      <div id="bridge-label" class="world-label landmark"><strong>Cây cầu tình bạn</strong><small id="bridge-count">0 / 6 đoạn cầu</small></div>
      ${qa.map((i) => `<div id="${i.id}-label" class="world-label landmark region-label"><span class="region-icon">${i.icon}</span><strong>${i.name}</strong><small>${i.subtitle}</small></div>`).join('')}
      <div class="bottom-bar"><div class="controls-hint"><span class="key-group"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Di chuyển</span><span class="divider"></span><kbd>Space</kbd><span>Nhảy</span><span class="divider"></span><kbd>M</kbd><span>Bản đồ</span><span class="divider"></span><span>Kéo chuột để xoay</span></div><div class="toolbar"><div class="zoom-group"><button id="zoom-in" class="icon-button" aria-label="Phóng to" title="Phóng to">${Xe('plus')}</button><button id="zoom-out" class="icon-button" aria-label="Thu nhỏ" title="Thu nhỏ">${Xe('minus')}</button></div><button id="open-map" class="tool-button">${Xe('map')}<span>Bản đồ</span></button><button id="learn" class="tool-button">${Xe('book')}<span>Sổ cửu chương</span></button><button id="help" class="icon-button" aria-label="Hướng dẫn chơi" title="Hướng dẫn chơi">${Xe('help')}</button></div></div>
      <button id="interact" class="interact" hidden><kbd>E</kbd> Nói chuyện với Milo ${Xe('arrow')}</button>
      <div id="touch-controls" class="touch-controls"><div id="joystick" class="joystick" role="group" aria-label="Cần điều khiển di chuyển"><div id="joystick-knob"></div></div><button id="jump" class="jump-button" aria-label="Nhảy">${Xe('jump')}</button></div>
    </div>
    <section id="world-map" class="map-overlay" role="dialog" aria-modal="true" aria-labelledby="map-title" hidden>
      <canvas id="map-canvas" aria-label="Bản đồ Vương Quốc Cửu Chương"></canvas>
      <div class="map-head"><div class="dialog-eyebrow">BẢN ĐỒ THẾ GIỚI</div><h2 id="map-title">Vương Quốc Cửu Chương</h2><p>Chạm vào một vùng đất để xem thông tin.</p></div>
      <button id="close-map" class="dialog-close map-close" aria-label="Đóng bản đồ">${Xe('close')}</button>
      <aside class="map-panel"><div id="map-regions" class="map-regions"></div><div id="map-detail" class="map-detail"></div></aside>
    </section>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
    <footer id="menu-footer" class="menu-footer"><span><b>AI</b>GAME3D<span class="dotcom">.COM</span></span><span>Một thế giới nhỏ. Những khám phá lớn.</span><span>Lưu trên thiết bị này ${Xe('save')}</span></footer>
    <dialog id="dialog" aria-labelledby="dialog-title"><button id="close-dialog" class="dialog-close" aria-label="Đóng">${Xe('close')}</button><div id="dialog-content"></div></dialog>
  </main>`;
Wa(tc);
function In(i) {
  (Y('toast').textContent = Cn(i)),
    (Y('toast').hidden = !1),
    clearTimeout(hl),
    (hl = window.setTimeout(() => (Y('toast').hidden = !0), 4200));
}
function Xt() {
  const i = Zm(ie);
  return (
    !i &&
      !dl &&
      ((dl = !0), In('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.')),
    i
  );
}
function fl(i) {
  const e = Y(i);
  e.classList.remove('bump'), e.offsetWidth, e.classList.add('bump');
}
function _n() {
  const i = kr(ie.xp),
    e = Sa[i - 1],
    t = Sa[i];
  (Y('level').textContent = String(i)),
    (Y('coins').textContent = String(ie.coins)),
    (Y('xp-text').textContent = Ln(
      t ? `${ie.xp - e} / ${t - e} XP` : `${ie.xp} XP · Cấp cao nhất`,
    ));
  const n = t ? Math.min(100, ((ie.xp - e) / (t - e)) * 100) : 100;
  (Y('xp-fill').style.width = `${n}%`),
    Y('xp-fill').parentElement.setAttribute('aria-valuenow', String(Math.round(n))),
    (Y('avatar-face').textContent = ie.avatar === 'girl' ? '👧' : '👦'),
    (Y('player-name').textContent = ie.avatar === 'girl' ? 'Nhà khám phá' : 'Nhà thám hiểm'),
    Y('boy').setAttribute('aria-pressed', String(ie.avatar === 'boy')),
    Y('girl').setAttribute('aria-pressed', String(ie.avatar === 'girl')),
    (Y('play').innerHTML = Ln(
      `${ie.started ? 'Tiếp tục phiêu lưu' : 'Bắt đầu phiêu lưu'} ${Xe('arrow')}`,
    )),
    (Y('quest-copy').textContent = ie.questComplete
      ? 'Bạn đã nối liền hai bờ! Hãy khám phá các vùng đất mới trên bản đồ, hoặc quay lại Milo để luyện tập.'
      : ie.bridge === yt
        ? 'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.'
        : ie.questAccepted
          ? 'Giúp Milo chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.'
          : 'Milo đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!'),
    (Y('quest-title').textContent = ie.questComplete
      ? 'Cây cầu tình bạn đã hoàn thành!'
      : 'Một cây cầu, ngàn niềm vui'),
    (Y('quest-progress').textContent = ie.questComplete
      ? '✓ Hoàn thành'
      : ie.bridge === yt
        ? 'Đi qua cầu để hoàn thành'
        : ie.questAccepted
          ? `${ie.bridge} / ${yt} đoạn cầu`
          : 'Gặp người dẫn đường'),
    (Y('quest-steps').innerHTML = Array.from(
      { length: yt },
      (r, s) =>
        `<span class="${s < ie.bridge ? 'done' : ''}" aria-label="Đoạn ${s + 1}: ${s < ie.bridge ? 'đã xây' : 'chưa xây'}">${s < ie.bridge ? Xe('check') : s + 1}</span>`,
    ).join('')),
    (Y('bridge-count').textContent = `${ie.bridge} / ${yt} đoạn cầu`);
  for (const r of qa) {
    const s = Y(`${r.id}-label`),
      a = Di(r, ie.questComplete);
    s.classList.toggle('locked', !a),
      (s.querySelector('.region-icon').textContent = a ? r.icon : '🔒');
  }
  (Y('sound').innerHTML = Xe(ie.sound ? 'sound' : 'mute')),
    Y('sound').setAttribute('aria-label', ie.sound ? 'Tắt âm thanh' : 'Bật âm thanh'),
    (xt.enabled = ie.sound),
    Wa(Y('hud'));
}
function nc(i) {
  Y('quest-card').classList.toggle('collapsed', i),
    Y('quest-toggle').setAttribute('aria-expanded', String(!i));
  try {
    localStorage.setItem('aigame3d_quest_collapsed', i ? '1' : '0');
  } catch {}
}
Y('quest-toggle').onclick = () => nc(!Y('quest-card').classList.contains('collapsed'));
try {
  (localStorage.getItem('aigame3d_quest_collapsed') === '1' ||
    matchMedia('(max-width: 700px)').matches) &&
    nc(!0);
} catch {}
function Jn(i, e, t) {
  Dn && Kr(),
    (_e.paused = !0),
    _e.clearInput(),
    (Xa = t),
    (Y('dialog-content').innerHTML = Ln(`<h2 id="dialog-title">${i}</h2>${e}`));
  const n = Y('dialog');
  n.open || n.showModal();
}
function cr() {
  Y('dialog').close();
}
Y('dialog').addEventListener('close', () => {
  (_e.paused = Dn), _e.clearInput(), (Xa = ''), (jn = void 0);
});
Y('close-dialog').onclick = cr;
Y('language').onclick = () => {
  rg(Va() === 'vi' ? 'en' : 'vi'), location.reload();
};
function ug() {
  xt.unlock(),
    xt.music(ie.music),
    (ie.started = !0),
    (_e.active = !0),
    (_e.paused = !1),
    _e.setAvatar(ie.avatar),
    (Y('welcome').hidden = !0),
    (Y('hud').hidden = !1),
    (Y('area-label').hidden = !1),
    (Y('world-caption').hidden = !0),
    (Y('menu-footer').hidden = !0),
    document.body.classList.add('playing'),
    Xt(),
    _n(),
    (bi = ''),
    cc(),
    requestAnimationFrame(sc),
    In('Chào bạn! Di chuyển đến Milo, hoặc chạm xuống đất để đi.');
}
function pl() {
  cr(),
    Kr(),
    (_e.active = !1),
    _e.clearInput(),
    (Y('welcome').hidden = !1),
    (Y('hud').hidden = !0),
    (Y('area-label').hidden = !0),
    (Y('world-caption').hidden = !1),
    (Y('menu-footer').hidden = !1),
    document.body.classList.remove('playing'),
    _n(),
    xt.music(!1);
}
Y('play').onclick = ug;
for (const i of ['boy', 'girl'])
  Y(i).onclick = () => {
    (ie.avatar = i), _e.setAvatar(i), _n(), Xt();
  };
function Yr() {
  if (!_e.active || _e.paused) return;
  if (!ec) {
    In('Hãy đến gần Milo — người bạn có chiếc mũ xanh bên bờ sông.');
    return;
  }
  xt.unlock();
  const i = ie.bridge === yt;
  Jn(
    'Chào bạn, mình là Milo!',
    `<div class="dialog-eyebrow">NGƯỜI DẪN ĐƯỜNG CỦA BẠN</div><p class="dialog-copy">${i ? 'Cây cầu của chúng mình thật đẹp! ' + (ie.questComplete ? 'Bạn muốn cùng mình luyện thêm phép nhân không?' : 'Bạn hãy đi qua cầu đến khu vườn bên kia nhé. Mình cũng luôn sẵn sàng luyện tập cùng bạn!') : 'Khu vườn bên kia sông đang chờ chúng mình. Hãy giúp mình xây <strong>6 đoạn cầu</strong> bằng những viên đá phép thuật nhé!'}</p><div class="milo-tip"><span>✦</span><p>${i ? 'Cứ thong thả, không cần vội. Mỗi lần thử là một lần bạn tiến bộ!' : 'Chọn phép nhân cho đúng số viên đá. Mỗi câu đúng: <b>+10 XP, +5 xu</b>. Nếu chưa đúng, chúng mình cùng đếm lại!'}</p></div><button id="accept-quest" class="primary wide">${i ? 'Cùng luyện tập' : 'Cùng xây cầu nào!'} ${Xe('arrow')}</button>`,
    'milo',
  ),
    (Y('accept-quest').onclick = () => {
      (ie.questAccepted = !0), Xt(), _n(), Xr(i ? 'practice' : 'bridge');
    });
}
Y('interact').onclick = Yr;
Y('milo-label').onclick = Yr;
function Xr(i, e = '') {
  (Kt = i), (jn = Jm(ie, Kt, e)), (Yn = 0), (ya = !1), (ba = performance.now());
  const t = jn;
  Jn(
    Kt === 'bridge' ? 'Cùng xây cây cầu!' : 'Mỗi ngày, giỏi hơn một chút',
    `<div class="dialog-eyebrow">${Kt === 'bridge' ? `ĐOẠN CẦU ${ie.bridge + 1} / ${yt}` : t.review ? 'ÔN LẠI PHÉP NHÂN' : 'LUYỆN TẬP CÙNG MILO'}</div><p class="question-intro">${Kt === 'bridge' ? `Mình cần <strong>${t.answer} viên đá</strong>. Phép nhân nào đúng?` : 'Bạn tìm được kết quả không?'}</p><div class="equation">${Kt === 'bridge' ? `<span class="stone-symbol">◆</span> ${t.answer} <small>viên đá</small>` : `${t.a} <span>×</span> ${t.b} <span>=</span> ?`}</div><div class="answers">${t.options.map((n, r) => `<button class="answer" data-value="${n.value}"><kbd>${r + 1}</kbd><span>${n.label}</span></button>`).join('')}</div><div id="feedback" class="feedback" aria-live="polite"></div><div id="hint-area" class="hint-area" hidden></div><div class="quiz-footer"><button id="hint" class="text-button">${Xe('help')} Gợi ý cho mình</button><span>Không giới hạn thời gian</span></div><button id="next-question" class="primary wide" hidden>Tiếp tục ${Xe('arrow')}</button>`,
    'quiz',
  ),
    document
      .querySelectorAll('.answer')
      .forEach((n) => (n.onclick = () => fg(Number(n.dataset.value), n))),
    (Y('hint').onclick = () => {
      (Yn = Math.min(3, Yn + 1)), ic();
    }),
    (Y('next-question').onclick = () => {
      Kt === 'bridge' && ie.bridge === yt
        ? (cr(), In('Tuyệt vời! Cầu đã xây xong. Cùng đi qua cầu đến khu vườn nhé!'))
        : Xr(Kt, t.id);
    });
}
function ic() {
  if (!jn) return;
  const i = jn,
    e = Y('hint-area');
  (e.hidden = !1),
    (e.innerHTML = Ln(
      `<p>${tg(i, Yn)}</p><div class="stone-groups" aria-label="${i.a} nhóm, mỗi nhóm có ${i.b} viên đá">${Array.from({ length: i.a }, () => `<div class="stone-group">${'<i></i>'.repeat(i.b)}</div>`).join('')}</div>`,
    ));
}
function dg(i) {
  const e = document.createElement('b');
  (e.className = 'reward-pop'),
    (e.textContent = '+10 XP · +5'),
    e.insertAdjacentHTML('beforeend', Xe('coin')),
    i.append(e),
    e.addEventListener('animationend', () => e.remove());
}
function fg(i, e) {
  if (!jn || ya || e.disabled) return;
  xt.unlock();
  const t = jn,
    n = Qm(t, i);
  if ((eg(ie, t, n, performance.now() - ba), (ba = performance.now()), n)) {
    (ya = !0), Yn === 0 && (ie.review = ie.review.filter((s) => s !== t.id));
    const r = kr(ie.xp);
    (ie.xp += 10),
      (ie.coins += 5),
      Kt === 'bridge' && ((ie.bridge = Math.min(yt, ie.bridge + 1)), _e.setBridge(ie.bridge, !0)),
      document.querySelectorAll('.answer').forEach((s) => (s.disabled = !0)),
      e.classList.add('correct'),
      dg(e),
      (Y('feedback').className = 'feedback success'),
      (Y('feedback').textContent = Ln(
        `✓ Chính xác! ${t.a} × ${t.b} = ${t.answer}. +10 XP · +5 xu${ie.combo >= 3 ? ` · Combo ${ie.combo}!` : ''}`,
      )),
      (Y('next-question').hidden = !1),
      (Y('next-question').innerHTML = Ln(
        `${Kt === 'bridge' && ie.bridge === yt ? 'Khám phá bên kia cầu!' : Kt === 'bridge' ? 'Xây đoạn cầu tiếp theo' : 'Thử thêm một câu'} ${Xe('arrow')}`,
      )),
      (Y('hint').hidden = !0),
      xt.correct(),
      _e.burst(_e.player.position.clone().add(new F(0, 1, 0))),
      fl('wallet'),
      fl('xp-fill'),
      kr(ie.xp) > r && (xt.celebrate(), In(`Bạn đã đạt cấp ${kr(ie.xp)}. Thật tuyệt vời!`)),
      Y('next-question').focus();
  } else
    (Yn = Math.min(3, Yn + 1)),
      e.classList.add('incorrect'),
      (e.disabled = !0),
      (Y('feedback').className = 'feedback gentle'),
      (Y('feedback').textContent = Cn('↻ Chưa đúng rồi. Mình cùng đếm lại nhé!')),
      ic(),
      xt.hint();
  _n(), Xt();
}
function $a(i = ie.table || 2) {
  Jn(
    'Sổ cửu chương',
    `<div class="dialog-eyebrow">HỌC TỪNG CHÚT, NHỚ THẬT LÂU</div><div class="table-tabs" role="group" aria-label="Chọn bảng cửu chương">${Ha.map((e) => `<button data-table="${e}" aria-pressed="${e === i}">×${e}</button>`).join('')}</div><div class="multiplication-grid">${Array.from(
      { length: 10 },
      (e, t) => {
        const n = ie.questionStats[`m${i}_${t + 1}`];
        return `<div class="${n?.correct ? 'known' : ''}"><span>${i} × ${t + 1}</span><b>= ${i * (t + 1)}</b><small>${n?.correct ? '✓' : ''}</small></div>`;
      },
    ).join(
      '',
    )}</div><p class="book-note">Dấu ✓ là phép nhân bạn đã trả lời đúng. Mình luyện thêm nhé?</p><button id="practice-table" class="primary wide">Luyện bảng ×${i} ${Xe('arrow')}</button><button id="practice-all" class="text-button centered">Trộn các bảng ×2 – ×10</button>`,
    'book',
  ),
    document
      .querySelectorAll('[data-table]')
      .forEach((e) => (e.onclick = () => $a(Number(e.dataset.table)))),
    (Y('practice-table').onclick = () => {
      (ie.table = i), Xt(), Xr('practice');
    }),
    (Y('practice-all').onclick = () => {
      (ie.table = 0), Xt(), Xr('practice');
    });
}
Y('learn').onclick = () => $a();
Y('learn-welcome').onclick = () => $a();
function pg() {
  Jn(
    'Sẵn sàng phiêu lưu?',
    `<div class="help-list"><div><b>1</b><p><strong>Khám phá ngôi làng</strong>Nhấn WASD / phím mũi tên, hoặc chạm xuống đất để di chuyển. Trên màn hình cảm ứng, dùng cần điều khiển.</p></div><div><b>2</b><p><strong>Làm quen với Milo</strong>Đến gần chiếc mũ xanh rồi nhấn E hoặc nút “Nói chuyện”.</p></div><div><b>3</b><p><strong>Xây cầu bằng phép nhân</strong>Chọn 1 trong 3 đáp án. Cần giúp đỡ? Nhấn “Gợi ý cho mình”.</p></div><div><b>4</b><p><strong>Mở bản đồ thế giới</strong>Nhấn M hoặc chạm vào bản đồ nhỏ ở góc màn hình để xem các vùng đất.</p></div></div><div class="milo-tip"><p><b>Space</b>: nhảy · <b>Kéo trên làng</b>: xoay camera · <b>Lăn chuột</b>: phóng to / thu nhỏ · <b>Esc</b>: tạm dừng.</p></div><button id="understood" class="primary wide">Mình hiểu rồi! ${Xe('check')}</button>`,
    'help',
  ),
    (Y('understood').onclick = cr);
}
Y('help').onclick = pg;
function Ti() {
  const i = Object.values(ie.questionStats),
    e = i.reduce((n, r) => n + r.attempts, 0),
    t = i.reduce((n, r) => n + r.correct, 0);
  Jn(
    'Một chút cài đặt',
    `<div class="settings-row"><span>Hiệu ứng âm thanh</span><button id="toggle-sound" class="switch" role="switch" aria-checked="${ie.sound}" aria-label="Hiệu ứng âm thanh"><i></i></button></div><div class="settings-row"><span>Nhạc nền nhẹ nhàng</span><button id="toggle-music" class="switch" role="switch" aria-checked="${ie.music}" aria-label="Nhạc nền"><i></i></button></div><div class="progress-summary"><span><strong>${ie.xp}</strong>XP tích lũy</span><span><strong>${e}</strong>Lượt trả lời</span><span><strong>${e ? Math.round((t / e) * 100) : 0}%</strong>Trả lời đúng</span></div><p class="book-note">Tiến trình tự lưu trên trình duyệt này, không cần tài khoản. Xóa dữ liệu trình duyệt sẽ xóa tiến trình.</p><button id="save-now" class="secondary wide">${Xe('save')} Lưu tiến trình</button><button id="return-menu" class="text-button centered">Về màn hình chính</button><button id="reset-progress" class="text-button danger centered">${Xe('reset')} Chơi lại từ đầu</button>`,
    'settings',
  ),
    (Y('toggle-sound').onclick = () => {
      xt.unlock(), (ie.sound = !ie.sound), (xt.enabled = ie.sound), Xt(), _n(), Ti();
    }),
    (Y('toggle-music').onclick = () => {
      xt.unlock(), (ie.music = !ie.music), xt.music(ie.music), Xt(), Ti();
    }),
    (Y('save-now').onclick = () => {
      Xt() && In('Đã lưu hành trình của bạn trên thiết bị này.');
    }),
    (Y('return-menu').onclick = pl),
    (Y('reset-progress').onclick = () => {
      Jn(
        'Bắt đầu lại hành trình?',
        '<p class="dialog-copy">XP, xu, cây cầu và lịch sử luyện tập trên thiết bị này sẽ bị xóa. Không thể hoàn tác.</p><button id="confirm-reset" class="primary danger-bg wide">Xóa tiến trình và chơi lại</button><button id="cancel-reset" class="text-button centered">Giữ lại hành trình</button>',
        'reset',
      ),
        (Y('cancel-reset').onclick = Ti),
        (Y('confirm-reset').onclick = () => {
          (ie = Ga()),
            Xt(),
            _e.setBridge(0),
            _e.player.position.set(-6, 0, 6),
            _e.setAvatar(ie.avatar),
            _e.resetCamera(),
            pl(),
            In('Một hành trình mới đang chờ bạn!');
        });
    });
}
Y('settings').onclick = Ti;
Y('sound').onclick = () => {
  xt.unlock(), (ie.sound = !ie.sound), _n(), Xt();
};
Y('jump').onclick = () => _e.jump();
Y('zoom-in').onclick = () => _e.zoom(-8);
Y('zoom-out').onclick = () => _e.zoom(8);
function rc(i, e = i) {
  const t = _e.player.position;
  return {
    player: { x: t.x, z: t.z, facing: _e.player.rotation.y },
    milo: { x: _e.milo.position.x, z: _e.milo.position.z },
    bridge: ie.bridge,
    questComplete: ie.questComplete,
    selected: e ? Ei : void 0,
    labels: i,
    translate: Cn,
    time: performance.now() / 1e3,
  };
}
function sc() {
  const { ctx: i, w: e, h: t } = Jl(Y('minimap-canvas')),
    n = _e.player.position;
  Ql(i, e, t, { cx: n.x, cz: n.z, scale: e / 70, rotation: _e.heading }, rc(!1));
}
function ac() {
  if (!Dn) return;
  const i = Y('map-canvas'),
    { ctx: e, w: t, h: n } = Jl(i);
  Ql(e, t, n, oc(t, n), rc(t > 600, !0)), requestAnimationFrame(ac);
}
function oc(i, e) {
  const t = i > 820,
    n = lg(t ? i - 360 : i, t ? e : e * 0.62, t ? 56 : 22);
  return t ? (n.cx += 180 / n.scale) : (n.cz += (e * 0.19) / n.scale), n;
}
function Ya() {
  Y('map-regions').innerHTML = Ln(
    Dt.map((e) => {
      const t = Di(e, ie.questComplete);
      return `<button class="map-region${t ? '' : ' locked'}" data-region="${e.id}" aria-pressed="${Ei === e.id}"><span class="map-region-icon" style="--tint:${e.color}">${t ? e.icon : '🔒'}</span><span><strong>${e.name}</strong><small>${e.subtitle}</small></span>${bi === e.id ? '<em>Bạn ở đây</em>' : ''}</button>`;
    }).join(''),
  );
  const i = Dt.find((e) => e.id === Ei);
  (Y('map-detail').innerHTML = i
    ? Ln(
        `<strong>${i.icon} ${i.name}</strong><p>${i.blurb}</p>${Di(i, ie.questComplete) ? '' : `<p class="map-locked">${Xe('lock')} Mở khóa khi hoàn thành Cây cầu tình bạn</p>`}`,
      )
    : ''),
    document.querySelectorAll('[data-region]').forEach(
      (e) =>
        (e.onclick = () => {
          (Ei = e.dataset.region), Ya();
        }),
    );
}
function Ka() {
  !_e.active ||
    Y('dialog').open ||
    ((Dn = !0),
    (_e.paused = !0),
    _e.clearInput(),
    (Ei = bi || void 0),
    (Y('world-map').hidden = !1),
    Ya(),
    Wa(Y('world-map')),
    Y('close-map').focus(),
    requestAnimationFrame(ac));
}
function Kr() {
  Dn && ((Dn = !1), (Y('world-map').hidden = !0), (_e.paused = !1), _e.clearInput());
}
Y('minimap').onclick = Ka;
Y('open-map').onclick = Ka;
Y('close-map').onclick = Kr;
Y('map-canvas').addEventListener('click', (i) => {
  const e = i.currentTarget,
    t = e.getBoundingClientRect(),
    n = oc(t.width, t.height),
    r = cg(n, t.width, t.height, i.clientX - t.left, i.clientY - t.top);
  (Ei = hg(r.x, r.z)?.id), Ya();
});
document.addEventListener('keydown', (i) => {
  if (i.repeat && ['e', ' ', 'Escape', 'm', 'M'].includes(i.key)) return;
  if (Y('dialog').open) {
    if (Xa === 'quiz' && /^[123]$/.test(i.key)) {
      const t = document.querySelectorAll('.answer')[Number(i.key) - 1];
      t && !t.disabled && t.click();
    }
    return;
  }
  if (Dn) {
    (i.key === 'Escape' || i.key.toLowerCase() === 'm') && (i.preventDefault(), Kr());
    return;
  }
  if (!_e?.active) return;
  const e = i.key.toLowerCase();
  ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e) &&
    (i.preventDefault(), _e.keys.add(e)),
    e === ' ' && _e.jump(),
    e === 'e' && Yr(),
    e === 'm' && Ka(),
    e === 'escape' && (i.preventDefault(), Ti());
});
document.addEventListener('keyup', (i) => _e?.keys.delete(i.key.toLowerCase()));
window.addEventListener('blur', () => {
  _e?.clearInput(), _e?.active && !Dn && !Y('dialog').open && Ti();
});
document.addEventListener('visibilitychange', () => {
  _e?.clearInput(), document.hidden ? xt.music(!1) : _e?.active && xt.music(ie.music);
});
const nr = Y('joystick');
let Za = -1;
function lc(i) {
  if (i.pointerId !== Za) return;
  const e = nr.getBoundingClientRect();
  let t = (i.clientX - e.left - e.width / 2) / 34,
    n = (i.clientY - e.top - e.height / 2) / 34;
  const r = Math.max(1, Math.hypot(t, n));
  (t /= r),
    (n /= r),
    (_e.joystick = { x: t, y: n }),
    (Y('joystick-knob').style.transform = `translate(${t * 30}px,${n * 30}px)`);
}
nr.addEventListener('pointerdown', (i) => {
  (Za = i.pointerId), nr.setPointerCapture(i.pointerId), lc(i);
});
nr.addEventListener('pointermove', lc);
for (const i of ['pointerup', 'pointercancel'])
  nr.addEventListener(i, () => {
    (Za = -1), (_e.joystick = { x: 0, y: 0 }), (Y('joystick-knob').style.transform = '');
  });
function Ls(i, e, t, n) {
  const r = _e.project(e),
    s = Math.max(0, Math.min(1, 1 - (r.distance - 70) / 70));
  (i.hidden = n || !r.visible || s <= 0),
    !i.hidden &&
      ((i.style.transform = `translate(${r.x}px,${r.y}px) ${t}`), (i.style.opacity = String(s)));
}
function cc() {
  const i = _e.player.position,
    e = Xm(i.x, i.z);
  if (e.id === bi) return;
  const t = bi === '';
  (bi = e.id),
    (Y('area-icon').textContent = e.icon),
    (Y('area-name').textContent = Cn(e.name)),
    (Y('area-sub').textContent = Cn(e.subtitle));
  const n = Y('area-label');
  n.classList.remove('arrive'),
    n.offsetWidth,
    n.classList.add('arrive'),
    !t &&
      _e.active &&
      e.id !== 'village' &&
      e.id !== 'garden' &&
      Di(e, ie.questComplete) &&
      In(Va() === 'vi' ? `Chào mừng đến ${e.name}!` : `Welcome to ${Cn(e.name)}!`);
}
try {
  (_e = new $m(Y('world'))),
    _e.setBridge(ie.bridge),
    _e.setAvatar(ie.avatar),
    (_e.onJump = () => xt.jump()),
    (_e.onSceneClick = () => Yr()),
    (_e.onFrame = (i, e) => {
      if (((ec = i), !(++ul % 2 !== 0 || !_e.active))) {
        (Y('interact').hidden = !i || _e.paused),
          Ls(Y('milo-label'), new F(-3, 3.5, 1.5), 'translate(-50%,-100%)', _e.paused),
          Ls(Y('bridge-label'), new F(7, 0.8, 0), 'translate(-50%,15px)', _e.paused);
        for (const t of qa)
          Ls(
            Y(`${t.id}-label`),
            new F(t.center[0], t.labelHeight, t.center[1]),
            'translate(-50%,-100%)',
            _e.paused,
          );
        Y('milo-label').classList.toggle('near', i),
          cc(),
          ul % 6 === 0 && sc(),
          _e.active &&
            !_e.paused &&
            ie.bridge === yt &&
            !ie.questComplete &&
            e &&
            ((ie.questComplete = !0),
            (ie.xp += 50),
            (ie.coins += 10),
            Xt(),
            _n(),
            xt.celebrate(),
            _e.burst(_e.player.position.clone().add(new F(0, 1, 0))),
            Jn(
              'Bạn đã làm được rồi!',
              `<div class="completion-medal">${Xe('crown')}</div><p class="dialog-copy centered">Nhờ bạn, hai bờ đã được nối liền.<br><b>Cây cầu tình bạn</b> đã hoàn thành!</p><div class="completion-rewards"><span>★ +50 XP</span><span>◉ +10 xu</span></div><p class="book-note centered">4 vùng đất mới đã mở trên bản đồ. Nhấn M để xem!</p><button id="keep-playing" class="primary wide">Tiếp tục khám phá ${Xe('arrow')}</button>`,
              'complete',
            ),
            (Y('keep-playing').onclick = cr));
      }
    }),
    (Y('loading').hidden = !0),
    _n();
} catch (i) {
  (Y('loading').innerHTML =
    '<strong>Chưa mở được thế giới 3D</strong><p>Hãy bật tăng tốc đồ họa trong trình duyệt, hoặc thử Chrome / Edge mới hơn.</p><button class="primary" onclick="location.reload()">Thử lại</button>'),
    console.error(i);
}
const ml = document.modelContext,
  hc = new AbortController();
if (ml?.registerTool)
  try {
    Promise.resolve(
      ml.registerTool(
        {
          name: 'read_adventure_progress',
          description:
            'Read local progress in Multiplication Kingdom: XP, coins, completed bridge segments and review count.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: !1 },
          annotations: { readOnlyHint: !0 },
          execute: async (i) => {
            if (!i || typeof i != 'object' || Array.isArray(i) || Object.keys(i).length)
              throw new Error('Expected an empty object');
            return {
              xp: ie.xp,
              coins: ie.coins,
              bridgeSegments: ie.bridge,
              questComplete: ie.questComplete,
              reviewCount: ie.review.length,
            };
          },
        },
        { signal: hc.signal },
      ),
    ).catch(() => {});
  } catch {}
window.addEventListener('pagehide', () => hc.abort(), { once: !0 });
