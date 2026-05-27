import { startHush } from '@/components/hush/blur';

export default defineContentScript({
  matches: ['*://chatgpt.com/*', '*://chat.openai.com/*'],
  runAt: 'document_idle',
  main() {
    // ChatGPT sidebar items live inside <nav>. Each conversation is an <a>
    // pointing at /c/<uuid>. The title is the text inside that anchor.
    // Active chat title shows in the top header; tab title leaks too.
    const selectors = [
      'nav a[href^="/c/"]',
      'nav a[href^="/g/"]', // GPTs / projects
    ];

    let originalTitle = document.title;
    const updateTitle = (enabled: boolean) => {
      if (enabled) {
        if (document.title !== 'ChatGPT') {
          originalTitle = document.title;
          document.title = 'ChatGPT';
        }
      } else if (document.title === 'ChatGPT' && originalTitle !== 'ChatGPT') {
        document.title = originalTitle;
      }
    };

    startHush({ site: 'chatgpt', selectors, onScan: updateTitle });
  },
});
