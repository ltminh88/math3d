// Regression test for the double-finish pageerror: submit() calls onAnswer BEFORE
// finishStep(), and the reasoning panel's finish() reveals every remaining step inside
// onAnswer — so on the last correct step, submit() reaches finishStep() with
// index === steps.length and the old code read steps[index].kind of undefined.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReasoningItem } from '../../reasoning/reasoning-types';
import { createStepCard, type StepCard } from './step-card';

/** Minimal DOM stand-in (same pattern as level-run-ui.test.ts), with real children. */
class FakeElement {
  tagName = '';
  className = '';
  type = '';
  textContent = '';
  disabled = false;
  isConnected = true;
  readonly children: FakeElement[] = [];
  readonly classList = { add: vi.fn(), remove: vi.fn() };
  private readonly listeners = new Map<string, Array<() => void>>();

  get lastElementChild(): FakeElement | null {
    return this.children[this.children.length - 1] ?? null;
  }

  setAttribute(): void {}

  addEventListener(type: string, handler: () => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

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

  remove(): void {
    this.isConnected = false;
  }
}

const created: FakeElement[] = [];
const fakeDocument = {
  body: new FakeElement(),
  // The number pad listens for physical keys on the document; the fake ignores them.
  addEventListener: (): void => {},
  createElement: (tag: string) => {
    const element = new FakeElement();
    element.tagName = tag;
    created.push(element);
    return element;
  },
};

afterEach(() => {
  created.length = 0;
  vi.unstubAllGlobals();
});

function oneChoiceItem(): ReasoningItem {
  return {
    skillId: 'sk:test',
    tier: 1,
    story: { key: 'story' },
    steps: [
      {
        kind: 'choice',
        prompt: { key: 'prompt' },
        options: [
          { id: 'a', label: { key: 'a' }, correct: true },
          { id: 'b', label: { key: 'b' }, correct: false },
        ],
      },
    ],
    work: [],
  } as unknown as ReasoningItem;
}

function mount(onAnswer?: (card: StepCard) => void): {
  card: StepCard;
  completed: number[];
  buttons: FakeElement[];
} {
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
  const completed: number[] = [];
  let card: StepCard | null = null;
  card = createStepCard(
    oneChoiceItem(),
    {
      render: () => 'x',
      onAnswer: () => {
        if (card && onAnswer) onAnswer(card);
      },
      onComplete: () => {
        completed.push(1);
      },
    },
    fakeDocument as unknown as Document,
  );
  const buttons = created.filter((element) => element.tagName === 'button');
  return { card, completed, buttons };
}

describe('createStepCard double finish', () => {
  it('does not throw when the host finishes the card inside onAnswer', () => {
    const { card, completed, buttons } = mount((live) => {
      // Mimic reasoning-round-panel finish(): reveal every remaining step.
      while (live.currentStep() < 1) live.reveal();
    });
    expect(buttons).toHaveLength(2);
    // Answering the only step correctly: submit() still calls finishStep() after
    // onAnswer already finished the card — that second finish must be a no-op.
    expect(() => buttons[0]?.click()).not.toThrow();
    expect(card.currentStep()).toBe(1);
    expect(completed).toHaveLength(1);
  });

  it('still finishes normally when the host does not reveal inside onAnswer', () => {
    const { card, completed, buttons } = mount();
    expect(() => buttons[0]?.click()).not.toThrow();
    expect(card.currentStep()).toBe(1);
    expect(completed).toHaveLength(1);
  });
});

// Hotfix P0 (22/11): the dialog number pad capped answers at 3 digits, so a 1 000
// answer could never be entered (the pad kept "100" and the step was marked wrong).
// The pad's limit is a fixed 6 (enough for 100 000), never derived from the answer:
// deriving it would leak the answer's digit count.
function oneNumberItem(answer: number): ReasoningItem {
  return {
    skillId: 'sk:test',
    tier: 1,
    story: { key: 'story' },
    steps: [{ kind: 'number', prompt: { key: 'prompt' }, answer }],
    work: [],
  } as unknown as ReasoningItem;
}

function mountNumber(answer: number): {
  card: StepCard;
  completed: number[];
  answers: Array<{ stepIndex: number; correct: boolean; answer: unknown }>;
  buttons: FakeElement[];
} {
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
  const completed: number[] = [];
  const answers: Array<{ stepIndex: number; correct: boolean; answer: unknown }> = [];
  const card = createStepCard(
    oneNumberItem(answer),
    {
      render: () => 'x',
      onAnswer: (event) => {
        answers.push({ stepIndex: event.stepIndex, correct: event.correct, answer: event.answer });
      },
      onComplete: () => {
        completed.push(1);
      },
    },
    fakeDocument as unknown as Document,
  );
  const buttons = created.filter((element) => element.tagName === 'button');
  return { card, completed, answers, buttons };
}

function tapDigits(buttons: FakeElement[], digits: string): void {
  for (const digit of digits) {
    const button = buttons.find((b) => b.textContent === digit);
    expect(button).toBeDefined();
    button?.click();
  }
  const ok = buttons.find((b) => b.textContent === '✓');
  expect(ok).toBeDefined();
  ok?.click();
}

describe('createStepCard number pad digit limit', () => {
  it('accepts a 4-digit answer (1000)', () => {
    const { card, completed, answers, buttons } = mountNumber(1000);
    tapDigits(buttons, '1000');
    expect(answers).toEqual([{ stepIndex: 0, correct: true, answer: 1000 }]);
    expect(card.currentStep()).toBe(1);
    expect(completed).toHaveLength(1);
  });

  it('accepts a 6-digit answer (100000)', () => {
    const { card, completed, answers, buttons } = mountNumber(100000);
    tapDigits(buttons, '100000');
    expect(answers).toEqual([{ stepIndex: 0, correct: true, answer: 100000 }]);
    expect(card.currentStep()).toBe(1);
    expect(completed).toHaveLength(1);
  });

  it('allows 6 digits even when the answer is small (the limit is fixed, never derived from the answer)', () => {
    const { answers, buttons } = mountNumber(5);
    tapDigits(buttons, '123456');
    expect(answers).toEqual([{ stepIndex: 0, correct: false, answer: 123456 }]);
  });
});
