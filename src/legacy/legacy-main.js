// Legacy entry: original stylesheet first, then the chunks in original bundle order.
// legacy-ui.js imports config -> world -> save -> quiz -> audio -> i18n -> map through the
// shims, so module evaluation order equals the original single-file order.
import '../styles/game/game-styles-index.css';
import './legacy-ui.js';
import './legacy-webmcp.js';
