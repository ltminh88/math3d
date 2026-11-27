// Number-line scene (boost, Phase 1A): the marks read left to right and the
// jump arcs point in the jump's direction, taller for a bigger jump (R103.1).
// Runs in node with a stubbed document (the same pattern as the kit widget
// tests and the length-ladder scene test).
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NumberScene } from '../../../numbers/numbers-scene-types';
import { sceneRenderer } from './number-line-scene-svg';

class FakeSvgElement {
  readonly children: FakeSvgElement[] = [];
  textContent = '';
  private readonly attrs = new Map<string, string>();

  constructor(readonly tag: string) {}

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  append(...nodes: FakeSvgElement[]): void {
    this.children.push(...nodes);
  }

  get classList(): { add: (name: string) => void } {
    return { add: () => {} };
  }

  get outerHTML(): string {
    const attrs = [...this.attrs.entries()].map(([k, v]) => ` ${k}="${v}"`).join('');
    const inner = this.textContent + this.children.map((c) => c.outerHTML).join('');
    return `<${this.tag}${attrs}>${inner}</${this.tag}>`;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubDocument(): void {
  vi.stubGlobal('document', {
    createElementNS: (_ns: string, tag: string) => new FakeSvgElement(tag),
  });
}

function render(scene: NumberScene): string {
  stubDocument();
  const svg = sceneRenderer.render(scene as never);
  return (svg as unknown as FakeSvgElement).outerHTML;
}

// 582 − 524: jumps −500, −20, −4; marks ascending, '?' on the landing (58).
const SUB_SCENE: NumberScene = {
  kind: 'number-line',
  start: 582,
  step: -1,
  marks: [58, 62, 82, 582],
  missing: [0],
  jumps: [
    { from: 582, by: -500 },
    { from: 82, by: -20 },
    { from: 62, by: -4 },
  ],
};

// 58 + 524: jumps +500, +20, +4; marks ascending, '?' on the landing (582).
const ADD_SCENE: NumberScene = {
  kind: 'number-line',
  start: 58,
  step: 1,
  marks: [58, 558, 578, 582],
  missing: [3],
  jumps: [
    { from: 58, by: 500 },
    { from: 558, by: 20 },
    { from: 578, by: 4 },
  ],
};

describe('number-line scene', () => {
  it('draws the marks left to right, ascending, with ? on the landing', () => {
    const svg = render(SUB_SCENE);
    const at = (label: string): number => svg.indexOf(`>${label}<`);
    expect(at('58')).toBe(-1); // 58 is the missing landing: '?' takes its place
    expect(svg).toContain('>?<');
    expect(at('62')).toBeGreaterThan(-1);
    expect(at('82')).toBeGreaterThan(-1);
    expect(at('582')).toBeGreaterThan(-1);
    expect(at('62')).toBeLessThan(at('82'));
    expect(at('82')).toBeLessThan(at('582'));
    const add = render(ADD_SCENE);
    expect(add.indexOf('>58<')).toBeLessThan(add.indexOf('>558<'));
    expect(add.indexOf('>558<')).toBeLessThan(add.indexOf('>578<'));
    expect(add).toContain('>?<');
  });

  it('points the jump arrows left for subtraction, right for addition', () => {
    // xOf: mark i sits at 60 + 100i. Subtraction landings: 82 at x=260,
    // 62 at x=160, 58 at x=60 — each arrowhead's tip is its landing x and
    // its base is 10 to the right (pointing left).
    const sub = render(SUB_SCENE);
    expect(sub).toContain('260,70 270,65 270,75');
    expect(sub).toContain('160,70 170,65 170,75');
    expect(sub).toContain('60,70 70,65 70,75');
    // Addition landings: 558 at x=160, 578 at x=260, 582 at x=360 — each
    // arrowhead's base is 10 to the left (pointing right).
    const add = render(ADD_SCENE);
    expect(add).toContain('160,70 150,65 150,75');
    expect(add).toContain('260,70 250,65 250,75');
    expect(add).toContain('360,70 350,65 350,75');
  });

  it('draws the hundred-step arc taller than the unit-step arc', () => {
    // Arc control point: LINE_Y − height, height 48 for |by| ≥ 100, 22 below
    // 10. Subtraction: −500 spans x 360→260 (mid 310, control y 22),
    // −4 spans x 160→60 (mid 110, control y 48).
    const sub = render(SUB_SCENE);
    expect(sub).toContain('Q 310,22');
    expect(sub).toContain('Q 110,48');
    const add = render(ADD_SCENE);
    expect(add).toContain('Q 110,22');
    expect(add).toContain('Q 310,48');
  });
});
