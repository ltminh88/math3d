// R42: the shared reasoning round shows a per-skill explanation when a wrong answer
// is recognised (R35), and keeps its generic sentence otherwise. Driven through the
// real step card (pad/choice clicks) with the FakeElement pattern of step-card.test.ts.
// One wiring here covers the reasoning rounds of field, forest, city and tower.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { skillKey } from '../../learning/fact-key';
import { mulberry32 } from '../../learning/seeded-rng';
import { itemForSkill } from '../../practice/item-for-skill';
import type { PracticeItem } from '../../practice/practice-scene';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../../reasoning/reasoning-step-answers';
import { must } from './level-controller-test-harness';
import { mountReasoningRound } from './reasoning-round-panel';
import { trr } from './reasoning-round-strings';
import { wrongAnswerFeedback } from './wrong-answer-feedback';

/** Minimal DOM stand-in (same pattern as level-run-ui.test.ts), with real children. */
class FakeElement {
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

const created: FakeElement[] = [];
const fakeDocument = {
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

const NEXT_LABEL = 'Tiếp theo';

function mount(item: PracticeItem, skillId: string) {
  vi.stubGlobal('document', fakeDocument);
  vi.stubGlobal('window', {});
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
  return mountReasoningRound({
    ui: new FakeElement() as unknown as HTMLElement,
    signal: new AbortController().signal,
    audio: { tone: vi.fn(), hint: vi.fn(), correct: vi.fn() } as never,
    announce: vi.fn(),
    plan: { skillId, tier: item.tier, factKey: skillKey(skillId), item },
    eyebrow: 'LUỒNG 1/1',
    title: 'Thử thách',
    onRecorded: () => ({ xp: 0 }),
    nextLabel: NEXT_LABEL,
    onNext: () => {},
  });
}

function feedbackText(): string {
  const feedback = created.find((e) => e.className.split(' ').includes('feedback'));
  if (!feedback) throw new Error('no feedback element');
  return feedback.textContent;
}

/** Buttons of the live step card (not the panel's hint/next buttons). */
function cardButtons(): FakeElement[] {
  return created.filter(
    (e) =>
      e.tagName === 'button' && !e.textContent.startsWith('💡') && e.textContent !== NEXT_LABEL,
  );
}

/** Answers the first step wrong through the card's own buttons; returns the answer sent. */
function answerFirstStepWrong(item: PracticeItem): StepAnswer {
  const step = must(playableSteps(item)[0], 'step');
  const buttons = cardButtons();
  if (step.kind === 'number') {
    const wrong = step.answer + 1;
    for (const ch of String(wrong)) {
      const button = buttons.find((b) => b.textContent === ch);
      if (!button) throw new Error(`no pad button for ${ch}`);
      button.click();
    }
    const ok = buttons.find((b) => b.textContent === '✓');
    if (!ok) throw new Error('no pad ok button');
    ok.click();
    return wrong;
  }
  if (step.kind === 'choice') {
    const wrongIndex = step.options.findIndex((o) => !o.correct);
    const button = buttons[wrongIndex];
    if (!button) throw new Error('no choice button for the wrong option');
    button.click();
    return must(step.options[wrongIndex], 'choice option').id;
  }
  throw new Error(`unsupported first step kind in panel test: ${step.kind}`);
}

describe('reasoning round panel — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for a recognised remainder mistake', () => {
    const item = itemForSkill('div-rem-floor', mulberry32(7), 1);
    mount(item, 'div-rem-floor');
    const answer = answerFirstStepWrong(item);
    expect(isStepAnswerCorrect(must(playableSteps(item)[0], 'step'), answer)).toBe(false);
    const text = feedbackText();
    expect(text).not.toBe(trr('wrong'));
    expect(text).toBe(
      wrongAnswerFeedback({
        skillId: 'div-rem-floor',
        tier: 1,
        item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the specific explanation for a city unknown-mul-div mistake', () => {
    const item = itemForSkill('unknown-mul-div', mulberry32(7), 1);
    mount(item, 'unknown-mul-div');
    const answer = answerFirstStepWrong(item);
    expect(isStepAnswerCorrect(must(playableSteps(item)[0], 'step'), answer)).toBe(false);
    const text = feedbackText();
    expect(text).not.toBe(trr('wrong'));
    expect(text).toBe(
      wrongAnswerFeedback({
        skillId: 'unknown-mul-div',
        tier: 1,
        item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const item = itemForSkill('div-rem-floor', mulberry32(7), 1);
    mount(item, 'div-rem-floor');
    const first = answerFirstStepWrong(item);
    const firstText = feedbackText();
    expect(firstText).not.toBe(trr('wrong'));
    const second = answerFirstStepWrong(item);
    expect(second).toBe(first);
    expect(feedbackText()).toBe(firstText);
  });

  it('keeps the generic sentence for a skill outside the R35 groups', () => {
    const item = itemForSkill('wp-times-then-add', mulberry32(7), 1);
    mount(item, 'wp-times-then-add');
    const answer = answerFirstStepWrong(item);
    expect(isStepAnswerCorrect(must(playableSteps(item)[0], 'step'), answer)).toBe(false);
    expect(feedbackText()).toBe(trr('wrong'));
  });
});
