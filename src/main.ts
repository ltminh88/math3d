// Entry: self-hosted fonts, then the original stylesheet, then the game (shell, controls, 3D world), then WebMCP.
import './styles/fonts.css';
import './styles/game/game-styles-index.css';
import { bootstrapGame } from './ui/bootstrap-game';
import { registerProgressTool } from './webmcp/progress-tool';

bootstrapGame();
registerProgressTool();
