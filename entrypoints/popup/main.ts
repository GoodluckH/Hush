import './style.css';
import { hushEnabled, type SiteKey } from '@/components/hush/storage';

interface Site {
  key: SiteKey;
  name: string;
  brand: string;
  brandTint: string;
  match: (host: string) => boolean;
}

const SITES: Site[] = [
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    brand: '#10a37f',
    brandTint: 'rgba(16, 163, 127, 0.14)',
    match: (h) => h.endsWith('chatgpt.com') || h.endsWith('chat.openai.com'),
  },
  {
    key: 'claude',
    name: 'Claude',
    brand: '#d97757',
    brandTint: 'rgba(217, 119, 87, 0.14)',
    match: (h) => h.endsWith('claude.ai'),
  },
  {
    key: 'gemini',
    name: 'Gemini',
    brand: '#4285f4',
    brandTint: 'rgba(66, 133, 244, 0.14)',
    match: (h) => h.endsWith('gemini.google.com'),
  },
];

/**
 * Read the live keyboard binding from Chrome (it may have been customized by
 * the user, or unset if it conflicts). Returns formatted <kbd> HTML.
 */
async function getShortcutHtml(): Promise<string> {
  let raw = '';
  try {
    const commands = await browser.commands.getAll();
    raw = commands.find((c) => c.name === 'toggle-hush')?.shortcut ?? '';
  } catch {
    // ignore
  }

  if (!raw) {
    return `<span class="shortcut-unset">Set shortcut →</span>`;
  }

  // Chrome returns combos like "⌘⇧Y" on Mac, "Ctrl+Shift+Y" elsewhere.
  // Normalize into individual kbd chips.
  const parts = raw.includes('+')
    ? raw.split('+')
    : Array.from(raw); // Mac: already glyph-per-character

  return (
    `<span class="shortcut-prefix">Toggle</span>` +
    parts.map((p) => `<span class="kbd">${p}</span>`).join('')
  );
}

async function activeHost(): Promise<string | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return new URL(tab.url).host;
  } catch {
    return null;
  }
}

// Soft wave glyph — sound being smoothed/quieted.
const ICON_HUSH = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 13c2.2-3.2 4.5-3.2 6.5 0s4.3 3.2 6.5 0" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.5 8.5l5-2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;

const ICON_GITHUB = `
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.2 1.9-.4 2.9-.4 1 0 2 .1 2.9.4 2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.8C23.5 5.7 18.3.5 12 .5Z"/>
  </svg>`;

function renderToggle(site: Site, enabled: boolean, size: 'lg' | 'sm'): string {
  const styleVars = `--brand:${site.brand};--brand-tint:${site.brandTint}`;
  return `
    <label class="switch ${size === 'lg' ? 'lg' : ''}" style="${styleVars}">
      <input type="checkbox" data-site="${site.key}" ${enabled ? 'checked' : ''} />
      <span class="slider"></span>
    </label>
  `;
}

function renderHero(site: Site, enabled: boolean): string {
  const styleVars = `--brand:${site.brand};--brand-tint:${site.brandTint}`;
  return `
    <section class="hero" data-on="${enabled}" style="${styleVars}">
      <div class="hero-top">
        <div class="hero-label">
          <span class="dot"></span>
          <h2 class="hero-name">${site.name}</h2>
        </div>
        ${renderToggle(site, enabled, 'lg')}
      </div>
      <div class="hero-status">
        <span class="status-pulse"></span>
        <span class="status-text">${enabled ? 'Hushed on this tab' : 'Titles visible on this tab'}</span>
      </div>
    </section>
  `;
}

function renderSiteRow(site: Site, enabled: boolean): string {
  const styleVars = `--brand:${site.brand};--brand-tint:${site.brandTint}`;
  return `
    <label class="site-row" style="${styleVars}">
      <span class="site-left">
        <span class="dot"></span>
        <span class="site-name">${site.name}</span>
      </span>
      ${renderToggle(site, enabled, 'sm')}
    </label>
  `;
}

async function render() {
  const host = await activeHost();
  const states = await Promise.all(
    SITES.map(async (s) => ({ site: s, enabled: await hushEnabled.get(s.key) })),
  );

  const active = host ? states.find(({ site }) => site.match(host)) : undefined;
  const others = states.filter((s) => s !== active);

  const shortcut = await getShortcutHtml();

  const heroHtml = active ? renderHero(active.site, active.enabled) : '';

  const othersHeader = active
    ? `<div class="section-title"><span>Other sites</span></div>`
    : `<div class="section-title"><span>Sites</span></div>`;

  const rowsHtml = others.map(({ site, enabled }) => renderSiteRow(site, enabled)).join('');

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="header">
      <div class="brand-mark">${ICON_HUSH}</div>
      <div class="brand-name">Hush</div>
    </div>

    ${heroHtml}

    ${othersHeader}
    <div class="sites">${rowsHtml}</div>

    <div class="footer">
      <button class="shortcut-label" id="open-shortcuts" title="Customize in chrome://extensions/shortcuts">
        ${shortcut}
      </button>
      <a class="footer-link" href="https://github.com/GoodluckH/Hush" target="_blank" rel="noopener">
        ${ICON_GITHUB}<span>GitHub</span>
      </a>
    </div>
  `;

  document.getElementById('open-shortcuts')?.addEventListener('click', () => {
    browser.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // Wire up toggles. Re-render hero status text + tint without rebuilding the
  // whole popup so the toggle's spring animation isn't interrupted.
  document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-site]').forEach((el) => {
    el.addEventListener('change', async () => {
      const key = el.dataset.site as SiteKey;
      const next = el.checked;
      await hushEnabled.set(key, next);

      // If the changed toggle is the hero, update its visible state in place.
      if (active && active.site.key === key) {
        const hero = document.querySelector<HTMLElement>('.hero');
        if (hero) {
          hero.dataset.on = String(next);
          const statusText = hero.querySelector<HTMLElement>('.status-text');
          if (statusText) {
            statusText.textContent = next
              ? 'Hushed on this tab'
              : 'Titles visible on this tab';
          }
        }
      }
    });
  });
}

render();
