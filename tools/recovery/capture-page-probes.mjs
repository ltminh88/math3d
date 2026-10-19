// Self-contained functions evaluated inside the page (page.evaluate). No closures over module scope.

/** DOM + computed-style + storage snapshot of the game UI. */
export function snapshotDomState() {
  const app = document.getElementById('app');
  const styles = [];
  for (const el of [app, ...app.querySelectorAll('*')]) {
    const cs = getComputedStyle(el);
    // Sorted: Chrome enumerates custom properties (--x) in nondeterministic order.
    const props = Array.from(cs).sort();
    const decls = props.map((name) => `${name}:${cs.getPropertyValue(name)};`).join('');
    styles.push(`${el.tagName}#${el.id}.${el.getAttribute('class') ?? ''}|${decls}`);
  }
  const storage = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    storage[key] = localStorage.getItem(key);
  }
  return {
    html: app.outerHTML,
    computedStyles: styles.join('\n'),
    storage: Object.fromEntries(Object.entries(storage).sort(([a], [b]) => a.localeCompare(b))),
    audioCalls: window.__parityAudio?.length ?? 0,
    bodyClass: document.body.className,
    dialog: document.getElementById('dialog')?.open ?? false,
  };
}

/** Scene-graph dump of window.__parity (oracle / local builds only). */
export function dumpSceneGraph() {
  const world = window.__parity;
  if (!world) return null;
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  const vec = (v) => [r4(v.x), r4(v.y), r4(v.z)];
  const mat = (m) => {
    if (!m) return null;
    if (Array.isArray(m)) return m.map(mat);
    return {
      type: m.type,
      color: m.color ? m.color.getHexString() : null,
      roughness: m.roughness ?? null,
      metalness: m.metalness ?? null,
      flatShading: m.flatShading ?? null,
      vertexColors: m.vertexColors ?? null,
      transparent: m.transparent,
      opacity: r4(m.opacity),
      side: m.side,
      map: Boolean(m.map),
    };
  };
  const node = (o) => {
    const out = { type: o.type, name: o.name, visible: o.visible, position: vec(o.position) };
    out.rotation = vec(o.rotation);
    out.scale = vec(o.scale);
    if (o.castShadow || o.receiveShadow) out.shadow = [o.castShadow, o.receiveShadow];
    if (o.geometry) {
      const g = o.geometry;
      out.geometry = {
        type: g.type,
        vertices: g.attributes.position?.count ?? 0,
        indices: g.index?.count ?? null,
        params: g.parameters ? JSON.parse(JSON.stringify(g.parameters)) : null,
      };
    }
    if (o.material) out.material = mat(o.material);
    if (o.isInstancedMesh) out.instances = o.count;
    if (o.isLight) out.light = { color: o.color.getHexString(), intensity: r4(o.intensity) };
    if (o.children.length) out.children = o.children.map(node);
    return out;
  };
  const info = world.renderer.info;
  return {
    lowPower: world.lowPower,
    renderInfo: {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    },
    camera: { position: vec(world.camera.position), fov: world.camera.fov },
    player: vec(world.player.position),
    scene: node(world.scene),
  };
}

/** Client coordinates of a world-label's projected anchor (its translate(x,y) origin). */
export function labelAnchorPoint([selector, offsetY = 0]) {
  const el = document.querySelector(selector);
  const m = /translate\(([-\d.e]+)px,\s*([-\d.e]+)px\)/.exec(el?.style.transform ?? '');
  if (!el || el.hidden || !m) return null;
  const parent = (el.offsetParent ?? document.body).getBoundingClientRect();
  const x = parent.left + Number(m[1]);
  const y = parent.top + Number(m[2]) + offsetY;
  return { x, y, hit: document.elementFromPoint(x, y)?.id ?? null };
}

/** Index of the correct (or first enabled wrong) bridge-quiz answer button. */
export function quizAnswerIndex(correct) {
  const strong = document.querySelector('.question-intro strong');
  const answer = Number.parseInt(strong?.textContent ?? '', 10);
  if (!Number.isFinite(answer)) return -1;
  const buttons = [...document.querySelectorAll('.answer')];
  return buttons.findIndex((b) => !b.disabled && (Number(b.dataset.value) === answer) === correct);
}
