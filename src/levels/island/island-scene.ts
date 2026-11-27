// Island level scene (own chunk): the CEC book on the shared English level
// scene — the islet diorama, camera, panel and celebration are the island's
// own; the run lifecycle (zoom, run, done card, test hook, abort) is shared.
import { ENGLISH_BOOKS } from '../../english/english-books';
import type { EnglishLevelStrings } from '../shared/english-level-scene';
import { createEnglishLevelScene } from '../shared/english-level-scene';
import { IslandCamera } from './island-camera';
import { showIslandCelebration } from './island-celebration';
import { buildIslandDiorama } from './island-diorama-builder';
import { IslandPanel } from './island-panel';
import { islandStarsForResult } from './island-result';
import type { IslandStrings } from './island-strings';
import { islandStrings } from './island-strings';
import { installIslandTestHook } from './island-test-hook';
import './island-level.css';

/** Island strings: the shared scene's lines plus the panel's own `cs`. */
interface IslandSceneStrings extends EnglishLevelStrings {
  readonly cs: IslandStrings;
}

const islandModule = createEnglishLevelScene<IslandSceneStrings>({
  book: ENGLISH_BOOKS.cec,
  sceneName: 'island',
  buildDiorama: buildIslandDiorama,
  createView: () => new IslandCamera(),
  strings: (defineStrings) => {
    const cs = islandStrings(defineStrings);
    return {
      cs,
      intro: cs('intro'),
      zoomIn: cs('zoomIn'),
      zoomOut: cs('zoomOut'),
      stageLine: (n, m, stars) => cs('stageLine', { n, m, stars }),
    };
  },
  createPanel: (ui, strings) => new IslandPanel(ui, strings.cs),
  starsForResult: islandStarsForResult,
  showCelebration: (root, strings, run, stars, onBack, bonus, stageLine) =>
    showIslandCelebration(root, strings.cs, run, stars, onBack, bonus, stageLine),
  installTestHook: installIslandTestHook,
});

export default islandModule;
export const { start } = islandModule;
