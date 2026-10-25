// Answer widgets for a round, mounted into the HUD body: the kit number pad (total) and the
// equation multi-select (recovered `.answer` cards with key hints 1-4, plus a Check button).
import { announce } from '../../ui/kit/aria-announcer';
import { createNumberPad } from '../../ui/kit/number-pad';
import type { EquationOption } from './field-round-flow';
import { tf } from './field-strings';

export interface AnswerWidget {
  /** Keyboard shortcut for equation rounds (digit 1-4 toggles, Enter checks); true if used. */
  key(key: string): boolean;
  setDisabled(disabled: boolean): void;
  /** Marks the options green/orange after a verdict (equations only). */
  mark(correctIds: readonly string[] | null): void;
  /** Empties the entered answer (the pad on a reveal, so a wrong number is not left showing). */
  clear(): void;
  destroy(): void;
}

export function mountNumberPad(body: HTMLElement, onSubmit: (value: number) => void): AnswerWidget {
  const pad = createNumberPad({ maxDigits: 3, activeInput: true, onSubmit });
  pad.element.classList.add('field-pad');
  body.replaceChildren(pad.element);
  return {
    key: () => false,
    setDisabled(disabled) {
      for (const b of pad.element.querySelectorAll('button')) b.disabled = disabled;
      if (!disabled) pad.clear();
    },
    mark: () => {},
    clear: () => pad.clear(),
    destroy: () => pad.destroy(),
  };
}

export function mountEquationChoices(
  body: HTMLElement,
  options: readonly EquationOption[],
  onCheck: (ids: string[]) => void,
): AnswerWidget {
  const wrap = document.createElement('div');
  wrap.className = 'field-equations';
  const grid = document.createElement('div');
  grid.className = 'answers field-answers';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', tf('equationsPrompt'));
  const picked = new Set<string>();
  const cards = options.map((option, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'answer';
    card.dataset.option = option.id;
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `<kbd>${i + 1}</kbd><span></span>`;
    (card.lastElementChild as HTMLElement).textContent = option.label;
    card.addEventListener('click', () => toggle(option.id));
    grid.append(card);
    return card;
  });
  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'primary wide';
  check.textContent = tf('check');
  check.addEventListener('click', () => onCheck([...picked]));
  wrap.append(grid, check);
  body.replaceChildren(wrap);

  function toggle(id: string): void {
    if (picked.has(id)) picked.delete(id);
    else picked.add(id);
    cards.forEach((card, i) => {
      const on = picked.has(options[i]?.id ?? '');
      card.setAttribute('aria-pressed', String(on));
      card.classList.toggle('picked', on);
    });
    const label = options.find((o) => o.id === id)?.label ?? '';
    announce(`${label}: ${picked.has(id) ? '✓' : '✗'}`);
  }

  return {
    key(key) {
      if (check.disabled) return false;
      const option = options[Number(key) - 1];
      if (/^[1-4]$/.test(key) && option) {
        toggle(option.id);
        return true;
      }
      if (key === 'Enter') {
        onCheck([...picked]);
        return true;
      }
      return false;
    },
    setDisabled(disabled) {
      for (const b of [...cards, check]) b.disabled = disabled;
    },
    mark(correctIds) {
      cards.forEach((card, i) => {
        const id = options[i]?.id ?? '';
        const correct = correctIds?.includes(id) ?? false;
        card.classList.toggle('correct', correct);
        card.classList.toggle('incorrect', correctIds === null && picked.has(id));
      });
      if (correctIds === null) {
        picked.clear();
        for (const card of cards) {
          card.setAttribute('aria-pressed', 'false');
          card.classList.remove('picked');
        }
      }
    },
    clear: () => {},
    destroy: () => wrap.remove(),
  };
}
