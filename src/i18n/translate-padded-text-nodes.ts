// The legacy translator matches whole text nodes, so shell text next to an icon (" MỘT CUỘC
// PHIÊU LƯU NHỎ", "<svg/> Khám phá bảng cửu chương") stayed Vietnamese in English (QA m-9).
// This pass, run after translateDomTree, translates such nodes by their trimmed text and keeps
// the surrounding whitespace. translateDomTree itself stays the original (golden test).
import { getLegacyLanguage, translateText } from './legacy-translator';

export function translatePaddedTextNodes(root: ParentNode & Node): void {
  if (getLegacyLanguage() === 'vi') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.nodeValue ?? '';
    const core = value.trim();
    if (core === '' || core === value) continue;
    const translated = translateText(core);
    if (translated !== core) node.nodeValue = value.replace(core, translated);
  }
}
