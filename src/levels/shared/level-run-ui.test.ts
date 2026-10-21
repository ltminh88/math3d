// Focus moves into the level layer when a run mounts and goes back where it was on unmount.
import { afterEach, describe, expect, it, vi } from 'vitest';

/** Minimal DOM stand-in: elements record attributes/children; `focus()` sets activeElement. */
class FakeElement {
  hidden = false;
  className = '';
  type = '';
  innerHTML = '';
  tabIndex = 0;
  parentElement: FakeElement | undefined;
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  readonly classList = { add: vi.fn(), remove: vi.fn() };
  isConnected = true;
  get lastElementChild(): FakeElement {
    const span = new FakeElement();
    return span;
  }
  set textContent(_value: string) {}
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  addEventListener() {}
  append(child: FakeElement) {
    this.children.push(child);
    child.parentElement = this;
  }
  remove() {
    this.isConnected = false;
  }
  focus() {
    fakeDocument.activeElement = this;
  }
}

const shell = new FakeElement();
const canvas = new FakeElement();
shell.append(canvas);
const hud = new FakeElement();
const interact = new FakeElement();
const fakeDocument = {
  activeElement: interact as FakeElement | null,
  createElement: () => new FakeElement(),
};

vi.mock('../../ui/icons', () => ({
  byId: (id: string) => (id === 'world' ? canvas : hud),
  icon: () => '',
}));
vi.stubGlobal('document', fakeDocument);
const { mountLevelRunUi } = await import('./level-run-ui');

afterEach(() => vi.unstubAllGlobals());

describe('level run ui', () => {
  it('moves focus into the level layer and restores it on unmount', () => {
    interact.focus();
    const ui = mountLevelRunUi('Field', () => {});
    expect(fakeDocument.activeElement).toBe(ui.root);
    expect(ui.root.tabIndex).toBe(-1);
    ui.unmount();
    expect(fakeDocument.activeElement).toBe(interact);
  });
});
