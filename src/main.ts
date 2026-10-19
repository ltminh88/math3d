// Entry: self-hosted fonts, then the original stylesheet, then the game (shell, controls, 3D world), then WebMCP.
import './styles/fonts.css';
import './styles/game/game-styles-index.css';
import { bootstrapGame } from './ui/bootstrap-game';
import { registerProgressTool } from './webmcp/progress-tool';

bootstrapGame();
registerProgressTool();

// Dev-only perf probe; Vite drops the whole branch from production builds.
if (import.meta.env.DEV && new URLSearchParams(location.search).get('debug') === 'fps') {
  void import('./dev/fps-overlay').then((m) => m.startFpsOverlay());
}
