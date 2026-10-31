// Display text of any region: original regions through the recovered VI→EN translator (unchanged
// behaviour), chapter 2 regions through their own i18n namespace.
import { type ExpansionTextField, expansionRegionText } from '../config/expansion-region-strings';
import { type AnyRegion, isExpansionRegion } from '../config/expansion-regions';
import { translateText } from '../i18n/legacy-translator';

export const areaText = (region: AnyRegion, field: ExpansionTextField): string =>
  isExpansionRegion(region) ? expansionRegionText(region, field) : translateText(region[field]);
