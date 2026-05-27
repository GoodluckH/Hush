import { hushEnabled, siteKeyForHost, type SiteKey } from '@/components/hush/storage';

export default defineBackground(() => {
  // IMPORTANT: register listeners synchronously at top level so MV3 service
  // worker restarts don't drop them.

  browser.commands.onCommand.addListener(async (command, tab) => {
    if (command !== 'toggle-hush') return;
    const url = tab?.url;
    if (!url) return;
    const site = siteKeyForHost(new URL(url).host);
    if (!site) return;
    const current = await hushEnabled.get(site);
    await hushEnabled.set(site, !current);
    await refreshBadge(site, tab.id);
  });

  (['chatgpt', 'claude', 'gemini'] as SiteKey[]).forEach((site) => {
    hushEnabled.watch(site, async () => {
      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const tab = tabs[0];
      if (!tab?.url || !tab.id) return;
      const activeSite = siteKeyForHost(new URL(tab.url).host);
      if (activeSite === site) await refreshBadge(site, tab.id);
    });
  });

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await browser.tabs.get(tabId);
    if (!tab.url) return clearBadge(tabId);
    const site = siteKeyForHost(new URL(tab.url).host);
    if (!site) return clearBadge(tabId);
    await refreshBadge(site, tabId);
  });

  browser.tabs.onUpdated.addListener(async (tabId, _info, tab) => {
    if (!tab.url) return;
    const site = siteKeyForHost(new URL(tab.url).host);
    if (!site) return clearBadge(tabId);
    await refreshBadge(site, tabId);
  });
});

async function refreshBadge(site: SiteKey, tabId?: number) {
  if (tabId === undefined) return;
  const on = await hushEnabled.get(site);
  await browser.action.setBadgeText({ tabId, text: on ? 'ON' : '' });
  await browser.action.setBadgeBackgroundColor({ tabId, color: '#0a0a0a' });
}

async function clearBadge(tabId: number) {
  await browser.action.setBadgeText({ tabId, text: '' });
}
