// Column-calc scene (boost, Phase 2A): the column layout — operands right-aligned
// by place, the op sign, the result row ('?' until filled, the buggy row for
// find-error), the focus column in gold. Runs in node with a stubbed document
// (the same pattern as the kit widget tests). RED-first: the renderer does not
// exist yet.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ColumnCalcScene } from '../../../arithmetic/column-calc-scene-types';
import { sceneRenderer } from './column-calc-scene-svg';

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

function render(scene: ColumnCalcScene): string {
  stubDocument();
  const svg = sceneRenderer.render(scene as never);
  return (svg as unknown as FakeSvgElement).outerHTML;
}

const count = (svg: string, text: string): number => svg.split(`>${text}<`).length - 1;

describe('column-calc scene', () => {
  it('draws 385 + 247 aligned, three "?" in the result row, units focused', () => {
    const svg = render({
      kind: 'column-calc',
      op: '+',
      top: 385,
      bottom: 247,
      filled: [],
      carries: [],
      focusCol: 0,
    });
    expect(svg).toContain('>+<');
    for (const d of ['3', '8', '5', '2', '4', '7']) expect(svg).toContain(`>${d}<`);
    expect(count(svg, '?')).toBe(3);
    expect(svg).toContain('ds-highlight');
    // No carry marks: nothing is confirmed yet.
    expect(svg).not.toContain('>1<');
    // Focus rect behind the units column (n = 3, centre 302, x = 274).
    expect(svg).toContain('x="274"');
  });

  it('shows the buggy row for find-error instead of "?"', () => {
    const svg = render({
      kind: 'column-calc',
      op: '−',
      top: 403,
      bottom: 158,
      filled: [],
      carries: [],
      focusCol: 0,
      buggy: [5, 5, 3],
    });
    expect(svg).toContain('>−<');
    expect(count(svg, '?')).toBe(0);
    // The buggy row reads 355 left-to-right after the operands.
    const afterOperands = svg.slice(svg.lastIndexOf('>8<'));
    expect(afterOperands).toContain('>3<');
    expect(afterOperands).toContain('>5<');
  });

  it('draws confirmed carry marks above the next column', () => {
    const svg = render({
      kind: 'column-calc',
      op: '+',
      top: 385,
      bottom: 247,
      filled: [2],
      carries: [1, 1],
      focusCol: 1,
    });
    // Two small "1" marks, and no other "1" anywhere in this fixture.
    expect(count(svg, '1')).toBe(2);
    // One filled digit, two "?" left.
    expect(count(svg, '?')).toBe(2);
    // Focus rect behind the tens column (centre 238, x = 210).
    expect(svg).toContain('x="210"');
  });

  it('fits five columns (find-error T2/T3) inside the viewBox', () => {
    const svg = render({
      kind: 'column-calc',
      op: '−',
      top: 12345,
      bottom: 678,
      filled: [],
      carries: [],
      focusCol: 4,
      buggy: [7, 6, 6, 1, 1],
    });
    for (const d of ['1', '2', '3', '4', '5', '6', '7', '8']) expect(svg).toContain(`>${d}<`);
    // Focus rect behind the leftmost column (centre 110, x = 82).
    expect(svg).toContain('x="82"');
  });

  it('fits six columns (find-error T3, result up to 100 000) inside the viewBox', () => {
    const svg = render({
      kind: 'column-calc',
      op: '−',
      top: 99999,
      bottom: 1,
      filled: [],
      carries: [],
      focusCol: 5,
      buggy: [0, 0, 0, 0, 0, 1],
    });
    // Every x coordinate in the picture stays inside the 420-wide viewBox
    // (the ` x=` / ` x1=` / ` x2=` attributes; `rx=` is not an x position).
    const xs = [...svg.matchAll(/ x[12]?="(-?\d+)"/g)].map((m) => Number(m[1]));
    expect(xs.length).toBeGreaterThan(0);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(420);
    }
    // The leftmost focus rect starts inside the frame (n = 6, centre 88, x = 62).
    expect(svg).toContain('x="62"');
  });
});
