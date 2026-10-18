// Legacy chunk "webmcp" (recovered, mechanically split). Do not hand-edit; swap via shims/webmcp.js.
import { ie } from './shims/ui.js';

const ml = document.modelContext;
const hc = new AbortController();
if (ml?.registerTool) {
  try {
    Promise.resolve(
      ml.registerTool(
        {
          name: 'read_adventure_progress',
          description:
            'Read local progress in Multiplication Kingdom: XP, coins, completed bridge segments and review count.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: {
            readOnlyHint: true,
          },
          execute: async (i) => {
            if (!i || typeof i !== 'object' || Array.isArray(i) || Object.keys(i).length) {
              throw new Error('Expected an empty object');
            }
            return {
              xp: ie.xp,
              coins: ie.coins,
              bridgeSegments: ie.bridge,
              questComplete: ie.questComplete,
              reviewCount: ie.review.length,
            };
          },
        },
        {
          signal: hc.signal,
        },
      ),
    ).catch(() => {});
  } catch {}
}
window.addEventListener('pagehide', () => hc.abort(), {
  once: true,
});
