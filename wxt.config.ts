import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // Zip artifact: the *unzipped folder name* is what end-users see in their
  // Downloads. We want "Hush.zip" → "Hush/" instead of WXT's default
  // "hush-0.1.0-chrome.zip" → "hush-0.1.0-chrome/". When we add a
  // distributable Firefox build later, switch this to be browser-aware.
  zip: {
    artifactTemplate: 'Hush.zip',
  },
  manifest: {
    name: 'Hush',
    description:
      'Hush hides sensitive conversation titles in ChatGPT, Claude, and Gemini sidebars. Hover any blurred row to reveal it.',
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      '*://chatgpt.com/*',
      '*://chat.openai.com/*',
      '*://claude.ai/*',
      '*://gemini.google.com/*',
    ],
    action: {
      default_title: 'Hush — toggle',
      default_popup: 'popup.html',
    },
    commands: {
      'toggle-hush': {
        // Ctrl/Cmd+Shift+H is reserved by Chrome/macOS — never fires.
        // Y is unbound on both platforms and lives in the extension namespace.
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y',
        },
        description: 'Toggle Hush on the current site',
      },
    },
  },
});
