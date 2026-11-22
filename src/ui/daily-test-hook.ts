// Test builds only: `window.__daily` tells e2e specs which daily item is on screen and what
// the current `sk:` item's steps expect, so a spec can solve it by taps. Installed by the
// daily run behind `import.meta.env.MODE === 'test'`, removed with it.
import { type FactKey, isSkillKey, parseKey } from '../learning/fact-key';
import { renderPromptFor } from '../practice/family-prompt-registry';
import { familyOfSkill } from '../practice/item-for-skill';
import { playableSteps } from '../reasoning/reasoning-step-answers';
import type { DailyRunState } from './daily-practice';

export type DailyPlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

export interface DailyTestHook {
  state(): {
    index: number;
    total: number;
    kind: 'quiz' | 'skill';
    factKey: string;
    skillId?: string;
  };
  steps(): DailyPlannedStep[] | null;
}

declare global {
  interface Window {
    __daily?: DailyTestHook;
  }
}

export function installDailyTestHook(getRun: () => DailyRunState | null): void {
  window.__daily = {
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
      // return raw keys ("time.digital") that no button carries. The registry
      // is the single source: it falls back to reasoning for families with no
      // registered renderer.
      const render = renderPromptFor(familyOfSkill(r.plan.skillId));
      return playableSteps(r.plan.item).map((step): DailyPlannedStep => {
        if (step.kind === 'number') return { kind: 'number', answer: step.answer };
        if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
        const right = step.options.filter((o) => o.correct);
        if (step.kind === 'multi') return { kind: 'multi', ids: right.map((o) => o.id) };
        return { kind: 'choice', label: right.map((o) => render(o.label)).join(', ') };
      });
    },
  };
}
