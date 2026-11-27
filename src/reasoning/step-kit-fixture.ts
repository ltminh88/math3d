// Dev-only fixture item (boost, Phase 2B, test builds only): one order step
// and one match step, so the step-kit e2e spec can drive both kinds by tap()
// before any skill generator emits a match step (3A does that). The tiles use
// the reasoning namespace's verbatim key, so the test hook renders them as-is.
import { reasoningItem, ref } from './reasoning-distractors';
import type { ReasoningItem } from './reasoning-types';

/** The fixture's skill id; itemForSkill answers it only in test builds. */
export const STEP_KIT_FIXTURE_ID = 'test-step-kit-fixture';

export function stepKitFixtureItem(): ReasoningItem {
  return reasoningItem(STEP_KIT_FIXTURE_ID, 1, ref('expr', { text: 'Xếp các ô theo thứ tự' }), [
    {
      kind: 'order',
      prompt: ref('expr', { text: 'Xếp từ nhỏ đến lớn' }),
      tiles: [
        ref('expr', { text: '3 cm' }),
        ref('expr', { text: '1 m' }),
        ref('expr', { text: '5 mm' }),
      ],
      answer: [2, 0, 1],
    },
    {
      kind: 'match',
      prompt: ref('expr', { text: 'Nối mỗi độ dài với một đơn vị' }),
      left: [ref('expr', { text: '1 m' }), ref('expr', { text: '2 dm' })],
      right: [
        { label: ref('expr', { text: '100 cm' }) },
        { label: ref('expr', { text: '20 cm' }), misconception: 'unit-direction' },
      ],
      pairs: [0, 1],
    },
  ]);
}
