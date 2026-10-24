import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { planCityRounds, REVERSE_BOX } from './city-round-flow';
import { CityStreetView, houseZoneId, parcelId } from './city-street-view';

const roundOf = (box: number) => {
  const [round] = planCityRounds({
    facts: ['mul:7x8'],
    boxOf: () => box,
    errorsOf: () => [],
    rng: mulberry32(7),
  });
  if (!round) throw new Error('no round');
  return round;
};

describe('city street: a wrong answer is out of play', () => {
  it('a house answered wrong no longer takes a parcel', () => {
    const round = roundOf(1);
    const street = new CityStreetView(true);
    street.show(round);
    const wrong = round.houses.findIndex((n) => n !== round.product);
    expect(street.zones().map((z) => z.id)).toContain(houseZoneId(wrong));
    street.reject(round.houses[wrong] as number);
    const ids = street.zones().map((z) => z.id);
    expect(ids).not.toContain(houseZoneId(wrong));
    expect(ids).toHaveLength(3);
    // The next round starts with every house open again.
    street.show(round);
    expect(street.zones()).toHaveLength(4);
  });

  it('a parcel answered wrong in reverse delivery can no longer be picked', () => {
    const round = roundOf(REVERSE_BOX);
    const street = new CityStreetView(true);
    street.show(round);
    const wrong = round.parcels.findIndex((p) => !p.correct);
    street.reject(round.parcels[wrong]?.value as number);
    const ids = street.pickables().map((p) => p.id);
    expect(ids).not.toContain(parcelId(wrong));
    expect(ids).toHaveLength(2);
  });
});
