// Display text of the chapter 2 regions. The legacy VI→EN table stays untouched (golden corpus),
// so the expansion regions translate through their own namespace; `vi` mirrors the config text
// (checked by expansion-region-strings.test.ts).
import { defineStrings } from '../i18n/i18n';
import type { ExpansionRegion } from './expansion-regions';

export const tx = defineStrings('expansion-regions', {
  vi: {
    valleyName: 'Thung Lũng Hình Học',
    valleySubtitle: 'THẾ GIỚI 07',
    valleyBlurb: 'Thung lũng của những khối hình, góc vuông và ê ke khổng lồ.',
    workshopName: 'Xưởng Đo Đạc',
    workshopSubtitle: 'THẾ GIỚI 08',
    workshopBlurb: 'Xưởng đo đạc với thước kẻ khổng lồ và chiếc cân thăng bằng.',
    caveName: 'Hang Đố Vui',
    caveSubtitle: 'THẾ GIỚI 09',
    caveBlurb: 'Hang đá bên bờ tây, nơi những câu đố vui đang chờ.',
    marketName: 'Chợ Phiên Tí Hon',
    marketSubtitle: 'THẾ GIỚI 10',
    marketBlurb: 'Chợ phiên tí hon với những sạp hàng, đồng hồ và bảng số liệu.',
    numberfortName: 'Lâu Đài Số',
    numberfortSubtitle: 'THẾ GIỚI 11',
    numberfortBlurb: 'Lâu đài của các số lớn, làm tròn và số La Mã.',
    islandName: 'Đảo Tiếng Anh',
    islandSubtitle: 'THẾ GIỚI 12',
    islandBlurb: 'Đảo tiếng Anh với bãi cát, hàng cọ và cây cầu ván.',
    signpostHint: 'Đi theo biển chỉ đường',
  },
  en: {
    valleyName: 'Geometry Valley',
    valleySubtitle: 'WORLD 07',
    valleyBlurb: 'A valley of solid shapes, right angles and a giant set square.',
    workshopName: 'Measuring Workshop',
    workshopSubtitle: 'WORLD 08',
    workshopBlurb: 'A workshop with a giant ruler and a balance scale.',
    caveName: 'Puzzle Cave',
    caveSubtitle: 'WORLD 09',
    caveBlurb: 'A rocky cave on the west bank where fun puzzles wait.',
    marketName: 'Tiny Market Fair',
    marketSubtitle: 'WORLD 10',
    marketBlurb: 'A tiny market fair with coin stalls, clocks and data tables.',
    numberfortName: 'Number Castle',
    numberfortSubtitle: 'WORLD 11',
    numberfortBlurb: 'The castle of big numbers, rounding and Roman numerals.',
    islandName: 'English Island',
    islandSubtitle: 'WORLD 12',
    islandBlurb: 'The English island with a sandy beach, palm trees and a plank bridge.',
    signpostHint: 'Follow the signposts',
  },
});

export type ExpansionTextField = 'name' | 'subtitle' | 'blurb';

const FIELD_SUFFIX = { name: 'Name', subtitle: 'Subtitle', blurb: 'Blurb' } as const;

/** Name, subtitle or blurb of a chapter 2 region in the current language. */
export const expansionRegionText = (region: ExpansionRegion, field: ExpansionTextField): string =>
  tx(`${region.id}${FIELD_SUFFIX[field]}`);
