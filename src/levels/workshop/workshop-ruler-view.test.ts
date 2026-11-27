// Ruler view (boost, Phase 2B): showMmLabels numbers the mm ticks 1-9 inside
// each centimetre; without it the ruler shows only the cm numbers. Runs in
// node with a stubbed document (the same pattern as the kit widget tests).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRulerView } from './workshop-ruler-view';

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

  querySelector(selector: string): FakeSvgElement | null {
    if (selector === 'svg') return this.children.find((c) => c.tag === 'svg') ?? null;
    return null;
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

class FakeElement extends FakeSvgElement {
  constructor(tag: string) {
    super(tag);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubDocument(): void {
  vi.stubGlobal('document', {
    createElement: (tag: string) => new FakeElement(tag),
    createElementNS: (_ns: string, tag: string) => new FakeSvgElement(tag),
  });
}

function renderRuler(showMmLabels: boolean): string {
  stubDocument();
  const ws = ((key: string) => key) as never;
  const view = createRulerView(
    { kind: 'ruler', maxCm: 10, fromMm: 12, toMm: 76, showMmLabels, minUnitPx: 32 },
    2,
    'cây bút',
    ws,
  );
  return (view as unknown as FakeElement).outerHTML;
}

describe('createRulerView showMmLabels', () => {
  it('numbers the mm ticks when set', () => {
    const svg = renderRuler(true);
    expect(svg).toContain('ws-label--mm');
    // One label per non-cm millimetre: 9 per cm x 10 cm.
    expect((svg.match(/ws-label--mm/g) ?? []).length).toBe(90);
  });

  it('shows no mm labels by default', () => {
    expect(renderRuler(false)).not.toContain('ws-label--mm');
  });
});
