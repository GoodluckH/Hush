import { storage } from '#imports';

export type SiteKey = 'chatgpt' | 'claude' | 'gemini';

const item = (site: SiteKey) =>
  storage.defineItem<boolean>(`local:hush:${site}`, { fallback: true });

export const hushEnabled = {
  get: (site: SiteKey) => item(site).getValue(),
  set: (site: SiteKey, value: boolean) => item(site).setValue(value),
  watch: (site: SiteKey, cb: (value: boolean) => void) =>
    item(site).watch((v) => cb(v ?? true)),
};

export function siteKeyForHost(host: string): SiteKey | null {
  if (host.endsWith('chatgpt.com') || host.endsWith('chat.openai.com')) return 'chatgpt';
  if (host.endsWith('claude.ai')) return 'claude';
  if (host.endsWith('gemini.google.com')) return 'gemini';
  return null;
}
