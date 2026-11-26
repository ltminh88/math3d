// Order + match step widgets (boost, Phase 2B): tap-to-place, undo, "Xong"
// gating, wrong marks. Runs in node with a small fake DOM (same pattern as
// step-card.test.ts), extended with querySelector(All), dataset and toggle.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTapMatchStep } from './tap-match-step';
import { createTapOrderStep } from './tap-order-step';

class FakeElement {
  tagName = '';
  type = '';
  textContent = '';
  disabled = false;
  isConnected = true;
  parentElement: FakeElement | null = null;
  readonly children: FakeElement[] = [];
  readonly dataset: Record<string, string> = {};
  private readonly classes = new Set<string>();
  private readonly attrs = new Map<string, string>();
  private readonly listeners = new Map<string, Array<() => void>>();

  get className(): string {
    return [...this.classes].join(' ');
  }

  set className(value: string) {
    this.classes.clear();
    for (const name of value.split(/\s+/).filter(Boolean)) this.classes.add(name);
  }

  get childElementCount(): number {
    return this.children.length;
  }

  readonly classList = {
    add: (...names: string[]) => {
      for (const n of names) this.classes.add(n);
    },
    remove: (...names: string[]) => {
      for (const n of names) this.classes.delete(n);
    },
    toggle: (name: string, force?: boolean) => {
      const on = force ?? !this.classes.has(name);
      if (on) this.classes.add(name);
      else this.classes.delete(name);
      return on;
    },
    contains: (name: string) => this.classes.has(name),
  };

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }

  addEventListener(type: string, handler: () => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  click(): void {
    for (const handler of this.listeners.get('click') ?? []) handler();
  }

  append(...nodes: FakeElement[]): void {
    for (const node of nodes) this.appendChild(node);
  }

  appendChild(node: FakeElement): FakeElement {
    if (node.parentElement) {
      const siblings = node.parentElement.children;
      siblings.splice(siblings.indexOf(node), 1);
    }
    node.parentElement = this;
    this.children.push(node);
    return node;
  }

  remove(): void {
    this.isConnected = false;
    if (this.parentElement) {
      const siblings = this.parentElement.children;
      siblings.splice(siblings.indexOf(this), 1);
      this.parentElement = null;
    }
  }

  querySelector(selector: string): FakeElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const out: FakeElement[] = [];
    const match = (el: FakeElement): boolean =>
      selector.startsWith('.')
        ? el.classes.has(selector.slice(1))
        : el.tagName.toLowerCase() === selector.toLowerCase();
    const walk = (el: FakeElement) => {
      for (const child of el.children) {
        if (match(child)) out.push(child);
        walk(child);
      }
    };
    walk(this);
    return out;
  }
}

const body = new FakeElement();
body.tagName = 'body';
const fakeDocument = {
  body,
  createElement: (tag: string) => {
    const el = new FakeElement();
    el.tagName = tag.toUpperCase();
    return el;
  },
};

afterEach(() => {
  body.children.length = 0;
  vi.unstubAllGlobals();
});

function stubRaf(): void {
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
}

const tiles = (root: HTMLElement, cls: string): FakeElement[] =>
  (root as unknown as FakeElement).querySelectorAll(`.${cls}`);
const byText = (root: HTMLElement, text: string): FakeElement => {
  const found = (root as unknown as FakeElement)
    .querySelectorAll('button')
    .find((b) => b.textContent === text);
  if (!found) throw new Error(`no button with text "${text}"`);
  return found;
};

