// Chapter 2 regions (geometry valley, measurement workshop, puzzle cave), chapter 3
// (tiny market fair, number castle) and the English island (side region, not part of the
// math quest chain). Kept apart from REGIONS,
// which stays byte-equal to the original bundle (golden traces run the original code): nothing
// here feeds the scatter's exclusion test, the original map hit test or `regionAtPoint`.
// Coordinates come from the footprint probe (phase 03): free ground clear of every original
// region, road, hill and gate. "North" is the top of the world map (−z).
import type { Region, RegionId } from './regions';

export type ExpansionRegionId = 'valley' | 'workshop' | 'cave' | 'market' | 'numberfort' | 'island';
export type AnyRegionId = RegionId | ExpansionRegionId;

/** Same shape as an original region; `unlock: 'bridge'` (walkable once the bridge is crossed). */
export interface ExpansionRegion extends Omit<Region, 'id'> {
  readonly id: ExpansionRegionId;
}

export type AnyRegion = Region | ExpansionRegion;

export const EXPANSION_REGIONS: readonly ExpansionRegion[] = [
  {
    id: 'valley',
    blurb: 'Thung lũng của những khối hình, góc vuông và ê ke khổng lồ.',
    name: 'Thung Lũng Hình Học',
    subtitle: 'THẾ GIỚI 07',
    world: 7,
    center: [40, -37],
    size: [22, 10],
    labelHeight: 5,
    color: '#c7b8e8',
    icon: '📐',
    unlock: 'bridge',
  },
  {
    id: 'workshop',
    blurb: 'Xưởng đo đạc với thước kẻ khổng lồ và chiếc cân thăng bằng.',
    name: 'Xưởng Đo Đạc',
    subtitle: 'THẾ GIỚI 08',
    world: 8,
    center: [45, 38],
    size: [18, 10],
    labelHeight: 5,
    color: '#e8b98a',
    icon: '📏',
    unlock: 'bridge',
  },
  {
    id: 'cave',
    blurb: 'Hang đá bên bờ tây, nơi những câu đố vui đang chờ.',
    name: 'Hang Đố Vui',
    subtitle: 'THẾ GIỚI 09',
    world: 9,
    center: [-32, 32],
    size: [14, 12],
    labelHeight: 6,
    color: '#a9a39a',
    icon: '🧩',
    unlock: 'bridge',
  },
  {
    id: 'market',
    blurb: 'Chợ phiên tí hon với những sạp hàng, đồng hồ và bảng số liệu.',
    name: 'Chợ Phiên Tí Hon',
    subtitle: 'THẾ GIỚI 10',
    world: 10,
    center: [-32, -30],
    size: [12, 8],
    labelHeight: 5,
    color: '#e07856',
    icon: '🏮',
    unlock: 'bridge',
  },
  {
    id: 'numberfort',
    blurb: 'Lâu đài của các số lớn, làm tròn và số La Mã.',
    name: 'Lâu Đài Số',
    subtitle: 'THẾ GIỚI 11',
    world: 11,
    center: [61, -2],
    size: [12, 10],
    labelHeight: 5,
    color: '#8fa8e8',
    icon: '🏰',
    unlock: 'bridge',
  },
  {
    // Footprint probe (phase 1A): west bank, south of the bridge road, near the bridgehead —
    // clear of the houses (-4,-11), the windmill (-15,-14), the shop stall (-7,-4), the pond
    // and the gazebo; the road enters from the north. The village footprint covers this
    // spot, but the overlap test only guards the non-village regions (REGIONS.slice(1)).
    id: 'island',
    blurb: 'Đảo tiếng Anh với bãi cát, hàng cọ và cây cầu ván.',
    name: 'Đảo Tiếng Anh',
    subtitle: 'THẾ GIỚI 12',
    world: 12,
    center: [-6, 13],
    size: [12, 10],
    labelHeight: 5,
    color: '#6fc3b8',
    icon: '🏝️',
    unlock: 'bridge',
  },
];

export const isExpansionRegion = (region: AnyRegion): region is ExpansionRegion =>
  EXPANSION_REGIONS.some((r) => r.id === region.id);
