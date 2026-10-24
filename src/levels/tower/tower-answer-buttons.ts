// Big answer cards for the choice floors (three numbers, keys 1-3) and the "đố vui" verdict
// (Đúng / Sai, keys 1-2): recovered `.answers` / `.answer` cards with their `<kbd>` key hints.
export class TowerAnswerButtons {
  readonly element = document.createElement('div');
  private buttons: HTMLButtonElement[] = [];

  constructor(
    label: string,
    /** Accessible name of card `n` (1-based): "56 (phím 1)", so the key hint is not read alone. */
    private readonly nameOf: (label: string, n: number) => string,
    private readonly onPick: (index: number) => void,
  ) {
    this.element.className = 'answers tower-answers';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', label);
    this.element.hidden = true;
  }

  show(labels: readonly string[]): void {
    this.buttons = labels.map((label, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer';
      button.dataset.index = String(i);
      button.setAttribute('aria-label', this.nameOf(label, i + 1));
      button.innerHTML = '<kbd></kbd><span></span>';
      (button.firstElementChild as HTMLElement).textContent = String(i + 1);
      (button.lastElementChild as HTMLElement).textContent = label;
      button.addEventListener('click', () => this.onPick(i));
      return button;
    });
    this.element.dataset.count = String(labels.length);
    this.element.replaceChildren(...this.buttons);
    this.element.hidden = false;
  }

  hide(): void {
    this.element.hidden = true;
    this.element.replaceChildren();
    this.buttons = [];
  }

  /** A wrong pick stays marked and out of play; the right one turns green. */
  mark(index: number, correct: boolean): void {
    const button = this.buttons[index];
    if (!button) return;
    button.classList.add(correct ? 'correct' : 'incorrect');
    if (!correct) button.disabled = true;
  }

  isAvailable(index: number): boolean {
    const button = this.buttons[index];
    return !!button && !button.disabled && !this.element.hidden;
  }

  setDisabled(disabled: boolean): void {
    for (const button of this.buttons) {
      if (!button.classList.contains('incorrect')) button.disabled = disabled;
    }
  }
}
