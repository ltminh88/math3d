// The floor's equation(s) in the answer panel: one equation with a blank (`8 × ? = 56` style),
// the fact family's number house and rows, or the "đố vui" claim: a false one gets a fix row under
// it, a true one is replaced by the same equation with its result hidden (the confirm step).
// Blanks are filled from the number pad or the choices.
import type { TowerEquation, TowerQuestion } from './tower-question-formats';
import type { TowerStrings } from './tower-strings';

export class TowerQuestionCard {
  private blanks = new Map<number, HTMLElement>();
  private active = -1;
  private claim: HTMLElement | null = null;

  constructor(
    private readonly host: HTMLElement,
    private readonly ts: TowerStrings,
  ) {}

  private sign(eq: TowerEquation): string {
    return this.ts(eq.op === 'mul' ? 'mulSign' : 'divSign');
  }

  private row(eq: TowerEquation, step: number | null, className: string): HTMLElement {
    const row = document.createElement('div');
    row.className = className;
    const blank = document.createElement('span');
    blank.className = 'tower-blank';
    blank.textContent = '?';
    const x = eq.blank === 'x' ? blank : String(eq.x);
    const z = eq.blank === 'z' ? blank : String(eq.z);
    row.append(x, ` ${this.sign(eq)} ${eq.y} = `, z);
    if (step !== null && eq.blank) this.blanks.set(step, blank);
    return row;
  }

  render(question: TowerQuestion): void {
    this.blanks = new Map();
    this.claim = null;
    this.host.dataset.format = question.format;
    const { steps, triple } = question;
    if (question.format === 'family') {
      const house = document.createElement('div');
      house.className = 'tower-house';
      house.setAttribute('aria-hidden', 'true');
      for (const n of [triple.a, triple.b, triple.p]) {
        const b = document.createElement('b');
        b.textContent = String(n);
        house.append(b);
      }
      const list = document.createElement('div');
      list.className = 'tower-family';
      steps.forEach((step, i) => {
        list.append(this.row(step.eq, i, 'tower-family__row'));
      });
      this.host.replaceChildren(house, list);
    } else if (question.format === 'truefalse') {
      this.claim = this.row(steps[0]?.eq as TowerEquation, null, 'equation tower-claim');
      this.host.replaceChildren(this.claim);
    } else {
      this.host.replaceChildren(
        this.row(steps[0]?.eq as TowerEquation, 0, 'equation tower-equation'),
      );
    }
    this.setActive(0);
  }

  /** The claim was judged: a false one is marked and gets the fix row, a true one is hidden. */
  judged(question: TowerQuestion): void {
    const isTrue = question.steps[0]?.kind === 'verdict' && question.steps[0].answer;
    this.claim?.classList.add(isTrue ? 'is-true' : 'is-false');
    const next = question.steps[1];
    if (!next) return;
    const row = this.row(
      next.eq,
      1,
      `equation tower-equation ${isTrue ? 'tower-confirm' : 'tower-fix'}`,
    );
    if (isTrue && this.claim) this.claim.replaceWith(row);
    else this.host.append(row);
    this.setActive(1);
  }

  setActive(step: number): void {
    this.active = step;
    for (const [i, blank] of this.blanks) {
      blank.classList.toggle('active', i === step);
      if (i === step && !blank.classList.contains('filled')) blank.textContent = '?';
    }
  }

  /** Digits typed so far go into the active blank. */
  showDigits(digits: string): void {
    const blank = this.blanks.get(this.active);
    if (blank && !blank.classList.contains('filled')) blank.textContent = digits || '?';
  }

  fill(step: number, value: number, revealed = false): void {
    const blank = this.blanks.get(step);
    if (!blank) return;
    blank.textContent = String(value);
    blank.classList.add('filled');
    blank.classList.toggle('revealed', revealed);
    blank.classList.remove('active');
  }

  /** Worked answer after three misses: every remaining step is shown (the fix row too). */
  revealFrom(question: TowerQuestion, from: number): void {
    if (question.format === 'truefalse' && from === 0) this.judged(question);
    question.steps.forEach((step, i) => {
      if (i >= from && step.kind !== 'verdict') this.fill(i, step.answer, true);
    });
  }

  shake(): void {
    const target = this.blanks.get(this.active) ?? this.claim;
    if (!target) return;
    target.classList.remove('wrong');
    void target.offsetWidth;
    target.classList.add('wrong');
  }
}
