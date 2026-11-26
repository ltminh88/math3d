// Test builds only: `window.__lesson` tells e2e specs which lesson item is on screen and
// what the current `sk:` item's steps expect, so a spec can solve it by taps. Installed by
// the lesson run behind `import.meta.env.MODE === 'test'`, removed with it. Mirrors
// daily-test-hook.ts (same shape, other window key); keep the two in step.
import { type FactKey, isSkillKey, parseKey } from '../learning/fact-key';
import { renderPromptFor } from '../practice/family-prompt-registry';
import { familyOfSkill } from '../practice/item-for-skill';
import { playableSteps } from '../reasoning/reasoning-step-answers';
import type { PracticeRunState } from './practice-run';

export type LessonPlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number }
  | { kind: 'order'; tiles: string[]; answer: number[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: number[] };

export interface LessonTestHook {
  state(): {
    index: number;
    total: number;
    kind: 'quiz' | 'skill';
    factKey: string;
    skillId?: string;
  };
  steps(): LessonPlannedStep[] | null;
}

declare global {
  interface Window {
    __lesson?: LessonTestHook;
  }
}

export function installLessonTestHook(getRun: () => PracticeRunState | null): void {
  window.__lesson = {
    state: () => {
      const r = getRun();
      const key = (r?.keys[r.index] ?? '') as FactKey;
      const parsed = parseKey(key);
      return {
        index: r?.index ?? 0,
        total: r?.keys.length ?? 0,
        kind: isSkillKey(key) ? 'skill' : 'quiz',
        factKey: key,
        skillId: parsed?.op === 'skill' ? parsed.id : undefined,
      };
    },
    steps: () => {
      const r = getRun();
      if (!r?.plan) return null;
      // The choice label must be rendered through the item's own family, exactly
      // as daily-skill-item.ts renders the buttons — the reasoning table would
      // return raw keys ("numbers.romanText", "70 000" ungrouped) that no button
      // carries. Mirrors daily-test-hook.ts; the registry is the single source.
      const render = renderPromptFor(familyOfSkill(r.plan.skillId));
      return playableSteps(r.plan.item).map((step): LessonPlannedStep => {
        if (step.kind === 'number') return { kind: 'number', answer: step.answer };
        if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
        if (step.kind === 'set-clock') return { kind: 'set-clock', h: step.h, m: step.m };
        if (step.kind === 'order')
          return {
            kind: 'order',
            tiles: step.tiles.map((t) => render(t)),
            answer: [...step.answer],
          };
        if (step.kind === 'match')
          return {
            kind: 'match',
            left: step.left.map((t) => render(t)),
            right: step.right.map((o) => render(o.label)),
            pairs: [...step.pairs],
          };
        const right = step.options.filter((o) => o.correct);
        if (step.kind === 'multi') return { kind: 'multi', ids: right.map((o) => o.id) };
        return { kind: 'choice', label: right.map((o) => render(o.label)).join(', ') };
      });
    },
  };
}
