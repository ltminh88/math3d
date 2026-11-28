// Item identity (anti-repeat Phase 2): the visible prompt of one generated item
// as a string, and its 32-bit fingerprint. A signature is what a child recognises
// as "the same question": the story (key + params), every step's prompt (key +
// params) and its correct answer, and — for geometry/measurement — the whole scene.
// Wrong options are NOT part of a signature. Moved here from tools/practice/
// pool-counting.ts so the runtime can use it; the meter re-imports it.
import type { GeoItem } from '../geometry/geo-scene-types';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';

const refSig = (ref: PromptRef): string => {
  const params = ref.params
    ? Object.entries(ref.params)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    : '';
  return `${ref.key}(${params})`;
};

const stepSig = (step: ReasoningStep): string => {
  if (step.kind === 'number') return `n:${refSig(step.prompt)}=${step.answer}`;
  if (step.kind === 'verdict')
    return `v:${refSig(step.prompt)}|${refSig(step.statement)}=${step.answer}${
      step.fix ? `|fix=${step.fix.answer}` : ''
    }`;
  if (step.kind === 'set-clock') return `c:${refSig(step.prompt)}=${step.h}:${step.m}`;
  if (step.kind === 'order')
    return `o:${refSig(step.prompt)}|${step.tiles.map(refSig).join('+')}=${step.answer.join(',')}`;
  if (step.kind === 'match')
    return `m:${refSig(step.prompt)}|${step.left.map(refSig).join('+')}|${step.right
      .map((o) => refSig(o.label))
      .join('+')}=${step.pairs.join(',')}`;
  const correct = step.options
    .filter((o) => o.correct)
    .map((o) => refSig(o.label))
    .sort();
  return `${step.kind}:${refSig(step.prompt)}|${step.options.length}|${correct.join('+')}`;
};

/** The visible prompt of one generated item, as a string. */
export function itemSignature(item: ReasoningItem): string {
  const base = `${item.skillId}|t${item.tier}|${refSig(item.story)}|${item.steps
    .map(stepSig)
    .join(';')}`;
  const scene = (item as GeoItem).scene;
  return scene ? `${base}|${JSON.stringify(scene)}` : base;
}

/** FNV-1a 32-bit hash of the item's signature, as an unsigned number. */
export function itemFingerprint(item: ReasoningItem): number {
  const sig = itemSignature(item);
  let hash = 0x811c9dc5;
  for (let i = 0; i < sig.length; i++) {
    hash ^= sig.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
