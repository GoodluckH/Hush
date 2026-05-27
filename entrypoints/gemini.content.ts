import { startHush } from '@/components/hush/blur';

export default defineContentScript({
  matches: ['*://gemini.google.com/*'],
  runAt: 'document_idle',
  main() {
    // Gemini uses Angular custom elements. The conversation rows live inside
    // <conversations-list> and each row is a <gem-nav-list-item> with the
    // stable attribute data-test-id="conversation". We blur the whole row;
    // hover-reveal still works per-row.
    const selectors = [
      '[data-test-id="conversation"]',
      'gem-nav-list-item[data-test-id="conversation"]',
    ];

    startHush({ site: 'gemini', selectors });
  },
});