describe('createTapOrderStep', () => {
  it('places tiles into slots, enables Xong only when full, submits the sequence', () => {
    stubRaf();
    const done: number[][] = [];
    const widget = createTapOrderStep(
      ['3 cm', '1 m', '5 mm'],
      (sequence) => done.push([...sequence]),
      fakeDocument as unknown as Document,
    );
    const doneButton = byText(widget.element, 'Xong');
    expect(doneButton.disabled).toBe(true);
    byText(widget.element, '1 m').click();
    byText(widget.element, '3 cm').click();
    expect(doneButton.disabled).toBe(true);
    byText(widget.element, '5 mm').click();
    expect(doneButton.disabled).toBe(false);
    doneButton.click();
    // Tiles were tapped 1 m (index 1), 3 cm (0), 5 mm (2).
    expect(done).toEqual([[1, 0, 2]]);
    widget.destroy();
  });

  it('tapping a placed tile sends it back to the bank', () => {
    stubRaf();
    const widget = createTapOrderStep(
      ['A', 'B', 'C'],
      () => {},
      fakeDocument as unknown as Document,
    );
    const tileA = byText(widget.element, 'A');
    tileA.click();
    expect(tileA.parentElement?.className).toBe('kit-order__slot');
    tileA.click();
    expect(tileA.parentElement?.className).toBe('kit-order__bank');
    widget.destroy();
  });

  it('markWrong flags the misplaced slot tile', () => {
    stubRaf();
    const widget = createTapOrderStep(
      ['A', 'B', 'C'],
      () => {},
      fakeDocument as unknown as Document,
    );
    byText(widget.element, 'B').click();
    byText(widget.element, 'A').click();
    byText(widget.element, 'C').click();
    widget.markWrong(1);
    const placed = tiles(widget.element, 'kit-order__tile');
    expect(placed[1]?.classList.contains('wrong')).toBe(true);
    expect(placed[0]?.classList.contains('wrong')).toBe(false);
    widget.destroy();
  });

  it('rejects fewer than 2 or more than 5 tiles', () => {
    stubRaf();
    expect(() => createTapOrderStep(['A'], () => {}, fakeDocument as unknown as Document)).toThrow(
      RangeError,
    );
    expect(() =>
      createTapOrderStep(
        ['A', 'B', 'C', 'D', 'E', 'F'],
        () => {},
        fakeDocument as unknown as Document,
      ),
    ).toThrow(RangeError);
  });
});

describe('createTapMatchStep', () => {
  it('pairs left then right, enables Xong only when all paired, submits pairs', () => {
    stubRaf();
    const done: number[][] = [];
    const widget = createTapMatchStep(
      ['1 m', '2 dm'],
      ['100 cm', '20 cm'],
      (pairs) => done.push([...pairs]),
      fakeDocument as unknown as Document,
    );
    const doneButton = byText(widget.element, 'Xong');
    expect(doneButton.disabled).toBe(true);
    byText(widget.element, '1 m').click();
    byText(widget.element, '100 cm').click();
    expect(doneButton.disabled).toBe(true);
    byText(widget.element, '2 dm').click();
    byText(widget.element, '20 cm').click();
    expect(doneButton.disabled).toBe(false);
    doneButton.click();
    expect(done).toEqual([[0, 1]]);
    widget.destroy();
  });

  it('tapping a paired tile unties the pair', () => {
    stubRaf();
    const widget = createTapMatchStep(
      ['A', 'B'],
      ['x', 'y'],
      () => {},
      fakeDocument as unknown as Document,
    );
    byText(widget.element, 'A').click();
    byText(widget.element, 'x').click();
    expect(byText(widget.element, 'Xong').disabled).toBe(true);
    byText(widget.element, 'A').click();
    expect(byText(widget.element, 'A').classList.contains('paired')).toBe(false);
    expect(byText(widget.element, 'x').classList.contains('paired')).toBe(false);
    widget.destroy();
  });

  it('markWrong flags both buttons of each wrong pair', () => {
    stubRaf();
    const widget = createTapMatchStep(
      ['A', 'B'],
      ['x', 'y'],
      () => {},
      fakeDocument as unknown as Document,
    );
    byText(widget.element, 'A').click();
    byText(widget.element, 'y').click();
    byText(widget.element, 'B').click();
    byText(widget.element, 'x').click();
    widget.markWrong([{ left: 0, right: 1 }]);
    expect(byText(widget.element, 'A').classList.contains('wrong')).toBe(true);
    expect(byText(widget.element, 'y').classList.contains('wrong')).toBe(true);
    expect(byText(widget.element, 'B').classList.contains('wrong')).toBe(false);
    widget.destroy();
  });

  it('rejects unequal sides or fewer than 2 / more than 4 pairs', () => {
    stubRaf();
    expect(() =>
      createTapMatchStep(['A'], ['x'], () => {}, fakeDocument as unknown as Document),
    ).toThrow(RangeError);
    expect(() =>
      createTapMatchStep(['A', 'B'], ['x'], () => {}, fakeDocument as unknown as Document),
    ).toThrow(RangeError);
    expect(() =>
      createTapMatchStep(
        ['A', 'B', 'C', 'D', 'E'],
        ['a', 'b', 'c', 'd', 'e'],
        () => {},
        fakeDocument as unknown as Document,
      ),
    ).toThrow(RangeError);
  });
});
