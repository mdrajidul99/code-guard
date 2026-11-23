/**
 * AppShield - Client-Side Protection for CodeGuard Web App
 * Blocks Right-Click and DevTools shortcuts (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C)
 * while preserving Paste (Ctrl+V), Select All (Ctrl+A), Copy (Ctrl+C), and context menus
 * inside INPUT, TEXTAREA, SELECT, and contenteditable code editors.
 */

export function initAppShield(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const isEditableTarget = (target: EventTarget | null): boolean => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') {
      return true;
    }
    if (el.isContentEditable) return true;
    if (typeof el.closest === 'function' && el.closest('textarea, input, select, [contenteditable="true"]')) {
      return true;
    }
    return false;
  };

  // 1. Block Right-Click except inside editable code inputs/textareas
  window.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      if (isEditableTarget(e.target)) {
        return;
      }
      e.preventDefault();
    },
    { capture: true }
  );

  // 2. Block DevTools / View-Source / Save shortcuts while keeping Ctrl+A / Ctrl+C / Ctrl+V / Ctrl+X in editors
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const key = (e.key || '').toUpperCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Always allow standard clipboard & select-all inside editable targets
      if (isEditableTarget(e.target) && isCtrlOrMeta && !e.shiftKey && ['A', 'C', 'V', 'X', 'Z', 'Y'].includes(key)) {
        return;
      }

      // Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+Shift+I / J / C / K (DevTools / Inspector / Console)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'J', 'C', 'K'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+U (View Source) and Ctrl+S (Save Webpage)
      if (isCtrlOrMeta && !e.shiftKey && (key === 'U' || key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  );
}
