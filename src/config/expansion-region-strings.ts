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
    signpostHint: 'Follow the signposts',
  },
});

export type ExpansionTextField = 'name' | 'subtitle' | 'blurb';

const FIELD_SUFFIX = { name: 'Name', subtitle: 'Subtitle', blurb: 'Blurb' } as const;

/** Name, subtitle or blurb of a chapter 2 region in the current language. */
export const expansionRegionText = (region: ExpansionRegion, field: ExpansionTextField): string =>
  tx(`${region.id}${FIELD_SUFFIX[field]}`);
