// Answer cards of the delivery rounds (recovered `.answers .answer` with key hints): the house
// numbers of the street, or the parcels of a reverse delivery. Keys 1-4 pick a card.
export interface ChoiceCard {
  /** Text on the card ("56", "7 × 8"). */
  readonly label: string;
  /** Accessible name ("Nhà số 56"). */
  readonly name: string;
  readonly value: number;
}

export class CityChoiceCards {
  readonly element = document.createElement('div');
  private cards: HTMLButtonElement[] = [];
  private values: number[] = [];

  constructor(
    label: string,
    private readonly onPick: (value: number) => void,
  ) {
    this.element.className = 'answers city-choices';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', label);
  }

  set(choices: readonly ChoiceCard[]): void {
    this.values = choices.map((c) => c.value);
    this.cards = choices.map((choice, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'answer';
      card.dataset.value = String(choice.value);
      card.setAttribute('aria-label', choice.name);
      card.innerHTML = `<kbd>${i + 1}</kbd><span></span>`;
      (card.lastElementChild as HTMLElement).textContent = choice.label;
      card.addEventListener('click', () => this.onPick(choice.value));
      return card;
    });
    this.element.replaceChildren(...this.cards);
    this.element.hidden = choices.length === 0;
  }

  /** Digit key 1..n picks that card; true when used. */
  key(key: string): boolean {
    const index = Number(key) - 1;
    const card = this.cards[index];
    if (!/^[1-9]$/.test(key) || !card || card.disabled) return false;
    card.click();
    return true;
  }

  /** Marks a picked card right (stays) or wrong (disabled, with a shape not only a colour). */
  mark(value: number, right: boolean): void {
    const card = this.cards[this.values.indexOf(value)];
    if (!card) return;
    card.classList.add(right ? 'correct' : 'incorrect');
    if (!right) card.disabled = true;
  }

  setDisabled(disabled: boolean): void {
    for (const card of this.cards)
      if (disabled || !card.classList.contains('incorrect')) card.disabled = disabled;
  }
}
