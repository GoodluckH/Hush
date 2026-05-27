# Contributing to Hush

Thanks for taking the time! Hush is small on purpose, so contributions are easy to land.

## Dev loop

```bash
git clone https://github.com/GoodluckH/Hush.git
cd Hush
npm install
npm run dev   # spins up a Chrome window with HMR
```

The `dev` profile is isolated from your normal Chrome — you'll need to log into ChatGPT / Claude / Gemini once. Edits to the popup hot-reload instantly; edits to content scripts reload the target page automatically.

Before opening a PR:

```bash
npm run compile   # TypeScript check
npm run build     # ensures it actually packages
```

## Most common contribution: fixing a broken selector

When ChatGPT / Claude / Gemini ship a UI update, the CSS selectors that find sidebar conversation rows can break. The fix is usually 1–3 lines.

1. Open the affected site in the dev Chrome window
2. DevTools → Inspect a sidebar row
3. Find a stable selector — prefer in this order:
   1. `data-*` attributes (e.g. `[data-test-id="conversation"]`)
   2. Semantic anchors (e.g. `nav a[href^="/chat/"]`)
   3. Custom elements (e.g. `gem-nav-list-item`)
   4. As a last resort, class names — they often change on every deploy
4. Update the `selectors` array in the relevant `entrypoints/*.content.ts`
5. Verify by reloading the page

If you're unsure whether your selector is stable, ship it anyway — selector churn is expected and getting *something* working is better than nothing.

## Adding a new target site

About 20 lines:

1. Create `entrypoints/<site>.content.ts`, copying one of the existing scripts as a template
2. Set the `matches` field to the site's host pattern
3. Fill in the `selectors` array
4. (Optional) Add an `onScan` hook to mask the browser tab title if the site leaks it
5. Add the site to `SITES` in `entrypoints/popup/main.ts` (with a brand color and `match` predicate)
6. Add the host to `host_permissions` in `wxt.config.ts`
7. Add the `SiteKey` literal to `components/hush/storage.ts`

Done. No other wiring needed.

## Code style

- TypeScript, strict mode (the repo's default)
- Vanilla DOM in the popup — no framework
- No external dependencies in the content script bundle if you can help it (every KB ships to the user's browser)

## Reporting bugs

Use the [selector-broken issue template](https://github.com/GoodluckH/Hush/issues/new?template=selector-broken.md) for sidebar-not-blurring reports. For everything else, plain issues are fine.

## License

By contributing, you agree your work is licensed under the [MIT license](./LICENSE).
