# Hush

> Quiet your AI chat sidebars.

<p align="center">
  <a href="https://goodluckh.github.io/Hush/">
    <img src="./docs/icon-128.png" width="96" alt="Hush" />
  </a>
</p>

<p align="center">
  <a href="https://goodluckh.github.io/Hush/"><strong>👉 hush.so-style install guide →</strong></a><br/>
  <sub>(no terminal, no <code>npm install</code>, just download & click)</sub>
</p>

<p align="center">
  <a href="https://github.com/GoodluckH/Hush/releases/latest/download/hush-0.1.0-chrome.zip"><img src="https://img.shields.io/badge/⬇️_Download_for_Chrome-fafafa?style=for-the-badge&labelColor=fafafa&color=fafafa" alt="Download for Chrome" /></a>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-black.svg" alt="MIT" /></a>
  <a href="https://wxt.dev"><img src="https://img.shields.io/badge/built%20with-WXT-67d?logo=vite&logoColor=white" alt="WXT" /></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="MV3" /></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

Hush blurs the conversation titles in **ChatGPT**, **Claude**, and **Gemini** so you can leave a chat open on a shared screen, in a meeting, or at a coffee shop without leaking context. Hover any blurred row to reveal it. Everything runs locally — no data ever leaves your browser.

## Features

- One-click toggle per site (ChatGPT, Claude, Gemini)
- Keyboard shortcut: `⌘⇧Y` on Mac, `Ctrl+Shift+Y` elsewhere (rebindable from the popup)
- Hover-to-reveal with a short intent delay so passing your mouse doesn't flash titles
- Masks the browser tab title on ChatGPT and Claude (they leak the active chat name)
- Per-site state persisted with `chrome.storage.local`
- Works with SPA navigation on all three sites via `MutationObserver`
- Cross-browser: Chrome, Edge, Firefox

## Install

### From source (until the Web Store listing is live)

```bash
git clone https://github.com/GoodluckH/Hush.git
cd Hush
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked** → select `Hush/.output/chrome-mv3`

For Firefox, run `npm run build:firefox` and load `.output/firefox-mv2` via `about:debugging`.

## Develop

```bash
npm run dev          # Chrome with HMR — opens a fresh browser profile
npm run dev:firefox  # Firefox with HMR
npm run compile      # TypeScript check
npm run icons        # Regenerate icon PNGs from assets/icon.svg
npm run build        # Production bundle
npm run zip          # Web Store-ready zip
```

## Project structure

```
entrypoints/
  background.ts         # MV3 service worker: shortcut handler + badge state
  chatgpt.content.ts    # Selectors for chatgpt.com
  claude.content.ts     # Selectors for claude.ai
  gemini.content.ts     # Selectors for gemini.google.com
  popup/                # Toolbar popup (vanilla TS)
components/hush/
  blur.ts               # Shared hush engine (CSS + MutationObserver + hover)
  storage.ts            # Per-site enabled flag in chrome.storage.local
  messages.ts           # Background <-> popup message types
assets/
  icon.svg              # Master icon (48 / 96 / 128)
  icon-small.svg        # Simplified glyph for 16 / 32 toolbar sizes
scripts/
  gen-icons.mjs         # SVG → PNG renderer
wxt.config.ts           # Manifest, permissions, commands
```

## How it works

Each platform content script declares CSS selectors for its sidebar items and calls `startHush({ site, selectors })`. The shared engine:

1. Injects a `<style>` tag with the blur rule.
2. Tags matching nodes with the `hush-target` class.
3. Toggles a `data-hush="on|off"` attribute on `<html>` so a single attribute flip enables/disables blurring globally.
4. Wires `mouseenter` / `mouseleave` with a short reveal delay.
5. Re-scans on every DOM mutation (sidebars on these sites are virtualized and load lazily).

Adding another site is roughly 20 lines: create a new `*.content.ts`, list selectors, call `startHush`. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Contributing

PRs and bug reports welcome. The most common failure mode is **selector drift** — when one of the target sites ships a UI update, the selectors break. If you notice a sidebar isn't blurring, please [open an issue](https://github.com/GoodluckH/Hush/issues/new?template=selector-broken.md) with the affected site and the new selector you found in DevTools.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the dev loop and architecture notes.

## License

[MIT](./LICENSE)
