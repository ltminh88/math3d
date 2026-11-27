// Length-ladder scene (boost, Phase 2B): the SVG carries the four units, the
// factor arrows, and the gold highlight on the conversion's pair. Runs in node
// with a stubbed document (the same pattern as the kit widget tests).
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LengthScene } from '../../../measurement/length-scene-types';
import { sceneRenderer } from './length-ladder-scene-svg';

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

function render(scene: LengthScene): string {
  stubDocument();
  const svg = sceneRenderer.render(scene as never);
  return (svg as unknown as FakeSvgElement).outerHTML;
}

describe('length-ladder scene', () => {
  it('draws the four units with x10 arrows and no highlight by default', () => {
    const svg = render({ kind: 'length-ladder' });
    for (const unit of ['m', 'dm', 'cm', 'mm']) expect(svg).toContain(`>${unit}<`);
    expect(svg).toContain('>×10<');
    expect(svg).not.toContain('ds-highlight');
  });

  it('highlights the conversion pair and shows :10 going up', () => {
    const svg = render({ kind: 'length-ladder', highlight: ['cm', 'm'], arrows: ':10' });
    expect(svg).toContain('>:10<');
    const highlights = (svg.match(/ds-highlight/g) ?? []).length;
    expect(highlights).toBe(2);
  });

  it('points the arrows down for x10 and up for :10 (R90.3)', () => {
    // First gap: ax = 14 + 92 - 8 = 98, ay = 12 + 34 = 46.
    const down = render({ kind: 'length-ladder', arrows: '×10' });
    expect(down).toContain('114,56 106,50 108,62');
    expect(down).not.toContain('98,46 106,52 104,40');
    const up = render({ kind: 'length-ladder', arrows: ':10' });
    expect(up).toContain('98,46 106,52 104,40');
    expect(up).not.toContain('114,56 106,50 108,62');
  });
});
