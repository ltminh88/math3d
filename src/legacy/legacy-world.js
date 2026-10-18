// Legacy chunk "world" (recovered, mechanically split). Do not hand-edit; swap via shims/world.js.
import { ACESFilmicToneMapping, BackSide, BoxGeometry, BufferAttribute, CanvasTexture, Clock, Color, ConeGeometry, CylinderGeometry, DirectionalLight, DodecahedronGeometry, DoubleSide, Fog, Group, HemisphereLight, IcosahedronGeometry, InstancedMesh, MathUtils, Mesh, MeshStandardMaterial, Object3D, OctahedronGeometry, PCFSoftShadowMap, PerspectiveCamera, Plane, PlaneGeometry, Raycaster, SRGBColorSpace, Scene, ShaderMaterial, SphereGeometry, Vector2, Vector3, WebGLRenderer } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Cs, Dt, Ps, Qe, Wr, fe, qm, yt } from './shims/config.js';

class $m {
  constructor(e) {
    this.canvas = e;
    this.renderer = new WebGLRenderer({
      canvas: e,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.lowPower = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.lowPower ? 1.25 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(Cs);
    this.scene.fog = new Fog(Cs, 150, 560);
    this.scene.add(new HemisphereLight(15924223, 6059612, 2.6));
    this.sun = new DirectionalLight(16773321, 3.2);
    this.sun.castShadow = true;
    const t = this.lowPower ? 1024 : 2048;
    this.sun.shadow.mapSize.set(t, t);
    this.sun.shadow.normalBias = 0.045;
    this.sun.shadow.bias = -0.0003;
    this.scene.add(this.sun, this.sun.target);
    this.sky = this.createSky();
    this.scene.add(this.sky);
    this.terrain();
    this.village();
    this.garden();
    this.mathMeadow();
    this.forest();
    this.city();
    this.tower();
    this.westBank();
    this.createPlayer();
    this.createMilo();
    this.createBridge();
    this.scatter();
    this.decorate();
    this.scene.add(this.player, this.milo, this.bridge);
    this.mergeStatic();
    this.player.position.set(-6, 0, 6);
    this.milo.position.set(-3, 0, 1.5);
    this.obstacles.push({
      x: -3,
      z: 1.5,
      radius: 0.85,
    });
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(e.parentElement);
    this.resize();
    let n = {
      x: 0,
      y: 0,
      moved: false,
      id: -1,
    };
    e.addEventListener('pointerdown', (r) => {
      if (!(!this.active || this.paused)) {
        n = {
          x: r.clientX,
          y: r.clientY,
          moved: false,
          id: r.pointerId,
        };
        e.setPointerCapture(r.pointerId);
      }
    });
    e.addEventListener('pointermove', (r) => {
      if (n.id !== r.pointerId || !this.active || this.paused) {
        return;
      }
      const s = r.clientX - n.x;
      const a = r.clientY - n.y;
      if (Math.abs(s) + Math.abs(a) > 2) {
        n.moved = true;
      }
      this.yaw -= s * 0.006;
      this.pitch = MathUtils.clamp(this.pitch + a * 0.003, 0.5, 1.35);
      n.x = r.clientX;
      n.y = r.clientY;
    });
    e.addEventListener('pointerup', (r) => {
      if (n.id === r.pointerId) {
        if (!n.moved && !this.paused) {
          this.moveToScreen(r.clientX, r.clientY);
        }
        n.id = -1;
      }
    });
    e.addEventListener('pointercancel', () => {
      n.id = -1;
    });
    e.addEventListener(
      'wheel',
      (r) => {
        if (!(!this.active || this.paused)) {
          r.preventDefault();
          this.zoom(r.deltaY * 0.045);
        }
      },
      {
        passive: false,
      },
    );
    this.animate();
  }
  canvas;
  renderer;
  scene = new Scene();
  camera = new PerspectiveCamera(48, 1, 0.5, 1600);
  player = new Group();
  milo = new Group();
  bridge = new Group();
  goal = new Vector3(16, 0, 0);
  keys = new Set();
  materials = new Map();
  obstacles = [];
  sparks = [];
  floaters = [];
  clouds = [];
  ripples = [];
  windmill = new Group();
  sun;
  sky;
  legs = [];
  shirt;
  hair;
  ponytail;
  clock = new Clock();
  target = new Vector3(8, 0, 0);
  wanted = new Vector3();
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
  active = false;
  paused = false;
  joystick = {
    x: 0,
    y: 0,
  };
  onFrame;
  onJump;
  onSceneClick;
  material(e) {
    let t = this.materials.get(e);
    if (!t) {
      t = new MeshStandardMaterial({
        color: e,
        roughness: 0.9,
        metalness: 0,
      });
      this.materials.set(e, t);
    }
    return t;
  }
  mesh(e, t, n, r, s, a) {
    const o = new Mesh(t, this.material(n));
    o.position.set(r, s, a);
    o.castShadow = true;
    o.receiveShadow = true;
    e.add(o);
    return o;
  }
  box(e, t, n, r, s, a, o, l) {
    return this.mesh(e, new BoxGeometry(s, a, o), l, t, n, r);
  }
  sphere(e, t, n, r, s, a) {
    return this.mesh(e, new IcosahedronGeometry(s, 1), a, t, n, r);
  }
  cylinder(e, t, n, r, s, a, o, l, c = 8) {
    return this.mesh(e, new CylinderGeometry(s, a, o, c), l, t, n, r);
  }
  block(e, t, n, r) {
    this.obstacles.push({
      x: e.position.x + t,
      z: e.position.z + n,
      radius: r,
    });
  }
  regionGroup(e) {
    const t = Ps(e);
    const n = new Group();
    n.position.set(t.center[0], 0, t.center[1]);
    this.scene.add(n);
    return n;
  }
  sign(e, t, n, r, s, a, o = '#fffbea', l = '#194f42', c = 0) {
    const u = document.createElement('canvas');
    u.width = 256;
    u.height = 128;
    const h = u.getContext('2d');
    h.fillStyle = o;
    h.beginPath();
    h.roundRect(4, 4, 248, 120, 26);
    h.fill();
    h.fillStyle = l;
    h.font = '900 76px "Baloo 2", "Trebuchet MS", sans-serif';
    h.textAlign = 'center';
    h.textBaseline = 'middle';
    h.fillText(t, 128, 70);
    const f = new CanvasTexture(u);
    f.colorSpace = SRGBColorSpace;
    f.anisotropy = 4;
    const m = new Mesh(
      new PlaneGeometry(a, a / 2),
      new MeshStandardMaterial({
        map: f,
        transparent: true,
        roughness: 0.8,
        side: DoubleSide,
      }),
    );
    m.position.set(n, r, s);
    m.rotation.y = c;
    e.add(m);
    return m;
  }
  createSky() {
    const e = new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: {
          value: new Color(qm),
        },
        horizon: {
          value: new Color(Cs),
        },
      },
      vertexShader:
        'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying vec3 vDir; void main(){ float h = smoothstep(0.0, 0.55, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    });
    const t = new Mesh(new SphereGeometry(1200, 32, 16), e);
    t.renderOrder = -1;
    t.frustumCulled = false;
    return t;
  }
  groundHeight(e, t) {
    const n = Math.max(fe.west.minX - e, e - fe.east.maxX, 0);
    const r = Math.max(fe.minZ - t, t - fe.maxZ, 0);
    const s = Math.hypot(n, r);
    if (s < 8) {
      return 0;
    }
    const a = MathUtils.clamp((Math.abs(e - 7) - 7) / 24, 0, 1);
    const o =
      (Math.sin(e * 0.045) + Math.sin(t * 0.06 + 1.3) + Math.sin((e + t) * 0.025 + 2) + 3) / 6;
    return Math.min(1, (s - 8) / 70) * a * (3 + o * 20);
  }
  terrain() {
    const e = new PlaneGeometry(2400, 2400, 200, 200);
    e.rotateX(-Math.PI / 2);
    const t = e.attributes.position;
    const n = new Float32Array(t.count * 3);
    const r = new Color();
    const s = new Color(9357667);
    const a = new Color(11128682);
    const o = new Color(7319125);
    for (let h = 0; h < t.count; h++) {
      const f = t.getX(h);
      const m = t.getZ(h);
      const g = this.groundHeight(f, m);
      t.setY(h, g);
      const S = (Math.sin(f * 0.13 + m * 0.07) + Math.sin(m * 0.11 - f * 0.05)) * 0.25 + 0.5;
      r.copy(s)
        .lerp(S > 0.5 ? a : o, Math.abs(S - 0.5) * 1.4)
        .lerp(o, Math.min(0.5, g / 30));
      n.set([r.r, r.g, r.b], h * 3);
    }
    e.setAttribute('color', new BufferAttribute(n, 3));
    e.computeVertexNormals();
    const l = new Mesh(
      e,
      new MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        flatShading: true,
      }),
    );
    l.receiveShadow = true;
    this.scene.add(l);
    const c = 900;
    const u = this.box(
      this.scene,
      (Qe.riverMin + Qe.riverMax) / 2,
      -0.33,
      0,
      Qe.riverMax - Qe.riverMin,
      0.74,
      c,
      4765903,
    );
    u.castShadow = false;
    for (const h of [Qe.riverMin - 0.45, Qe.riverMax + 0.45]) {
      const f = this.box(this.scene, h, 0.012, 0, 0.9, 0.03, c, 14469528);
      f.castShadow = false;
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
      f.castShadow = false;
      this.ripples.push(f);
    }
    this.box(this.scene, -7, 0.055, 1, 21, 0.08, 3.2, 15390115);
    this.box(this.scene, -10, 0.055, -4, 3.1, 0.08, 20, 15390115);
    this.cylinder(this.scene, -6, 0.07, 5, 4.5, 4.5, 0.1, 15390115, 24);
    for (const h of Wr.slice(2)) {
      for (let f = 1; f < h.length; f++) {
        this.road(h[f - 1], h[f]);
      }
    }
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
    const s = n - e;
    const a = r - t;
    const o = Math.hypot(s, a);
    const l = this.box(this.scene, (e + n) / 2, 0.05, (t + r) / 2, 3, 0.07, o, 15390115);
    l.rotation.y = Math.atan2(s, a);
    l.castShadow = false;
    for (const [c, u] of [
      [e, t],
      [n, r],
    ]) {
      const h = this.cylinder(this.scene, c, 0.052, u, 1.5, 1.5, 0.07, 15390115, 16);
      h.castShadow = false;
    }
  }
  house(e, t, n, r = 1, s = 0) {
    const a = new Group();
    a.position.set(e, 0, t);
    a.scale.setScalar(r);
    a.rotation.y = s;
    this.box(a, 0, 1.5, 0, 3.6, 3, 3, 16773326);
    const o = this.cylinder(a, 0, 3.5, 0, 0, 3.1, 2, n, 4);
    o.rotation.y = Math.PI / 4;
    o.scale.z = 0.95;
    this.box(a, -0.85, 4.15, -0.65, 0.5, 1.5, 0.6, 15320736);
    this.box(a, -0.35, 0.95, 1.53, 0.9, 1.9, 0.15, 8608577);
    this.box(a, 1, 1.55, 1.53, 0.8, 0.8, 0.12, 5084579);
    this.box(a, 1, 1.55, 1.61, 0.08, 0.84, 0.07, 16777215);
    this.box(a, 1, 1.55, 1.61, 0.84, 0.08, 0.07, 16777215);
    this.box(a, 1, 1.02, 1.7, 1.1, 0.22, 0.4, 10381892);
    for (let l = 0; l < 4; l++) {
      this.sphere(a, 0.63 + l * 0.25, 1.23, 1.7, 0.18, l % 2 ? 16764504 : 15830657);
    }
    this.box(a, 0, 0.12, 1.85, 2.3, 0.25, 0.8, 14075041);
    this.scene.add(a);
    this.obstacles.push({
      x: e,
      z: t,
      radius: 2.35 * r,
    });
  }
  tree(e, t, n, r = 0) {
    const s = new Group();
    s.position.set(e, 0, t);
    s.scale.setScalar(n);
    this.cylinder(s, 0, 1.1, 0, 0.18, 0.26, 2.2, 9726787);
    const a = [3969888, 5678173, 7779153];
    if (r % 3 === 0) {
      this.cylinder(s, 0, 2.35, 0, 0, 1.35, 2.3, a[r % 3]);
      this.cylinder(s, 0, 3.35, 0, 0, 1, 1.9, 6401385);
    } else {
      this.sphere(s, 0, 2.7, 0, 1.35, a[r % 3]);
      this.sphere(s, -0.7, 2.25, 0.25, 0.9, a[(r + 1) % 3]);
      this.sphere(s, 0.6, 2.7, 0.3, 0.8, 8503138);
      if (r % 4 === 0) {
        for (let o = 0; o < 4; o++) {
          this.sphere(s, Math.cos(o * 2) * 0.8, 2.4 + Math.sin(o) * 0.4, 0.85, 0.17, 15967300);
        }
      }
    }
    this.scene.add(s);
    this.obstacles.push({
      x: e,
      z: t,
      radius: 0.45 * n,
    });
  }
  village() {
    this.house(-12, -6, 14191701, 1.25);
    this.house(-17, 6, 5410705, 0.9, 0.25);
    this.house(-4, -11, 12415075, 1);
    const e = new Group();
    e.position.set(-15, 0, -14);
    this.cylinder(e, 0, 2, 0, 1.2, 1.6, 4, 15851443);
    this.cylinder(e, 0, 4.7, 0, 0, 1.8, 1.9, 5476749);
    this.windmill.position.set(0, 3.2, 1.65);
    for (let n = 0; n < 4; n++) {
      const r = new Group();
      r.rotation.z = (n * Math.PI) / 2;
      this.box(r, 0, 1.6, 0, 0.18, 3, 0.18, 9203785);
      this.box(r, 0.4, 1.85, 0, 0.75, 1.7, 0.12, 16773579);
      this.windmill.add(r);
    }
    this.sphere(this.windmill, 0, 0, 0.1, 0.25, 15382107);
    e.add(this.windmill);
    this.scene.add(e);
    this.obstacles.push({
      x: -15,
      z: -14,
      radius: 1.8,
    });
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
    const t = new Group();
    t.position.set(0.4, 0, 3.4);
    this.box(t, 0, 0.7, 0, 0.17, 1.4, 0.17, 9201991);
    this.box(t, 0, 1.45, 0, 1.5, 0.65, 0.2, 12028500);
    this.scene.add(t);
  }
  garden() {
    for (let e = 0; e < 6; e++) {
      this.box(this.scene, 12 + e * 1.8, 0.65, 5, 0.15, 1.3, 0.15, 15918525);
    }
    this.box(this.scene, 16.5, 0.8, 5, 9.2, 0.15, 0.15, 15918525);
    for (let e = 0; e < 3; e++) {
      this.box(this.scene, 16 + e * 1.6, 0.09, -7, 1, 0.12, 5.5, 11703138);
      for (let t = 0; t < 6; t++) {
        this.sphere(this.scene, 16 + e * 1.6, 0.35, -9 + t * 0.8, 0.32, 5942105);
        this.sphere(this.scene, 16 + e * 1.6, 0.54, -9 + t * 0.8, 0.15, 15579480);
      }
    }
    this.cylinder(this.scene, 17.5, 2.1, 0, 0.08, 0.08, 4.2, 9138249);
    this.box(this.scene, 18.1, 3.6, 0, 1.2, 0.8, 0.06, 16763222);
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
        this.sphere(e, o, 0.42, s, 0.28, [15908181, 15304039, 7649703][(r + a) % 3]);
        this.cylinder(e, o, 0.25, s, 0.08, 0.11, 0.35, 6265681, 6);
      }
    }
    for (const r of [-2.4, 2.4]) {
      this.cylinder(e, r, 1.6, 7, 0.16, 0.2, 3.2, 9201991);
      this.sphere(e, r, 3.35, 7, 0.35, 16765028);
    }
    this.box(e, 0, 3.1, 7, 5.6, 0.22, 0.22, 9201991);
    this.sign(e, '× ÷', 0, 3.9, 7.05, 2.6, '#ffd064', '#6b4a1c');
    this.block(e, -2.4, 7, 0.3);
    this.block(e, 2.4, 7, 0.3);
    for (let r = 0; r < 7; r++) {
      const s = this.sphere(e, -7.4 + r * 2.4, 0.22, -6.2, 0.45, 15059349);
      s.rotation.y = r * 0.8;
    }
    const t = new Group();
    t.position.set(6.5, 0, -1);
    this.box(t, 0, 1.4, 0, 3, 2.8, 3.6, 13197903);
    const n = this.cylinder(t, 0, 3.2, 0, 0, 2.5, 1.4, 9062974, 4);
    n.rotation.y = Math.PI / 4;
    n.scale.z = 1.3;
    this.box(t, -1.52, 1, 0, 0.1, 1.8, 1.6, 16181188);
    e.add(t);
    this.block(e, 6.5, -1, 2.3);
    this.sign(t, '2 × 3', -1.6, 2.4, 0, 1.8, '#fffbea', '#8a4a3e', -Math.PI / 2);
  }
  forest() {
    const e = this.regionGroup('forest');
    const [t, n] = Ps('forest').center;
    this.box(e, 0, 0.04, 0, 20, 0.08, 16, 7316827);
    this.box(e, 0, 0.08, -2, 1.8, 0.12, 12, 13809533);
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
      const l = -6 + o * 2.6;
      const c = o % 2 ? 2 : -2;
      this.box(e, c, 0.08, l, 0.9, 0.12, 0.9, 9333580);
      this.sphere(e, c, 0.38, l, 0.3, 15252826);
    }
    for (let o = 0; o < 6; o++) {
      const l = -1 + (o % 3) * 1.1;
      const c = 3 + Math.floor(o / 3) * 1.2;
      this.cylinder(e, l, 0.2, c, 0.08, 0.1, 0.4, 16182484, 6);
      this.sphere(e, l, 0.45, c, 0.24, 14242634).scale.y = 0.6;
    }
    const s = new Group();
    s.position.set(0, 0, 5.5);
    this.box(s, 0, 1.1, 0, 3.2, 2.2, 2.4, 10120005);
    const a = this.cylinder(s, 0, 2.8, 0, 0, 2.5, 1.4, 4160088, 4);
    a.rotation.y = Math.PI / 4;
    this.box(s, 0, 0.8, -1.22, 0.8, 1.5, 0.08, 5979176);
    e.add(s);
    this.block(e, 0, 5.5, 2);
    this.sign(e, '÷ 3', 0, 2.2, -1.25, 1.5, '#fff4d8', '#3f7a58');
  }
  city() {
    const e = this.regionGroup('city');
    this.box(e, 0, 0.04, 0, 18, 0.08, 18, 12241078);
    this.box(e, 0, 0.07, 0, 18, 0.06, 2.6, 9278607);
    this.box(e, 0, 0.071, 0, 2.6, 0.06, 18, 9278607);
    const t = [15320702, 8566192, 15047544, 10197968];
    [
      [-5, -5, 4],
      [5, -5, 6],
      [-5, 5, 5],
      [5, 5, 3.4],
    ].forEach(([s, a, o], l) => {
      const c = new Group();
      c.position.set(s, 0, a);
      e.add(c);
      this.box(c, 0, o / 2, 0, 4.2, o, 3.8, t[l]);
      this.box(c, 0, o + 0.3, 0, 4.5, 0.6, 4.1, 15786688);
      for (let u = 1; u < o - 0.6; u += 1.3) {
        for (const h of [-1.2, 0, 1.2]) {
          this.box(c, h, u + 0.3, a < 0 ? 1.92 : -1.92, 0.6, 0.7, 0.06, 16643804);
        }
      }
      this.box(c, 0, 0.7, a < 0 ? 1.93 : -1.93, 0.9, 1.4, 0.08, 6508377);
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
      );
      this.block(e, s, a, 2.7);
    });
    const n = this.cylinder(e, 0, 0.12, 0, 2.4, 2.4, 0.18, 15192219, 20);
    n.castShadow = false;
    this.cylinder(e, 0, 0.6, 0, 0.5, 0.7, 0.9, 14206880, 12);
    const r = this.sphere(e, 0, 1.3, 0, 0.35, 8376544);
    this.floaters.push({
      object: r,
      baseY: 1.3,
      speed: 2,
      spin: 0,
    });
    this.block(e, 0, 0, 1);
    for (let s = 0; s < 8; s++) {
      const a = (s * Math.PI) / 4 + Math.PI / 8;
      this.cylinder(e, Math.cos(a) * 8, 1.2, Math.sin(a) * 8, 0.07, 0.09, 2.4, 4872794);
      this.sphere(e, Math.cos(a) * 8, 2.5, Math.sin(a) * 8, 0.22, 16770976);
    }
  }
  tower() {
    const e = this.regionGroup('tower');
    const t = this.cylinder(e, 0, 0.06, 0, 6.6, 7, 0.12, 10996090, 20);
    t.castShadow = false;
    this.cylinder(e, 0, 0.14, 0, 4.4, 4.6, 0.16, 14206100, 14).castShadow = false;
    this.cylinder(e, 0, 4.9, 0, 2.3, 2.9, 8, 7828392, 10);
    for (let r = 0; r < 3; r++) {
      this.cylinder(e, 0, 2.4 + r * 2.4, 0, 2.95 - r * 0.2, 2.95 - r * 0.2, 0.25, 15786688, 10);
    }
    this.cylinder(e, 0, 9.6, 0, 3.4, 0, 2, 15778909, 10);
    const n = this.sphere(e, 0, 11.6, 0, 0.6, 16768115);
    this.floaters.push({
      object: n,
      baseY: 11.6,
      speed: 1.4,
      spin: 1,
    });
    this.box(e, 0, 1.6, 2.72, 1.3, 2, 0.2, 4931435);
    this.sign(e, '× ÷ + −', 0, 7.4, 2.62, 3.2, '#fffbea', '#4b3f6b');
    this.block(e, 0, 0, 3.4);
    ['2', '×', '5', '=', '10'].forEach((r, s) => {
      const a = (s / 5) * Math.PI * 2;
      const o = new Group();
      o.position.set(Math.cos(a) * 5.4, 2.2, Math.sin(a) * 5.4);
      const l = this.mesh(
        o,
        new OctahedronGeometry(0.45),
        [10148336, 16167888, 16766836][s % 3],
        0,
        0,
        0,
      );
      l.scale.y = 1.5;
      this.sign(o, r, 0, 1.2, 0, 1.1, '#ffffffdd', '#4b3f6b');
      e.add(o);
      this.floaters.push({
        object: o,
        baseY: 2.2,
        speed: 1.2 + s * 0.15,
        spin: 0.6,
      });
    });
  }
  westBank() {
    const e = this.cylinder(this.scene, -38, 0.03, -11, 4.6, 4.6, 0.08, 6080214, 28);
    e.castShadow = false;
    for (let r = 0; r < 16; r++) {
      const s = (r / 16) * Math.PI * 2;
      const a = this.sphere(
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
      s.castShadow = false;
    }
    this.obstacles.push({
      x: -38,
      z: -11,
      radius: 4.8,
    });
    const t = this.sphere(this.scene, -40, -1.8, 18, 5.5, 8831582);
    t.scale.y = 0.45;
    t.castShadow = false;
    const n = new Group();
    n.position.set(-40, 0.6, 18);
    for (let r = 0; r < 6; r++) {
      const s = (r / 6) * Math.PI * 2;
      this.cylinder(n, Math.cos(s) * 1.6, 1.2, Math.sin(s) * 1.6, 0.1, 0.1, 2.4, 15918525);
    }
    this.cylinder(n, 0, 2.8, 0, 0, 2.3, 1.2, 14191701, 6);
    this.cylinder(n, 0, 0.1, 0, 2, 2, 0.2, 15390115, 12);
    this.scene.add(n);
    this.obstacles.push({
      x: -40,
      z: 18,
      radius: 2.2,
    });
    for (const [r, s, a] of [
      [-46, -34, 8],
      [-46, 34, 7],
      [66, -38, 7],
      [66, 38, 8],
      [-24, -40, 6],
      [30, 40, 6],
    ]) {
      const o = this.sphere(this.scene, r, -a * 0.55, s, a, 8371548);
      o.scale.y = 0.55;
      o.castShadow = false;
      this.obstacles.push({
        x: r,
        z: s,
        radius: a * 0.82,
      });
    }
  }
  scatter() {
    let e = 1337;
    const t = () => {
      e = (e * 16807) % 2147483647;
      return (e - 1) / 2147483646;
    };
    const n = (A, x, _) =>
      Wr.some((w) =>
        w.some((U, z) => {
          if (!z) {
            return false;
          }
          const [G, V] = w[z - 1];
          const [X, Z] = U;
          const H = X - G;
          const se = Z - V;
          const ue = MathUtils.clamp(((A - G) * H + (x - V) * se) / (H * H + se * se), 0, 1);
          return Math.hypot(A - G - H * ue, x - V - se * ue) < _;
        }),
      );
    const r = (A, x, _) =>
      x > fe.minZ + _ &&
      x < fe.maxZ - _ &&
      ((A > fe.west.minX + _ && A < fe.west.maxX - _) ||
        (A > fe.east.minX + _ && A < fe.east.maxX - _));
    const s = (A, x, _) =>
      Dt.some(
        (w) =>
          w.id !== 'forest' &&
          Math.abs(A - w.center[0]) < w.size[0] / 2 + _ &&
          Math.abs(x - w.center[1]) < w.size[1] / 2 + _,
      );
    const a = (A, x, _) =>
      !r(A, x, _) ||
      s(A, x, _) ||
      n(A, x, _ + 1) ||
      this.obstacles.some((w) => Math.hypot(A - w.x, x - w.z) < w.radius + _);
    const o = new Object3D();
    const l = new Color();
    const c = [];
    for (let A = 0; c.length < (this.lowPower ? 150 : 230) && A < 6000; A++) {
      const x = fe.west.minX + t() * (fe.east.maxX - fe.west.minX);
      const _ = fe.minZ + t() * (fe.maxZ - fe.minZ);
      const w = 0.8 + t() * 0.7;
      const U = Ps('forest');
      if (
        !(
          (Math.abs(x - U.center[0]) < U.size[0] / 2 + 1 &&
            Math.abs(_ - U.center[1]) < U.size[1] / 2 + 1) ||
          a(x, _, 1.4) ||
          c.some(([z, G]) => Math.hypot(x - z, _ - G) < 2.4)
        )
      ) {
        c.push([x, _, w, 0]);
        this.obstacles.push({
          x,
          z: _,
          radius: 0.45 * w,
        });
      }
    }
    const u = this.lowPower ? 450 : 900;
    for (let A = 0, x = 0; x < u && A < u * 12; A++) {
      const _ = -150 + t() * 310;
      const w = -140 + t() * 280;
      const U = Math.max(fe.west.minX - _, _ - fe.east.maxX, 0);
      const z = Math.max(fe.minZ - w, w - fe.maxZ, 0);
      const G = Math.hypot(U, z);
      if (!(G < 1.5 || Math.abs(_ - 7) < 6 || t() > (G < 22 ? 0.95 : 0.3))) {
        c.push([_, w, 0.9 + t() * 0.9, this.groundHeight(_, w) - 0.1]);
        x++;
      }
    }
    const h = this.material(16777215);
    const f = [3969888, 5678173, 7779153, 5216866, 6860888];
    const m = new InstancedMesh(
      new CylinderGeometry(0.18, 0.26, 2.2, 6),
      this.material(9726787),
      c.length,
    );
    const g = new InstancedMesh(new IcosahedronGeometry(1, 1), h, c.length * 2);
    const S = new InstancedMesh(new ConeGeometry(1, 1, 7), h, c.length * 2);
    let p = 0;
    let d = 0;
    c.forEach(([A, x, _, w], U) => {
      o.position.set(A, w + 1.1 * _, x);
      o.rotation.set(0, U, 0);
      o.scale.setScalar(_);
      o.updateMatrix();
      m.setMatrixAt(U, o.matrix);
      const z = f[U % f.length];
      if (U % 3 === 0) {
        for (const [G, V, X] of [
          [2.35, 1.35, 2.3],
          [3.35, 1, 1.9],
        ]) {
          o.position.set(A, w + G * _, x);
          o.scale.set(V * _, X * _, V * _);
          o.updateMatrix();
          S.setMatrixAt(d, o.matrix);
          S.setColorAt(d++, l.setHex(G > 3 ? 6401385 : z));
        }
      } else {
        for (const [G, V, X, Z] of [
          [0, 2.7, 0, 1.35],
          [-0.7, 2.25, 0.25, 0.9],
        ]) {
          o.position.set(A + G * _, w + V * _, x + X * _);
          o.scale.setScalar(Z * _);
          o.updateMatrix();
          g.setMatrixAt(p, o.matrix);
          g.setColorAt(p++, l.setHex(G ? 8503138 : z));
        }
      }
    });
    g.count = p;
    S.count = d;
    for (const A of [m, g, S]) {
      A.castShadow = true;
      A.receiveShadow = true;
      this.scene.add(A);
    }
    const E = new InstancedMesh(new DodecahedronGeometry(1, 0), this.material(12168334), 70);
    let b = 0;
    while (b < 70) {
      const A = fe.west.minX + t() * 120;
      const x = fe.minZ + t() * 88;
      if (a(A, x, 0.8)) {
        continue;
      }
      const _ = 0.25 + t() * 0.5;
      o.position.set(A, _ * 0.3, x);
      o.rotation.set(t(), t() * 6, 0);
      o.scale.set(_ * 1.3, _ * 0.7, _);
      o.updateMatrix();
      E.setMatrixAt(b++, o.matrix);
    }
    E.castShadow = true;
    E.receiveShadow = true;
    this.scene.add(E);
    const y = this.lowPower ? 700 : 1300;
    const P = new InstancedMesh(new IcosahedronGeometry(0.11, 0), this.material(16777215), y);
    const R = new InstancedMesh(new ConeGeometry(0.1, 0.35, 3), this.material(6399056), y);
    const L = new InstancedMesh(new ConeGeometry(0.16, 0.5, 4), this.material(7320915), y);
    for (b = 0; b < y; ) {
      const A = fe.west.minX + t() * 120;
      const x = fe.minZ + t() * 88;
      if (
        !(
          !r(A, x, 0.6) ||
          (A > -24 && A < 3 && Math.abs(x - 1) < 2) ||
          (Math.abs(A + 10) < 2 && x < 7 && x > -15) ||
          n(A, x, 1.7)
        )
      ) {
        o.rotation.set(0, t() * 6, 0);
        o.scale.setScalar(1);
        o.position.set(A, 0.19, x);
        o.updateMatrix();
        R.setMatrixAt(b, o.matrix);
        o.position.y = 0.39;
        o.updateMatrix();
        P.setMatrixAt(b, o.matrix);
        P.setColorAt(b, l.setHex([16770211, 16117975, 15313294, 12430304, 16167888][b % 5]));
        o.position.set(A + (t() - 0.5) * 3, 0.22, x + (t() - 0.5) * 3);
        o.scale.setScalar(0.7 + t() * 0.6);
        o.updateMatrix();
        L.setMatrixAt(b, o.matrix);
        b++;
      }
    }
    for (const A of [P, R, L]) {
      A.receiveShadow = true;
      this.scene.add(A);
    }
  }
  createPlayer() {
    const e = this.player;
    this.shirt = this.box(e, 0, 0.93, 0, 0.7, 0.8, 0.47, 15445570);
    this.sphere(e, 0, 1.67, 0, 0.45, 16766382);
    this.hair = this.sphere(e, 0, 1.93, -0.035, 0.43, 5323826);
    this.hair.scale.y = 0.65;
    this.ponytail = this.sphere(e, 0, 1.66, -0.39, 0.25, 5323826);
    this.ponytail.visible = false;
    for (const t of [-0.16, 0.16]) {
      this.sphere(e, t, 1.72, 0.394, 0.042, 2571317);
      const n = this.box(e, t, 0.3, 0, 0.25, 0.55, 0.28, 4349808);
      this.box(n, 0, -0.19, 0.08, 0.29, 0.16, 0.4, 16446166);
      this.legs.push(n);
    }
    this.box(e, -0.48, 0.94, 0, 0.2, 0.65, 0.23, 16766382);
    this.box(e, 0.48, 0.94, 0, 0.2, 0.65, 0.23, 16766382);
    this.box(e, 0, 1, -0.36, 0.52, 0.65, 0.3, 5872009);
    this.box(e, 0, 1, -0.54, 0.32, 0.25, 0.1, 15781238);
  }
  createMilo() {
    this.cylinder(this.milo, 0, 0.65, 0, 0.45, 0.7, 1.25, 5471870);
    this.sphere(this.milo, 0, 1.58, 0, 0.48, 16766123);
    this.cylinder(this.milo, 0, 2.15, 0, 0.08, 0.58, 0.95, 4486774);
    this.cylinder(this.milo, 0, 1.82, 0, 0.75, 0.75, 0.12, 4486774);
    for (const t of [-0.16, 0.16]) {
      this.sphere(this.milo, t, 1.6, 0.44, 0.045, 2702648);
    }
    this.sphere(this.milo, 0, 1.28, 0.33, 0.22, 16183513);
    this.box(this.milo, 0.7, 0.9, 0, 0.09, 1.8, 0.09, 10449480);
    this.sphere(this.milo, 0.7, 1.9, 0, 0.19, 16765546);
    const e = this.sphere(this.milo, 0, 3, 0, 0.19, 16764765);
    e.userData.beacon = true;
  }
  setAvatar(e) {
    this.shirt.material = this.material(e === 'girl' ? 9925816 : 15445570);
    this.ponytail.visible = e === 'girl';
  }
  createBridge() {
    for (let e = 0; e < yt; e++) {
      const t = new Group();
      t.position.x = Qe.riverMin + e + 0.5;
      this.box(t, 0, 0.12, 0, 0.97, 0.35, Qe.bridgeWidth, 12826773);
      this.box(t, 0, 0.33, 0, 0.86, 0.06, Qe.bridgeWidth - 0.15, 15062702);
      for (const n of [-1.6, 1.6]) {
        this.box(t, 0, 0.9, n, 0.17, 1.3, 0.17, 11109464);
        this.box(t, 0, 1.35, n, 1.08, 0.12, 0.15, 12559481);
      }
      t.visible = false;
      this.bridge.add(t);
    }
    for (const e of [3.6, 10.4]) {
      for (const t of [-1.85, 1.85]) {
        this.cylinder(this.scene, e, 0.65, t, 0.23, 0.3, 1.3, 13287582);
        this.sphere(this.scene, e, 1.4, t, 0.28, 16044924);
      }
    }
  }
  setBridge(e, t = false) {
    this.bridgeCount = e;
    this.bridge.children.forEach((n, r) => {
      n.visible = r < e;
      if (t && r === e - 1) {
        n.position.y = 3;
        this.burst(new Vector3(n.position.x, 0.8, 0));
      }
    });
  }
  decorate() {
    let e = 91;
    const t = () => {
      e = (e * 16807) % 2147483647;
      return (e - 1) / 2147483646;
    };
    for (let n = 0; n < 22; n++) {
      const r = new Group();
      const s = t() * Math.PI * 2;
      const a = 80 + t() * 110;
      r.position.set(10 + Math.cos(s) * a, 16 + t() * 10, Math.sin(s) * a);
      r.scale.setScalar(1.4 + t() * 1.4);
      for (let o = 0; o < 4; o++) {
        const l = this.sphere(r, o * 1.1, Math.sin(o) * 0.35, 0, 0.95 + (o % 2) * 0.4, 16055541);
        l.scale.set(1.4, 0.65, 1);
        l.castShadow = false;
        l.receiveShadow = false;
      }
      this.scene.add(r);
      this.clouds.push(r);
    }
    for (let n = 0; n < 18; n++) {
      const r = (n / 18) * Math.PI * 2 + t() * 0.2;
      const s = 230 + t() * 140;
      const a = new Group();
      const o = 10 + Math.cos(r) * s;
      const l = Math.sin(r) * s;
      if (Math.abs(o - 7) < 40) {
        continue;
      }
      a.position.set(o, this.groundHeight(o, l) - 1, l);
      a.rotation.y = t() * 6;
      const c = 16 + t() * 20;
      for (let u = 0; u < 3; u++) {
        const h = 10 + t() * 26;
        const f = this.cylinder(
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
        f.castShadow = false;
        if (h > 26) {
          this.cylinder(
            a,
            f.position.x,
            h * 0.9,
            f.position.z,
            0,
            c * 0.45 * 0.2 + 0.4,
            h * 0.2,
            16054514,
            7,
          ).castShadow = false;
        }
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
    ]);
    const t = (s) => !!s && (e.has(s) || t(s.parent));
    const n = new Set(this.materials.values());
    const r = new Map();
    this.scene.updateMatrixWorld(true);
    this.scene.traverse((s) => {
      if (
        !(s instanceof Mesh) ||
        s instanceof InstancedMesh ||
        Array.isArray(s.material) ||
        !n.has(s.material) ||
        t(s)
      ) {
        return;
      }
      const a = `${s.material.uuid}:${s.castShadow}`;
      let o = r.get(a);
      if (!o) {
        o = {
          material: s.material,
          cast: s.castShadow,
          geometries: [],
          meshes: [],
        };
        r.set(a, o);
      }
      const l = (s.geometry.index ? s.geometry.toNonIndexed() : s.geometry.clone()).applyMatrix4(
        s.matrixWorld,
      );
      for (const c of Object.keys(l.attributes)) {
        if (!['position', 'normal', 'uv'].includes(c)) {
          l.deleteAttribute(c);
        }
      }
      l.clearGroups();
      o.geometries.push(l);
      o.meshes.push(s);
    });
    for (const { material: s, cast: a, geometries: o, meshes: l } of r.values()) {
      if (l.length < 2) {
        o.forEach((h) => h.dispose());
        continue;
      }
      const c = mergeGeometries(o);
      o.forEach((h) => h.dispose());
      if (!c) {
        continue;
      }
      const u = new Mesh(c, s);
      u.castShadow = a;
      u.receiveShadow = true;
      this.scene.add(u);
      for (const h of l) {
        h.removeFromParent();
        h.geometry.dispose();
      }
    }
  }
  resize() {
    const { clientWidth: e, clientHeight: t } = this.canvas;
    this.renderer.setSize(e, t, false);
    this.camera.aspect = e / t;
    this.camera.updateProjectionMatrix();
  }
  floorHeight() {
    if (
      this.bridgeCount === yt &&
      this.player.position.x >= 4 &&
      this.player.position.x <= 10 &&
      Math.abs(this.player.position.z) < 1.4
    ) {
      return 0.36;
    }
    return 0;
  }
  jump() {
    if (this.active && !this.paused && this.player.position.y <= this.floorHeight() + 0.01) {
      this.jumpVelocity = 6.5;
      this.onJump?.();
    }
  }
  zoom(e) {
    this.distance = MathUtils.clamp(this.distance + e, 16, 110);
  }
  clearInput() {
    this.keys.clear();
    this.joystick = {
      x: 0,
      y: 0,
    };
    this.destination = undefined;
  }
  resetCamera() {
    this.yaw = 0.57;
    this.pitch = 0.95;
    this.distance = 42;
  }
  moveToScreen(e, t) {
    const n = this.canvas.getBoundingClientRect();
    const r = new Vector2(((e - n.left) / n.width) * 2 - 1, (-(t - n.top) / n.height) * 2 + 1);
    const s = new Raycaster();
    s.setFromCamera(r, this.camera);
    const a = new Vector3();
    if (s.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), a)) {
      if (a.distanceTo(this.milo.position) < 2.8 && this.nearMilo()) {
        this.onSceneClick?.(true);
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
    if (
      e < fe.west.minX + n ||
      e > fe.east.maxX - n ||
      t < fe.minZ + n ||
      t > fe.maxZ - n ||
      (e > Qe.riverMin - 0.3 &&
        e < Qe.riverMax + 0.3 &&
        (this.bridgeCount < yt || Math.abs(t) > 1.25))
    ) {
      return false;
    }
    return !this.obstacles.some(
      (r) => Math.abs(e - r.x) < r.radius + 0.35 && Math.hypot(e - r.x, t - r.z) < r.radius + 0.35,
    );
  }
  movement(e) {
    let t =
      (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) -
      (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0) +
      this.joystick.x;
    let n =
      (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) -
      (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0) +
      this.joystick.y;
    let r = t * Math.cos(this.yaw) + n * Math.sin(this.yaw);
    let s = -t * Math.sin(this.yaw) + n * Math.cos(this.yaw);
    if (t || n) {
      this.destination = undefined;
    } else if (this.destination) {
      r = this.destination.x - this.player.position.x;
      s = this.destination.z - this.player.position.z;
      if (Math.hypot(r, s) < 0.2) {
        this.destination = undefined;
        r = s = 0;
      }
    }
    const a = Math.hypot(r, s);
    if (a > 0.05) {
      r /= a;
      s /= a;
      const l = 6.5 * e;
      const c = this.player.position.x + r * l;
      const u = this.player.position.z + s * l;
      let h = false;
      if (this.canMove(c, this.player.position.z)) {
        this.player.position.x = c;
        h = true;
      }
      if (this.canMove(this.player.position.x, u)) {
        this.player.position.z = u;
        h = true;
      }
      if (!h) {
        this.destination = undefined;
      }
      this.player.rotation.y = Math.atan2(r, s);
      this.legs.forEach((f, m) => (f.rotation.x = Math.sin(this.time * 12 + m * Math.PI) * 0.55));
    } else {
      this.legs.forEach((l) => (l.rotation.x *= 0.8));
    }
    const o = this.floorHeight();
    if (this.player.position.y > o || this.jumpVelocity > 0) {
      this.jumpVelocity -= 18 * e;
      this.player.position.y = Math.max(o, this.player.position.y + this.jumpVelocity * e);
      if (this.player.position.y === o) {
        this.jumpVelocity = 0;
      }
    } else {
      this.player.position.y = o;
    }
  }
  burst(e) {
    for (let t = 0; t < 20; t++) {
      const n = this.sphere(this.scene, e.x, e.y, e.z, 0.09, [16765284, 16774343, 8246453][t % 3]);
      n.castShadow = false;
      this.sparks.push({
        mesh: n,
        life: 1.2,
        velocity: new Vector3(
          (Math.random() - 0.5) * 5,
          3 + Math.random() * 3,
          (Math.random() - 0.5) * 5,
        ),
      });
    }
  }
  project(e) {
    const t = e.clone().project(this.camera);
    const n = this.canvas.clientWidth;
    const r = this.canvas.clientHeight;
    const s = (t.x * 0.5 + 0.5) * n;
    const a = (-0.5 * t.y + 0.5) * r;
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
    if (e !== this.shadowSize) {
      this.shadowSize = e;
      Object.assign(this.sun.shadow.camera, {
        left: -e,
        right: e,
        top: e,
        bottom: -e,
        near: 1,
        far: e * 3.2,
      });
      this.sun.shadow.camera.updateProjectionMatrix();
    }
    this.sun.target.position.copy(this.target);
    this.sun.position.set(this.target.x - 24, 42, this.target.z + 16);
  }
  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    const e = Math.min(this.clock.getDelta(), 0.05);
    this.time += e;
    if (this.active && !this.paused) {
      this.movement(e);
    }
    if (this.active) {
      this.wanted.copy(this.player.position).setY(0);
    } else {
      this.wanted.set(8, 0, 0);
      this.yaw += e * 0.03;
    }
    this.target.lerp(this.wanted, 1 - Math.exp(-e * 3));
    const t = 1 - Math.exp(-e * 2.2);
    this.viewDistance +=
      ((this.active ? this.distance : this.camera.aspect < 0.85 ? 175 : 120) - this.viewDistance) *
      t;
    this.viewPitch += ((this.active ? this.pitch : 0.72) - this.viewPitch) * t;
    this.viewShift += ((!this.active && this.camera.aspect > 1.25 ? 0.16 : 0) - this.viewShift) * t;
    const { clientWidth: n, clientHeight: r } = this.canvas;
    if (this.viewShift > 0.001) {
      this.camera.setViewOffset(n, r, -this.viewShift * n, 0, n, r);
    } else if (this.camera.view?.enabled) {
      this.camera.clearViewOffset();
    }
    const s = this.viewDistance;
    const a = this.viewPitch;
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * Math.cos(a) * s,
      this.target.y + Math.sin(a) * s,
      this.target.z + Math.cos(this.yaw) * Math.cos(a) * s,
    );
    this.camera.lookAt(this.target);
    this.sky.position.copy(this.camera.position);
    this.updateShadows();
    this.windmill.rotation.z -= e * 0.25;
    this.bridge.children.forEach((o) => (o.position.y = Math.max(0, o.position.y - e * 5)));
    this.clouds.forEach((o, l) => {
      o.position.x += e * 0.35;
      if (o.position.x > 210) {
        o.position.x = -190;
      }
      o.position.y += Math.sin(this.time * 0.2 + l) * 0.002;
    });
    this.floaters.forEach((o) => {
      o.object.position.y = o.baseY + Math.sin(this.time * o.speed) * 0.25;
      o.object.rotation.y += e * o.spin;
    });
    this.milo.children.forEach((o) => {
      if (o.userData.beacon) {
        o.position.y = 3 + Math.sin(this.time * 2) * 0.15;
      }
    });
    for (let o = this.sparks.length - 1; o >= 0; o--) {
      const l = this.sparks[o];
      l.life -= e;
      l.velocity.y -= e * 6;
      l.mesh.position.addScaledVector(l.velocity, e);
      l.mesh.scale.setScalar(Math.max(0, l.life));
      if (l.life <= 0) {
        this.scene.remove(l.mesh);
        l.mesh.geometry.dispose();
        this.sparks.splice(o, 1);
      }
    }
    this.ripples.forEach((o) => {
      o.position.z += e * 0.25;
      if (o.position.z > 43) {
        o.position.z = -43;
      }
    });
    this.renderer.render(this.scene, this.camera);
    this.onFrame?.(
      this.nearMilo(),
      this.player.position.x > 12 && Math.abs(this.player.position.z) < 4,
      1 / Math.max(e, 0.001),
    );
  };
  dispose() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.renderer.dispose();
  }
}

export { $m };
