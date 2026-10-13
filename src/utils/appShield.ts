/**
 * AppShield - Comprehensive Client-Side Security Protection for CodeGaurd
 * Protects this website against source code theft, DevTools inspection,
 * right-click scraping, and keyboard shortcut exploits.
 */

export function initAppShield(): void {
  if (typeof window === 'undefined') return;

  // 1. Prevent Right-Click Context Menu (except on standard text inputs/textareas if needed)
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    // Allow right click ONLY inside code editor textarea for paste convenience if desired,
    // or block universally to prevent page inspect element
    if (target && target.tagName === 'TEXTAREA') {
      // Allow paste/copy in textarea
      return;
    }
    e.preventDefault();
  }, { capture: true });

  // 2. Prevent Common DevTools & View-Source Keyboard Shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // F12 -> Developer Tools
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I or Cmd+Option+I -> Inspect Element
    if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U or Cmd+U -> View Source
    if (isCtrlOrMeta && key === 'U') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S or Cmd+S -> Save Webpage
    if (isCtrlOrMeta && key === 'S') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Anti-Debugging Trap (Halts DevTools if opened)
  const startDebuggerTrap = () => {
    setInterval(() => {
      const startTime = performance.now();
      // Debugger statement inside dynamic function constructor
      try {
        (function() {}).constructor('debugger')();
      } catch {
        // Suppress
      }
      const duration = performance.now() - startTime;
      // If DevTools was paused on debugger for more than 100ms
      if (duration > 100) {
        try {
          console.clear();
        } catch {
          // Suppress
        }
      }
    }, 1500);
  };

  // Start trap safely in production
  try {
    startDebuggerTrap();
  } catch {
    // Ignore in unsupported environments
  }

  // 4. Console Sanitizer (Clear console and suppress logging)
  try {
    const noop = () => {};
    // Keep error suppressed from scrapers
    if (window.console && process.env.NODE_ENV === 'production') {
      window.console.log = noop;
      window.console.info = noop;
      window.console.debug = noop;
    }
  } catch {
    // Suppress
  }
}
