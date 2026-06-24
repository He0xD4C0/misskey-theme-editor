/**
 * UI 工具函数
 */

// ─── DOM Utilities ───────────────────────────────────────

export function el(tag: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

export function createButton(text: string, icon: string, handler: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'toolbar-btn';
  btn.textContent = text;
  btn.addEventListener('click', handler);
  return btn;
}

// ─── Event Helpers ───────────────────────────────────────

export function onClickOutside(element: HTMLElement, callback: () => void) {
  setTimeout(() => {
    const close = (e: MouseEvent) => {
      if (!element.contains(e.target as Node)) {
        callback();
        document.removeEventListener('click', close);
      }
    };
    document.addEventListener('click', close);
  }, 0);
}
