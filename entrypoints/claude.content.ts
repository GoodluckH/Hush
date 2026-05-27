import { startHush } from '@/components/hush/blur';

export default defineContentScript({
  matches: ['*://claude.ai/*'],
  runAt: 'document_idle',
  main() {
    // Claude sidebar items are anchors pointing at /chat/<uuid> (and /project/<uuid>).
    // The chat title in the top header is the page <h1>-ish element; we lean on
    // tab-title masking to cover header leaks rather than chasing fragile classes.
    const selectors = [
      'a[href^="/chat/"]',
      'a[href^="/project/"]',
      'a[href^="/recents/"]',
    ];

    let originalTitle = document.title;
    const updateTitle = (enabled: boolean) => {
      if (enabled) {
        if (document.title !== 'Claude') {
          originalTitle = document.title;
          document.title = 'Claude';
        }
      } else if (document.title === 'Claude' && originalTitle !== 'Claude') {
        document.title = originalTitle;
      }
    };

    startHush({ site: 'claude', selectors, onScan: updateTitle });
  },
});
