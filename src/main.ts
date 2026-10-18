// Entry: original stylesheet first, then the game (shell, controls, 3D world), then WebMCP.
import './styles/game/game-styles-index.css';
import { bootstrapGame } from './ui/bootstrap-game';
import { registerProgressTool } from './webmcp/progress-tool';

bootstrapGame();
registerProgressTool();
