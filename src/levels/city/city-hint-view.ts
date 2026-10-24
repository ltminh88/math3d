// Draws a city hint into the recovered hint area: the sentence, plus for rung 2 the split
// "8 = 5 + 3" in the two band colours the building uses (with a shape cue, not colour alone).
import type { CityHint } from './city-hints';
import type { CityStrings } from './city-strings';

function bandModel(t: number, bands: { first: number; rest: number }): HTMLElement {
  const model = document.createElement('p');
  model.className = 'city-bands';
  model.setAttribute('aria-hidden', 'true');
  const part = (className: string, text: string) => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  };
  model.append(
    `${t} = `,
    part('city-band city-band--a', `■ ${bands.first}`),
    ' + ',
    part('city-band city-band--b', `● ${bands.rest}`),
  );
  return model;
}

/** Renders `hint` and returns its text (for the screen-reader announcement). */
export function renderCityHint(area: HTMLElement, ts: CityStrings, hint: CityHint): string {
  const text = ts(hint.key, hint.params);
  const p = document.createElement('p');
  p.textContent = text;
  const t = Number(hint.params.t);
  area.replaceChildren(p, ...(hint.bands ? [bandModel(t, hint.bands)] : []));
  area.hidden = false;
  area.dataset.rung = String(hint.rung);
  return text;
}
