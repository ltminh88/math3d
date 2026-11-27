// Test-only scaffolding for level controller tests (R42): a minimal DOM stand-in
// (same pattern as level-run-ui.test.ts / step-card.test.ts), a fake LevelContext,
// and wrong/correct answer builders for a playable step. Imported only by *.test.ts;
// no production code imports this module.
import { vi } from 'vitest';
import { isStepAnswerCorrect, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import type { LevelContext } from './level-types';

/** Throws when an indexed/destructured test value is missing (noUncheckedIndexedAccess). */
export function must<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`missing ${label}`);
  return value;
}

/** Minimal DOM stand-in: elements record attributes/children; `click()` fires listeners. */
export class FakeElement {
  tagName = '';
  className = '';
  type = '';
  textContent = '';
  disabled = false;
  hidden = false;
  isConnected = true;
  readonly children: FakeElement[] = [];
  readonly dataset: Record<string, string> = {};
  readonly style: Record<string, string> = {};
  readonly classList = {
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
    contains: (_name: string) => false,
  };
  private readonly listeners = new Map<string, Array<(...args: never[]) => void>>();
  private readonly attributes = new Map<string, string>();

  get lastElementChild(): FakeElement | null {
    return this.children[this.children.length - 1] ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, handler: (...args: never[]) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  removeEventListener(): void {}

  click(): void {
    for (const handler of this.listeners.get('click') ?? []) handler();
  }

  append(...nodes: FakeElement[]): void {
    this.children.push(...nodes);
  }

  appendChild(node: FakeElement): FakeElement {
    this.children.push(node);
    return node;
  }

  replaceChildren(...nodes: FakeElement[]): void {
    this.children.length = 0;
    this.children.push(...nodes);
  }

  remove(): void {
    this.isConnected = false;
  }

  contains(): boolean {
    return false;
  }

  querySelector(): FakeElement | null {
    return null;
  }

  querySelectorAll(): FakeElement[] {
    return [];
  }

  focus(): void {}
}

/** Elements created through the stubbed document, in creation order. */
export const created: FakeElement[] = [];

export const fakeDocument = {
  body: new FakeElement(),
  activeElement: null as FakeElement | null,
  createElement: (tag: string) => {
    const element = new FakeElement();
    element.tagName = tag;
    created.push(element);
    return element;
  },
  addEventListener: (): void => {},
  removeEventListener: (): void => {},
};

/** Stub the globals the step card and the panels read (document, window, rAF). */
export function stubDom(): void {
  vi.stubGlobal('document', fakeDocument);
  vi.stubGlobal('window', {});
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
}

/** A LevelContext with recording audio/announce/learning; only the fields the
 *  controllers touch are real — the rest is cast away. */
export function fakeLevelContext(stage = 1): LevelContext {
  return {
    stage,
    audio: { tone: vi.fn(), hint: vi.fn(), correct: vi.fn() },
    announce: vi.fn(),
    learning: { record: vi.fn() },
    disposer: { signal: new AbortController().signal },
  } as unknown as LevelContext;
}

/** A wrong answer for one playable step (never the right one). */
export function wrongAnswerFor(step: ReasoningStep): StepAnswer {
  switch (step.kind) {
    case 'number':
      return step.answer + 1;
    case 'choice': {
      const wrong = step.options.find((o) => !o.correct);
      if (!wrong) throw new Error('choice step without a wrong option');
      return wrong.id;
    }
    case 'multi': {
      const wrongIds = step.options.filter((o) => !o.correct).map((o) => o.id);
      if (wrongIds.length > 0) return wrongIds;
      return step.options
        .filter((o) => o.correct)
        .slice(1)
        .map((o) => o.id);
    }
    case 'verdict':
      return !step.answer;
    case 'order': {
      // Swap the first two tiles of the right order (a one-tile order has no
      // wrong order, so an empty tap list stands in).
      const wrong = [...step.answer];
      if (wrong.length > 1) [wrong[0], wrong[1]] = [wrong[1] as number, wrong[0] as number];
      else return [];
      return wrong;
    }
    case 'match': {
      const wrong = [...step.pairs];
      if (wrong.length > 1) [wrong[0], wrong[1]] = [wrong[1] as number, wrong[0] as number];
      else return [];
      return wrong;
    }
    case 'set-clock':
      return { h: (step.h + 1) % 12, m: step.m };
  }
}

/** The right answer for one playable step. */
export function correctAnswerFor(step: ReasoningStep): StepAnswer {
  switch (step.kind) {
    case 'number':
      return step.answer;
    case 'choice': {
      const right = step.options.find((o) => o.correct);
      if (!right) throw new Error('choice step without a right option');
      return right.id;
    }
    case 'multi':
      return step.options.filter((o) => o.correct).map((o) => o.id);
    case 'verdict':
      return step.answer;
    case 'order':
      return [...step.answer];
    case 'match':
      return [...step.pairs];
    case 'set-clock':
      return { h: step.h, m: step.m };
  }
}

/** Guard: the built answer really is wrong for the step (the selector ignores right ones). */
export function assertWrong(step: ReasoningStep, answer: StepAnswer): void {
  if (isStepAnswerCorrect(step, answer)) throw new Error('built answer is actually right');
}
