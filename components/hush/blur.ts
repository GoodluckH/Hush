import { hushEnabled, type SiteKey } from './storage';

const STYLE_ID = 'hush-style';
const BODY_ATTR = 'data-hush';
// Short intent-debounce so a mouse passing across the list doesn't flash
// every title, but intentional hover feels instant.
const HOVER_DELAY_MS = 60;

const CSS = `
[${BODY_ATTR}="on"] .hush-target {
  filter: blur(6px);
  transition: filter 180ms ease;
  cursor: pointer;
}
/* Reveal is instant; only re-blurring uses the transition above. */
[${BODY_ATTR}="on"] .hush-target.hush-revealed {
  filter: none;
  transition: none;
}
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  (document.head ?? document.documentElement).appendChild(style);
}

function setBodyState(enabled: boolean) {
  document.documentElement.setAttribute(BODY_ATTR, enabled ? 'on' : 'off');
}

function wireHoverReveal(el: HTMLElement) {
  if (el.dataset.hushHoverWired === '1') return;
  el.dataset.hushHoverWired = '1';

  let timer: number | undefined;
  el.addEventListener('mouseenter', () => {
    timer = window.setTimeout(() => {
      el.classList.add('hush-revealed');
    }, HOVER_DELAY_MS);
  });
  el.addEventListener('mouseleave', () => {
    if (timer !== undefined) window.clearTimeout(timer);
    el.classList.remove('hush-revealed');
  });
}

export interface HushOptions {
  site: SiteKey;
  /** Selectors whose matching elements should be blurred. */
  selectors: string[];
  /**
   * Optional hook called on every scan; useful for platform-specific work
   * like rewriting document.title.
   */
  onScan?: (enabled: boolean) => void;
}

export function startHush(opts: HushOptions) {
  ensureStyle();

  let currentlyEnabled = true;

  const tagTargets = () => {
    for (const sel of opts.selectors) {
      const nodes = document.querySelectorAll<HTMLElement>(sel);
      nodes.forEach((node) => {
        if (!node.classList.contains('hush-target')) {
          node.classList.add('hush-target');
        }
        wireHoverReveal(node);
      });
    }
    opts.onScan?.(currentlyEnabled);
  };

  const apply = (enabled: boolean) => {
    currentlyEnabled = enabled;
    setBodyState(enabled);
    tagTargets();
  };

  // Initial state from storage
  hushEnabled.get(opts.site).then(apply);

  // React to changes from popup / shortcut
  hushEnabled.watch(opts.site, apply);

  // Catch sidebar items added by the SPA after load
  const observer = new MutationObserver(() => tagTargets());
  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true });
    tagTargets();
  };
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  return () => observer.disconnect();
}
