// The six world regions (Vietnamese text verbatim from the original) and region lookups.
import { RIVER } from './world-constants';

export type RegionId = 'village' | 'garden' | 'meadow' | 'forest' | 'city' | 'tower';
export type RegionUnlock = 'start' | 'bridge';

export interface Region {
  readonly id: RegionId;
  readonly blurb: string;
  readonly name: string;
  readonly subtitle: string;
  readonly world: number;
  /** Centre on the ground plane as [x, z]. */
  readonly center: readonly [x: number, z: number];
  /** Footprint as [width along x, depth along z]. */
  readonly size: readonly [width: number, depth: number];
  readonly labelHeight: number;
  readonly color: string;
  readonly icon: string;
  readonly unlock: RegionUnlock;
}

const VILLAGE: Region = {
  id: 'village',
  blurb: 'Nơi VLM và bạn bắt đầu hành trình.',
  name: 'Làng Khởi Đầu',
  subtitle: 'KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH',
  world: 1,
  center: [-13, 0],
  size: [34, 40],
  labelHeight: 6,
  color: '#8ec963',
  icon: '🏡',
  unlock: 'start',
};

/** All regions; index 0 is always the village (west bank). */
export const REGIONS: readonly [Region, ...Region[]] = [
  VILLAGE,
  {
    id: 'garden',
    blurb: 'Khu vườn bên kia Cây cầu tình bạn.',
    name: 'Khu Vườn Bên Sông',
    subtitle: 'ĐÍCH ĐẾN CỦA CÂY CẦU',
    world: 1,
    center: [17, -2],
    size: [12, 16],
    labelHeight: 5,
    color: '#c9dd7c',
    icon: '🌻',
    unlock: 'start',
  },
  {
    id: 'meadow',
    blurb: 'Ruộng phép tính và cổng vào thế giới thứ hai.',
    name: 'Cánh Đồng Phép Tính',
    subtitle: 'THẾ GIỚI 02',
    world: 2,
    center: [36, -20],
    size: [18, 14],
    labelHeight: 5,
    color: '#e4c46f',
    icon: '🌾',
    unlock: 'bridge',
  },
  {
    id: 'forest',
    blurb: 'Khu rừng rậm của phép nhân và phép chia.',
    name: 'Rừng Nhân Chia',
    subtitle: 'THẾ GIỚI 03',
    world: 3,
    center: [34, 22],
    size: [20, 16],
    labelHeight: 6,
    color: '#4f9a62',
    icon: '🌲',
    unlock: 'bridge',
  },
  {
    id: 'city',
    blurb: 'Những tòa nhà mang số và quảng trường đài phun nước.',
    name: 'Thành Phố Con Số',
    subtitle: 'THẾ GIỚI 04',
    world: 4,
    center: [57, 20],
    size: [18, 18],
    labelHeight: 8,
    color: '#8fb3c9',
    icon: '🏙️',
    unlock: 'bridge',
  },
  {
    id: 'tower',
    blurb: 'Ngọn tháp cao nhất, nơi những viên đá số lơ lửng.',
    name: 'Tháp Toán Học',
    subtitle: 'THẾ GIỚI 05',
    world: 5,
    center: [57, -22],
    size: [14, 14],
    labelHeight: 13,
    color: '#9b92cf',
    icon: '🗼',
    unlock: 'bridge',
  },
];

/**
 * Region containing a ground point: first non-village footprint (+1 margin) that holds it,
 * else the village west of the river, else the nearest east-bank region centre.
 */
export const regionAtPoint = (x: number, z: number): Region => {
  for (const region of REGIONS) {
    if (
      region.id !== 'village' &&
      Math.abs(x - region.center[0]) <= region.size[0] / 2 + 1 &&
      Math.abs(z - region.center[1]) <= region.size[1] / 2 + 1
    ) {
      return region;
    }
  }
  if (x < RIVER.riverMin) {
    return REGIONS[0];
  }
  return REGIONS.slice(1).reduce((best, region) => {
    if (
      Math.hypot(x - region.center[0], z - region.center[1]) <
      Math.hypot(x - best.center[0], z - best.center[1])
    ) {
      return region;
    }
    return best;
  });
};

/** Start regions are always open; the rest open once the bridge is complete. */
export const isRegionUnlocked = (region: Region, bridgeComplete: boolean): boolean =>
  region.unlock === 'start' || bridgeComplete;

/** Region by id (`undefined` for an unknown id, like the original `Array#find`). */
export const regionById = (id: string): Region | undefined =>
  REGIONS.find((region) => region.id === id);
