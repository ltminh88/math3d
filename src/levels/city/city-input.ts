// City input: the shared drag + tap-select + keyboard facade (WCAG 2.5.7) mapped onto parcels,
// house doors and building floors, plus document keys (1-4 pick a card, H asks for a hint).
// Keys are listened for on `document` with the level disposer's signal, in the capture phase so
// card digits never reach the number pad of another round.
import type { InteractionController } from '../../core/input/interaction-controller';
import type { InteractionEvent } from '../../core/input/interaction-types';
import type { LevelContext } from '../shared/level-types';
import { floorIndexOf } from './city-building-view';
import { houseZoneCenter } from './city-layout';
import type { CityPanel } from './city-panel';
import type { CityRoundController } from './city-round-controller';
import { type CityStreetView, houseIndexOf, parcelIndexOf } from './city-street-view';
import type { CityStrings } from './city-strings';

export function wireCityInput(
  ctx: LevelContext,
  ts: CityStrings,
  interaction: InteractionController,
  controller: CityRoundController,
  panel: CityPanel,
  street: CityStreetView,
  refresh: () => void,
): void {
  const building = controller.building;
  const onEvent = (event: InteractionEvent): void => {
    if (event.type === 'tap-select') {
      if (event.itemId?.startsWith('floor:')) {
        building.setFocus(null);
        // Re-registering drops the 3D focus, so Enter goes back to the number pad.
        interaction.setPickables([]);
        controller.light(floorIndexOf(event.itemId));
        refresh();
      } else {
        street.setSelected(event.itemId === null ? null : parcelIndexOf(event.itemId));
      }
    } else if (event.type === 'focus') {
      if (event.kind === 'item' && event.id?.startsWith('floor:')) {
        const floor = floorIndexOf(event.id);
        building.setFocus(floor);
        ctx.announce(ts('floor', { n: floor + 1 }));
      } else if (event.kind === 'item' && event.id) {
        street.focus(street.parcelAt(parcelIndexOf(event.id)));
      } else if (event.kind === 'zone' && event.id) {
        const house = houseIndexOf(event.id);
        street.focus(houseZoneCenter(house));
        const number =
          controller.round?.kind === 'reverse'
            ? controller.round.product
            : controller.round?.houses[house];
        if (number !== undefined) ctx.announce(ts('house', { n: number }));
      } else {
        street.focus(null);
        building.setFocus(null);
      }
    } else if (event.type === 'drag-move') {
      street.dragTo(parcelIndexOf(event.itemId), event.position);
    } else if (event.type === 'drop' || event.type === 'cancel') {
      street.focus(null);
      street.setSelected(null);
      controller.drop(parcelIndexOf(event.itemId), event.type === 'drop' ? event.zoneId : null);
    }
  };
  interaction.events.on(onEvent);

  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key;
    if ((key === 'h' || key === 'H') && controller.active) {
      controller.hint();
      event.preventDefault();
    } else if (
      controller.round?.kind !== 'windows' &&
      controller.active &&
      panel.choices.key(key)
    ) {
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', onKey, { capture: true, signal: ctx.disposer.signal });
}
