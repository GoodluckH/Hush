import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
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
