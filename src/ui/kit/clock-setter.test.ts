// Clock setter widget: the +/− buttons move the hands and "Xong" submits the setting.
// Dragging needs a real browser (pointer events + layout), so drags are covered by the
// clock-set-clock e2e spec; this test covers the tap/keyboard path with a fake DOM.
import { describe, expect, it, vi } from 'vitest';
import { createClockSetter } from './clock-setter';

/** Minimal DOM stand-in (same pattern as step-card.test.ts), with real children. */
class FakeElement {
  tagName = '';
  textContent = '';
  disabled = false;
  isConnected = true;
  readonly dataset: Record<string, string> = {};
  readonly style: Record<string, string> = {};
  readonly children: FakeElement[] = [];
  readonly classes = new Set<string>();
  private _className = '';

  get className(): string {
    return this._className;
  }

  set className(value: string) {
    this._className = value;
    this.classes.clear();
    for (const n of value.split(/\s+/)) if (n) this.classes.add(n);
  }
  readonly classList = {
    add: (...names: string[]): void => {
      for (const n of names) this.classes.add(n);
    },
    remove: (...names: string[]): void => {
      for (const n of names) this.classes.delete(n);
    },
  };
  private readonly listeners = new Map<string, Array<(e: unknown) => void>>();

  setAttribute(): void {}

  getBoundingClientRect(): { left: number; top: number; width: number; height: number } {
    return { left: 0, top: 0, width: 220, height: 220 };
  }

  addEventListener(type: string, handler: (e: unknown) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  click(): void {
    for (const handler of this.listeners.get('click') ?? []) handler({});
  }

  append(...nodes: FakeElement[]): void {
    this.children.push(...nodes);
  }

  appendChild(node: FakeElement): FakeElement {
    this.children.push(node);
    return node;
  }

  remove(): void {
    this.isConnected = false;
  }
}

const created: FakeElement[] = [];
const fakeDocument = {
  createElement: (tag: string) => {
    const element = new FakeElement();
    element.tagName = tag;
    created.push(element);
    return element;
  },
} as unknown as Document;

const buttonByLabel = (label: string): FakeElement => {
  const found = created.find((el) => el.tagName === 'button' && el.textContent === label);
  if (!found) throw new Error(`button "${label}" not found`);
  return found;
};

const readoutText = (): string => {
  const found = created.find((el) => el.classes.has('kit-clock-setter__readout'));
  if (!found) throw new Error('readout not found');
  return found.textContent;
};

describe('clock setter widget', () => {
  it('starts at 12:00; +/− buttons move the hands; Xong submits the setting', () => {
    created.length = 0;
    const onDone = vi.fn();
    const setter = createClockSetter({ snapMinutes: 5, onDone }, fakeDocument);
    expect(readoutText()).toContain('12:00');

    buttonByLabel('Giờ +').click();
    buttonByLabel('Giờ +').click();
    buttonByLabel('Giờ +').click();
    expect(readoutText()).toContain('3:00');
    for (let i = 0; i < 5; i++) buttonByLabel('Phút +').click();
    expect(readoutText()).toContain('3:25');

    buttonByLabel('Xong').click();
    expect(onDone).toHaveBeenCalledWith({ h: 3, m: 25 });
    setter.destroy();
    expect(setter.element.isConnected).toBe(false);
  });

  it('wraps: Giờ − from 12 goes to 11, Phút − from 0 goes to 55', () => {
    created.length = 0;
    const setter = createClockSetter({ snapMinutes: 5, onDone: () => {} }, fakeDocument);
    buttonByLabel('Giờ −').click();
    buttonByLabel('Phút −').click();
    expect(readoutText()).toContain('11:55');
    setter.destroy();
  });

  it('rotates the hour hand between the marks (3:25 sits past 3)', () => {
    created.length = 0;
    const setter = createClockSetter({ snapMinutes: 5, onDone: () => {} }, fakeDocument);
    for (let i = 0; i < 3; i++) buttonByLabel('Giờ +').click();
    for (let i = 0; i < 5; i++) buttonByLabel('Phút +').click();
    const hourHand = created.find((el) => el.classes.has('kit-clock-setter__hand--hour'));
    expect(hourHand?.style.transform).toBe('rotate(102.5deg)');
    setter.destroy();
  });
});
