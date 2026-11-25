// Clock setter widget (R37): a draggable clock face for the set-clock step. The child
// drags the hour and minute hands by finger or mouse (pointer events), or uses the
// +/− buttons — the tap/keyboard alternative (WCAG 2.5.7) and the fallback on touch
// screens where dragging is hard. The hands start at 12:00; the minute hand snaps to
// the step's grid, the hour hand follows the minutes, and "Xong" submits the setting.
// Dragging the minute hand past 12 does not carry the hour: the hour is set by its own
// hand or the hour buttons, so what the child sets is always what the clock shows.
// Which hand a drag grabs: the hands are different lengths (hour 62, minute 84 —
// keep in sync with step-kit.css), and a drag grabs the hand whose TIP is nearer
// the press point — grab near a tip and you get that hand, even when the two hands
// point the same way and overlap. A press without a drag is a tap: it sets the
// MINUTE hand to the tapped angle (the hour hand is set by dragging its tip or
// by the hour buttons), so the tap always means "put the minute hand here".
import {
  angleToHour,
  angleToMinutes,
  type ClockSetting,
  hourHandAngle,
  minuteHandAngle,
} from '../../time/clock-setter';
import { digitalText } from '../../time/time-ranges';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface ClockSetterOptions {
  readonly snapMinutes: 5 | 1;
  readonly onDone: (setting: ClockSetting) => void;
}

export interface ClockSetter {
  element: HTMLElement;
  destroy(): void;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
/** Hand lengths in px (the face is 220 wide): keep in sync with step-kit.css. */
const HOUR_HAND_LEN = 62;
const MINUTE_HAND_LEN = 84;

export function createClockSetter(
  options: ClockSetterOptions,
  doc: Document = document,
): ClockSetter {
  let h = 12;
  let m = 0;
  const { snapMinutes } = options;

  const element = doc.createElement('div');
  element.className = 'kit-clock-setter';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tk('clockSetter'));

  const face = doc.createElement('div');
  face.className = 'kit-clock-setter__face';
  face.setAttribute('role', 'img');
  face.setAttribute('aria-label', tk('clockSetter'));
  element.appendChild(face);

  for (const hour of HOURS) {
    const a = (hour * 30 * Math.PI) / 180;
    const num = doc.createElement('span');
    num.className = 'kit-clock-setter__num';
    num.style.left = `${50 + 38 * Math.sin(a)}%`;
    num.style.top = `${50 - 38 * Math.cos(a)}%`;
    num.textContent = String(hour);
    face.appendChild(num);
  }

  const makeHand = (kind: 'hour' | 'minute'): HTMLElement => {
    const hand = doc.createElement('div');
    hand.className = `kit-clock-setter__hand kit-clock-setter__hand--${kind}`;
    const line = doc.createElement('div');
    line.className = 'kit-clock-setter__hand-line';
    hand.appendChild(line);
    face.appendChild(hand);
    return hand;
  };
  const hourHand = makeHand('hour');
  const minuteHand = makeHand('minute');
  const dot = doc.createElement('div');
  dot.className = 'kit-clock-setter__dot';
  face.appendChild(dot);

  const readout = doc.createElement('p');
  readout.className = 'kit-clock-setter__readout';
  readout.setAttribute('aria-live', 'polite');
  element.appendChild(readout);

  const controls = doc.createElement('div');
  controls.className = 'kit-clock-setter__controls';
  element.appendChild(controls);

  const render = (): void => {
    hourHand.style.transform = `rotate(${hourHandAngle(h, m)}deg)`;
    minuteHand.style.transform = `rotate(${minuteHandAngle(m)}deg)`;
    readout.textContent = tk('clockSet', { time: digitalText(h, m) });
  };

  const stepHour = (delta: number): void => {
    h = ((((h - 1 + delta) % 12) + 12) % 12) + 1;
    render();
  };
  const stepMinute = (delta: number): void => {
    m = (((m + delta * snapMinutes) % 60) + 60) % 60;
    render();
  };

  const addStepButton = (label: string, kind: string, onClick: () => void): void => {
    const button = createUiButton({ label, onClick }, doc);
    button.dataset.clock = kind;
    controls.appendChild(button);
  };
  addStepButton(tk('clockHourMinus'), 'hour-minus', () => stepHour(-1));
  addStepButton(tk('clockHourPlus'), 'hour-plus', () => stepHour(1));
  addStepButton(tk('clockMinuteMinus'), 'minute-minus', () => stepMinute(-1));
  addStepButton(tk('clockMinutePlus'), 'minute-plus', () => stepMinute(1));

  const done = createUiButton(
    { label: tk('ok'), variant: 'primary', onClick: () => options.onDone({ h, m }) },
    doc,
  );
  done.classList.add('kit-clock-setter__done');
  element.appendChild(done);

  /** Pointer angle from the face centre: 0 is 12 o'clock, clockwise. */
  const angleOf = (dx: number, dy: number): number => (Math.atan2(dx, -dy) * 180) / Math.PI;

  /** The hand whose tip is nearer the point (dx, dy) from the centre. */
  const nearerHandAt = (dx: number, dy: number): 'hour' | 'minute' => {
    const tip = (angleDeg: number, len: number) => {
      const a = (angleDeg * Math.PI) / 180;
      return { x: len * Math.sin(a), y: -len * Math.cos(a) };
    };
    const hourTip = tip(hourHandAngle(h, m), HOUR_HAND_LEN);
    const minuteTip = tip(minuteHandAngle(m), MINUTE_HAND_LEN);
    const dist = (t: { x: number; y: number }) => (dx - t.x) ** 2 + (dy - t.y) ** 2;
    return dist(hourTip) <= dist(minuteTip) ? 'hour' : 'minute';
  };

  let dragging: 'hour' | 'minute' | null = null;
  let press: { dx: number; dy: number } | null = null;
  const applyAngle = (dx: number, dy: number): void => {
    if (dragging === 'hour') h = angleToHour(angleOf(dx, dy), m);
    else if (dragging === 'minute') m = angleToMinutes(angleOf(dx, dy), snapMinutes);
    else return;
    render();
  };
  face.addEventListener('pointerdown', (e: PointerEvent) => {
    e.preventDefault();
    const rect = face.getBoundingClientRect();
    press = {
      dx: e.clientX - (rect.left + rect.width / 2),
      dy: e.clientY - (rect.top + rect.height / 2),
    };
    face.setPointerCapture(e.pointerId);
  });
  face.addEventListener('pointermove', (e: PointerEvent) => {
    if (!press) return;
    const rect = face.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    if (!dragging) {
      // A press becomes a drag past 6px of movement; the hand is the one whose
      // tip was nearer the press point. Below that it stays a tap (see pointerup).
      if ((dx - press.dx) ** 2 + (dy - press.dy) ** 2 < 36) return;
      dragging = nearerHandAt(press.dx, press.dy);
    }
    applyAngle(dx, dy);
  });
  face.addEventListener('pointerup', () => {
    // No movement: a tap sets the minute hand to the tapped angle.
    if (press && !dragging) m = angleToMinutes(angleOf(press.dx, press.dy), snapMinutes);
    press = null;
    dragging = null;
    render();
  });
  face.addEventListener('pointercancel', () => {
    press = null;
    dragging = null;
  });

  render();
  return {
    element,
    destroy: () => element.remove(),
  };
}
