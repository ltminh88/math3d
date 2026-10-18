import { Vector3 } from 'three';
import { fitCamera, minWorldSizeForPixels } from '../core/camera-fit';
import type { GameScene } from '../core/game-scene-contract';
import type { InteractionEvent } from '../core/input/interaction-types';
import { getMaterial } from '../core/shared-asset-cache';
import { EASE } from '../core/tween-manager';
import { defineStrings } from '../i18n/i18n';
import { createNumberPad } from '../ui/kit/number-pad';
import { createSpeechBubble } from '../ui/kit/speech-bubble';
import { buildBenchWorld, FIELD, STONE_RADIUS } from './perf-bench-world';

const tb = defineStrings('bench', {
  vi: { prompt: 'Kéo các viên đá vào ô tròn, hoặc chạm đá rồi chạm ô. Bàn phím: Tab, Enter.' },
  en: {
    prompt: 'Drag stones into the circles, or tap a stone then a circle. Keyboard: Tab, Enter.',
  },
});

/** The benchmark playfield: 40 instanced trees, 30 draggable stones, 6 drop zones, DOM UI. */
export function createBenchScene(): GameScene {
  return {
    id: 'bench',
    init(ctx) {
      const refit = (width: number, height: number) => {
        fitCamera(ctx.camera, FIELD, width / height, { elevationDeg: 58 });
      };
      refit(ctx.renderer.domElement.clientWidth || 1, ctx.renderer.domElement.clientHeight || 1);
      ctx.onResize(refit);

      const distance = ctx.camera.position.distanceTo(new Vector3(0, 0, 4));
      const height = ctx.renderer.domElement.clientHeight || 1;
      const proxyRadius = Math.max(
        STONE_RADIUS,
        minWorldSizeForPixels(48, distance, ctx.camera.fov, height) / 2,
      );
      const world = buildBenchWorld(ctx, proxyRadius);
      const byId = new Map(world.stones.map((s) => [s.id, s]));
      const placed = new Map<string, string>(); // stone id -> zone id
      ctx.interaction.setZones(world.zones);
      ctx.interaction.setSnapRadius(1.2);
      const pickables = world.stones.map((s) => ({ id: s.id, object: s.proxy }));
      ctx.interaction.setPickables(pickables);

      const bubble = createSpeechBubble({ text: tb('prompt'), narrator: ctx.narrator });
      bubble.element.style.cssText = 'position:absolute;top:8px;left:8px';
      const pad = createNumberPad({ activeInput: true, onSubmit: () => ctx.audio.play('correct') });
      pad.element.style.cssText = 'position:absolute;right:8px;bottom:8px';
      ctx.ui.append(bubble.element, pad.element);
      ctx.disposer.onDispose(() => {
        bubble.destroy();
        pad.destroy();
      });

      const setHighlight = (id: string, on: boolean) => {
        const stone = byId.get(id);
        if (stone) stone.mesh.material = getMaterial(on ? 'stoneActive' : 'stone');
      };
      const setZoneHighlight = (zoneId: string | null) => {
        for (const [id, mesh] of world.zoneMeshes) {
          mesh.material = getMaterial(id === zoneId ? 'zoneActive' : 'zone');
        }
      };
      const moveTo = (id: string, x: number, z: number, y = 0) => {
        const stone = byId.get(id);
        if (!stone) return;
        const from = stone.group.position.clone();
        ctx.tweens.add({
          duration: 0.2,
          ease: EASE.easeOutCubic,
          onUpdate: (p) =>
            stone.group.position.set(
              from.x + (x - from.x) * p,
              from.y + (y - from.y) * p,
              from.z + (z - from.z) * p,
            ),
        });
      };
      const place = (id: string, zoneId: string) => {
        const zone = world.zones.find((z) => z.id === zoneId);
        const stone = byId.get(id);
        if (!zone || !stone) return;
        const index = [...placed.values()].filter((z) => z === zoneId).length;
        placed.set(id, zoneId);
        moveTo(
          id,
          zone.center.x + ((index % 3) - 1) * 0.6,
          zone.center.z + Math.floor(index / 3) * 0.6,
        );
        ctx.audio.play('drop');
      };
      const sendHome = (id: string) => {
        const stone = byId.get(id);
        if (!stone) return;
        placed.delete(id);
        moveTo(id, stone.home.x, stone.home.z);
        ctx.audio.play('gentleWrong');
      };

      const onEvent = (event: InteractionEvent) => {
        switch (event.type) {
          case 'pick':
            placed.delete(event.itemId);
            setHighlight(event.itemId, true);
            ctx.audio.play('pick');
            break;
          case 'drag-move': {
            const stone = byId.get(event.itemId);
            stone?.group.position.set(event.position.x, 0.5, event.position.z);
            setZoneHighlight(event.zoneId);
            break;
          }
          case 'drop':
            setHighlight(event.itemId, false);
            setZoneHighlight(null);
            if (event.zoneId) place(event.itemId, event.zoneId);
            else sendHome(event.itemId);
            break;
          case 'cancel':
            setHighlight(event.itemId, false);
            setZoneHighlight(null);
            sendHome(event.itemId);
            break;
          case 'tap-select':
            for (const stone of world.stones) setHighlight(stone.id, stone.id === event.itemId);
            if (event.itemId) ctx.audio.play('pick');
            break;
          case 'focus':
            setZoneHighlight(event.kind === 'zone' ? event.id : null);
            for (const stone of world.stones) {
              stone.group.scale.setScalar(event.kind === 'item' && stone.id === event.id ? 1.3 : 1);
            }
            break;
        }
      };
      ctx.disposer.onDispose(ctx.interaction.events.on(onEvent));
    },
    update: () => false,
    dispose() {},
  };
}
