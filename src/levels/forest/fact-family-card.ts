// The round's equation(s) in the answer panel. Stories show one equation (`12 : 3 = ?`); the fact
// family shows its number house (3, 4, 12) and up to four equations whose blanks are filled one
// after another from the number pad. The division sign comes from the strings (`:` in vi).
import type { FamilyEquation, ForestRound } from './forest-round-flow';
import { familyEquations } from './forest-round-flow';
import type { ForestStrings } from './forest-strings';

export class FactFamilyCard {
  private blanks: HTMLElement[] = [];
  private active = 0;

  constructor(
    private readonly host: HTMLElement,
    private readonly ts: ForestStrings,
  ) {}

  private sign(op: FamilyEquation['op']): string {
    return op === 'mul' ? this.ts('mulSign') : this.ts('divSign');
  }

  /** Text of a solved equation, e.g. "12 : 3 = 4". */
  equationText(eq: FamilyEquation): string {
    return `${eq.a} ${this.sign(eq.op)} ${eq.b} = ${eq.answer}`;
  }

  /** The round's main equation (stories): dividend : divisor = quotient. */
  storyEquation(round: ForestRound): FamilyEquation {
    return { a: round.dividend, op: 'div', b: round.divisor, answer: round.quotient };
  }

  private row(eq: FamilyEquation, className: string): HTMLElement {
    const row = document.createElement('div');
    row.className = className;
    const blank = document.createElement('span');
    blank.className = 'forest-blank';
    blank.textContent = '?';
    row.append(`${eq.a} ${this.sign(eq.op)} ${eq.b} = `, blank);
    this.blanks.push(blank);
    return row;
  }

  render(round: ForestRound): void {
    this.blanks = [];
    this.active = 0;
    this.host.dataset.kind = round.kind;
    if (round.kind !== 'family') {
      this.host.replaceChildren(this.row(this.storyEquation(round), 'equation forest-equation'));
      this.setActive(0);
      return;
    }
    const house = document.createElement('div');
    house.className = 'forest-house';
    house.setAttribute('aria-hidden', 'true');
    for (const n of [round.divisor, round.quotient, round.dividend]) {
      const b = document.createElement('b');
      b.textContent = String(n);
      house.append(b);
    }
    const list = document.createElement('div');
    list.className = 'forest-family';
    for (const eq of familyEquations(round)) list.append(this.row(eq, 'forest-family__row'));
    this.host.replaceChildren(house, list);
    this.setActive(0);
  }

  setActive(index: number): void {
    this.active = index;
    this.blanks.forEach((blank, i) => {
      blank.classList.toggle('active', i === index);
      if (i === index && !blank.classList.contains('filled')) blank.textContent = '?';
    });
  }

  /** Digits typed so far go into the active blank. */
  showDigits(digits: string): void {
    const blank = this.blanks[this.active];
    if (blank && !blank.classList.contains('filled')) blank.textContent = digits || '?';
  }

  fill(index: number, value: number, revealed = false): void {
    const blank = this.blanks[index];
    if (!blank) return;
    blank.textContent = String(value);
    blank.classList.add('filled');
    blank.classList.toggle('revealed', revealed);
    blank.classList.remove('active');
  }

  shake(): void {
    const blank = this.blanks[this.active];
    if (!blank) return;
    blank.classList.remove('wrong');
    void blank.offsetWidth;
    blank.classList.add('wrong');
  }
}
