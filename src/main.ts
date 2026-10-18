import './styles/fonts.css';
import './styles/base-reset.css';
import { tc } from './i18n/common-strings';
import { initLanguage, onLanguageChange } from './i18n/i18n';

// Boot stub: phase 04 replaces the body below with a call into app/boot.ts.
function safeLocalStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function renderTitle(): void {
  document.title = tc('appName');
  const ui = document.getElementById('ui');
  if (!ui) return;
  let heading = ui.querySelector<HTMLHeadingElement>('.boot-title');
  if (!heading) {
    heading = document.createElement('h1');
    heading.className = 'boot-title';
    ui.append(heading);
  }
  heading.textContent = tc('appName');
}

initLanguage(document, safeLocalStorage(), navigator.language);
onLanguageChange(renderTitle);
renderTitle();
